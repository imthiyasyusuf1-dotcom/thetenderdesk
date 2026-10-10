/* Tender Desk motion kit v1 (/p/_motion/motion.js)
   Vanilla ports of React Bits ideas on GSAP + ScrollTrigger + Lenis:
   BlurText / SplitText headline reveals, ShinyText accent word, CountUp numbers,
   Magnetic CTA buttons, AnimatedContent section fade-ups, subtle hero parallax.
   Opt out per element with data-m="off", per page with <html data-motion="off">. */
(function () {
  var d = document, html = d.documentElement;
  function ready() { html.classList.add('m-ready'); }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || html.dataset.motion === 'off' || !window.gsap) { ready(); return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (ST) gsap.registerPlugin(ST);
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var vh = innerHeight;
  // leave alone: opt-outs, the page's own reveal system, and anything inside a pinned/sticky story
  function off(el) {
    if (el.closest('[data-m="off"],.rv,[data-reveal],.story,[data-pin]')) return true;
    for (var n = el.parentElement; n && n !== d.body; n = n.parentElement) if (getComputedStyle(n).position === 'sticky') return true;
    return false;
  }
  function below(el) { return el.getBoundingClientRect().top > vh * 0.92; }

  /* ---------- Lenis smooth scroll (desktop wheel; phones keep native touch) ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false,
      prevent: function (n) { return !!(n.closest && n.closest('[data-lenis-prevent],dialog,.drawer,.modal,[aria-modal="true"]')); } });
    window.__lenis = lenis;
    if (ST) lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // pause while a menu/overlay locks the page (overflow hidden on html or body)
    var lockCheck = function () {
      var cls = html.className.replace(/\blenis\S*/g, '');
      var locked = html.style.overflow === 'hidden' || /menu|nav-open|lock|no-scroll|\bopen\b/.test(cls) || getComputedStyle(d.body).overflowY === 'hidden';
      locked ? lenis.stop() : lenis.start();
    };
    var mo = new MutationObserver(function () { requestAnimationFrame(lockCheck); });
    mo.observe(html, { attributes: true, attributeFilter: ['class', 'style'] });
    mo.observe(d.body, { attributes: true, attributeFilter: ['class', 'style'] });
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = d.getElementById(decodeURIComponent(id.slice(1))); if (!t) return;
      e.preventDefault();
      var pad = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
      if (!pad) { var hd = d.querySelector('header'); if (hd && /fixed|sticky/.test(getComputedStyle(hd).position)) pad = hd.offsetHeight; }
      lenis.scrollTo(t, { offset: -pad });
      history.replaceState(null, '', id);
    });
  }

  /* ---------- SplitText: wrap words, keep inline tags (em, strong, br, a) ---------- */
  function split(el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var s = d.createElement('span'); s.className = 'm-w'; s.textContent = p; frag.appendChild(s); words.push(s);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && !/^(BR|SVG|IMG|SCRIPT)$/.test(c.tagName)) walk(c);
      });
    })(el);
    return words;
  }
  function done(ws) { ws.forEach(function (w) { w.classList.add('m-done'); }); }

  /* ---------- ShinyText on one accent word of the h1 ---------- */
  function shine(h1) {
    var acc = h1.querySelector('em,.accent,.hl,mark,span[style*="color"]');
    if (!acc || acc.textContent.trim().length > 24) return;
    var cs = getComputedStyle(acc), c = cs.color;
    if (cs.backgroundImage !== 'none' || parseFloat(cs.webkitTextStrokeWidth) > 0 || /rgba\(.*,\s*0\)|transparent/.test(cs.webkitTextFillColor + c)) return;
    acc.style.setProperty('--m-c', c);
    // highlight: white on dark accents, near-white tint on light ones
    var m = c.match(/\d+/g) || [0, 0, 0], lum = (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255;
    acc.style.setProperty('--m-hi', lum > 0.75 ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.92)');
    acc.querySelectorAll('.m-w').forEach(function (w) { w.replaceWith(d.createTextNode(w.textContent)); });
    acc.normalize(); acc.classList.add('m-shine');
  }

  /* ---------- BlurText hero headline ---------- */
  var h1 = d.querySelector('h1');
  if (h1 && !h1.closest('[data-m="off"]') && h1.textContent.trim().length < 140) {
    var hw = split(h1);
    gsap.set(hw, { opacity: 0, yPercent: 40, filter: 'blur(10px)' });
    ready();
    gsap.to(hw, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: 0.1,
      clearProps: 'filter,transform', onComplete: function () { done(hw); shine(h1); } });
    // hero support copy: gentle staggered fade after the headline
    var hero = h1.closest('section,header,.hero') || h1.parentNode;
    var sub = Array.prototype.slice.call(hero.querySelectorAll('p,.ctas,.cta,.btns,.hero-cta,.badges,.chips,.kicker,.eyebrow,.tag'))
      .filter(function (el) { return !off(el) && !el.contains(h1) && !h1.contains(el) && el.getBoundingClientRect().height > 0; }).slice(0, 6);
    if (sub.length) gsap.from(sub, { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out', stagger: 0.08, delay: 0.45, clearProps: 'transform,opacity' });
  } else ready();

  if (!ST) return;

  /* ---------- SplitText h2 reveals on scroll ---------- */
  d.querySelectorAll('h2').forEach(function (h) {
    if (off(h) || !below(h) || h.textContent.trim().length > 120) return;
    var ws = split(h);
    gsap.set(ws, { opacity: 0, yPercent: 60 });
    ST.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () {
      gsap.to(ws, { opacity: 1, yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.045, clearProps: 'transform', onComplete: function () { done(ws); } });
    } });
  });

  /* ---------- AnimatedContent: section blocks fade up in batches ---------- */
  var blocks = [];
  d.querySelectorAll('main section, body > section, section').forEach(function (sec, i) {
    if (sec.querySelector('h1') || off(sec) || sec.parentNode.closest('section')) return;
    var kids = Array.prototype.slice.call(sec.children);
    if (kids.length === 1 && kids[0].children.length > 1) kids = Array.prototype.slice.call(kids[0].children);
    kids.forEach(function (k) {
      if (/^(H2|SCRIPT|STYLE)$/.test(k.tagName) || off(k) || k.querySelector('.rv,[data-reveal]')) return;
      if (/fixed|sticky|absolute/.test(getComputedStyle(k).position)) return;
      // grids: animate the cards, not the grid
      var cs = getComputedStyle(k);
      var items = (/grid|flex/.test(cs.display) && k.children.length > 1 && k.children.length <= 12) ? Array.prototype.slice.call(k.children) : [k];
      items.forEach(function (it) { if (below(it) && !it.querySelector('h2 .m-w') && blocks.indexOf(it) < 0) blocks.push(it); });
    });
  });
  if (blocks.length) {
    gsap.set(blocks, { opacity: 0, y: 28 });
    ST.batch(blocks, { start: 'top 90%', once: true, onEnter: function (b) {
      gsap.to(b, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'transform,opacity' });
    } });
  }

  /* ---------- CountUp: short numeric stats (not phones, years or prices) ---------- */
  var numRe = /^([£$€]?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d))?([+%k★*]*|\s?\+)$/;
  d.querySelectorAll('strong,b,span,div,dt,dd,em,p,h3,h4,.num,.stat,[data-count]').forEach(function (el) {
    if (el.children.length || off(el) || el.closest('a,button,script,h1,h2,time,form,nav,footer')) return;
    var t = el.textContent.trim(), m = t.match(numRe);
    if (!m || t.length > 9) return;
    var n = parseFloat(m[2].replace(/,/g, '') + (m[3] ? '.' + m[3] : ''));
    if (n < 3 || (n >= 1900 && n <= 2100 && !m[2].includes(',')) || m[1]) return; // skip years and prices
    var dec = m[3] ? 1 : 0, comma = m[2].indexOf(',') > -1;
    el.classList.add('m-n'); el.style.minWidth = el.getBoundingClientRect().width + 'px';
    var o = { v: 0 }, fmt = function (v) { var s = v.toFixed(dec); if (comma) s = Number(s).toLocaleString('en-GB', { minimumFractionDigits: dec }); return m[1] + s + m[4]; };
    el.textContent = fmt(0);
    ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () {
      gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = fmt(o.v); }, onComplete: function () { el.textContent = t; } });
    } });
  });

  /* ---------- subtle hero parallax (image drifts slower than the page) ---------- */
  if (h1) {
    var heroSec = h1.closest('section,header,.hero');
    var media = heroSec && heroSec.querySelector('img,video,picture img');
    if (media && !off(media)) {
      var box = media.parentNode;
      while (box && box !== heroSec && getComputedStyle(box).overflow === 'visible') box = box.parentNode;
      var ok = box && getComputedStyle(box).overflow !== 'visible' && getComputedStyle(media).transform === 'none' && getComputedStyle(media).animationName === 'none' && getComputedStyle(media).objectFit === 'cover';
      if (ok) gsap.fromTo(media, { yPercent: 0, scale: 1.08 }, { yPercent: 7, scale: 1.08, ease: 'none', scrollTrigger: { trigger: heroSec, start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  /* ---------- Magnetic CTA buttons (mouse only, never on touch) ---------- */
  if (finePointer) d.querySelectorAll('.btn,.cta a,a.cta,button.cta').forEach(function (b) {
    if (off(b) || /fixed|sticky/.test(getComputedStyle(b).position)) return;
    var qx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3.out' }), qy = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3.out' });
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.22); qy((e.clientY - r.top - r.height / 2) * 0.3); });
    b.addEventListener('pointerleave', function () { qx(0); qy(0); });
  });

  addEventListener('load', function () { ST.refresh(); });
})();
