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

/* Hero photo scroll parallax (rAF, only while hero is on screen) */
(function(){
  if (FX.RM) return;
  const photo=document.querySelector('.hero-art .photo'), hero=document.querySelector('.hero');
  if(!photo||!hero) return;
  let on=true,running=false;
  const loop=()=>{ if(!on){running=false;return;} photo.style.translate='0 '+(Math.min(scrollY,innerHeight)*.12).toFixed(1)+'px'; requestAnimationFrame(loop); };
  new IntersectionObserver(es=>{ on=es[0].isIntersecting; if(on&&!running){running=true;requestAnimationFrame(loop);} }).observe(hero);
})();
/* Menu search across every category */
(function(){
  const box=document.getElementById('msearch'), q=document.getElementById('mq');
  if(!box||typeof MENU==='undefined') return;
  const list=document.getElementById('menuList'), tabsEl=document.getElementById('tabs');
  const all=Object.entries(MENU).flatMap(([c,l])=>l.map(m=>({c,n:m[0],d:m[1],p:m[2]})));
  const esc2=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const hl=(s,t)=>{ const e=esc2(s); if(!t) return e; const i=e.toLowerCase().indexOf(t); return i<0?e:e.slice(0,i)+'<mark>'+e.slice(i,i+t.length)+'</mark>'+e.slice(i+t.length); };
  const chips=[...box.querySelectorAll('.mchips button')];
  const run=()=>{
    const t=q.value.trim().toLowerCase(); box.classList.toggle('has',!!t);
    chips.forEach(b=>b.setAttribute('aria-pressed',b.textContent.toLowerCase()===t));
    if(!t){ const first=tabsEl.querySelector('[aria-selected=true]')||tabsEl.firstElementChild; show(first?first.dataset.cat:Object.keys(MENU)[0]); return; }
    [...tabsEl.children].forEach(x=>x.setAttribute('aria-selected','false'));
    const alt={biscoff:'lotus',lotus:'biscoff'}[t];
    const hits=all.filter(m=>{const s=(m.n+' '+m.d+' '+m.c).toLowerCase();return s.includes(t)||(alt&&s.includes(alt));});
    list.innerHTML=hits.length?hits.map((m,i)=>'<div class="item" style="animation-delay:'+Math.min(i,12)*30+'ms"><span class="cat">'+esc2(m.c)+'</span><h3>'+hl(m.n,t)+'</h3><span class="p">£'+m.p.toFixed(2)+'</span><p>'+hl(m.d,t)+'</p></div>').join(''):'<p class="nores">Nothing matches "'+esc2(q.value)+'" yet. Ask in store, the team love a custom order.</p>';
  };
  let tm; q.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(run,90)});
  box.querySelector('.mclr').addEventListener('click',()=>{q.value='';run();q.focus()});
  chips.forEach(b=>b.addEventListener('click',()=>{ q.value=b.getAttribute('aria-pressed')==='true'?'':b.textContent; run(); }));
  tabsEl.addEventListener('click',()=>{ if(q.value){ q.value=''; box.classList.remove('has'); chips.forEach(b=>b.setAttribute('aria-pressed','false')); } },true);
})();
FX.split('section h2');
FX.magnet('.hero .btn, .total-row .btn, .fab .btn',.3);
