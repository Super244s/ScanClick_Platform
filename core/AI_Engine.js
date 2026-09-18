class AICore {
  async process(prompt, userId = 'anonymous') {
    const text = String(prompt || '').trim();
    if (!text) return { answer: 'กรุณาส่งข้อความที่ต้องการให้ระบบประมวลผล', userId };
    const lower = text.toLowerCase();
    let answer;
    if (/สวัสดี|hello|hi/.test(lower)) answer = `สวัสดีครับ ${userId}! ScanClick พร้อมทำงานแล้ว`;
    else if (/ช่วย|help|ความสามารถ/.test(lower)) answer = 'ผมช่วยตอบคำถามทั่วไป สรุปข้อความ และวางแผนงานได้ โดยทำงานภายในระบบนี้';
    else answer = `ระบบได้รับข้อความแล้ว:\n\n${text}\n\nนี่คือผลลัพธ์จาก Local AI Engine ของ ScanClick`;
    return { answer, userId, model: 'scanclick-local-v1', created: Math.floor(Date.now() / 1000) };
  }
}
module.exports = AICore;
