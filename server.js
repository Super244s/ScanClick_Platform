const express = require('express');
const cors = require('cors');
const path = require('path');
const UserSystem = require('./core/User_Manager');
const Security = require('./core/Security');
const AICore = require('./core/AI_Engine');
const Status = require('./core/Status');

const app = express();
const users = new UserSystem();
const security = new Security();
const ai = new AICore();
const status = new Status(users);
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const getKey = req => req.get('x-api-key') || (req.get('authorization') || '').replace(/^Bearer\s+/i, '') || req.body?.api_key;
function auth(req, res, next) {
  const key = getKey(req); const result = users.validateKey(key);
  if (!result.valid) return res.status(401).json({ error: 'Invalid API key' });
  const access = security.checkAccess(key, result.user.plan);
  if (!access.ok) return res.status(429).json({ error: 'Rate limit exceeded', ...access });
  req.auth = { ...result, key, access }; next();
}
function admin(req, res, next) { if (!process.env.ADMIN_KEY || req.get('x-admin-key') !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'Admin access required' }); next(); }

app.get('/health', (req, res) => res.json({ ok: true, ...status.getUptime() }));
app.get('/api/v1/status', (req, res) => res.json(status.getUptime()));
app.post('/api/v1/chat/completions', auth, async (req, res) => {
  const messages = Array.isArray(req.body.messages) ? req.body.messages : [{ content: req.body.prompt }];
  const last = messages.at(-1)?.content || '';
  if (typeof last !== 'string' || !last.trim()) return res.status(400).json({ error: 'messages or prompt is required' });
  users.useToken(req.auth.userId, Math.max(1, Math.ceil(last.length / 4)));
  const result = await ai.process(last, req.auth.userId);
  res.json({ id: `chatcmpl-${Date.now()}`, object: 'chat.completion', ...result, choices: [{ index: 0, message: { role: 'assistant', content: result.answer }, finish_reason: 'stop' }], usage: users.getUsage(req.auth.userId) });
});
app.get('/api/v1/usage', auth, (req, res) => res.json(users.getUsage(req.auth.userId)));
app.get('/api/v1/api-keys', auth, (req, res) => res.json({ object: 'list', data: users.listKeys(req.auth.userId) }));
app.post('/api/v1/api-keys', auth, (req, res) => res.status(201).json({ object: 'api_key', api_key: users.createKey(req.auth.userId) }));
app.delete('/api/v1/api-keys/:key', auth, (req, res) => res.json({ revoked: users.revokeKey(req.params.key) }));
app.post('/api/v1/users', admin, (req, res) => { try { res.status(201).json(users.createUser(req.body)); } catch (e) { res.status(400).json({ error: e.message }); } });
app.get('/api/v1/users', admin, (req, res) => res.json({ data: users.listUsers() }));
app.get('/api/v1/docs', (req, res) => res.json({ chat: 'POST /api/v1/chat/completions', auth: 'x-api-key or Bearer token', health: 'GET /health' }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) app.listen(port, () => console.log(`ScanClick running at http://localhost:${port}`));
module.exports = app;
