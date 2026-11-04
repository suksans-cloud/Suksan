from pathlib import Path

# Shared icon system across the main app and all pages using shell.css
p=Path('/mnt/data/redesign_work/shell.css')
s=p.read_text()
s += r'''

/* ===== Visual refresh 2026: unified icon language across all modules ===== */
.hm-menu{gap:15px 6px;padding:18px 12px 14px;border-radius:26px;box-shadow:0 10px 28px rgba(20,45,70,.075)}
.hm-menu a{min-width:0;padding:7px 3px 9px;gap:1px;transition:transform .18s ease,background .18s ease}
.hm-menu a:active{transform:scale(.96);background:var(--bg)}
.hm-ico{width:62px;height:62px;border-radius:20px;margin-bottom:8px;background:linear-gradient(145deg,#F0F5FF,#E2EBF8);box-shadow:inset 0 0 0 1px rgba(58,108,147,.10),0 5px 12px rgba(35,68,100,.07);transition:transform .18s ease,box-shadow .18s ease}
.hm-menu a:nth-of-type(2) .hm-ico{background:linear-gradient(145deg,#EAF7F5,#D8F0EA)}
.hm-menu a:nth-of-type(3) .hm-ico{background:linear-gradient(145deg,#FFF2E9,#FCE2D2)}
.hm-menu a:nth-of-type(4) .hm-ico{background:linear-gradient(145deg,#F0EDFF,#E4DEFF)}
.hm-menu a:nth-of-type(5) .hm-ico{background:linear-gradient(145deg,#FFF7E4,#FCEBC0)}
.hm-menu a:nth-of-type(6) .hm-ico{background:linear-gradient(145deg,#EAF3FF,#DCEAFF)}
.hm-menu a:nth-of-type(7) .hm-ico{background:linear-gradient(145deg,#F1F4F7,#E3E9EF)}
.hm-menu a:nth-of-type(8) .hm-ico{background:linear-gradient(145deg,#E9F7EF,#D8F0E2)}
.hm-menu a:nth-of-type(9) .hm-ico{background:linear-gradient(145deg,#FCEEF4,#F8DDE9)}
.hm-ico svg{width:34px;height:34px;stroke:var(--primary);stroke-width:1.75;filter:drop-shadow(0 1px 1px rgba(0,0,0,.04))}
.hm-ico svg .ac{stroke:var(--primary-light);stroke-width:1.9}
.hm-ico svg .fl{fill:color-mix(in srgb,var(--primary-light) 22%,transparent);stroke:var(--primary-light)}
.hm-menu strong{font-size:12.8px;letter-spacing:-.01em}
.hm-menu small.s{font-size:10px;line-height:1.35}
.mff-bottomnav{backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:color-mix(in srgb,var(--surface) 92%,transparent);border-top:1px solid var(--line);box-shadow:0 -5px 22px rgba(30,55,80,.07)}
.mff-navbtn{min-width:62px;border-radius:14px;transition:color .15s ease,background .15s ease}
.mff-navbtn svg{width:23px;height:23px;stroke-width:1.8}
.mff-navbtn.active{background:var(--primary-soft);color:var(--primary)}
.mff-navbtn:active{background:var(--primary-soft)}
@media(max-width:380px){.hm-ico{width:56px;height:56px;border-radius:18px}.hm-ico svg{width:31px;height:31px}.hm-menu{gap:12px 4px}}
'''
p.write_text(s)

