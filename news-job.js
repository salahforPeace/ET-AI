
import 'dotenv/config';
import tls from 'node:tls';

const MANUS_API_BASE = 'https://api.manus.ai/v2';

function manusHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-manus-api-key': process.env.MANUS_API_KEY
  };
}

// Generate crypto news using the same Manus prompt as server.js
async function fetchCryptoNewsSummary() {
  if (!process.env.MANUS_API_KEY) {
    throw new Error('MANUS_API_KEY is missing.');
  }

  const prompt =
    'Search the web right now for the biggest current crypto market news ' +
    '(major price moves, ETF news, regulation, hacks/exploits, big partnerships or listings). ' +
    'Reply in Bengali (বাংলা). Write the reply as a clean, professional plain-text email body. ' +
    'STRICT FORMAT RULES: do not use any Markdown or special symbols (no #, no *, no **, no _, no backticks, no > and no tables). ' +
    'Do not use emojis. Do not use ALL CAPS words or exaggerated language. ' +
    'Start with one short neutral introduction line. Then list each story as a numbered item written as "1.", "2.", "3." ' +
    'with a short plain title on the first line, then one or two clear sentences explaining it, then a line starting with "Source:" followed by the publication name. ' +
    'Put one blank line between items. Most important story first. Give at most 6 items. ' +
    'End with one polite closing line. Do not add any other headings or decorations.';

  const createRes = await fetch(`${MANUS_API_BASE}/task.create`, {
    method: 'POST',
    headers: manusHeaders(),
    body: JSON.stringify({
      message: { content: [{ type: 'text', text: prompt }] }
    })
  });

  const created = await createRes.json().catch(() => ({}));

  if (!createRes.ok || !created.ok || !created.task_id) {
    throw new Error(
      created.error?.message || 'Manus task.create failed.'
    );
  }

  const taskId = created.task_id;
  const deadline = Date.now() + 6 * 60 * 1000;
  let summary = '';

  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const response = await fetch(
      `${MANUS_API_BASE}/task.listMessages?task_id=${encodeURIComponent(taskId)}&order=asc&limit=200`,
      { headers: manusHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Manus request failed: ${response.status}`);
    }

    const data = await response.json();
    const events = data.messages || data.events || [];

    const lastAssistant = [...events]
      .reverse()
      .find(event => event.type === 'assistant_message');

    if (lastAssistant) {
      const msg = lastAssistant.assistant_message || {};
      summary = typeof msg.content === 'string'
        ? msg.content
        : Array.isArray(msg.content)
          ? msg.content.map(part => part.text || '').join('')
          : '';
    }

    const lastStatus = [...events]
      .reverse()
      .find(event => event.type === 'status_update');

    const status = lastStatus?.status_update?.agent_status;

    if (status === 'stopped' || status === 'waiting' || status === 'error') {
      break;
    }
  }

  if (!summary.trim()) {
    throw new Error('Manus did not return a news summary.');
  }

  return summary.trim();
}

function cleanEmailText(raw) {
  let text = String(raw || '').replace(/\r\n/g, '\n');

  text = text.replace(/```[a-z]*\n?/gi, '');
  text = text.replace(/^\s{0,3}#{1,6}\s*/gm, '');
  text = text.replace(/^\s*>\s?/gm, '');
  text = text.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '$1 ($2)');
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,;:!?]|$)/g, '$1$2');
  text = text.replace(/^\s*[-*•●▪◦]\s+/gm, '');
  text = text.replace(/^\s*[-*_=]{3,}\s*$/gm, '');
  text = text.replace(/[*`#]/g, '');
  text = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '');
  text = text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function wrapBase64(buffer) {
  return buffer.toString('base64').replace(/(.{76})/g, '$1\r\n');
}

// Keep the same clean HTML email design
function buildEmailHtml(text) {
  const paragraphs = text.split(/\n{2,}/).map(block =>
    '<p style="margin:0 0 14px 0;">' +
    escapeHtml(block).replace(/\n/g, '<br>') +
    '</p>'
  ).join('');

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;">' +
    '<div style="max-width:640px;margin:0 auto;padding:24px;font-family:Arial,Helvetica,sans-serif;' +
    'font-size:15px;line-height:1.6;color:#222222;">' +
    paragraphs +
    '</div></body></html>';
}

function smtpWrite(socket, line) {
  return new Promise((resolve, reject) => {
    socket.write(line + '\r\n', error =>
      error ? reject(error) : resolve()
    );
  });
}

function smtpRead(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';

    const onData = chunk => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\r\n').filter(Boolean);
      const last = lines[lines.length - 1];

      if (last && /^\d{3} /.test(last)) {
        cleanup();
        resolve(buffer);
      }
    };

    const onError = error => {
      cleanup();
      reject(error);
    };

    function cleanup() {
      socket.removeListener('data', onData);
      socket.removeListener('error', onError);
    }

    socket.on('data', onData);
    socket.on('error', onError);
  });
}

async function smtpExpect(socket, expectedCodes, label) {
  const response = await smtpRead(socket);
  const lines = response.split('\r\n').filter(Boolean);
  const code = parseInt((lines[lines.length - 1] || '').slice(0, 3), 10);

  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP ${label} failed (${code}): ${response.trim()}`);
  }
}

