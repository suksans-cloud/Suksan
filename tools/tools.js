/* My Plan tools: เครื่องคิดเลข + แปลงหน่วย / แปลงสกุลเงิน (อ้างอิงบาท) / ราคาทองคำ
   - ช่องกรอกในไฟล์นี้ไม่ใช้ id เพื่อไม่ให้ระบบเก็บค่า My Plan ไปซิงก์ขึ้น Sheets
   - ข้อมูลที่ cache ไว้เก็บเฉพาะในเครื่อง คีย์ mff_plan_tools_v1 */
(function(){
'use strict';
var LS='mff_plan_tools_v1', S={};
try{S=JSON.parse(localStorage.getItem(LS)||'{}')||{}}catch(e){S={}}
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
function q(sel,root){return (root||document).querySelector(sel)}
function qa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pn(x){var n=parseFloat(String(x==null?'':x).replace(/,/g,'').trim());return isFinite(n)?n:null}
function fetchJSON(url,ms){
  return new Promise(function(res,rej){
    var done=false,ctl=window.AbortController?new AbortController():null;
    var t=setTimeout(function(){if(done)return;done=true;try{ctl&&ctl.abort()}catch(e){}rej(new Error('หมดเวลารอข้อมูล'))},ms||9000);
    fetch(url,ctl?{signal:ctl.signal,cache:'no-store'}:{cache:'no-store'}).then(function(r){
      if(!r.ok) throw new Error('HTTP '+r.status); return r.json();
    }).then(function(j){if(done)return;done=true;clearTimeout(t);res(j)}).catch(function(e){if(done)return;done=true;clearTimeout(t);var m=String(e&&e.message||e);rej(new Error(/Failed to fetch|NetworkError|Load failed|abort/i.test(m)?'เชื่อมต่อไม่ได้ (ออฟไลน์ หรือเว็บไม่อนุญาตให้ดึงตรง)':m))});
  });
}
function when(ts){
  if(!ts) return '-';
  var d=new Date(ts); if(isNaN(d)) return '-';
  return d.toLocaleString('th-TH',{day:'numeric',month:'short',year:'2-digit',hour:'2-digit',minute:'2-digit'})+' น.';
}
function sig(x,d){ /* จัดรูปตัวเลขทั่วไป */
  if(x==null||!isFinite(x)) return '—';
  if(x===0) return '0';
  var a=Math.abs(x);
  if(a>=1e15||a<1e-7) return x.toExponential(6).replace(/\.?0+e/,'e');
  return x.toLocaleString('en-US',{maximumSignificantDigits:d||10});
}
function money(x,dp){return x==null||!isFinite(x)?'—':x.toLocaleString('en-US',{minimumFractionDigits:dp==null?2:dp,maximumFractionDigits:dp==null?2:dp})}

/* ================= FX (อ้างอิงบาท) ================= */
var CUR={USD:['ดอลลาร์สหรัฐ','🇺🇸'],EUR:['ยูโร','🇪🇺'],GBP:['ปอนด์สเตอร์ลิง','🇬🇧'],JPY:['เยนญี่ปุ่น','🇯🇵'],CNY:['หยวนจีน','🇨🇳'],SGD:['ดอลลาร์สิงคโปร์','🇸🇬'],HKD:['ดอลลาร์ฮ่องกง','🇭🇰'],AUD:['ดอลลาร์ออสเตรเลีย','🇦🇺'],CAD:['ดอลลาร์แคนาดา','🇨🇦'],CHF:['ฟรังก์สวิส','🇨🇭'],KRW:['วอนเกาหลีใต้','🇰🇷'],MYR:['ริงกิตมาเลเซีย','🇲🇾'],INR:['รูปีอินเดีย','🇮🇳'],NZD:['ดอลลาร์นิวซีแลนด์','🇳🇿'],TWD:['ดอลลาร์ไต้หวัน','🇹🇼'],VND:['ดองเวียดนาม','🇻🇳'],IDR:['รูเปียห์อินโดนีเซีย','🇮🇩'],PHP:['เปโซฟิลิปปินส์','🇵🇭'],AED:['ดิรฮัมสหรัฐอาหรับเอมิเรตส์','🇦🇪'],SAR:['ริยาลซาอุดีอาระเบีย','🇸🇦'],LAK:['กีบลาว','🇱🇦'],KHR:['เรียลกัมพูชา','🇰🇭'],MMK:['จัตเมียนมา','🇲🇲'],SEK:['โครนาสวีเดน','🇸🇪'],NOK:['โครนนอร์เวย์','🇳🇴'],DKK:['โครนเดนมาร์ก','🇩🇰'],TRY:['ลีราตุรกี','🇹🇷'],MXN:['เปโซเม็กซิโก','🇲🇽'],BRL:['เรอัลบราซิล','🇧🇷'],ZAR:['แรนด์แอฟริกาใต้','🇿🇦'],RUB:['รูเบิลรัสเซีย','🇷🇺'],PLN:['ซลอตีโปแลนด์','🇵🇱'],CZK:['โครูนาเช็ก','🇨🇿'],ILS:['เชเกลอิสราเอล','🇮🇱'],EGP:['ปอนด์อียิปต์','🇪🇬'],PKR:['รูปีปากีสถาน','🇵🇰'],BDT:['ตากาบังกลาเทศ','🇧🇩'],LKR:['รูปีศรีลังกา','🇱🇰'],NPR:['รูปีเนปาล','🇳🇵'],QAR:['ริยาลกาตาร์','🇶🇦'],KWD:['ดีนาร์คูเวต','🇰🇼'],BND:['ดอลลาร์บรูไน','🇧🇳'],MOP:['ปาตากามาเก๊า','🇲🇴']};
var POP=['USD','EUR','GBP','JPY','CNY','SGD','HKD','AUD','CAD','CHF','KRW','MYR','INR','TWD','VND','IDR','PHP','AED','NZD','SAR'];
var FXSRC=[
  {n:'ExchangeRate-API (open)',u:'https://open.er-api.com/v6/latest/THB',p:function(j){if(!j||j.result!=='success'||!j.rates)throw 0;return{rates:j.rates,ts:(j.time_last_update_unix||0)*1000||Date.now()}}},
  {n:'Frankfurter (ECB)',u:'https://api.frankfurter.dev/v1/latest?base=THB',p:function(j){if(!j||!j.rates)throw 0;var r=j.rates;r.THB=1;return{rates:r,ts:Date.parse(j.date)||Date.now()}}},
  {n:'fawazahmed0 currency-api',u:'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/thb.json',p:function(j){if(!j||!j.thb)throw 0;var r={};Object.keys(j.thb).forEach(function(k){if(typeof j.thb[k]==='number')r[k.toUpperCase()]=j.thb[k]});r.THB=1;return{rates:r,ts:Date.parse(j.date)||Date.now()}}}
];
var FX={pending:null,
  data:function(){return S.fx&&S.fx.rates?S.fx:null},
  load:function(force){
    var d=FX.data();
    if(!force&&d&&Date.now()-d.fetched<3*3600e3) return Promise.resolve(d);
    if(FX.pending) return FX.pending;
    FX.pending=(function next(i){
      if(i>=FXSRC.length) return Promise.reject(new Error('ดึงเรทไม่สำเร็จ'));
      return fetchJSON(FXSRC[i].u).then(function(j){
        var o=FXSRC[i].p(j); o.rates.THB=1;
        S.fx={rates:o.rates,ts:o.ts,fetched:Date.now(),src:FXSRC[i].n}; save(); return S.fx;
      }).catch(function(){return next(i+1)});
    })(0).then(function(r){FX.pending=null;return r},function(e){FX.pending=null;if(d) return d;throw e});
    return FX.pending;
  },
  /* rates = หน่วยสกุลนั้นต่อ 1 บาท */
  thbPer:function(c){var d=FX.data();return d&&d.rates[c]?1/d.rates[c]:null},
  conv:function(a,f,t){var d=FX.data();if(!d||!d.rates[f]||!d.rates[t])return null;return a/d.rates[f]*d.rates[t]},
  codes:function(){var d=FX.data();if(!d)return ['THB'].concat(POP);var all=Object.keys(d.rates).filter(function(c){return /^[A-Z]{3}$/.test(c)&&d.rates[c]>0});var rest=all.filter(function(c){return c!=='THB'&&POP.indexOf(c)<0}).sort();return ['THB'].concat(POP.filter(function(c){return all.indexOf(c)>=0}),rest)},
  name:function(c){return CUR[c]?CUR[c][0]:c},flag:function(c){return c==='THB'?'🇹🇭':(CUR[c]?CUR[c][1]:'💱')}
};
CUR.THB=['บาทไทย','🇹🇭'];

function fxUI(){
  var root=q('[data-mpt="fx-body"]'); if(!root) return;
  var st=S.fxui=S.fxui||{amt:'1000',from:'USD',to:'THB',all:false,find:''};
  root.innerHTML=
   '<div class="mpt-status"><span data-r="stat">กำลังโหลดเรท…</span><button type="button" class="mpt-btn" data-r="refresh">รีเฟรช</button></div>'+
   '<div class="mpt-card"><h3>แปลงสกุลเงิน</h3><p class="mpt-hint">เรทกลางตลาด ไม่ใช่เรทรับซื้อ-ขายของธนาคาร</p>'+
   '<div class="mpt-row"><input class="mpt-in" data-r="amt" inputmode="decimal" autocomplete="off" value="'+esc(st.amt)+'"><select class="mpt-sel" data-r="from"></select></div>'+
   '<div class="mpt-swap"><button type="button" data-r="swap" aria-label="สลับสกุลเงิน">⇅</button></div>'+
   '<div class="mpt-row"><div><div class="mpt-out" data-r="out">—</div><div class="mpt-sub-out" data-r="rate"></div></div><select class="mpt-sel" data-r="to"></select></div></div>'+
   '<div class="mpt-card"><h3>เรทบาทไทย</h3><p class="mpt-hint">แตะสกุลเงินเพื่อใช้แปลงด้านบน</p>'+
   '<input class="mpt-in" data-r="find" placeholder="ค้นหา เช่น JPY, เยน" autocomplete="off" value="'+esc(st.find)+'" style="margin-bottom:6px"><div class="mpt-list" data-r="list"></div>'+
   '<button type="button" class="mpt-btn" data-r="more" style="margin-top:10px;width:100%"></button>'+
   '<p class="mpt-note">ข้อมูลจากบริการเรทแลกเปลี่ยนสาธารณะ อัปเดตวันละครั้งถึงไม่กี่ครั้ง ใช้ประกอบการวางแผนเท่านั้น</p></div>';
  var el=function(k){return q('[data-r="'+k+'"]',root)};
  function fillSel(){
    var cs=FX.codes();
    ['from','to'].forEach(function(k){var s=el(k),cur=st[k];s.innerHTML=cs.map(function(c){return '<option value="'+c+'"'+(c===cur?' selected':'')+'>'+FX.flag(c)+' '+c+' — '+esc(FX.name(c))+'</option>'}).join('');if(cs.indexOf(cur)<0){s.value='THB'}});
  }
  function calc(){
    var a=pn(el('amt').value), r=a==null?null:FX.conv(a,st.from,st.to);
    el('out').textContent=r==null?'—':sig(r,10)+' '+st.to;
    var one=FX.conv(1,st.from,st.to);
    el('rate').textContent=one==null?'':'1 '+st.from+' = '+sig(one,6)+' '+st.to;
  }
  function list(){
    var d=FX.data(); var k=(st.find||'').trim().toLowerCase();
    var cs=FX.codes().filter(function(c){return c!=='THB'});
    if(k) cs=cs.filter(function(c){return c.toLowerCase().indexOf(k)>=0||FX.name(c).toLowerCase().indexOf(k)>=0});
    else if(!st.all) cs=cs.filter(function(c){return POP.indexOf(c)>=0});
    var h=cs.map(function(c){
      var t=FX.thbPer(c); if(t==null) return '';
      var per=t<1?100:1;
      return '<button type="button" class="mpt-li" data-c="'+c+'"><span class="fl">'+FX.flag(c)+'</span><span><b>'+c+'</b><small>'+esc(FX.name(c))+'</small></span><span class="v">'+money(t*per,t*per<10?4:2)+' ฿<small>ต่อ '+per+' '+c+'</small></span></button>';
    }).join('');
    el('list').innerHTML=d?(h||'<p class="mpt-note">ไม่พบสกุลเงินที่ค้นหา</p>'):'';
    el('more').textContent=st.all?'แสดงเฉพาะสกุลหลัก':'แสดงทุกสกุลเงิน';
    el('more').style.display=k?'none':'';
  }
  function stat(msg,bad){var d=FX.data();el('stat').innerHTML=msg||(d?'อัปเดตเรท '+when(d.ts)+' <span class="mpt-tag">'+esc(d.src)+'</span>':'ยังไม่มีข้อมูลเรท')+(bad?' <span class="mpt-tag bad">'+esc(bad)+'</span>':'')}
  function refresh(force){
    stat('กำลังโหลดเรท…'); el('refresh').disabled=true;
    FX.load(force).then(function(){stat();fillSel();calc();list()}).catch(function(e){stat(null,'ออฟไลน์/ดึงเรทไม่ได้');fillSel();calc();list()}).then(function(){el('refresh').disabled=false});
  }
  root.addEventListener('input',function(e){var r=e.target.getAttribute('data-r');if(r==='amt'){st.amt=e.target.value;save();calc()}if(r==='find'){st.find=e.target.value;save();list()}});
  root.addEventListener('change',function(e){var r=e.target.getAttribute('data-r');if(r==='from'||r==='to'){st[r]=e.target.value;save();calc()}});
  root.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b) return;
    var r=b.getAttribute('data-r');
    if(r==='refresh') refresh(true);
    else if(r==='swap'){var t=st.from;st.from=st.to;st.to=t;el('from').value=st.from;el('to').value=st.to;save();calc()}
    else if(r==='more'){st.all=!st.all;save();list()}
    else if(b.hasAttribute('data-c')){st.from=b.getAttribute('data-c');st.to='THB';el('from').value=st.from;el('to').value='THB';if(!pn(el('amt').value)){el('amt').value='1';st.amt='1'}save();calc();var c=q('[data-r="from"]',root);c.scrollIntoView({block:'center',behavior:'smooth'})}
  });
  fillSel();calc();list();
  FX.opened=function(){var d=FX.data();if(!d||Date.now()-d.fetched>3*3600e3)refresh(false);else{stat();}};
  stat();
}

