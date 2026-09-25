/**
 * My Family Funds — Monthly Report Backend (Google Apps Script)
 * -----------------------------------------------------
 * นี่คือ "No-login build" — เว็บแอปฝั่งหน้าบ้านไม่มีระบบล็อกอิน ดังนั้นสคริปต์นี้
 * มีหน้าที่เดียวคือส่ง "สรุปรายเดือนทางอีเมล" ให้อัตโนมัติ ไม่มีระบบ Users/Sessions
 * เพราะไม่จำเป็นต้องใช้ (ทุก action ที่นี่เปิดกว้าง ไม่ต้องมี token)
 *
 * วิธีติดตั้ง:
 * 1) เปิด Google Sheet ที่ My Money / My Portfolio / My Bookshelf ซิงก์ข้อมูลอยู่แล้ว
 *    (หรือสร้างสเปรดชีตใหม่ก็ได้ แต่ต้องเป็น Sheet ID เดียวกับที่ตั้งค่าไว้ในแอป)
 * 2) เมนู Extensions > Apps Script แล้ววางไฟล์นี้ทับ Code.gs
 * 3) กด Deploy > New deployment > เลือกประเภท "Web app"
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4) คัดลอก URL ที่ลงท้ายด้วย /exec แล้วเอาไปแทนที่ค่า MFF_ENDPOINT ใน config.js
 * 5) ในหน้า Apps Script editor เลือกฟังก์ชัน "authorizeReportPermissions" ที่ dropdown ด้านบน
 *    แล้วกด Run 1 ครั้ง (ต้อง login ด้วยบัญชีเดียวกับที่ deploy) เพื่อ authorize สิทธิ์จัดการ
 *    Trigger และส่งอีเมลล่วงหน้า — ข้ามขั้นตอนนี้ไม่ได้ ไม่งั้นปุ่ม "เปิดใช้งานส่งอัตโนมัติ"
 *    ในหน้า Setting จะ error ว่าไม่มีสิทธิ์
 * 6) เปิดหน้า Setting ในเว็บแอป (เมนูล่าง) เพื่อตั้งค่าอีเมลรับรายงาน แล้วกด
 *    "เปิดใช้งานส่งอัตโนมัติทุกวันที่ 1"
 *
 * ⚠️ ทุกครั้งที่แก้โค้ดในไฟล์นี้ ต้องไป Deploy > Manage deployments > (ไอคอนดินสอ) > Version:
 *    "New version" > Deploy ใหม่ด้วยเสมอ — แค่กด Save ในตัวแก้โค้ดไม่ทำให้ URL /exec เดิมใช้โค้ดใหม่
 *
 * ⚠️ ข้อควรระวัง: เพราะเว็บแอปนี้ไม่มีระบบล็อกอิน ใครก็ตามที่มี URL ของเว็บแอป (ไม่ใช่ของ
 * Apps Script นี้) จะแก้อีเมลผู้รับรายงานได้เช่นกัน ถ้าต้องการจำกัดสิทธิ์ ให้ใช้ไฟล์
 * "With-Login" แทน
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'MFF Report API is running (no-login build)' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let out;
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action;
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      out = route(action, body);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function route(action, body) {
  switch (action) {
    case 'getReportConfig':       return getReportConfig();
    case 'setReportConfig':       return setReportConfig(body);
    case 'installMonthlyTrigger': return installMonthlyTriggerAction();
    case 'sendTestReport':        return sendTestReportAction();
    default: return { ok: false, error: 'Unknown action: ' + action };
  }
}

/* =====================================================================
 * สรุปรายเดือนทางอีเมล (Monthly Report)
 * ---------------------------------------------------------------------
 * อ่านข้อมูลตรงจากสเปรดชีตที่ My Money / My Portfolio / My Bookshelf
 * ซิงก์ไว้อยู่แล้ว (แท็บ MoneyTransactions, Investments, BookshelfItems)
 * แล้วส่งสรุปเข้าอีเมลที่ตั้งไว้ ทุกวันที่ 1 ของเดือนถัดไป (เวลา ~07:00)
 * ===================================================================== */

const REPORT_TRIGGER_FN = 'monthlyReportJob';
const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function cfgGet(key) { return PropertiesService.getScriptProperties().getProperty(key) || ''; }
function cfgSet(key, val) { PropertiesService.getScriptProperties().setProperty(key, val); }

function hasMonthlyTrigger() {
  try {
    return ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === REPORT_TRIGGER_FN);
  } catch (err) {
    return false; // ยังไม่ได้ authorize สิทธิ์ script.scriptapp — ถือว่ายังไม่ได้เปิดใช้งาน
  }
}

function safeMailQuota() { try { return MailApp.getRemainingDailyQuota(); } catch (e) { return null; } }

function getReportConfig() {
  return { ok: true, email: cfgGet('REPORT_EMAIL'), sheetId: cfgGet('REPORT_SHEET_ID'), triggerInstalled: hasMonthlyTrigger(), quota: safeMailQuota() };
}

