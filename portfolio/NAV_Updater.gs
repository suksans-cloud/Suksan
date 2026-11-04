/**
 * My Family Funds — NAV Auto Updater V57
 *
 * Google Sheets structure:
 *   FundMaster       = current/latest NAV used by My Funds
 *   FundNAV_History  = one row per fund per NAV date (history for charts/returns)
 *
 * Sources implemented:
 *   - SCBAM official Daily NAV feed
 *   - TALIS official NAV summary page
 *   - KKP NAV table published by Krungsri's mutual-fund NAV page
 * FundMaster is the live/current NAV source used by My Funds.
 * FundNAV_History stores one row per fund per NAV date.
 */
const NAV_SOURCE_URL_SCBAM = 'https://www.scbam.com/medias/inc/navmail.html';
const NAV_SOURCE_URL_TALIS = 'https://nav.talisam.co.th/index_NAV_Sum.jsp?p_lang=EN';
const NAV_SOURCE_URL_KKP = 'https://www.krungsri.com/th/personal/mutual-fund/net-asset-value';
const NAV_TAB = 'FundMaster';
const NAV_HISTORY_TAB = 'FundNAV_History';
const NAV_UPDATE_HOUR = 19; // Asia/Bangkok
const NAV_STATUS_TAB = 'NAV_Update_Log';

const NAV_SOURCE_URL_SCBAM_HISTORY = 'https://www.scbam.com/en/fund/nav-historical/';

function parseScbamHistoricalNav_(html, wanted){
  const text=cleanScbamHistoricalText_(html);
  const updates={};
  wanted.forEach(code=>{
    const escaped=String(code).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const codeRe=new RegExp('(?:^|[| ])'+escaped+'(?:[| ]|$)','i');
    const hit=codeRe.exec(text);
    if(!hit)return;
    // Find the group header containing this fund code, then inspect only the
    // dated rows until the next group header. The historical page presents
    // several funds together, with one NAV block per date.
    const before=text.slice(Math.max(0,hit.index-220),hit.index);
    const headerRel=before.lastIndexOf('Date');
    if(headerRel<0)return;
    const groupStart=Math.max(0,hit.index-220)+headerRel;
    const afterGroup=text.slice(groupStart);
    // Find the next group header by looking for a Date token whose next
    // character is a fund-code letter, not a numeric date. This avoids
    // confusing `Date 28/09/2026` with the next header.
    let nextHeader=-1, scan=5;
    while((scan=afterGroup.indexOf('Date ',scan))>=0){
      const ch=afterGroup.charAt(scan+5);
      if(ch && !/[0-9]/.test(ch)){ nextHeader=scan; break; }
      scan+=5;
    }
    const group=nextHeader>=0?afterGroup.slice(0,nextHeader):afterGroup;
    const rows=[];
    const dateRe=/Date\s+(\d{1,2}\/\d{1,2}\/\d{4})/gi;
    let dm;
    while((dm=dateRe.exec(group))){
      const dateText=dm[1];
      const block=group.slice(dm.index, dateRe.lastIndex+1200);
      const next=block.slice(10).search(/Date\s+\d{1,2}\/\d{1,2}\/\d{4}/i);
      const dated=next>=0?block.slice(0,next+10):block;
      const codePos=dated.search(new RegExp('(?:^|[| ])'+escaped+'(?:[| ]|$)','i'));
      if(codePos<0)continue;
      const tail=dated.slice(codePos+String(code).length,codePos+String(code).length+160);
      const nm=tail.match(/\b(\d{1,4}\.\d{4})\b/);
      if(!nm)continue;
      const nav=Number(nm[1]);
      if(nav>0)rows.push({dateText,dateKey:normalizeNavDate_(dateText),nav});
    }
    if(rows.length)updates[code]=rows;
  });
  return updates;
}