/* ================= เครื่องคิดเลข ================= */
var Calc=(function(){
  var st={expr:'',res:'0',shown:'0',err:false,done:false,deg:true,mem:S.mem||0};
  var hist=S.hist||[];
  function fmt(x){
    if(!isFinite(x)) throw new Error('ผลลัพธ์ไม่ถูกต้อง');
    var r=+x.toPrecision(12); if(Object.is(r,-0)) r=0;
    var a=Math.abs(r);
    if(a>=1e15||(a<1e-9&&a>0)) return r.toExponential(6).replace(/\.?0+e/,'e');
    return r.toLocaleString('en-US',{maximumFractionDigits:10,useGrouping:true});
  }
  /* ตัวคำนวณ: ไม่ใช้ eval */
  function evaluate(src,deg){
    var s=src.replace(/\s+/g,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'π');
    /* ปิดวงเล็บที่ค้างให้อัตโนมัติ */
    var open=0;for(var i=0;i<s.length;i++){if(s[i]==='(')open++;else if(s[i]===')')open--}
    while(open>0){s+=')';open--}
    var p=0, lastPctOnly=false;
    function peek(){return s[p]}
    function num(){
      var m=/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(p)); if(!m) return null;
      p+=m[0].length; return parseFloat(m[0]);
    }
    function fact(n){if(n<0||Math.floor(n)!==n||n>170) throw new Error('คำนวณแฟกทอเรียลไม่ได้'); var r=1;for(var i=2;i<=n;i++)r*=i;return r}
    function toRad(x){return deg?x*Math.PI/180:x}
    function fromRad(x){return deg?x*180/Math.PI:x}
    var FN={sin:function(x){return Math.sin(toRad(x))},cos:function(x){return Math.cos(toRad(x))},tan:function(x){return Math.tan(toRad(x))},
      asin:function(x){return fromRad(Math.asin(x))},acos:function(x){return fromRad(Math.acos(x))},atan:function(x){return fromRad(Math.atan(x))},
      ln:Math.log,log:function(x){return Math.log10(x)},'√':Math.sqrt,abs:Math.abs};
    function startsPrimary(){var c=peek();return c==='('||c==='π'||c==='e'&&!/^e[+-]?\d/.test(s.slice(p))||/[a-z√]/.test(c||'')||/[\d.]/.test(c||'')}
    function primary(){
      var c=peek(), v;
      if(c==='('){p++;v=expr();if(peek()!==')')throw new Error('วงเล็บไม่ครบ');p++;return v}
      if(c==='π'){p++;return Math.PI}
      if(c==='e'){p++;return Math.E}
      if(c==='-'){p++;return -power()}
      if(c==='+'){p++;return power()}
      var n=num(); if(n!==null) return n;
      var m=/^(asin|acos|atan|sin|cos|tan|ln|log|abs|√)/.exec(s.slice(p));
      if(m){p+=m[0].length; if(peek()!=='(') { var a=power(); return FN[m[0]](a)} p++; v=expr(); if(peek()!==')')throw new Error('วงเล็บไม่ครบ'); p++; return FN[m[0]](v)}
      throw new Error('รูปแบบไม่ถูกต้อง');
    }
    function postfix(){
      var v=primary(); lastPctOnly=false;
      for(;;){
        if(peek()==='!'){p++;v=fact(v)}
        else if(peek()==='%'){p++;v=v/100;lastPctOnly=true}
        else break;
      }
      return v;
    }
    function power(){
      var b=postfix();
      if(peek()==='^'){p++; var e=unaryPow(); lastPctOnly=false; return Math.pow(b,e)}
      return b;
    }
    function unaryPow(){ if(peek()==='-'){p++;return -unaryPow()} var b=postfix(); if(peek()==='^'){p++;return Math.pow(b,unaryPow())} return b }
    function term(){
      var v=power(), factors=1, pctOnly=lastPctOnly;
      for(;;){
        var c=peek();
        if(c==='*'){p++;v*=power();factors++;pctOnly=false}
        else if(c==='/'){p++;var d=power();if(d===0)throw new Error('หารด้วยศูนย์ไม่ได้');v/=d;factors++;pctOnly=false}
        else if(c&&c!==')'&&c!=='+'&&c!=='-'&&c!=='^'&&c!=='%'&&c!=='!'&&startsPrimary()){v*=power();factors++;pctOnly=false} /* คูณโดยนัย เช่น 2(3) 2π */
        else break;
      }
      return {v:v,pct:factors===1&&pctOnly};
    }
    function expr(){
      var t=term(), v=t.v;
      for(;;){
        var c=peek();
        if(c==='+'||c==='-'){p++;var r=term(); var rv=r.pct?v*r.v:r.v; v=c==='+'?v+rv:v-rv}
        else break;
      }
      return v;
    }
    if(!s) return 0;
    var out=expr(); if(p<s.length) throw new Error('รูปแบบไม่ถูกต้อง');
    return out;
  }
  function live(){
    if(!st.expr){st.err=false;st.shown=st.done?st.res:'0';return}
    try{var v=evaluate(st.expr,st.deg);st.shown=fmt(v);st.err=false;st._v=v}catch(e){ /* คงค่าเดิมระหว่างพิมพ์ */ st.err=false }
  }
  function lastNum(){var m=/(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)$/i.exec(st.expr);return m}
  function put(t){
    if(st.done){ /* หลังกด = : ตัวเลข/ฟังก์ชัน เริ่มใหม่ ตัวดำเนินการต่อจากผลลัพธ์ */
      if(/^[+\-×÷^%!]$/.test(t)||t==='−'){st.expr=st.res.replace(/,/g,'')}else st.expr='';
      st.done=false;
    }
    if(/^[0-9]$/.test(t)&&/[)πe%!]$/.test(st.expr)) st.expr+='×';
    if(t==='.'){var m=lastNum(); if(m&&m[0].indexOf('.')>=0&&!/e/i.test(m[0])) return; if(!m) t='0.'}
    if(/^[+×÷^]$/.test(t)||t==='−'){ if(!st.expr&&t!=='−'){st.expr='0'} if(/[+×÷−^]$/.test(st.expr)&&!(t==='−'&&/[×÷^]$/.test(st.expr))) st.expr=st.expr.slice(0,-1) }
    st.expr+=t; live();
  }
  function back(){
    if(st.done){st.done=false;st.expr=st.res.replace(/,/g,'')}
    var m=/(asin|acos|atan|sin|cos|tan|ln|log|abs|√)\($/.exec(st.expr);
    st.expr=m?st.expr.slice(0,m.index):st.expr.slice(0,-1);
    live(); if(!st.expr) st.shown='0';
  }
  function clear(){st.expr='';st.res='0';st.shown='0';st.err=false;st.done=false}
  function eq(){
    if(!st.expr) return;
    try{
      var v=evaluate(st.expr,st.deg), r=fmt(v);
      hist.unshift({e:st.expr,r:r}); hist=hist.slice(0,20); S.hist=hist; save();
      st.res=r; st.shown=r; st._v=v; st.err=false; st.done=true; st.last=st.expr;
    }catch(e){st.err=e.message||'ผิดพลาด'}
  }
  function sign(){
    if(st.done){st.done=false;st.expr=st.res.replace(/,/g,'')}
    var m=/\(−(\d+\.?\d*)\)$/.exec(st.expr);
    if(m){st.expr=st.expr.slice(0,m.index)+m[1]}
    else{var n=lastNum(); if(n) st.expr=st.expr.slice(0,n.index)+'(−'+n[0]+')'; else if(!st.expr) st.expr='(−'; }
    live();
  }
  function memVal(){try{return st._v!=null?st._v:evaluate(st.expr||'0',st.deg)}catch(e){return null}}
  function key(k){
    st.err=false;
    switch(k){
      case 'C':case 'AC':clear();break;
      case 'CE':if(st.done){clear()}else{var n=lastNum();if(n){st.expr=st.expr.slice(0,n.index);live()}else{st.expr='';live()}}break;
      case '⌫':back();break;
      case '=':eq();break;
      case '±':sign();break;
      case 'x²':put('^2');break;
      case 'xʸ':put('^');break;
      case '1/x':if(st.done){st.done=false;st.expr=st.res.replace(/,/g,'')}st.expr='1÷('+st.expr;live();break;
      case '10ˣ':put('10^');break;
      case 'eˣ':put('e^');break;
      case 'mod':break;
      case 'n!':put('!');break;
      case '√':case 'sin':case 'cos':case 'tan':case 'asin':case 'acos':case 'atan':case 'ln':case 'log':case 'abs':put(k+'(');break;
      case 'deg':st.deg=!st.deg;live();break;
      case 'MC':st.mem=0;S.mem=0;save();break;
      case 'MR':if(st.done){st.done=false;st.expr=''}st.expr+=String(+st.mem.toPrecision(12));live();break;
      case 'MS':var v=memVal();if(v!=null){st.mem=v;S.mem=v;save()}break;
      case 'M+':var a=memVal();if(a!=null){st.mem+=a;S.mem=st.mem;save()}break;
      case 'M−':var b=memVal();if(b!=null){st.mem-=b;S.mem=st.mem;save()}break;
      default:put(k);
    }
  }
  var KP=[['CE','C','⌫','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],['±','0','.','=']];
  var KS=[['deg','sin','cos','tan','π'],['ln','log','√','xʸ','n!'],['(',')','x²','1/x','abs'],['asin','acos','atan','10ˣ','eˣ']];
  function kcls(k){if(k==='=')return'eq';if(/^[÷×−+]$/.test(k)||k==='%')return'op';if(/^[0-9.]$/.test(k))return'';return'fn'}
  function render(root,sci){
    var h='<div class="mpt-disp"><div class="mpt-expr" data-c="expr"></div><div class="mpt-res" data-c="res">0</div></div>'+
      '<div class="mpt-mem">'+['MC','MR','M+','M−','MS'].map(function(m){return '<button type="button" data-k="'+m+'">'+m+'</button>'}).join('')+'</div>';
    if(sci) h+='<div class="mpt-pad sci">'+KS.map(function(r){return r.map(function(k){return '<button type="button" class="mpt-k fn'+(k==='deg'?' on':'')+'" data-k="'+k+'">'+(k==='deg'?(st.deg?'Deg':'Rad'):k)+'</button>'}).join('')}).join('')+'</div>';
    h+='<div class="mpt-pad" style="margin-bottom:7px">'+['1/x','x²','√','xʸ'].map(function(k){return '<button type="button" class="mpt-k fn" data-k="'+k+'">'+k+'</button>'}).join('')+'</div>';
    h+='<div class="mpt-pad">'+KP.map(function(r){return r.map(function(k){return '<button type="button" class="mpt-k '+kcls(k)+'" data-k="'+k+'">'+k+'</button>'}).join('')}).join('')+'</div>';
    h+='<div class="mpt-pad" style="margin-top:7px"><button type="button" class="mpt-k fn" data-k="(">(</button><button type="button" class="mpt-k fn" data-k=")">)</button><button type="button" class="mpt-k fn" data-k="%">%</button><button type="button" class="mpt-k fn" data-k="AC">AC</button></div>';
    h+='<div class="mpt-hist" data-c="hist"></div><p class="mpt-note">พิมพ์ต่อเนื่องได้ (เช่น 2+3×4) วงเล็บที่ค้างจะปิดให้เอง และ 200+10% = 220 แบบเครื่องคิดเลข Windows ใช้คีย์บอร์ดได้บนคอมพิวเตอร์</p>';
    root.innerHTML=h; paint(root);
  }
  function paint(root){
    var e=q('[data-c="expr"]',root),r=q('[data-c="res"]',root); if(!e) return;
    e.textContent=st.done?(st.last||'')+' =':st.expr;
    if(st.err){r.textContent=st.err;r.className='mpt-res err'}else{r.textContent=st.shown;r.className='mpt-res'}
    var ms=qa('[data-k="MR"]',root)[0]; if(ms) ms.style.color=st.mem?'var(--primary)':'';
    var d=q('[data-k="deg"]',root); if(d) d.textContent=st.deg?'Deg':'Rad';
    var hh=q('[data-c="hist"]',root);
    if(hh) hh.innerHTML=hist.length?'<h3 style="margin:12px 0 2px;font-size:13px;color:var(--ink-soft)">ประวัติ <button type="button" class="mpt-btn" data-k="__clh" style="min-height:30px;padding:2px 10px;font-size:11px;margin-left:6px">ล้าง</button></h3>'+hist.slice(0,8).map(function(x,i){return '<button type="button" data-h="'+i+'"><small>'+esc(x.e)+' =</small><b>'+esc(x.r)+'</b></button>'}).join(''):'';
  }
  function bind(root,sci){
    render(root,sci);
    root.onclick=function(e){
      var b=e.target.closest('button'); if(!b) return;
      if(b.hasAttribute('data-h')){var x=hist[+b.getAttribute('data-h')];if(x){st.done=false;st.expr=x.r.replace(/,/g,'');live();paint(root)}return}
      var k=b.getAttribute('data-k'); if(!k) return;
      if(k==='__clh'){hist=[];S.hist=[];save();paint(root);return}
      key(k); paint(root);
    };
  }
  function onKey(e){
    var pan=q('#calc'); if(!pan||pan.classList.contains('hidden')) return;
    if(!q('[data-mpt="calc-body"] .mpt-pad',pan)) return;
    var t=e.target; if(t&&/INPUT|SELECT|TEXTAREA/.test(t.tagName)) return;
    var k=e.key, m={'*':'×','/':'÷','-':'−','Enter':'=','=':'=','Backspace':'⌫','Escape':'AC','Delete':'AC','^':'^','(':'(',')':')','%':'%','!':'!','.':'.',',':'.'};
    var v=/^[0-9+]$/.test(k)?k:m[k]; if(!v) return;
    e.preventDefault(); key(v==='^'?'^':v); paint(q('[data-mpt="calc-body"]',pan));
  }
  document.addEventListener('keydown',onKey);
  return {bind:bind,state:st};
})();

/* ================= แปลงหน่วย ================= */
var UNITS={
  length:{n:'ความยาว',base:'m',u:[['mm','มิลลิเมตร',.001],['cm','เซนติเมตร',.01],['m','เมตร',1],['km','กิโลเมตร',1000],['in','นิ้ว',.0254],['ft','ฟุต',.3048],['yd','หลา',.9144],['mi','ไมล์',1609.344],['nmi','ไมล์ทะเล',1852],['wa','วา (ไทย)',2],['sok','ศอก (ไทย)',.5]]},
  area:{n:'พื้นที่',u:[['mm2','ตารางมิลลิเมตร',1e-6],['cm2','ตารางเซนติเมตร',1e-4],['m2','ตารางเมตร',1],['ha','เฮกตาร์',1e4],['km2','ตารางกิโลเมตร',1e6],['in2','ตารางนิ้ว',6.4516e-4],['ft2','ตารางฟุต',.09290304],['yd2','ตารางหลา',.83612736],['ac','เอเคอร์',4046.8564224],['mi2','ตารางไมล์',2589988.110336],['rai','ไร่',1600],['ngan','งาน',400],['twa','ตารางวา',4]]},
  volume:{n:'ปริมาตร',u:[['ml','มิลลิลิตร',.001],['l','ลิตร',1],['m3','ลูกบาศก์เมตร',1000],['tsp','ช้อนชา (US)',.00492892159375],['tbsp','ช้อนโต๊ะ (US)',.01478676478125],['floz','ออนซ์ของเหลว (US)',.0295735295625],['cup','ถ้วย (US)',.2365882365],['pt','ไพนต์ (US)',.473176473],['qt','ควอร์ต (US)',.946352946],['gal','แกลลอน (US)',3.785411784],['galuk','แกลลอน (UK)',4.54609],['ft3','ลูกบาศก์ฟุต',28.316846592],['in3','ลูกบาศก์นิ้ว',.016387064]]},
  mass:{n:'น้ำหนัก',u:[['mg','มิลลิกรัม',1e-6],['g','กรัม',.001],['kg','กิโลกรัม',1],['t','ตัน (เมตริก)',1000],['oz','ออนซ์',.028349523125],['lb','ปอนด์',.45359237],['st','สโตน',6.35029318],['ozt','ทรอยออนซ์',.0311034768],['baht','บาททองคำ (15.244 ก.)',.015244],['salung','สลึง (3.811 ก.)',.003811]]},
  temp:{n:'อุณหภูมิ',u:[['C','เซลเซียส °C'],['F','ฟาเรนไฮต์ °F'],['K','เคลวิน K']]},
  energy:{n:'พลังงาน',u:[['J','จูล',1],['kJ','กิโลจูล',1000],['cal','แคลอรี (thermal)',4.184],['kcal','กิโลแคลอรี',4184],['Wh','วัตต์-ชั่วโมง',3600],['kWh','กิโลวัตต์-ชั่วโมง',3.6e6],['BTU','BTU',1055.05585262],['ftlb','ฟุต-ปอนด์',1.3558179483314]]},
  power:{n:'กำลัง',u:[['W','วัตต์',1],['kW','กิโลวัตต์',1000],['hp','แรงม้า (hp)',745.69987158227],['PS','แรงม้า (PS เมตริก)',735.49875],['BTUh','BTU/ชั่วโมง',.29307107],['ftlbm','ฟุต-ปอนด์/นาที',.0225969658]]},
  speed:{n:'ความเร็ว',u:[['ms','เมตร/วินาที',1],['kmh','กม./ชม.',1/3.6],['mph','ไมล์/ชม.',.44704],['kn','นอต',1852/3600],['fps','ฟุต/วินาที',.3048],['mach','มัค (~340.29 ม./วิ)',340.29]]},
  time:{n:'เวลา',u:[['ms_','มิลลิวินาที',.001],['s','วินาที',1],['min','นาที',60],['h','ชั่วโมง',3600],['d','วัน',86400],['wk','สัปดาห์',604800],['mo','เดือน (เฉลี่ย 30.4375 วัน)',2629800],['yr','ปี (365.25 วัน)',31557600]]},
  data:{n:'ข้อมูล',u:[['bit','บิต',.125],['B','ไบต์',1],['KB','กิโลไบต์ (1,000)',1e3],['MB','เมกะไบต์ (1,000²)',1e6],['GB','กิกะไบต์ (1,000³)',1e9],['TB','เทระไบต์ (1,000⁴)',1e12],['KiB','คิบิไบต์ (1,024)',1024],['MiB','เมบิไบต์ (1,024²)',1048576],['GiB','จิบิไบต์ (1,024³)',1073741824],['TiB','เทบิไบต์ (1,024⁴)',1099511627776]]},
  pressure:{n:'ความดัน',u:[['Pa','ปาสกาล',1],['kPa','กิโลปาสกาล',1000],['bar','บาร์',1e5],['atm','บรรยากาศ (atm)',101325],['mmHg','มิลลิเมตรปรอท',133.322387415],['psi','psi',6894.757293168],['torr','ทอร์',101325/760]]},
  angle:{n:'มุม',u:[['deg','องศา',1],['rad','เรเดียน',180/Math.PI],['grad','เกรเดียน',.9],['turn','รอบ',360]]},
  currency:{n:'สกุลเงิน',cur:true,u:[]}
};
var UORDER=['length','mass','temp','area','volume','speed','time','data','energy','power','pressure','angle','currency'];
function tempTo(v,from){ if(from==='C') return v; if(from==='F') return (v-32)*5/9; return v-273.15 }
function tempFrom(c,to){ if(to==='C') return c; if(to==='F') return c*9/5+32; return c+273.15 }
function unitList(cat){
  var c=UNITS[cat];
  if(c.cur){
    var d=FX.data(); if(!d) return [];
    return FX.codes().map(function(k){return [k,FX.flag(k)+' '+k+' — '+FX.name(k),1/d.rates[k]]});
  }
  return c.u;
}
function convertVal(cat,v,from,to){
  if(cat==='temp') return tempFrom(tempTo(v,from),to);
  var L=unitList(cat),f=null,t=null; L.forEach(function(u){if(u[0]===from)f=u[2];if(u[0]===to)t=u[2]});
  if(f==null||t==null) return null; return v*f/t;
}
function unitUI(root){
  var st=S.unit=S.unit||{cat:'length',val:'1',from:{},to:{}};
  function defaults(cat){var L=unitList(cat); if(!L.length) return; if(!st.from[cat]||!L.some(function(u){return u[0]===st.from[cat]}))st.from[cat]=L[0][0]; if(!st.to[cat]||!L.some(function(u){return u[0]===st.to[cat]}))st.to[cat]=(L[1]||L[0])[0];}
  function drawChips(){return '<div class="mpt-chips">'+UORDER.map(function(k){return '<button type="button" class="mpt-chip'+(k===st.cat?' active':'')+'" data-cat="'+k+'">'+UNITS[k].n+'</button>'}).join('')+'</div>'}
  function draw(){
    var cat=st.cat, L=unitList(cat); defaults(cat);
    var opt=function(sel){return L.map(function(u){return '<option value="'+u[0]+'"'+(u[0]===sel?' selected':'')+'>'+esc(u[1])+'</option>'}).join('')};
    var h=drawChips();
    if(UNITS[cat].cur&&!L.length){
      h+='<div class="mpt-card"><p class="mpt-hint" data-u="msg">กำลังโหลดเรทสกุลเงิน…</p></div>'; root.innerHTML=h; FX.load().then(draw).catch(function(){var m=q('[data-u="msg"]',root);if(m)m.textContent='ดึงเรทไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่'}); return;
    }
    h+='<div class="mpt-card"><div class="mpt-row"><input class="mpt-in" data-u="val" inputmode="decimal" autocomplete="off" value="'+esc(st.val)+'"><select class="mpt-sel" data-u="from">'+opt(st.from[cat])+'</select></div>'+
      '<div class="mpt-swap"><button type="button" data-u="swap" aria-label="สลับหน่วย">⇅</button></div>'+
      '<div class="mpt-row"><div class="mpt-out" data-u="out">—</div><select class="mpt-sel" data-u="to">'+opt(st.to[cat])+'</select></div></div>'+
      '<div class="mpt-card"><h3>ทุกหน่วย</h3><p class="mpt-hint">แตะหน่วยเพื่อตั้งเป็นปลายทาง</p><div class="mpt-all" data-u="all"></div>'+(UNITS[cat].cur?'<p class="mpt-note">เรทกลางตลาด อัปเดตล่าสุด '+when((FX.data()||{}).ts)+'</p>':'')+'</div>';
    root.innerHTML=h; calc();
  }
  function calc(){
    var cat=st.cat, v=pn(q('[data-u="val"]',root).value);
    var out=q('[data-u="out"]',root), all=q('[data-u="all"]',root), f=st.from[cat], t=st.to[cat];
    var r=v==null?null:convertVal(cat,v,f,t); out.textContent=r==null?'—':sig(r,10);
    all.innerHTML=unitList(cat).map(function(u){var x=v==null?null:convertVal(cat,v,f,u[0]);return '<button type="button" data-to="'+u[0]+'" class="'+(u[0]===t?'cur':'')+'"><span>'+esc(u[1])+'</span><span>'+(x==null?'—':sig(x,10))+'</span></button>'}).join('');
  }
  root.onclick=function(e){
    var b=e.target.closest('button'); if(!b) return;
    if(b.hasAttribute('data-cat')){st.cat=b.getAttribute('data-cat');save();draw();return}
    if(b.getAttribute('data-u')==='swap'){var c=st.cat,x=st.from[c];st.from[c]=st.to[c];st.to[c]=x;save();draw();return}
    if(b.hasAttribute('data-to')){st.to[st.cat]=b.getAttribute('data-to');q('[data-u="to"]',root).value=st.to[st.cat];save();calc()}
  };
  root.oninput=function(e){if(e.target.getAttribute('data-u')==='val'){st.val=e.target.value;save();calc()}};
  root.onchange=function(e){var u=e.target.getAttribute('data-u');if(u==='from'||u==='to'){st[u][st.cat]=e.target.value;save();calc()}};
  draw();
}
function calcUI(){
  var panel=q('#calc'); if(!panel) return;
  var body=q('[data-mpt="calc-body"]',panel), sub=q('[data-mpt="calc-sub"]',panel);
  var cur=S.calcSub||'std';
  function show(k){
    cur=k; S.calcSub=k; save();
    qa('button',sub).forEach(function(b){b.classList.toggle('active',b.getAttribute('data-sub')===k)});
    body.onclick=null;body.oninput=null;body.onchange=null;
    if(k==='unit') unitUI(body); else Calc.bind(body,k==='sci');
  }
  sub.addEventListener('click',function(e){var b=e.target.closest('button');if(b)show(b.getAttribute('data-sub'))});
  show(cur);
}

/* ================= ราคาทองคำ ================= */
var BAHT_G=15.244, OZ_G=31.1034768;
var GOLDSRC={
  assoc:{n:'สมาคมค้าทองคำ',url:'https://www.goldtraders.or.th/'},
  hsh:{n:'ฮั่วเซ่งเฮง',url:'https://www.huasengheng.com/'},
  spot:{n:'ทองคำโลก (XAU/USD)',url:'https://www.kitco.com/charts/gold'}
};
function fetchAssoc(){
  /* ราคาจากสมาคมค้าทองคำ ผ่าน API สาธารณะที่ดึงข้อมูลจากเว็บสมาคม */
  return fetchJSON('https://api.chnwt.dev/thai-gold-api/latest').then(function(j){
    var r=j&&j.response, p=r&&r.price; if(!p||!p.gold_bar) throw new Error('รูปแบบข้อมูลเปลี่ยน');
    var o={barBuy:pn(p.gold_bar.buy),barSell:pn(p.gold_bar.sell),ornBuy:p.gold?pn(p.gold.buy):null,ornSell:p.gold?pn(p.gold.sell):null,date:r.update_date||'',time:r.update_time||''};
    if(o.barBuy==null||o.barSell==null) throw new Error('ไม่มีราคา');
    o.ts=Date.now(); return o;
  });
}
function fetchHSH(){
  /* ฮั่วเซ่งเฮงไม่มี API สาธารณะที่ยืนยันได้ ลองเรียกจุดที่หน้าเว็บใช้ ถ้าเบราว์เซอร์บล็อก/รูปแบบเปลี่ยน จะแจ้งว่าดึงไม่ได้ */
  return fetchJSON('https://apicheckprice.huasengheng.com/api/values/getprice/').then(function(j){
    var arr=Array.isArray(j)?j:(j&&(j.data||j.Data||j.result))||[]; if(!Array.isArray(arr)||!arr.length) throw new Error('รูปแบบข้อมูลไม่รู้จัก');
    var o={};
    arr.forEach(function(it){
      if(!it||typeof it!=='object') return;
      var tk=Object.keys(it), type='', buy=null, sell=null;
      tk.forEach(function(k){var v=it[k]; if(/type|name/i.test(k)&&typeof v==='string') type+=' '+v; else if(/^buy$/i.test(k)) buy=pn(v); else if(/^sell$/i.test(k)) sell=pn(v)});
      if(buy==null||sell==null) return;
      if(/99\.?99/.test(type)) o.g9999={buy:buy,sell:sell};
      else if(/96\.?5/.test(type)&&!/ornament|รูปพรรณ/i.test(type)) o.g965={buy:buy,sell:sell};
    });
    if(!o.g9999&&!o.g965) throw new Error('ไม่พบราคาในข้อมูล');
    o.ts=Date.now(); return o;
  });
}
function fetchSpot(){
  return fetchJSON('https://api.gold-api.com/price/XAU').then(function(j){
    var p=pn(j&&j.price); if(p==null||p<=0) throw new Error('ไม่มีราคา'); return {usd:p,ts:Date.parse(j.updatedAt)||Date.now(),src:'gold-api.com'};
  }).catch(function(){
    return fetchJSON('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json').then(function(j){
      var p=j&&j.xau&&pn(j.xau.usd); if(p==null||p<=0) throw new Error('ไม่มีราคา'); return {usd:p,ts:Date.parse(j.date)||Date.now(),src:'currency-api (XAU)'};
    });
  });
}
function goldUI(){
  var root=q('[data-mpt="gold-body"]'); if(!root) return;
  var G=S.gold=S.gold||{}, st=S.goldui=S.goldui||{w:'1',unit:'baht'}, err={};
  root.innerHTML=
   '<div class="mpt-status"><span data-g="stat"></span><button type="button" class="mpt-btn" data-g="refresh">รีเฟรช</button></div>'+
   '<div class="mpt-card" data-g="assoc"></div><div class="mpt-card" data-g="hsh"></div><div class="mpt-card" data-g="spot"></div><div class="mpt-card" data-g="cmp"></div><div class="mpt-card" data-g="calc"></div>'+
   '<p class="mpt-note">ราคาทองคำเปลี่ยนได้หลายครั้งต่อวัน ข้อมูลนี้ใช้ประกอบการวางแผน ไม่ใช่ราคาซื้อขายจริง กรุณาตรวจราคาล่าสุดกับสมาคมค้าทองคำหรือร้านทองก่อนทำรายการ</p>'+
   '<div class="mpt-src">'+Object.keys(GOLDSRC).map(function(k){return '<a href="'+GOLDSRC[k].url+'" target="_blank" rel="noopener">เปิดเว็บ '+esc(GOLDSRC[k].n)+'</a>'}).join('')+'</div>';
  var el=function(k){return q('[data-g="'+k+'"]',root)};
  function usdthb(){return FX.thbPer('USD')}
  function theory(){
    var s=G.spot, r=usdthb(); if(!s||!r) return null;
    var perG=s.usd*r/OZ_G;
    return {perG:perG,perOz:s.usd*r,p965:perG*BAHT_G*0.965,p9999:perG*BAHT_G*0.9999};
  }
  function box(k,v,cls){return '<div class="mpt-box"><div class="k">'+k+'</div><div class="v '+(cls||'')+'">'+v+'</div></div>'}
  function head(t,sub,tag){return '<h3>'+t+(tag||'')+'</h3><p class="mpt-hint">'+sub+'</p>'}
  function fail(key,msg){return '<p class="mpt-note" style="color:var(--red)">'+msg+'</p>'}
  function drawAssoc(){
    var a=G.assoc, h=head('ทองไทย 96.5% — สมาคมค้าทองคำ','ราคาอ้างอิงมาตรฐานของไทย หน่วย บาท/บาททองคำ');
    if(a){h+='<div class="mpt-g2">'+box('ทองคำแท่ง รับซื้อ','฿ '+money(a.barBuy,0),'buy')+box('ทองคำแท่ง ขายออก','฿ '+money(a.barSell,0),'sell')+
      (a.ornSell?box('ทองรูปพรรณ รับซื้อ (ฐานภาษี)','฿ '+money(a.ornBuy,0),'buy')+box('ทองรูปพรรณ ขายออก','฿ '+money(a.ornSell,0),'sell'):'')+'</div>'+
      '<p class="mpt-note">'+esc(a.date)+' '+esc(a.time)+(err.assoc?' · <b style="color:var(--red)">รอบล่าสุดดึงไม่สำเร็จ แสดงค่าที่เก็บไว้</b>':'')+'</p>'}
    else h+=fail('assoc','ยังดึงราคาจากสมาคมไม่ได้: '+esc(err.assoc||'กำลังโหลด…')+' — กดรีเฟรช หรือเปิดเว็บสมาคมด้านล่าง');
    el('assoc').innerHTML=h;
  }
  function drawHSH(){
    var a=G.hsh, h=head('ฮั่วเซ่งเฮง','ทองคำแท่ง 96.5% และ 99.99% หน่วย บาท/บาททองคำ');
    if(a){h+='<div class="mpt-g2">';
      if(a.g965) h+=box('96.5% รับซื้อ','฿ '+money(a.g965.buy,0),'buy')+box('96.5% ขายออก','฿ '+money(a.g965.sell,0),'sell');
      if(a.g9999) h+=box('99.99% รับซื้อ','฿ '+money(a.g9999.buy,0),'buy')+box('99.99% ขายออก','฿ '+money(a.g9999.sell,0),'sell');
      h+='</div><p class="mpt-note">ดึงเมื่อ '+when(a.ts)+(err.hsh?' · <b style="color:var(--red)">รอบล่าสุดดึงไม่สำเร็จ แสดงค่าที่เก็บไว้</b>':'')+'</p>'}
    else h+=fail('hsh','ดึงราคาจากฮั่วเซ่งเฮงไม่ได้'+(err.hsh?' ('+esc(err.hsh)+')':'')+' เว็บนี้ไม่เปิดให้เบราว์เซอร์ดึงข้อมูลตรง ๆ ได้เสมอ ดูราคา 99.99% ประมาณการจากทองโลกด้านล่างแทน หรือเปิดเว็บฮั่วเซ่งเฮง');
    el('hsh').innerHTML=h;
  }
  function drawSpot(){
    var s=G.spot, t=theory(), h=head('ทองคำโลก (Spot)','ราคาตลาดโลก 99.99% ต่อทรอยออนซ์');
    if(s){h+='<div class="mpt-g2">'+box('USD / ออนซ์','$ '+money(s.usd,2))+box('อัตราแลกเปลี่ยน',usdthb()?'1 USD = '+money(usdthb(),2)+' ฿':'—');
      if(t) h+=box('บาท / กรัม','฿ '+money(t.perG,2))+box('บาท / ออนซ์','฿ '+money(t.perOz,0));
      h+='</div><p class="mpt-note">'+when(s.ts)+' · '+esc(s.src)+(err.spot?' · <b style="color:var(--red)">รอบล่าสุดดึงไม่สำเร็จ แสดงค่าที่เก็บไว้</b>':'')+'</p>'}
    else h+=fail('spot','ดึงราคาทองโลกไม่ได้: '+esc(err.spot||'กำลังโหลด…'));
    el('spot').innerHTML=h;
  }
  function drawCmp(){
    var t=theory(), a=G.assoc, h=head('ราคาทองไทยเทียบทองโลก','ประมาณการจากราคาโลก × ค่าเงินบาท ต่อ 1 บาททองคำ (15.244 กรัม)','<span class="mpt-tag est">ประมาณการ</span>');
    if(!t){h+='<p class="mpt-note">ต้องมีราคาทองโลกและเรท USD/THB ก่อน</p>'; el('cmp').innerHTML=h; return}
    h+='<div class="mpt-g2">'+box('ทอง 96.5% (ทฤษฎี)','฿ '+money(t.p965,0))+box('ทอง 99.99% (ทฤษฎี)','฿ '+money(t.p9999,0));
    if(a){var d=a.barSell-t.p965; h+=box('ขายออกสมาคม − ทฤษฎี','฿ '+money(d,0),d>=0?'sell':'buy')+box('ส่วนต่าง %',money(d/t.p965*100,2)+'%')}
    h+='</div><p class="mpt-note">คำนวณ = ราคาโลก (USD/ออนซ์) × อัตรา USD/THB ÷ 31.1035 × 15.244 × ความบริสุทธิ์ ไม่รวมพรีเมียม ภาษี หรือค่ากำเหน็จ จึงต่างจากราคาซื้อขายจริง</p>';
    el('cmp').innerHTML=h;
  }
  function drawCalc(){
    var a=G.assoc, h=head('คำนวณมูลค่าทองคำแท่ง 96.5%','คิดจากราคาสมาคมค้าทองคำ');
    h+='<div class="mpt-row"><input class="mpt-in" data-g="w" inputmode="decimal" autocomplete="off" value="'+esc(st.w)+'"><select class="mpt-sel" data-g="u"><option value="baht"'+(st.unit==='baht'?' selected':'')+'>บาททองคำ</option><option value="salung"'+(st.unit==='salung'?' selected':'')+'>สลึง</option><option value="g"'+(st.unit==='g'?' selected':'')+'>กรัม</option></select></div><div class="mpt-g2" data-g="cout"></div>';
    el('calc').innerHTML=h; calcOut();
  }
  function calcOut(){
    var a=G.assoc, w=pn(q('[data-g="w"]',root).value), u=q('[data-g="u"]',root).value, o=q('[data-g="cout"]',root);
    if(!a||w==null){o.innerHTML='';return}
    var b=u==='baht'?w:u==='salung'?w/4:w/BAHT_G;
    o.innerHTML=box('ขายให้ร้าน (รับซื้อ)','฿ '+money(b*a.barBuy,0),'buy')+box('ซื้อจากร้าน (ขายออก)','฿ '+money(b*a.barSell,0),'sell')+box('น้ำหนักรวม',money(b*BAHT_G,3)+' กรัม')+box('เนื้อทองบริสุทธิ์',money(b*BAHT_G*0.965,3)+' กรัม');
  }
  function drawAll(){drawAssoc();drawHSH();drawSpot();drawCmp();calcOut();stat()}
  function stat(msg){
    var ts=[G.assoc&&G.assoc.ts,G.hsh&&G.hsh.ts,G.spot&&G.spot.ts].filter(Boolean).sort(function(a,b){return b-a})[0];
    el('stat').textContent=msg||(ts?'อัปเดตล่าสุด '+when(ts):'ยังไม่มีข้อมูล');
  }
  function refresh(){
    var btn=el('refresh'); btn.disabled=true; stat('กำลังโหลดราคา…'); err={};
    var jobs=[
      FX.load().catch(function(){}),
      fetchAssoc().then(function(o){G.assoc=o}).catch(function(e){err.assoc=e.message||'ผิดพลาด'}),
      fetchHSH().then(function(o){G.hsh=o}).catch(function(e){err.hsh=e.message||'ผิดพลาด'}),
      fetchSpot().then(function(o){G.spot=o}).catch(function(e){err.spot=e.message||'ผิดพลาด'})
    ];
    Promise.all(jobs).then(function(){G.fetched=Date.now();save();drawAll()}).then(function(){btn.disabled=false});
    jobs.forEach(function(p){p.then(drawAll)});
  }
  root.addEventListener('click',function(e){var b=e.target.closest('[data-g="refresh"]');if(b)refresh()});
  root.addEventListener('input',function(e){if(e.target.getAttribute('data-g')==='w'){st.w=e.target.value;save();calcOut()}});
  root.addEventListener('change',function(e){if(e.target.getAttribute('data-g')==='u'){st.unit=e.target.value;save();calcOut()}});
  drawCalc();drawAll();
  goldUI.opened=function(){if(!G.fetched||Date.now()-G.fetched>5*60e3)refresh()};
  goldUI.refresh=refresh;
}

/* ================= เปิดแท็บ ================= */
function init(){
  if(!q('#calc')||!q('#fx')||!q('#gold')) return;
  try{calcUI()}catch(e){console.error('calc',e)}
  try{fxUI()}catch(e){console.error('fx',e)}
  try{goldUI()}catch(e){console.error('gold',e)}
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-tab]'); if(!b) return;
    var t=b.getAttribute('data-tab');
    if(t==='fx'&&FX.opened) FX.opened();
    if(t==='gold'&&goldUI.opened) goldUI.opened();
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
window.MPTools={FX:FX};
})();
