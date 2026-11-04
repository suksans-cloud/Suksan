/* My Goals — ส่วนคำนวณกลาง (ใช้ร่วมกันระหว่างหน้า My Goals และหน้าแรก)
 * ตัวเลขอัตโนมัติ (เงินออม/ลงทุน/สำรอง/หนังสือ) · เป้านิสัยประจำ (เช็กอิน/นับจาก My Diary) · กำหนดเสร็จ + ประมาณการ */
(function(){
'use strict';
var INV=/กองทุน|ลงทุน|RMF|SSF|SCBAM|WelthX|Small bank|หุ้น|ทอง|คริปโต/i;
function rj(k){try{var a=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function mm(y,m){return String(y)+(m?'-'+('0'+m).slice(-2):'')}
/* เงินออม = รายรับ − รายจ่ายประจำ − แปรผัน ต่อเดือน (ไม่ติดลบ) · m=0 รวมทั้งปี */
function savedFrom(y,m){var by={};rj('mff_money_cache_v3').forEach(function(t){if(String(t.month||'').slice(0,4)!==String(y))return;var o=by[t.month]||(by[t.month]={i:0,e:0}),a=Number(t.amount)||0;if(t.type==='income')o.i+=a;else if(t.type==='fixed'||t.type==='variable')o.e+=a});
  return Object.keys(by).filter(function(k){return !m||k===mm(y,m)}).reduce(function(s,k){return s+Math.max(0,by[k].i-by[k].e)},0)}
function investFrom(y,m){return rj('mff_money_cache_v3').reduce(function(s,t){return String(t.month||'').indexOf(mm(y,m))===0&&t.type!=='income'&&INV.test(t.category||'')?s+(Number(t.amount)||0):s},0)}
/* เงินสำรองฉุกเฉิน = ยอดสะสมทุกปีของกองทุน/บัญชีที่เป็น E-Saving (เงินสำรอง) ใน My Portfolio */
function reserveFrom(){
  var d;try{d=JSON.parse(localStorage.getItem('khlangthun_portfolio_oldui_latest_v4')||'null')}catch(e){d=null}
  var funds=d&&Array.isArray(d.funds)?d.funds:[],RE=/e\s*[- ]?saving|esaving|เงินสำรอง/i,seen={},sum=0;
  funds.forEach(function(f){
    if(!f||!(f.assetCategoryKey==='reserve'||RE.test(String(f.owner||''))||RE.test(String(f.name||''))))return;
    var k=String(f.owner||'').trim().toLowerCase()+'|'+String(f.name||'').trim().toLowerCase().replace(/\s+/g,' ');
    if(seen[k])return;seen[k]=1;
    var ys=f.years||{};
    Object.keys(ys).forEach(function(y){
      var yd=ys[y]||{},pm=yd.planMonths||yd.months||{};
      var t=Object.keys(pm).reduce(function(a,m){return a+(Number(pm[m])||0)},0);
      if(!(t>0)&&yd.masterActual!==undefined)t=Number(yd.masterActual)||0;
      sum+=t;
    });
  });
  return sum;
}
function booksFrom(y,m){return rj('mff_bookshelf_cache_v1').filter(function(b){return b.status==='finished'&&String(b.finishedAt||'').indexOf(mm(y,m))===0}).length}
function mval(g,m){return g.link==='reserve'?reserveFrom():g.link==='saving'?savedFrom(g.year,m):g.link==='invest'?investFrom(g.year,m):g.link==='books'?booksFrom(g.year,m):0}

var MO=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function dstr(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function pd(s){var p=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||''));return p?new Date(+p[1],+p[2]-1,+p[3]):null}
function fd(d){return d.getDate()+' '+MO[d.getMonth()]+' '+String(d.getFullYear()+543).slice(-2)}
function numf(n){return Math.round(Number(n)||0).toLocaleString('th-TH')}
function fmu(g,n){return numf(n)+' '+g.unit}
/* ทำให้ข้อมูลเป้าหมายมีรูปแบบเดียวกันเสมอ (ต้องตรงกับ glX ในหน้า Setting) */
function norm(g,defYear){
  g.steps=Array.isArray(g.steps)?g.steps:[];
  g.year=Number(g.year)||defYear||new Date().getFullYear();
  g.kind=g.kind==='amount'?'amount':g.kind==='habit'?'habit':'steps';
  g.link=g.link||'';g.done=g.done?1:0;g.target=Number(g.target)||0;g.current=Number(g.current)||0;
  g.unit=g.unit||'บาท';g.period=g.period==='month'?'month':'year';
  g.due=pd(g.due)?String(g.due):'';
  g.freq=(g.freq==='day'||g.freq==='month')?g.freq:'week';
  g.times=Math.max(0,Number(g.times)||0);
  var seen={};(Array.isArray(g.checkins)?g.checkins:[]).forEach(function(s){s=String(s);if(pd(s))seen[s]=1});
  g.checkins=Object.keys(seen).sort();
  return g;
}
/* ---- เป้านิสัยประจำ ---- */
function hdates(g){
  if(g.link==='diary') return rj('mff_diary_cache_v1').filter(function(e){return e&&(e.body||e.title)}).map(function(e){return String(e.date||'')});
  return g.checkins||[];
}
function hTimes(g){return g.freq==='day'?1:Math.max(1,Number(g.times)||1)}
function hrange(g,n){
  n=n||new Date();var y=n.getFullYear(),m=n.getMonth(),d=n.getDate();
  if(g.freq==='month')return[dstr(new Date(y,m,1)),dstr(new Date(y,m+1,0))];
  if(g.freq==='week'){var w=new Date(y,m,d);w.setDate(d+(w.getDay()===0?-6:1-w.getDay()));var e=new Date(w);e.setDate(w.getDate()+6);return[dstr(w),dstr(e)]}
  var t=dstr(n);return[t,t];
}
function hcount(g,n){var r=hrange(g,n),seen={};hdates(g).forEach(function(s){if(s>=r[0]&&s<=r[1])seen[s]=1});return Object.keys(seen).length}
function streak(g,n){
  n=n||new Date();var set={};hdates(g).forEach(function(s){set[s]=1});
  var d=new Date(n.getFullYear(),n.getMonth(),n.getDate());if(!set[dstr(d)])d.setDate(d.getDate()-1);
  var k=0;while(set[dstr(d)]){k++;d.setDate(d.getDate()-1)}return k;
}
function pfrac(g,n){n=n||new Date();return g.freq==='month'?n.getDate()/new Date(n.getFullYear(),n.getMonth()+1,0).getDate():g.freq==='week'?(((n.getDay()+6)%7)+1)/7:1}
function hLabel(g){return g.freq==='month'?'เดือนนี้':g.freq==='week'?'สัปดาห์นี้':'วันนี้'}
function hEval(g,n){
  var c=hcount(g,n),T=hTimes(g),sk=streak(g,n);
  var tx=hLabel(g)+' '+c+' / '+T+' ครั้ง'+(sk>0?' · ต่อเนื่อง '+sk+' วัน':'');
  if(c>=T)return{st:'done',tx:tx+' ✓',c:c,T:T,sk:sk};
  return{st:c>=T*pfrac(g,n)*.8?'ok':'late',tx:tx,c:c,T:T,sk:sk};
}
/* ---- กำหนดเสร็จ + ประมาณการ (เฉพาะเป้าตัวเลขรายปี) ---- */
function dueEval(g,v,n){
  n=n||new Date();var t=g.target,dueD=pd(g.due);if(!dueD||!(t>0))return null;
  var td=new Date(n.getFullYear(),n.getMonth(),n.getDate());
  if(v>=t)return{st:'done',tx:'ถึงเป้าแล้ว '+fmu(g,v)+' / '+fmu(g,t),sh:'ถึงเป้าแล้ว'};
  var dl=Math.round((dueD-td)/864e5);
  if(dl<0)return{st:'late',tx:'เลยกำหนด '+fd(dueD)+' · ขาดอีก '+fmu(g,t-v),sh:'ขาดอีก '+fmu(g,t-v)};
  var months=Math.max(1,Math.ceil(dl/30.4)),need=Math.ceil((t-v)/months);
  var st0=g.link?new Date(g.year,0,1):(pd(String(g.createdAt||'').slice(0,10))||td);
  var el=Math.max(1,Math.round((td-st0)/864e5)),okp=true,proj='';
  if(v>0&&el>=7){
    var need2=Math.ceil((t-v)/(v/el));
    if(need2>3650){okp=false;proj=' · ที่ความเร็วนี้ใช้เวลานานเกิน 10 ปี'}
    else{var pdt=new Date(td.getTime()+need2*864e5);okp=pdt<=dueD;proj=' · ที่ความเร็วนี้ถึงเป้า ~'+fd(pdt)}
  }else if(v<=0&&el>=14){okp=false}
  return{st:okp?'ok':'late',tx:'เหลือ '+dl+' วัน ('+fd(dueD)+') · ควรทำเดือนละ '+fmu(g,need)+proj,sh:'ควรทำเดือนละ '+fmu(g,need)};
}
function value(g,refMonth){return g.link&&g.link!=='diary'?mval(g,g.period==='month'?(refMonth||1):0):g.current}
function pctOf(g,refMonth,n){
  if(g.done)return 100;
  if(g.kind==='habit')return Math.min(100,Math.round(hcount(g,n)/hTimes(g)*100));
  if(g.kind==='amount')return g.target>0?Math.min(100,Math.round(value(g,refMonth)/g.target*100)):0;
  if(!g.steps.length)return 0;
  return Math.round(g.steps.filter(function(s){return s.d}).length/g.steps.length*100);
}
function list(){return rj('mff_goals_cache_v1').filter(function(g){return g&&g.id}).map(function(g){return norm(g)})}
/* ---- สำหรับหน้าแรก ---- */
function upcoming(n){
  n=n||new Date();var td=dstr(n),y=n.getFullYear(),M=n.getMonth()+1,lim=dstr(new Date(y,n.getMonth(),n.getDate()+30)),rows=[];
  list().forEach(function(g){
    if(g.year!==y||g.done)return;
    var p=pctOf(g,M,n);if(p>=100)return;
    if(g.kind==='habit'){
      var h=hEval(g,n),behind=g.freq==='day'?h.c<1:h.c<h.T*pfrac(g,n)*.8;
      if(!behind)return;
      rows.push({k:td,title:g.title,sub:g.freq==='day'?(g.link==='diary'?'วันนี้ยังไม่ได้เขียนไดอารี่':'วันนี้ยังไม่ได้เช็กอิน'):h.tx,em:'วันนี้',late:g.freq!=='day'&&h.st==='late',pct:p});
      return;
    }
    var ev=(g.kind==='amount'&&g.due&&g.period!=='month')?dueEval(g,value(g,M),n):null;
    var soon=!!g.due&&g.due<=lim;
    if(!soon&&!(ev&&ev.st==='late'))return;
    var dd=pd(g.due),overdue=!!g.due&&g.due<td;
    rows.push({k:g.due||td,title:g.title,sub:(ev?ev.sh:'ทำไปแล้ว')+' · '+p+'%',em:g.due?(overdue?'เลยกำหนด ':g.due===td?'วันนี้ ':'')+dd.getDate()+' '+MO[dd.getMonth()]:'ช้ากว่าแผน',late:overdue||!!(ev&&ev.st==='late'),pct:p});
  });
  return rows;
}
function summary(n){
  n=n||new Date();var y=n.getFullYear(),M=n.getMonth()+1,l=list().filter(function(g){return g.year===y});
  if(!l.length)return{n:0,avg:0};
  return{n:l.length,avg:Math.round(l.reduce(function(s,g){return s+pctOf(g,M,n)},0)/l.length)};
}
window.MFFGoalsCore={rj:rj,mm:mm,savedFrom:savedFrom,investFrom:investFrom,reserveFrom:reserveFrom,booksFrom:booksFrom,mval:mval,
  dstr:dstr,pd:pd,fd:fd,norm:norm,hdates:hdates,hTimes:hTimes,hcount:hcount,streak:streak,hEval:hEval,hLabel:hLabel,dueEval:dueEval,value:value,pctOf:pctOf,upcoming:upcoming,summary:summary};
})();
