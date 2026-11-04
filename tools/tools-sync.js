/* My Tools — ซิงก์ข้อมูล สุขภาพ (mff_health_v1) และ คลังเสบียง (mff_supply_v1) ขึ้น Google Sheets
   ใช้ที่เก็บ AppSettings เดิมผ่าน MFFSettings (Smart Sync หน้า Setting) — ไม่สร้างแท็บใหม่
   โหลดไฟล์นี้ก่อน health.js / supply.js เพื่อดึงค่าที่ใหม่กว่าจากอีกเครื่องลง localStorage ก่อนหน้าเริ่มทำงาน */
(function(){
'use strict';
var MAP={mff_health_v1:'toolsHealth',mff_supply_v1:'toolsSupply'},CACHE='mff_settings_cache_v1',TS='mff_tools_sync_ts_v1_',MAXLEN=45000,timers={};
function remote(id){
  try{var l=JSON.parse(localStorage.getItem(CACHE)||'[]');var r=Array.isArray(l)?l.filter(function(x){return x&&x.id===id;})[0]:null;
    return r?{val:r.value,at:Date.parse(r.updatedAt)||0}:null;}catch(e){return null;}
}
Object.keys(MAP).forEach(function(k){
  try{
    var r=remote(MAP[k]); if(!r||!r.val)return;
    var loc=Number(localStorage.getItem(TS+k))||0;
    if(r.at>loc){JSON.parse(r.val);localStorage.setItem(k,r.val);localStorage.setItem(TS+k,String(r.at));}
  }catch(e){}
});
window.MFFToolsSync={push:function(key,obj){
  try{
    var id=MAP[key]; if(!id||!window.MFFSettings)return;
    var s=JSON.stringify(obj);
    if(s.length>MAXLEN){console.warn('MFFToolsSync: ข้อมูล '+key+' ใหญ่เกินไปสำหรับ 1 เซลล์ Sheets จึงยังไม่ซิงก์');return;}
    clearTimeout(timers[key]);
    timers[key]=setTimeout(function(){
      try{
        var r0=remote(id); if(r0&&r0.val===s)return;
        MFFSettings.set(id,obj);
        var r=remote(id); if(r)localStorage.setItem(TS+key,String(r.at));
      }catch(e){}
    },1200);
  }catch(e){}
}};
})();
