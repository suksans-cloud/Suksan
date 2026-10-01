# ตั้งค่า Admin Login (V84)

ระบบเพิ่มหน้าเข้าสู่ระบบพร้อมแป้นตัวเลขแบบมือถือและ PIN 6 หลัก ตรวจสอบ PIN ที่ Google Apps Script backend และเก็บ hash/salt ใน Script Properties (ไม่เก็บ PIN ในหน้าเว็บ)

## ตั้งค่าครั้งแรก
1. เปิด Apps Script project ที่เป็น backend ของ URL ใน `config.js`
2. นำโค้ดใน `portfolio/Code.gs` ของ ZIP นี้ไปผสานกับ `Code.gs` เดิม (อย่าลบฟังก์ชันอื่นที่มีอยู่ในโปรเจกต์)
3. ใน `Code.gs` เปลี่ยน `ADMIN_INITIAL_PIN = 'CHANGE_ME'` เป็น PIN 6 หลักส่วนตัวของคุณชั่วคราว
4. เลือก `setupAdminLogin` ใน Apps Script editor แล้วกด Run และอนุญาตสิทธิ์หากถาม
5. กลับไปแก้ `ADMIN_INITIAL_PIN` เป็น `'CHANGE_ME'` อีกครั้งและ Save เพื่อไม่ให้ PIN จริงค้างใน source code
6. Deploy > Manage deployments > Edit > New version > Deploy แล้วใช้ URL `/exec` เดิมใน `config.js`
7. อัปโหลดไฟล์หน้าเว็บ V84 ไป GitHub Pages และเปิดแอปใหม่

ชื่อผู้ใช้เริ่มต้นคือ `admin`; เปลี่ยน `ADMIN_INITIAL_USERNAME` ก่อนรัน `setupAdminLogin()` ได้

## หมายเหตุ
- เซสชันมีอายุ 12 ชั่วโมงและผูกกับ sessionStorage ของเบราว์เซอร์
- ต้อง deploy backend ก่อนหน้า login จะตรวจสอบได้
- หน้า login เป็นประตูควบคุม UI ฝั่งเว็บ static; โค้ดนี้ตรวจ token สำหรับ actions ของ Monthly Report API เท่านั้น ต้องตรวจสิทธิ์ของ API อื่นทุกตัวแยกต่างหาก
