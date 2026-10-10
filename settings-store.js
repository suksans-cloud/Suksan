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
  function set(id,val){
    var l=all().filter(function(x){return x.id!==id});
    l.push({id:id,value:JSON.stringify(val),updatedAt:new Date().toISOString()});
    put(l); try{ localStorage.setItem(DIRTY,'1'); }catch(e){}
  }
  /* ค่าที่ซิงก์มา → คีย์เดิมที่หน้าอื่นอ่านอยู่ (Home / รายจ่ายรายวัน) ; ครั้งแรกให้ย้ายงบเดิมในเครื่องเข้ามา */
  function hydrate(){
    try{
      var b=all().filter(function(x){return x.id==='budget'})[0];
      if(b){ localStorage.setItem(LEGACY_BUDGET,b.value); return; }
      var raw=localStorage.getItem(LEGACY_BUDGET); if(!raw) return;
      var o=JSON.parse(raw);
      if(o&&(Number(o.total)>0||Object.keys(o.cats||{}).length)) set('budget',o);
    }catch(e){}
  }
  window.MFFSettings={get:get,set:set,hydrate:hydrate};
})();
