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
  const HOURS={0:[8,12],1:null,2:[7,15],3:[7,15],4:[7,15],5:[7,15],6:[7.5,14]};
  const DN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const nextOpenDay=from=>{ for(let k=1;k<8;k++){ const d=(from+k)%7; if(HOURS[d]) return [k,d]; } return [1,(from+1)%7]; };
  /* Order cut-off: 8pm the evening before each opening day */
  const co=document.getElementById('cutoff');
  const tickCut=()=>{
    const n=new Date(), wd=n.getDay(); const [k,d]=nextOpenDay(wd);
    const cut=new Date(n); cut.setDate(n.getDate()+k-1); cut.setHours(20,0,0,0);
    let ms=cut-n, day=d, kk=k;
    if(ms<=0){ const [k2,d2]=nextOpenDay(d); const c2=new Date(n); c2.setDate(n.getDate()+k+k2-1); c2.setHours(20,0,0,0); ms=c2-n; day=d2; kk=k+k2; }
    const m=Math.floor(ms/60000), h=Math.floor(m/60);
    document.getElementById('coT').textContent=h>=24?Math.floor(h/24)+'d '+(h%24)+'h':h+'h '+String(m%60).padStart(2,'0')+'m';
    document.getElementById('coS').textContent='left to order for '+(kk===1?'tomorrow':DN[day])+' morning';
    co.hidden=false;
  };
  if(co){ tickCut(); setInterval(tickCut,30000); }
  /* Oven board */
  const B=[[4.5,'Country sourdough','36-hour ferment'],[5.5,'Butter croissants','three-day lamination'],[6.25,'Pain au chocolat','two bars of dark chocolate'],[7,'Cinnamon buns','the ones people queue for'],[9,'Focaccia','rosemary and sea salt'],[11,'Cookies','brown butter, sea salt']];
  const tl=document.getElementById('tl'); if(!tl) return;
  const fmt=h=>{const H=Math.floor(h),M=Math.round((h-H)*60);return (H>12?H-12:H)+':'+String(M).padStart(2,'0')+(H>=12?'pm':'am');};
  tl.insertAdjacentHTML('beforeend',B.map(b=>'<li><time>'+fmt(b[0])+'</time><b>'+b[1]+'</b><small>'+b[2]+'</small><span class="st"></span></li>').join(''));
  const lis=[...tl.querySelectorAll('li')];
  const paint=()=>{
    const n=new Date(), wd=n.getDay(), h=n.getHours()+n.getMinutes()/60, o=HOURS[wd];
    const open=o&&h>=o[0]&&h<o[1];
    let last=-1; if(o&&h<o[1]) B.forEach((b,i)=>{ if(h>=b[0]) last=i; });
    lis.forEach((li,i)=>{
      const st=li.querySelector('.st'); li.classList.remove('done','now');
      if(!o||h>=o[1]){ const nd=nextOpenDay(wd); st.textContent='Order for '+(nd[0]===1?'tomorrow':DN[nd[1]]); }
      else if(i<last){ li.classList.add('done'); st.textContent='On the shelf'; }
      else if(i===last){ li.classList.add('now'); st.textContent=open?'Just out':'Out, ready at open'; }
      else { const mins=Math.round((B[i][0]-h)*60); st.textContent=mins<60?'Out in '+mins+' min':'Out in '+Math.floor(mins/60)+'h '+String(mins%60).padStart(2,'0')+'m'; }
    });
    const pct=last<0?0:(last+.5)/B.length;
    FX.onView(tl,()=>{ document.getElementById('tlFill').style.transform='scaleX('+pct.toFixed(3)+')'; });
  };
  paint(); setInterval(paint,60000);
})();
FX.split('section h2');
FX.magnet('.btn-primary',.28);
FX.bar(document.getElementById('fxBar'),'.hero','#order, body > footer');
