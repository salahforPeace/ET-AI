import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import tls from 'node:tls';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const PORT = Number(process.env.PORT || 3000);
const MANUS_API_BASE = 'https://api.manus.ai/v2';
const JSON_LIMIT = process.env.JSON_LIMIT || '75mb';

app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.static(path.join(__dirname, 'public')));

function manusHeaders(extra = {}) {
  return { 'Content-Type': 'application/json', 'x-manus-api-key': process.env.MANUS_API_KEY, ...extra };
}

function requireKey(res) {
  if (!process.env.MANUS_API_KEY) {
    res.status(500).json({ ok:false, error:{ message:'MANUS_API_KEY is not configured on the server. Add it to .env and restart.' } });
    return false;
  }
  return true;
}

// Browser sends the file as base64 to this server. The server then performs the
// signed PUT to Manus, avoiding browser CORS failures on upload_url.
app.post('/api/manus/file.upload-content', async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const { filename, mime, dataBase64 } = req.body || {};
    if (!filename || !dataBase64) return res.status(400).json({ ok:false, error:{ message:'filename and dataBase64 are required.' } });
    const raw = Buffer.from(dataBase64, 'base64');
    if (!raw.length) return res.status(400).json({ ok:false, error:{ message:'The uploaded file is empty.' } });

    const createRes = await fetch(`${MANUS_API_BASE}/file.upload`, {
      method:'POST', headers:manusHeaders(), body:JSON.stringify({ filename })
    });
    const createText = await createRes.text();
    let created;
    try { created = JSON.parse(createText); } catch { created = { ok:false, error:{ message:createText || 'Invalid Manus file response.' } }; }
    if (!createRes.ok || !created.ok || !created.upload_url || !created.file?.id) {
      return res.status(createRes.status || 502).json(created.ok === false ? created : { ok:false, error:{ message:'Manus did not return a valid upload URL.' } });
    }

    const putRes = await fetch(created.upload_url, {
      method:'PUT', headers:{ 'Content-Type': mime || 'application/octet-stream' }, body:raw
    });
    if (!putRes.ok) {
      const detail = await putRes.text().catch(()=>'');
      return res.status(502).json({ ok:false, error:{ message:`Manus file upload failed (${putRes.status})${detail ? `: ${detail.slice(0,180)}` : ''}` } });
    }
    // Manus may report the file as pending for a short time after the signed PUT.
    // Wait until it is uploaded before attaching it to a task.
    let fileInfo = created.file;
    for (let attempt=0; attempt<12; attempt++) {
      const detailRes = await fetch(`${MANUS_API_BASE}/file.detail?file_id=${encodeURIComponent(created.file.id)}`, { headers:manusHeaders() });
      const detailJson = await detailRes.json().catch(()=>({}));
      if (detailJson.file) fileInfo = detailJson.file;
      if (fileInfo.status === 'uploaded') break;
      if (fileInfo.status === 'error') return res.status(502).json({ ok:false, error:{ message:fileInfo.error_message || 'Manus rejected the uploaded file.' } });
      await new Promise(resolve=>setTimeout(resolve, 500));
    }
    if (fileInfo.status && fileInfo.status !== 'uploaded') {
      return res.status(504).json({ ok:false, error:{ message:`Manus file ${filename} did not finish processing in time.` } });
    }
    return res.json({ ok:true, file:fileInfo, uploaded_bytes:raw.length });
  } catch (error) {
    return res.status(502).json({ ok:false, error:{ message:error.message || 'Server-side file upload failed.' } });
  }
});

// Secure JSON proxy for the remaining Manus API calls.
app.all('/api/manus/*', async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const manusPath = req.originalUrl.replace(/^\/api\/manus/, '');
    const upstream = await fetch(`${MANUS_API_BASE}${manusPath}`, {
      method:req.method,
      headers:manusHeaders(),
      body:['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body ?? {})
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.set('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (error) {
    res.status(502).json({ ok:false, error:{ message:error.message || 'Unexpected proxy error.' } });
  }
});

// Voice input: browser records audio and sends it here as base64. The server
// forwards it to OpenAI's transcription model so the OpenAI key never touches
// the browser, then returns just the transcribed text.
function requireOpenAIKey(res) {
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ ok:false, error:{ message:'OPENAI_API_KEY is not configured on the server. Add it to .env and restart.' } });
    return false;
  }
  return true;
}

