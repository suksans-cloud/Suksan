/* My Tools — สุขภาพ: BMI / แคลอรี่ต่อวัน / สัดส่วนอาหาร / น้ำดื่ม / บันทึกน้ำหนัก
   ข้อมูลเก็บในเครื่อง (localStorage คีย์ mff_health_v1) และซิงก์ขึ้น Sheets แท็บ AppSettings ผ่าน tools-sync.js + Smart Sync
   ค่าที่คำนวณเป็นค่าประมาณ ไม่ใช่คำแนะนำทางการแพทย์ */
(function(){
'use strict';
var LS='mff_health_v1';
var S={mseed:1,mx:{},sex:'m',age:'35',h:'170',w:'70',act:'1.375',goal:'keep',waist:'',ex:'30',wgoal:'',preset:'bal',log:[]};
try{var o=JSON.parse(localStorage.getItem(LS)||'{}');for(var k in o){S[k]=o[k]}}catch(e){}
if(!Array.isArray(S.log))S.log=[];
if(!S.mx||typeof S.mx!=='object')S.mx={};
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){} try{window.MFFToolsSync&&MFFToolsSync.push(LS,S)}catch(e){}}
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function num(v){var n=parseFloat(String(v==null?'':v).replace(/,/g,''));return isFinite(n)?n:null}
function f(n,d){return n==null||!isFinite(n)?'—':n.toLocaleString('en-US',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})}
function set(id,t){var e=document.getElementById(id);if(e)e.textContent=t}
function html(id,t){var e=document.getElementById(id);if(e)e.innerHTML=t}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

/* ---------- คำนวณพื้นฐาน ---------- */
function profile(){return{sex:S.sex,age:num(S.age),h:num(S.h),w:num(S.w),act:num(S.act)||1.375}}
function calcEnergy(){
  var p=profile(); if(!p.age||!p.h||!p.w||p.age<10||p.age>100||p.h<100||p.h>230||p.w<20||p.w>300)return null;
  var bmr=10*p.w+6.25*p.h-5*p.age+(p.sex==='m'?5:-161);
  var tdee=bmr*p.act, delta=S.goal==='lose'?-500:S.goal==='gain'?300:0;
  var floor=p.sex==='m'?1500:1200, target=tdee+delta, floored=false;
  if(S.goal==='lose'&&target<floor){target=Math.min(floor,tdee);floored=true}
  return{bmr:bmr,tdee:tdee,target:target,floored:floored,change:(target-tdee)*7/7700}
}

