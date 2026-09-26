/**
 * main.js | BLVD Frames showcase
 * One clock: GSAP's ticker drives Lenis, ScrollTrigger and the WebGL render.
 * No other persistent requestAnimationFrame loops exist on the page.
 *
 * Modes
 *  full : WebGL hero, bloom, salt sim, pinned choreography (laptop/desktop)
 *  touch: same scenes, no bloom, fewer grains, native-feel scroll
 *  lite : prefers-reduced-motion or no WebGL. Static art direction, no pins.
 */
import { createTransition } from './transition.js';
import { initCursor } from './cursor.js';
import { initRail } from './rail.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
const hasGL = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
const lite = reduce || !hasGL;
if (lite) root.classList.add('lite');
if (reduce) root.classList.add('no-motion');

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

// House easing: a long, confident tail. Used everywhere instead of stock eases.
gsap.registerEase('blvd', (p) => 1 - Math.pow(1 - p, 4.2));
gsap.registerEase('blvdInOut', (p) => (p < .5 ? 8 * p ** 4 : 1 - 8 * (1 - p) ** 4));
gsap.defaults({ ease: 'blvd', duration: 1.1 });
gsap.ticker.lagSmoothing(0);
gsap.config({ nullTargetWarn: false }); // shared script runs on templates without every scene

const tx = createTransition($('#tx'));
// Arriving from one of our own links: finish the mask wipe on this side.
try { if (sessionStorage.getItem('blvd-tx')) { sessionStorage.removeItem('blvd-tx'); tx.in(); } } catch {}

/* ---------------------------------------------------------------- Lenis */
let lenis = null;
if (!reduce) {
  lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 0.95, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  lenis.stop();
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); lenis.scrollTo(t, { duration: 1.6, easing: (p) => 1 - Math.pow(1 - p, 4) });
  }));
}
const velocity = () => (lenis ? lenis.velocity : 0);

/* ---------------------------------------------------------------- data */
const CFG = window.BLVD || {};
const dataP = CFG.products ? Promise.resolve(CFG.products)
  : fetch('products.json').then((r) => r.json()).then((d) => d.products);

/* ---------------------------------------------------------------- 3D */
let hero = null;
const heroP = (lite || !$('#gl')) ? Promise.resolve(null) : import('./gl-hero.js').then(({ createHero }) => {
  hero = createHero($('#gl'), { mobile: touch || innerWidth < 760 });
  addEventListener('resize', () => hero.resize());
  return hero;
}).catch((err) => { console.warn('WebGL hero disabled', err); root.classList.add('lite'); return null; });

/* ---------------------------------------------------------------- preloader */
function preload() {
  if (!$('#pre')) return Promise.resolve();
  const count = $('#preCount'), bar = $('#preBar');
  const imgs = $$('img').slice(0, 4).filter((i) => !i.loading || i.loading !== 'lazy');
  const jobs = [document.fonts.ready, heroP, dataP, ...imgs.map((i) => i.decode ? i.decode().catch(() => {}) : 0)];
  let done = 0; const o = { v: 0 };
  const show = () => { count.textContent = String(Math.round(o.v)).padStart(3, '0'); bar.style.transform = `scaleX(${o.v / 100})`; };
  const step = () => gsap.to(o, { v: (++done / jobs.length) * 100, duration: .6, ease: 'power2.out', onUpdate: show });
  jobs.forEach((j) => Promise.resolve(j).then(step, step));
  gsap.to('.pre-logo span', { y: '0%', stagger: .06, duration: 1.2, delay: .1 });
  const minTime = new Promise((r) => setTimeout(r, reduce ? 200 : 1500));
  return Promise.all([Promise.allSettled(jobs), minTime]).then(() => new Promise((res) => {
    gsap.to(o, { v: 100, duration: .3, onUpdate: show, onComplete: () => {
      const tl = gsap.timeline({ onComplete: () => { $('#pre').classList.add('gone'); res(); } });
      tl.to('.pre-logo span', { y: '-105%', stagger: .04, duration: .7, ease: 'blvdInOut' })
        .to('.pre-count,.pre-tag', { opacity: 0, duration: .4 }, '<')
        .to('#pre', { yPercent: -100, duration: 1, ease: 'blvdInOut' }, '-=.25');
    } });
  }));
}

/* ---------------------------------------------------------------- scenes */
function heroIntro() {
  if (!$('.hero')) return;
  $('#gl') && $('#gl').classList.add('on');
  gsap.from('.hero h1 .line>span', { yPercent: 110, stagger: .09, duration: 1.4 });
  gsap.from('.hero-top, .hero-foot', { opacity: 0, duration: 1.2, delay: .5 });
}

