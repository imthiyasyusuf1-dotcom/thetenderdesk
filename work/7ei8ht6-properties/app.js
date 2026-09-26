(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const small = () => innerWidth < 1000;
  const heavy = !touch && !reduce && innerWidth >= 1000;          // desktop path: Lenis, WebGL, parallax
  const DPR = Math.min(devicePixelRatio || 1, 1.25);
  root.classList.add('js');
  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  $('#yr') && ($('#yr').textContent = new Date().getFullYear());

  /* ---------- language toggle (key headings only) ---------- */
  const lang = $('.lang');
  const setLang = on => { root.classList.toggle('ar-on', on); lang && lang.setAttribute('aria-pressed', on); lang && lang.setAttribute('aria-label', on ? 'Show headings in English' : 'Show key headings in Arabic'); };
  try { setLang(localStorage.getItem('e86ar') === '1'); } catch (e) {}
  lang && lang.addEventListener('click', () => {
    const on = !root.classList.contains('ar-on');
    root.classList.add('swapping');
    setTimeout(() => { setLang(on); root.classList.remove('swapping'); }, 260);
    try { localStorage.setItem('e86ar', on ? '1' : '0'); } catch (e) {}
  });

  /* ---------- page transitions: WebGL veil on desktop, CSS wipe elsewhere ---------- */
  const veil = $('.veil'), vc = $('.veil-gl');
  let veilGL = null;
  if (heavy && vc) veilGL = makeVeil(vc);
  if (!veilGL) veil.classList.add('css');
  const fromNav = sessionStorage.getItem('e86nav') === '1';
  sessionStorage.removeItem('e86nav');
  const internal = a => a && a.host === location.host && !a.target && !a.hasAttribute('download') &&
    /\.html$|\/$/.test(a.pathname) && !(a.pathname === location.pathname && a.hash);
  function cover(done) {
    veil.classList.add('on');
    if (veilGL) veilGL.run(0, 1, 720, done);
    else setTimeout(done, 650);
  }
  function uncover() {
    if (veilGL) { veil.classList.add('on'); veilGL.set(1); requestAnimationFrame(() => veilGL.run(1, 0, 900, () => veil.classList.remove('on'))); }
    else { root.classList.add('entering'); requestAnimationFrame(() => requestAnimationFrame(() => { root.classList.remove('entering'); })); }
  }
  if (fromNav && !reduce) uncover();
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button || !internal(a) || reduce) return;
    if (a.pathname === location.pathname) return;
    e.preventDefault(); sessionStorage.setItem('e86nav', '1');
    closeNav(); cover(() => { location.href = a.href; });
  });
  addEventListener('pageshow', e => { if (e.persisted) { veil.classList.remove('on'); veilGL && veilGL.set(0); } });
  if (heavy) {
    const pre = new Set();
    document.addEventListener('pointerover', e => {
      const a = e.target.closest('a'); if (!internal(a) || pre.has(a.href)) return;
      pre.add(a.href); const l = document.createElement('link'); l.rel = 'prefetch'; l.href = a.href; document.head.appendChild(l);
    }, { passive: true });
  }

  /* ---------- nav ---------- */
  const burger = $('.burger'), nav = $('#nav');
  function closeNav() { if (!nav.classList.contains('open')) return; nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); document.body.style.overflow = ''; lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const o = !nav.classList.contains('open');
    if (!o) return closeNav();
    nav.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden'; lenis && lenis.stop();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  /* ---------- scroll engine: Lenis on desktop only; native scroll on touch ---------- */
  let lenis = null;
  if (heavy && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    $$('a[href^="#"], a[href*=".html#"]').forEach(a => a.addEventListener('click', e => {
      if (a.pathname !== location.pathname) return;
      const t = document.getElementById(decodeURIComponent(a.hash.slice(1))); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -80 });
    }));
  }

  const hdr = $('.hdr'), wa = $('.wa-float'), mbar = $('.mbar');
  const isHome = document.body.classList.contains('p-index');
  let lastY = 0, vh = innerHeight;
  addEventListener('resize', () => { vh = innerHeight; measure(); }, { passive: true });
  function onScroll(y) {
    hdr.classList.toggle('solid', y > 40);
    hdr.classList.toggle('hide', y > lastY && y > vh * .7 && !nav.classList.contains('open'));
    lastY = y;
    const show = y > (isHome ? vh * .6 : 240);
    wa && wa.classList.toggle('show', show);
    mbar && mbar.classList.toggle('show', show);
  }

  /* parallax targets: desktop only, transform only, measured once */
  let px = [];
  function measure() {
    if (!heavy) return;
    px = $$('[data-speed]').map(el => { const r = el.parentElement.getBoundingClientRect(); return { el, s: +el.dataset.speed, top: r.top + scrollY, h: r.height, last: null }; });
  }
  function parallax(y) {
    for (const p of px) {
      if (p.top > y + vh || p.top + p.h < y) continue;
      const v = ((y + vh / 2) - (p.top + p.h / 2)) * p.s * -1;
      const r = Math.round(v * 10) / 10;
      if (r !== p.last) { p.el.style.transform = `translate3d(0,${r}px,0)`; p.last = r; }
    }
  }

  /* statement: words brighten as the paragraph passes */
  const stm = $$('[data-words]').map(el => {
    el.innerHTML = el.innerHTML.replace(/(<[^>]+>)|([^\s<]+)/g, (m, tag, w) => tag ? tag : `<span class="w">${w}</span>`);
    return { el, ws: $$('.w', el), n: -1 };
  });
  function words() {
    for (const s of stm) {
      const r = s.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
      const n = Math.round(p * s.ws.length);
      if (n === s.n) continue;
      s.ws.forEach((w, i) => w.classList.toggle('on', i < n)); s.n = n;
    }
  }
  if (reduce) stm.forEach(s => s.ws.forEach(w => w.classList.add('on')));

  let ticking = false, curY = scrollY;
  const frame = () => { ticking = false; onScroll(curY); if (heavy) parallax(curY); if (!reduce) words(); };
  if (lenis) {
    lenis.on('scroll', e => { curY = e.scroll; if (!ticking) { ticking = true; requestAnimationFrame(frame); } });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  } else {
    addEventListener('scroll', () => { curY = scrollY; if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  }

  /* ---------- reveals ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv,[data-reveal]').forEach(el => io.observe(el));
  } else $$('.rv,[data-reveal]').forEach(el => el.classList.add('is-in'));

  /* ---------- intro ---------- */
  const go = () => { root.classList.add('in'); measure(); frame(); };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(() => requestAnimationFrame(go));

  /* ---------- services list: floating preview (fine pointers only) ---------- */
  const sl = $('.services-list'), fl = $('.sl-float');
  if (sl && fl && !touch && !reduce) {
    const im = $('img', fl); let ty = 0, cy = 0, run = false;
    const loop = () => { cy += (ty - cy) * .14; fl.style.transform = `translate3d(0,${cy.toFixed(1)}px,0)`; if (Math.abs(ty - cy) > .3) requestAnimationFrame(loop); else run = false; };
    $$('.sl a', sl).forEach(a => {
      a.addEventListener('mouseenter', () => { if (im.getAttribute('src') !== a.dataset.img) im.src = a.dataset.img; fl.classList.add('on'); });
      a.addEventListener('mousemove', e => { const r = sl.getBoundingClientRect(); ty = e.clientY - r.top - fl.offsetHeight / 2; if (!run) { run = true; requestAnimationFrame(loop); } });
    });
    $('.sl', sl).addEventListener('mouseleave', () => fl.classList.remove('on'));
  }

  /* ---------- team filter ---------- */
  const chips = $$('.chip'), q = $('#tsearch'), members = $$('.member');
  if (members.length) {
    let f = 'all';
    const apply = () => { const s = (q.value || '').trim().toLowerCase(); let n = 0;
      members.forEach(m => { const ok = (f === 'all' || m.dataset.role === f) && (!s || m.dataset.name.includes(s)); m.hidden = !ok; ok && n++; });
      $('.empty').hidden = n > 0; lenis && lenis.resize(); measure(); };
    chips.forEach(c => c.addEventListener('click', () => { chips.forEach(x => x.classList.toggle('on', x === c)); f = c.dataset.f === 'all' ? 'all' : c.textContent; f = c.dataset.f === 'all' ? 'all' : c.dataset.f.replace(/&amp;/g, '&'); members.forEach(m => m.dataset.role = m.dataset.role.replace(/&amp;/g, '&')); apply(); }));
    q.addEventListener('input', apply);
  }

  /* ---------- consultation: multi-step brief ---------- */
  const form = $('#consult-form');
  if (form) {
    const steps = $$('.c-step', form), back = $('.c-back', form), next = $('.c-next', form), send = $('.c-send', form), waBtn = $('.c-wa', form);
    const err = $('.ferr', form), bar = $('.c-bar i', form), cnt = $('.c-count b', form), lab = $('.c-lab', form);
    let i = 0;
    const show = n => {
      steps.forEach((s, k) => s.classList.toggle('on', k === n)); i = n;
      back.hidden = n === 0; next.hidden = n === steps.length - 1; send.hidden = waBtn.hidden = n !== steps.length - 1;
      bar.style.transform = `scaleX(${(n + 1) / steps.length})`; cnt.textContent = String(n + 1).padStart(2, '0'); lab.textContent = steps[n].dataset.t;
      err.textContent = '';
      const top = form.getBoundingClientRect().top + scrollY - 90;
      if (form.getBoundingClientRect().top < 0) lenis ? lenis.scrollTo(top) : scrollTo({ top, behavior: 'smooth' });
      buildWA();
    };
    const valid = s => {
      for (const el of $$('input[required]', s)) {
        if (el.type === 'radio') { if (!$(`input[name="${el.name}"]:checked`, s)) { err.textContent = 'Please choose one option to continue.'; return false; } }
        else if (!el.value.trim() || (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value))) { err.textContent = el.type === 'email' ? 'Please enter a valid email address.' : 'Please add your name.'; el.focus(); return false; }
      }
      return true;
    };
    const data = () => { const fd = new FormData(form), o = {}; for (const [k, v] of fd) if (String(v).trim()) o[k] = o[k] ? o[k] + ', ' + v : v; return o; };
    const text = () => Object.entries(data()).map(([k, v]) => `${k}: ${v}`).join('\n');
    function buildWA() { waBtn.href = 'https://wa.me/971506468786?text=' + encodeURIComponent('Private consultation request\n\n' + text()); }
    next.addEventListener('click', () => { if (valid(steps[i])) show(i + 1); });
    back.addEventListener('click', () => show(i - 1));
    steps.forEach(s => s.addEventListener('change', () => { err.textContent = ''; buildWA(); }));
    form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && i < steps.length - 1) { e.preventDefault(); next.click(); } });
    form.addEventListener('submit', e => {
      e.preventDefault(); if (!valid(steps[i])) return;
      location.href = `mailto:info@7ei8ht6properties.com?subject=${encodeURIComponent(form.dataset.subject)}&body=${encodeURIComponent(text() + '\n\nSent from the 7ei8ht6 Properties website')}`;
      form.classList.add('sent'); $('.c-done', form).hidden = false; waBtn.hidden = false;
    });
  }

  /* ---------- hero: heat haze shader over the photograph (desktop only) ---------- */
  const gl = $('#gl');
  if (gl && heavy) {
    const img = $('.hero-media img');
    const startGL = () => heroGL(gl, img);
    img.complete ? setTimeout(startGL, 300) : img.addEventListener('load', () => setTimeout(startGL, 300), { once: true });
  }

  function compile(g, vs, fs) {
    const p = g.createProgram();
    [[g.VERTEX_SHADER, vs], [g.FRAGMENT_SHADER, fs]].forEach(([t, s]) => { const sh = g.createShader(t); g.shaderSource(sh, s); g.compileShader(sh); g.attachShader(p, sh); });
    g.linkProgram(p); if (!g.getProgramParameter(p, g.LINK_STATUS)) return null;
    const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    g.useProgram(p); const loc = g.getAttribLocation(p, 'p'); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    return p;
  }

  function heroGL(cv, img) {
    const g = cv.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); if (!g) return;
    const p = compile(g, VS, `precision mediump float;varying vec2 v;uniform sampler2D t;uniform float T;uniform vec2 R,I;
      float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
      void main(){float ra=R.x/R.y,ia=I.x/I.y;vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);vec2 uv=(v-.5)*s;
        float k=1.10-.06*sin(T*.025);uv=uv/k+vec2(.012*sin(T*.02),-.02+.01*cos(T*.017))+.5;
        float band=smoothstep(.62,.0,v.y)*.0032;
        vec2 d=vec2(n(vec2(uv.x*9.,uv.y*26.-T*.55))-.5,n(vec2(uv.x*7.+3.,uv.y*20.-T*.4))-.5)*band;
        vec3 c=texture2D(t,vec2(uv.x,1.-uv.y)+d).rgb;
        c*=1.-.25*length(v-.5);gl_FragColor=vec4(c,1.);}`);
    if (!p) return;
    const tx = g.createTexture(); g.bindTexture(g.TEXTURE_2D, tx);
    try { g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, img); } catch (e) { return; }
    [g.TEXTURE_WRAP_S, g.TEXTURE_WRAP_T].forEach(w => g.texParameteri(g.TEXTURE_2D, w, g.CLAMP_TO_EDGE));
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    const uT = g.getUniformLocation(p, 'T'), uR = g.getUniformLocation(p, 'R');
    g.uniform2f(g.getUniformLocation(p, 'I'), img.naturalWidth, img.naturalHeight);
    const size = () => { cv.width = Math.round(cv.clientWidth * DPR); cv.height = Math.round(cv.clientHeight * DPR); g.viewport(0, 0, cv.width, cv.height); g.uniform2f(uR, cv.width, cv.height); };
    size(); addEventListener('resize', size, { passive: true });
    let vis = true, t0 = performance.now(), shown = false;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) requestAnimationFrame(draw); }).observe(cv);
    function draw(now) { if (!vis) return; g.uniform1f(uT, (now - t0) / 1000); g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      if (!shown) { shown = true; cv.classList.add('on'); setTimeout(() => cv.parentElement.classList.add('gl-on'), 1700); }
      requestAnimationFrame(draw); }
    requestAnimationFrame(draw);
  }

  function makeVeil(cv) {
    const g = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true }); if (!g) return null;
    const p = compile(g, VS, `precision mediump float;varying vec2 v;uniform float P;uniform vec2 R;
      float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
      void main(){float e=v.y+ (n(vec2(v.x*4.,P*3.))-.5)*.12 + sin(v.x*3.14159)*.05;float edge=P*1.3-.15;
        float a=smoothstep(edge-.005,edge-.06,1.-e);float line=smoothstep(.03,.0,abs((1.-e)-(edge-.03)))*step(.001,P)*step(P,.999);
        vec3 ink=vec3(.047,.043,.035),gold=vec3(.83,.73,.56);gl_FragColor=vec4(mix(ink,gold,line*.9),max(a,line*.9));}`);
    if (!p) return null;
    g.enable(g.BLEND); g.blendFunc(g.SRC_ALPHA, g.ONE_MINUS_SRC_ALPHA);
    const uP = g.getUniformLocation(p, 'P'), uR = g.getUniformLocation(p, 'R');
    const size = () => { cv.width = Math.round(innerWidth * DPR * .6); cv.height = Math.round(innerHeight * DPR * .6); g.viewport(0, 0, cv.width, cv.height); g.uniform2f(uR, cv.width, cv.height); };
    size(); addEventListener('resize', size, { passive: true });
    const set = x => { g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT); g.uniform1f(uP, x); g.drawArrays(g.TRIANGLE_STRIP, 0, 4); };
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    return { set, run(a, b, ms, done) { const s = performance.now(); const f = now => { const t = Math.min(1, (now - s) / ms); set(a + (b - a) * ease(t)); t < 1 ? requestAnimationFrame(f) : done && done(); }; requestAnimationFrame(f); } };
  }
})();
