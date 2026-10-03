/* My Family Funds — Google Sign-In + PIN lock (V85)
 * 1) เข้าสู่ระบบด้วย Google ครั้งเดียว → session เก็บใน localStorage ใช้ร่วมกันทุกหน้า
 * 2) ตั้ง PIN 6 หลักต่อเครื่อง (เก็บเป็น PBKDF2 hash ไม่เก็บ PIN จริง)
 * 3) แอปล็อกเมื่อเปิดใหม่ / อยู่เบื้องหลังเกิน 1 นาที / ไม่ใช้งานเกิน 5 นาที แล้วปลดล็อกด้วย PIN
 */
(function(){
'use strict';
document.documentElement.classList.add('mff-auth-pending');
const SK='mff_admin_session_v2',PK='mff_pin_v2',UK='mff_unlocked_v2',AK='mff_active_v2';
const HIDDEN_MS=60e3,IDLE_MS=5*60e3,MAX_TRIES=5;
const ls=localStorage,ss=sessionStorage;
const J=s=>{try{return JSON.parse(s)}catch(e){return null}};
const session=()=>J(ls.getItem(SK));
const endpoint=()=>window.MFF_ENDPOINT||'';
const clientId=()=>window.MFF_GOOGLE_CLIENT_ID||ls.getItem('google_client_id')||'';
function request(action,data){return fetch(endpoint(),{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({action},data||{}))}).then(r=>r.json())}
function saveSession(v){ls.setItem(SK,JSON.stringify(v));ss.setItem('mff_auth_token',v.token)}
function clearAll(){ls.removeItem(SK);ls.removeItem(PK);ss.removeItem(UK);ss.removeItem('mff_auth_token');ss.removeItem(TK);ss.removeItem(TE);ls.removeItem('google_sheets_connected')}

/* ---------- Sheets ผ่าน Apps Script: ไม่ต้องขอสิทธิ์ Google ซ้ำในแต่ละหน้า ---------- */
const TK='mff_google_sheets_access_token_v1',TE='mff_google_sheets_expires_at_v1';
function prime(){const s=session();if(!s||!s.token||s.expiresAt<=Date.now())return;try{ss.setItem(TK,'mff-proxy');ss.setItem(TE,String(s.expiresAt));ls.setItem('google_sheets_connected','1')}catch(e){}}
function adoptConfig(r){try{if(r&&r.sheetId&&!ls.getItem('google_sheet_id'))ls.setItem('google_sheet_id',r.sheetId)}catch(e){}}
function sheetsErr(st,bd){try{let m=bd;try{const j=JSON.parse(bd);m=(j.error&&(j.error.message||j.error))||bd}catch(e){}
  let d=document.getElementById('mff-sheets-err');if(!d){d=document.createElement('div');d.id='mff-sheets-err';d.style.cssText='position:fixed;left:10px;right:10px;bottom:76px;z-index:2147483100;background:#7a1f2b;color:#fff;border-radius:12px;padding:10px 12px;font:12px/1.5 system-ui;word-break:break-word;max-height:30vh;overflow:auto';d.onclick=()=>d.remove();document.body.appendChild(d)}
  d.textContent='Sheets '+st+': '+String(m).slice(0,400)+' (แตะเพื่อปิด)';clearTimeout(d._t);d._t=setTimeout(()=>d.remove(),15000)}catch(e){}}
const _fetch=window.fetch.bind(window);
window.fetch=function(u,o){
  const url=typeof u==='string'?u:(u&&u.url)||'';
  if(!/^https:\/\/sheets\.googleapis\.com\/v4\/spreadsheets\//.test(url))return _fetch(u,o);
  const s=session();o=o||{};
  if(!s||!s.token)return Promise.resolve(new Response('{"error":"no session"}',{status:401}));
  return request('sheetsProxy',{token:s.token,url,method:(o.method||'GET').toUpperCase(),body:typeof o.body==='string'?o.body:null})
    .then(r=>{if(r.auth===false){ls.removeItem(SK);setTimeout(()=>location.reload(),300);return new Response('{"error":"session หมดอายุ"}',{status:401})}let st=r.status||(r.ok?200:500);if(st===401||st===403)st=502;/* แสดงสาเหตุจริงแทนข้อความ 'สิทธิ์หมดอายุ' */const bd=r.body||JSON.stringify({error:r.error||'proxy error'});if(st>=400)sheetsErr(st,bd);return new Response(bd,{status:st,headers:{'Content-Type':'application/json'}})})
    .catch(()=>new Response('{"error":"network"}',{status:503}));
};
prime();
(function(){const st=document.createElement('style');st.textContent='#connectBanner,#connectBtn,#sheetConnectBtn,#connectSheetsBtn{display:none!important}';document.head.appendChild(st)})();

const css=`
html.mff-auth-pending body>*:not(#mff-root){visibility:hidden!important}
#mff-root{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:#F2F4F6;font-family:'Noto Sans Thai',system-ui,-apple-system,sans-serif;color:#2E3A42;overflow:auto}
#mff-root *{box-sizing:border-box}
html.mff-locked,html.mff-locked body{overflow:hidden!important;overscroll-behavior:none}
#mff-root{overscroll-behavior:contain}
.mfl-card{width:min(100%,400px);background:#fff;border-radius:26px;overflow:hidden;display:grid;box-shadow:0 20px 60px rgba(7,35,64,.14)}
.mfl-main{padding:44px 30px 34px;text-align:center;display:flex;flex-direction:column;align-items:center;min-height:520px;justify-content:center}
.mfl-side{display:none}
.mfl-brand{font-family:'Prompt','Noto Sans Thai',sans-serif;font-weight:700;font-size:50px;line-height:1.1;letter-spacing:-1.5px;margin:0;background:linear-gradient(90deg,#3A93C8,#072340);-webkit-background-clip:text;background-clip:text;color:transparent}
.mfl-sub{font-size:13px;color:#8B9AA3;margin:6px 0 30px}
.mfl-gwrap{min-height:44px;display:flex;justify-content:center}
.mfl-hint{font-size:12px;color:#8B9AA3;line-height:1.7;margin-top:24px;max-width:270px}
.mfl-err{min-height:20px;margin-top:12px;font-size:13px;font-weight:600;color:#D12F3F}
.mfl-field{width:100%;max-width:280px;height:46px;border:1.5px solid #3A6C93;border-radius:14px;padding:0 14px;font-size:13px;margin-top:14px;color:#2E3A42;outline:none}
.mfl-btn{height:44px;min-width:180px;padding:0 26px;border-radius:999px;border:1.5px solid #072340;background:#fff;color:#072340;font:600 14px 'Noto Sans Thai',sans-serif;cursor:pointer;margin-top:12px}
.mfl-link{background:none;border:0;color:#5C6B74;font:500 12px 'Noto Sans Thai',sans-serif;margin-top:20px;cursor:pointer;text-decoration:underline}
.mfl-title{font-family:'Prompt','Noto Sans Thai',sans-serif;font-size:24px;font-weight:700;color:#072340;margin:0}
.mfl-dots{display:flex;gap:14px;margin:0 0 26px;justify-content:center}
.mfl-dots i{width:13px;height:13px;border-radius:50%;border:1.6px solid #3A6C93;transition:.12s}
.mfl-dots i.on{background:#072340;border-color:#072340}
.mfl-dots.bad{animation:mffshake .35s}
@keyframes mffshake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.mfl-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:270px}
.mfl-pad button{height:56px;border-radius:50%;width:56px;justify-self:center;border:1px solid #E1E6EA;background:#F7F9FA;color:#072340;font:600 22px 'Prompt',sans-serif;cursor:pointer;touch-action:manipulation}
.mfl-pad button:active{background:#E3EBF1}
.mfl-pad button.alt{border:0;background:none;font-size:13px;color:#5C6B74;font-family:'Noto Sans Thai',sans-serif}
@media(min-width:760px){
 .mfl-card{width:min(100%,900px);grid-template-columns:1.1fr 1fr;min-height:540px}
 .mfl-side{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:40px;color:#fff;border-radius:28px 0 0 28px;background:linear-gradient(180deg,#3A6C93 0%,#072340 100%)}
 .mfl-side h2{font-family:'Prompt',sans-serif;font-size:46px;margin:0 0 14px}
 .mfl-side p{font-size:15px;line-height:1.7;margin:0;opacity:.92;max-width:260px}
 .mfl-card{direction:ltr}
}
#mff-chips{position:fixed;right:10px;top:10px;z-index:99999;display:flex;gap:6px}
#mff-chips button{border:1px solid #E1E6EA;background:#fff;color:#072340;border-radius:12px;padding:7px 10px;font:600 11px 'Noto Sans Thai',system-ui;opacity:.85}
`;
let root;
function ensureStyle(){
  if(document.getElementById('mff-style'))return;
  const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Prompt:wght@600;700&family=Noto+Sans+Thai:wght@400;500;600&display=swap';document.head.appendChild(l);
  const s=document.createElement('style');s.id='mff-style';s.textContent=css;document.head.appendChild(s)}
function shell(inner){
  ensureStyle();
  document.documentElement.classList.add('mff-locked');
  if(!root){root=document.createElement('div');root.id='mff-root';document.body.appendChild(root)}
  root.innerHTML=`<section class="mfl-card" role="dialog" aria-modal="true"><div class="mfl-main">${inner}</div><aside class="mfl-side"><h2>Hello</h2><p>พร้อมดูแลแผนการเงินของครอบครัวคุณ ทุกที่ ทุกเวลา</p></aside></section>`;
  document.documentElement.classList.remove('mff-auth-pending');
  return root.querySelector('.mfl-main');
}
function done(){if(root){root.remove();root=null}document.documentElement.classList.remove('mff-locked');document.documentElement.classList.remove('mff-auth-pending');ready()}

/* ---------- PIN ---------- */
const b2h=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function hashPin(pin,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);return b2h(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:150000},k,256))}
function pinScreen(title,sub,onDone,extra){
  const m=shell(`<h1 class="mfl-title"></h1><div class="mfl-sub"></div><div class="mfl-dots">${'<i></i>'.repeat(6)}</div><div class="mfl-pad">${['1','2','3','4','5','6','7','8','9','ล้าง','0','⌫'].map(k=>`<button type="button" class="${k.length>1||k==='⌫'?'alt':''}" data-k="${k}">${k}</button>`).join('')}</div><div class="mfl-err"></div>${extra||''}`);
  m.querySelector('.mfl-title').textContent=title;m.querySelector('.mfl-sub').textContent=sub;
  const dots=[...m.querySelectorAll('.mfl-dots i')],err=m.querySelector('.mfl-err'),box=m.querySelector('.mfl-dots');let pin='',busy=false;
  const paint=()=>dots.forEach((d,i)=>d.classList.toggle('on',i<pin.length));
  m.querySelector('.mfl-pad').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||busy)return;const k=b.dataset.k;
    if(k==='ล้าง')pin='';else if(k==='⌫')pin=pin.slice(0,-1);else if(pin.length<6)pin+=k;
    paint();err.textContent='';
    if(pin.length===6){busy=true;const r=await onDone(pin);busy=false;if(r){err.textContent=r;box.classList.add('bad');setTimeout(()=>box.classList.remove('bad'),400)}pin='';paint()}});
  return m;
}
function setupPin(){
  let first='';
  const step1=()=>pinScreen('ตั้ง PIN 6 หลัก','ใช้ปลดล็อกแอปบนเครื่องนี้',async p=>{first=p;setTimeout(step2,150)});
  const step2=()=>pinScreen('ยืนยัน PIN อีกครั้ง','พิมพ์ PIN เดิมอีกรอบ',async p=>{
    if(p!==first){setTimeout(step1,500);return 'PIN ไม่ตรงกัน ลองตั้งใหม่'}
    const salt=b2h(crypto.getRandomValues(new Uint8Array(16)));
    ls.setItem(PK,JSON.stringify({email:session().email,salt,hash:await hashPin(p,salt),tries:0}));
    unlocked();done()});
  step1();
}
function unlockScreen(){
  const s=session();
  pinScreen('ใส่ PIN เพื่อปลดล็อก',s.name||s.email,async p=>{
    const rec=J(ls.getItem(PK));
    if(rec&&await hashPin(p,rec.salt)===rec.hash){rec.tries=0;ls.setItem(PK,JSON.stringify(rec));unlocked();done();return}
    rec.tries=(rec.tries||0)+1;ls.setItem(PK,JSON.stringify(rec));
    if(rec.tries>=MAX_TRIES){clearAll();setTimeout(loginScreen,700);return 'PIN ผิดเกินกำหนด กรุณาเข้าสู่ระบบ Google ใหม่'}
    return `PIN ไม่ถูกต้อง (เหลือ ${MAX_TRIES-rec.tries} ครั้ง)`;
  },'<button class="mfl-link" type="button" id="mff-forgot">ลืม PIN? เข้าสู่ระบบด้วย Google ใหม่</button>');
  root.querySelector('#mff-forgot').onclick=()=>{clearAll();loginScreen()};
}

