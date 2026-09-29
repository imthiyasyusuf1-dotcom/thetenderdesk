/* The Tender Desk showcase kit: progressive, additive upgrades for demo sites. No dependencies. */
(() => {
  if (window.__tdKit) return; window.__tdKit = 1;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = `
  @view-transition{navigation:auto}
  ::view-transition-old(root),::view-transition-new(root){animation-duration:.35s}
  .td-prog{position:fixed;top:0;left:0;height:2px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:var(--td-accent,#ff5b2e);z-index:2147483000;pointer-events:none}
  .td-badge{position:fixed;right:14px;bottom:14px;z-index:2147483000;display:flex;align-items:center;gap:8px;font:500 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;text-transform:uppercase;color:#f2efe8;background:rgba(13,15,18,.78);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12);padding:8px 12px;border-radius:99px;text-decoration:none;opacity:.85;transition:opacity .3s}
  .td-badge:hover{opacity:1}
  .td-badge i{width:6px;height:6px;border-radius:50%;background:#3ddc84;box-shadow:0 0 8px #3ddc84}
  .td-badge b{font-weight:500;font-variant-numeric:tabular-nums}
  .td-r{opacity:0;transform:translateY(22px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}
  .td-r.td-in{opacity:1;transform:none}
  @media (prefers-reduced-motion:reduce){.td-r{opacity:1;transform:none;transition:none}}
  @media print{.td-prog,.td-badge{display:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const init = () => {
    const bar = document.createElement('div'); bar.className = 'td-prog'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    const a = document.createElement('a'); a.className = 'td-badge'; a.href = "/"; a.setAttribute('aria-label', 'Built by The Tender Desk');
    a.innerHTML = '<i></i>Built by The Tender Desk<b class="td-f" hidden></b>'; document.body.appendChild(a);
    const f = a.querySelector('.td-f');
    let n = 0, last = performance.now(), ticking = false;
    const upd = () => { ticking = false; const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
    const loop = t => { n++; if (t - last >= 1000) { f.textContent = Math.min(120, Math.round(n * 1000 / (t - last))); n = 0; last = t; } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    if (reduce || !('IntersectionObserver' in window)) return;
    // reveal only elements below the fold, never ones already visible (no flash, no CLS since transform only)
    const sel = document.body.dataset.tdReveal || 'section h2, section h3, section p, section img, section li, section .card, article';
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('td-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    let k = 0;
    document.querySelectorAll(sel).forEach(el => {
      if (el.closest('.td-badge,nav,header,[data-no-td]') || el.getBoundingClientRect().top < innerHeight || el.classList.contains('reveal')) return;
      el.classList.add('td-r'); el.style.transitionDelay = (k++ % 4) * 60 + 'ms'; io.observe(el);
    });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