function choreograph() {
  // Statement: words brighten as they cross the reading line.
  const st = $('#statement');
  if (!st) return;
  st.innerHTML = st.innerHTML.replace(/(<em>.*?<\/em>|[^\s<]+)/g, '<span class="w">$1</span>');
  if (!reduce) gsap.to('#statement .w', { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: st, start: 'top 75%', end: 'bottom 45%', scrub: true } });
  else $$('#statement .w').forEach((w) => (w.style.opacity = 1));

  if (reduce) return;

  // Hero type drifts apart as you leave: kinetic, transform only.
  gsap.to('.hero h1 .line:nth-child(1)>span', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero h1 .line:nth-child(3)>span', { xPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Kinetic rows: scroll-scrubbed marquee plus velocity skew.
  $$('.kin-row').forEach((row) => {
    const dir = +row.dataset.dir;
    gsap.fromTo(row, { xPercent: dir > 0 ? -30 : 0 }, { xPercent: dir > 0 ? 0 : -30, ease: 'none', scrollTrigger: { trigger: '.kin', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Lookbook: horizontal travel on a CSS sticky pin. Sticky costs no
  // reparenting or position flips, so there is zero layout shift and the
  // compositor keeps the panel glued even if a frame is late.
  const track = $('#lookTrack'), look = $('.look');
  if (!root.classList.contains('lite')) {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const size = () => { look.style.height = innerHeight + dist() + 'px'; };
    size(); ScrollTrigger.addEventListener('refreshInit', size);
    const idx = $('#lookIdx'), cards = $$('.look-card', track);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: look, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true,
        onUpdate: (s) => { idx.textContent = String(Math.min(cards.length, Math.max(1, Math.ceil(s.progress * cards.length)))).padStart(2, '0'); },
      },
    });
  }

  // Specs: stepped reveal, each item offset on a slight diagonal.
  gsap.from('.specs-list li', { y: 60, opacity: 0, stagger: .12, scrollTrigger: { trigger: '.specs', start: 'top 70%' } });

  // Variable font axis: weight swells 200 to 800 as the outro scrolls in.
  gsap.fromTo('.outro .vf', { '--wght': 200 }, { '--wght': 800, ease: 'none', scrollTrigger: { trigger: '.outro', start: 'top 85%', end: 'center 55%', scrub: true } });
  gsap.from('.outro h2 em', { yPercent: 60, rotate: -6, opacity: 0, scrollTrigger: { trigger: '.outro', start: 'top 60%' } });

  // Velocity reactive skew. quickSetter writes transform only.
  const skewEls = $$('.look-card .shift, .kin-row span, .card-in');
  const setSkew = skewEls.map((el) => gsap.quickTo(el, 'skewX', { duration: .5, ease: 'power3' }));
  gsap.ticker.add(() => {
    const v = gsap.utils.clamp(-5, 5, velocity() * -0.15);
    for (let i = 0; i < setSkew.length; i++) setSkew[i](v);
  });
}

function wireHero() {
  if (!hero) return;
  const s = hero.state;
  // Scroll drives rotation through the hero + intro.
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', endTrigger: '.intro', end: 'bottom bottom', scrub: true, onUpdate: (t) => (s.p = t.progress) });
  // Spoon section: fly the camera down the arm, then pour the salt.
  ScrollTrigger.create({ trigger: '.spoon', start: 'top top', end: 'bottom bottom', scrub: 0.4,
    onUpdate: (t) => {
      s.spoon = gsap.utils.clamp(0, 1, t.progress / .38);
      s.salt = gsap.utils.clamp(0, 1, (t.progress - .34) / .6);
    } });
  gsap.fromTo('.spoon-label', { opacity: 0, y: 40 }, { opacity: 1, y: 0, scrollTrigger: { trigger: '.spoon', start: '25% top', end: '38% top', scrub: true } });
  gsap.fromTo('.spoon-label', { opacity: 1 }, { opacity: 0, immediateRender: false, scrollTrigger: { trigger: '.spoon', start: '55% top', end: '62% top', scrub: true } });

  // Mouse parallax (smoothed inside the render loop).
  addEventListener('pointermove', (e) => { s.mx = e.clientX / innerWidth - .5; s.my = e.clientY / innerHeight - .5; }, { passive: true });

  // Render only while the canvas can be seen: hero, intro or spoon on screen.
  const canvas = $('#gl');
  const live = new Set();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target)));
    canvas.style.visibility = live.size ? 'visible' : 'hidden';
  });
  $$('.hero, .intro, .spoon').forEach((el) => io.observe(el));
  let hidden = false;
  document.addEventListener('visibilitychange', () => (hidden = document.hidden));
  gsap.ticker.add((time) => {
    if (!live.size || hidden) return;
    s.vel = velocity();
    hero.render(time * 1000);
  });
}

/* ---------------------------------------------------------------- page transitions */
function wireTransitions() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (href.startsWith('#') || href.startsWith('mailto:') || a.hasAttribute('data-no-tx') || a.closest('[data-cart-drawer]')) return;
    e.preventDefault();
    lenis && lenis.stop();
    tx.out(() => { try { sessionStorage.setItem('blvd-tx', 1); } catch {} location.href = a.href; });
  });
  // Coming back via the back/forward cache: reveal again.
  addEventListener('pageshow', (e) => { if (e.persisted) { tx.in(); lenis && lenis.start(); } });
}

/* ---------------------------------------------------------------- boot */
(async function boot() {
  const products = await dataP.catch(() => []);
  if ($('#rail')) initRail(products, { lenis, velocity, addToCart: CFG.addToCart });
  if (!touch && !reduce) initCursor();
  await preload();
  wireHero();
  choreograph();
  wireTransitions();
  heroIntro();
  lenis && lenis.start();
  window.BLVD_LENIS = lenis;
  ScrollTrigger.refresh();
  // Re-measure after late fonts/images so pins never overlap.
  addEventListener('load', () => ScrollTrigger.refresh());
})();
