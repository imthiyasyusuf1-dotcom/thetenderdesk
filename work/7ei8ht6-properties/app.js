(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const mobile = innerWidth < 760;
  const G = window.gsap, ST = window.ScrollTrigger;
  document.documentElement.classList.add('js');
  $('#yr') && ($('#yr').textContent = new Date().getFullYear());

  /* ---------- loader (first visit) / curtain (page transitions) ---------- */
  const loader = $('.loader'), curtain = $('.curtain'), bar = $('.ld-bar i');
  const fromNav = sessionStorage.getItem('e86nav') === '1';
  sessionStorage.removeItem('e86nav');
  let started = false;
  const start = () => { if (started) return; started = true; loader.classList.add('done'); intro(); };
  if (fromNav) { loader.style.display = 'none'; curtain.classList.add('out'); requestAnimationFrame(start); }
  else {
    const imgs = $$('img').filter(i => i.loading !== 'lazy').slice(0, 6); let n = 0;
    const tick = () => { n++; bar.style.transform = `scaleX(${Math.min(1, n / Math.max(1, imgs.length))})`; };
    Promise.all(imgs.map(i => i.complete ? (tick(), 0) : new Promise(r => { i.addEventListener('load', () => { tick(); r(); }, { once: true }); i.addEventListener('error', r, { once: true }); })))
      .then(() => setTimeout(start, 350));
    setTimeout(start, 2200);
  }
  const same = a => a.host === location.host && a.pathname !== location.pathname && !a.target && !a.hash && a.pathname.endsWith('.html') || (a.host === location.host && /\/$/.test(a.pathname) && a.pathname !== location.pathname && !a.target);
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    if (!same(a)) return;
    e.preventDefault(); sessionStorage.setItem('e86nav', '1');
    curtain.classList.remove('out'); curtain.classList.add('in');
    setTimeout(() => location.href = a.href, 330);
  });
  const pre = new Set();
  document.addEventListener('pointerover', e => {
    const a = e.target.closest('a'); if (!a || !same(a) || pre.has(a.href)) return;
    pre.add(a.href); const l = document.createElement('link'); l.rel = 'prefetch'; l.href = a.href; document.head.appendChild(l);
  }, { passive: true });
  addEventListener('pageshow', e => { if (e.persisted) { curtain.classList.remove('in'); curtain.classList.add('out'); } });

  /* ---------- menu, header, sticky CTA ---------- */
  const burger = $('.burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const o = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    lenis && (o ? lenis.stop() : lenis.start());
  });
  const hdr = $('.hdr'), enq = $('.enq'); let last = 0;
  const onScroll = y => {
    hdr.classList.toggle('hide', y > last && y > 400 && !nav.classList.contains('open')); last = y;
    enq && enq.classList.toggle('show', y > 600);
  };

  /* ---------- Lenis + single GSAP ticker ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    const skewEls = () => $$('.sc img,.member .ph,.tt-row,.pin-img');
    let sk = [], skv = 0;
    lenis.on('scroll', e => { ST && ST.update(); onScroll(e.scroll);
      if (!G || mobile) return; if (!sk.length) sk = skewEls().map(el => G.quickSetter(el, 'skewY', 'deg'));
      skv += (Math.max(-4, Math.min(4, e.velocity * .12)) - skv) * .2; sk.forEach(s => s(skv)); });
    G && G.ticker.add(() => { if (Math.abs(skv) > .01 && Math.abs(lenis.velocity) < .5) { skv *= .85; sk.forEach(s => s(skv)); } });
    if (G) { G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
    else { const r = t => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); }
  } else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  /* ---------- mailto forms ---------- */
  $$('.mform').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const err = $('.ferr', f); let ok = true;
    $$('input,select,textarea', f).forEach(el => {
      const bad = (el.required && !el.value.trim()) || (el.type === 'email' && el.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      el.classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) { err.textContent = 'Please complete the highlighted fields.'; return; }
    err.textContent = '';
    const body = $$('input,select,textarea', f).map(el => `${el.name}: ${el.value}`).join('\n');
    location.href = `mailto:info@7ei8ht6properties.com?subject=${encodeURIComponent(f.dataset.subject)}&body=${encodeURIComponent(body + '\n\nSent from the 7ei8ht6 Properties website')}`;
  }));

  /* ---------- team filter ---------- */
  const chips = $$('.chip'), q = $('#tsearch');
  if (chips.length) {
    let f = 'all';
    const apply = () => {
      const s = (q.value || '').toLowerCase().trim(); let shown = 0;
      $$('.member').forEach(m => { const on = (f === 'all' || m.dataset.role === f) && (!s || m.dataset.name.includes(s)); m.classList.toggle('gone', !on); on && shown++; });
      $('.empty').hidden = shown > 0;
      if (G) G.fromTo($$('.member:not(.gone)'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .55, stagger: .025, ease: 'power3.out', overwrite: true });
      ST && ST.refresh();
    };
    chips.forEach(c => c.addEventListener('click', () => { chips.forEach(x => x.classList.toggle('on', x === c)); f = c.dataset.f; apply(); }));
    q.addEventListener('input', apply);
  }

  /* ---------- text splitting ---------- */
  const heroT = $('.hero-t');
  heroT && $$('.ln', heroT).forEach(ln => {
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) { const frag = document.createDocumentFragment(); [...ch.textContent].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = c === ' ' ? '\u00a0' : c; frag.appendChild(s); }); ch.replaceWith(frag); }
      else walk(ch);
    }); walk(ln);
  });
  $$('.split').forEach(h => {
    const html = h.innerHTML.split(/(<[^>]+>|\s+)/).map(t => !t || /^\s+$/.test(t) ? t : t.startsWith('<') ? t : `<span class="wd"><span class="wi">${t}</span></span>`).join('');
    h.innerHTML = html;
  });
  $$('.words').forEach(p => { p.innerHTML = p.innerHTML.split(/(<[^>]+>|\s+)/).map(t => !t || /^\s+$/.test(t) || t.startsWith('<') ? t : `<span class="w">${t}</span>`).join(''); });

  /* ---------- choreography ---------- */
  function intro() {
    if (!G || reduce) { $$('.reveal').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; }); return; }
    ST.defaults({ once: false });
    if (heroT) {
      const tl = G.timeline({ delay: .1 });
      tl.from($$('.ch', heroT), { yPercent: 110, rotate: 6, duration: 1.2, ease: 'expo.out', stagger: .035 })
        .from('.hero-copy .kicker,.hero-copy .lead,.hero-copy .hero-ctas,.hero-time', { y: 30, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out' }, '-=.8');
    }
    const sub = $('.sub-in');
    if (sub) {
      G.from($$('.wi', sub), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .05, delay: .05 });
      G.from($$('.kicker,.lead', sub), { y: 30, opacity: 0, duration: .9, ease: 'power3.out', delay: .35, stagger: .1 });
    }
    $$('.split').filter(h => !h.closest('.sub-in')).forEach(h => G.from($$('.wi', h), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .04, scrollTrigger: { trigger: h, start: 'top 85%' } }));
    ST.batch('.reveal', { start: 'top 88%', onEnter: b => G.to(b, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .08, overwrite: true }) });
    ST.batch('.member', { start: 'top 92%', onEnter: b => G.from(b, { opacity: 0, y: 40, duration: .9, ease: 'power3.out', stagger: .06 }) });
    if (!mobile) $$('.words').forEach(p => G.to($$('.w', p), { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true } }));
    $$('.diff-list li').forEach(li => G.from(li, { x: -40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 90%' } }));
    $$('.step').forEach(s => G.from(s, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 85%' } }));
    $$('[data-count]').forEach(b => {
      const o = { v: 0 }, t = +b.dataset.count, suf = b.dataset.suf || '';
      G.to(o, { v: t, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 90%' }, onUpdate: () => b.textContent = Math.round(o.v).toLocaleString('en-US') + suf });
    });
    $$('.sub-bg').forEach(el => G.to(el, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top top', end: 'bottom top', scrub: true } }));
    $$('.pin-img img').forEach(el => G.fromTo(el, { yPercent: -18 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.sc img,.card').forEach(el => G.from(el, { y: 60, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: true } }));
    G.from('.ftr-big', { yPercent: 30, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.ftr', start: 'top 80%' } });
    // horizontal pinned services
    const hs = $('.hscroll'), tr = $('.hs-track');
    if (hs) {
      const dist = () => tr.scrollWidth - innerWidth;
      const setH = () => hs.style.height = (dist() + innerHeight) + 'px';
      setH(); addEventListener('resize', setH);
      const imgs = $$('.hs-panel img', tr);
      ST.create({ trigger: hs, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onRefresh: setH,
        onUpdate: s => { const d = dist(); G.set(tr, { x: -d * s.progress }); imgs.forEach(i => G.set(i, { xPercent: -6 + 12 * s.progress })); } });
    }
    const hc = $('.hero-copy');
    if (hc) G.to(hc, { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: '55% bottom', end: 'bottom bottom', scrub: true } });
    addEventListener('load', () => ST.refresh());
  }

  /* ---------- cursor, magnetic, spotlight ---------- */
  if (fine && G && !reduce) {
    const c = $('.cur'), d = $('.cur-dot'); c.appendChild(document.createElement('i'));
    const cx = G.quickTo(c, 'x', { duration: .45, ease: 'power3' }), cy = G.quickTo(c, 'y', { duration: .45, ease: 'power3' });
    const dx = G.quickTo(d, 'x', { duration: .08 }), dy = G.quickTo(d, 'y', { duration: .08 });
    addEventListener('pointermove', e => { c.classList.add('on'); d.classList.add('on'); cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', e => c.classList.toggle('big', !!e.target.closest('a,button,.member,.hs-panel,select,input,textarea')), { passive: true });
    $$('.magnetic').forEach(m => {
      const mx = G.quickTo(m, 'x', { duration: .5, ease: 'power3' }), my = G.quickTo(m, 'y', { duration: .5, ease: 'power3' });
      m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .3); my((e.clientY - r.top - r.height / 2) * .35); });
      m.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
    $$('.card').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
  }

  /* ---------- WebGL skyline hero ---------- */
  const cv = $('#sky');
  if (cv) {
    const ok = (() => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } })();
    if (!ok || reduce) document.documentElement.classList.add('no-webgl');
    else import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js').then(T => skyline(T, cv)).catch(() => document.documentElement.classList.add('no-webgl'));
  }
  function skyline(T, cv) {
    const r = new T.WebGLRenderer({ canvas: cv, antialias: !mobile, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(mobile ? 60 : 42, 1, .5, 900);
    const U = { uT: { value: 0 }, uOn: { value: .12 }, uTime: { value: 0 } };
    const NIGHT = new T.Color('#05070b'), DUSK = new T.Color('#c98a55');
    // sky dome
    const sky = new T.Mesh(new T.SphereGeometry(600, 24, 12), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, uniforms: U,
      vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `uniform float uT;varying vec3 vP;
        float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
        void main(){float y=normalize(vP).y;
        vec3 d=mix(vec3(.93,.62,.38),vec3(.17,.2,.36),smoothstep(-.02,.35,y));d=mix(d,vec3(.05,.07,.16),smoothstep(.3,.8,y));
        vec3 n=mix(vec3(.07,.09,.16),vec3(.01,.015,.03),smoothstep(0.,.5,y));
        vec3 c=mix(d,n,smoothstep(.0,.85,uT));
        vec2 g=floor(normalize(vP).xz*260./(y+1.2));float s=step(.996,h(g))*smoothstep(.05,.4,y)*smoothstep(.4,1.,uT);
        gl_FragColor=vec4(c+s*.8,1.);}` }));
    scene.add(sky);
    // shared building shader: gradient facade + lit window grid
    const bMat = new T.ShaderMaterial({ uniforms: U,
      vertexShader: `uniform float uTime,uT;attribute float aSeed;varying vec3 vW;varying vec3 vN;varying float vS;
        void main(){vec4 w=modelMatrix*instanceMatrix*vec4(position,1.);w.x+=sin(w.y*.35+uTime*2.2+w.z*.05)*.9*(1.-uT)*smoothstep(-200.,-380.,w.z)*smoothstep(40.,0.,w.y);vW=w.xyz;vN=normalize(mat3(modelMatrix*instanceMatrix)*normal);vS=aSeed;gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader: `uniform float uT,uOn;varying vec3 vW;varying vec3 vN;varying float vS;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        void main(){
          float side=1.-abs(vN.y);
          vec3 base=mix(vec3(.30,.26,.28),vec3(.035,.05,.08),uT);
          base*=.55+.45*smoothstep(-1.,1.,dot(vN,normalize(vec3(-.6,.3,.7))));
          base+=mix(vec3(.35,.2,.1),vec3(0.),uT)*smoothstep(40.,0.,vW.y)*.15;
          vec2 cell=vec2(floor((vW.x+vW.z)*1.1),floor(vW.y*1.4));
          vec2 f=fract(vec2((vW.x+vW.z)*1.1,vW.y*1.4));
          float win=step(.2,f.x)*step(f.x,.8)*step(.25,f.y)*step(f.y,.75)*side;
          float lit=step(h(cell+vS*17.),uOn*.75)*win;
          vec3 wc=mix(vec3(1.,.8,.5),vec3(.75,.88,1.),step(.7,h(cell*1.3+vS)));
          vec3 col=base+lit*wc*(.8+.4*h(cell+3.));
          float fog=smoothstep(60.,420.,length(vW.xz-vec2(0.,40.)));
          vec3 fc=mix(vec3(.62,.44,.36),vec3(.03,.04,.08),uT);
          gl_FragColor=vec4(mix(col,fc,fog*.85),1.);}` });
    const add = (geo, list) => {
      const m = new T.InstancedMesh(geo, bMat, list.length), o = new T.Object3D(), seeds = new Float32Array(list.length);
      list.forEach((b, i) => { o.position.set(b[0], b[4] / 2 + (b[5] || 0), b[1]); o.scale.set(b[2], b[4], b[3]); o.rotation.y = b[6] || 0; o.updateMatrix(); m.setMatrixAt(i, o.matrix); seeds[i] = Math.random(); });
      geo.setAttribute('aSeed', new T.InstancedBufferAttribute(seeds, 1)); scene.add(m); return m;
    };
    let rnd = 7; const R = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
    const boxes = [], N = mobile ? 170 : 420;
    for (let i = 0; i < N; i++) {
      const x = (R() - .5) * 520, z = -R() * 380 + 10, near = Math.abs(x) < 70 && z > -140;
      if (Math.abs(x) < 16 && z > -60 && z < 0) continue;
      const hgt = (near ? 10 : 6) + Math.pow(R(), 2.6) * (near ? 70 : 55);
      boxes.push([x, z, 5 + R() * 9, 5 + R() * 9, hgt, 0, R() * .5]);
    }
    add(new T.BoxGeometry(1, 1, 1), boxes);
    // Burj-like tower: stacked hexagonal tiers + spire
    const tiers = []; let y = 0;
    for (let i = 0; i < 11; i++) { const hh = 22 - i * 1.2, rr = 9 - i * .78; tiers.push([0, -30, rr, rr, hh, y, i * .26]); y += hh; }
    add(new T.CylinderGeometry(1, 1, 1, 6), tiers);
    add(new T.CylinderGeometry(.08, 1, 1, 6), [[0, -30, 1.1, 1.1, 60, y, 0]]);
    // a sail-like tower and twin towers
    add(new T.CylinderGeometry(.35, 1, 1, 3), [[-95, -60, 12, 12, 110, 0, .4]]);
    add(new T.BoxGeometry(1, 1, 1), [[70, -50, 9, 9, 125, 0, .2], [84, -50, 8, 8, 110, 0, .2]]);
    // aviation beacon
    const beacon = new T.Mesh(new T.SphereGeometry(.9, 8, 6), new T.MeshBasicMaterial({ color: 0xff3b30 }));
    beacon.position.set(0, y + 60, -30); scene.add(beacon);
    // water with gold reflection streak
    const water = new T.Mesh(new T.PlaneGeometry(1400, 800), new T.ShaderMaterial({ uniforms: U,
      vertexShader: 'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader: `uniform float uT,uOn,uTime;varying vec3 vW;
        void main(){vec3 d=mix(vec3(.45,.3,.26),vec3(.02,.03,.05),uT);
        float streak=exp(-abs(vW.x)*.03)*(.5+.5*sin(vW.z*.9+uTime*1.5+sin(vW.x*.3)))*smoothstep(80.,-100.,vW.z);
        vec3 c=d+streak*mix(vec3(.9,.6,.35)*.35,vec3(.85,.7,.45)*.45*uOn,uT);
        gl_FragColor=vec4(c,1.);}` }));
    water.rotation.x = -Math.PI / 2; water.position.set(0, 0, 200); scene.add(water);

    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);
    let p = 0, visible = true, mx = 0, my = 0, smx = 0, smy = 0;
    if (G && ST) ST.create({ trigger: '#hero', start: 'top top', end: 'bottom bottom', onUpdate: s => p = s.progress });
    if (fine) addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    new IntersectionObserver(e => visible = e[0].isIntersecting).observe($('#hero'));
    const ht = $('#ht'); let label = '';
    let sp = 0, intro0 = 1;
    const frame = (t) => {
      if (!visible || document.hidden) return;
      sp += (p - sp) * .08; smx += (mx - smx) * .05; smy += (my - smy) * .05; intro0 += (0 - intro0) * .03;
      U.uT.value = Math.min(1, sp * 1.3); U.uOn.value = .1 + Math.min(1, Math.max(0, (sp - .1) * 1.5)) * .9; U.uTime.value = t;
      const z = 290 - sp * 150 + intro0 * 80;
      cam.position.set(Math.sin(sp * 1.2) * 40 + smx * 14, 14 + sp * 18 + intro0 * 25 - smy * 6, z);
      cam.lookAt(0, 62 + sp * 22, -40);
      beacon.visible = Math.sin(t * 3) > 0;
      r.render(scene, cam);
      const l = sp < .25 ? 'Dusk' : sp < .6 ? 'Evening' : 'Night'; if (l !== label) { label = l; ht.textContent = l; }
    };
    if (G) G.ticker.add(frame); else { const loop = t => { frame(t / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  }
})();
