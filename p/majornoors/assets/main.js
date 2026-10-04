(function () {
  const Q = new URLSearchParams(location.search), SHOT = Q.has('shot');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // split manifesto into words
  $$('[data-split]').forEach(el => {
    const walk = n => { [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) f.append(t); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; f.append(s); } }); c.replaceWith(f); }
      else walk(c); }); };
    walk(el);
  });
  // reveal targets
  $$('.burma-copy > *, .sons-copy > *, .eat-head, .e, .item, .give-in > *, .faq h2, .qs details, .shop-head, .kicker').forEach(e => e.classList.add('rv'));

  const intro = $('.intro');
  if (intro) { if (SHOT || reduce) intro.remove(); else { document.documentElement.style.overflow='hidden'; const done=()=>{intro.classList.add('out'); document.documentElement.style.overflow=''; setTimeout(()=>intro.remove(),1100);}; (document.readyState==='complete'?Promise.resolve():new Promise(r=>addEventListener('load',r))).then(()=>setTimeout(done,700)); setTimeout(done,3500); } }
  const nav = $('#nav'), buy = $('.sticky-buy'), hero = $('.hero');
  function onScroll() {
    const y = scrollY; nav.classList.toggle('solid', y > innerHeight * .6);
    const fr = $('.foot').getBoundingClientRect().top;
    const on = y > hero.offsetHeight - innerHeight && fr > innerHeight * .9; buy.classList.toggle('on', on); document.documentElement.classList.toggle('buy-on', on);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (SHOT || reduce || !window.gsap) {
    $$('.rv').forEach(e => e.classList.add('in')); $$('.big-say .w').forEach(w => w.classList.add('on'));
    if (SHOT) document.documentElement.classList.add('shot');
    if (!window.gsap || reduce) return;
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(e => io.observe(e));
  }

  gsap.registerPlugin(ScrollTrigger);
  if (!SHOT && window.Lenis) {
    const lenis = new Lenis({ lerp: .1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t); } }));
  }

  // hero words drift apart
  gsap.to('.w1', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true } });
  gsap.to('.w2', { xPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true } });
  gsap.to('.hero-copy,.hero-top', { opacity: 0, y: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: '60% top', scrub: true } });
  gsap.to('.hero-photo img', { scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true } });

  // manifesto word light-up
  if (!SHOT) {
    const ws = $$('.big-say .w');
    ScrollTrigger.create({ trigger: '.big-say', start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: s => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n)); } });
  }

  // horizontal panels
  const track = $('.heat-track');
  gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none',
    scrollTrigger: { trigger: '.heat', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), pin: true, scrub: .6, invalidateOnRefresh: true } });
  $$('.panel img').forEach(img => gsap.fromTo(img, { xPercent: -4 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: '.heat', start: 'top top', end: () => '+=' + (track.scrollWidth), scrub: true } }));

  // Burma: portrait settles, year drifts
  gsap.fromTo('.noor-frame', { rotate: -9, y: 80 }, { rotate: -3, y: 0, ease: 'none', scrollTrigger: { trigger: '.burma', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.fromTo('.burma-year', { yPercent: 12 }, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.burma', start: 'top bottom', end: 'bottom top', scrub: true } });

  gsap.fromTo('.sons-img img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.sons-img', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('.quote span').forEach((s, i) => gsap.fromTo(s, { xPercent: i % 2 ? 12 : -12 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.quote', start: 'top bottom', end: 'bottom 60%', scrub: true } }));

  // pour: window opens to full bleed
  const mob = innerWidth < 760;
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.pour', start: 'top top', end: 'bottom bottom', scrub: true } });
  tl.fromTo('.pour-img', { clipPath: mob ? 'inset(18% 8% 18% 8% round 18px)' : 'inset(22% 30% 22% 30% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
    .fromTo('.pour-img img', { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
    .fromTo('.pour-t span', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .1, ease: 'none', duration: .3 }, .4);

  gsap.to('.w3', { xPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: true } });
  gsap.to('.floor', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '20% top', end: '60% top', scrub: true } });
  [['.fl1', -160, 50], ['.fl2', -320, -60], ['.fl3', -90, 30]].forEach(([s, y, r]) => gsap.to(s, { y, rotation: '+=' + r, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.fromTo('.manifesto', { backgroundColor: '#0e0b0a' }, { backgroundColor: '#13261b', ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'center 70%', end: 'bottom top', scrub: true } });
  gsap.fromTo('.tenp img', { rotation: -40 }, { rotation: 20, ease: 'none', scrollTrigger: { trigger: '.give', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.tenp', { scale: .7, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.give', start: 'top 85%', end: 'top 35%', scrub: true } });
  gsap.fromTo('.foot-word', { xPercent: 10 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