app.post('/api/transcribe', async (req, res) => {
  try {
    if (!requireOpenAIKey(res)) return;
    const { filename, mime, dataBase64, language } = req.body || {};
    if (!dataBase64) return res.status(400).json({ ok:false, error:{ message:'dataBase64 is required.' } });
    const raw = Buffer.from(dataBase64, 'base64');
    if (!raw.length) return res.status(400).json({ ok:false, error:{ message:'The audio is empty.' } });

    const form = new FormData();
    form.append('file', new Blob([raw], { type: mime || 'audio/webm' }), filename || 'voice.webm');
    form.append('model', 'gpt-4o-transcribe');
    if (language) form.append('language', language);

    const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error:{ message:text || 'Invalid OpenAI response.' } }; }
    if (!upstream.ok) {
      return res.status(upstream.status).json({ ok:false, error:{ message: (data.error && data.error.message) || 'Transcription failed.' } });
    }
    return res.json({ ok:true, text: data.text || '' });
  } catch (error) {
    return res.status(502).json({ ok:false, error:{ message:error.message || 'Transcription proxy failed.' } });
  }
});

app.get('/health', (_req, res) => res.json({ ok:true }));

/* ================= scheduled crypto-news emails =================
   Every NEWS_EMAIL_INTERVAL_HOURS (default 6), this asks the same Manus
   agent used by the chat to pull together the biggest current crypto news,
   then emails the summary to NEWS_EMAIL_TO via Gmail SMTP using
   GMAIL_USER / GMAIL_APP_PASSWORD (a Gmail "app password", not the normal
   account password). Everything here runs on the Node server only — it is
   NOT implemented in worker.js, because Cloudflare Workers cannot open raw
   TCP/TLS sockets, so this feature only works when the app is run with
   `npm start`, not when deployed to Cloudflare Workers. */

async function fetchCryptoNewsSummary() {
  if (!requireKeyPlain()) throw new Error('MANUS_API_KEY is not configured on the server.');
  const prompt = 'Search the web right now for the biggest current crypto market news ' +
    '(major price moves, ETF news, regulation, hacks/exploits, big partnerships or listings). ' +
    'Reply in Bengali (বাংলা). Write the reply as a clean, professional plain-text email body. ' +
    'STRICT FORMAT RULES: do not use any Markdown or special symbols (no #, no *, no **, no _, no backticks, no > and no tables). ' +
    'Do not use emojis. Do not use ALL CAPS words or exaggerated language. ' +
    'Start with one short neutral introduction line. Then list each story as a numbered item written as "1.", "2.", "3." ' +
    'with a short plain title on the first line, then one or two clear sentences explaining it, then a line starting with "Source:" followed by the publication name. ' +
    'Put one blank line between items. Most important story first. Give at most 6 items. ' +
    'End with one polite closing line. Do not add any other headings or decorations.';

  const createRes = await fetch(`${MANUS_API_BASE}/task.create`, {
    method: 'POST', headers: manusHeaders(),
    body: JSON.stringify({ message: { content: [{ type:'text', text: prompt }] } })
  });
  const created = await createRes.json().catch(() => ({}));
  if (!createRes.ok || !created.ok || !created.task_id) {
    throw new Error((created.error && created.error.message) || 'Manus task.create failed.');
  }
  const taskId = created.task_id;

  const deadline = Date.now() + 6 * 60 * 1000; // give the agent up to 6 minutes
  let summary = '';
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 5000));
    const listRes = await fetch(
      `${MANUS_API_BASE}/task.listMessages?task_id=${encodeURIComponent(taskId)}&order=asc&limit=200`,
      { headers: manusHeaders() }
    );
    const data = await listRes.json().catch(() => ({}));
    const events = data.messages || data.events || [];

    const lastAssistant = [...events].reverse().find(e => e.type === 'assistant_message');
    if (lastAssistant) {
      const msg = lastAssistant.assistant_message || {};
      summary = typeof msg.content === 'string'
        ? msg.content
        : (Array.isArray(msg.content) ? msg.content.map(p => p.text || '').join('') : '');
    }
    const lastStatus = [...events].reverse().find(e => e.type === 'status_update');
    const agentStatus = lastStatus && lastStatus.status_update && lastStatus.status_update.agent_status;
    if (agentStatus === 'stopped' || agentStatus === 'waiting' || agentStatus === 'error') break;
  }
  if (!summary.trim()) throw new Error('Manus did not return a news summary in time.');
  return summary.trim();
}

