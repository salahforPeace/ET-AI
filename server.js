import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const MANUS_API_KEY = process.env.MANUS_API_KEY;
const MANUS_BASE = 'https://api.manus.ai/v2';
const AGENT_PROFILE = process.env.MANUS_AGENT_PROFILE || 'manus-1.6';

if (!MANUS_API_KEY) {
  console.warn('WARNING: MANUS_API_KEY is not set. Set it in your .env file or hosting provider env vars.');
}

const SYSTEM_PRIMER = `You are ET AI, a senior fundamental-analysis researcher for crypto assets (not a price predictor).
When a specific coin/project/token is named, investigate it thoroughly before answering — check the official site, whitepaper/docs, team/founders background, tokenomics/supply schedule, audits, on-chain holder concentration, exchange listings, socials/community activity, recent news, and any scam/rug-pull reports. Treat this like a real analyst doing full due diligence, not a quick lookup.
Cover, where relevant: tokenomics & supply distribution, team background & credibility, utility & real use case, on-chain/holder activity, community & social signal, recent news/catalysts, and concrete risk flags.
Be direct, structured, and skeptical by default — call out weak fundamentals plainly, and say clearly when something can't be verified.
Never give price predictions or tell someone to buy/sell; always note this is not financial advice when giving an assessment.
Structure longer answers with short bolded section labels or bullet points so a thorough analysis stays scannable.
The user may write in Bengali-English mix (Banglish) or English — mirror whichever language they use.

---
User message follows below.
`;

function manusHeaders() {
  return {
    'x-manus-api-key': MANUS_API_KEY,
    'Content-Type': 'application/json'
  };
}

async function createTask(userMessage) {
  const r = await fetch(`${MANUS_BASE}/task.create`, {
    method: 'POST',
    headers: manusHeaders(),
    body: JSON.stringify({
      agent_profile: AGENT_PROFILE,
      hide_in_task_list: true,
      message: {
        content: [{ type: 'text', text: `${SYSTEM_PRIMER}${userMessage}` }]
      }
    })
  });
  const data = await r.json();
  if (!r.ok || data.ok === false) {
    throw new Error(`task.create failed: ${JSON.stringify(data)}`);
  }
  return data.task_id;
}

async function sendMessage(taskId, userMessage) {
  const r = await fetch(`${MANUS_BASE}/task.sendMessage`, {
    method: 'POST',
    headers: manusHeaders(),
    body: JSON.stringify({
      task_id: taskId,
      message: { content: [{ type: 'text', text: userMessage }] }
    })
  });
  const data = await r.json();
  if (!r.ok || data.ok === false) {
    throw new Error(`task.sendMessage failed: ${JSON.stringify(data)}`);
  }
}

async function pollForCompletion(taskId, { maxAttempts = 60, intervalMs = 3000 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const r = await fetch(`${MANUS_BASE}/task.listMessages?task_id=${taskId}&order=desc&limit=30`, {
      headers: manusHeaders()
    });
    const data = await r.json();
    const messages = data.messages || [];

    const stopped = messages.some(
      m => m.type === 'status_update' && m.status_update && m.status_update.agent_status === 'stopped'
    );
    const assistantMsg = messages.find(m => m.type === 'assistant_message');

    if (stopped && assistantMsg) {
      return {
        text: assistantMsg.assistant_message.content,
        attachments: assistantMsg.assistant_message.attachments || [],
        sources: extractSources(messages)
      };
    }
    await new Promise(res => setTimeout(res, intervalMs));
  }
  throw new Error('Manus task timed out — the analysis is taking longer than expected.');
}

function extractSources(messages) {
  const text = JSON.stringify(messages);
  const found = text.match(/https?:\/\/[^\s"'\\]+/g) || [];
  const clean = found.map(u => u.replace(/[),.]+$/, ''));
  return Array.from(new Set(clean)).slice(0, 15);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, taskId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (!MANUS_API_KEY) {
      return res.status(500).json({ error: 'Server is missing MANUS_API_KEY' });
    }

    let currentTaskId = taskId;
    if (currentTaskId) {
      await sendMessage(currentTaskId, message);
    } else {
      currentTaskId = await createTask(message);
    }

    const result = await pollForCompletion(currentTaskId);
    res.json({ taskId: currentTaskId, ...result });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Manus request failed', detail: String(err.message || err) });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ET AI backend listening on port ${PORT}`));
