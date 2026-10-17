#!/usr/bin/env python3
"""Phone QA for motion kit: CLS, console errors, FPS while scrolling, hidden-content check,
reduced-motion + no-JS visibility. Usage: qa.py <base_url> <slug> [...]  (screens to $TMPDIR/motionqa)"""
import os, sys, json, time
# Runs in Yusuf's real Chrome via mychrome (own tab). Never Playwright/headless Chrome (policy).
sys.path.insert(0, os.path.expanduser("~/Desktop/Tender Desk/Outreach"))
from mctab import PhoneTab
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
    for slug in slugs:
        for attempt in (1, 2):
            try:
                url = f"{base.rstrip('/')}/p/{slug}/"
                r = {}
                for mode in ("motion", "reduced", "nojs"):
                    with PhoneTab(390, 844) as t:
                        t.cdp("Emulation.setEmulatedMedia", {"features": [{"name": "prefers-reduced-motion",
                              "value": "reduce" if mode == "reduced" else "no-preference"}]})
                        if mode == "nojs": t.cdp("Emulation.setScriptExecutionDisabled", {"value": True})
                        if mode == "motion": t.cdp("Page.addScriptToEvaluateOnNewDocument", {"source": CLS})
                        t.goto(url, wait=3.3)
                        if mode == "motion":
                            t.shot(f"{OUT}/{slug}-top.png")
                            r["cls_load"] = round(float(t.eval("window.__cls")), 4)
                            r["libs"] = t.eval("[!!window.gsap,!!window.ScrollTrigger,!!window.__lenis,document.documentElement.className]")
                            r["fps"] = t.eval(f"({FPS})()")
                            r["cls_total"] = round(float(t.eval("window.__cls")), 4)
                            time.sleep(1.2)
                            r["hidden_after_scroll"] = t.eval(HIDDEN)
                            t.eval("window.scrollTo(0,document.documentElement.scrollHeight*0.35)"); time.sleep(1.5)
                            t.shot(f"{OUT}/{slug}-mid.png")
                        else:
                            r[f"hidden_{mode}"] = t.eval(HIDDEN) if mode == "reduced" else None
                            if mode == "nojs": t.shot(f"{OUT}/{slug}-nojs.png")
                        r[f"errors_{mode}"] = t.console_errors()[:3]
                res[slug] = r
                print(slug, json.dumps(r), flush=True)
                break
            except Exception as ex:
                print(slug, "attempt", attempt, "crashed:", str(ex)[:80], flush=True)
    return res


if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2:])
