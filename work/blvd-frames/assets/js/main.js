/**
 * main.js | BLVD Frames showcase
 *
 * Performance model
 *  - One clock: GSAP's ticker. No other persistent rAF loops.
 *  - Touch devices scroll natively. Lenis only runs on mouse/trackpad
 *    devices, where it smooths the wheel; it never touches touch scroll.
 *  - ScrollTrigger reports progress into plain numbers (no layout reads in
 *    scroll handlers). The ticker lerps toward them and redraws the 3D
 *    only when the value actually changed (render on demand), and never
 *    while the stage is offscreen or the tab is hidden.
 *  - Phones scrub a pre-baked WebP sequence of the same scene on a 2D
 *    canvas (sequence.js). Laptops run the live WebGL scene (gl-hero.js)
 *    and drop to DPR 1 automatically if frames run long.
 *
 * Modes: .lite = prefers-reduced-motion or no WebGL (static art direction).
 */
import { createTransition } from './transition.js';
import { initCursor } from './cursor.js';
import { initRail } from './rail.js';
import { createSequence } from './sequence.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
const small = innerWidth < 820;
const hasGL = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
const useSequence = !reduce && (touch || small);
const lite = reduce || (!useSequence && !hasGL);
if (lite) root.classList.add('lite');
if (reduce) root.classList.add('no-motion');
if (touch) root.classList.add('touch');

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
gsap.registerEase('blvd', (p) => 1 - Math.pow(1 - p, 4.2));
gsap.registerEase('blvdInOut', (p) => (p < .5 ? 8 * p ** 4 : 1 - 8 * (1 - p) ** 4));
gsap.defaults({ ease: 'blvd', duration: 1.1 });
gsap.config({ nullTargetWarn: false });
// Mobile browsers resize the viewport as the URL bar moves; do not refresh on that.
ScrollTrigger.config({ ignoreMobileResize: true });
if (touch) ScrollTrigger.normalizeScroll(false);

const CFG = window.BLVD || {};
const asset = CFG.asset || ((p) => p);
const tx = createTransition($('#tx'));
try { if (sessionStorage.getItem('blvd-tx')) { sessionStorage.removeItem('blvd-tx'); tx.in(); } } catch {}

