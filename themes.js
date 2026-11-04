/* My Family Funds — ระบบธีม (เก็บค่าในเครื่อง ไม่ซิงก์ขึ้น Sheets)
 * ใช้: MFFTheme.set('forest') / MFFTheme.get() / MFFTheme.list */
(function(){
  'use strict';
  var KEY='mff_theme_v1';
  var T={
    navy:  {name:'Navy (ค่าเริ่มต้น)',sw:['#072340','#F2F4F6'],meta:'#072340',v:null},
    ocean: {name:'Ocean ทะเล',sw:['#0B5F7A','#EEF6F8'],meta:'#0B5F7A',v:{primary:'#0B5F7A',light:'#2E94B0',soft:'#DDF0F5',bg:'#EEF6F8',line:'#D5E5EA'}},
    forest:{name:'Forest ป่าเขียว',sw:['#14532D','#F0F6F1'],meta:'#14532D',v:{primary:'#14532D',light:'#3F8F5F',soft:'#DDEEE3',bg:'#F0F6F1',line:'#D8E6DC'}},
    rose:  {name:'Rose กุหลาบ',sw:['#9D2449','#FAF1F3'],meta:'#9D2449',v:{primary:'#9D2449',light:'#C85A78',soft:'#F6DEE5',bg:'#FAF1F3',line:'#EBD8DE'}},
    violet:{name:'Violet ม่วง',sw:['#4C2A9A','#F4F1FB'],meta:'#4C2A9A',v:{primary:'#4C2A9A',light:'#7B5CCB',soft:'#E6DFF6',bg:'#F4F1FB',line:'#DED6EF'}},
    sand:  {name:'Sand ทอง',sw:['#7A5A1E','#FAF6EC'],meta:'#7A5A1E',v:{primary:'#7A5A1E',light:'#B08A3C',soft:'#F1E8D1',bg:'#FAF6EC',line:'#E8DFC8'}},
    dark:  {name:'Dark มืด',sw:['#7B9CFF','#12151C'],meta:'#12151C',dark:true,v:{primary:'#8FAEFF',light:'#6F8FE0',soft:'#222B42',bg:'#12151C',surface:'#1B1F29',ink:'#ECEFF5',inksoft:'#B4BBC9',inkfaint:'#7E8797',line:'#2B3140'}}
  };
  function css(id,t){
    var v=t.v; if(!v) return '';
    var s='html[data-theme="'+id+'"]{'
      +'--primary:'+v.primary+';--primary-light:'+v.light+';--primary-soft:'+v.soft+';--bg:'+v.bg+';--bg-deep:'+v.bg+';--line:'+v.line+';'
      +'--navy:'+v.primary+';--blue:'+v.light+';--cyan:'+v.soft+';--soft:'+v.soft;
    if(v.surface) s+=';--surface:'+v.surface+';--ink:'+v.ink+';--ink-soft:'+v.inksoft+';--ink-faint:'+v.inkfaint+';--muted:'+v.inksoft+';--mut:'+v.inksoft+';--white:'+v.surface+';--navy2:'+v.surface
      +';--shadow-card:0 2px 10px rgba(0,0,0,.35);--shadow-hero:0 4px 18px rgba(0,0,0,.4)';
    s+='}';
    if(t.dark){
      s+='html[data-theme="'+id+'"] body{background:'+v.bg+';color:'+v.ink+'}'
        +'html[data-theme="'+id+'"] input,html[data-theme="'+id+'"] select,html[data-theme="'+id+'"] textarea{background:'+v.surface+';color:'+v.ink+';border-color:'+v.line+'}'
        +'html[data-theme="'+id+'"] [style*="background:#fff"],html[data-theme="'+id+'"] [style*="background: #fff"],html[data-theme="'+id+'"] .mfr-btn,html[data-theme="'+id+'"] .mbk-goal{background:'+v.surface+'!important;color:'+v.ink+'!important}'
        +'html[data-theme="'+id+'"]{color-scheme:dark}';
    }
    return s;
  }
  function inject(){
    if(document.getElementById('mff-theme-css')) return;
    var all='';for(var k in T) all+=css(k,T[k]);
    var el=document.createElement('style');el.id='mff-theme-css';el.textContent=all;
    (document.head||document.documentElement).appendChild(el);
  }
  function get(){var t='navy';try{t=localStorage.getItem(KEY)||'navy';}catch(e){}return T[t]?t:'navy';}
  function apply(id){
    var t=T[id]||T.navy;
    document.documentElement.setAttribute('data-theme',id);
    var m=document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute('content',t.meta);
  }
  function set(id){
    if(!T[id]) id='navy';
    try{localStorage.setItem(KEY,id);}catch(e){}
    apply(id);
    try{window.dispatchEvent(new CustomEvent('mff-theme',{detail:id}));}catch(e){}
  }
  inject();
  apply(get());
  document.addEventListener('DOMContentLoaded',function(){apply(get());});
  window.addEventListener('storage',function(e){if(e.key===KEY)apply(get());});
  window.MFFTheme={get:get,set:set,list:T};
})();
