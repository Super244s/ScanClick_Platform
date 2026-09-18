class AICore {
  async process(prompt, userId='Rufio244') {
    const msg = String(prompt||'').trim();
    if (!msg) return { answer: 'สวัสดีครับ ระบบพร้อมแล้ว (โควต้าจะรีเซ็ต Auto เมื่อถึงลิมิต)' };
    return { 
      answer: `รับแล้ว: "${msg}"\n\nระบบไอดี ${userId} ทำงานต่อเนื่องแบบ Auto-Reset เมื่อ token หมดจะเริ่มใหม่เองทันที`,
      userId, continuous: true 
    };
  }
}
module.exports = AICore;
