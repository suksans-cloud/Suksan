/**
 * My Family Funds — Monthly Report Backend (Google Apps Script)
 * -----------------------------------------------------
 * ไฟล์นี้รองรับ Admin PIN login และ Monthly Report API
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
 * หมายเหตุ: token protection ในไฟล์นี้ครอบคลุมเฉพาะ Monthly Report API actions;
 * API อื่นที่แอปใช้ต้องตรวจสิทธิ์แยกต่างหาก
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
    // Authentication endpoints remain public for sign-in, validation and sign-out.
    case 'adminLogin':            return adminLogin(body);
    case 'googleLogin':           return googleLogin(body);
    case 'sheetsProxy':           return sheetsProxy(body);
    case 'validateAdminSession':  return validateAdminSession(body);
    case 'adminLogout':           return adminLogout(body);
    // Monthly Report API actions require a valid admin session.
    case 'getReportConfig':
    case 'setReportConfig':
    case 'installMonthlyTrigger':
    case 'sendTestReport':
    case 'checkMonthlyReportSetup':
      if (!isValidAdminSession_(body.token)) {
        return { ok: false, error: 'กรุณาเข้าสู่ระบบผู้ดูแลใหม่อีกครั้ง', code: 'AUTH_REQUIRED' };
      }
      if (action === 'getReportConfig') return getReportConfig();
      if (action === 'setReportConfig') return setReportConfig(body);
      if (action === 'installMonthlyTrigger') return installMonthlyTriggerAction();
      if (action === 'sendTestReport') return sendTestReportAction();
      if (action === 'checkMonthlyReportSetup') return checkMonthlyReportSetup();
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



/* =====================================================================
 * Admin login — 6-digit PIN keypad
 * Configure ADMIN_INITIAL_PIN below, run setupAdminLogin() once, then
 * replace the placeholder with a different PIN and run setup again if needed.
 * The PIN hash and salt are stored in Script Properties, not in the frontend.
 * ===================================================================== */
const ADMIN_INITIAL_USERNAME = 'admin';
const ADMIN_INITIAL_PIN = 'CHANGE_ME'; // Set to your private 6-digit PIN, run setupAdminLogin(), then remove it from source.
const ADMIN_SESSION_HOURS = 12;
function adminDigest_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
}
function setupAdminLogin() {
  if (!/^\d{6}$/.test(ADMIN_INITIAL_PIN)) throw new Error('ตั้ง ADMIN_INITIAL_PIN เป็นรหัส 6 หลักก่อน แล้วจึง Run setupAdminLogin()');
  const salt = Utilities.getUuid() + Utilities.getUuid();
  const props = PropertiesService.getScriptProperties();
  props.setProperties({ MFF_ADMIN_USERNAME: ADMIN_INITIAL_USERNAME, MFF_ADMIN_SALT: salt, MFF_ADMIN_PIN_HASH: adminDigest_(salt + ':' + ADMIN_INITIAL_PIN) }, true);
  // Remove any old sessions after changing credentials.
  props.deleteProperty('MFF_ADMIN_SESSIONS');
  return {ok:true, message:'ตั้งค่าบัญชีแอดมินแล้ว กรุณาลบรหัส PIN ออกจาก source code และ Deploy เวอร์ชันใหม่'};
}
function adminLogin(body) {
  const props = PropertiesService.getScriptProperties();
  const username = String(body.username || '').trim();
  const pin = String(body.pin || '');
  const expectedUser = props.getProperty('MFF_ADMIN_USERNAME');
  const salt = props.getProperty('MFF_ADMIN_SALT');
  const hash = props.getProperty('MFF_ADMIN_PIN_HASH');
  if (!expectedUser || !salt || !hash) return {ok:false, error:'ยังไม่ได้ตั้งค่าบัญชีแอดมินใน Apps Script'};
  if (username !== expectedUser || !/^\d{6}$/.test(pin) || adminDigest_(salt + ':' + pin) !== hash) {
    Utilities.sleep(450);
    return {ok:false, error:'ชื่อผู้ใช้หรือรหัส PIN ไม่ถูกต้อง'};
  }
  const token = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');
  const expiresAt = Date.now() + ADMIN_SESSION_HOURS * 60 * 60 * 1000;
  const sessions = getAdminSessions_();
  sessions[token] = {username: expectedUser, expiresAt: expiresAt};
  const keys = Object.keys(sessions);
  while (keys.length > 8) delete sessions[keys.shift()];
  props.setProperty('MFF_ADMIN_SESSIONS', JSON.stringify(sessions));
  return {ok:true, token:token, username:expectedUser, expiresAt:expiresAt};
}
function getAdminSessions_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('MFF_ADMIN_SESSIONS') || '{}') || {}; }
  catch(e) { return {}; }
}
function isValidAdminSession_(token) {
  token = String(token || '');
  if (!token) return false;
  const sessions = getAdminSessions_();
  const session = sessions[token];
  if (!session || Number(session.expiresAt) <= Date.now()) {
    if (session) {
      delete sessions[token];
      PropertiesService.getScriptProperties().setProperty('MFF_ADMIN_SESSIONS', JSON.stringify(sessions));
    }
    return false;
  }
  return true;
}

