#!/usr/bin/env python3
"""Phone QA for motion kit: CLS, console errors, FPS while scrolling, hidden-content check,
reduced-motion + no-JS visibility. Usage: qa.py <base_url> <slug> [...]  (screens to $TMPDIR/motionqa)"""
import os, sys, json
from playwright.sync_api import sync_playwright

EXE = os.path.expanduser("~/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell")
OUT = os.path.join(os.environ.get("TMPDIR", "/tmp"), "motionqa"); os.makedirs(OUT, exist_ok=True)
CLS = """window.__lt=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(e.duration)}).observe({type:'longtask'});window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});"""
HIDDEN = """[...document.querySelectorAll('h1,h2,h3,p,li,img,.btn')].filter(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;
let n=e;while(n&&n.nodeType===1){const s=getComputedStyle(n);if(+s.opacity<0.05||s.visibility==='hidden')return true;n=n.parentElement}return false}).length"""
FPS = """async()=>{const H=document.documentElement.scrollHeight;let f=[],last=performance.now(),run=true;
(function t(n){f.push(n-last);last=n;if(run)requestAnimationFrame(t)})(last);
for(let y=0;y<H;y+=90){window.scrollTo(0,y);await new Promise(r=>requestAnimationFrame(r))}
await new Promise(r=>setTimeout(r,1500));run=false;f.shift();f.sort((a,b)=>a-b);
return {frames:f.length,p50:f[f.length>>1],longtasks_ms:Math.round(window.__lt.reduce((a,b)=>a+b,0)),max_task:Math.round(Math.max(0,...window.__lt))}}"""

def run(base, slugs):
    res = {}
    with sync_playwright() as p:
        for slug in slugs:
          for attempt in (1, 2):
           try:
            b = p.chromium.launch(executable_path=EXE)
            url = f"{base.rstrip('/')}/p/{slug}/"
            r = {}
            for mode in ("motion", "reduced", "nojs"):
                ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                                    reduced_motion="reduce" if mode == "reduced" else "no-preference", java_script_enabled=mode != "nojs")
                pg = ctx.new_page(); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
                if mode == "motion": pg.add_init_script(CLS)
                pg.goto(url, wait_until="networkidle"); pg.wait_for_timeout(1800)
                if mode == "motion":
                    pg.screenshot(path=f"{OUT}/{slug}-top.png")
                    r["cls_load"] = round(pg.evaluate("window.__cls"), 4)
                    r["libs"] = pg.evaluate("[!!window.gsap,!!window.ScrollTrigger,!!window.__lenis,document.documentElement.className]")
                    r["fps"] = pg.evaluate(FPS)
                    r["cls_total"] = round(pg.evaluate("window.__cls"), 4)
                    pg.wait_for_timeout(1200)
                    r["hidden_after_scroll"] = pg.evaluate(HIDDEN)
                    pg.evaluate("window.scrollTo(0,document.documentElement.scrollHeight*0.35)"); pg.wait_for_timeout(1500)
                    pg.screenshot(path=f"{OUT}/{slug}-mid.png")
                else:
                    r[f"hidden_{mode}"] = pg.evaluate(HIDDEN) if mode == "reduced" else None
                    if mode == "nojs": pg.screenshot(path=f"{OUT}/{slug}-nojs.png")
                r[f"errors_{mode}"] = errs[:3]
                ctx.close()
            res[slug] = r
            print(slug, json.dumps(r), flush=True)
            b.close(); break
           except Exception as ex:
            print(slug, "attempt", attempt, "crashed:", str(ex)[:80], flush=True)
    return res

if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2:])
