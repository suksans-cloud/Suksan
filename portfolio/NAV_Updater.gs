/**
 * My Family Funds — NAV Auto Updater V39.2
 * ใช้กับ Google Spreadsheet ที่มีชีต FundMaster
 * แหล่งข้อมูล: SCBAM Daily Open-End Fund NAV (official)
 * อัปเดต SCBAM funds ที่มี Fund Code ตรงกับ NAV feed
 */
const NAV_SOURCE_URL = 'https://www.scbam.com/medias/inc/navmail.html';
const NAV_TAB = 'FundMaster';
const NAV_UPDATE_HOUR = 19; // Asia/Bangkok

function updateSCBAMNavs(){
  const sh = SpreadsheetApp.getActive().getSheetByName(NAV_TAB);
  if(!sh) throw new Error('ไม่พบชีต FundMaster');
  const values = sh.getDataRange().getValues();
  if(values.length < 2) return {updated:0, message:'FundMaster ยังไม่มีข้อมูล'};

  const feed = UrlFetchApp.fetch(NAV_SOURCE_URL, {
    muteHttpExceptions:true,
    headers:{'User-Agent':'Mozilla/5.0'}
  });
  if(feed.getResponseCode() !== 200) throw new Error('SCBAM NAV feed ตอบกลับ HTTP '+feed.getResponseCode());
  const html = feed.getContentText('UTF-8');
  const text = html.replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' | ')
    .replace(/&nbsp;/g,' ')
    .replace(/\s+/g,' ');

  const wanted = new Set();
  for(let r=1;r<values.length;r++) if(values[r][0]) wanted.add(String(values[r][0]).trim());

  const updates = {};
  const codeRe = /\(\s*([^()]+?)\s*\s*\)/g;
  // More reliable parser: search each code and take the nearest decimal NAV after it.
  wanted.forEach(code=>{
    if(!/^SCB/i.test(code)) return;
    const pos = text.indexOf('( '+code+' )') >= 0 ? text.indexOf('( '+code+' )') : text.indexOf('('+code+')');
    if(pos < 0) return;
    const chunk = text.slice(pos, pos+500);
    const nums = chunk.match(/\b\d{1,4}\.\d{4}\b/g) || [];
    if(!nums.length) return;
    const nav = Number(nums[0]);
    if(!isFinite(nav) || nav<=0) return;
    const dateMatch = chunk.match(/(\d{1,2})\s*(?:\/|-|\.)\s*(\d{1,2})\s*(?:\/|-|\.)\s*(\d{4})/);
    updates[code] = {nav:nav, date:dateMatch ? dateMatch[0] : Utilities.formatDate(new Date(), Session.getScriptTimeZone()||'Asia/Bangkok','dd/MM/yyyy')};
  });

  let count=0;
  const now = new Date();
  for(let r=1;r<values.length;r++){
    const code=String(values[r][0]||'').trim();
    const u=updates[code];
    if(!u) continue;
    // F: NAV, G: NAV Date, H: NAV Source
    sh.getRange(r+1,6,1,3).setValues([[u.nav,u.date,'SCBAM Official NAV feed']]);
    count++;
  }
  PropertiesService.getDocumentProperties().setProperty('NAV_LAST_UPDATE', now.toISOString());
  return {updated:count, at:now.toISOString()};
}

function setupNAVAutoUpdate(){
  ScriptApp.getProjectTriggers().forEach(t=>{
    if(t.getHandlerFunction()==='updateSCBAMNavs') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('updateSCBAMNavs').timeBased().everyDays(1).atHour(NAV_UPDATE_HOUR).create();
  updateSCBAMNavs();
}

function onOpen(){
  SpreadsheetApp.getUi().createMenu('My Family Funds')
    .addItem('อัปเดต NAV ตอนนี้','updateSCBAMNavs')
    .addItem('ตั้งเวลาอัปเดต NAV ทุกวัน','setupNAVAutoUpdate')
    .addToUi();
}
