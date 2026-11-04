/* My Information (ตู้เซฟ) — ซิงก์เฉพาะ "ข้อมูลที่เข้ารหัสแล้ว" (AES-GCM + PBKDF2) ขึ้น Google Sheets แท็บ AppSettings
   รหัสผ่านหลักและข้อมูลที่ถอดรหัสแล้วไม่ออกจากเครื่อง · โหลดไฟล์นี้ก่อนสคริปต์หลักของหน้า vault
   ความปลอดภัยของข้อมูลบน Sheets = ความแข็งแรงของรหัสผ่านหลัก (ใช้รหัสยาว ไม่ซ้ำกับที่อื่น) */
(function(){
'use strict';
var KEY='mff_vault_v1',ID='vault',CACHE='mff_settings_cache_v1',TS='mff_vault_sync_ts_v1',PREV='mff_vault_prev_v1',MAXLEN=45000,timer=null;
function ok(s){try{var j=JSON.parse(s);return !!(j&&j.v===1&&j.salt&&j.iv&&j.ct);}catch(e){return false;}}
function remote(){
  try{var l=JSON.parse(localStorage.getItem(CACHE)||'[]');var r=Array.isArray(l)?l.filter(function(x){return x&&x.id===ID;})[0]:null;
    return r&&ok(r.value)?{val:r.value,at:Date.parse(r.updatedAt)||0}:null;}catch(e){return null;}
}
function same(a,b){try{return JSON.stringify(JSON.parse(a))===JSON.stringify(JSON.parse(b));}catch(e){return a===b;}}
function toast(t){var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#072340;color:#fff;padding:9px 16px;border-radius:99px;font-size:12.5px;z-index:4000;max-width:90%;text-align:center';document.body.appendChild(d);setTimeout(function(){d.remove();},3500);}
var conflict=null;
(function hydrate(){
  try{
    var r=remote(); if(!r)return;
    var loc=localStorage.getItem(KEY), ts=Number(localStorage.getItem(TS))||0;
    if(!loc||!ok(loc)){localStorage.setItem(KEY,r.val);localStorage.setItem(TS,String(r.at));return;}      /* เครื่องใหม่ → ใช้ชุดจาก Sheets */
    if(same(loc,r.val)){localStorage.setItem(TS,String(r.at));return;}
    if(ts===0){conflict=r;return;}                                                                    /* ต่างชุดกันและยังไม่เคยจับคู่ → ให้ผู้ใช้เลือก ห้ามเขียนทับเอง */
    if(r.at>ts){localStorage.setItem(PREV,loc);localStorage.setItem(KEY,r.val);localStorage.setItem(TS,String(r.at));}  /* ชุดใหม่กว่าจากเครื่องอื่น (เก็บชุดเดิมไว้ที่ PREV) */
  }catch(e){}
})();
function push(){
  clearTimeout(timer);
  timer=setTimeout(function(){
    try{
      if(conflict||!window.MFFSettings)return;
      var s=localStorage.getItem(KEY); if(!s||!ok(s))return;
      if(s.length>MAXLEN){toast('ตู้เซฟใหญ่เกินกว่าจะซิงก์ได้ (ยังเก็บในเครื่องครบ)');return;}
      var r0=remote(); if(r0&&same(r0.val,s))return;
      MFFSettings.set(ID,JSON.parse(s));
      var r=remote(); if(r)localStorage.setItem(TS,String(r.at));
    }catch(e){}
  },1200);
}
function banner(){
  if(!conflict)return;
  var b=document.createElement('div');
  b.style.cssText='position:fixed;inset:auto 12px 12px 12px;z-index:5000;background:#FFF3C4;color:#4a3b00;border:1px solid #E5C95B;border-radius:16px;padding:12px 14px;font:500 12.5px/1.6 "Noto Sans Thai",sans-serif;box-shadow:0 8px 24px #0003';
  b.innerHTML='<b>พบตู้เซฟอีกชุดบน Google Sheets ที่ไม่ตรงกับในเครื่องนี้</b><br>ยังไม่ซิงก์เพื่อป้องกันข้อมูลหาย เลือกชุดที่จะใช้:<div style="display:flex;gap:8px;margin-top:8px"><button id="vsRemote" style="flex:1;min-height:40px;border:0;border-radius:11px;background:#0D5C7D;color:#fff;font-weight:700">ใช้ชุดบน Sheets</button><button id="vsLocal" style="flex:1;min-height:40px;border:0;border-radius:11px;background:#fff;color:#0D5C7D;font-weight:700;border:1px solid #0D5C7D">ใช้ชุดในเครื่อง</button></div><div style="margin-top:6px;font-size:11px">ชุดที่ไม่ได้เลือกในเครื่องนี้จะถูกเก็บสำรองไว้ ต้องใช้รหัสผ่านของแต่ละชุดในการเปิด</div>';
  document.body.appendChild(b);
  b.querySelector('#vsRemote').onclick=function(){try{localStorage.setItem(PREV,localStorage.getItem(KEY)||'');localStorage.setItem(KEY,conflict.val);localStorage.setItem(TS,String(conflict.at));}catch(e){} location.reload();};
  b.querySelector('#vsLocal').onclick=function(){try{var r=conflict;conflict=null;localStorage.setItem(TS,String(r.at));push();toast('กำลังส่งชุดในเครื่องขึ้น Sheets');b.remove();}catch(e){}};
}
window.MFFVaultSync={push:push};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',banner);else banner();
})();
