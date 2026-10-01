# V61 — Portfolio 3-Transaction Reconciliation QA

## สิ่งที่เพิ่มจาก V60
- เพิ่มปุ่ม `🔍 QA พอร์ต 3 รายการ` ในหน้า Finance
- จำลอง transaction 3 งวดโดยใช้ NAV History จริง 3 วันที่แตกต่างกัน
- คำนวณ Purchase NAV, Units, Current Value, P/L และ Return แบบเดียวกับ Portfolio
- ทำ reconciliation ซ้ำด้วย arithmetic ชุดที่สอง เพื่อยืนยันว่า Units / Value / P&L สอดคล้องกัน
- ไม่แก้ `DATA`, ไม่สร้างรายการใน `Investments`, และไม่เขียน Google Sheets

## เงื่อนไข QA
- ต้องมี NAV History อย่างน้อย 3 วันที่แตกต่างกันในกองทุนเดียวกัน
- ต้องมี NAV ปัจจุบัน
- ไม่สร้างวันที่หรือ NAV ที่ไม่มีข้อมูล

## วิธีทดสอบ
1. เปิด Finance
2. กด `🔍 QA พอร์ต 3 รายการ`
3. ตรวจสถานะ `Reconciliation ✅ ผ่าน`
4. ตรวจว่า Units / Value / P&L แสดงตรงกัน

## ขั้นถัดไปหลัง V61
หาก QA ผ่าน ให้ทดสอบ transaction จริงหลายรายการใน Investments แล้วตรวจ Portfolio รวมทุกกองทุนและกราฟประวัติพอร์ต