function setReportConfig(body) {
  const email = String(body.email || '').trim();
  // Reuse the existing Sheet ID; no second spreadsheet/ID is required.
  const sheetId = String(body.sheetId || cfgGet('REPORT_SHEET_ID') || '').trim();
  if (!email || email.indexOf('@') === -1) return { ok: false, error: 'อีเมลไม่ถูกต้อง' };
  if (!sheetId) return { ok: false, error: 'กรุณาระบุ Sheet ID' };
  cfgSet('REPORT_EMAIL', email);
  cfgSet('REPORT_SHEET_ID', sheetId);
  return { ok: true };
}

function installMonthlyTriggerAction() {
  if (!cfgGet('REPORT_EMAIL') || !cfgGet('REPORT_SHEET_ID')) {
    return { ok: false, error: 'กรุณาบันทึกอีเมลและ Sheet ID ก่อน' };
  }
  try {
    ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === REPORT_TRIGGER_FN) ScriptApp.deleteTrigger(t); });
    ScriptApp.newTrigger(REPORT_TRIGGER_FN).timeBased().onMonthDay(1).atHour(7).create();
  } catch (err) {
    return { ok: false, error: 'ยังไม่ได้รับสิทธิ์จัดการ Trigger — ให้เปิด Apps Script editor เลือกฟังก์ชัน installMonthlyTriggerAction แล้วกด Run 1 ครั้งเพื่อ authorize สิทธิ์ก่อน (' + (err && err.message || err) + ')' };
  }
  return { ok: true, message: 'เปิดใช้งานส่งอัตโนมัติแล้ว (วันที่ 1 เวลา 07:00 ตาม Time zone ของ Apps Script)' };
}

function sendTestReportAction() {
  try {
    if (!MailApp.getRemainingDailyQuota()) throw new Error('โควตาส่งอีเมลของ Google ไม่เหลือแล้ว');
    const result = generateMonthlyReport(true);
    return { ok: true, sent: true, message: 'ส่งอีเมลทดสอบสำเร็จ', to: result.to, subject: result.subject };
  } catch (err) {
    return { ok: false, error: String(err && err.message || err) };
  }
}

// เรียกโดย trigger รายเดือนเท่านั้น (ไม่ใช่ action ที่เรียกผ่านเว็บ)
function monthlyReportJob() {
  generateMonthlyReport(false);
}

// รันฟังก์ชันนี้เอง 1 ครั้งจาก Apps Script editor (กด Run) เพื่อ authorize สิทธิ์
// ที่จำเป็นทั้งหมดล่วงหน้า (จัดการ Trigger + ส่งอีเมล + อ่านสเปรดชีต) ก่อนใช้งานจริง
function authorizeReportPermissions() {
  ScriptApp.getProjectTriggers();
  MailApp.getRemainingDailyQuota();
}

function readTab(spreadsheet, tabName) {
  const sh = spreadsheet.getSheetByName(tabName);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    const o = {};
    headers.forEach((h, i) => o[h] = row[i]);
    return o;
  });
}

function generateMonthlyReport(isTest) {
  const email = cfgGet('REPORT_EMAIL');
  const sheetId = cfgGet('REPORT_SHEET_ID');
  if (!email) throw new Error('ยังไม่ได้ตั้งค่าอีเมลผู้รับ');
  if (!sheetId) throw new Error('ยังไม่ได้ตั้งค่า Sheet ID');

  let spreadsheet;
  try {
    spreadsheet = SpreadsheetApp.openById(sheetId);
  } catch (err) {
    throw new Error('เปิด Google Sheet ไม่สำเร็จ: ' + String(err && err.message || err));
  }
  const now = new Date();
  const target = isTest ? new Date(now.getFullYear(), now.getMonth(), 1)
                         : new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const y = target.getFullYear(), m = target.getMonth() + 1;
  const monthKey = y + '-' + String(m).padStart(2, '0');
  const monthLabel = THAI_MONTHS[m - 1] + ' ' + (y + 543);

  /* ---------- My Money: รายรับ-รายจ่ายของเดือนนั้น ---------- */
  const moneyRows = readTab(spreadsheet, 'MoneyTransactions');
  let income = 0, expense = 0;
  moneyRows.forEach(r => {
    if (String(r.Month) === monthKey) {
      const amt = Number(r.Amount) || 0;
      if (String(r.Type).toLowerCase() === 'income') income += amt; else expense += amt;
    }
  });
  const net = income - expense;

  /* ---------- My Portfolio: เงินลงทุนสะสม เทียบเดือนก่อน ---------- */
  const invRows = readTab(spreadsheet, 'Investments');
  function cumulativeUpTo(yy, mm) {
    let total = 0;
    invRows.forEach(r => {
      const ry = Number(r.Year), rm = Number(r.Month);
      if (ry < yy || (ry === yy && rm <= mm)) total += Number(r.Amount) || 0;
    });
    return total;
  }
  const thisCum = cumulativeUpTo(y, m);
  let prevM = m - 1, prevY = y; if (prevM === 0) { prevM = 12; prevY = y - 1; }
  const prevCum = cumulativeUpTo(prevY, prevM);
  const diff = thisCum - prevCum;
  const pct = prevCum ? (diff / prevCum * 100) : (thisCum > 0 ? 100 : 0);

  /* ---------- My Bookshelf: จำนวนหนังสือ 3 หมวด (ณ ปัจจุบัน) ---------- */
  const bookRows = readTab(spreadsheet, 'BookshelfItems');
  const shelfLabels = { reading: 'กำลังอ่าน', queued: 'รออ่าน', finished: 'อ่านจบแล้ว' };
  const counts = { reading: 0, queued: 0, finished: 0 };
  bookRows.forEach(r => { const s = String(r.Status || ''); if (counts.hasOwnProperty(s)) counts[s]++; });
  const totalBooks = counts.reading + counts.queued + counts.finished;

  const subject = 'สรุปรายเดือน ' + monthLabel + ' — My Family Funds' + (isTest ? ' (ทดสอบ)' : '');
  const body = buildReportHtml(monthLabel, isTest, { income, expense, net }, { thisCum, prevCum, diff, pct }, counts, totalBooks, shelfLabels);
  try {
    MailApp.sendEmail({ to: email, subject, htmlBody: body });
  } catch (err) {
    throw new Error('ส่งอีเมลไม่สำเร็จ: ' + String(err && err.message || err));
  }
  return { to: email, subject: subject };
}