/* ---------- BMI ---------- */
function drawBmi(){
  var p=profile(), ok=p.h&&p.w&&p.h>=100&&p.h<=230&&p.w>=20&&p.w<=300;
  if(!ok){set('hBmi','—');set('hBmiCat','กรอกส่วนสูงและน้ำหนัก');set('hBmiRange','—');set('hBmiDiff','—');html('hBmiBar','');set('hWaistOut','—');return}
  var m=p.h/100, b=p.w/(m*m), cat,col;
  if(b<18.5){cat='น้ำหนักต่ำกว่าเกณฑ์';col='#3A6C93'}
  else if(b<23){cat='น้ำหนักปกติ';col='#1F9D6C'}
  else if(b<25){cat='น้ำหนักเกิน (ท้วม)';col='#D9A21B'}
  else if(b<30){cat='อ้วนระดับ 1';col='#E08A3B'}
  else{cat='อ้วนระดับ 2';col='#E0654B'}
  set('hBmi',f(b,1)); var c=q('#hBmiCat'); c.textContent=cat; c.style.color=col;
  var lo=18.5*m*m, hi=22.9*m*m;
  set('hBmiRange',f(lo,1)+' – '+f(hi,1)+' กก.');
  set('hBmiDiff',p.w>hi?'ควรลดประมาณ '+f(p.w-hi,1)+' กก.':p.w<lo?'ควรเพิ่มประมาณ '+f(lo-p.w,1)+' กก.':'อยู่ในช่วงปกติแล้ว');
  var pos=Math.max(0,Math.min(100,(b-15)/(35-15)*100));
  var tk=[15,18.5,23,25,30,35].map(function(v){var l=(v-15)/20*100;return '<span style="position:absolute;left:'+l+'%;transform:translateX(-'+(l>=99?100:l<=1?0:50)+'%)">'+v+(v===35?'+':'')+'</span>'}).join('');
  html('hBmiBar','<div style="position:relative;height:10px;border-radius:99px;background:linear-gradient(90deg,#3A6C93 0,#3A6C93 17.5%,#1F9D6C 17.5%,#1F9D6C 40%,#D9A21B 40%,#D9A21B 50%,#E08A3B 50%,#E08A3B 75%,#E0654B 75%);margin:14px 4px 6px"><i style="position:absolute;top:-5px;left:calc('+pos+'% - 10px);width:20px;height:20px;border-radius:50%;background:var(--surface);border:3px solid '+col+';box-shadow:0 1px 4px #0003"></i></div><div style="position:relative;height:14px;margin:0 4px;font-size:10.5px;color:var(--ink-faint)">'+tk+'</div>');
  var w=num(S.waist), lim=S.sex==='m'?90:80;
  set('hWaistOut',w?(w>=lim?'รอบเอว '+f(w,0)+' ซม. เกินเกณฑ์ ('+lim+' ซม.) เสี่ยงไขมันช่องท้อง':'รอบเอว '+f(w,0)+' ซม. อยู่ในเกณฑ์ (ต่ำกว่า '+lim+' ซม.)'):'ไม่ได้กรอกรอบเอว')
}

/* ---------- แคลอรี่ ---------- */
function drawCal(){
  var e=calcEnergy();
  if(!e){['hBmr','hTdee','hTarget','hCalChange'].forEach(function(i){set(i,'—')});set('hCalNote','กรอกอายุ ส่วนสูง และน้ำหนักให้ครบ');return}
  set('hBmr',f(e.bmr)+' kcal');set('hTdee',f(e.tdee)+' kcal');set('hTarget',f(e.target));
  set('hCalChange',(e.change>0?'+':'')+f(e.change,2)+' กก./สัปดาห์');
  set('hCalNote',e.floored?'ปรับให้ไม่ต่ำกว่าขั้นต่ำที่ปลอดภัย ('+(S.sex==='m'?1500:1200)+' kcal) การลดเร็วเกินไปไม่แนะนำ':S.goal==='lose'?'ลดวันละ 500 kcal ≈ ลด 0.45 กก./สัปดาห์ (ค่าที่ทั่วไปแนะนำ)':S.goal==='gain'?'เพิ่มวันละ 300 kcal ควบคู่กับออกกำลังกายเสริมกล้ามเนื้อ':'พลังงานที่ใช้ต่อวัน = พลังงานที่ควรกิน น้ำหนักจะคงที่')
}

/* ---------- สัดส่วนอาหาร ---------- */
var PRE={bal:[50,20,30],high:[40,30,30],low:[25,30,45]};
function drawMacro(){
  var e=calcEnergy(), p=PRE[S.preset]||PRE.bal;
  if(!e){['hMt','hMc','hMp','hMf','hMkg'].forEach(function(i){set(i,'—')});html('hMbar','');return}
  var t=e.target, c=t*p[0]/100/4, pr=t*p[1]/100/4, fa=t*p[2]/100/9;
  set('hMt',f(t));set('hMc',f(c)+' ก. ('+f(c*4)+' kcal · '+p[0]+'%)');set('hMp',f(pr)+' ก. ('+f(pr*4)+' kcal · '+p[1]+'%)');set('hMf',f(fa)+' ก. ('+f(fa*9)+' kcal · '+p[2]+'%)');
  var w=num(S.w); set('hMkg',w?f(pr/w,1)+' ก./กก.น้ำหนักตัว (ทั่วไป 0.8–1.6)':'—');
  html('hMbar','<div style="display:flex;height:14px;border-radius:99px;overflow:hidden"><i style="width:'+p[0]+'%;background:#3A6C93"></i><i style="width:'+p[1]+'%;background:#1F9D6C"></i><i style="width:'+p[2]+'%;background:#E0A93B"></i></div><div style="display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--muted);margin-top:8px"><span><b style="color:#3A6C93">●</b> คาร์บ</span><span><b style="color:#1F9D6C">●</b> โปรตีน</span><span><b style="color:#E0A93B">●</b> ไขมัน</span></div>')
}

