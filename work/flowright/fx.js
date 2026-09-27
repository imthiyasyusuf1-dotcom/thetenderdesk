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

(function(){
  const f=document.getElementById('iqForm'); if(!f) return;
  const $=id=>document.getElementById(id);
  const JOB={leak:{n:'Leak or burst pipe',b:145,q:'Emergency leak',s:[1,1,1.1]},boiler:{n:'Boiler repair',b:99,q:'Boiler repair',s:[1,1,1.05],parts:60},service:{n:'Annual boiler service',b:89,q:'Heating',s:[1,1,1]},drain:{n:'Blocked drain',b:99,q:'Blocked drain',s:[1,1,1.1]},rad:{n:'Replace radiator',b:245,q:'Heating',s:[.95,1,1.1]},combi:{n:'New combi boiler, fitted',b:2195,q:'New boiler',s:[.93,1,1.18],big:1}};
  const WHEN={plan:{n:'Weekday slot',add:0,eta:'Next slot: tomorrow, 8am to 10am'},today:{n:'Same day priority',add:35,eta:'Engineer free from 2pm today'},eve:{n:'Evening call-out',add:120,eta:'Engineer can be with you by 7:30pm'},night:{n:'Overnight emergency',add:160,eta:'Typical arrival under 60 minutes'}};
  const SZ={s:0,m:1,l:2}, SZN={s:'flat or 1 to 2 bed',m:'3 bed house',l:'4 bed or more'};
  const gbp=n=>'£'+Math.round(n).toLocaleString('en-GB');
  let shown=145, raf=0, target=145, choice={};
  const animate=()=>{
    if(FX.RM){ shown=target; $('iqPrice').textContent=gbp(shown); return; }
    cancelAnimationFrame(raf); const from=shown, t0=performance.now(), dur=520;
    const step=t=>{ const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); shown=from+(target-from)*e; $('iqPrice').textContent=gbp(shown); if(k<1) raf=requestAnimationFrame(step); };
    raf=requestAnimationFrame(step);
  };
  const upd=()=>{
    const v=Object.fromEntries(new FormData(f)); const j=JOB[v.job], w=WHEN[v.when];
    const base=j.b*j.s[SZ[v.size]];
    const add=j.big? 0 : w.add;
    target=Math.round((base+add)/5)*5;
    const lo=Math.round(target*.9/5)*5, hi=Math.round(target*(j.big?1.2:1.3)/5)*5;
    $('iqRange').textContent='Typical range '+gbp(lo)+' to '+gbp(hi)+', VAT included';
    const lines=[[j.n+' ('+SZN[v.size]+')',gbp(base)]];
    if(j.big) lines.push(['Install booked ahead','planned']); else lines.push([w.n, add?'+'+gbp(add):'£0 call-out']);
    if(j.parts) lines.push(['Common parts','quoted on site']);
    $('iqLines').innerHTML=lines.map(l=>'<li><span>'+l[0]+'</span><b>'+l[1]+'</b></li>').join('');
    $('iqEta').textContent=j.big?'Survey slot: this week, install in 3 to 5 days':w.eta;
    choice={job:j.q,txt:j.n+', '+SZN[v.size]+', '+(j.big?'planned install':w.n.toLowerCase())+'. Online estimate '+gbp(target)+' ('+gbp(lo)+' to '+gbp(hi)+').'};
    animate();
  };
  f.addEventListener('change',upd); upd();
  $('iqSend').addEventListener('click',()=>{
    const q=document.getElementById('qj'), d=document.getElementById('qd');
    if(q) q.value=choice.job; if(d) d.value=choice.txt;
    const sec=document.getElementById('quote'); if(sec) sec.scrollIntoView({behavior:FX.RM?'auto':'smooth'});
    setTimeout(()=>{ const n=document.getElementById('qn'); if(n) n.focus({preventScroll:true}); },FX.RM?0:700);
  });
})();
FX.split('.sec h2');
FX.magnet('.btn-em.btn-lg, .nav-call',.25);
FX.bar(document.getElementById('fxBar'),'.hero','#quote, .foot');
