/* Tender Desk detail kit v1 (/p/_motion/details.js), no dependencies.
   Vanilla ports of Magic UI ideas (MIT, magicui.design), restyled from each page's own colours and fonts:
   - Shimmer CTA      auto on the first solid button in the hero, or any [data-shimmer]
   - Border beam      auto on card-like quote forms, or any [data-beam] (value = seconds per lap)
   - Number ticker    any [data-ticker]; on motion-kit pages (html.m-on) also short stats (not prices or years)
   - Marquee strip    [data-td-marquee="A|B|C"] where you want it; otherwise built from the page's services and placed after the hero
   - Animated list    [data-alist] (children cycle in like notifications; data-alist-max, data-alist-every in ms)
   Opt out per element with data-m="off", per page with <html data-details="off">. */
(function () {
  var d = document, html = d.documentElement;
  if (html.dataset.details === 'off') return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var kitPage = html.classList.contains('m-on') || !!d.querySelector('script[src*="_motion/motion.js"]');
  function off(el) { return !!el.closest('[data-m="off"]'); }
  function rgb(c) { var m = (c || '').match(/[\d.]+/g); return m && m.length >= 3 ? m.map(Number) : null; }
  function alpha(c) { var m = rgb(c); return !m ? 0 : m.length > 3 ? m[3] : 1; }
  function lum(m) { return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255; }
  function sat(m) { var mx = Math.max(m[0], m[1], m[2]), mn = Math.min(m[0], m[1], m[2]); return mx ? (mx - mn) / mx : 0; }
  // run looping details only while on screen
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('run', e.isIntersecting && !reduce); });
  }, { rootMargin: '80px' }) : null;
  function watch(el) { if (io) io.observe(el); else el.classList.add('run'); }

  var h1 = d.querySelector('h1');
  var hero = h1 && (h1.closest('section,header,.hero') || h1.parentNode);

  /* ---------- accent colour from the page (primary button, else accent word) ---------- */
  function solid(el) { var c = getComputedStyle(el).backgroundColor; return alpha(c) > 0.6 ? c : null; }
  var heroBtn = null;
  if (hero) {
    var cands = hero.querySelectorAll('a.btn,a.button,a[class*="cta"],.ctas a,.cta a,.btns a,.hero-cta a,a[class*="btn"],button[class*="btn"]');
    for (var i = 0; i < cands.length && !heroBtn; i++) {
      var b = cands[i], cs = getComputedStyle(b);
      if (!off(b) && solid(b) && !/fixed|sticky/.test(cs.position) && b.getBoundingClientRect().width > 0) heroBtn = b;
    }
  }
  if (!getComputedStyle(html).getPropertyValue('--td-accent').trim()) {
    var acc = null, bc = heroBtn && rgb(solid(heroBtn));
    // WhatsApp green is a button colour, not the brand colour
    if (bc && sat(bc) > 0.25 && !(bc[0] < 60 && bc[1] > 190 && bc[2] > 80 && bc[2] < 130)) acc = solid(heroBtn);
    if (!acc && h1) { var em = h1.querySelector('em,.accent,.hl,mark,span[style*="color"]'); if (em) { var ec = rgb(getComputedStyle(em).color); if (ec && sat(ec) > 0.25) acc = getComputedStyle(em).color; } }
    if (!acc) {
      var rs = getComputedStyle(html), names = ['--accent', '--brand', '--primary', '--red', '--gold', '--amber', '--orange', '--green', '--blue', '--acc', '--hi'];
      for (var j = 0; j < names.length && !acc; j++) {
        var v = rs.getPropertyValue(names[j]).trim();
        if (v) { var probe = d.createElement('i'); probe.style.color = v; d.body.appendChild(probe); var pc = rgb(getComputedStyle(probe).color); probe.remove(); if (pc && sat(pc) > 0.25) acc = v; }
      }
    }
    if (acc) html.style.setProperty('--td-accent', acc);
  }

  /* ---------- shimmer CTA ---------- */
  function shimmer(b) {
    if (b.querySelector('.td-sheen') || off(b)) return;
    var bg = rgb(solid(b) || 'rgb(0,0,0)'), L = lum(bg);
    b.style.setProperty('--td-sheen', L > 0.88 ? 'rgba(0,0,0,.07)' : L > 0.55 ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.28)');
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    b.classList.add('td-sh');
    var s = d.createElement('span'); s.className = 'td-sheen'; s.setAttribute('aria-hidden', 'true'); b.appendChild(s);
  }
  if (!reduce) { if (heroBtn) shimmer(heroBtn); d.querySelectorAll('[data-shimmer]').forEach(shimmer); }

  /* ---------- border beam ---------- */
  function beam(el, secs) {
    if (el.querySelector(':scope > .td-beam') || off(el)) return;
    if (getComputedStyle(el).position === 'static') el.classList.add('td-bm');
    var s = d.createElement('span'); s.className = 'td-beam'; s.setAttribute('aria-hidden', 'true');
    if (secs) s.style.setProperty('--td-beam-d', secs + 's');
    el.appendChild(s); watch(s);
  }
  if (!reduce) {
    d.querySelectorAll('[data-beam]').forEach(function (el) { beam(el, parseFloat(el.dataset.beam) || 0); });
    d.querySelectorAll('form').forEach(function (f) {
      if (f.closest('[data-beam]') || f.querySelector('[data-beam]') || f.querySelectorAll('input,select,textarea').length < 2) return;
      var card = f, cs = getComputedStyle(f);
      if (!(parseFloat(cs.borderTopLeftRadius) > 4 && (alpha(cs.backgroundColor) > 0.05 || parseFloat(cs.borderTopWidth) > 0))) {
        var p = f.parentElement, ps = p && getComputedStyle(p);
        if (p && p !== d.body && parseFloat(ps.borderTopLeftRadius) > 4 && alpha(ps.backgroundColor) > 0.05 && p.querySelectorAll('form').length === 1) card = p; else return;
      }
      beam(card, 10);
    });
  }

  /* ---------- number ticker ---------- */
  var numRe = /^([£$€]?)(\d{1,4})([+%k★*]*|\s?\+)$/;
  function ticker(el) {
    var t = el.textContent.trim(), m = t.match(numRe);
    if (!m || el.children.length || el.querySelector('.td-col')) return false;
    var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 16;
    var lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / fs;
    var digits = m[2].length, k = 0, delay = parseFloat(el.dataset.tickerDelay) || 0;
    el.setAttribute('aria-label', t); el.textContent = '';
    el.classList.add('td-tk');
    t.split('').forEach(function (c) {
      if (!/\d/.test(c)) { var sp = d.createElement('span'); sp.setAttribute('aria-hidden', 'true'); sp.textContent = c; el.appendChild(sp); return; }
      var col = d.createElement('span'); col.className = 'td-col'; col.setAttribute('aria-hidden', 'true');
      col.style.lineHeight = '1.3'; col.style.marginBlock = ((lh - 1.3) / 2) + 'em';
      var g = d.createElement('span'); g.className = 'td-ghost'; g.textContent = c; col.appendChild(g);
      var s = d.createElement('span'); s.className = 'td-strip';
      s.style.setProperty('--to', 10 + Number(c)); s.style.transitionDelay = (delay + (digits - 1 - k++) * 0.12) + 's';
      s.innerHTML = '<span>' /* constant digits only, no page data */ + '01234567890123456789'.split('').join('</span><span>') + '</span>';
      col.appendChild(s); el.appendChild(col);
    });
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add('go'); o.disconnect(); } }, { threshold: 0.4 });
    o.observe(el);
    return true;
  }
  if (!reduce && 'IntersectionObserver' in window) {
    d.querySelectorAll('[data-ticker]').forEach(ticker);
    if (kitPage) d.querySelectorAll('strong,b,span,div,dt,dd,em,p,h3,h4,.num,.stat').forEach(function (el) {
      if (el.children.length || off(el) || el.closest('a,button,script,h1,h2,time,form,nav,footer,[data-count],.rv,[data-reveal]')) return;
      var t = el.textContent.trim(), m = t.match(numRe);
      if (!m || m[1] || /^0/.test(m[2])) return;           // prices and section numbers (01, 02) stay as they are
      var n = Number(m[2]); if (n < 3 || (n >= 1900 && n <= 2100)) return;  // skip years
      // only real stats: a suffix (500+, 98%, 4k) or a stat-like box, never counts in chips or menus
      var box = (el.className + ' ' + (el.parentElement ? el.parentElement.className : '')).toString();
      if (!m[3] && !/stat|metric|figure|kpi|big-?n|counter/i.test(box)) return;
      if (el.closest('li a,.chip,[class*="cat"],[class*="tab"],[class*="badge"],[class*="count"]')) return;
      ticker(el);
    });
  }

  /* ---------- marquee strip of services ---------- */
  function marquee(items, host) {
    var wrap = d.createElement('div'); wrap.className = 'td-mq'; wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'What we do');
    var track = d.createElement('div'); track.className = 'td-mq-track';
    var row = function (hidden) { var ul = d.createElement('ul'); if (hidden) ul.setAttribute('aria-hidden', 'true'); items.forEach(function (x) { var li = d.createElement('li'); li.textContent = x; ul.appendChild(li); }); return ul; };
    track.appendChild(row(false)); track.appendChild(row(true)); wrap.appendChild(track);
    var h2 = d.querySelector('h2'); if (h2) { var hs = getComputedStyle(h2); wrap.style.fontFamily = hs.fontFamily; wrap.style.fontWeight = hs.fontWeight; wrap.style.textTransform = hs.textTransform; }
    wrap.style.setProperty('--td-mq-d', Math.max(28, items.join('').length * 0.55) + 's');
    if (host) { host.textContent = ''; host.appendChild(wrap); }
    watch(wrap);
    return wrap;
  }
  var explicit = d.querySelectorAll('[data-td-marquee]');
  explicit.forEach(function (h) { var it = h.dataset.tdMarquee.split('|').map(function (s) { return s.trim(); }).filter(Boolean); if (it.length > 2 && !off(h)) marquee(it, h); });
  if (!explicit.length && hero && !d.querySelector('[class*="marquee"],[class*="ticker"],.td-mq') && html.dataset.marquee !== 'off') {
    var src = null;
    d.querySelectorAll('section,div[id]').forEach(function (s) { if (!src && /servic|what-?we|treatment|menu/i.test((s.id || '') + ' ' + (typeof s.className === 'string' ? s.className : ''))) src = s; });
    var items = [];
    if (src) {
      var pick = src.querySelectorAll('h3');
      if (pick.length < 4) pick = src.querySelectorAll('h4,li strong,.chips a,.chips li,.chips button,.chip');
      pick.forEach(function (n) { var t = n.textContent.replace(/\s+/g, ' ').trim(); if (t.length > 2 && t.length < 32 && !/^\d+$/.test(t) && items.indexOf(t) < 0) items.push(t); });
    }
    if (items.length >= 4 && items.length <= 20) {
      // after the hero, outside any pinned story
      var anchor = hero;
      while (anchor.parentElement && anchor.parentElement !== d.body && anchor.parentElement.tagName !== 'MAIN') anchor = anchor.parentElement;
      var next = anchor.nextElementSibling;
      while (next && /pin-spacer/.test(next.className)) next = next.nextElementSibling;
      var mq = marquee(items, null);
      if (next) { var ns = getComputedStyle(next); if (alpha(ns.backgroundColor) > 0.5) mq.style.background = ns.backgroundColor; mq.style.color = ns.color; }
      anchor.parentNode.insertBefore(mq, anchor.nextSibling);
    }
  }

  /* ---------- animated list ---------- */
  d.querySelectorAll('[data-alist]').forEach(function (box) {
    if (off(box)) return;
    var pool = Array.prototype.slice.call(box.children).map(function (c) { return c.cloneNode(true); });
    var max = parseInt(box.dataset.alistMax, 10) || 3, every = parseInt(box.dataset.alistEvery, 10) || 2400;
    if (reduce || pool.length < 2) return;
    // reserve the height of a full list so nothing below jumps
    var kids = box.children, h = 0;
    if (kids.length >= max) h = kids[max - 1].getBoundingClientRect().bottom - kids[0].getBoundingClientRect().top;
    if (h) box.style.minHeight = h + 'px';
    box.innerHTML = '';
    var n = 0, timer = null;
    function add() {
      var items = Array.prototype.slice.call(box.children).filter(function (c) { return !c.classList.contains('td-al-out'); });
      var before = items.map(function (c) { return c.getBoundingClientRect().top; });
      var el = pool[n++ % pool.length].cloneNode(true); el.classList.add('td-al-item', 'td-al-in');
      box.insertBefore(el, box.firstChild);
      items.forEach(function (c, i) { var dy = before[i] - c.getBoundingClientRect().top; c.style.transition = 'none'; c.style.transform = 'translate3d(0,' + dy + 'px,0)'; });
      box.offsetHeight;
      items.forEach(function (c) { c.style.transition = ''; c.style.transform = ''; });
      requestAnimationFrame(function () { el.classList.remove('td-al-in'); });
      if (items.length >= max) items.slice(max - 1).forEach(function (c) { c.classList.add('td-al-out'); setTimeout(function () { c.remove(); }, 450); });
    }
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!n) add(); if (!timer) timer = setInterval(add, every); }
      else if (timer) { clearInterval(timer); timer = null; }
    });
    o.observe(box);
  });
})();
