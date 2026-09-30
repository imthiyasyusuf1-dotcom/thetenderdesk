(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => 1 - Math.pow(1 - t, 3);

  // one-shot reveals
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    if (e.target.id === 'ai') chat();
  }), { threshold: .35 });
  $$('[data-shot],.tender,.ai,.gads,.reel-intro').forEach(el => io.observe(el));

  function chat() {
    const ms = $$('.m');
    ms.forEach((m, i) => setTimeout(() => m.classList.add('show'), RM ? 0 : 400 + i * 850));
  }

  // media slots: drop files in rebuild/media/, no markup edits needed
  const mob = matchMedia('(max-width:760px)').matches;
  const head = u => fetch(u, { method: 'HEAD' }).then(r => r.ok && !(r.headers.get('content-type') || '').includes('html')).catch(() => false);
  $$('[data-media]').forEach(async slot => {
    const b = slot.dataset.media, vid = b + (mob ? '-m' : '') + '.mp4';
    if (!RM && (await head(vid) || (mob && await head(b + '.mp4')))) {
      const v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: 'metadata' });
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      if (await head(b + '-poster.webp')) v.poster = b + '-poster.webp';
      v.src = (await head(vid)) ? vid : b + '.mp4';
      slot.prepend(v);
      new IntersectionObserver(([e]) => e.isIntersecting ? v.play().catch(() => {}) : v.pause()).observe(slot);
      slot.querySelector('picture')?.remove();
    } else if (await head(b + '.webp')) {
      const i = new Image(); i.src = b + '.webp'; i.alt = ''; i.loading = 'lazy'; i.decoding = 'async';
      const old = slot.querySelector('picture'); old ? old.replaceWith(i) : slot.prepend(i);
    }
  });

  // opening scroll scene
  const open = $('#open'), slices = $('.u-in', open), bars = $$('.glitch .band', open), cine = $('.cine', open),
    cimg = { style: {} }, lines = $$('.open-copy h1 span', open), kick = $('.open-copy .kicker', open),
    sub = $('.open-copy .sub', open), hint = $('.hint', open), prog = $('.progress i');
  const shots = $$('[data-shot] img');

  let ticking = false;
  function frame() {
    ticking = false;
    const vh = innerHeight, y = scrollY;
    prog.style.transform = `scaleX(${clamp(y / (document.documentElement.scrollHeight - vh))})`;
    if (!RM) {
      const r = open.getBoundingClientRect();
      const p = clamp(-r.top / (open.offsetHeight - vh));
      // 0-.18 idle, .18-.42 glitch/break, .38-.6 rebuild to cinematic, .55-.85 copy in
      const g = seg(p, .12, .42);
      const jitter = g > 0 && g < 1 ? Math.sin(p * 900) : 0;
      slices.style.transform = `translate3d(${jitter * 14 * g}px,${-g * g * 60}px,0) scale(${1 - g * .08})`;
      slices.style.opacity = 1 - seg(p, .32, .46);
      bars.forEach((b, i) => {
        const on = g > 0 && g < 1;
        b.style.opacity = on ? (Math.sin(p * 400 + i * 2) > -.2 ? 1 : 0) * (1 - seg(p, .34, .46)) : 0;
        b.style.transform = `translate3d(${on ? Math.sin(p * 700 + i * 1.7) * 12 * g : 0}%,0,0)`;
      });
      const c = ease(seg(p, .36, .6));
      cine.style.opacity = c;
      cimg.style.transform = `scale(${1.12 - c * .1 + p * .04})`;
      hint.style.opacity = 1 - seg(p, .02, .1);
      lines.forEach((l, i) => { const t = ease(seg(p, .5 + i * .08, .68 + i * .08)); l.style.opacity = t; l.style.transform = `translate3d(0,${(1 - t) * 40}px,0)`; });
      const k = ease(seg(p, .45, .6)); kick.style.opacity = k; kick.style.transform = `translate3d(0,${(1 - k) * 20}px,0)`;
      const s = ease(seg(p, .7, .86)); sub.style.opacity = s; sub.style.transform = `translate3d(0,${(1 - s) * 20}px,0)`;
      // showreel parallax zoom
      for (const im of shots) {
        const b = im.closest('.shot').getBoundingClientRect();
        if (b.bottom < 0 || b.top > vh) continue;
        const q = clamp(1 - (b.top + vh) / (2 * vh) + .5); // 0 entering, 1 leaving
        im.style.transform = `scale(${1.15 - q * .12})`;
      }
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();

  // before/after slider
  const fr = $('#baFrame'), after = $('#baAfter'), inner = $('#baAfterIn'), h = $('#baHandle');
  let pos = .5, drag = false;
  const set = v => {
    pos = clamp(v, .02, .98); const w = fr.clientWidth;
    after.style.transform = `translate3d(${pos * w}px,0,0)`;
    inner.style.transform = `translate3d(${-pos * w}px,0,0)`;
    h.style.transform = `translate3d(${pos * w}px,0,0)`;
    h.setAttribute('aria-valuenow', Math.round(pos * 100));
  };
  const at = e => { const b = fr.getBoundingClientRect(); set((e.clientX - b.left) / b.width); };
  fr.addEventListener('pointerdown', e => { drag = true; fr.setPointerCapture(e.pointerId); at(e); });
  fr.addEventListener('pointermove', e => drag && at(e));
  fr.addEventListener('pointerup', () => drag = false);
  fr.addEventListener('pointercancel', () => drag = false);
  h.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') set(pos - .05); if (e.key === 'ArrowRight') set(pos + .05); });
  addEventListener('resize', () => set(pos));
  set(.5);
  // gentle auto sweep once, to teach the gesture
  if (!RM) {
    const bio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; bio.disconnect();
      const t0 = performance.now();
      const tick = t => { if (drag) return; const k = (t - t0) / 1800; if (k > 1) return set(.5); set(.5 + Math.sin(k * Math.PI * 2) * .28); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .6 });
    bio.observe(fr);
  }
})();