# My Tools icon cards and calculator/health submodules
p=Path('/mnt/data/redesign_work/tools/tools.css')
s=p.read_text()
s += r'''

/* ===== Unified premium icon cards for every My Tools / My Health module ===== */
.menu.menu-grid{gap:10px;padding:12px;border-radius:23px;background:var(--surface);border:1px solid var(--line);box-shadow:0 8px 24px rgba(22,48,72,.055)}
.menu.menu-grid .menu-title{grid-column:1/-1;padding:2px 3px 5px;font:700 15px Prompt,'Noto Sans Thai',sans-serif;color:var(--ink)}
.menu.menu-grid .menu-title small{display:block;margin-top:3px;font:400 11px 'Noto Sans Thai',sans-serif;color:var(--muted)}
.menu.menu-grid button{min-height:116px;padding:13px 10px 12px;border-radius:17px;border:1px solid var(--line);box-shadow:0 3px 12px rgba(20,45,70,.035);display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:0;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
.menu.menu-grid button:active{transform:scale(.975)}
.menu.menu-grid .ico{width:46px;height:46px;border-radius:15px;margin:0 0 9px;background:linear-gradient(145deg,#EAF1FF,#DCE8FA);color:#315F9B;box-shadow:inset 0 0 0 1px rgba(49,95,155,.08)}
.menu.menu-grid button:nth-of-type(2) .ico{background:linear-gradient(145deg,#E8F6F1,#D5EEE4);color:#198365}
.menu.menu-grid button:nth-of-type(3) .ico{background:linear-gradient(145deg,#FFF4DF,#FBE8B9);color:#A87516}
.menu.menu-grid button:nth-of-type(4) .ico{background:linear-gradient(145deg,#F2EDFF,#E5DEFF);color:#7458B5}
.menu.menu-grid button:nth-of-type(5) .ico{background:linear-gradient(145deg,#E6F5FA,#D6EDF5);color:#287F9A}
.menu.menu-grid button:nth-of-type(6) .ico{background:linear-gradient(145deg,#FCECF0,#F8DCE4);color:#B44D6A}
.menu.menu-grid button:nth-of-type(7) .ico{background:linear-gradient(145deg,#EAF2FF,#DCE8FA);color:#315F9B}
.menu.menu-grid .ico svg{width:25px;height:25px;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
.menu.menu-grid .ico svg .ac{stroke:currentColor;stroke-width:2.1}
.menu.menu-grid .ico svg .fl{fill:currentColor;fill-opacity:.13;stroke:currentColor}
.menu.menu-grid strong{font:700 13px/1.35 'Noto Sans Thai',sans-serif;letter-spacing:-.01em}
.menu.menu-grid small{font-size:10.5px;margin-top:3px;line-height:1.35}
.menu.menu-grid button.active{background:linear-gradient(150deg,var(--surface),var(--primary-soft));border-color:var(--primary-light);box-shadow:0 0 0 2px color-mix(in srgb,var(--primary-light) 12%,transparent),0 7px 16px rgba(20,45,70,.06)}
.menu.menu-grid button.active .ico{box-shadow:0 4px 10px rgba(20,45,70,.10)}
@media(max-width:390px){.menu.menu-grid{gap:8px;padding:10px}.menu.menu-grid button{min-height:108px;padding:11px 9px}.menu.menu-grid .ico{width:42px;height:42px;border-radius:13px}.menu.menu-grid strong{font-size:12.5px}}
'''
p.write_text(s)

