// SUMAI-Auto-Reset-System-for-Rufio244 - Future Ready AI Connector
require('dotenv').config();
const UserSystem = require('./User_Manager');
const Security = require('./Security');
const AICore = require('./AI_Engine');

class SUMAI_Connector {
  constructor() {
    this.userSystem = new UserSystem();
    this.security = new Security();
    this.ai = new AICore();
    this.githubToken = process.env.GITHUB_TOKEN;
    this.userId = process.env.USER_ID || 'Rufio244';
    console.log(`[SUMAI] เชื่อมต่อไอดี ${this.userId} | Auto-Reset: ON`);
  }

  // เรียกใช้ AI แบบต่อเนื่อง ไม่มีวันหมด
  async chat(prompt, apiKey = process.env.API_KEY) {
    // 1. เช็คสิทธิ์ + รีเซ็ต Auto ถ้าถึงลิมิต
    const auth = this.userSystem.validateKey(apiKey);
    if (!auth.valid) return { error: 'API Key ไม่ถูกต้อง' };

    // 2. เช็ค Rate Limit + รีเซ็ต Auto
    const sec = this.security.checkAccess(apiKey, auth.userId ? 'pro' : 'free');
    
    // 3. นับ Token + รีเซ็ต Auto ถ้าเต็ม
    this.userSystem.useToken(auth.userId, prompt.length);

    // 4. เรียก AI
    const result = await this.ai.process(prompt, auth.userId);
    
    // 5. ส่งสถานะการใช้งานกลับ
    const usage = this.userSystem.getUsage(auth.userId);
    return {
      ...result,
      usage,
      security: sec,
      resetInfo: sec.reset ? 'เพิ่งรีเซ็ตโควต้าให้ใช้ต่อได้เลย' : 'ใช้งานต่อเนื่องปกติ',
      githubConnected: !!this.githubToken
    };
  }

  // สำหรับเชื่อม GitHub Repo ในอนาคต
  getGitHubConfig() {
    return {
      token: this.githubToken ? 'CONNECTED' : 'NOT SET',
      repo: 'Super244s/ScanClick_Platform',
      user: this.userId,
      readyForFutureAI: true
    };
  }
}

module.exports = SUMAI_Connector;

// วิธีใช้งานในอนาคต:
// const SUMAI = require('./core/SUMAI_Token_Connector');
// const bot = new SUMAI();
// const res = await bot.chat("สวัสดี");
// console.log(res);
