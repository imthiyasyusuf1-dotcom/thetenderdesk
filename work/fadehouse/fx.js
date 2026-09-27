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
  const f=document.getElementById('fbForm'); if(!f) return;
  const FADE={none:0,low:150,mid:122,high:96}, TOP={short:.45,crop:.8,long:1.18};
  const $=id=>document.getElementById(id);
  let svc='fade';
  const upd=()=>{
    const v=Object.fromEntries(new FormData(f));
    const fy=v.fade==='none'?260:FADE[v.fade]-28;
    $('fbFade').style.transform='translate(0px,'+fy+'px)';
    $('fbTop').style.transform='scaleY('+TOP[v.top]+')';
    $('fbBeard').style.opacity=v.beard==='1'?1:0;
    $('fbBeard').style.transform=v.beard==='1'?'none':'translate(0px,8px)';
    const fadeName={none:'Scissor cut',low:'Low skin fade',mid:'Mid skin fade',high:'High skin fade'}[v.fade];
    const topName={short:'short top',crop:'textured crop',long:'longer top'}[v.top];
    let p,t;
    if(v.beard==='1'){ svc='full'; p=36; t=70; }
    else if(v.fade==='none'){ svc='cut'; p=22; t=40; }
    else { svc='fade'; p=24; t=45; }
    $('fbPrice').textContent='£'+p;
    $('fbMeta').textContent=fadeName+', '+topName+(v.beard==='1'?' + beard':'')+' · about '+t+' min';
    $('fbTag').textContent=fadeName+(v.beard==='1'?' + beard':'');
  };
  f.addEventListener('change',upd); upd();
  $('fbBook').addEventListener('click',()=>{ if(typeof openBook==='function') openBook(svc); });
})();
FX.split('section h2.display');
FX.magnet('.btn-red, .cta .btn',.28);
FX.bar(document.getElementById('fxBar'),'.hero','.cta, footer, #builder .fb-sum');
document.querySelectorAll('#fxBar [data-book]').forEach(b=>b.addEventListener('click',()=>{ if(typeof openBook==='function') openBook(); }));
