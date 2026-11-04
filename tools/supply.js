/* My Tools — คลังเสบียงฉุกเฉิน
   ข้อมูลเก็บในเครื่อง (localStorage คีย์ mff_supply_v1) และซิงก์ขึ้น Sheets แท็บ AppSettings ผ่าน tools-sync.js + Smart Sync
   ปริมาณที่แนะนำเป็นค่าประมาณเพื่อวางแผน ปรับให้ตรงกับบ้านได้ทุกรายการ */
(function(){
'use strict';
var root=document.getElementById('supBody');
if(!root)return;
var LS='mff_supply_v1';

/* ---------- ข้อมูลรายการ ---------- */
var CATS=[
 {id:'water',name:'น้ำดื่ม',ic:'💧',tone:'#2E86C1'},
 {id:'food',name:'อาหารหลัก',ic:'🍚',tone:'#C98516'},
 {id:'snack',name:'ของกินเสริม',ic:'🥛',tone:'#B9770E'},
 {id:'power',name:'ไฟและพลังงาน',ic:'🔦',tone:'#D4AC0D'},
 {id:'med',name:'ยาและปฐมพยาบาล',ic:'💊',tone:'#CB4335'},
 {id:'hygiene',name:'สุขอนามัย',ic:'🧼',tone:'#17A589'},
 {id:'safety',name:'ป้องกันภัย',ic:'🦺',tone:'#E67E22'},
 {id:'cash',name:'เงินและเอกสาร',ic:'💵',tone:'#1F9D6C'},
 {id:'other',name:'อื่น ๆ',ic:'📦',tone:'#7F8C8D'}
];
var CATIDS={};CATS.forEach(function(c){CATIDS[c.id]=c});
var BASE=[
 {id:'water1',cat:'water',name:'น้ำดื่มขวดใหญ่',unit:'ขวด',kind:'water',rate:0},
 {id:'rice',cat:'food',name:'ข้าวสาร',unit:'กก.',kind:'ppd',rate:0.2,step:1},
 {id:'fish',cat:'food',name:'ปลากระป๋อง',unit:'กระป๋อง',kind:'ppd',rate:0.5},
 {id:'noodle',cat:'food',name:'บะหมี่กึ่งสำเร็จรูป',unit:'ซอง',kind:'ppd',rate:0.5},
 {id:'ready',cat:'food',name:'อาหารพร้อมรับประทาน',unit:'ซอง',kind:'ppd',rate:0.5},
 {id:'milk',cat:'food',name:'นม',unit:'กล่อง',kind:'ppd',rate:1,note:'นม UHT เก็บได้นาน'},
 {id:'cracker',cat:'food',name:'ขนมปังกรอบ',unit:'ห่อ',kind:'ppd',rate:0.25},
 {id:'nuts',cat:'food',name:'ถั่วและอาหารแห้ง',unit:'ถุง',kind:'ppd',rate:0.15},
 {id:'oat',cat:'food',name:'ข้าวโอ๊ต',unit:'ถุง',kind:'fix',rate:2},
 {id:'season',cat:'food',name:'เครื่องปรุงพื้นฐาน',unit:'ชุด',kind:'fix',rate:1},
 {id:'flash',cat:'power',name:'ไฟฉาย',unit:'อัน',kind:'pp',rate:0.5},
 {id:'batt',cat:'power',name:'ถ่านสำรอง',unit:'ชุด',kind:'fix',rate:4,note:'ให้ตรงกับขนาดของไฟฉายและวิทยุ'},
 {id:'whistle',cat:'power',name:'นกหวีดฉุกเฉิน',unit:'อัน',kind:'pp',rate:1},
 {id:'plaster',cat:'med',name:'พลาสเตอร์และผ้าก๊อซ',unit:'ชุด',kind:'fix',rate:2},
 {id:'saline',cat:'med',name:'น้ำเกลือล้างแผล',unit:'ขวด',kind:'fix',rate:3},
 {id:'meds',cat:'med',name:'ยาสามัญพื้นฐาน',unit:'ชุด',kind:'fix',rate:1,note:'ยาประจำตัวและยาตามแพทย์สั่งให้เตรียมแยกตามความจำเป็น'},
 {id:'soap',cat:'med',name:'สบู่',unit:'ก้อน',kind:'pp',rate:1},
 {id:'tooth',cat:'med',name:'ยาสีฟัน',unit:'หลอด',kind:'fix',rate:2},
 {id:'tp',cat:'med',name:'กระดาษชำระ',unit:'ม้วน',kind:'ppd',rate:0.3},
 {id:'wipe',cat:'med',name:'ทิชชู่เปียก',unit:'ห่อ',kind:'pp',rate:1},
 {id:'gel',cat:'med',name:'เจลล้างมือ',unit:'ขวด',kind:'fix',rate:2},
 {id:'repel',cat:'med',name:'ยากันยุง',unit:'ขวด',kind:'fix',rate:2},
 {id:'zip',cat:'safety',name:'ถุงซิปถุงกันน้ำ',unit:'ชุด',kind:'fix',rate:2,note:'ใส่เอกสารสำคัญ'},
 {id:'trash',cat:'safety',name:'ถุงขยะขนาดใหญ่',unit:'ม้วน',kind:'fix',rate:3},
 {id:'mask',cat:'safety',name:'หน้ากากป้องกันฝุ่น',unit:'ชุด',kind:'pp',rate:1},
 {id:'gloves',cat:'safety',name:'ถุงมือทำงาน',unit:'คู่',kind:'pp',rate:1},
 {id:'cash',cat:'cash',name:'เงินสดฉุกเฉิน',unit:'บาท',kind:'ppd',rate:200,step:500,note:'เก็บแยกไว้ ใช้เมื่อ ATM หรือระบบชำระเงินอิเล็กทรอนิกส์ขัดข้อง'},
 {id:'pbank',cat:'extra',name:'พาวเวอร์แบงก์',unit:'ก้อน',kind:'fix',rate:2,note:'สำรองไฟให้โทรศัพท์'},
 {id:'radio',cat:'extra',name:'วิทยุฉุกเฉินแบบใช้ถ่านมือหมุน',unit:'เครื่อง',kind:'fix',rate:1,note:'รับฟังข่าวสารเมื่อไฟฟ้าหรืออินเทอร์เน็ตขัดข้อง'},
 {id:'fan',cat:'extra',name:'พัดลมแบตเตอรี่',unit:'เครื่อง',kind:'fix',rate:1,note:'ช่วยคลายร้อน'},
 {id:'stove',cat:'extra',name:'เตาแก๊สพกพาและภาชนะ',unit:'ชุด',kind:'fix',rate:1,note:'ประกอบอาหาร ใช้ในที่โล่งเท่านั้น'},
 {id:'ext',cat:'extra',name:'ถังดับเพลิง',unit:'ถัง',kind:'fix',rate:1,note:'เตรียมรับมือเหตุเพลิงไหม้'},
 {id:'vest',cat:'extra',name:'เสื้อชูชีพและรองเท้าบูท',unit:'ชุด',kind:'pp',rate:1,note:'เหมาะกับพื้นที่เสี่ยงน้ำท่วม ข้ามได้ถ้าไม่เกี่ยวข้อง'},
 {id:'solar',cat:'extra',name:'แผงโซลาร์เซลล์พกพา',unit:'แผง',kind:'fix',rate:1,note:'เพิ่มทางเลือกสำรองพลังงาน'}
];
/* จัดหมวดใหม่ให้กระชับ (ข้อมูลที่บันทึกไว้ผูกกับ id ของรายการ จึงไม่กระทบ) */
var MOVE={milk:'snack',cracker:'snack',nuts:'snack',season:'snack',
 pbank:'power',radio:'power',fan:'power',solar:'power',stove:'power',
 soap:'hygiene',tooth:'hygiene',tp:'hygiene',wipe:'hygiene',gel:'hygiene',repel:'hygiene',
 whistle:'safety',ext:'safety',vest:'safety',zip:'cash'};
BASE.forEach(function(it){if(MOVE[it.id])it.cat=MOVE[it.id]});
var KIND={ppd:'ต่อคนต่อวัน',pp:'ต่อคน',fix:'รวมทั้งครอบครัว'};
var STEPS=['นับจำนวนของแต่ละรายการ (เปิดทีละหมวดในภาพรวม)','ตรวจวันหมดอายุ','ทดลองไฟฉายและวิทยุ','ตรวจแบตเตอรี่พาวเวอร์แบงก์','ตรวจเอกสารและซองกันน้ำ','เติมหรือหมุนเวียนรายการที่ขาดหรือใกล้หมดอายุ'];
var CHECKS=[
 {g:'น้ำและอาหาร',l:['น้ำดื่มเพียงพอและเก็บในที่เหมาะสม','อาหารไม่หมดอายุ บรรจุภัณฑ์ไม่บวมรั่ว','มีอาหารที่กินได้โดยไม่ต้องใช้ไฟฟ้า','มีแผนน้ำสำหรับสุขอนามัยแยกจากน้ำดื่ม']},
 {g:'ไฟฟ้าและการสื่อสาร',l:['ไฟฉายใช้งานได้','ถ่านสำรองตรงกับอุปกรณ์','โทรศัพท์และพาวเวอร์แบงก์ชาร์จพร้อม','มีสายชาร์จและวิทยุใช้งานได้']},
 {g:'ยาและสุขอนามัย',l:['ชุดปฐมพยาบาลครบ','ยาประจำตัวเพียงพอ','มีสบู่ เจลล้างมือ และกระดาษชำระ','มีอุปกรณ์ป้องกันยุงและหน้ากาก']},
 {g:'เอกสารและความปลอดภัย',l:['เอกสารสำคัญใส่ซองกันน้ำ','มีเงินสดสำรอง','สมาชิกทราบเบอร์ฉุกเฉินและจุดนัดพบ','รู้เส้นทางอพยพและวิธีตัดไฟแก๊สอย่างปลอดภัย']}
];
var CAUTIONS=[
 'น้ำดื่มเป็นปริมาณสำหรับดื่มเป็นหลัก ไม่ใช่น้ำรวมสำหรับอาบน้ำและทำความสะอาด ควรวางแผนน้ำเพิ่มเติม',
 'ห้ามใช้เตาแก๊ส เตาถ่าน หรือเครื่องกำเนิดไฟฟ้าในห้องปิด เสี่ยงไฟไหม้และก๊าซคาร์บอนมอนอกไซด์',
 'อย่าลุยน้ำท่วมที่อาจมีกระแสไฟฟ้ารั่ว และอย่าสัมผัสอุปกรณ์ไฟฟ้าขณะตัวเปียก',
 'เก็บยาให้พ้นมือเด็ก ตรวจวันหมดอายุ และใช้ยาตามฉลากหรือคำแนะนำบุคลากรทางการแพทย์',
 'หากมีเด็ก ผู้สูงอายุ ผู้ป่วย หรือสัตว์เลี้ยง ให้เพิ่มอาหาร ยา และของใช้เฉพาะตามความต้องการ'
];
var TABS=[['overview','ภาพรวม','◫'],['buy','สรุปที่ขาด','＋'],['check','ตรวจสต๊อก','✓'],['more','ตั้งค่า','⚙']];

/* ---------- ตัวช่วย ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function r2(n){return Math.round(n*100)/100}
function num(v){var n=parseFloat(v);return isFinite(n)&&n>=0?n:0}
function pad(n){return n<10?'0'+n:''+n}
function todayStr(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parseD(s){var p=String(s).split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function fmtD(s){if(!s)return '-';return parseD(s).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'})}
function addMonths(s,n){var p=s.split('-').map(Number);var d=new Date(p[0],p[1]-1+n,p[2]);if(d.getDate()!==p[2])d=new Date(p[0],p[1]+n,0);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function diffDays(a,b){return Math.round((parseD(a)-parseD(b))/864e5)}
function money(n){return Math.round(n).toLocaleString('th-TH')+' บาท'}
function qty(n){return r2(n).toLocaleString('th-TH',{maximumFractionDigits:2})}
function days1(n){return qty(Math.floor(n*10+1e-9)/10)}

/* ---------- สถานะ ---------- */
function defaults(){return{v:1,configured:false,settings:{people:4,days:7,months:3,waterL:3.5,bottleL:6},items:{},custom:[],checks:[],lastCheck:'',startedAt:todayStr(),checklist:{},steps:{}}}
function normalize(d){
  var b=defaults();d=d||{};
  return{v:1,configured:!!d.configured,settings:Object.assign({},b.settings,d.settings||{}),items:d.items||{},custom:d.custom||[],checks:d.checks||[],lastCheck:d.lastCheck||'',startedAt:d.startedAt||b.startedAt,checklist:d.checklist||{},steps:d.steps||{}};
}
var state=defaults();
try{var raw=localStorage.getItem(LS);if(raw)state=normalize(JSON.parse(raw))}catch(e){}
var ui={tab:'overview',cat:'',filter:'all',open:{},addCat:'',copyText:'',flash:'',scrollTo:'',backup:''};
function touch(){try{localStorage.setItem(LS,JSON.stringify(state))}catch(e){} try{window.MFFToolsSync&&MFFToolsSync.push(LS,state)}catch(e){}}

/* ---------- คำนวณ ---------- */
function items(){
  return BASE.concat(state.custom).map(function(it){
    var o=state.items[it.id]||{};
    return Object.assign({},it,{cat:CATIDS[it.cat]?it.cat:'other',kind:o.kind||it.kind,rate:o.rate!=null?o.rate:it.rate,have:o.have||0,price:o.price||0,expiry:o.expiry||'',note2:o.note||'',skip:!!o.skip,custom:!!it.custom});
  });
}
function getView(id){return items().filter(function(v){return v.id===id})[0]}
function target(v){
  if(v.skip)return 0;
  var s=state.settings,t;
  if(v.kind==='water')t=s.people*s.days*s.waterL/s.bottleL;
  else if(v.kind==='ppd')t=v.rate*s.people*s.days;
  else if(v.kind==='pp')t=v.rate*s.people;
  else t=v.rate;
  return Math.ceil(t-1e-9);
}
function status(v){
  if(v.skip)return 'skip';
  var t=target(v);
  if(t<=0||v.have>=t)return 'ok';
  return v.have<=0?'none':'low';
}
function stats(){
  var by={};CATS.forEach(function(c){by[c.id]={n:0,ok:0,sum:0,buy:0,full:0,short:[]}});
  var n=0,ok=0,sum=0,buy=0,full=0,anyPrice=false,short=[];
  items().forEach(function(v){
    if(v.skip)return;var t=target(v);if(t<=0)return;var c=by[v.cat];if(!c)return;
    var r=Math.min(1,v.have/t),sh=r2(Math.max(0,t-v.have));
    c.n++;c.sum+=r;n++;sum+=r;
    if(sh===0){c.ok++;ok++}else{var rec={v:v,t:t,sh:sh};c.short.push(rec);short.push(rec)}
    if(v.id!=='cash'){
      c.buy+=sh*v.price;c.full+=t*v.price;buy+=sh*v.price;full+=t*v.price;
      if(v.price>0)anyPrice=true;
    }
  });
  return{by:by,n:n,ok:ok,pct:n?Math.round(sum/n*100):0,buy:buy,full:full,anyPrice:anyPrice,short:short};
}
/* น้ำและอาหารพออยู่ได้กี่วัน (ประมาณ) */
function coverage(){
  var s=state.settings,w=getView('water1'),water=null,food=null;
  if(w&&!w.skip&&s.people*s.waterL>0)water=w.have*s.bottleL/(s.people*s.waterL);
  var list=items().filter(function(v){return (v.cat==='food'||v.cat==='snack')&&!v.skip&&v.kind==='ppd'&&v.rate>0});
  if(list.length){
    var sum=0;list.forEach(function(v){sum+=Math.min(v.have/(v.rate*s.people),s.days*2)});
    food=sum/list.length;
  }
  return{water:water,food:food};
}
function nextDue(){
  var base=state.lastCheck||state.startedAt,due=addMonths(base,state.settings.months),left=diffDays(due,todayStr()),cls,txt;
  if(left<0){cls='bad';txt='เลยกำหนดตรวจมาแล้ว '+(-left)+' วัน'}
  else if(left===0){cls='bad';txt='ครบกำหนดตรวจวันนี้'}
  else if(left<=14){cls='warn';txt='ใกล้ถึงกำหนด อีก '+left+' วัน'}
  else{cls='good';txt='ยังไม่ถึงกำหนด อีก '+left+' วัน'}
  return{due:due,left:left,cls:cls,txt:txt};
}
function expiring(){
  var horizon=addMonths(todayStr(),state.settings.months),t=todayStr();
  return items().filter(function(v){return !v.skip&&v.expiry&&v.expiry<=horizon})
    .map(function(v){return{v:v,days:diffDays(v.expiry,t)}}).sort(function(a,b){return a.days-b.days});
}

/* ---------- ชิ้นส่วนหน้าจอ ---------- */
function bar(p,cls){return '<div class="sp-bar '+(cls||'')+'"><i style="width:'+Math.max(0,Math.min(100,p))+'%"></i></div>'}
function chipFor(st,sh){
  if(st==='ok')return '<span class="sp-chip ok">ครบ</span>';
  if(st==='low')return '<span class="sp-chip low">ขาด '+qty(sh)+'</span>';
  if(st==='none')return '<span class="sp-chip none">ยังไม่มี</span>';
  return '<span class="sp-chip skip">ข้าม</span>';
}
function numField(fk,attrs,val){return '<input type="number" inputmode="decimal" min="0" step="any" data-fk="'+fk+'" '+attrs+' value="'+(val||val===0?val:'')+'">'}
function stepper(fk,sAttr,val,dec,inc){
  return '<div class="sp-stepper"><button type="button" aria-label="ลด" '+dec+'>−</button>'+
    '<input type="number" inputmode="decimal" min="0" step="any" data-fk="'+fk+'" '+sAttr+' value="'+val+'">'+
    '<button type="button" aria-label="เพิ่ม" '+inc+'>+</button></div>';
}
function flashHtml(){return ui.flash?'<div class="sp-note good" role="status">'+esc(ui.flash)+'</div>':''}

function setupCard(){
  var s=state.settings;
  return '<section class="sp-card sp-setup"><h3>เริ่มต้นใช้งาน</h3>'+
    '<p class="sp-muted">บอกจำนวนคนและจำนวนวันที่ต้องการเตรียมไว้ ระบบจะคำนวณปริมาณที่ควรมีของแต่ละรายการให้เอง</p>'+
    '<div class="sp-setrow"><span>คนในครอบครัว</span>'+
      stepper('s-people','data-s="people"',s.people,'data-act="sstep" data-s="people" data-d="-1"','data-act="sstep" data-s="people" data-d="1"')+'<em>คน</em></div>'+
    '<div class="sp-setrow"><span>เตรียมไว้กี่วัน</span>'+
      stepper('s-days','data-s="days"',s.days,'data-act="sstep" data-s="days" data-d="-1"','data-act="sstep" data-s="days" data-d="1"')+'<em>วัน</em></div>'+
    '<button class="sp-btn" data-act="start">เริ่มนับของ</button></section>';
}
function hero(st,cv){
  var s=state.settings;
  function row(label,val){
    var has=val!=null,p=has?val/s.days*100:0,done=has&&val>=s.days;
    return '<div class="sp-rrow"><div class="sp-rtop"><span>'+label+'</span><b>'+(has?days1(val)+' จาก '+s.days+' วัน':'ไม่ได้นับ')+'</b></div>'+bar(p,done?'ok':'')+'</div>';
  }
  var ex=expiring(),nd=nextDue();
  return '<section class="sp-hero"><div class="sp-hero-top"><div><div class="sp-kick">ระดับความพร้อมของคลัง</div><div class="sp-pct">'+st.pct+'<small>%</small></div></div>'+
    '<div class="sp-hero-sub"><b>'+st.ok+'</b> / '+st.n+' รายการพร้อมใช้</div></div>'+
    '<div class="sp-ruler"><div class="sp-kick">ระยะเวลาสำรองโดยประมาณ</div>'+row('น้ำดื่ม',cv.water)+row('อาหารหลัก',cv.food)+'</div>'+
    '<div class="sp-kpis"><div><span>รายการที่ยังขาด</span><b>'+st.short.length+'</b></div><div><span>ใกล้หมดอายุ</span><b>'+ex.length+'</b></div><div><span>ตรวจครั้งถัดไป</span><b>'+fmtD(nd.due)+'</b></div></div></section>';
}
function todoCard(st,nd,ex){
  var rows='',exp=ex.filter(function(e){return e.days<=0}).length;
  if(st.short.length)rows+='<button class="sp-todo" data-act="tab" data-t="buy"><span><b>ยังขาด '+st.short.length+' รายการ</b><small>ดูสรุปสิ่งที่ต้องซื้อและคัดลอกไปใช้ได้</small></span><i>›</i></button>';
  if(nd.left<=14)rows+='<button class="sp-todo" data-act="tab" data-t="check"><span><b>'+esc(nd.txt)+'</b><small>กำหนดตรวจ '+fmtD(nd.due)+'</small></span><i>›</i></button>';
  if(ex.length)rows+='<button class="sp-todo" data-act="tab" data-t="buy"><span><b>'+(exp?'หมดอายุแล้ว '+exp+' รายการ':'ใกล้หมดอายุ '+ex.length+' รายการ')+'</b><small>ตรวจและหมุนเวียนของก่อนใช้ไม่ได้</small></span><i>›</i></button>';
  if(!rows)rows='<div class="sp-note good">คลังพร้อมแล้ว ตอนนี้ไม่มีอะไรต้องทำ</div>';
  return '<section class="sp-card"><h3>ควรทำต่อ</h3><div class="sp-todos">'+rows+'</div></section>';
}
function ringSvg(p,col){
  var r=27,c=2*Math.PI*r;
  return '<svg class="sp-ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="'+r+'" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="5"/>'+
    '<circle cx="32" cy="32" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(c*p/100).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 32 32)"/></svg>';
}
function catPct(b){return b.n?Math.round(b.sum/b.n*100):0}
function catColor(b){var p=catPct(b);return !b.n?'var(--muted)':(p>=100?'var(--sp-ok)':(p>0?'var(--sp-warn)':'var(--sp-bad)'))}
function tint(c){return 'background:color-mix(in srgb,'+c.tone+' 18%,var(--surface))'}
function tile(c,b){
  var p=catPct(b),badge=b.short.length?'<span class="sp-badge" aria-label="ขาด '+b.short.length+' รายการ">'+b.short.length+'</span>':'';
  var sub=b.n?(p>=100?'ครบแล้ว':'ครบ '+b.ok+'/'+b.n):(c.id==='other'?'แตะเพื่อเพิ่ม':'ยังไม่มีรายการ');
  return '<button class="sp-tile" data-act="gocat" data-c="'+c.id+'">'+badge+
    '<span class="sp-tic">'+ringSvg(p,catColor(b))+'<span class="em" style="'+tint(c)+'">'+c.ic+'</span></span>'+
    '<b>'+esc(c.name)+'</b><small>'+sub+'</small></button>';
}
function gridCard(st){
  return '<section class="sp-card"><h3>หมวดหมู่</h3><p class="sp-muted">แตะหมวดเพื่อดูและนับของเฉพาะหมวดนั้น · วงแหวนคือความพร้อม ตัวเลขแดงคือจำนวนที่ยังขาด</p><div class="sp-grid3">'+
    CATS.map(function(c){return tile(c,st.by[c.id])}).join('')+'</div></section>';
}
function budgetCard(st){
  var h='<section class="sp-card"><h3>งบประมาณ</h3>';
  if(!st.anyPrice){
    return h+'<p class="sp-muted">ใส่ราคาต่อหน่วยในแต่ละรายการ (เปิดหมวดแล้วกด "รายละเอียด") จะเห็นงบที่ต้องซื้อเพิ่มและงบเต็มแผนตรงนี้</p></section>';
  }
  h+='<div class="sp-tbl"><table><thead><tr><th>หมวด</th><th>ต้องซื้อเพิ่ม</th><th>เต็มแผน</th></tr></thead><tbody>';
  CATS.forEach(function(c){var b=st.by[c.id];if(!b.n)return;h+='<tr><td>'+esc(c.name)+'</td><td>'+money(b.buy)+'</td><td>'+money(b.full)+'</td></tr>'});
  return h+'</tbody><tfoot><tr><td>รวม</td><td>'+money(st.buy)+'</td><td>'+money(st.full)+'</td></tr></tfoot></table></div><p class="sp-muted">ราคาเป็นประมาณการเพื่อวางแผน ไม่รวมเงินสดสำรอง ควรตรวจราคาจริงก่อนซื้อ</p></section>';
}
function expCard(ex){
  var h='<section class="sp-card" id="sp-exp"><h3>ใกล้หมดอายุ</h3><p class="sp-muted">รายการที่หมดอายุภายใน '+state.settings.months+' เดือนข้างหน้า</p>';
  if(!ex.length)return h+'<div class="sp-empty">ยังไม่มีรายการที่ใกล้หมดอายุ ใส่วันหมดอายุได้ในรายละเอียดของแต่ละรายการ</div></section>';
  ex.forEach(function(e){
    h+='<div class="sp-buyrow"><div class="nm">'+esc(e.v.name)+'<small>หมดอายุ '+fmtD(e.v.expiry)+'</small></div>'+
      (e.days<0?'<span class="sp-chip none">หมดอายุแล้ว</span>':'<span class="sp-chip low">อีก '+e.days+' วัน</span>')+'</div>';
  });
  return h+'</section>';
}
function settingsCard(){
  var s=state.settings;
  function f(label,key,val,mode,min){return '<label class="sp-f">'+label+'<input type="number" inputmode="'+mode+'" min="'+min+'" step="'+(mode==='numeric'?'1':'any')+'" data-fk="s-'+key+'-2" data-s="'+key+'" value="'+val+'"></label>'}
  return '<details class="sp-card sp-det"><summary>ปรับแผน<span class="sp-sum">'+s.people+' คน · '+s.days+' วัน · ตรวจทุก '+s.months+' เดือน</span></summary>'+
    '<div class="sp-grid">'+f('จำนวนคนในครอบครัว','people',s.people,'numeric',1)+f('เตรียมไว้กี่วัน','days',s.days,'numeric',1)+
    f('ตรวจสต๊อกทุกกี่เดือน','months',s.months,'numeric',1)+f('น้ำดื่ม (ลิตร/คน/วัน)','waterL',s.waterL,'decimal',0.5)+f('ขนาดขวดน้ำ (ลิตร)','bottleL',s.bottleL,'decimal',0.5)+'</div>'+
    '<p class="sp-muted">เปลี่ยนค่าแล้วปริมาณที่ต้องมีของทุกรายการคำนวณใหม่ทันที</p></details>';
}
function cautionCard(){
  return '<details class="sp-card sp-det"><summary>ข้อควรระวัง</summary><ul class="sp-plain">'+CAUTIONS.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul></details>';
}
function backupCard(){
  return '<details class="sp-card sp-det"><summary>สำรองและกู้คืนข้อมูล</summary>'+
    '<p class="sp-muted">ข้อมูลคลังเสบียงเก็บในเครื่องนี้เท่านั้น ถ้าจะย้ายเครื่อง ให้คัดลอกข้อมูลไปวางในเครื่องใหม่</p>'+
    '<div class="sp-actions"><button class="sp-btn sec sm" data-act="export">คัดลอกข้อมูลสำรอง</button></div>'+
    (ui.backup?'<textarea class="sp-ta" readonly data-fk="bk-out" rows="4">'+esc(ui.backup)+'</textarea>':'')+
    '<textarea class="sp-ta" data-fk="bk-in" rows="3" placeholder="วางข้อมูลสำรองที่นี่เพื่อกู้คืน"></textarea>'+
    '<div class="sp-actions"><button class="sp-btn sec sm" data-act="import">กู้คืนข้อมูล</button></div>'+flashHtml()+'</details>';
}

function vOverview(){
  if(ui.cat)return vCat();
  var st=stats(),nd=nextDue(),ex=expiring(),cv=coverage(),h='';
  if(!state.configured)h+=setupCard();
  h+=hero(st,cv)+gridCard(st)+todoCard(st,nd,ex);
  return h;
}
function vMore(){return settingsCard()+cautionCard()+backupCard()}

function itemHtml(v){
  var t=target(v),st=status(v),sh=r2(Math.max(0,t-v.have)),step=v.step||1,open=!!ui.open[v.id],s=state.settings,rule;
  if(v.kind==='water')rule='คำนวณจาก '+s.people+' คน × '+s.days+' วัน × '+qty(s.waterL)+' ลิตร ÷ ขวดละ '+qty(s.bottleL)+' ลิตร (รวมประมาณ '+qty(s.people*s.days*s.waterL)+' ลิตร)';
  else rule='เกณฑ์ '+qty(v.rate)+' '+v.unit+' '+KIND[v.kind];
  var expChip='';
  if(!v.skip&&v.expiry){
    var dd=diffDays(v.expiry,todayStr());
    if(dd<0)expChip='<span class="sp-chip none">หมดอายุแล้ว</span>';
    else if(dd<=state.settings.months*30)expChip='<span class="sp-chip low">หมดอายุอีก '+dd+' วัน</span>';
  }
  var id=esc(v.id);
  var h='<article class="sp-item st-'+st+'" id="it-'+id+'">'+
   '<div class="sp-row1"><div class="nm">'+esc(v.name)+(v.note||v.note2?'<small>'+esc(v.note2||v.note)+'</small>':'')+'</div>'+chipFor(st,sh)+'</div>'+
   '<div class="sp-row2"><span class="sp-muted">มีอยู่</span>'+
   stepper('have-'+id,'data-f="have" data-id="'+id+'"',r2(v.have),'data-act="step" data-id="'+id+'" data-d="-1"','data-act="step" data-id="'+id+'" data-d="1"')+
   '<span class="unit">'+esc(v.unit)+'</span></div>'+
   '<div class="sp-row3"><span class="need">ต้องมี <b>'+qty(t)+'</b> '+esc(v.unit)+'</span>'+expChip+'<span class="grow"></span>'+
   (sh>0&&st!=='skip'?'<button class="sp-link" data-act="bought" data-id="'+id+'">เติมให้ครบ</button>':'')+
   '<button class="sp-link" data-act="toggle" data-id="'+id+'" aria-expanded="'+open+'">'+(open?'ซ่อน':'รายละเอียด')+'</button></div>';
  if(open){
    h+='<div class="sp-more"><div class="wide sp-muted">'+esc(rule)+'</div>';
    if(v.kind!=='water'){
      h+='<label class="sp-f">วิธีคิดปริมาณ<select data-fk="kind-'+id+'" data-f="kind" data-id="'+id+'">'+
        Object.keys(KIND).map(function(k){return '<option value="'+k+'"'+(k===v.kind?' selected':'')+'>'+KIND[k]+'</option>'}).join('')+'</select></label>'+
        '<label class="sp-f">ปริมาณ ('+esc(v.unit)+')'+numField('rate-'+id,'data-f="rate" data-id="'+id+'"',v.rate)+'</label>';
    }
    if(v.id!=='cash')h+='<label class="sp-f">ราคาต่อ'+esc(v.unit)+' (บาท)'+numField('price-'+id,'data-f="price" data-id="'+id+'"',v.price||'')+'</label>';
    h+='<label class="sp-f">วันหมดอายุที่ใกล้ที่สุด<input type="date" data-fk="exp-'+id+'" data-f="expiry" data-id="'+id+'" value="'+esc(v.expiry)+'"></label>'+
      '<label class="sp-f wide">บันทึกเพิ่มเติม<input type="text" data-fk="note-'+id+'" data-f="note" data-id="'+id+'" value="'+esc(v.note2)+'" placeholder="เช่น ยี่ห้อ ที่เก็บ"></label>'+
      '<label class="sp-f chk wide"><input type="checkbox" data-fk="skip-'+id+'" data-f="skip" data-id="'+id+'"'+(v.skip?' checked':'')+'> ข้ามรายการนี้ (ไม่นับในแผน)</label>';
    if(v.custom)h+='<div class="wide"><button class="sp-btn danger sm" data-act="delcustom" data-id="'+id+'">ลบรายการนี้</button></div>';
    h+='</div>';
  }
  return h+'</article>';
}
function vCat(){
  var c=CATIDS[ui.cat];if(!c){ui.cat='';return vOverview()}
  var st=stats(),b=st.by[c.id],p=catPct(b),all=items().filter(function(v){return v.cat===c.id}),h='',cnt={all:all.length,need:0,ok:0};
  all.forEach(function(v){var x=status(v);if(x==='ok')cnt.ok++;else if(x!=='skip')cnt.need++});
  h+='<button class="sp-back" data-act="catback" type="button">‹ ภาพรวม</button>';
  h+='<section class="sp-cathero"><span class="em" style="'+tint(c)+'">'+c.ic+'</span><div class="tx"><h3>'+esc(c.name)+'</h3>'+
    '<div class="sp-muted">'+(b.n?'ครบ '+b.ok+' จาก '+b.n+' รายการ · '+p+'%':'ยังไม่มีรายการที่นับในหมวดนี้')+'</div>'+bar(p,p>=100?'ok':'')+'</div></section>';
  if(b.short.length)h+='<div class="sp-actions"><button class="sp-btn sec sm" data-act="boughtcat" data-c="'+c.id+'">เติมให้ครบทั้งหมวด</button></div>';
  if(all.length>1)h+='<div class="sp-seg" role="group" aria-label="กรองรายการ">'+
    [['all','ทั้งหมด '+cnt.all],['need','ขาด '+cnt.need],['ok','ครบ '+cnt.ok]].map(function(f){return '<button data-act="filter" data-f2="'+f[0]+'" aria-pressed="'+(ui.filter===f[0])+'">'+f[1]+'</button>'}).join('')+'</div>';
  var list=all.filter(function(v){var x=status(v);if(ui.filter==='need')return x==='low'||x==='none';if(ui.filter==='ok')return x==='ok';return true});
  if(!list.length)h+='<div class="sp-empty">'+(ui.filter==='all'?'ยังไม่มีรายการ เพิ่มรายการแรกได้ด้านล่าง':'ไม่มีรายการในตัวกรองนี้')+'</div>';
  list.forEach(function(v){h+=itemHtml(v)});
  if(ui.addCat===c.id){
    h+='<div class="sp-card"><h3>เพิ่มรายการในหมวด "'+esc(c.name)+'"</h3><div class="sp-grid">'+
      '<label class="sp-f">ชื่อรายการ<input type="text" data-fk="new-name" placeholder="เช่น แพมเพิร์ส อาหารสัตว์เลี้ยง"></label>'+
      '<label class="sp-f">หน่วย<input type="text" data-fk="new-unit" placeholder="เช่น ห่อ ถุง"></label>'+
      '<label class="sp-f">วิธีคิดปริมาณ<select data-fk="new-kind">'+Object.keys(KIND).map(function(k){return '<option value="'+k+'">'+KIND[k]+'</option>'}).join('')+'</select></label>'+
      '<label class="sp-f">ปริมาณ<input type="number" inputmode="decimal" min="0" step="any" data-fk="new-rate" value="1"></label></div>'+
      '<div class="sp-actions"><button class="sp-btn" data-act="addcustom" data-c="'+c.id+'">เพิ่มรายการ</button><button class="sp-btn sec" data-act="addcancel">ยกเลิก</button></div></div>';
  }else h+='<div><button class="sp-link" data-act="addopen" data-c="'+c.id+'">+ เพิ่มรายการในหมวดนี้</button></div>';
  return h;
}

function buyText(st){
  var s=state.settings,lines=['รายการที่ต้องซื้อ (ครอบครัว '+s.people+' คน '+s.days+' วัน)'];
  CATS.forEach(function(c){
    var b=st.by[c.id];if(!b.short.length)return;
    lines.push('','['+c.name+']');
    b.short.forEach(function(r){lines.push('- '+r.v.name+' '+qty(r.sh)+' '+r.v.unit)});
  });
  return lines.join('\n');
}
function vBuy(){
  var st=stats(),ex=expiring(),h='';
  var pctS=st.n?st.pct:0;
  h+='<section class="sp-card"><h3>สรุปสิ่งที่ต้องเพิ่มเติม</h3>';
  if(!st.short.length)h+='<div class="sp-note good">ไม่มีรายการที่ขาดในตอนนี้ คลังพร้อม '+pctS+'%</div>';
  else{
    h+='<p class="sp-muted">ขาด '+st.short.length+' รายการ จาก '+st.n+' รายการ'+(st.anyPrice?' · ประมาณ '+money(st.buy):'')+'</p>'+
      '<div class="sp-sumchips">'+CATS.map(function(c){var b=st.by[c.id];return b.short.length?'<button class="sp-sc" data-act="gocat" data-c="'+c.id+'"><span>'+c.ic+'</span><b>'+b.short.length+'</b></button>':''}).join('')+'</div>'+
      '<div class="sp-actions"><button class="sp-btn sm" data-act="copy">คัดลอกรายการ</button>'+(navigator.share?'<button class="sp-btn sec sm" data-act="share">ส่งต่อ</button>':'')+'</div>'+
      (ui.copyText?'<pre class="sp-copy" data-fk="copybox">'+esc(ui.copyText)+'</pre>':'')+flashHtml();
  }
  h+='</section>';
  CATS.forEach(function(c){
    var b=st.by[c.id];if(!b.short.length)return;
    h+='<section class="sp-card"><div class="sp-sechead"><span class="em" style="'+tint(c)+'">'+c.ic+'</span><h3>'+esc(c.name)+'</h3><span class="sp-chip low">ขาด '+b.short.length+'</span></div>';
    b.short.forEach(function(r){
      var v=r.v;
      h+='<div class="sp-buyrow"><div class="nm">'+esc(v.name)+'<small>มี '+qty(v.have)+' จาก '+qty(r.t)+' '+esc(v.unit)+(v.price&&v.id!=='cash'?' · ราว '+money(r.sh*v.price):'')+'</small></div>'+
        '<span class="qty">'+qty(r.sh)+' '+esc(v.unit)+'</span>'+
        '<button class="sp-btn sec sm" data-act="bought" data-id="'+esc(v.id)+'">ซื้อแล้ว</button></div>';
    });
    h+='</section>';
  });
  h+=expCard(ex)+budgetCard(st);
  return h;
}

function vCheck(){
  var nd=nextDue(),st=stats(),ex=expiring(),h='',s=state.settings;
  var stepDone=STEPS.filter(function(_,i){return state.steps[i]}).length;
  var clTotal=0,clDone=0;CHECKS.forEach(function(g,gi){g.l.forEach(function(_,li){clTotal++;if(state.checklist[gi+'-'+li])clDone++})});
  h+='<section class="sp-card"><h3>ตรวจคลังเสบียงทุก '+s.months+' เดือน</h3><div class="sp-note '+nd.cls+'">'+esc(nd.txt)+' · กำหนด '+fmtD(nd.due)+'</div>'+
    '<p class="sp-muted">ทำตามขั้นตอนด้านล่าง แล้วกด "บันทึกการตรวจ" ระบบจะเก็บสรุปสิ่งที่ขาดไว้ และเลื่อนกำหนดครั้งถัดไปให้อัตโนมัติ</p></section>';
  h+='<section class="sp-card"><h3>ขั้นตอนตรวจ</h3><p class="sp-muted">ทำแล้ว '+stepDone+'/'+STEPS.length+'</p>';
  STEPS.forEach(function(t,i){h+='<div class="sp-ck'+(state.steps[i]?' done':'')+'"><input type="checkbox" id="sp-stp-'+i+'" data-fk="stp-'+i+'" data-cl="steps" data-k="'+i+'"'+(state.steps[i]?' checked':'')+'><label for="sp-stp-'+i+'">'+esc(t)+'</label></div>'});
  h+='<div class="sp-actions"><button class="sp-btn sec sm" data-act="tab" data-t="overview">ไปนับของในภาพรวม</button></div></section>';
  h+='<section class="sp-card"><h3>เช็กลิสต์ตรวจสอบ</h3><p class="sp-muted">ผ่านแล้ว '+clDone+'/'+clTotal+'</p>';
  CHECKS.forEach(function(g,gi){
    h+='<h4>'+esc(g.g)+'</h4>';
    g.l.forEach(function(t,li){var k=gi+'-'+li;h+='<div class="sp-ck'+(state.checklist[k]?' done':'')+'"><input type="checkbox" id="sp-cl-'+k+'" data-fk="cl-'+k+'" data-cl="checklist" data-k="'+k+'"'+(state.checklist[k]?' checked':'')+'><label for="sp-cl-'+k+'">'+esc(t)+'</label></div>'});
  });
  h+='</section>';
  h+='<section class="sp-card"><h3>สถานะตอนนี้</h3><p class="sp-muted">ครบ '+st.ok+' จาก '+st.n+' รายการ ('+st.pct+'%) · ขาด '+st.short.length+' · ใกล้หมดอายุ/หมดอายุแล้ว '+ex.length+'</p>'+bar(st.pct,st.pct>=100?'ok':'')+
    '<div class="sp-actions"><button class="sp-btn sec sm" data-act="tab" data-t="buy">ดูสรุปที่ขาด</button></div></section>';
  h+='<section class="sp-card"><h3>บันทึกการตรวจ</h3><div class="sp-grid">'+
    '<label class="sp-f">วันที่ตรวจ<input type="date" data-fk="chk-date" value="'+todayStr()+'"></label>'+
    '<label class="sp-f">ผู้ตรวจ<input type="text" data-fk="chk-by" placeholder="ชื่อผู้ตรวจ"></label></div>'+
    '<label class="sp-f">หมายเหตุ<input type="text" data-fk="chk-note" placeholder="เช่น ไฟฉายอันที่ 2 ไฟอ่อน เปลี่ยนถ่านแล้ว"></label>'+
    '<div class="sp-actions"><button class="sp-btn" data-act="savecheck">บันทึกการตรวจ</button></div>'+flashHtml()+'</section>';
  h+='<section class="sp-card"><h3>ประวัติการตรวจ</h3>';
  if(!state.checks.length)h+='<div class="sp-empty">ยังไม่มีประวัติ การตรวจครั้งแรกจะแสดงที่นี่</div>';
  state.checks.forEach(function(c){
    h+='<details class="sp-hist"><summary><span>'+fmtD(c.date)+(c.by?' · '+esc(c.by):'')+'</span><span class="sp-chip '+(c.missing.length?'low':'ok')+'">'+c.pct+'% · ขาด '+c.missing.length+'</span></summary>'+
      (c.note?'<p class="sp-muted">'+esc(c.note)+'</p>':'')+
      (c.missing.length?'<ul class="sp-plain">'+c.missing.map(function(m){return '<li>'+esc(m.n)+' ขาด '+qty(m.sh)+' '+esc(m.u)+'</li>'}).join('')+'</ul>':'<p class="sp-muted">ครบทุกรายการ</p>')+
      '<p class="sp-muted">เช็กลิสต์ผ่าน '+c.cl+'/'+clTotal+(c.exp?' · ใกล้หมดอายุ '+c.exp+' รายการ':'')+'</p></details>';
  });
  return h+'</section>';
}

var VIEWS={overview:vOverview,buy:vBuy,check:vCheck,more:vMore};

function render(){
  var a=document.activeElement,fk=a&&root.contains(a)?a.getAttribute('data-fk'):null,ss=null,se=null;
  try{ss=a.selectionStart;se=a.selectionEnd}catch(e){}
  var y=window.scrollY,s=state.settings,st=stats();
  var head='<header class="sp-pagehead"><div class="sp-brandmark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 8.5 12 4l8 4.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 9h16M8 9v4h8V9M12 13v4"/></svg></div><div class="sp-pagecopy"><span class="sp-eyebrow">EMERGENCY READINESS</span><h2>คลังเสบียงฉุกเฉิน</h2><p>ครอบครัว '+s.people+' คน <i>·</i> '+s.days+' วัน <i>·</i> ตรวจทุก '+s.months+' เดือน</p></div><span class="sp-live"><i></i> พร้อมจัดการ</span></header>';
  var tabs='<nav class="sp-tabs" aria-label="เมนูคลังเสบียง">'+TABS.map(function(t){
    var dot=t[0]==='buy'&&st.short.length?'<span class="dot">'+st.short.length+'</span>':'';
    return '<button data-act="tab" data-t="'+t[0]+'" aria-current="'+(ui.tab===t[0])+'"><span class="sp-tabico" aria-hidden="true">'+t[2]+'</span><span>'+t[1]+'</span>'+dot+'</button>';
  }).join('')+'</nav>';
  root.innerHTML=head+tabs+'<div class="sp-view">'+VIEWS[ui.tab]()+'</div>';
  if(fk){var n=root.querySelector('[data-fk="'+fk+'"]');if(n){n.focus({preventScroll:true});try{if(ss!=null)n.setSelectionRange(ss,se)}catch(e){}}}
  if(ui.scrollTo){var el=document.getElementById(ui.scrollTo);ui.scrollTo='';if(el)el.scrollIntoView({block:'start'})}
  else window.scrollTo(0,y);
}
function later(){setTimeout(render,0)}
function toTop(){var p=document.getElementById('supply');window.scrollTo(0,p?Math.max(0,p.getBoundingClientRect().top+window.scrollY-8):0)}
function setTab(t){
  if(!VIEWS[t])t='overview';
  ui.tab=t;ui.cat='';ui.addCat='';ui.flash='';ui.copyText='';
  render();toTop();
}
function setItem(id,k,val){var o=state.items[id]=state.items[id]||{};o[k]=val;touch()}
function val(sel){var e=root.querySelector('[data-fk="'+sel+'"]');return e?e.value:''}
function clampSetting(k,v){
  if(k==='people'||k==='days'||k==='months')return Math.max(1,Math.round(v)||1);
  if(k==='waterL')return v>0?v:3.5;
  if(k==='bottleL')return v>0?v:6;
  return v;
}

/* ---------- เหตุการณ์ ---------- */
root.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b||!root.contains(b))return;
  var a=b.dataset.act,id=b.dataset.id;
  if(a==='tab')setTab(b.dataset.t);
  else if(a==='start'){state.configured=true;touch();ui.tab='overview';ui.cat='';render();toTop()}
  else if(a==='sstep'){var k=b.dataset.s;state.settings[k]=clampSetting(k,state.settings[k]+(+b.dataset.d));state.configured=state.configured;touch();render()}
  else if(a==='scroll'){var tgt=document.getElementById(b.dataset.to);if(tgt)tgt.scrollIntoView({block:'start',behavior:'smooth'})}
  else if(a==='gocat'){ui.tab='overview';ui.cat=b.dataset.c;ui.filter='all';ui.addCat='';ui.flash='';render();toTop()}
  else if(a==='catback'){ui.cat='';ui.addCat='';render();toTop()}
  else if(a==='boughtcat'){if(!confirm('ตั้งจำนวนที่มีให้ครบตามที่ควรมีทุกรายการในหมวดนี้?'))return;items().filter(function(v){return v.cat===b.dataset.c&&!v.skip}).forEach(function(v){setItem(v.id,'have',Math.max(v.have,target(v)))});render()}
  else if(a==='filter'){ui.filter=b.dataset.f2;render()}
  else if(a==='toggle'){ui.open[id]=!ui.open[id];render()}
  else if(a==='step'){var v=getView(id);setItem(id,'have',r2(Math.max(0,v.have+(+b.dataset.d)*(v.step||1))));render()}
  else if(a==='bought'){var v2=getView(id);setItem(id,'have',Math.max(v2.have,target(v2)));ui.flash='';render()}
  else if(a==='addopen'){ui.addCat=b.dataset.c;render()}
  else if(a==='addcancel'){ui.addCat='';render()}
  else if(a==='addcustom'){
    var nm=(val('new-name')||'').trim();
    if(!nm){var ne=root.querySelector('[data-fk="new-name"]');if(ne)ne.focus();return}
    var cid='c'+Date.now().toString(36);
    state.custom.push({id:cid,cat:b.dataset.c,name:nm,unit:(val('new-unit')||'ชิ้น').trim(),kind:val('new-kind')||'fix',rate:num(val('new-rate'))||1,custom:true});
    ui.addCat='';touch();render();
  }
  else if(a==='delcustom'){
    state.custom=state.custom.filter(function(c){return c.id!==id});delete state.items[id];touch();render();
  }
  else if(a==='copy'){
    var txt=buyText(stats());ui.copyText=txt;
    var done=function(ok){
      ui.flash=ok?'คัดลอกแล้ว':'คัดลอกอัตโนมัติไม่ได้ แตะที่ข้อความด้านบนเพื่อเลือกแล้วคัดลอกเอง';render();
      if(!ok){var pb=root.querySelector('.sp-copy');if(pb){var r=document.createRange();r.selectNodeContents(pb);var sel=getSelection();sel.removeAllRanges();sel.addRange(r)}}
    };
    try{navigator.clipboard.writeText(txt).then(function(){done(true)},function(){done(false)})}catch(x){done(false)}
  }
  else if(a==='share'){
    try{navigator.share({title:'รายการที่ต้องซื้อ',text:buyText(stats())}).catch(function(){})}catch(x){}
  }
  else if(a==='savecheck'){
    var date=val('chk-date')||todayStr(),st=stats(),ex=expiring(),cl=0;
    Object.keys(state.checklist).forEach(function(k){if(state.checklist[k])cl++});
    state.checks.unshift({date:date,by:(val('chk-by')||'').trim(),note:(val('chk-note')||'').trim(),pct:st.pct,cl:cl,exp:ex.length,
      missing:st.short.map(function(r){return{n:r.v.name,sh:r.sh,u:r.v.unit}})});
    if(state.checks.length>40)state.checks.length=40;
    state.lastCheck=date;state.checklist={};state.steps={};
    ui.flash='บันทึกแล้ว ตรวจครั้งถัดไป '+fmtD(nextDue().due);
    touch();render();
  }
  else if(a==='export'){
    ui.backup=JSON.stringify(state);ui.flash='';
    var ok=function(m){ui.flash=m;render()};
    try{navigator.clipboard.writeText(ui.backup).then(function(){ok('คัดลอกข้อมูลสำรองแล้ว เก็บไว้ในที่ปลอดภัย')},function(){ok('คัดลอกอัตโนมัติไม่ได้ เลือกข้อความด้านบนแล้วคัดลอกเอง')})}catch(x){ok('คัดลอกอัตโนมัติไม่ได้ เลือกข้อความด้านบนแล้วคัดลอกเอง')}
  }
  else if(a==='import'){
    var t=(val('bk-in')||'').trim();
    if(!t){ui.flash='วางข้อมูลสำรองก่อนกดกู้คืน';render();return}
    var d;try{d=JSON.parse(t)}catch(x){ui.flash='ข้อมูลไม่ถูกต้อง ตรวจว่าคัดลอกมาครบทั้งหมด';render();return}
    if(!d||typeof d!=='object'||!d.settings){ui.flash='ข้อมูลนี้ไม่ใช่ข้อมูลสำรองของคลังเสบียง';render();return}
    if(!confirm('กู้คืนข้อมูลจะเขียนทับข้อมูลคลังเสบียงในเครื่องนี้ ต้องการดำเนินการต่อหรือไม่'))return;
    state=normalize(d);state.configured=true;ui.backup='';touch();ui.flash='กู้คืนข้อมูลแล้ว';render();
  }
});
root.addEventListener('change',function(e){
  var t=e.target;
  if(t.dataset.s){
    var k=t.dataset.s;state.settings[k]=clampSetting(k,num(t.value));touch();later();
  }else if(t.dataset.f){
    var f=t.dataset.f,id=t.dataset.id;
    if(f==='have'||f==='price'||f==='rate')setItem(id,f,num(t.value));
    else if(f==='skip')setItem(id,'skip',t.checked);
    else setItem(id,f,t.value);
    later();
  }else if(t.dataset.cl){
    state[t.dataset.cl][t.dataset.k]=t.checked;touch();later();
  }
});
root.addEventListener('focusin',function(e){
  var t=e.target;
  if(t.tagName==='INPUT'&&t.type==='number'){try{t.select()}catch(x){}}
});

/* เปิดแท็บใหม่ทุกครั้งที่กดเมนูนี้ เพื่อให้วันที่/กำหนดตรวจเป็นปัจจุบัน */
var entry=document.querySelector('[data-tab="supply"]');
if(entry)entry.addEventListener('click',function(){ui.tab='overview';ui.cat='';ui.addCat='';ui.flash='';render()});
render();
})();
