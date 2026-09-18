const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class UserSystem {
  constructor(file = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'store.json')) {
    this.file = path.resolve(file);
    this.state = { users: {}, keys: {}, usage: {} };
    this.load();
    if (Object.keys(this.state.users).length === 0) this.seedDefaultUsers();
  }

  load() {
    try { this.state = { ...this.state, ...JSON.parse(fs.readFileSync(this.file, 'utf8')) }; }
    catch (_) { this.persist(); }
  }

  persist() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2));
    fs.renameSync(tmp, this.file);
  }

  seedDefaultUsers() {
    const adminKey = process.env.API_KEY || `sc_demo_${crypto.randomBytes(12).toString('hex')}`;
    this.createUser({ userId: process.env.USER_ID || 'demo-user', plan: process.env.PLAN || 'free', tokenLimit: 500, apiKey: adminKey });
    this.persist();
    console.log(`[ScanClick] Demo API key: ${adminKey}`);
  }

  createUser({ userId, plan = 'free', tokenLimit, apiKey } = {}) {
    const id = String(userId || `user-${crypto.randomBytes(6).toString('hex')}`).trim();
    if (this.state.users[id]) throw new Error('User already exists');
    const limits = { free: 500, basic: 5000, pro: 100000, enterprise: 1000000 };
    const key = apiKey || `sc_${crypto.randomBytes(24).toString('hex')}`;
    const user = { userId: id, plan: String(plan).toLowerCase(), tokenLimit: Number(tokenLimit) || limits[plan] || 500, createdAt: new Date().toISOString() };
    this.state.users[id] = user;
    this.state.keys[key] = id;
    this.state.usage[id] ||= { tokenUsage: 0, requestCount: 0, resetCount: 0, lastResetAt: null };
    this.persist();
    return { user, apiKey: key };
  }

  validateKey(key) {
    const userId = this.state.keys[String(key || '').trim()];
    if (!userId || !this.state.users[userId]) return { valid: false };
    return { valid: true, userId, user: this.state.users[userId], usage: this.getUsage(userId) };
  }

  createKey(userId) {
    if (!this.state.users[userId]) return null;
    const key = `sc_${crypto.randomBytes(24).toString('hex')}`;
    this.state.keys[key] = userId;
    this.persist();
    return key;
  }

  revokeKey(key) { if (!this.state.keys[key]) return false; delete this.state.keys[key]; this.persist(); return true; }

  useToken(userId, amount = 1) {
    const user = this.state.users[userId];
    if (!user) return false;
    const usage = this.state.usage[userId] ||= { tokenUsage: 0, requestCount: 0, resetCount: 0, lastResetAt: null };
    const req = Math.max(1, Math.ceil(Number(amount) || 1));
    if (usage.tokenUsage + req > user.tokenLimit) {
      usage.tokenUsage = 0; usage.resetCount += 1; usage.lastResetAt = new Date().toISOString();
    }
    usage.tokenUsage += Math.min(req, user.tokenLimit);
    usage.requestCount += 1;
    this.persist();
    return true;
  }

  getUsage(userId) {
    const user = this.state.users[userId];
    if (!user) return null;
    const usage = this.state.usage[userId] || { tokenUsage: 0, requestCount: 0, resetCount: 0, lastResetAt: null };
    return { userId, plan: user.plan, limit: user.tokenLimit, used: usage.tokenUsage, remaining: Math.max(0, user.tokenLimit - usage.tokenUsage), requestCount: usage.requestCount, resetCount: usage.resetCount, lastResetAt: usage.lastResetAt };
  }

  listUsers() { return Object.values(this.state.users).map(user => ({ ...user, usage: this.getUsage(user.userId) })); }
  listKeys(userId) { return Object.entries(this.state.keys).filter(([, id]) => !userId || id === userId).map(([key, id]) => ({ key: `${key.slice(0, 8)}...`, userId: id })); }
}
module.exports = UserSystem;