/* ===== Google Sign-In (V85) =====
 * 1) ใส่อีเมลที่อนุญาตใน GOOGLE_ALLOWED_EMAILS และ OAuth Client ID ใน GOOGLE_CLIENT_ID
 * 2) Run setupGoogleLogin() หนึ่งครั้ง  3) Deploy เป็น New version
 */
const GOOGLE_ALLOWED_EMAILS = 'suksans@gmail.com'; // คั่นหลายอีเมลด้วย comma
const GOOGLE_CLIENT_ID = '1093878036972-rnj32m00k5aduc6lmj6mcb5140gi2sjc.apps.googleusercontent.com';                    // xxxx.apps.googleusercontent.com
const GOOGLE_SHEET_ID = '1T4cu1gKhFid4rmGimnEz4Hea_Hv71Nz3mpawRBSEdDY';                     // ID ของ Google Sheet หลัก (ส่วนระหว่าง /d/ และ /edit ใน URL)
const GOOGLE_SESSION_DAYS = 30;

function setupGoogleLogin() {
  PropertiesService.getScriptProperties().setProperties({MFF_ALLOWED_EMAILS: GOOGLE_ALLOWED_EMAILS, MFF_GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID, MFF_SHEET_ID: GOOGLE_SHEET_ID}, false);
}

function googleLogin(body) {
  const props = PropertiesService.getScriptProperties();
  const allowed = String(props.getProperty('MFF_ALLOWED_EMAILS') || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
  const cid = props.getProperty('MFF_GOOGLE_CLIENT_ID') || '';
  if (!allowed.length) return {ok:false, error:'ยังไม่ได้ตั้งอีเมลที่อนุญาต (Run setupGoogleLogin)'};
  let info;
  try {
    const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(String(body.idToken || '')), {muteHttpExceptions:true});
    if (r.getResponseCode() !== 200) return {ok:false, error:'Google token ไม่ถูกต้อง'};
    info = JSON.parse(r.getContentText());
  } catch (e) { return {ok:false, error:'ตรวจสอบ Google token ไม่สำเร็จ'}; }
  const email = String(info.email || '').toLowerCase();
  if (String(info.email_verified) !== 'true' || (cid && info.aud !== cid) || allowed.indexOf(email) < 0) {
    Utilities.sleep(450);
    return {ok:false, error:'บัญชีนี้ไม่ได้รับอนุญาตให้เข้าใช้งาน'};
  }
  const token = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');
  const expiresAt = Date.now() + GOOGLE_SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sessions = getAdminSessions_();
  sessions[token] = {username: email, expiresAt: expiresAt};
  const keys = Object.keys(sessions);
  while (keys.length > 12) delete sessions[keys.shift()];
  props.setProperty('MFF_ADMIN_SESSIONS', JSON.stringify(sessions));
  return {ok:true, token:token, email:email, name:info.name || '', expiresAt:expiresAt, sheetId:cfgGet('MFF_SHEET_ID')};
}

/* ตัวกลางเรียก Sheets API: หน้าเว็บส่งคำขอพร้อม session token แล้ว Apps Script เรียกแทนด้วยสิทธิ์เจ้าของสคริปต์
 * จำกัดเฉพาะ Spreadsheet ที่ตั้งใน GOOGLE_SHEET_ID เท่านั้น */
