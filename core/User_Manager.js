class UserSystem {
  constructor() {
    this.usersByKey = new Map();
    this.usersById = new Map();
    this.seedDefaultUsers();
  }
  seedDefaultUsers() {
    // ไอดีหลักของลูกพี่ ให้ใช้ได้ตลอด
    this.registerUser({ 
      userId: 'Rufio244', 
      apiKey: 'Rufio244-demo-key', 
      plan: 'pro', 
      tokenLimit: 100000 
    });
    this.registerUser({ userId: 'demo-user', apiKey: 'demo-key', plan: 'free', tokenLimit: 500 });
  }
  registerUser({ userId, apiKey, plan='free', tokenLimit=500 }) {
    const user = {
      userId: String(userId).trim(),
      apiKey: String(apiKey).trim(),
      plan: String(plan).toLowerCase(),
      tokenLimit: Number(tokenLimit) || 500,
      tokenUsage: 0,
      resetCount: 0,
      lastResetAt: new Date().toISOString()
    };
    this.usersByKey.set(user.apiKey, user);
    this.usersById.set(user.userId, user);
    return user;
  }
  getUserById(id) { return this.usersById.get(String(id).trim()) || null; }
  getUserByApiKey(key) { return this.usersByKey.get(String(key).trim()) || null; }
  
  // ฟังก์ชันรีเซ็ตอัตโนมัติ - หัวใจของระบบ
  autoReset(user) {
    if (!user) return false;
    if (user.tokenUsage >= user.tokenLimit) {
      user.tokenUsage = 0; // รีเซ็ตเป็น 0 เริ่มใหม่ทันที
      user.resetCount += 1;
      user.lastResetAt = new Date().toISOString();
      console.log(`[AUTO-RESET] ไอดี ${user.userId} รีเซ็ตครั้งที่ ${user.resetCount}`);
      return true;
    }
    return false;
  }
  useToken(userId, amount=1) {
    const user = this.getUserById(userId);
    if (!user) return false;
    this.autoReset(user);
    const req = Math.max(Number(amount)||1,1);
    if (user.tokenUsage + req > user.tokenLimit) {
      this.autoReset(user); // ถ้าเกินให้รีเซ็ตแล้วใช้ต่อเลย
      user.tokenUsage = 0;
    }
    user.tokenUsage += Math.min(req, user.tokenLimit);
    return true;
  }
  getUsage(userId) {
    const u = this.getUserById(userId);
    if (!u) return null;
    return { userId: u.userId, plan: u.plan, limit: u.tokenLimit, used: u.tokenUsage, remaining: u.tokenLimit - u.tokenUsage, resetCount: u.resetCount };
  }
  validateKey(apiKey) {
    const user = this.getUserByApiKey(apiKey);
    if (!user) return { valid: false };
    this.autoReset(user);
    return { valid: true, userId: user.userId, usage: this.getUsage(user.userId) };
  }
}
module.exports = UserSystem;