# Supply app: improve the heading and tab iconography while keeping all existing data and actions intact
p=Path('/mnt/data/redesign_work/tools/supply.js')
s=p.read_text()
s=s.replace("var TABS=[['overview','ภาพรวม'],['buy','สรุปที่ขาด'],['check','ตรวจสต๊อก'],['more','ตั้งค่า']];", "var TABS=[['overview','ภาพรวม','◫'],['buy','สรุปที่ขาด','＋'],['check','ตรวจสต๊อก','✓'],['more','ตั้งค่า','⚙']];")
s=s.replace("var head='<div class=\"panelhead\"><div><h2>คลังเสบียงฉุกเฉิน</h2><p>ครอบครัว '+s.people+' คน · เตรียมไว้ '+s.days+' วัน · ตรวจทุก '+s.months+' เดือน</p></div><span class=\"pill\">Supplies</span></div>';", "var head='<header class=\"sp-pagehead\"><div class=\"sp-brandmark\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\"><path d=\"M4 8.5 12 4l8 4.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z\"/><path d=\"M4 9h16M8 9v4h8V9M12 13v4\"/></svg></div><div class=\"sp-pagecopy\"><span class=\"sp-eyebrow\">EMERGENCY READINESS</span><h2>คลังเสบียงฉุกเฉิน</h2><p>ครอบครัว '+s.people+' คน <i>·</i> '+s.days+' วัน <i>·</i> ตรวจทุก '+s.months+' เดือน</p></div><span class=\"sp-live\"><i></i> พร้อมจัดการ</span></header>';")
s=s.replace("return '<button data-act=\"tab\" data-t=\"'+t[0]+'\" aria-current=\"'+(ui.tab===t[0])+'\">'+t[1]+dot+'</button>';", "return '<button data-act=\"tab\" data-t=\"'+t[0]+'\" aria-current=\"'+(ui.tab===t[0])+'\"><span class=\"sp-tabico\" aria-hidden=\"true\">'+t[2]+'</span><span>'+t[1]+'</span>'+dot+'</button>';")
# Extend the existing readiness hero with concise operational KPIs
old="""  return '<section class=\"sp-hero\"><div class=\"sp-hero-top\"><div><div class=\"sp-kick\">ความพร้อมของคลัง</div><div class=\"sp-pct\">'+st.pct+'<small>%</small></div></div>'+\n    '<div class=\"sp-hero-sub\">ครบ '+st.ok+' จาก '+st.n+' รายการ</div></div>'+\n    '<div class=\"sp-ruler\"><div class=\"sp-kick\">ของที่มีอยู่ตอนนี้พอใช้ได้</div>'+row('น้ำดื่ม',cv.water)+row('อาหารหลัก',cv.food)+'</div></section>';"""
new="""  var ex=expiring(),nd=nextDue();\n  return '<section class=\"sp-hero\"><div class=\"sp-hero-top\"><div><div class=\"sp-kick\">ระดับความพร้อมของคลัง</div><div class=\"sp-pct\">'+st.pct+'<small>%</small></div></div>'+\n    '<div class=\"sp-hero-sub\"><b>'+st.ok+'</b> / '+st.n+' รายการพร้อมใช้</div></div>'+\n    '<div class=\"sp-ruler\"><div class=\"sp-kick\">ระยะเวลาสำรองโดยประมาณ</div>'+row('น้ำดื่ม',cv.water)+row('อาหารหลัก',cv.food)+'</div>'+\n    '<div class=\"sp-kpis\"><div><span>รายการที่ยังขาด</span><b>'+st.short.length+'</b></div><div><span>ใกล้หมดอายุ</span><b>'+ex.length+'</b></div><div><span>ตรวจครั้งถัดไป</span><b>'+fmtD(nd.due)+'</b></div></div></section>';"""
if old not in s:
    print('WARNING hero target not found')
else:
    s=s.replace(old,new)
p.write_text(s)

