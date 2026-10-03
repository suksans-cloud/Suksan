# ตั้งค่า Login ด้วย Google + PIN (V85)

## 1) Google OAuth Client ID
Google Cloud Console → Credentials → Create OAuth client ID (Web application)
- Authorized JavaScript origins: ใส่ URL เว็บ GitHub Pages ของคุณ (เช่น `https://ชื่อ.github.io`)
- คัดลอก Client ID ไปใส่ใน `config.js` ที่ `window.MFF_GOOGLE_CLIENT_ID` (ใช้ตัวเดียวกับที่ใช้ซิงก์ Sheets ได้)
  ถ้าไม่ใส่ หน้า login จะมีช่องให้วางตอนเปิดครั้งแรก

## 2) Apps Script
1. นำโค้ดใน `portfolio/Code.gs` ไปผสานกับของเดิม (มีฟังก์ชันใหม่ `googleLogin`, `setupGoogleLogin` และ case `googleLogin`)
2. แก้ `GOOGLE_ALLOWED_EMAILS`, `GOOGLE_CLIENT_ID` และ `GOOGLE_SHEET_ID` (ID ของ Google Sheet หลัก)
3. Run `setupGoogleLogin` หนึ่งครั้ง
4. Run `authorizeReportPermissions` หนึ่งครั้งเพื่ออนุญาตสิทธิ์ Sheets/UrlFetch (ถ้ามีหน้าขอสิทธิ์ให้กดอนุญาต)
5. Deploy > Manage deployments > Edit > New version > Deploy (URL `/exec` เดิม)

## 3) อัปโหลดไฟล์ทั้งหมดขึ้น GitHub Pages

## วิธีทำงาน
- Login Google ครั้งเดียว → session 30 วัน ใช้ร่วมกันทุกหน้า
- ครั้งแรกตั้ง PIN 6 หลักต่อเครื่อง (เก็บเป็น hash ในเครื่อง)
- ล็อกเมื่อเปิดแอปใหม่ / อยู่เบื้องหลังเกิน 1 นาที / ไม่ใช้งานเกิน 5 นาที
- PIN ผิด 5 ครั้งหรือกด "ลืม PIN" → ต้อง login Google ใหม่
- PIN เป็นตัวล็อกหน้าจอในเครื่อง ไม่ใช่การเข้ารหัสข้อมูล

## V86: ไม่ต้องกดเชื่อม/ซิงก์ Google ซ้ำในแต่ละหน้า
- ทุกคำขอไป Google Sheets จะผ่าน Apps Script (`sheetsProxy`) ด้วยสิทธิ์ของเจ้าของสคริปต์ และจำกัดเฉพาะ Sheet ที่ตั้งใน `GOOGLE_SHEET_ID`
- หลัง login/ปลดล็อก ทุกหน้าถือว่าเชื่อม Sheets แล้วทันที ปุ่ม/แบนเนอร์ "เชื่อมต่อ Google Sheets" ถูกซ่อน
- Apps Script ต้อง Deploy แบบ Execute as: Me
- ส่วน Google Drive (สำรองข้อมูล/รูป) ยังใช้การขอสิทธิ์แบบเดิม
