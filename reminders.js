/* ตั้งเตือนชำระรายเดือน + DCA — เก็บในเครื่อง (localStorage) */
(function(){
'use strict';
var KEY='mff_reminders_v1';
function load(){try{var a=JSON.parse(localStorage.getItem(KEY));return Array.isArray(a)?a:[]}catch(e){return []}}
function save(l){try{localStorage.setItem(KEY,JSON.stringify(l))}catch(e){}}
function day0(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function nextDue(r,from){
  var t=day0(from||new Date());
  if(r.mode==='every'){
    var p=/^(\d{4})-(\d{2})-(\d{2})$/.exec(r.start||''); var n=Math.max(1,Number(r.every)||1);
    if(!p) return null;
    var s=new Date(+p[1],+p[2]-1,+p[3]); if(t<=s) return s;
    return new Date(s.getFullYear(),s.getMonth(),s.getDate()+Math.ceil((t-s)/86400000/n)*n);
  }
  var dd=Math.min(31,Math.max(1,Number(r.day)||1));
  function at(y,m){var last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(dd,last))}
  var c=at(t.getFullYear(),t.getMonth()); if(c<t) c=at(t.getFullYear(),t.getMonth()+1);
  return c;
}
function upcoming(){
  var t=day0(new Date()),out=[];
  load().forEach(function(r){
    var d=nextDue(r,t); if(!d) return;
    var days=Math.round((d-t)/86400000);
    out.push({r:r,date:d,days:days,soon:days<=(Number(r.lead)||0)});
  });
  return out.sort(function(a,b){return a.days-b.days});
}
function label(x){return x.days===0?'วันนี้':x.days===1?'พรุ่งนี้':'อีก '+x.days+' วัน'}
/* แจ้งเตือนระบบ (ทำงานตอนเปิดแอป วันละครั้งต่อรายการ) */
function fire(){
  if(!('Notification' in window)||Notification.permission!=='granted') return;
  var td=new Date().toISOString().slice(0,10),k='mff_rem_fired_v1',m={};
  try{m=JSON.parse(localStorage.getItem(k))||{}}catch(e){}
  upcoming().filter(function(x){return x.soon}).forEach(function(x){
    if(m[x.r.id]===td) return; m[x.r.id]=td;
    var title=(x.r.type==='dca'?'ถึงรอบ DCA: ':'ใกล้ครบกำหนดชำระ: ')+x.r.name;
    var body=label(x)+(x.r.amount?' · ฿'+Number(x.r.amount).toLocaleString('th-TH'):'');
    try{ if(navigator.serviceWorker&&navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(function(r){r.showNotification(title,{body:body,icon:'portfolio/icon-192.png'})}).catch(function(){new Notification(title,{body:body})}); else new Notification(title,{body:body}); }catch(e){}
  });
  try{localStorage.setItem(k,JSON.stringify(m))}catch(e){}
}
window.MFFRem={load:load,save:save,nextDue:nextDue,upcoming:upcoming,label:label,fire:fire};
})();
