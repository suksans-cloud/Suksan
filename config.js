/* My Family Funds — shared config
 * แก้ URL ตรงนี้ที่เดียวพอ (หลัง deploy Apps Script แล้วคัดลอก URL ที่ลงท้าย /exec)
 * ทุกหน้าที่ต้องคุยกับ Apps Script (เข้าสู่ระบบ, การตั้งค่า, รายงานสรุปรายเดือน) จะอ่านค่านี้
 */
window.MFF_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwNSgTpMaT03Sx3RwPrp0xtv8zDy2h5CYgSMV370OkLx3bsJU29WGUPI811_pK8gloOWw/exec';

/* Google OAuth Client ID สำหรับหน้า Login (ชนิด Web application; เพิ่ม URL เว็บใน Authorized JavaScript origins) */
window.MFF_GOOGLE_CLIENT_ID = '';