/* ---------- Google login ---------- */
function loadGsi(){return new Promise((res,rej)=>{if(window.google&&google.accounts&&google.accounts.id)return res();const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
function loginScreen(){
  const m=shell(`<h1 class="mfl-brand">Welcome</h1><div class="mfl-sub">เข้าสู่ระบบด้วยบัญชี Google</div><div class="mfl-gwrap" id="mff-g"></div><div class="mfl-err"></div><div class="mfl-hint">เข้าสู่ระบบครั้งเดียวใช้ได้ทุกหน้า จากนั้นตั้ง PIN 6 หลักไว้ปลดล็อกแอป</div>`);
  const err=m.querySelector('.mfl-err');
  if(!clientId()){
    m.querySelector('.mfl-gwrap').innerHTML=`<div><input class="mfl-field" id="mff-cid" placeholder="วาง Google OAuth Client ID"><br><button class="mfl-btn" id="mff-cid-ok" type="button">บันทึก</button></div>`;
    m.querySelector('#mff-cid-ok').onclick=()=>{const v=m.querySelector('#mff-cid').value.trim();if(!/\.apps\.googleusercontent\.com$/.test(v)){err.textContent='Client ID ไม่ถูกต้อง';return}ls.setItem('google_client_id',v);loginScreen()};
    return;
  }
  loadGsi().then(()=>{
    google.accounts.id.initialize({client_id:clientId(),callback:async resp=>{
      err.textContent='กำลังตรวจสอบ…';
      try{const r=await request('googleLogin',{idToken:resp.credential});
        if(r.ok&&r.token){adoptConfig(r);const old=J(ls.getItem(PK));if(old&&old.email!==r.email)ls.removeItem(PK);saveSession({token:r.token,email:r.email,name:r.name||'',expiresAt:r.expiresAt});boot();return}
        err.textContent=r.error||'เข้าสู่ระบบไม่สำเร็จ';
      }catch(e){err.textContent='เชื่อมต่อระบบยืนยันไม่ได้ ตรวจสอบอินเทอร์เน็ตและการ Deploy Apps Script'}}});
    google.accounts.id.renderButton(m.querySelector('#mff-g'),{theme:'outline',size:'large',shape:'pill',text:'continue_with',width:280,locale:'th'});
  }).catch(()=>{err.textContent='โหลด Google Sign-In ไม่ได้ ตรวจสอบอินเทอร์เน็ต'});
}

/* ---------- lock state ---------- */
function unlocked(){const n=String(Date.now());ss.setItem(UK,n);ss.setItem(AK,n)}
function isLocked(){const u=+ss.getItem(UK),a=+ss.getItem(AK);return !u||Date.now()-a>IDLE_MS}
function lockNow(){ss.removeItem(UK);if(!root&&session()&&ls.getItem(PK))unlockScreen()}
function ready(){
  const s=session();if(!s||document.getElementById('mff-chips'))return;ensureStyle();
  const c=document.createElement('div');c.id='mff-chips';
  c.innerHTML='<button type="button" data-a="lock">🔒 ล็อก</button><button type="button" data-a="out">ออกจากระบบ</button>';
  c.onclick=async e=>{const a=e.target.dataset.a;if(a==='lock')lockNow();if(a==='out'){try{await request('adminLogout',{token:s.token})}catch(x){}clearAll();location.reload()}};
  document.body.appendChild(c);
  let hiddenAt=0,t=0;
  const touch=()=>{const n=Date.now();if(n-t>5000&&!root){t=n;ss.setItem(AK,String(n))}};
  ['pointerdown','keydown','scroll','touchstart'].forEach(ev=>addEventListener(ev,touch,{passive:true}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=Date.now();else if(hiddenAt&&Date.now()-hiddenAt>HIDDEN_MS)lockNow()});
  setInterval(()=>{if(!root&&isLocked())lockNow()},15000);
}

async function boot(){
  const s=session();
  if(!s||!s.token||s.expiresAt<=Date.now()){clearAll();return loginScreen()}
  ss.setItem('mff_auth_token',s.token);prime();
  if(navigator.onLine){try{const r=await request('validateAdminSession',{token:s.token});if(!(r.ok&&r.authenticated)){clearAll();return loginScreen()}adoptConfig(r)}catch(e){/* ออฟไลน์/เชื่อมต่อไม่ได้ → ใช้ session ในเครื่อง */}}
  const rec=J(ls.getItem(PK));
  if(!rec||rec.email!==s.email)return setupPin();
  if(isLocked())return unlockScreen();
  done();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