function sheetsProxy(body) {
  if (!isValidAdminSession_(body.token)) return {ok:false, auth:false, status:401, body:'{"error":"unauthorized"}'};
  const url = String(body.url || '');
  const method = String(body.method || 'GET').toUpperCase();
  const sm = url.match(/^https:\/\/sheets\.googleapis\.com\/v4\/spreadsheets\/([A-Za-z0-9_-]+)/);
  const cm = url.match(/^https:\/\/www\.googleapis\.com\/calendar\/v3\/(users\/me\/calendarList|calendars\/[^\/?]+\/events)/);
  if (sm) {
    const sid = cfgGet('MFF_SHEET_ID');
    if (!sid) return {ok:false, status:403, body:'{"error":"ยังไม่ได้ตั้ง GOOGLE_SHEET_ID (Run setupGoogleLogin)"}'};
    if (sm[1] !== sid || ['GET','POST','PUT','PATCH'].indexOf(method) < 0) return {ok:false, status:403, body:'{"error":"not allowed"}'};
  } else if (!cm || ['GET','POST','PATCH','DELETE'].indexOf(method) < 0) {
    return {ok:false, status:403, body:'{"error":"not allowed"}'};
  }
  const opt = {method: method.toLowerCase(), headers:{Authorization:'Bearer ' + ScriptApp.getOAuthToken()}, muteHttpExceptions:true};
  if (method !== 'GET' && method !== 'DELETE' && body.body) { opt.contentType = 'application/json'; opt.payload = String(body.body); }
  const r = UrlFetchApp.fetch(url, opt);
  return {ok:true, status:r.getResponseCode(), body:r.getContentText()};
}

/* Run หนึ่งครั้งเพื่ออนุญาตสิทธิ์ Google Calendar (ใช้กับหน้า Calendar) */
function authorizeCalendarPermissions() { CalendarApp.getDefaultCalendar(); }

function validateAdminSession(body) {
  const token = String(body.token || '');
  const sessions = getAdminSessions_();
  const s = sessions[token];
  if (!s || s.expiresAt < Date.now()) {
    if (s) { delete sessions[token]; PropertiesService.getScriptProperties().setProperty('MFF_ADMIN_SESSIONS', JSON.stringify(sessions)); }
    return {ok:false, authenticated:false};
  }
  return {ok:true, authenticated:true, username:s.username, expiresAt:s.expiresAt, sheetId:cfgGet('MFF_SHEET_ID')};
}
function adminLogout(body) {
  const token = String(body.token || '');
  const sessions = getAdminSessions_();
  delete sessions[token];
  PropertiesService.getScriptProperties().setProperty('MFF_ADMIN_SESSIONS', JSON.stringify(sessions));
  return {ok:true};
}

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
    SpreadsheetApp.openById(cfgGet('REPORT_SHEET_ID')).getName();
    if (MailApp.getRemainingDailyQuota() <= 0) throw new Error('โควตาส่งอีเมลของ Google ไม่เหลือแล้ว');
    ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === REPORT_TRIGGER_FN) ScriptApp.deleteTrigger(t); });
    ScriptApp.newTrigger(REPORT_TRIGGER_FN).timeBased().onMonthDay(1).atHour(7).create();
  } catch (err) {
    return { ok: false, error: 'เปิดส่งอัตโนมัติไม่สำเร็จ: ' + (err && err.message || err) + ' — หากเป็นครั้งแรก ให้รัน authorizeReportPermissions() ใน Apps Script 1 ครั้ง แล้ว Deploy เวอร์ชันใหม่' };
  }
  return { ok: true, message: 'เปิดใช้งานส่งอัตโนมัติแล้ว (วันที่ 1 เวลา 07:00 ตาม Time zone ของ Apps Script)' };
}

function checkMonthlyReportSetup() {
  const email = cfgGet('REPORT_EMAIL');
  const sheetId = cfgGet('REPORT_SHEET_ID');
  if (!email) return { ok:false, error:'ยังไม่ได้ตั้งค่าอีเมลผู้รับ' };
  if (!sheetId) return { ok:false, error:'ยังไม่ได้ตั้งค่า Sheet ID' };
  try {
    const name = SpreadsheetApp.openById(sheetId).getName();
    const quota = MailApp.getRemainingDailyQuota();
    const trigger = hasMonthlyTrigger();
    if (!trigger) return { ok:false, error:'Google Sheet ใช้งานได้ ('+name+') แต่ยังไม่มี Monthly Trigger' };
    if (quota <= 0) return { ok:false, error:'Google Sheet ใช้งานได้ แต่โควตาส่งอีเมลวันนี้หมดแล้ว' };
    return { ok:true, message:'ระบบพร้อม • Sheet: '+name+' • Trigger ทำงานอยู่ • โควตาอีเมลคงเหลือ '+quota+' ฉบับ' };
  } catch (err) {
    return { ok:false, error:'ตรวจระบบไม่ผ่าน: '+(err && err.message || err) };
  }
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
  const sid = cfgGet('REPORT_SHEET_ID');
  if (sid) SpreadsheetApp.openById(sid).getName();
  return { ok:true, message:'สิทธิ์สำหรับ Trigger, Email และ Google Sheet พร้อมใช้งาน' };
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
