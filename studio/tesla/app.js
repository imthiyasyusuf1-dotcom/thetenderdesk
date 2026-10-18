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
    gsap.fromTo('.hero .ph img', { scale: port ? .96 : 1.12 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
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

  const light = new Set();
  ['#config', '#spec'].forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 60px', end: 'bottom 60px', onToggle: self => { self.isActive ? light.add(s) : light.delete(s); $('#nav').classList.toggle('lt', light.size > 0); } }));
})();