function backfillScbamNavHistory(){
  const ctx=collectFundMasterRows_();
  const wanted=ctx.rows.filter(x=>x.manager==='SCBAM').map(x=>x.code);
  if(!wanted.length)return {history:0,dates:0,updatedFunds:0};
  const html=fetchText_(NAV_SOURCE_URL_SCBAM_HISTORY);
  const parsed=parseScbamHistoricalNav_(html,wanted);
  const historySh=ensureNavHistorySheet_();
  const existing=historySh.getLastRow()>1?historySh.getRange(2,1,historySh.getLastRow()-1,8).getValues():[];
  const keys=new Set(existing.map(r=>navDateKey_(r[0])+'|'+String(r[1]).trim()));
  const tz=Session.getScriptTimeZone()||'Asia/Bangkok';
  const updatedAt=Utilities.formatDate(new Date(),tz,"yyyy-MM-dd'T'HH:mm:ssXXX");
  const rows=[]; let funds=0; const dateSet=new Set();
  wanted.forEach(code=>{
    const arr=(parsed[code]||[]).sort((a,b)=>String(a.dateKey).localeCompare(String(b.dateKey))).slice(-10);
    if(arr.length)funds++;
    arr.forEach(u=>{
      const key=u.dateKey+'|'+code;
      if(keys.has(key))return;
      rows.push([u.dateKey,code,u.nav,'','','SCBAM Official NAV historical',updatedAt,u.dateText]);
      keys.add(key); dateSet.add(u.dateKey);
    });
  });
  if(rows.length)historySh.getRange(historySh.getLastRow()+1,1,rows.length,8).setValues(rows);
  return {history:rows.length,dates:dateSet.size,updatedFunds:funds};
}

function backfillScbamNavHistoryNow(){
  const ui=SpreadsheetApp.getUi();
  try{
    const r=backfillScbamNavHistory();
    ui.alert('SCBAM NAV History',
      'เติมประวัติ NAV สำเร็จ\n\nกองทุนที่พบ: '+(r.updatedFunds||0)+' กองทุน\nแถวใหม่ที่เพิ่ม: '+(r.history||0)+' แถว\nวันที่ใหม่: '+(r.dates||0)+' วัน',
      ui.ButtonSet.OK);
    return r;
  }catch(e){
    logNavRun_('ERROR',0,0,'backfillScbamNavHistory',String(e&&e.message||e));
    ui.alert('SCBAM NAV History Error',String(e&&e.message||e),ui.ButtonSet.OK);
    throw e;
  }
}

function ensureNavStatusSheet_(){
  const ss=SpreadsheetApp.getActive();
  let sh=ss.getSheetByName(NAV_STATUS_TAB);
  if(!sh) sh=ss.insertSheet(NAV_STATUS_TAB);
  if(sh.getLastRow()===0){ sh.getRange(1,1,1,6).setValues([['Updated At','Status','Updated Funds','History Rows','Details','Last Error']]); sh.setFrozenRows(1); }
  return sh;
}

function logNavRun_(status, updated, history, details, error){
  const sh=ensureNavStatusSheet_();
  sh.appendRow([new Date(),status,updated||0,history||0,details||'',error||'']);
}

// V73: Sheets converts "2026-09-29" typed into column A to a real Date. getValues() then returns
// a Date object, and String(Date) never equals "2026-09-29", so the duplicate check below never
// matched and every run appended the whole NAV list again. Always normalise to yyyy-MM-dd.
function navDateKey_(v){
  if(v instanceof Date && !isNaN(v)) return Utilities.formatDate(v,Session.getScriptTimeZone()||'Asia/Bangkok','yyyy-MM-dd');
  return String(v||'').trim().slice(0,10);
}

// Run once from the Apps Script editor to delete the duplicate rows already in FundNAV_History.
// Keeps the LATEST row (by Updated At) for each Date + Fund Code. Backs up nothing - duplicate a
// copy of the sheet first if you want a safety net.
function dedupeNavHistoryNow(){
  const sh=ensureNavHistorySheet_();
  const n=sh.getLastRow()-1; if(n<1) return 0;
  const rng=sh.getRange(2,1,n,8), vals=rng.getValues();
  const best=new Map();
  vals.forEach((r,i)=>{
    const k=navDateKey_(r[0])+'|'+String(r[1]).trim();
    const cur=best.get(k);
    if(!cur || String(r[6])>=String(vals[cur.i][6])) best.set(k,{i});
  });
  const keep=[...best.values()].map(x=>x.i).sort((a,b)=>a-b).map(i=>{const r=vals[i].slice();r[0]=navDateKey_(r[0]);return r;});
  keep.sort((a,b)=>String(a[0]).localeCompare(String(b[0]))||String(a[1]).localeCompare(String(b[1])));
  rng.clearContent();
  sh.getRange(2,1,keep.length,8).setValues(keep);
  Logger.log('FundNAV_History: '+vals.length+' -> '+keep.length+' rows');
  return vals.length-keep.length;
}

