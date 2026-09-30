(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  const ld = $('.loader');
  const intro = () => { document.body.classList.add('ready'); scramble(); };
  if (ld) {
    const n = $('.ld-n', ld), t0 = performance.now(), D = RM ? 0 : 1000;
    const step = t => { const k = D ? clamp((t - t0) / D) : 1; n.textContent = String(Math.round(ease(k) * 100)).padStart(2, '0');
      if (k < 1) requestAnimationFrame(step); else { ld.classList.add('done'); setTimeout(() => ld.remove(), 1000); setTimeout(intro, 350); } };
    requestAnimationFrame(step);
  } else intro();

  function scramble() {
    const el = $('[data-scramble]'); if (!el || RM) return;
    const txt = el.textContent, G = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    let f = 0; const T = 30;
    const tick = () => { f++; el.textContent = [...txt].map((c, i) => /[\s.,]/.test(c) ? c : (i < f / T * txt.length ? c : G[Math.random() * G.length | 0])).join(''); if (f < T) requestAnimationFrame(tick); else el.textContent = txt; };
    tick();
  }

  // scroll-lit words
  const words = [];
  $$('[data-words]').forEach(mf => {
    const walk = n => [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const fr = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w.trim()) fr.append(w); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; fr.append(s); } }); c.replaceWith(fr); } else walk(c); });
    walk(mf); words.push([mf, $$('.w', mf)]);
  });

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .2 });
  $$('.rv,.story').forEach(el => io.observe(el));

  const prog = $('.progress i'), bands = $$('.band img');
  let tick = false;
  function frame() {
    tick = false;
    const vh = innerHeight, y = scrollY;
    prog.style.transform = `scaleX(${clamp(y / (document.documentElement.scrollHeight - vh))})`;
    words.forEach(([mf, ws]) => {
      const r = mf.getBoundingClientRect();
      const p = RM ? 1 : clamp((vh * .85 - r.top) / (r.height + vh * .35));
      const k = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < k));
    });
    if (!RM) bands.forEach(b => { const r = b.parentNode.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) b.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) / vh) * -8}%,0)`; });
  }
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();
})();
