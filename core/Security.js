class Security {
  constructor() { this.rateMap = new Map(); this.windowMs = 60 * 1000; this.planLimits = { free: 20, basic: 60, pro: 1000, enterprise: 10000 }; }
  checkAccess(apiKey, plan = 'free') {
    const key = String(apiKey || 'anonymous'); const limit = this.planLimits[String(plan).toLowerCase()] || this.planLimits.free; const now = Date.now();
    const cur = this.rateMap.get(key) || { count: 0, windowStart: now };
    if (now - cur.windowStart >= this.windowMs) { cur.count = 0; cur.windowStart = now; }
    if (cur.count >= limit) return { ok: false, reset: false, limit, remaining: 0 };
    cur.count += 1; this.rateMap.set(key, cur);
    return { ok: true, reset: false, limit, remaining: limit - cur.count };
  }
}
module.exports = Security;
