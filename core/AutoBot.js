const { chromium } = require("playwright");

class AutoBot {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  // 📧 1. สร้างอีเมล์ชั่วคราว
  async createEmail() {
    try {
      const res = await fetch("https://api.1secmail.com/api/v1/?action=genRandomMailbox");
      const [email] = await res.json();
      console.log(`✅ สร้างอีเมล์สำเร็จ: ${email}`);
      return email;
    } catch (e) {
      console.error("❌ สร้างอีเมล์ไม่ได้:", e.message);
      return null;
    }
  }

  // 📨 2. รับอีเมล์ + ดึง OTP/ลิงก์ยืนยัน
  async getVerificationCode(email, waitSec = 30) {
    const [login, domain] = email.split("@");
    for (let i = 0; i < waitSec; i++) {
      try {
        const res = await fetch(`https://api.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
        const mails = await res.json();
        if (mails.length > 0) {
          const detail = await fetch(`https://api.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${mails[0].id}`);
          const data = await detail.json();
          const text = data.text || data.body || "";
          
          // ดึงเลข OTP 4-6 หลัก
          const otp = text.match(/\b\d{4,6}\b/)?.[0];
          // ดึงลิงก์ยืนยัน
          const link = text.match(/https?:\/\/[^\s]+/)?.[0];
          
          console.log(`✅ ได้รับอีเมล์: ${data.subject}`);
          return { otp, link, fullText: text };
        }
      } catch (e) {
        console.log("⏳ รออีเมล์...");
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    return { otp: null, link: null };
  }

  // 🌐 3. เปิดเบราว์เซอร์
  async openBrowser(headless = false) {
    this.browser = await chromium.launch({ headless });
    this.page = await this.browser.newPage();
    console.log("✅ เปิดเบราว์เซอร์เรียบร้อย");
  }

  // 📝 4. สมัครสมาชิกอัตโนมัติ
  async autoRegister(url, email, password) {
    if (!this.page) await this.openBrowser();

    try {
      await this.page.goto(url, { waitUntil: "networkidle" });
      console.log(`✅ เปิดหน้า: ${url}`);

      // กรอกข้อมูล (ปรับชื่อฟิลด์ตามเว็บจริง)
      await this.page.fill('input[name="email"], input[type="email"]', email);
      await this.page.fill('input[name="password"], input[type="password"]', password);
      
      // กดปุ่มสมัคร
      await Promise.all([
        this.page.waitForNavigation({ timeout: 15000 }),
        this.page.click('button[type="submit"], input[type="submit"]')
      ]);

      console.log("✅ กรอกข้อมูลและกดส่งเรียบร้อย");
      return true;
    } catch (e) {
      console.error("❌ สมัครไม่สำเร็จ:", e.message);
      return false;
    }
  }

  // ✅ 5. ยืนยันตัวตน
  async verifyAccount(link) {
    if (!link) return false;
    await this.page.goto(link, { waitUntil: "networkidle" });
    console.log("✅ ยืนยันบัญชีสำเร็จ!");
    return true;
  }

  // ❌ ปิดระบบ
  async close() {
    if (this.browser) await this.browser.close();
    console.log("✅ ปิดระบบเรียบร้อย");
  }

  // 🚀 ชุดทำงานเต็มรูปแบบ
  async fullProcess(targetUrl) {
    console.log("🔄 เริ่มกระบวนการอัตโนมัติ...");
    
    const email = await this.createEmail();
    if (!email) return { success: false };

    const pass = "Vider@" + Math.random().toString(36).slice(2, 10);
    
    const regOk = await this.autoRegister(targetUrl, email, pass);
    if (!regOk) return { success: false, email, pass };

    const verify = await this.getVerificationCode(email, 30);
    if (verify.link) await this.verifyAccount(verify.link);

    await this.close();

    return {
      success: true,
      email,
      password: pass,
      otp: verify.otp,
      verifyLink: verify.link
    };
  }
}

module.exports = AutoBot;
