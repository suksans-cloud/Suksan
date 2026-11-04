/* My Family Funds — unified colorful icon system */
(function(){
'use strict';
var icons={
'👤':['M20 21a8 8 0 0 0-16 0','M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
'💼':['M3 7h18v13H3z','M8 7V4h8v3M3 12h18M10 12v2h4v-2'],
'📊':['M4 19V9M10 19V5M16 19v-7M3 20h18','m14 6 3-3 3 2'],
'📚':['M4 4h5v16H4z','M10 4h5v16h-5z','M16 4h4v16h-4z'],
'📝':['M5 3h14v18H5z','M8 8h8M8 12h8M8 16h5'],
'🛒':['M3 4h2l2.2 11h10.9L21 8H6','M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2','M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2'],
'🎯':['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z','M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z','M12 12h.01'],
'💰':['M3 7h18v13H3z','M3 10h18','M15 14h3'],
'⚠️':['M12 3 2 21h20L12 3z','M12 9v5M12 17h.01'],
'🪪':['M3 5h18v14H3z','M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z','M5.5 15c.4-2 4.6-2 5 0M13 9h5M13 13h5'],
'🧾':['M6 3h12v18l-3-2-3 2-3-2-3 2z','M9 8h6M9 12h6M9 16h3'],
'☁️':['M7 18a4 4 0 1 1 .6-8A5.5 5.5 0 0 1 18 9a4.5 4.5 0 1 1 0 9z'],
'⚡':['m13 2-9 12h7l-1 8 10-13h-7z'],
'🎯':['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z','M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z'],
'🔐':['M5 10h14v11H5z','M8 10V7a4 4 0 1 1 8 0v3','M12 14v3'],
'📅':['M4 5h16v16H4z','M8 3v4M16 3v4M4 10h16','M8 14h.01M12 14h.01M16 14h.01'],
'✍️':['M4 20h4l11-11-4-4L4 16z','m13 6 4 4','M4 20l2-5'],
'🧰':['M3 8h18v13H3z','M8 8V5h8v3','M3 13h18M10 13v2h4v-2'],
'🏠':['m3 11 9-8 9 8','M5 10v11h14V10','M9 21v-7h6v7'],
'❤️':['M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.8 4.8 0 0 1 8.8-2.5 4.8 4.8 0 0 1 8.8 2.5z'],
'🩺':['M6 3v5a4 4 0 0 0 8 0V3','M10 3v5','M14 19a4 4 0 1 0 8 0 4 4 0 0 0-8 0z','M18 15V9a4 4 0 0 0-4-4'],
'🔦':['M8 3h8l2 6-4 3v8H10v-8L6 9z','M9 6h6'],
'🔋':['M5 7h14v14H5z','M9 4h6v3H9z','M12 10v8'],
'📻':['M3 7h18v14H3z','M5 4l14 3','M7 12h.01M11 12h.01M15 12h.01','M7 16h10'],
'🔋':['M5 7h14v14H5z','M9 4h6v3H9z','M12 10v8'],
'💧':['M12 2S5 11 5 15a7 7 0 0 0 14 0c0-4-7-13-7-13z'],
'🍚':['M4 14c0 3.5 3.6 6 8 6s8-2.5 8-6H4z','M5 11c1-2 3.4-3 7-3s6 1 7 3','M8 6c.7-1 1.3-1 2 0M14 6c.7-1 1.3-1 2 0'],
'🥛':['M7 3h10l-1 18H8L7 3z','M7.5 7h9'],
'💊':['M7 5a5 5 0 0 1 7 0l5 5a5 5 0 0 1-7 7l-5-5a5 5 0 0 1 0-7z','m9 7 8 8'],
'🧼':['M7 5l3-2h5l3 3-2 2H8z','M6 9h12l-1 11H7L6 9z','M10 13h.01M14 16h.01'],
'🦺':['M8 3h8l3 5-2 13H7L5 8z','M8 3l4 5 4-5','M9 9l-1 12M15 9l1 12','M9 13h6'],
'💵':['M3 6h18v12H3z','M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z','M6 9h.01M18 15h.01'],
'🥫':['M5 4h14v16H5z','M5 7h14M5 17h14'],
'🛟':['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z','M8 8l8 8M16 8l-8 8','M12 2v4M12 18v4M2 12h4M18 12h4'],
'🧴':['M8 3h8v4H8z','M9 7h6v14H9z','M11 11h2'],
'🧸':['M7 8a5 5 0 1 1 10 0v9a5 5 0 0 1-10 0z','M5 5a2 2 0 1 0 4 0M15 5a2 2 0 1 0 4 0','M10 13h.01M14 13h.01'],
'📦':['M3 7l9-4 9 4v11l-9 4-9-4z','M3 7l9 4 9-4M12 11v11','M8 5l9 4'],
'🧯':['M7 8h10v13H7z','M9 8V5h6v3M12 5V3h5','M17 4h3'],
'🪫':['M5 7h14v14H5z','M9 4h6v3H9z','M8 12h8'],
'🔔':['M18 9a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6','M10 20a2 2 0 0 0 4 0'],
'🔎':['M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z','m16 16 6 6'],
'⚙️':['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z','M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.8-2.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.8 2.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.4 1z'],
'🔍':['M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z','m16 16 6 6'],
'➕':['M12 5v14M5 12h14'],
'✓':['M5 12l4 4L19 6'],
'＋':['M12 5v14M5 12h14'],
'◫':['M4 4h16v16H4z','M4 10h16M10 10v10'],
'📈':['M3 18l6-6 4 3 8-9','M15 6h6v6'],
'🥧':['M12 3a9 9 0 1 0 9 9h-9z','M14 3v7h7a9 9 0 0 0-7-7z'],
'🐷':['M4 12a8 7 0 1 0 16 0 8 7 0 0 0-16 0z','M4 9 2 6l5 1M20 9l2-3-5 1','M9 11h.01M15 11h.01','M11 15h2'],
'🏃':['M13 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z','M10 8l3-2 3 3 3 1','M10 8l-2 5 4 2-2 6','M13 15l5 5'],
'☀️':['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z','M12 2v3M12 19v3M4.9 4.9 7 7m10 10 2.1 2.1M2 12h3m14 0h3M4.9 19.1 7 17m10-10 2.1-2.1'],
'🌙':['M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z'],
'👋':['M4 12V7a1 1 0 0 1 2 0v4-7a1 1 0 0 1 2 0v7-8a1 1 0 0 1 2 0v8-6a1 1 0 0 1 2 0v7l2-2a2 2 0 0 1 3 3l-4 6a4 4 0 0 1-3 1H9a4 4 0 0 1-3-2z'],
'✎':['M4 20h4L19 9l-4-4L4 16z','m13 6 4 4','M4 20l2-4'],
'×':['M5 5l14 14M19 5 5 19'],
'🔋':['M5 7h14v14H5z','M9 4h6v3H9z','M12 10v8']
};
var palette={'hm-ico':['#E9F0FF','#DCE7FF','#3869C8'],'ico':['#EAF4FF','#DCEBFF','#3977C8'],'ic':['#F0ECFF','#E4DEFF','#7255C8'],'sp-tabico':['#EAF5F1','#D8EEE5','#25866A'],'mff-color-icon':['#FFF1E7','#FFE1CF','#D66B35']};
function svgFor(glyph){var paths=icons[glyph];if(!paths)return null;return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths.map(function(d,i){return '<path d="'+d+'"'+(i===0?' class="mff-icon-main"':'')+'/>';}).join('')+'</svg>';}
function enhance(){
 document.querySelectorAll('.ico,.ic,.sp-tabico,.em,.mff-search-item .ic,.mff-notif-item .ic,.mff-color-icon,i').forEach(function(el){
  if(el.dataset.iconEnhanced==='1')return;
  var glyph=(el.textContent||'').trim();
  var svg=svgFor(glyph);
  if(svg){el.dataset.iconEnhanced='1';el.dataset.iconGlyph=glyph;el.innerHTML=svg;el.classList.add('mff-icon-tile');}
 });
 document.querySelectorAll('.hm-ico').forEach(function(el){el.classList.add('mff-icon-tile');});
}
function injectStyle(){
 var css='.mff-icon-tile{--tile-a:#EAF1FF;--tile-b:#DCE7FF;--tile-ink:#3869C8;display:inline-grid;place-items:center;flex:0 0 auto;background:linear-gradient(145deg,var(--tile-a),var(--tile-b))!important;color:var(--tile-ink)!important;border:1px solid color-mix(in srgb,var(--tile-ink) 13%,transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,.8),0 5px 12px color-mix(in srgb,var(--tile-ink) 12%,transparent);}.mff-icon-tile svg{width:58%;height:58%;display:block;stroke:currentColor!important;fill:none!important;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 1px 0 rgba(255,255,255,.5));}.mff-icon-tile svg path:first-child{stroke:currentColor}.mff-icon-tile[data-icon-glyph="💼"],.mff-icon-tile[data-icon-glyph="🧰"],.mff-icon-tile[data-icon-glyph="⚙️"]{--tile-a:#F0EDFF;--tile-b:#E2DCFF;--tile-ink:#7255C8}.mff-icon-tile[data-icon-glyph="💰"],.mff-icon-tile[data-icon-glyph="🛒"],.mff-icon-tile[data-icon-glyph="🐷"]{--tile-a:#FFF5DF;--tile-b:#FFE8B8;--tile-ink:#C88A20}.mff-icon-tile[data-icon-glyph="❤️"],.mff-icon-tile[data-icon-glyph="🩺"],.mff-icon-tile[data-icon-glyph="🧴"]{--tile-a:#FFECEF;--tile-b:#FFDDE4;--tile-ink:#D65D78}.mff-icon-tile[data-icon-glyph="📚"],.mff-icon-tile[data-icon-glyph="📝"],.mff-icon-tile[data-icon-glyph="📅"]{--tile-a:#EAF7F3;--tile-b:#D8F0E8;--tile-ink:#27866B}.mff-icon-tile[data-icon-glyph="⚠️"],.mff-icon-tile[data-icon-glyph="🧯"],.mff-icon-tile[data-icon-glyph="🔦"]{--tile-a:#FFF1E5;--tile-b:#FFE0C8;--tile-ink:#D66B35}.mff-icon-tile[data-icon-glyph="💧"]{--tile-a:#EAF4FF;--tile-b:#D9ECFF;--tile-ink:#2E86C1}.mff-icon-tile[data-icon-glyph="🍚"]{--tile-a:#FFF5E5;--tile-b:#FBE8C5;--tile-ink:#B77A20}.mff-icon-tile[data-icon-glyph="🥛"]{--tile-a:#FFF6E8;--tile-b:#FBEBD2;--tile-ink:#A97835}.mff-icon-tile[data-icon-glyph="💊"]{--tile-a:#FFF0F1;--tile-b:#F9DDE1;--tile-ink:#C44D5B}.mff-icon-tile[data-icon-glyph="🧼"]{--tile-a:#EAF8F4;--tile-b:#D7F0E8;--tile-ink:#21866B}.mff-icon-tile[data-icon-glyph="🦺"]{--tile-a:#FFF3E7;--tile-b:#FFE1C9;--tile-ink:#D66B35}.mff-icon-tile[data-icon-glyph="💵"]{--tile-a:#EAF7EF;--tile-b:#D8F0E2;--tile-ink:#25865C}.mff-icon-tile[data-icon-glyph="📦"]{--tile-a:#F0F3F7;--tile-b:#E3E9F0;--tile-ink:#64748B}.hm-ico{--tile-a:#EAF1FF;--tile-b:#DCE7FF;--tile-ink:#3869C8}.hm-menu a:nth-of-type(2) .hm-ico{--tile-a:#EAF7F3;--tile-b:#D8F0E8;--tile-ink:#27866B}.hm-menu a:nth-of-type(3) .hm-ico{--tile-a:#FFF1E5;--tile-b:#FFE0C8;--tile-ink:#D66B35}.hm-menu a:nth-of-type(4) .hm-ico{--tile-a:#F0EDFF;--tile-b:#E2DCFF;--tile-ink:#7255C8}.hm-menu a:nth-of-type(5) .hm-ico{--tile-a:#FFF5DF;--tile-b:#FFE8B8;--tile-ink:#C88A20}.hm-menu a:nth-of-type(6) .mff-icon-tile[data-icon-glyph="💧"]{--tile-a:#EAF4FF;--tile-b:#D9ECFF;--tile-ink:#2E86C1}.mff-icon-tile[data-icon-glyph="🍚"]{--tile-a:#FFF5E5;--tile-b:#FBE8C5;--tile-ink:#B77A20}.mff-icon-tile[data-icon-glyph="🥛"]{--tile-a:#FFF6E8;--tile-b:#FBEBD2;--tile-ink:#A97835}.mff-icon-tile[data-icon-glyph="💊"]{--tile-a:#FFF0F1;--tile-b:#F9DDE1;--tile-ink:#C44D5B}.mff-icon-tile[data-icon-glyph="🧼"]{--tile-a:#EAF8F4;--tile-b:#D7F0E8;--tile-ink:#21866B}.mff-icon-tile[data-icon-glyph="🦺"]{--tile-a:#FFF3E7;--tile-b:#FFE1C9;--tile-ink:#D66B35}.mff-icon-tile[data-icon-glyph="💵"]{--tile-a:#EAF7EF;--tile-b:#D8F0E2;--tile-ink:#25865C}.mff-icon-tile[data-icon-glyph="📦"]{--tile-a:#F0F3F7;--tile-b:#E3E9F0;--tile-ink:#64748B}.hm-ico{--tile-a:#EAF1FF;--tile-b:#DCE7FF;--tile-ink:#3869C8}.hm-menu a:nth-of-type(7) .hm-ico{--tile-a:#F1F3F7;--tile-b:#E2E7EF;--tile-ink:#64748B}.hm-menu a:nth-of-type(8) .hm-ico{--tile-a:#EAF7F3;--tile-b:#D8F0E8;--tile-ink:#27866B}.hm-menu a:nth-of-type(9) .hm-ico{--tile-a:#FFECEF;--tile-b:#FFDDE4;--tile-ink:#D65D78}.hm-ico svg{stroke:var(--tile-ink)!important}.hm-ico svg .ac{stroke:var(--tile-ink)!important;opacity:.8}.hm-ico svg .fl{fill:color-mix(in srgb,var(--tile-ink) 19%,transparent)!important;stroke:var(--tile-ink)!important}.sp-tabico{border-radius:9px!important;width:30px!important;height:30px!important}.sp-tabs button[aria-current="true"] .sp-tabico{background:linear-gradient(145deg,#347FCE,#245BAA)!important;color:#fff!important}.mff-search-item .ic,.mff-notif-item .ic{border-radius:12px!important}.mff-navbtn svg{filter:drop-shadow(0 1px 0 rgba(255,255,255,.4))}.mff-icon-action,button[title],.icon-btn{border-radius:12px;transition:transform .15s ease,box-shadow .15s ease}button[title]:active,.mff-icon-action:active,.icon-btn:active{transform:scale(.94)}';
 /* Shared emergency-supply icon language: circular pastel tile, crisp centered line icon. */
 css += '.hm-ico,.pf-ico,.menu.menu-grid .ico{width:64px!important;height:64px!important;min-width:64px;min-height:64px;border-radius:50%!important;display:grid;place-items:center;flex:0 0 64px;margin:0 auto 9px;position:relative;overflow:visible;border:1px solid color-mix(in srgb,var(--tile-ink,#3869C8) 14%,transparent);box-shadow:inset 0 1px 0 rgba(255,255,255,.88),0 5px 13px color-mix(in srgb,var(--tile-ink,#3869C8) 11%,transparent);transition:transform .16s ease,box-shadow .16s ease}.hm-ico svg,.pf-ico svg,.menu.menu-grid .ico svg{width:36px!important;height:36px!important;max-width:36px;max-height:36px;stroke:var(--tile-ink,var(--primary))!important;stroke-width:1.9!important;fill:none!important;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 1px 0 rgba(255,255,255,.55))}.hm-ico svg .ac,.pf-ico svg .ac,.menu.menu-grid .ico svg .ac{stroke:var(--tile-ink,var(--primary-light))!important;opacity:.82}.hm-ico svg .fl,.pf-ico svg .fl,.menu.menu-grid .ico svg .fl{fill:color-mix(in srgb,var(--tile-ink,#3869C8) 18%,transparent)!important;stroke:var(--tile-ink,#3869C8)!important}.hm-menu a:active .hm-ico,.pf-menu a:active .pf-ico,.menu.menu-grid button:active .ico{transform:scale(.96)}.hm-ico{--tile-a:#EAF1FF;--tile-b:#DCE7FF;--tile-ink:#3869C8;background:linear-gradient(145deg,var(--tile-a),var(--tile-b))!important}.hm-menu a:nth-of-type(2) .hm-ico,.menu.menu-grid button:nth-of-type(2) .ico,.pf-menu a:nth-child(2) .pf-ico{--tile-a:#EAF7F3;--tile-b:#D8F0E8;--tile-ink:#27866B}.hm-menu a:nth-of-type(3) .hm-ico,.menu.menu-grid button:nth-of-type(3) .ico,.pf-menu a:nth-child(3) .pf-ico{--tile-a:#FFF5DF;--tile-b:#FFE8B8;--tile-ink:#B77A20}.hm-menu a:nth-of-type(4) .hm-ico,.menu.menu-grid button:nth-of-type(4) .ico{--tile-a:#F0EDFF;--tile-b:#E2DCFF;--tile-ink:#7255C8}.hm-menu a:nth-of-type(5) .hm-ico,.menu.menu-grid button:nth-of-type(5) .ico{--tile-a:#FFF1E5;--tile-b:#FFE0C8;--tile-ink:#D66B35}.hm-menu a:nth-of-type(6) .hm-ico,.menu.menu-grid button:nth-of-type(6) .ico{--tile-a:#EAF4FF;--tile-b:#D9ECFF;--tile-ink:#2E86C1}.hm-menu a:nth-of-type(7) .hm-ico,.menu.menu-grid button:nth-of-type(7) .ico{--tile-a:#F1F3F7;--tile-b:#E2E7EF;--tile-ink:#64748B}.hm-menu a:nth-of-type(8) .hm-ico,.menu.menu-grid button:nth-of-type(8) .ico{--tile-a:#EAF7EF;--tile-b:#D8F0E2;--tile-ink:#25865C}.hm-menu a:nth-of-type(9) .hm-ico,.menu.menu-grid button:nth-of-type(9) .ico{--tile-a:#FFECEF;--tile-b:#FFDDE4;--tile-ink:#D65D78}.pf-ico{--tile-a:#EAF1FF;--tile-b:#DCE7FF;--tile-ink:#3869C8;background:linear-gradient(145deg,var(--tile-a),var(--tile-b))!important}.menu.menu-grid .ico{--tile-a:#EAF1FF;--tile-b:#DCE7FF;--tile-ink:#3869C8;background:linear-gradient(145deg,var(--tile-a),var(--tile-b))!important}.menu.menu-grid .ico.mff-icon-tile{color:var(--tile-ink)!important}.menu.menu-grid button.tag-new .ico:after{top:-3px;right:-5px}.menu.menu-grid .ico svg{width:36px!important;height:36px!important}.pf-menu strong{font-size:13px!important;line-height:1.4}.pf-menu small{font-size:10px!important;line-height:1.4}.menu.menu-grid strong{font-size:13px!important;line-height:1.4}.menu.menu-grid small{font-size:10px!important;line-height:1.4}@media(max-width:380px){.hm-ico,.pf-ico,.menu.menu-grid .ico{width:60px!important;height:60px!important;min-width:60px;min-height:60px;flex-basis:60px}.hm-ico svg,.pf-ico svg,.menu.menu-grid .ico svg{width:34px!important;height:34px!important}}';
 /* My Plan: force distinct pastel colors on the six lower modules (items 9–14). */
 css += '.menu.menu-grid button:nth-of-type(9) .ico{--tile-a:#FFF1E5!important;--tile-b:#FFE0C8!important;--tile-ink:#D66B35!important}.menu.menu-grid button:nth-of-type(10) .ico{--tile-a:#EAF7F3!important;--tile-b:#D8F0E8!important;--tile-ink:#27866B!important}.menu.menu-grid button:nth-of-type(11) .ico{--tile-a:#FFF5DF!important;--tile-b:#FFE8B8!important;--tile-ink:#B77A20!important}.menu.menu-grid button:nth-of-type(12) .ico{--tile-a:#F0EDFF!important;--tile-b:#E2DCFF!important;--tile-ink:#7255C8!important}.menu.menu-grid button:nth-of-type(13) .ico{--tile-a:#EAF4FF!important;--tile-b:#D9ECFF!important;--tile-ink:#2E86C1!important}.menu.menu-grid button:nth-of-type(14) .ico{--tile-a:#FFECEF!important;--tile-b:#FFDDE4!important;--tile-ink:#D65D78!important}';
 var st=document.createElement('style');st.id='mff-unified-icon-style';st.textContent=css;(document.head||document.documentElement).appendChild(st);
}
function start(){
 enhance();
 if(window.MutationObserver){new MutationObserver(function(){enhance()}).observe(document.body,{childList:true,subtree:true});}
}
injectStyle();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