async function sendGmailTo({ subject, text, to }) {
  const user = process.env.GMAIL_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (!user || !pass) {
    throw new Error('Gmail credentials are missing.');
  }

  const body = cleanEmailText(text);
  const domain = user.split('@')[1] || 'gmail.com';
  const boundary = '=_etai_' + Date.now().toString(36);
  const textPart = wrapBase64(Buffer.from(body, 'utf8'));
  const htmlPart = wrapBase64(Buffer.from(buildEmailHtml(body), 'utf8'));

  const message =
    `From: ET AI News <${user}>\r\n` +
    `To: <${to}>\r\n` +
    `Reply-To: <${user}>\r\n` +
    `Subject: ${subject}\r\n` +
    `Date: ${new Date().toUTCString()}\r\n` +
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@${domain}>\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/plain; charset=UTF-8\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `${textPart}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/html; charset=UTF-8\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `${htmlPart}\r\n` +
    `--${boundary}--\r\n.`;

  await new Promise((resolve, reject) => {
    const socket = tls.connect(465, 'smtp.gmail.com', {
      servername: 'smtp.gmail.com'
    });

    socket.once('error', reject);

    socket.once('secureConnect', async () => {
      try {
        await smtpExpect(socket, [220], 'greeting');
        await smtpWrite(socket, 'EHLO localhost');
        await smtpExpect(socket, [250], 'EHLO');

        await smtpWrite(socket, 'AUTH LOGIN');
        await smtpExpect(socket, [334], 'AUTH LOGIN');

        await smtpWrite(socket, Buffer.from(user).toString('base64'));
        await smtpExpect(socket, [334], 'username');

        await smtpWrite(socket, Buffer.from(pass).toString('base64'));
        await smtpExpect(socket, [235], 'password');

        await smtpWrite(socket, `MAIL FROM:<${user}>`);
        await smtpExpect(socket, [250], 'MAIL FROM');

        await smtpWrite(socket, `RCPT TO:<${to}>`);
        await smtpExpect(socket, [250, 251], 'RCPT TO');

        await smtpWrite(socket, 'DATA');
        await smtpExpect(socket, [354], 'DATA');

        await smtpWrite(socket, message);
        await smtpExpect(socket, [250], 'send message');

        await smtpWrite(socket, 'QUIT');
        socket.end();
        resolve();
      } catch (error) {
        socket.destroy();
        reject(error);
      }
    });
  });
}

async function sendGmail({ subject, text }) {
  const user = process.env.GMAIL_USER;
  const recipients = (process.env.NEWS_EMAIL_TO || user || '')
    .split(/[,;\s]+/)
    .map(email => email.trim())
    .filter(Boolean);

  let sent = 0;

  for (const to of recipients) {
    try {
      await sendGmailTo({ subject, text, to });
      sent++;
      console.log('[news-job] Email sent to', to);
    } catch (error) {
      console.error('[news-job] Email failed:', error.message);
    }
  }

  if (!sent) {
    throw new Error('News email could not be delivered to any recipient.');
  }
}

async function runNewsEmailJob() {
  console.log('[news-job] Fetching crypto news...');

  const summary = await fetchCryptoNewsSummary();
  const stamp = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: process.env.TZ || 'UTC'
  });

  await sendGmail({
    subject: `ET AI Crypto News Update - ${stamp}`,
    text: summary
  });

  console.log('[news-job] News email completed.');
}

runNewsEmailJob().catch(error => {
  console.error('[news-job] FAILED:', error.message || error);
  process.exitCode = 1;
});