# Supply app visual system: redesigned dashboard, tabs, tiles, item cards and mobile rhythm
p=Path('/mnt/data/redesign_work/tools/tools.css')
s=p.read_text()
s += r'''

/* ===== Emergency Supply 2.0 — clearer dashboard and calmer visual hierarchy ===== */
#supply{--sp-blue:#356B9B;--sp-blue-soft:color-mix(in srgb,#4C86B8 13%,var(--surface));--sp-card-shadow:0 7px 22px rgba(25,55,82,.055)}
#supply .sp-pagehead{display:flex;align-items:center;gap:12px;padding:5px 2px 15px;margin-bottom:2px}
#supply .sp-brandmark{width:52px;height:52px;flex:none;border-radius:17px;display:grid;place-items:center;color:#fff;background:linear-gradient(145deg,#183F63,#4B82AE);box-shadow:0 7px 16px rgba(28,66,100,.18)}
#supply .sp-brandmark svg{width:29px;height:29px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#supply .sp-pagecopy{min-width:0;flex:1}
#supply .sp-eyebrow{display:block;font:700 9px/1.4 Prompt,sans-serif;letter-spacing:.13em;color:var(--muted);margin-bottom:2px}
#supply .sp-pagecopy h2{font:700 19px/1.35 Prompt,'Noto Sans Thai',sans-serif;color:var(--ink);margin:0}
#supply .sp-pagecopy p{font-size:11px;line-height:1.45;color:var(--muted);margin:3px 0 0}
#supply .sp-pagecopy p i{font-style:normal;color:var(--primary-light);padding:0 2px}
#supply .sp-live{display:inline-flex;align-items:center;gap:5px;flex:none;padding:6px 8px;border-radius:99px;background:var(--sp-ok-bg);color:var(--sp-ok-t);font-size:9.5px;font-weight:700}
#supply .sp-live i{width:6px;height:6px;border-radius:50%;background:var(--sp-ok)}
#supply .sp-tabs{top:env(safe-area-inset-top,0px);padding:5px;gap:5px;border-radius:17px;background:color-mix(in srgb,var(--surface) 94%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 7px 20px rgba(22,50,76,.07)}
#supply .sp-tabs button{display:flex;align-items:center;justify-content:center;gap:5px;min-height:46px;border-radius:12px;font-size:11.5px;white-space:nowrap}
#supply .sp-tabs button[aria-current="true"]{background:linear-gradient(145deg,var(--primary-soft),color-mix(in srgb,var(--primary-soft) 65%,var(--surface)));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary-light) 15%,transparent)}
#supply .sp-tabico{display:grid;place-items:center;width:21px;height:21px;border-radius:7px;background:var(--bg);font:700 13px/1 Prompt,sans-serif;color:var(--primary-light)}
#supply .sp-tabs button[aria-current="true"] .sp-tabico{background:var(--primary);color:#fff}
#supply .sp-view{gap:13px}
#supply .sp-card{border-radius:19px;padding:15px;box-shadow:var(--sp-card-shadow)}
#supply .sp-hero{position:relative;overflow:hidden;border:0;border-radius:22px;padding:18px;background:radial-gradient(120% 130% at 100% 0%,color-mix(in srgb,var(--primary-light) 22%,transparent),transparent 55%),linear-gradient(145deg,var(--surface),var(--primary-soft));box-shadow:0 10px 25px rgba(22,55,85,.07)}
#supply .sp-hero:after{content:"";position:absolute;width:145px;height:145px;right:-70px;top:-75px;border-radius:50%;border:1px solid color-mix(in srgb,var(--primary-light) 16%,transparent);box-shadow:0 0 0 14px color-mix(in srgb,var(--primary-light) 4%,transparent),0 0 0 29px color-mix(in srgb,var(--primary-light) 3%,transparent);pointer-events:none}
#supply .sp-hero-top{align-items:center;position:relative;z-index:1}
#supply .sp-kick{font-size:11px;letter-spacing:.01em}
#supply .sp-pct{font-size:48px;letter-spacing:-.045em;color:var(--primary)}
#supply .sp-pct small{font-size:19px;color:var(--primary-light)}
#supply .sp-hero-sub{padding:8px 11px;border:1px solid color-mix(in srgb,var(--primary-light) 14%,transparent);border-radius:12px;background:color-mix(in srgb,var(--surface) 75%,transparent);font-size:11px}
#supply .sp-hero-sub b{font-size:17px;color:var(--primary)}
#supply .sp-ruler{position:relative;z-index:1;border-top-color:color-mix(in srgb,var(--primary) 11%,transparent);gap:10px}
#supply .sp-bar{height:9px;background:color-mix(in srgb,var(--primary-light) 12%,var(--surface))}
#supply .sp-bar>i{background:linear-gradient(90deg,var(--primary-light),#75A6C9)}
#supply .sp-bar.ok>i{background:linear-gradient(90deg,#1F9D6C,#55C59A)}
#supply .sp-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:2px;position:relative;z-index:1}
#supply .sp-kpis>div{display:flex;flex-direction:column;gap:3px;min-width:0;padding:9px 8px;border-radius:12px;background:color-mix(in srgb,var(--surface) 82%,transparent);border:1px solid color-mix(in srgb,var(--primary-light) 10%,transparent)}
#supply .sp-kpis span{font-size:9.5px;line-height:1.35;color:var(--muted)}
#supply .sp-kpis b{font-size:13px;line-height:1.3;color:var(--ink);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
#supply .sp-grid3{gap:9px}
#supply .sp-tile{min-height:139px;border-radius:17px;padding:12px 5px 10px;gap:5px;box-shadow:0 3px 12px rgba(20,45,70,.035);transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
#supply .sp-tile:active{transform:scale(.97);box-shadow:0 5px 14px rgba(20,45,70,.08)}
#supply .sp-tic{width:68px;height:68px}
#supply .em{width:43px;height:43px;border-radius:15px;font-size:22px;box-shadow:inset 0 0 0 1px rgba(20,45,70,.04)}
#supply .sp-tile b{font-size:11.5px;line-height:1.35}
#supply .sp-tile small{font-size:10px;line-height:1.35}
#supply .sp-badge{top:3px;right:1px;box-shadow:0 2px 6px rgba(176,62,39,.18)}
#supply .sp-item{border:1px solid var(--line);border-left:4px solid var(--line);border-radius:16px;padding:13px;box-shadow:0 3px 12px rgba(20,45,70,.035)}
#supply .sp-item.st-ok{border-left-color:var(--sp-ok)}
#supply .sp-item.st-low{border-left-color:var(--sp-warn)}
#supply .sp-item.st-none{border-left-color:var(--sp-bad)}
#supply .sp-stepper button{border-radius:10px;background:var(--primary-soft);border-color:transparent}
#supply .sp-stepper button:first-child{border-radius:10px 0 0 10px}
#supply .sp-stepper button:last-child{border-radius:0 10px 10px 0}
#supply .sp-btn{border-radius:12px;box-shadow:0 3px 8px rgba(22,55,85,.08)}
#supply .sp-btn.sec{box-shadow:none;background:var(--primary-soft);border-color:transparent}
#supply .sp-todo{border-radius:15px;background:var(--bg);padding:12px 13px;transition:transform .15s ease,border-color .15s ease}
#supply .sp-todo:active{transform:scale(.985);border-color:var(--primary-light)}
#supply .sp-todo i{display:grid;place-items:center;width:29px;height:29px;border-radius:10px;background:var(--primary-soft);font-size:20px}
#supply .sp-cathero{border-radius:19px;background:linear-gradient(145deg,var(--surface),var(--primary-soft));box-shadow:var(--sp-card-shadow)}
#supply .sp-cathero .em{border-radius:16px}
#supply .sp-buyrow{gap:8px}
#supply .sp-chip{padding:4px 9px}
#supply .sp-det>summary{min-height:38px}
#supply button:focus-visible,#supply input:focus-visible,#supply select:focus-visible{outline:2px solid var(--primary-light);outline-offset:2px}
@media(max-width:390px){
 #supply .sp-pagehead{gap:9px;padding-bottom:12px}
 #supply .sp-brandmark{width:46px;height:46px;border-radius:15px}
 #supply .sp-pagecopy h2{font-size:17px}
 #supply .sp-live{font-size:8.5px;padding:5px 6px}
 #supply .sp-tabs button{font-size:10.5px;gap:3px}
 #supply .sp-tabico{width:19px;height:19px}
 #supply .sp-hero{padding:15px}
 #supply .sp-pct{font-size:42px}
 #supply .sp-kpis{gap:5px}
 #supply .sp-kpis>div{padding:8px 6px}
 #supply .sp-kpis span{font-size:8.5px}
 #supply .sp-kpis b{font-size:11.5px}
 #supply .sp-grid3{gap:7px}
 #supply .sp-tile{min-height:130px;padding:10px 3px}
 #supply .sp-tic{width:60px;height:60px}
}
@media(prefers-reduced-motion:reduce){#supply .sp-tile,#supply .sp-todo{transition:none}}
'''
p.write_text(s)
