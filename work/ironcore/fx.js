/* Tender Desk demo FX core: split reveals, magnetic buttons, mobile action bar. transform/opacity only. */
(function(){
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const root = document.documentElement;
  window.FX = {RM, FINE};

  /* Split-text reveal: wraps each word of the selected headings */
  FX.split = function(sel){
    if (RM || !('IntersectionObserver' in window)) return;
    const els = document.querySelectorAll(sel);
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting){ e.target.classList.add('fx-in'); io.unobserve(e.target); }
    }), {rootMargin: '0px 0px -12% 0px'});
    els.forEach(el => {
      if (el.dataset.fxSplit) return; el.dataset.fxSplit = 1;
      let i = 0;
      const walk = node => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3){
            const parts = n.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach(p => {
              if (!p) return;
              if (/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(p)); return; }
              const w = document.createElement('span'); w.className = 'fx-w';
              const wi = document.createElement('span'); wi.className = 'fx-wi';
              wi.style.transitionDelay = (i++ * 55) + 'ms'; wi.textContent = p;
              w.appendChild(wi); frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'SVG'){ walk(n); }
        });
      };
      walk(el); el.classList.add('fx-split');
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('fx-in')));
      else io.observe(el);
    });
  };

  /* Magnetic buttons: pointer-fine only, rAF-driven, uses the translate property so existing transforms keep working */
  FX.magnet = function(sel, strength){
    if (RM || !FINE) return;
    strength = strength || .32;
    document.querySelectorAll(sel).forEach(el => {
      let tx = 0, ty = 0, x = 0, y = 0, raf = 0, active = false;
      const tick = () => {
        x += (tx - x) * .18; y += (ty - y) * .18;
        el.style.translate = x.toFixed(2) + 'px ' + y.toFixed(2) + 'px';
        if (active || Math.abs(x) > .05 || Math.abs(y) > .05) raf = requestAnimationFrame(tick);
        else { el.style.translate = ''; raf = 0; }
      };
      const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * strength;
        ty = (e.clientY - (r.top + r.height / 2)) * strength;
        active = true; start();
      }, {passive: true});
      el.addEventListener('pointerleave', () => { tx = ty = 0; active = false; start(); }, {passive: true});
    });
  };

  /* Mobile action bar: shows once the hero is out of view, hides when a target section is on screen */
  FX.bar = function(bar, heroSel, hideSel){
    if (!bar) return;
    const hero = document.querySelector(heroSel);
    const hides = hideSel ? [...document.querySelectorAll(hideSel)] : [];
    let pastHero = false; const vis = new Set();
    const upd = () => {
      const on = pastHero && vis.size === 0;
      bar.classList.toggle('on', on); document.body.classList.toggle('fx-bar-on', on);
      bar.setAttribute('aria-hidden', on ? 'false' : 'true');
      bar.querySelectorAll('a,button').forEach(a => a.tabIndex = on ? 0 : -1);
    };
    if (hero) new IntersectionObserver(es => { pastHero = !es[0].isIntersecting; upd(); }).observe(hero);
    if (hides.length) { const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? vis.add(e.target) : vis.delete(e.target)); upd(); }); hides.forEach(h => io.observe(h)); }
    upd();
  };

  /* Reveal when visible (adds .fx-in) */
  FX.onView = function(el, fn, margin){
    if (!el) return;
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting){ io.disconnect(); fn(); } }, {rootMargin: margin || '0px 0px -15% 0px'});
    io.observe(el);
  };
})();

/* Plan finder */
(function(){
  const f=document.getElementById('pf'); if(!f) return;
  const plans=[...document.querySelectorAll('.plan')];
  plans.forEach(p=>{ const m=document.createElement('span'); m.className='match'; m.textContent='Your match'; p.appendChild(m); });
  const byName=n=>plans.find(p=>p.querySelector('h3').textContent.trim()===n);
  let first=true;
  const upd=()=>{
    const v=Object.fromEntries(new FormData(f));
    const name=v.pt==='1'?'Coached':(v.when==='off'&&v.cls==='0'?'Off-Peak':'Core');
    const card=byName(name); plans.forEach(p=>p.classList.toggle('pick',p===card));
    const price=card?card.querySelector('[data-m]').textContent:'';
    const annual=document.querySelector('[data-bill=annual][aria-pressed=true]');
    document.getElementById('pfName').textContent=name;
    document.getElementById('pfCost').textContent='£'+price+' a month'+(annual?' (annual)':'')+', first week free';
    if(!first&&card&&innerWidth<1081){ const r=card.getBoundingClientRect(); if(r.top>innerHeight*.6||r.bottom<0) card.scrollIntoView({behavior:FX.RM?'auto':'smooth',block:'center'}); }
    first=false;
  };
  f.addEventListener('change',upd);
  document.querySelectorAll('[data-bill]').forEach(b=>b.addEventListener('click',()=>setTimeout(upd,0)));
  upd();
})();
/* Live next class (mirrors the demo weekday timetable) */
(function(){
  const el=document.getElementById('nextcls'); if(!el) return;
  const TT=[[["06:15", "Engine Room"], ["07:00", "Barbell Basics"], ["12:15", "Lunch Lift"], ["17:30", "HYROX Stations"], ["18:30", "Powerbuilding"], ["19:45", "Mobility Flow"]], [["06:15", "Snatch & Clean"], ["07:15", "Metcon 30"], ["12:15", "Core & Carry"], ["17:30", "Squat Club"], ["18:45", "Engine Room"], ["20:00", "Stretch & Reset"]], [["06:15", "HYROX Run Club"], ["07:00", "Barbell Basics"], ["12:15", "Metcon 30"], ["17:30", "Clean & Jerk"], ["18:30", "Powerbuilding"], ["19:45", "Mobility Flow"]], [["06:15", "Engine Room"], ["07:15", "Deadlift Club"], ["12:15", "Lunch Lift"], ["17:30", "HYROX Simulation"], ["18:45", "Snatch & Clean"], ["20:00", "Stretch & Reset"]], [["06:15", "Metcon 30"], ["07:00", "Bench Club"], ["12:15", "Core & Carry"], ["17:00", "Friday Finisher"], ["18:00", "Open Platform"]], [["08:30", "Team WOD"], ["09:45", "Saturday Strength"], ["10:00", "Lifting Clinic"], ["11:30", "Mobility Flow"]], [["09:00", "HYROX Long Run"], ["10:30", "Beginners Barbell"], ["16:00", "Sunday Reset"]]]; /* Mon..Sun, mirrors app.js */
  const tick=()=>{
    const n=new Date(), wd=n.getDay(), m=n.getHours()*60+n.getMinutes();
    const list=TT[(wd+6)%7];
    let hit=null; for(const [t,name] of list){ const [H,M]=t.split(':').map(Number); if(H*60+M>m){ hit=[H*60+M-m,t,name]; break; } }
    if(!hit){ const nx=TT[wd%7][0]; document.getElementById('ncIn').textContent='Tomorrow'; document.getElementById('ncTxt').textContent=nx[1]+' at '+nx[0]+', book a spot'; }
    else { const d=hit[0], txt=d<60?'in '+d+' min':'in '+Math.floor(d/60)+'h '+String(d%60).padStart(2,'0')+'m';
      document.getElementById('ncIn').textContent=txt; document.getElementById('ncTxt').textContent=hit[2]+' at '+hit[1]+', spaces left'; }
    el.hidden=false;
  };
  tick(); setInterval(tick,30000);
})();
FX.split('.sec-head h2');
FX.magnet('.btn-volt, .btn-lg',.25);
FX.bar(document.getElementById('fxBar'),'.hero','#trial, .footer');