function requireKeyPlain() {
  return !!process.env.MANUS_API_KEY;
}

// --- tiny dependency-free SMTP client (Gmail, SSL, AUTH LOGIN) ---
function smtpWrite(socket, line) {
  return new Promise((resolve, reject) => {
    socket.write(line + '\r\n', err => err ? reject(err) : resolve());
  });
}
function smtpRead(socket) {
  return new Promise((resolve, reject) => {
    let buf = '';
    const onData = chunk => {
      buf += chunk.toString('utf8');
      const lines = buf.split('\r\n').filter(Boolean);
      const last = lines[lines.length - 1];
      if (last && /^\d{3} /.test(last)) { cleanup(); resolve(buf); }
    };
    const onError = err => { cleanup(); reject(err); };
    function cleanup(){ socket.removeListener('data', onData); socket.removeListener('error', onError); }
    socket.on('data', onData);
    socket.on('error', onError);
  });
}
// Reads a response and THROWS if the status code isn't one of `expectedCodes`.
// Without this check, an auth failure (535) or rejected recipient (550) still
// "succeeds" as far as the calling code can tell, because it's still a
// well-formed 3-digit SMTP reply -- it just isn't a success one.
async function smtpExpect(socket, expectedCodes, label) {
  const resp = await smtpRead(socket);
  const lines = resp.split('\r\n').filter(Boolean);
  const code = parseInt((lines[lines.length - 1] || '').slice(0, 3), 10);
  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP ${label || 'command'} failed (${code || '???'}): ${resp.trim()}`);
  }
  return resp;
}

// Removes any Markdown / decoration the agent may still produce so the mail
// reads as clean professional text.
function cleanEmailText(raw) {
  let t = String(raw || '').replace(/\r\n/g, '\n');
  t = t.replace(/```[a-z]*\n?/gi, '');                    // code fences
  t = t.replace(/^\s{0,3}#{1,6}\s*/gm, '');                // headings
  t = t.replace(/^\s*>\s?/gm, '');                         // block quotes
  t = t.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '$1 ($2)'); // links
  t = t.replace(/(\*\*|__)(.*?)\1/g, '$2');                // bold
  t = t.replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,;:!?]|$)/g, '$1$2'); // italic
  t = t.replace(/^\s*[-*•●▪◦]\s+/gm, '');                  // bullet markers
  t = t.replace(/^\s*[-*_=]{3,}\s*$/gm, '');               // horizontal rules
  t = t.replace(/[*`#]/g, '');                             // any leftovers
  t = t.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ''); // emojis
  t = t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function wrapBase64(buf) {
  return buf.toString('base64').replace(/(.{76})/g, '$1\r\n');
}

function buildEmailHtml(text) {
  const paras = text.split(/\n{2,}/).map(block =>
    '<p style="margin:0 0 14px 0;">' + escapeHtml(block).replace(/\n/g, '<br>') + '</p>'
  ).join('');
  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;">' +
    '<div style="max-width:640px;margin:0 auto;padding:24px;font-family:Arial,Helvetica,sans-serif;' +
    'font-size:15px;line-height:1.6;color:#222222;">' + paras + '</div></body></html>';
}

async function sendGmailTo({ subject, text, to }) {
  const user = process.env.GMAIL_USER;
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!user || !pass) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD is not configured in .env.');

  const body = cleanEmailText(text);
  const domain = (user.split('@')[1] || 'gmail.com');
  const boundary = '=_etai_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  const textPart = wrapBase64(Buffer.from(body, 'utf8'));
  const htmlPart = wrapBase64(Buffer.from(buildEmailHtml(body), 'utf8'));

  const message =
    `From: ET AI News <${user}>\r\n` +
    `To: <${to}>\r\n` +
    `Reply-To: <${user}>\r\n` +
    `Subject: ${subject}\r\n` +
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}\r\n` +
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2, 12)}@${domain}>\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: multipart/alternative; boundary="${boundary}"\r\n` +
    `\r\n` +
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
    const socket = tls.connect(465, 'smtp.gmail.com', { servername: 'smtp.gmail.com' });
    socket.once('error', reject);
    socket.once('secureConnect', async () => {
      try {
        await smtpExpect(socket, [220], 'greeting');
        await smtpWrite(socket, 'EHLO localhost'); await smtpExpect(socket, [250], 'EHLO');
        await smtpWrite(socket, 'AUTH LOGIN'); await smtpExpect(socket, [334], 'AUTH LOGIN');
        await smtpWrite(socket, Buffer.from(user, 'utf8').toString('base64')); await smtpExpect(socket, [334], 'AUTH username');
        await smtpWrite(socket, Buffer.from(pass, 'utf8').toString('base64')); await smtpExpect(socket, [235], 'AUTH password (check GMAIL_APP_PASSWORD)');
        await smtpWrite(socket, `MAIL FROM:<${user}>`); await smtpExpect(socket, [250], 'MAIL FROM');
        await smtpWrite(socket, `RCPT TO:<${to}>`); await smtpExpect(socket, [250, 251], 'RCPT TO');
        await smtpWrite(socket, 'DATA'); await smtpExpect(socket, [354], 'DATA');
        await smtpWrite(socket, message); await smtpExpect(socket, [250], 'message body (send)');
        await smtpWrite(socket, 'QUIT');
        socket.end();
        resolve();
      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });
  });
}

// NEWS_EMAIL_TO may hold several comma-separated addresses; every recipient
// gets the same news, each as its own message.
async function sendGmail({ subject, text }) {
  const user = process.env.GMAIL_USER;
  const list = (process.env.NEWS_EMAIL_TO || user || '')
    .split(/[,;\s]+/).map(x => x.trim()).filter(Boolean);
  let sent = 0;
  for (const to of list) {
    try {
      await sendGmailTo({ subject, text, to });
      sent++;
      console.log('[news-job] email sent to', to);
    } catch (err) {
      console.error('[news-job] failed for', to, '-', err.message || err);
    }
  }
  if (!sent) throw new Error('News email could not be delivered to any recipient.');
}

async function runNewsEmailJob() {
  try {
    console.log('[news-job] fetching crypto news summary...');
    const summary = await fetchCryptoNewsSummary();
    const stamp = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      timeZone: process.env.TZ || undefined
    });
    const subject = `ET AI Crypto News Update - ${stamp}`;
    await sendGmail({ subject, text: summary });
  } catch (err) {
    console.error('[news-job] failed:', err.message || err);
  }
}

// manual trigger, handy for testing without waiting for the schedule
app.post('/api/news/run-now', async (_req, res) => {
  try {
    await runNewsEmailJob();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok:false, error:{ message: error.message || 'News job failed.' } });
  }
});

if (process.env.NEWS_EMAIL_ENABLED !== 'false' && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  const intervalHours = Number(process.env.NEWS_EMAIL_INTERVAL_HOURS || 6);
  const intervalMs = intervalHours * 60 * 60 * 1000;
  console.log(`[news-job] scheduled every ${intervalHours}h -> ${process.env.NEWS_EMAIL_TO || process.env.GMAIL_USER}`);
  runNewsEmailJob(); // also send one right away on startup
  setInterval(runNewsEmailJob, intervalMs);
}

app.listen(PORT, () => console.log(`ET AI running at http://localhost:${PORT}`));