function fmtBaht(n) {
  const s = (Math.round(n) || 0).toString();
  return '฿' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function buildReportHtml(monthLabel, isTest, money, portfolio, bookCounts, totalBooks, shelfLabels) {
  const diffSign = portfolio.diff >= 0 ? '+' : '';
  const diffColor = portfolio.diff >= 0 ? '#1f8a63' : '#c0783a';
  const netColor = money.net >= 0 ? '#1f8a63' : '#c0783a';
  return `
  <div style="font-family:'Noto Sans Thai',sans-serif;max-width:520px;margin:0 auto;color:#14211d">
    <h2 style="color:#0f5b4d;margin-bottom:2px">สรุปรายเดือน — ${monthLabel}</h2>
    ${isTest ? '<p style="color:#c0783a;font-size:12px;margin-top:0">(นี่คืออีเมลทดสอบ ข้อมูลคำนวณจากเดือนปัจจุบัน ณ วันที่ส่ง)</p>' : ''}

    <h3 style="color:#0f5b4d;margin-bottom:6px">💰 My Money — รายรับ-รายจ่าย</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px">
      <tr><td style="padding:4px 0">รายรับรวม</td><td style="padding:4px 0;text-align:right">${fmtBaht(money.income)}</td></tr>
      <tr><td style="padding:4px 0">รายจ่ายรวม</td><td style="padding:4px 0;text-align:right">${fmtBaht(money.expense)}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;border-top:1px solid #e5e5e5">คงเหลือสุทธิ</td><td style="padding:6px 0;text-align:right;font-weight:700;border-top:1px solid #e5e5e5;color:${netColor}">${fmtBaht(money.net)}</td></tr>
    </table>

    <h3 style="color:#0f5b4d;margin-bottom:6px">📊 My Portfolio — เงินลงทุนสะสม</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px">
      <tr><td style="padding:4px 0">ยอดสะสม ณ สิ้นเดือนนี้</td><td style="padding:4px 0;text-align:right">${fmtBaht(portfolio.thisCum)}</td></tr>
      <tr><td style="padding:4px 0">ยอดสะสม ณ สิ้นเดือนก่อน</td><td style="padding:4px 0;text-align:right">${fmtBaht(portfolio.prevCum)}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;border-top:1px solid #e5e5e5">เปลี่ยนแปลง</td><td style="padding:6px 0;text-align:right;font-weight:700;border-top:1px solid #e5e5e5;color:${diffColor}">${diffSign}${fmtBaht(portfolio.diff)} (${diffSign}${portfolio.pct.toFixed(1)}%)</td></tr>
    </table>

    <h3 style="color:#0f5b4d;margin-bottom:6px">📚 My Bookshelf — หนังสือทั้งหมด ${totalBooks} เล่ม</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:10px">
      <tr><td style="padding:4px 0">${shelfLabels.reading}</td><td style="padding:4px 0;text-align:right">${bookCounts.reading} เล่ม</td></tr>
      <tr><td style="padding:4px 0">${shelfLabels.queued}</td><td style="padding:4px 0;text-align:right">${bookCounts.queued} เล่ม</td></tr>
      <tr><td style="padding:4px 0">${shelfLabels.finished}</td><td style="padding:4px 0;text-align:right">${bookCounts.finished} เล่ม</td></tr>
    </table>

    <p style="font-size:11px;color:#8a978f;margin-top:22px">อีเมลนี้ส่งอัตโนมัติจากระบบ My Family Funds</p>
  </div>`;
}
