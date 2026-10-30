/* My Tools — สุขภาพ: BMI / แคลอรี่ต่อวัน / สัดส่วนอาหาร / น้ำดื่ม / บันทึกน้ำหนัก
   ข้อมูลเก็บในเครื่องเท่านั้น (localStorage คีย์ mff_health_v1) ไม่ซิงก์ขึ้น Sheets
   ค่าที่คำนวณเป็นค่าประมาณ ไม่ใช่คำแนะนำทางการแพทย์ */
(function(){
'use strict';
var LS='mff_health_v1';
var S={sex:'m',age:'35',h:'170',w:'70',act:'1.375',goal:'keep',waist:'',ex:'30',wgoal:'',preset:'bal',log:[]};
try{var o=JSON.parse(localStorage.getItem(LS)||'{}');for(var k in o){S[k]=o[k]}}catch(e){}
if(!Array.isArray(S.log))S.log=[];
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
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

/* ---------- ผูกฟอร์ม ---------- */
function mirror(key,val,src){qa('[data-h="'+key+'"]').forEach(function(el){if(el!==src)el.value=val})}
function all(){drawBmi();drawCal();drawMacro();drawWater();drawLog()}
function init(){
  if(!q('#bmi'))return;
  qa('[data-h]').forEach(function(el){var k=el.getAttribute('data-h');if(S[k]!=null)el.value=S[k];
    el.addEventListener('input',function(){S[k]=el.value;mirror(k,el.value,el);save();all()});
    el.addEventListener('change',function(){S[k]=el.value;mirror(k,el.value,el);save();all()})});
  var dt=q('#hLogDate'); if(dt)dt.value=today();
  var b=q('#hLogAdd'); if(b)b.addEventListener('click',addLog);
  var wl=q('#wlog'); if(wl)wl.addEventListener('click',function(e){var x=e.target.closest('[data-del]');if(!x)return;var d=x.getAttribute('data-del');S.log=S.log.filter(function(r){return r.d!==d});save();drawLog()});
  all()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
