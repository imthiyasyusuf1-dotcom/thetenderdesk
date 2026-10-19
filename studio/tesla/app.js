/* The new Roadster. Six scroll scenes, each pinned and scrubbed. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mob = matchMedia('(max-width:800px)').matches;
  if (/rec/.test(location.search)) document.documentElement.classList.add('rec');
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll on desktop only; phones keep native scrolling.
  if (!mob && window.Lenis && !/rec/.test(location.search)) {
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { duration: 2 });
    }));
  }

  // Lazy paint images, right size for the device
  $$('#paint .pc').forEach(im => { im.src = mob ? im.dataset.m : im.dataset.src; im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;clip-path:inset(0 0 0 100%)'; });

  const pin = (sel, len, tl) => ScrollTrigger.create({ trigger: sel, start: 'top top', end: '+=' + len, pin: true, scrub: true, animation: tl, anticipatePin: 1 });
  const E = 'none';

  /* 1. HERO: blueprint draws itself on load, scroll floods in the sketch then the real car */
  const strokes = $$('#hero .bp path, #hero .bp ellipse');
  strokes.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 2000; p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
  const intro = gsap.timeline({ delay: 0.35, paused: /rec/.test(location.search) });
  window.__intro = intro;
  intro.from('#hero .grid', { opacity: 0, duration: 1.2 })
    .to($$('#hero .bp .cn path'), { strokeDashoffset: 0, duration: 1.1, stagger: 0.12, ease: 'power2.inOut' }, 0.1)
    .to($$('#hero .bp .ln > *'), { strokeDashoffset: 0, duration: 1.8, stagger: 0.13, ease: 'power2.inOut' }, 0.5)
    .from('#hero .bp text', { opacity: 0, duration: 0.8 }, 1.4)
    .from('#hero .tt .k', { opacity: 0, y: 14, duration: 0.8 }, 1.6)
    .from('#hero h1 span', { opacity: 0, y: 40, filter: 'blur(14px)', duration: 1, stagger: 0.06, ease: 'power3.out' }, 1.7)
    .from('#hero .hint', { opacity: 0, duration: 0.6 }, 2.6);

  const h = gsap.timeline({ defaults: { ease: E } });
  h.to('#hero .hint', { opacity: 0, duration: 0.1 }, 0)
    .to('#hero .sk', { clipPath: 'inset(0 0% 0 0)', duration: 1 }, 0)
    .fromTo('#hero .blade', { left: '0%', opacity: 0 }, { left: '100%', duration: 1 }, 0)
    .to('#hero .blade', { opacity: 1, duration: 0.08 }, 0)
    .to('#hero .blade', { opacity: 0, duration: 0.1 }, 1)
    .set('#hero .blade', { left: '0%' }, 1.15)
    .to('#hero .blade', { opacity: 1, duration: 0.05 }, 1.15)
    .to('#hero .car', { clipPath: 'inset(0 0% 0 0)', duration: 1.1 }, 1.15)
    .to('#hero .blade', { left: '100%', duration: 1.1 }, 1.15)
    .to('#hero .blade', { opacity: 0, duration: 0.15 }, 2.2)
    .to('#hero .bp', { opacity: 0, duration: 0.6 }, 1.6)
    .to('#hero .sk', { opacity: 0, duration: 0.6 }, 1.8)
    .fromTo('#hero .flash', { opacity: 0 }, { opacity: 1, duration: 0.12 }, 2.2)
    .to('#hero .flash', { opacity: 0, duration: 0.5 }, 2.32)
    .to('#hero .grid', { opacity: 0, duration: 0.6 }, 2.2)
    .to('#hero .stage', { scale: 1.06, duration: 1 }, 2.2)
    .to('#hero .tt', { y: -30, opacity: 0.25, duration: 1 }, 2.4)
    .to('#hero .tt', { opacity: 0, duration: 0.4 }, 3.0)
    .to({}, { duration: 0.3 }, 3.4);
  pin('#hero', mob ? '220%' : '260%', h);

  /* 2. SPEED: stopwatch counts to 1.6, speedo to 230, the car blasts through and slices the type */
  const n1 = $$('#speed .n1'), n2 = $$('#speed .n2'), st = { a: 0, b: 0 };
  const s = gsap.timeline({ defaults: { ease: E } });
  s.fromTo('#speed .g1 .big', { scale: 2.6, opacity: 0, filter: 'blur(24px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power4.out' }, 0)
    .from('#speed .cap', { opacity: 0, y: 20, duration: 0.25 }, 0.1)
    .fromTo('#spf', { opacity: 0 }, { opacity: 0.8, duration: 0.15 }, 1.1)
    .to(st, { a: 1.6, duration: 0.9, onUpdate: () => n1.forEach(e => e.textContent = st.a.toFixed(1)) }, 0.2)
    .to('#speed .lines', { opacity: 1, duration: 0.05 }, 0.75)
    .fromTo($$('#speed .lines i'), { x: '110vw' }, { x: '-60vw', duration: 0.5, stagger: 0.03 }, 0.75)
    .to('#speed .blast', { x: '-170vw', duration: 0.6, ease: 'power1.in' }, 0.8)
    .to('#speed .g1 .half.a', { x: '-5vw', y: '-1.5vw', rotation: -1.5, duration: 0.12 }, 1.0)
    .to('#speed .g1 .half.b', { x: '5vw', y: '1.5vw', rotation: 1.5, duration: 0.12 }, 1.0)
    .to('#speed .g1 .half', { x: 0, y: 0, rotation: 0, duration: 0.3, ease: 'power3.out' }, 1.12)
    .to('#speed .lines', { opacity: 0, duration: 0.1 }, 1.3)
    .to('#speed .g1', { opacity: 0, scale: 0.8, filter: 'blur(12px)', duration: 0.25 }, 1.6)
    .call(() => {}, null, 1.6)
    .to('#spl', { opacity: 0, duration: 0.1 }, 1.6)
    .set('#spl', { textContent: 'Top speed, mph' }, 1.71)
    .to('#spf', { opacity: 0, duration: 0.1 }, 1.6)
    .set('#spf', { textContent: 'Over 230 mph.' }, 1.71)
    .to('#spf', { opacity: 0.8, duration: 0.15 }, 2.75)
    .to('#spl', { opacity: 1, duration: 0.15 }, 1.72)
    .fromTo('#speed .g2', { opacity: 0, scale: 2.6, filter: 'blur(24px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power4.out' }, 1.75)
    .to(st, { b: 230, duration: 0.9, onUpdate: () => n2.forEach(e => e.textContent = Math.round(st.b)) }, 1.85)
    .set('#speed .blast', { x: '110vw' }, 2.3)
    .to('#speed .lines', { opacity: 1, duration: 0.05 }, 2.45)
    .fromTo($$('#speed .lines i'), { x: '110vw' }, { x: '-60vw', duration: 0.45, stagger: 0.03 }, 2.45)
    .to('#speed .blast', { x: '-170vw', duration: 0.5, ease: 'power1.in' }, 2.5)
    .to('#speed .g2 .half.a', { x: '-6vw', y: '-1.8vw', rotation: -2, duration: 0.1 }, 2.66)
    .to('#speed .g2 .half.b', { x: '6vw', y: '1.8vw', rotation: 2, duration: 0.1 }, 2.66)
    .to('#speed .g2 .half', { x: 0, y: 0, rotation: 0, duration: 0.3, ease: 'power3.out' }, 2.76)
    .to('#speed .lines', { opacity: 0, duration: 0.1 }, 3.0)
    .to({}, { duration: 0.3 }, 3.2);
  pin('#speed', mob ? '260%' : '320%', s);

  /* 3. EXPLODE: body lifts, wheels and drivetrain float apart, labelled, then click back together */
  const x = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  x.from('#explode .ttl', { opacity: 0, y: 30, duration: 0.4 }, 0)
    .from('#xs', { x: '60vw', duration: 0.6, ease: 'power3.out' }, 0)
    .to('#explode .ints', { opacity: 1, duration: 0.4 }, 0.6)
    .to('#explode .body', { y: '-36%', opacity: 0.35, duration: 1 }, 0.6)
    .to('#explode .w0', { x: '-55%', y: '30%', rotation: -200, duration: 1 }, 0.6)
    .to('#explode .w1', { x: '55%', y: '30%', rotation: 200, duration: 1 }, 0.6)
    .to('#explode .mf', { x: -40, y: 70, duration: 1 }, 0.6)
    .to('#explode .mr', { x: 40, y: 70, duration: 1 }, 0.6)
    .to('#explode .bat', { y: 110, duration: 1 }, 0.6)
    .to('#explode .tk', { y: -40, duration: 1 }, 0.6)
    .to('#explode .th', { x: 60, duration: 1 }, 0.6)
    .to('#explode .l1', { opacity: 1, x: '-2vw', y: '4vw', duration: 0.3 }, 1.4)
    .to('#explode .l2', { opacity: 1, y: '5.5vw', duration: 0.3 }, 1.45)
    .to('#explode .l3', { opacity: 1, x: '2vw', y: '4vw', duration: 0.3 }, 1.5)
    .to('#explode .l4', { opacity: 1, y: '-3vw', duration: 0.3 }, 1.55)
    .to('#explode .l5', { opacity: 1, x: '3vw', duration: 0.3 }, 1.6)
    .to('#explode .lab', { opacity: 0, duration: 0.25 }, 2.4)
    .to('#explode .body', { y: 0, opacity: 1, duration: 0.8, ease: 'power3.in' }, 2.5)
    .to('#explode .w0, #explode .w1', { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'power3.in' }, 2.5)
    .to('#explode .mf, #explode .mr, #explode .bat, #explode .tk, #explode .th', { x: 0, y: 0, duration: 0.8, ease: 'power3.in' }, 2.5)
    .to('#explode .ints', { opacity: 0, duration: 0.2 }, 3.2)
    .fromTo('#xs', { scale: 1 }, { scale: 1.025, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.out' }, 3.3)
    .to({}, { duration: 0.3 }, 3.4);
  pin('#explode', mob ? '260%' : '320%', x);

  /* 4. PAINT: one sweep repaints the car white, red, black, silver */
  const layers = $$('#paint .stage img'), names = $$('#paint .names span'), dots = $$('#paint .dots i');
  const tones = ['#2a3346', '#5a0d14', '#262a33', '#3c424d'];
  gsap.set(names, { opacity: 0, y: 24 }); gsap.set(names[0], { opacity: 1, y: 0 });
  const p = gsap.timeline({ defaults: { ease: E } });
  p.from('#paint .ttl', { opacity: 0, y: 30, duration: 0.3 }, 0)
    .from('#paint .wrap', { x: '70vw', duration: 0.5, ease: 'power3.out' }, 0);
  [1, 2, 3].forEach((i, k) => {
    const t0 = 0.6 + k * 0.9;
    p.set('#paint .blade', { left: '100%', opacity: 1 }, t0)
      .to(layers[i], { clipPath: 'inset(0 0 0 0%)', duration: 0.6 }, t0)
      .to('#paint .blade', { left: '0%', duration: 0.6 }, t0)
      .to('#paint .blade', { opacity: 0, duration: 0.08 }, t0 + 0.6)
      .to('#paint', { '--pc': tones[i], duration: 0.6 }, t0)
      .to(names[i - 1], { opacity: 0, y: -24, duration: 0.2 }, t0 + 0.2)
      .to(names[i], { opacity: 1, y: 0, duration: 0.2 }, t0 + 0.32)
      .call(() => dots.forEach((d, j) => d.classList.toggle('on', j === (p.reversed() ? i - 1 : i))), null, t0 + 0.3);
  });
  p.to({}, { duration: 0.4 }, 3.3);
  ScrollTrigger.create({ trigger: '#paint', start: 'top top', end: '+=' + (mob ? '260%' : '320%'), pin: true, scrub: true, animation: p, anticipatePin: 1,
    onUpdate: self => { const t = p.time(); const i = t < 0.9 ? 0 : t < 1.8 ? 1 : t < 2.7 ? 2 : 3; dots.forEach((d, j) => d.classList.toggle('on', j === i)); } });

  /* 5. FLIGHT: the reveal night. Each shot zooms into the car and dissolves into the next */
  const frs = $$('#flight .fr'), caps = $$('#flight .cap');
  const f = gsap.timeline({ defaults: { ease: E } });
  const F0 = 0.8;
  frs.forEach((fr, i) => {
    const im = $('img', fr); gsap.set(im, { transformOrigin: fr.dataset.o }); if (mob) im.style.objectPosition = fr.dataset.o;
    const t0 = F0 + i * 1;
    f.fromTo(im, { scale: i ? 1.25 : 1.04 }, { scale: 1.32, duration: 1.4 }, t0 - (i ? 0.3 : 0));
    f.fromTo(fr, { opacity: 0 }, { opacity: 1, duration: i ? 0.3 : 0.6 }, i ? t0 - 0.3 : 0.2);
    f.fromTo(caps[i], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, t0 + 0.05)
      .to(caps[i], { opacity: 0, y: -30, duration: 0.15 }, t0 + 0.7);
  });
  f.to('#flight .whiteout', { opacity: 1, duration: 0.25, ease: 'power2.in' }, F0 + 3.85);
  pin('#flight', mob ? '380%' : '460%', f);

  /* 6. SPACE: punch up through the clouds, Earth turns below, title lands */
  const sp = gsap.timeline({ defaults: { ease: E }, delay: 0 });
  sp.to({}, { duration: 1 }, 0);
  sp.fromTo('#space .cl', { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0.55)
    .to('#space .cl.a', { scale: 3.2, opacity: 0, duration: 1 }, 1.0)
    .fromTo('#space .cl.b', { scale: 1.6 }, { scale: 4.2, duration: 1.2 }, 1.0)
    .to('#space .cl.b', { opacity: 0, duration: 0.6 }, 1.6)
    .fromTo('#space', { backgroundColor: '#ffffff' }, { backgroundColor: '#000', duration: 0.8 }, 1.0)
    .to('#space .stars', { opacity: 0.9, duration: 0.6 }, 1.6)
    .fromTo('#space .earth', { y: '40vh', scale: 1.1 }, { y: '0vh', scale: 1, duration: 1.4, ease: 'power2.out' }, 1.5)
    .fromTo('#space .earth', { '--ex': '0px' }, { '--ex': mob ? '-500px' : '-900px', duration: 2.6 }, 1.4)
    .to('#space .stars', { y: -60, duration: 2.6 }, 1.4)
    .fromTo('#space .end', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 2.5)
    .from('#space .end h2', { letterSpacing: '.5em', duration: 0.9, ease: 'power3.out' }, 2.5);
  pin('#space', mob ? '300%' : '340%', sp);

  // Pause off-screen hint animation work, refresh after images land
  addEventListener('load', () => ScrollTrigger.refresh());
})();
