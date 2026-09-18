class Security {
  constructor() {
    this.rateMap = new Map();
    this.windowMs = 60 * 1000; // 1 นาที
    this.planLimits = { free: 20, basic: 60, pro: 1000, enterprise: 999999 };
  }
  checkAccess(apiKey, plan='free') {
    const key = String(apiKey||'anonymous');
    const limit = this.planLimits[String(plan).toLowerCase()] || 20;
    const now = Date.now();
    const cur = this.rateMap.get(key) || { count: 0, windowStart: now };
    if (now - cur.windowStart >= this.windowMs) {
      cur.count = 0; cur.windowStart = now; // หมดเวลา รีเซ็ตหน้าต่างใหม่
    }
    if (cur.count >= limit) {
      cur.count = 0; cur.windowStart = now; // ถึงลิมิต รีเซ็ตแล้วให้ใช้ต่อได้เลยทันที
      this.rateMap.set(key, cur);
      return { ok: true, reset: true, limit, remaining: limit };
    }
    cur.count += 1;
    this.rateMap.set(key, cur);
    return { ok: true, reset: false, limit, remaining: limit - cur.count };
  }
}
module.exports = Security;