function ensureNavHistorySheet_(){
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(NAV_HISTORY_TAB);
  if(!sh) sh = ss.insertSheet(NAV_HISTORY_TAB);
  if(sh.getLastRow() === 0){
    sh.getRange(1,1,1,8).setValues([[
      'Date','Fund Code','NAV','Change','Change %','Source','Updated At','NAV Date Text'
    ]]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function normalizeNavDate_(dateText){
  const s = String(dateText || '').trim();
  // Keep the source text for display, but return a stable key for de-duplication.
  const m = s.match(/(\d{1,2})\s*(?:\/|-|\.)\s*(\d{1,2})\s*(?:\/|-|\.)\s*(\d{4})/);
  if(!m) return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Bangkok','yyyy-MM-dd');
  let y=Number(m[3]); if(y>2400)y-=543; return y+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');
}

function parseScbamNavFeed_(html, wanted){
  const text = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' | ')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/\s+/g,' ');

  const updates = {};
  wanted.forEach(code=>{
    if(!/^SCB/i.test(code)) return;
    // The SCBAM feed commonly renders the code as (CODE). Accept optional spaces.
    const escaped = String(code).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re = new RegExp('\\(\\s*'+escaped+'\\s*\\)','i');
    const hit = re.exec(text);
    if(!hit) return;
    const chunk = text.slice(hit.index, hit.index + 800);
    const nums = chunk.match(/\b\d{1,4}\.\d{4}\b/g) || [];
    if(!nums.length) return;
    const nav = Number(nums[0]);
    if(!isFinite(nav) || nav <= 0) return;
    const dateMatch = chunk.match(/(\d{1,2})\s*(?:\/|-|\.)\s*(\d{1,2})\s*(?:\/|-|\.)\s*(\d{4})/);
    const dateText = dateMatch ? dateMatch[0] : Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Bangkok','dd/MM/yyyy');
    updates[code] = {nav:nav,dateText:dateText,dateKey:normalizeNavDate_(dateText)};
  });
  return updates;
}

function fetchText_(url){
  const r=UrlFetchApp.fetch(url,{muteHttpExceptions:true,headers:{'User-Agent':'Mozilla/5.0'}});
  if(r.getResponseCode()!==200) throw new Error('NAV source HTTP '+r.getResponseCode()+': '+url);
  return r.getContentText('UTF-8');
}

function cleanScbamHistoricalText_(html){
  return String(html||'')
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    // Recent SCBAM historical NAV values may be inside image attributes.
    .replace(/<img\b[^>]*(?:alt|title|data-value|value)\s*=\s*[\"']([^\"']+)[\"'][^>]*>/gi,' $1 ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&#39;/gi,"'")
    .replace(/&quot;/gi,'"')
    .replace(/\s+/g,' ')
    .trim();
}

function cleanHtmlText_(html){
  return String(html||'')
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    // SCBAM's NAV Historical page renders some of the newest NAV values
    // inside <img> tags. Keep common value-bearing attributes before stripping
    // the remaining HTML, otherwise recent dates can disappear from History.
    .replace(/<img\b[^>]*(?:alt|title|data-value|value)\s*=\s*[\"']([^\"']+)[\"'][^>]*>/gi,' $1 ')
    .replace(/<[^>]+>/g,' | ')
    .replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&')
    .replace(/&#39;/gi,"'")
    .replace(/&quot;/gi,'"')
    .replace(/\s+/g,' ');
}

function parseManagerTable_(html,wanted,managerName){
  const text=cleanHtmlText_(html);
  const updates={};
  wanted.forEach(code=>{
    const escaped=String(code).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    let re;
    if(managerName==='TALIS') re=new RegExp('(?:^|[| ])'+escaped+'(?:[| ]|$)','i');
    else re=new RegExp('(?:^|[| ])'+escaped.replace(/ /g,'\\s*')+'(?:[| ]|$)','i');
    const hit=re.exec(text); if(!hit)return;
    const chunk=text.slice(Math.max(0,hit.index-80),hit.index+900);
    // Both pages place NAV and NAV date close to the fund code. Prefer a decimal
    // immediately after the code; otherwise use the first plausible 4-decimal NAV.
    const after=text.slice(hit.index,hit.index+450);
    const nums=after.match(/\b\d{1,4}\.\d{4}\b/g)||[];
    if(!nums.length)return;
    const nav=Number(nums[0]); if(!isFinite(nav)||nav<=0)return;
    const dm=chunk.match(/(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{2,4})/);
    let dateText=dm?dm[0]:Utilities.formatDate(new Date(),Session.getScriptTimeZone()||'Asia/Bangkok','dd/MM/yyyy');
    // Krungsri uses Buddhist year; normalizeNavDate_ accepts 4 digits but stores the source text.
    updates[code]={nav:nav,dateText:dateText,dateKey:normalizeNavDate_(dateText)};
  });
  return updates;
}

function collectFundMasterRows_(){
  const ss=SpreadsheetApp.getActive(); const sh=ss.getSheetByName(NAV_TAB);
  if(!sh)throw new Error('ไม่พบชีต FundMaster');
  const values=sh.getDataRange().getValues();
  const rows=[];
  for(let r=1;r<values.length;r++){
    const code=String(values[r][0]||'').trim();
    const manager=String(values[r][3]||'').trim().toUpperCase();
    if(code)rows.push({row:r+1,code,manager,oldNav:Number(values[r][5])});
  }
  return {sh,values,rows};
}

function writeNavUpdates_(ctx,updates,sourceLabel){
  const historySh=ensureNavHistorySheet_();
  const now=new Date(); const tz=Session.getScriptTimeZone()||'Asia/Bangkok';
  const updatedAt=Utilities.formatDate(now,tz,"yyyy-MM-dd'T'HH:mm:ssXXX");
  const existing=historySh.getLastRow()>1?historySh.getRange(2,1,historySh.getLastRow()-1,8).getValues():[];
  const keys=new Set(existing.map(r=>navDateKey_(r[0])+'|'+String(r[1]).trim()));
  const historyRows=[]; let count=0;
  ctx.rows.forEach(item=>{
    const u=updates[item.code]; if(!u)return;
    const oldNav=isFinite(item.oldNav)&&item.oldNav>0?item.oldNav:null;
    const change=oldNav===null?'':u.nav-oldNav;
    const changePct=oldNav===null?'':(change/oldNav*100);
    ctx.sh.getRange(item.row,6,1,3).setValues([[u.nav,u.dateText,sourceLabel]]);
    count++;
    const key=u.dateKey+'|'+item.code;
    if(!keys.has(key)){
      historyRows.push([u.dateKey,item.code,u.nav,change,changePct,sourceLabel,updatedAt,u.dateText]);
      keys.add(key);
    }
  });
  if(historyRows.length)historySh.getRange(historySh.getLastRow()+1,1,historyRows.length,8).setValues(historyRows);
  return {updated:count,history:historyRows.length};
}

function updateAllNAVs(){
  const started=new Date();
  const ctx=collectFundMasterRows_();
  if(!ctx.rows.length){ logNavRun_('NO_DATA',0,0,'FundMaster ยังไม่มีข้อมูล',''); return {updated:0,history:0,message:'FundMaster ยังไม่มีข้อมูล'}; }
  let totalUpdated=0,totalHistory=0;

  // SCBAM
  try{
    const wanted=ctx.rows.filter(x=>x.manager==='SCBAM').map(x=>x.code);
    if(wanted.length){
      const u=parseScbamNavFeed_(fetchText_(NAV_SOURCE_URL_SCBAM),wanted);
      const r=writeNavUpdates_(ctx,u,'SCBAM Official NAV feed'); totalUpdated+=r.updated;totalHistory+=r.history;
      // Also backfill recent official SCBAM history so DCA/return calculations
      // do not have to wait several days after a new fund is added.
      try{ const b=backfillScbamNavHistory(); totalHistory+=b.history||0; }
      catch(e){ Logger.log('SCBAM historical backfill failed: '+e); }
    }
  }catch(e){Logger.log('SCBAM update failed: '+e);}

  // TALIS
  try{
    const wanted=ctx.rows.filter(x=>x.manager==='TALIS').map(x=>x.code);
    if(wanted.length){
      const u=parseManagerTable_(fetchText_(NAV_SOURCE_URL_TALIS),wanted,'TALIS');
      const r=writeNavUpdates_(ctx,u,'TALIS Official NAV summary'); totalUpdated+=r.updated;totalHistory+=r.history;
    }
  }catch(e){Logger.log('TALIS update failed: '+e);}

  // KKPAM. The public NAV table is hosted on Krungsri's site and may not publish
  // every KKP fund every day. Missing rows are intentionally left unchanged.
  try{
    const wanted=ctx.rows.filter(x=>x.manager==='KKPAM').map(x=>x.code);
    if(wanted.length){
      const u=parseManagerTable_(fetchText_(NAV_SOURCE_URL_KKP),wanted,'KKPAM');
      const r=writeNavUpdates_(ctx,u,'KKP NAV table'); totalUpdated+=r.updated;totalHistory+=r.history;
    }
  }catch(e){Logger.log('KKP update failed: '+e);}

  const now=new Date();
  PropertiesService.getDocumentProperties().setProperty('NAV_LAST_UPDATE',now.toISOString());
  logNavRun_(totalUpdated>0?'SUCCESS':'NO_UPDATE',totalUpdated,totalHistory,'SCBAM + TALIS + KKPAM', '');
  return {updated:totalUpdated,history:totalHistory,at:now.toISOString(),started:started.toISOString()};
}

// Backward-compatible menu/function name.
function updateSCBAMNavs(){ return updateAllNAVs(); }

function updateNAVNow(){
  const ui=SpreadsheetApp.getUi();
  try{
    const r=updateAllNAVs();
    ui.alert('NAV Update', 'อัปเดตสำเร็จ\n\nกองทุนที่อัปเดต: '+(r.updated||0)+' กองทุน\nประวัติที่เพิ่ม: '+(r.history||0)+' แถว', ui.ButtonSet.OK);
  }catch(e){
    logNavRun_('ERROR',0,0,'updateNAVNow',String(e&&e.message||e));
    ui.alert('NAV Update Error', String(e&&e.message||e), ui.ButtonSet.OK);
    throw e;
  }
}

function setupNAVAutoUpdate(){
  ScriptApp.getProjectTriggers().forEach(t=>{
    const fn=t.getHandlerFunction();
    if(fn==='updateSCBAMNavs'||fn==='updateAllNAVs')ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('updateAllNAVs').timeBased().everyDays(1).atHour(NAV_UPDATE_HOUR).create();
  const r=updateAllNAVs();
  try{ SpreadsheetApp.getUi().alert('ตั้งค่า NAV สำเร็จ','ตั้ง Auto Update ทุกวันเรียบร้อยแล้ว\nอัปเดตครั้งแรก: '+(r.updated||0)+' กองทุน',SpreadsheetApp.getUi().ButtonSet.OK); }catch(e){}
  return r;
}

function onOpen(){
  SpreadsheetApp.getUi().createMenu('My Funds NAV')
    .addItem('🔄 อัปเดต NAV ตอนนี้','updateNAVNow')
    .addItem('⚙️ ตั้ง Auto Update ทุกวัน','setupNAVAutoUpdate')
    .addSeparator()
    .addItem('📊 เปิด NAV History','openNAVHistory_')
    .addItem('📝 บันทึก NAV ปัจจุบันลง History','recordCurrentNAVToHistory')
    .addItem('📥 เติม NAV History ย้อนหลัง (SCBAM)','backfillScbamNavHistoryNow')
    .addItem('🧾 เปิด NAV Update Log','openNAVLog_')
    .addToUi();
}


function recordCurrentNAVToHistory_(){
  const ctx=collectFundMasterRows_();
  const historySh=ensureNavHistorySheet_();
  const now=new Date(); const tz=Session.getScriptTimeZone()||'Asia/Bangkok';
  const dateKey=Utilities.formatDate(now,tz,'yyyy-MM-dd');
  const updatedAt=Utilities.formatDate(now,tz,"yyyy-MM-dd'T'HH:mm:ssXXX");
  const existing=historySh.getLastRow()>1?historySh.getRange(2,1,historySh.getLastRow()-1,8).getValues():[];
  const keys=new Set(existing.map(r=>navDateKey_(r[0])+'|'+String(r[1]).trim()));
  const rows=[];
  ctx.rows.forEach(item=>{
    const nav=Number(item.oldNav); if(!(nav>0))return;
    const key=dateKey+'|'+item.code; if(keys.has(key))return;
    rows.push([dateKey,item.code,nav,'','',String(ctx.values[item.row-1]?.[7]||'Manual FundMaster snapshot'),updatedAt,String(ctx.values[item.row-1]?.[6]||dateKey)]);
  });
  if(rows.length)historySh.getRange(historySh.getLastRow()+1,1,rows.length,8).setValues(rows);
  return {history:rows.length,date:dateKey};
}
function recordCurrentNAVToHistory(){
  const r=recordCurrentNAVToHistory_();
  try{SpreadsheetApp.getUi().alert('NAV History','บันทึก NAV ปัจจุบันลง History แล้ว '+r.history+' รายการ\nวันที่ '+r.date,SpreadsheetApp.getUi().ButtonSet.OK);}catch(e){}
  return r;
}

function openNAVHistory_(){ const sh=ensureNavHistorySheet_(); SpreadsheetApp.setActiveSheet(sh); }
function openNAVLog_(){ const sh=ensureNavStatusSheet_(); SpreadsheetApp.setActiveSheet(sh); }

function onInstall(e){ onOpen(e); }
