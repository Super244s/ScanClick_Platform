# ScanClick Platform

แพลตฟอร์ม Node.js แบบ self-contained สำหรับรัน Local AI-style API พร้อม API keys, token usage, rate limit, dashboard และการจัดเก็บข้อมูลแบบ JSON

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env
# แก้ ADMIN_KEY ใน .env (ถ้าต้องการหน้า admin)
npm start
```

เปิด `http://localhost:3000` และใช้ API key ที่แสดงใน terminal ตอนเริ่มครั้งแรก หรือดูจาก `data/store.json` ค่าเริ่มต้นจะสร้างอัตโนมัติ

โหมดพัฒนา: `npm run dev`  
ตรวจ syntax/tests: `npm test`

## API

ส่ง `x-api-key` หรือ `Authorization: Bearer <key>`:

```bash
curl http://localhost:3000/api/v1/chat/completions \
  -H 'content-type: application/json' \
  -H 'x-api-key: YOUR_KEY' \
  -d '{"messages":[{"role":"user","content":"สวัสดี"}]}'
```

Endpoints: `GET /health`, `GET /api/v1/status`, `POST /api/v1/chat/completions`, `GET /api/v1/usage`, `GET/POST/DELETE /api/v1/api-keys`, และ admin endpoints `/api/v1/users` ด้วย `x-admin-key`.

> ระบบนี้เป็น local deterministic AI engine ไม่ได้อ้างว่าเป็นโมเดลภายนอกหรือ AGI การเชื่อมต่อผู้ให้บริการ AI จริงต้องเพิ่ม provider และ secret ของผู้ใช้เอง

## ความปลอดภัย

ห้าม commit `.env` หรือ token จริง ใช้ `.env.example` เป็นแม่แบบ ข้อมูล runtime อยู่ใน `data/store.json` ซึ่งถูก ignore โดย Git
