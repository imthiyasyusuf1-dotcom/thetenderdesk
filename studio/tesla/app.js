(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault();
    lenis ? lenis.scrollTo(t, { offset: 0, duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  if (!reduce) {
    const port = innerWidth <= 800;
    gsap.fromTo('.hero h1', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'power3.out' });
    gsap.fromTo('.hero .ph img', { scale: port ? 1.06 : 1.12 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
    gsap.to('.hero .ph img', { scale: port ? 1.04 : 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero .tt', { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true } });

    if (!port) $$('.scene').forEach(s => gsap.fromTo(s.querySelector('.ph'), { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.rv').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  }

  $$('.n').forEach(el => {
    const to = +el.dataset.to, d = +(el.dataset.d || 0), o = { v: 0 };
    const set = v => el.textContent = v.toFixed(d);
    if (reduce) return set(to);
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: 'power2.out', onUpdate: () => set(o.v) }) });
  });

  const imgs = $$('#stage img'), sw = $$('#sw button');
  sw.forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.i;
    imgs.forEach((m, k) => m.classList.toggle('on', k === i));
    sw.forEach((s, k) => s.classList.toggle('on', k === i));
    $('#cn').textContent = imgs[i].dataset.c;
    $('#okc').textContent = imgs[i].dataset.c;
  }));
  $('#rsv').addEventListener('click', () => { $('#rsv').textContent = 'Reserved'; $('#ok').style.opacity = 1; });

  // Flight: scroll-scrubbed frame sequence, three chapters with a dip to black between them
  (() => {
    const N = 140, CH = [[1, 82], [83, 140]];
    const cv = $('#fcv'), cx = cv.getContext('2d'), sec = $('#fly');
    const port = () => innerWidth <= 800, dir = innerWidth <= 800 ? 'm' : 'd';
    const fr = new Array(N + 1), caps = $$('.fly .fc'), bars = $$('.fly .pg b');
    let cur = 1, want = 1, loaded = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; draw(true); };
    const near = i => { for (let d = 0; d < N; d++) { if (fr[i - d] && fr[i - d].ok) return fr[i - d]; if (fr[i + d] && fr[i + d].ok) return fr[i + d]; } return null; };
    const chapter = i => CH.findIndex(c => i >= c[0] && i <= c[1]);
    let last = null;
    function draw(force) {
      const im = near(want); if (!im || (im === last && !force && cur === want)) return; last = im; cur = want;
      const W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight;
      const s = port() ? (W / iw) * [1.08, 1.22, 1.4][chapter(want)] : Math.max(W / iw, H / ih);
      const w = iw * s, h = ih * s, y = port() ? H * .56 - h / 2 : (H - h) / 2;
      const c = CH[chapter(want)], t = (want - c[0]) / (c[1] - c[0]), e = .07;
      let a = 1; if (c !== CH[0]) a = Math.min(a, t / e); a = Math.min(a, (1 - t) / (c === CH[CH.length - 1] ? .12 : e));
      cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H);
      cx.globalAlpha = Math.max(0, Math.min(1, a)); cx.drawImage(im, (W - w) / 2, y, w, h); cx.globalAlpha = 1;
      if (port()) { const f = h * .22; let g = cx.createLinearGradient(0, y, 0, y + f); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = g; cx.fillRect(0, y - 2, W, f + 2);
        g = cx.createLinearGradient(0, y + h - f, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); cx.fillStyle = g; cx.fillRect(0, y + h - f, W, f + 2); }
    }
    const load = i => new Promise(r => { if (fr[i]) return r(); const im = new Image(); im.decoding = 'async'; fr[i] = im;
      im.onload = () => { im.ok = true; loaded++; if (Math.abs(i - want) < 6) draw(true); r(); }; im.onerror = r;
      im.src = 'seq/' + dir + '/' + String(i).padStart(4, '0') + '.webp'; });
    const order = []; for (const step of [8, 4, 2, 1]) for (let i = 1; i <= N; i += step) if (!order.includes(i)) order.push(i);
    let started = false;
    const start = async () => { if (started) return; started = true; await load(1); size(); $('#fld').style.opacity = 0;
      const q = order.slice(); const worker = async () => { while (q.length) await load(q.shift()); }; await Promise.all([worker(), worker(), worker(), worker()]); };
    new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { start(); o.disconnect(); } }, { rootMargin: '150% 0px' }).observe(sec);
    addEventListener('resize', size);
    const capAt = (p, k) => { const c = CH[k], a = (c[0] - 1) / N, b = c[1] / N, m = (b - a) * .18; return Math.max(0, Math.min(1, Math.min(k ? (p - a) / m : 1, k < CH.length - 1 ? (b - p) / m : 1))); };
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: self => {
      const p = self.progress; want = Math.max(1, Math.min(N, Math.round(p * (N - 1)) + 1)); draw();
      caps.forEach((el, k) => { const v = reduce ? (chapter(want) === k ? 1 : 0) : capAt(p, k); el.style.opacity = v; el.style.transform = 'translateY(' + (1 - v) * 20 + 'px)'; });
      $('.fly .pg').style.opacity = p > .97 ? 0 : 1;
      bars.forEach((b, k) => { const c = CH[k]; b.style.transform = 'scaleX(' + Math.max(0, Math.min(1, (want - c[0]) / (c[1] - c[0]))) + ')'; });
    } });
  })();

  const light = new Set();
  ['#spec'].forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 60px', end: 'bottom 60px', onToggle: self => { self.isActive ? light.add(s) : light.delete(s); $('#nav').classList.toggle('lt', light.size > 0); } }));
})();
