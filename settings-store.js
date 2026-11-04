/* My Family Funds — ค่าตั้งต้นที่ต้องซิงก์ขึ้น Google Sheets (งบรายหมวด, รายการประจำ)
 * เก็บเป็นรายการ {id, value(JSON), updatedAt} ในแคช mff_settings_cache_v1 ให้ Smart Sync (หน้า Setting) ซิงก์ตามปกติ */
(function(){
  'use strict';
  var KEY='mff_settings_cache_v1', DIRTY='mff_sync_dirty_v1_settings', LEGACY_BUDGET='mff_daily_budget_v1';
  function all(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
  function put(list){ try{ localStorage.setItem(KEY,JSON.stringify(list)); }catch(e){} }
  function get(id,fallback){
    var r=all().filter(function(x){return x.id===id})[0]; if(!r) return fallback;
    try{ return JSON.parse(r.value); }catch(e){ return fallback; }
  }
  function core(v){ try{ var o=JSON.parse(JSON.stringify(v)); if(o&&typeof o==='object'&&!Array.isArray(o)) delete o.savedAt; return JSON.stringify(o); }catch(e){ return null; } }
  function set(id,val){
    var cur=all().filter(function(x){return x.id===id})[0];
    if(cur){ try{ var a=core(JSON.parse(cur.value)), b=core(val); if(a!==null&&a===b) return; }catch(e){} } /* ค่าเดิมไม่เปลี่ยน → ไม่ติดสถานะรอซิงก์ */
    var l=all().filter(function(x){return x.id!==id});
    l.push({id:id,value:JSON.stringify(val),updatedAt:new Date().toISOString()});
    put(l); try{ localStorage.setItem(DIRTY,'1'); }catch(e){}
  }
  /* ค่าที่ซิงก์มา → คีย์เดิมที่หน้าอื่นอ่านอยู่ (Home / รายจ่ายรายวัน) ; ครั้งแรกให้ย้ายงบเดิมในเครื่องเข้ามา */
  function hydrate(){
    /* งบรายวัน (budget) ถูกเอาออกจากแอปแล้ว — ไม่สร้าง/แก้ record 'budget' อีก เพื่อไม่ให้เกิดข้อมูลชนกันตอนซิงก์ */
  }
  window.MFFSettings={get:get,set:set,hydrate:hydrate};
})();