/* ---------------------------------------------------------------- scroll */
let lenis = null;
if (!reduce && !touch && window.Lenis) {
  lenis = new window.Lenis({ lerp: 0.12, wheelMultiplier: 0.95, syncTouch: false, smoothTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollToEl(t) {
  if (lenis) lenis.scrollTo(t, { duration: 1.4 });
  else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const t = $(a.getAttribute('href')); if (!t) return;
  e.preventDefault(); closeMenu(); scrollToEl(t);
}));
const velocity = () => (lenis ? lenis.velocity : 0);

/* ---------------------------------------------------------------- mobile nav */
const burger = $('#burger'), menu = $('#menu');
function closeMenu() { if (!menu) return; root.classList.remove('menu-open'); burger?.setAttribute('aria-expanded', 'false'); }
burger?.addEventListener('click', () => {
  const open = !root.classList.contains('menu-open');
  root.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', String(open));
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* ---------------------------------------------------------------- data */
const dataP = CFG.products ? Promise.resolve(CFG.products)
  : fetch('products.json').then((r) => r.json()).then((d) => d.products);

/* ---------------------------------------------------------------- 3D stage */
const canvas = $('#gl');
const SEQ = { count: 72, width: 540, height: 1170, colours: ['coco-chanel', 'red-groovers', 'salmon-bomber', 'ghost-chrome', 'raver'] };
let stage = null; // { draw(T, mx, my, time), resize(), setColour?(i) }

function makeStage() {
  if (lite || !canvas) return Promise.resolve(null);
  if (useSequence) {
    const base = (i) => asset(CFG.seqBase ? CFG.seqBase(SEQ.colours[i]) : `img/seq/${SEQ.colours[i]}/`);
    const seq = createSequence(canvas, { base: base(0), count: SEQ.count, width: SEQ.width, height: SEQ.height });
    stage = { draw: (T) => seq.draw(T), resize: () => seq.resize(), setColour: (i) => seq.swap(base(i)) };
    return seq.load().then(() => stage);
  }
  return import('./gl-hero.js').then(({ createHero }) => {
    const hero = createHero(canvas, { mobile: false });
    stage = { draw: hero.draw, resize: () => hero.resize(), setColour: hero.setColour, hero };
    return stage;
  });
}
const stageP = makeStage().catch((err) => { console.warn('3D disabled', err); root.classList.add('lite'); return null; });

/* ---------------------------------------------------------------- preloader */
// Never blocks longer than ~1.2s: whatever is not ready streams in after.
function preload() {
  const pre = $('#pre');
  if (!pre) return Promise.resolve();
  if (reduce) { pre.classList.add('gone'); return Promise.resolve(); }
  const count = $('#preCount'), bar = $('#preBar'), o = { v: 0 };
  const show = () => { count.textContent = String(Math.round(o.v)).padStart(3, '0'); bar.style.transform = `scaleX(${o.v / 100})`; };
  gsap.to('.pre-logo span', { y: '0%', stagger: .05, duration: .7 });
  const ready = Promise.race([Promise.allSettled([stageP, document.fonts.ready]), new Promise((r) => setTimeout(r, 900))]);
  const tween = gsap.to(o, { v: 90, duration: .8, ease: 'power2.out', onUpdate: show });
  return ready.then(() => new Promise((res) => {
    tween.kill();
    gsap.timeline({ onComplete: () => { pre.classList.add('gone'); res(); } })
      .to(o, { v: 100, duration: .15, onUpdate: show })
      .to('.pre-logo span', { y: '-105%', stagger: .03, duration: .35, ease: 'blvdInOut' })
      .to(pre, { yPercent: -100, duration: .45, ease: 'blvdInOut' }, '-=.15');
  }));
}

/* ---------------------------------------------------------------- 3D driver */
function wireStage() {
  if (!stage) return;
  canvas.classList.add('on');
  // Targets written by ScrollTrigger (cheap: numbers only).
  const target = { hero: 0, spoon: 0 };
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', endTrigger: '.intro', end: 'bottom bottom', onUpdate: (t) => (target.hero = t.progress) });
  ScrollTrigger.create({ trigger: '.spoon', start: 'top top', end: 'bottom bottom', onUpdate: (t) => (target.spoon = t.progress) });
  gsap.fromTo('.spoon-label', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.spoon', start: '22% top', end: '34% top', scrub: true } });
  // Get out of the way once the salt starts spelling the line.
  gsap.fromTo('.spoon-label', { opacity: 1 }, { opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.spoon', start: '50% top', end: '58% top', scrub: true } });

  // Pointer parallax on laptops only.
  const mouse = { x: 0, y: 0 };
  if (!touch) addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - .5; mouse.y = e.clientY / innerHeight - .5; }, { passive: true });

  // Only draw while the stage sections are on screen and the tab is visible.
  const live = new Set();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? live.add(e.target) : live.delete(e.target)));
    canvas.style.visibility = live.size ? 'visible' : 'hidden';
  }, { rootMargin: '10% 0px' });
  $$('.hero, .intro, .spoon').forEach((el) => io.observe(el));

  let T = 0, mx = 0, my = 0, last = { T: -1, mx: 9, my: 9, salt: -1 };
  let slow = 0, frames = 0, prev = 0, dprDropped = false;
  const redraw = () => (last.T = -1);
  addEventListener('resize', () => { stage.resize(); redraw(); });

  gsap.ticker.add((time, dtMs) => {
    if (!live.size || document.hidden) return;
    const dt = Math.min(dtMs, 50) / 1000;
    const goal = target.spoon > 0 ? 1 + target.spoon : target.hero;
    // Frame-rate independent lerp: one smoothing for scroll, one for pointer.
    T += (goal - T) * (1 - Math.exp(-(useSequence ? 18 : 10) * dt));
    mx += (mouse.x - mx) * (1 - Math.exp(-4 * dt));
    my += (mouse.y - my) * (1 - Math.exp(-4 * dt));
    if (Math.abs(goal - T) < 1e-4) T = goal;
    // Salt shimmers while visible, which needs a redraw on the live scene.
    const shimmer = !useSequence && T > 1.36;
    if (!shimmer && Math.abs(T - last.T) < 2e-4 && Math.abs(mx - last.mx) < 1e-3 && Math.abs(my - last.my) < 1e-3) return;
    last.T = T; last.mx = mx; last.my = my;
    const t0 = performance.now();
    stage.draw(T, mx, my, time);
    // Live scene guard: if frames take too long, drop DPR to 1 once.
    if (stage.hero && !dprDropped) {
      frames++; if (performance.now() - t0 > 12 || (prev && dtMs > 24)) slow++;
      prev = dtMs;
      if (frames > 60 && slow / frames > 0.25) { stage.hero.renderer.setPixelRatio(1); stage.resize(); dprDropped = true; }
    }
  });

  // Colourway chips. Real in-stock frame colours.
  $$('[data-colour]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-colour]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    Promise.resolve(stage.setColour(+b.dataset.colour)).then(redraw);
    redraw();
  }));
}