/* ---------- น้ำดื่ม ---------- */
function drawWater(){
  var w=num(S.w), ex=num(S.ex)||0;
  if(!w||w<20||w>300){['hWater','hGlass','hBottle'].forEach(function(i){set(i,'—')});return}
  var ml=Math.round((w*35+ex/30*350)/50)*50;
  set('hWater',f(ml));set('hGlass',f(ml/250,1)+' แก้ว (250 มล.)');set('hBottle',f(ml/600,1)+' ขวด (600 มล.)')
}

/* ---------- บันทึกน้ำหนัก ---------- */
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function dshort(s){var a=s.split('-');return a.length===3?(+a[2])+'/'+(+a[1])+'/'+String(+a[0]+543).slice(-2):s}
function drawLog(){
  var L=S.log.slice().sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0}), g=num(S.wgoal);
  if(!L.length){set('hLast','—');set('hLogStart','—');set('hLogChg','—');set('hLogGoal',g?'เป้าหมาย '+f(g,1)+' กก.':'—');html('hChart','<p class="note" style="text-align:center;margin:18px 0">ยังไม่มีข้อมูล เพิ่มน้ำหนักวันนี้เพื่อเริ่มกราฟ</p>');html('hLogList','');return}
  var first=L[0], last=L[L.length-1], chg=last.w-first.w;
  set('hLast',f(last.w,1));set('hLogStart',f(first.w,1)+' กก. ('+dshort(first.d)+')');
  set('hLogChg',(chg>0?'+':'')+f(chg,1)+' กก.');
  set('hLogGoal',g?(Math.abs(last.w-g)<0.05?'ถึงเป้าหมายแล้ว 🎉':(last.w>g?'อีก '+f(last.w-g,1)+' กก. (ลด)':'อีก '+f(g-last.w,1)+' กก. (เพิ่ม)')):'ยังไม่ได้ตั้งเป้าหมาย');
  var W=320,H=170,pl=34,pr=12,pt=12,pb=26, ws=L.map(function(x){return x.w}); if(g)ws.push(g);
  var mn=Math.min.apply(null,ws)-1, mx=Math.max.apply(null,ws)+1;
  var t0=Date.parse(L[0].d), t1=Date.parse(last.d), span=Math.max(1,t1-t0);
  function X(d){return L.length===1?W/2:pl+(Date.parse(d)-t0)/span*(W-pl-pr)}
  function Y(v){return pt+(mx-v)/(mx-mn)*(H-pt-pb)}
  var pts=L.map(function(x){return X(x.d).toFixed(1)+','+Y(x.w).toFixed(1)}).join(' ');
  var svg='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" role="img" aria-label="กราฟน้ำหนัก">';
  [mx,(mx+mn)/2,mn].forEach(function(v){svg+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" style="stroke:var(--line)"/><text x="'+(pl-5)+'" y="'+(Y(v)+3.5)+'" text-anchor="end" style="font:10px sans-serif;fill:var(--ink-faint)">'+f(v,1)+'</text>'});
  if(g&&g>mn&&g<mx)svg+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(g)+'" y2="'+Y(g)+'" stroke-dasharray="5 4" style="stroke:var(--green)"/><text x="'+(W-pr)+'" y="'+(Y(g)-4)+'" text-anchor="end" style="font:10px sans-serif;fill:var(--green)">เป้าหมาย '+f(g,1)+'</text>';
  if(L.length>1)svg+='<polyline points="'+pts+'" fill="none" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--primary-light)"/>';
  L.forEach(function(x){svg+='<circle cx="'+X(x.d).toFixed(1)+'" cy="'+Y(x.w).toFixed(1)+'" r="3.6" style="fill:var(--surface);stroke:var(--primary)" stroke-width="2"/>'});
  svg+='<text x="'+pl+'" y="'+(H-6)+'" style="font:10px sans-serif;fill:var(--ink-faint)">'+dshort(L[0].d)+'</text>';
  if(L.length>1)svg+='<text x="'+(W-pr)+'" y="'+(H-6)+'" text-anchor="end" style="font:10px sans-serif;fill:var(--ink-faint)">'+dshort(last.d)+'</text>';
  html('hChart',svg+'</svg>');
  var rows=L.slice().reverse().slice(0,30).map(function(x){return '<div class="resultrow"><span>'+esc(dshort(x.d))+'</span><b>'+f(x.w,1)+' กก. <button type="button" data-del="'+esc(x.d)+'" aria-label="ลบ" style="border:0;background:none;color:var(--red);font-size:18px;padding:0 4px;min-height:0">×</button></b></div>'}).join('');
  html('hLogList',rows)
}
function addLog(){
  var d=q('#hLogDate').value||today(), w=num(q('#hLogW').value);
  if(!w||w<20||w>300){q('#hLogW').focus();return}
  S.log=S.log.filter(function(x){return x.d!==d}); S.log.push({d:d,w:Math.round(w*10)/10});
  if(S.log.length>730)S.log=S.log.slice(-730);
  var latest=S.log.reduce(function(a,b){return b.d>=a.d?b:a});
  if(latest.d===d){S.w=String(w);mirror('w',S.w)}
  q('#hLogW').value=''; save(); all()
}


/* ---------- แผนอาหาร 7 วัน ---------- */
/* ค่าโภชนาการเป็นค่าประมาณต่อ 1 หน่วยบริโภคทั่วไป [ชื่อ, โปรตีน, คาร์บ, ไขมัน, แท็ก] แคลอรี่คำนวณจาก 4/4/9 */
var MB=[
['ข้าวต้มหมูสับ (1 ชาม)',14,46,8,'pork'],['โจ๊กหมูใส่ไข่ (1 ชาม)',17,44,10,'pork egg'],
['ไข่ลวก 2 ฟอง + ขนมปังโฮลวีต 2 แผ่น',19,30,13,'egg veg'],['ข้าวต้มปลา (1 ชาม)',20,44,4,'sea'],
['ไข่เจียว 2 ฟอง + ข้าวสวย 1 ถ้วย',17,44,26,'egg veg'],['โอ๊ตมีลนม + กล้วย',12,55,7,'veg'],
['ข้าวเหนียวหมูปิ้ง (3 ไม้)',20,48,17,'pork'],['แซนด์วิชทูน่าโฮลวีต',20,34,11,'sea'],
['โยเกิร์ตกรีก + ผลไม้ + กราโนลา',17,38,8,'veg'],['ซีเรียลโฮลเกรน + นมจืด + ไข่ต้ม 1 ฟอง',19,47,10,'egg veg'],
['ข้าวต้มไก่ (1 ชาม)',18,42,5,''],['สลัดอกไก่ย่าง + ขนมปังโฮลวีต 1 แผ่น',29,26,9,''],
['ไข่ดาว 2 ฟอง + ขนมปัง 2 แผ่น + ผักสด',17,28,16,'egg veg'],['แพนเค้กโฮลวีตกล้วย (3 ชิ้น)',10,52,9,'egg veg']];
var ML=[
['ข้าวมันไก่ (1 จาน)',24,68,19,''],['ข้าวกะเพราไก่ไข่ดาว',27,64,25,'egg'],['ข้าวกะเพราหมูสับไข่ดาว',26,64,30,'pork egg'],
['ก๋วยเตี๋ยวหมูน้ำใส (1 ชาม)',20,48,7,'pork'],['ข้าวผัดกุ้ง (1 จาน)',20,68,16,'sea'],['ผัดไทยกุ้งสด (1 จาน)',21,78,22,'sea'],
['ไก่ย่าง + ส้มตำ + ข้าวเหนียว',33,62,17,''],['ข้าวหมูแดง (1 จาน)',22,66,15,'pork'],['แกงจืดเต้าหู้หมูสับ + ข้าวสวย 1 ถ้วย',20,50,10,'pork'],
['ข้าวกล้อง + ปลาทูทอด + น้ำพริก + ผักลวก',27,52,16,'sea'],['ข้าวราดแกงเขียวหวานไก่',24,62,24,''],['ต้มยำกุ้งน้ำใส + ข้าวสวย 1 ถ้วย',24,50,6,'sea'],
['ข้าวผัดผักใส่ไข่',14,68,17,'egg veg'],['ผัดกะเพราเต้าหู้ + ข้าวสวย',20,60,16,'veg'],['ก๋วยเตี๋ยวเรือเนื้อ (1 ชาม)',20,46,8,'beef'],
['สุกี้น้ำหมู + ผักรวม (1 ชาม)',22,40,9,'pork'],['ยำวุ้นเส้นกุ้ง + ข้าวสวย 1 ถ้วย',20,64,8,'sea'],['ผัดซีอิ๊วไก่ (1 จาน)',24,70,22,''],
['ข้าวกะเพราเนื้อไข่ดาว',28,64,30,'beef egg'],['บะหมี่เกี๊ยวหมูแดง',22,56,12,'pork'],['ข้าวกล้อง + ไข่ต้ม 2 ฟอง + ผัดผักรวม',20,58,16,'egg veg']];
var MD=[
['ปลากะพงนึ่งมะนาว + ข้าวสวย 1 ถ้วย + ผักลวก',34,48,9,'sea'],['ไก่ย่าง + ส้มตำ + ข้าวเหนียวครึ่งห่อ',31,40,15,''],
['แกงจืดมะระยัดไส้หมู + ข้าวสวย 1 ถ้วย',18,48,9,'pork'],['ผัดผักรวม + ไข่ต้ม 1 ฟอง + ข้าวกล้อง 1 ถ้วย',14,52,12,'egg veg'],
['ข้าวต้มกุ้ง (1 ชาม)',20,42,5,'sea'],['สลัดอกไก่ย่าง + ข้าวกล้องครึ่งถ้วย',33,33,11,''],['ต้มยำไก่ + ข้าวสวย 1 ถ้วย',25,50,8,''],
['ไข่ตุ๋น + ผัดบวบ + ข้าวกล้อง 1 ถ้วย',17,50,12,'egg veg'],['แกงส้มกุ้งชะอม + ข้าวสวย 1 ถ้วย',21,52,6,'sea'],['ยำทะเลรวม + ข้าวสวย 1 ถ้วย',28,50,8,'sea'],
['ผัดเต้าหู้ผักรวม + ข้าวกล้อง 1 ถ้วย',19,52,14,'veg'],['ไก่ผัดขิง + ข้าวกล้อง 1 ถ้วย',27,52,16,''],['หมูย่างจิ้มแจ่ว + ผักสด + ข้าวเหนียวครึ่งห่อ',27,40,17,'pork'],
['ปลาทูทอด + ต้มจืดผักกาดขาว + ข้าวสวย 1 ถ้วย',28,50,14,'sea'],['ลาบไก่ + ผักสด + ข้าวเหนียวครึ่งห่อ',30,36,12,''],['ต้มข่าไก่ + ข้าวสวย 1 ถ้วย',24,48,20,''],
['สเต็กเนื้อ + ผักย่าง + ข้าวกล้องครึ่งถ้วย',32,32,16,'beef'],['ผัดผักบุ้ง + เต้าหู้ทอด + ข้าวสวย 1 ถ้วย',14,52,14,'veg'],
['น้ำพริกอ่อง + ผักต้ม + ข้าวสวย 1 ถ้วย',16,52,14,'pork'],['ต้มจืดเต้าหู้หมูสับ + ไข่เจียว + ข้าวสวย',24,50,17,'pork egg']];
var MS=[['ผลไม้สด 1 จาน',1,15,0],['กล้วย 1 ผล',1,23,0],['นมจืด 1 กล่อง (200 มล.)',7,10,7],['ไข่ต้ม 1 ฟอง',6,1,5],['โยเกิร์ตธรรมชาติ 1 ถ้วย',6,8,4],['ข้าวสวยเพิ่มครึ่งถ้วย',2,22,0],['ถั่ว/อัลมอนด์ 1 กำมือ',5,5,14]];
var DAYS=['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];
var SPLIT=[['เช้า','🌅',MB,.30],['กลางวัน','☀️',ML,.40],['เย็น','🌙',MD,.30]];
function kc(d){return d[1]*4+d[2]*4+d[3]*9}
function rng(seed){var a=(seed||1)*2654435761>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function allowed(d){var t=' '+d[4]+' ',x=S.mx||{};
  if(x.pork&&t.indexOf(' pork ')>-1)return false; if(x.beef&&t.indexOf(' beef ')>-1)return false; if(x.sea&&t.indexOf(' sea ')>-1)return false;
  if(x.veg){var meat=/ (pork|beef|sea) /.test(t)||(!/ veg /.test(t)&&true); if(!/ veg /.test(t))return false}
  return true}
var PORT=[[0.5,'ครึ่งหนึ่ง'],[0.75,'¾ ของปกติ'],[1,'ปกติ'],[1.25,'1¼ เท่า'],[1.5,'1½ เท่า']];
function buildPlan(){
  var e=calcEnergy(); if(!e)return null;
  var T=e.target, pr=PRE[S.preset]||PRE.bal, R=rng(num(S.mseed)||1), used=[{},{},{}], plan=[], poolSmall=false;
  for(var d=0;d<7;d++){
    var day={meals:[],kcal:0,p:0,c:0,f:0};
    for(var m=0;m<3;m++){
      var pool=SPLIT[m][2].filter(allowed); if(pool.length<7)poolSmall=true;
      var fresh=pool.filter(function(x){return !used[m][x[0]]}); if(!fresh.length){used[m]={};fresh=pool}
      if(!fresh.length)fresh=SPLIT[m][2];
      var best=null,bs=1e9;
      var tgt=T*SPLIT[m][3];
      fresh.forEach(function(x){var k=kc(x),dp=Math.abs(x[1]*4/k*100-pr[1]),dc=Math.abs(x[2]*4/k*100-pr[0]),sc=dp+dc+Math.abs(k/tgt-1)*60+R()*10;if(sc<bs){bs=sc;best=x}});
      used[m][best[0]]=1;
      var k0=kc(best), mult=Math.max(.5,Math.min(1.25,Math.round(tgt/k0*4)/4)), lab='ปกติ';
      if(Math.abs(tgt/k0-1)<.12)mult=1; PORT.forEach(function(q){if(q[0]===mult)lab=q[1]});
      var meal={slot:SPLIT[m][0],icon:SPLIT[m][1],name:best[0],lab:lab,k:k0*mult,p:best[1]*mult,c:best[2]*mult,f:best[3]*mult,sides:[]};
      var gap=tgt-meal.k;
      for(var n=0;n<3&&gap>=60;n++){
        var sd=null,sg=1e9; MS.forEach(function(x){var k=kc(x),df=Math.abs(gap-k);if(k<=gap+25&&df<sg){sg=df;sd=x}});
        if(!sd)break; meal.sides.push(sd[0]); meal.k+=kc(sd);meal.p+=sd[1];meal.c+=sd[2];meal.f+=sd[3];gap=tgt-meal.k;
      }
      day.meals.push(meal);day.kcal+=meal.k;day.p+=meal.p;day.c+=meal.c;day.f+=meal.f;
    }
    plan.push(day);
  }
  return{plan:plan,target:T,small:poolSmall}
}
var LASTPLAN=null;
function drawMeal(){
  var out=document.getElementById('hMealOut'); if(!out)return;
  var P=buildPlan(); LASTPLAN=P;
  if(!P){out.innerHTML='<p class="note" style="text-align:center;margin:18px 0">กรอกอายุ ส่วนสูง และน้ำหนักให้ครบเพื่อสร้างแผนอาหาร</p>';set('hMealT','—');return}
  set('hMealT',f(P.target));
  var td=(new Date().getDay()+6)%7, h='';
  P.plan.forEach(function(d,i){
    h+='<div class="mp-day'+(i===td?' today':'')+'"><div class="mp-dh"><b>'+DAYS[i]+(i===td?' <span class="mp-tag">วันนี้</span>':'')+'</b><span>'+f(d.kcal)+' kcal · โปรตีน '+f(d.p)+' ก.</span></div>';
    d.meals.forEach(function(m){
      h+='<div class="mp-meal"><div class="mp-slot">'+m.icon+' '+m.slot+'</div><div class="mp-body"><div class="mp-name">'+esc(m.name)+'</div>'
        +'<div class="mp-sub">ปริมาณ: '+esc(m.lab)+(m.sides.length?' · เสริม: '+m.sides.map(esc).join(', '):'')+'</div></div><div class="mp-k">'+f(m.k)+'<small>kcal</small></div></div>';
    });
    h+='</div>';
  });
  if(P.small)h+='<p class="note">ตัวเลือกเมนูตามเงื่อนไขที่เลือกมีไม่มาก จึงอาจมีเมนูซ้ำในสัปดาห์เดียวกัน</p>';
  out.innerHTML=h;
}
function planText(){
  var P=LASTPLAN; if(!P)return '';
  var t='แผนอาหาร 7 วัน (เป้าหมาย '+f(P.target)+' kcal/วัน)\n';
  P.plan.forEach(function(d,i){t+='\n'+DAYS[i]+' ('+f(d.kcal)+' kcal)\n';d.meals.forEach(function(m){t+=' '+m.slot+': '+m.name+(m.lab!=='ปกติ'?' ['+m.lab+']':'')+(m.sides.length?' + '+m.sides.join(', '):'')+' ~'+f(m.k)+' kcal\n'})});
  return t+'\n* ค่าประมาณ ไม่ใช่คำแนะนำทางการแพทย์'
}
function copyPlan(){
  var t=planText(); if(!t)return;
  var ok=function(){var b=q('#hMealCopy');if(b){var o=b.textContent;b.textContent='คัดลอกแล้ว ✓';setTimeout(function(){b.textContent=o},1600)}};
  try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}
  function fb(){var a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){}a.remove()}
}

/* ---------- ผูกฟอร์ม ---------- */
function mirror(key,val,src){qa('[data-h="'+key+'"]').forEach(function(el){if(el!==src)el.value=val})}
function all(){drawBmi();drawCal();drawMacro();drawWater();drawLog();drawMeal()}
function init(){
  if(!q('#bmi'))return;
  qa('[data-h]').forEach(function(el){var k=el.getAttribute('data-h');if(S[k]!=null)el.value=S[k];
    el.addEventListener('input',function(){S[k]=el.value;mirror(k,el.value,el);save();all()});
    el.addEventListener('change',function(){S[k]=el.value;mirror(k,el.value,el);save();all()})});
  var dt=q('#hLogDate'); if(dt)dt.value=today();
  var b=q('#hLogAdd'); if(b)b.addEventListener('click',addLog);
  var wl=q('#wlog'); if(wl)wl.addEventListener('click',function(e){var x=e.target.closest('[data-del]');if(!x)return;var d=x.getAttribute('data-del');S.log=S.log.filter(function(r){return r.d!==d});save();drawLog()});
  qa('[data-mx]').forEach(function(el){var k=el.getAttribute('data-mx');el.checked=!!S.mx[k];
    el.addEventListener('change',function(){S.mx[k]=el.checked;save();drawMeal()})});
  var sh=q('#hMealShuffle'); if(sh)sh.addEventListener('click',function(){S.mseed=(num(S.mseed)||1)+1;save();drawMeal()});
  var cp=q('#hMealCopy'); if(cp)cp.addEventListener('click',copyPlan);
  all()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
