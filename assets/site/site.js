(() => {
  const d = document, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');
  const $ = id => d.getElementById(id);

  /* nav + mobile CTA */
  const nav = $('nav'), mcta = $('mcta'), contact = $('contact');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    nav.classList.toggle('solid', y > 20);
    const cTop = contact.getBoundingClientRect().top;
    mcta.classList.toggle('show', y > innerHeight * .6 && cTop > innerHeight * .9);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* reveals */
  const els = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const t = e.target, sib = [...t.parentElement.children].filter(x => x.classList.contains('r'));
      t.style.transitionDelay = Math.min(sib.indexOf(t), 4) * 70 + 'ms';
      t.classList.add('in'); io.unobserve(t);
    }), { threshold: .08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
    // safety net: never leave content hidden if it was scrolled past quickly
    const sweep = () => els.forEach(el => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight) { el.classList.add('in'); io.unobserve(el); } });
    addEventListener('scroll', () => requestAnimationFrame(sweep), { passive: true }); setTimeout(sweep, 2500);
  } else els.forEach(el => el.classList.add('in'));

  /* hero shader: soft warm gradient mesh, pauses off screen, low res, respects battery */
  const cv = $('hero-gl');
  const gl = !reduce && cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (gl) {
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;uniform vec2 R;uniform float T;uniform vec2 M;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
    float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
    void main(){vec2 uv=gl_FragCoord.xy/R;vec2 q=uv*vec2(R.x/R.y,1.)*1.4;float t=T*.04;
      vec2 w=vec2(fbm(q+t),fbm(q-t+4.));float f=fbm(q+1.6*w+(M-.5)*.6);
      vec3 bg=vec3(.961,.949,.925);vec3 a=vec3(1.,.62,.47);vec3 b=vec3(1.,.83,.7);
      vec3 c=mix(bg,b,smoothstep(.35,.75,f));c=mix(c,a,smoothstep(.55,.85,f)*.75);
      float fade=smoothstep(.0,.6,uv.x)*smoothstep(-.1,.7,uv.y);
      c=mix(bg,c,fade*.85);gl_FragColor=vec4(c,1.);}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T'), uM = gl.getUniformLocation(pr, 'M');
      let scale = .35, w = 0, h = 0;
      const size = () => { const r = cv.getBoundingClientRect(); if (Math.abs(r.width - w) < 2 && Math.abs(r.height - h) < 80 && w) return; w = r.width; h = r.height; cv.width = Math.max(1, Math.round(w * scale)); cv.height = Math.max(1, Math.round(h * scale)); gl.viewport(0, 0, cv.width, cv.height); };
      size(); addEventListener('resize', size);
      const m = { x: .5, y: .5, sx: .5, sy: .5 };
      addEventListener('pointermove', e => { m.x = e.clientX / innerWidth; m.y = 1 - e.clientY / innerHeight; }, { passive: true });
      let on = true, t0 = performance.now(), raf = 0;
      const draw = now => {
        raf = 0; if (!on) return;
        m.sx += (m.x - m.sx) * .04; m.sy += (m.y - m.sy) * .04;
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, (now - t0) / 1000); gl.uniform2f(uM, m.sx, m.sy);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(draw);
      };
      new IntersectionObserver(([e]) => { on = e.isIntersecting && !d.hidden; if (on && !raf) raf = requestAnimationFrame(draw); }).observe(cv);
      d.addEventListener('visibilitychange', () => { on = !d.hidden; if (on && !raf) raf = requestAnimationFrame(draw); });
      requestAnimationFrame(t => { draw(t); cv.classList.add('on'); });
    }
  }

  /* website builder demo */
  const DATA = {
    barber: { n: 'Fade House', k: 'Aldershot barbers', h: 'Sharp fades. No waiting.', s: 'Walk ins and online booking, 7 days a week.', r: '4.9 from 212 Google reviews', b: 'Book a chair' },
    plumber: { n: 'FlowRight', k: '24/7 emergency plumber', h: 'Burst pipe? We are on the way.', s: 'Gas Safe engineers across Aldershot and Farnborough.', r: '4.8 from 164 Google reviews', b: 'Call out now' },
    dentist: { n: 'Fairlands Dental', k: 'Private dentist, Guildford', h: 'Calm, modern dentistry.', s: 'Implants, hygiene and check ups. New patients welcome.', r: '5.0 from 98 Google reviews', b: 'Book a consultation' },
    bakery: { n: 'Rise & Crust', k: 'Sourdough bakery', h: 'Slow sourdough, baked at dawn.', s: 'Order by 8pm, collect warm the next morning.', r: '4.9 from 301 Google reviews', b: 'Order for collection' },
  };
  const site = $('site'), st = { trade: 'barber', style: 'bold' };
  const apply = () => { const x = DATA[st.trade]; site.dataset.style = st.style; $('sName').textContent = x.n; $('sK').textContent = x.k; $('sHead').textContent = x.h; $('sSub').textContent = x.s; $('sRev').textContent = x.r; $('sBtn').textContent = x.b; };
  ['trade', 'style'].forEach(g => $(g).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.getAttribute('aria-checked') === 'true') return;
    $(g).querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', x === b)); st[g] = b.dataset.v;
    d.startViewTransition && !reduce ? d.startViewTransition(apply) : apply();
  }));

  /* tender assistant demo */
  const THEMES = [
    [/safe|health|risk|hazard|injur/i, 'Evidence', 'Your H&S policy, risk assessments for each site type, accident record and any CHAS or SafeContractor accreditation.'],
    [/staff|train|people|team|workforce|recruit/i, 'People', 'A named supervisor, induction and toolbox talks, and a training matrix with renewal dates.'],
    [/public|resident|communit|social value|school/i, 'Public', 'Barriers and signage, working hours near schools, and how complaints are logged and closed.'],
    [/environment|carbon|sustain|waste|green/i, 'Carbon', 'Fleet and fuel data, waste handling, electric tools on sensitive sites and a measurable target.'],
    [/quality|standard|iso|monitor|kpi/i, 'Quality', 'ISO 9001 or equivalent, regular site audits, and KPIs reported monthly to the buyer.'],
    [/deliver|maintenance|service|site|contract|mobilis/i, 'Method', 'A mobilisation plan, a schedule for each site, and how you cover absence and busy seasons.'],
  ];
  $('run').addEventListener('click', () => {
    const q = $('q').value.trim(), out = $('out'); if (!q) { $('q').focus(); return; }
    const rows = [['Read', 'The buyer will score this on your method, your evidence and the outcomes you promise.']];
    THEMES.forEach(([re, k, v]) => re.test(q) && rows.push([k, v]));
    if (rows.length < 3) rows.push(['Method', 'Split the answer into approach, resources, controls and results, one paragraph each.']);
    rows.push(['Structure', 'Use the buyer\u2019s own wording as headings. One claim per paragraph, each backed by proof.']);
    rows.push(['Next', 'We turn this plan into a full answer using your own documents. Email us to start.']);
    out.innerHTML = '';
    rows.forEach(([k, v], i) => { const r = d.createElement('div'); r.className = 'row'; r.innerHTML = '<b></b><span></span>'; r.firstChild.textContent = k; r.lastChild.textContent = v; out.appendChild(r); setTimeout(() => r.classList.add('in'), reduce ? 0 : 60 + 120 * i); });
  });
})();