/* ---------------------------------------------------------------- scenes */
function heroIntro() {
  if (!$('.hero') || reduce) return;
  gsap.from('.hero h1 .line>span', { yPercent: 110, stagger: .08, duration: 1.1 });
  gsap.from('.hero-top, .hero-foot, .swatches', { opacity: 0, duration: .9, delay: .3 });
}

function choreograph() {
  const st = $('#statement');
  if (!st) return;
  st.innerHTML = st.innerHTML.replace(/(<em>.*?<\/em>|[^\s<]+)/g, '<span class="w">$1</span>');
  if (reduce) { $$('#statement .w').forEach((w) => (w.style.opacity = 1)); return; }
  gsap.to('#statement .w', { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 50%', scrub: true } });

  // Hero type drifts apart as you leave (transform only).
  gsap.to('.hero h1 .line:nth-child(1)>span', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero h1 .line:nth-child(3)>span', { xPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Kinetic rows: scroll scrubbed marquee.
  $$('.kin-row').forEach((row) => {
    const dir = +row.dataset.dir;
    gsap.fromTo(row, { xPercent: dir > 0 ? -30 : 0 }, { xPercent: dir > 0 ? 0 : -30, ease: 'none', scrollTrigger: { trigger: '.kin', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Lookbook: horizontal travel on a CSS sticky pin (laptops). On phones the
  // track is a native swipe strip (CSS scroll-snap), which is always smooth.
  const track = $('#lookTrack'), look = $('.look');
  if (track && !touch && !small) {
    let dist = 0;
    const size = () => { dist = Math.max(0, track.scrollWidth - innerWidth); look.style.height = innerHeight + dist + 'px'; };
    size(); ScrollTrigger.addEventListener('refreshInit', size);
    const idx = $('#lookIdx'), n = $$('.look-card', track).length;
    gsap.to(track, {
      x: () => -dist, ease: 'none',
      scrollTrigger: { trigger: look, start: 'top top', end: 'bottom bottom', scrub: 0.4, invalidateOnRefresh: true,
        onUpdate: (s) => { idx.textContent = String(Math.min(n, Math.max(1, Math.ceil(s.progress * n)))).padStart(2, '0'); } },
    });
    // Velocity skew on laptops only (quickTo writes transforms only).
    const els = $$('.look-card .shift, .kin-row span');
    const set = els.map((el) => gsap.quickTo(el, 'skewX', { duration: .5, ease: 'power3' }));
    let lastV = 0;
    gsap.ticker.add(() => {
      const v = gsap.utils.clamp(-4, 4, velocity() * -0.12);
      if (Math.abs(v - lastV) < 0.05) return; lastV = v;
      for (let i = 0; i < set.length; i++) set[i](v);
    });
  }

  gsap.from('.specs-list li', { y: 40, opacity: 0, stagger: .1, scrollTrigger: { trigger: '.specs', start: 'top 75%' } });
  gsap.fromTo('.outro .vf', { '--wght': 200 }, { '--wght': 800, ease: 'none', scrollTrigger: { trigger: '.outro', start: 'top 85%', end: 'center 55%', scrub: true } });
  gsap.from('.outro h2 em', { yPercent: 60, rotate: -6, opacity: 0, scrollTrigger: { trigger: '.outro', start: 'top 65%' } });
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
  addEventListener('pageshow', (e) => { if (e.persisted) { tx.in(); lenis && lenis.start(); } });
}

/* ---------------------------------------------------------------- boot */
(async function boot() {
  dataP.then((products) => { if ($('#rail')) initRail(products, { lenis, velocity, addToCart: CFG.addToCart }); }).catch(() => {});
  if (!touch && !reduce) initCursor();
  await preload();
  await Promise.race([stageP, new Promise((r) => setTimeout(r, 300))]);
  stageP.then(() => { wireStage(); ScrollTrigger.refresh(); });
  choreograph();
  wireTransitions();
  heroIntro();
  window.BLVD_LENIS = lenis;
  ScrollTrigger.refresh();
  addEventListener('load', () => ScrollTrigger.refresh());
})();
