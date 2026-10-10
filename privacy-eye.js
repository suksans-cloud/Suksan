/* My Family Funds — ปุ่มตา ซ่อน/แสดงตัวเลขเงิน (My Portfolio / My Money)
 * 1) สลับ class mff-hide-money ที่ <body> (CSS ของแต่ละหน้าซ่อนตัวเลขตามที่ระบุไว้)
 * 2) สแกนหาตัวเลขเงินที่เหลือในหน้าอีกชั้น (฿… / 1,234 / … บาท) แล้วเบลอให้ด้วย กันหลุดเวลามีส่วนใหม่เพิ่มเข้ามา */
(function(){
  'use strict';
  var KEY='mff_hide_money_v1', CLS='mff-hide-money', hidden=false, btn=null, mo=null, timer=0;
  try{ hidden=localStorage.getItem(KEY)==='1'; }catch(e){}
  var AMT=/฿\s*-?[\d,]+(?:\.\d+)?|-?\d{1,3}(?:,\d{3})+(?:\.\d+)?|[\d,.]+\s*บาท/;
  var NAV=/^\s*฿\s*\d{1,3}\.\d{4}\s*$/;                       // ราคา NAV ไม่ใช่ข้อมูลส่วนตัว
  var NOTE=/ค่าเริ่มต้นตามเกณฑ์|ไม่ใช่คำแนะนำ/;               // ข้อความอธิบายเกณฑ์ ไม่ต้องเบลอ
  function isYear(s){ return s.length===4&&+s>=2400&&+s<=2700; }
  function scan(){
    if(!document.body) return;
    var els=document.body.getElementsByTagName('*');
    for(var i=0;i<els.length;i++){
      var el=els[i];
      if(el.hasAttribute('data-mff-amt')||el.namespaceURI!=='http://www.w3.org/1999/xhtml'||el.id==='privacyEye') continue;
      var tag=el.tagName;
      if(tag==='SCRIPT'||tag==='STYLE'||tag==='CANVAS'||tag==='BUTTON'&&el.id==='privacyEye') continue;
      if(tag==='INPUT'){
        var v=String(el.value||'').replace(/,/g,'');
        if(/^\d{4,}(\.\d+)?$/.test(v)&&!isYear(v)) el.setAttribute('data-mff-amt','');
        continue;
      }
      var own=''; for(var n=el.firstChild;n;n=n.nextSibling) if(n.nodeType===3) own+=n.nodeValue;
      if(own&&AMT.test(own)&&!NAV.test(own)&&!NOTE.test(own)) el.setAttribute('data-mff-amt','');
    }
  }
  function later(){ clearTimeout(timer); timer=setTimeout(scan,220); }
  function apply(){
    document.body.classList.toggle(CLS,hidden);
    if(btn){ btn.textContent=hidden?'🙈':'👁'; btn.setAttribute('aria-pressed',hidden?'true':'false'); btn.title=hidden?'แสดงตัวเลข':'ซ่อนตัวเลข'; }
    if(mo){ mo.disconnect(); mo=null; }
    if(hidden){
      scan();
      mo=new MutationObserver(later);
      mo.observe(document.body,{childList:true,subtree:true,characterData:true});
      setTimeout(scan,800); setTimeout(scan,2500);
    }
  }
  function init(){
    var st=document.createElement('style');
    st.textContent='body.'+CLS+' [data-mff-amt]{filter:blur(8px);user-select:none;transition:filter .15s}'
      +'#privacyEye{position:fixed!important;right:52px!important;left:auto!important;top:calc(env(safe-area-inset-top,0px) + 12px)!important;width:30px!important;height:30px!important;padding:0!important;display:grid!important;place-items:center;border-radius:50%!important;border:1px solid #E1E6EA!important;background:rgba(255,255,255,.92)!important;box-shadow:none!important;font-size:14px!important;line-height:1!important;opacity:.85;z-index:99999;cursor:pointer}';
    document.head.appendChild(st);
    btn=document.getElementById('privacyEye');
    if(!btn){ btn=document.createElement('button'); btn.id='privacyEye'; btn.type='button'; btn.setAttribute('aria-label','ซ่อนหรือแสดงตัวเลขเงิน'); document.body.appendChild(btn); }
    btn.onclick=function(){ hidden=!hidden; try{ localStorage.setItem(KEY,hidden?'1':'0'); }catch(e){} apply(); };
    apply();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
