// The Tender Desk v2. Zero dependency: raw WebGL shader, native scroll, View Transitions.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 860px)').matches;

// ---------- WebGL flow field shader ----------
const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `precision highp float;
uniform vec2 R;uniform float T,S,C;uniform vec2 M;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*R)/R.y; vec2 m=M-.5; m.x*=R.x/R.y;
 float t=T*.05;
 vec2 q=uv*1.6+vec2(0.,S*.35);
 vec2 w=vec2(fbm(q+t),fbm(q-t+3.1));
 float d=length(uv-m);
 q+=1.8*w + .35*exp(-d*3.)*vec2(sin(T*.6),cos(T*.6));
 float f=fbm(q+vec2(t*1.3,0.));
 // chapter modes: 0 ink, 1 topographic contours, 2 grid, 3 network, 4 calm
 float cont=abs(fract(f*14.)-.5); cont=smoothstep(.06,.0,cont*fwidthFallback(f));
 vec3 base=vec3(.05,.058,.07);
 vec3 col=base+vec3(.09,.1,.12)*f*f;
 float glow=smoothstep(.55,.9,f)*.9;
 vec3 acc=vec3(1.,.36,.18);
 col+=acc*glow*.35*(1.-smoothstep(0.,1.,abs(C-0.)))+acc*glow*.18;
 float topo=smoothstep(.035,0.,abs(fract(f*12.)-.5)-.44);
 col+=vec3(.9,.85,.8)*topo*.09*max(0.,1.-abs(C-1.));
 vec2 g=abs(fract(uv*8.+w*.3)-.5); float grid=smoothstep(.49,.5,max(g.x,g.y));
 col+=vec3(.8)*grid*.06*max(0.,1.-abs(C-2.));
 float net=smoothstep(.02,0.,abs(sin(q.x*3.)*sin(q.y*3.))-.0)*.0+smoothstep(.93,1.,sin(q.x*4.+w.y*6.)*sin(q.y*4.-w.x*6.));
 col+=acc*net*.25*max(0.,1.-abs(C-3.));
 col+=acc*.25*exp(-d*5.);
 col*=1.-.35*dot(uv,uv);
 col+=(h(gl_FragCoord.xy+T)-.5)*.02;
 gl_FragColor=vec4(col,1.);
}`.replace('cont=smoothstep(.06,.0,cont*fwidthFallback(f));', '');
let prog, U = {};
function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o)); return o; }
if (gl) {
  prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  ['R', 'T', 'S', 'C', 'M'].forEach(k => U[k] = gl.getUniformLocation(prog, k));
}
// render at reduced internal resolution; shader is soft so it scales cleanly
const SCALE = mobile ? .45 : .6;
function resize() { const w = innerWidth, h = innerHeight; canvas.width = Math.round(w * SCALE); canvas.height = Math.round(h * SCALE); gl && gl.viewport(0, 0, canvas.width, canvas.height); }
resize(); addEventListener('resize', resize);

const mouse = { x: .5, y: .5, sx: .5, sy: .5 };
addEventListener('pointermove', e => { mouse.x = e.clientX / innerWidth; mouse.y = 1 - e.clientY / innerHeight; }, { passive: true });
const chapters = ['top', 'tenders', 'websites', 'ai', 'proofs', 'work', 'contact'].map(id => document.getElementById(id));
const modeOf = [0, 1, 2, 3, 4, 4, 0];
let C = 0, Cs = 0;
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) C = modeOf[chapters.indexOf(e.target)]; }), { rootMargin: '-45% 0px -45% 0px' });
chapters.forEach(c => io.observe(c));

// ---------- live proof HUD ----------
const fpsEl = document.getElementById('fps'), clsEl = document.getElementById('cls');
let cls = 0;
try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; clsEl.textContent = cls.toFixed(3); }).observe({ type: 'layout-shift', buffered: true }); } catch (_) {}
addEventListener('load', () => { const kb = performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script').reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0); document.getElementById('kb').textContent = Math.max(1, Math.round(kb / 1024)); });

let frames = 0, last = performance.now(), t0 = last, visible = true;
document.addEventListener('visibilitychange', () => visible = !document.hidden);
function loop(now) {
  requestAnimationFrame(loop);
  frames++; if (now - last >= 500) { fpsEl.textContent = Math.min(120, Math.round(frames * 1000 / (now - last))); frames = 0; last = now; }
  if (!gl || !visible) return;
  mouse.sx += (mouse.x - mouse.sx) * .06; mouse.sy += (mouse.y - mouse.sy) * .06;
  Cs += (C - Cs) * .04;
  gl.uniform2f(U.R, canvas.width, canvas.height);
  gl.uniform1f(U.T, reduce ? 20 : (now - t0) / 1000);
  gl.uniform1f(U.S, scrollY / innerHeight);
  gl.uniform1f(U.C, Cs);
  gl.uniform2f(U.M, mouse.sx, mouse.sy);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
requestAnimationFrame(loop);

// ---------- reveals ----------
document.querySelectorAll('.eyebrow,h1 .line,h2,.lede,.step,.badge,.work li,.device,.assistant,.hero-cta,.btn.big').forEach((el, i) => { el.setAttribute('data-r', ''); el.style.transitionDelay = (el.matches('.step,.badge,.work li') ? ([...el.parentElement.children].indexOf(el) * 70) : 0) + 'ms'; });
const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); if (e.target.classList.contains('badge')) count(e.target.querySelector('b')); } }), { threshold: .15 });
document.querySelectorAll('[data-r]').forEach(el => rio.observe(el));
function count(b) { const to = +b.dataset.count, dec = +(b.dataset.dec || 0), suf = b.dataset.suffix || ''; const st = performance.now();
  const f = n => { const k = Math.min(1, (n - st) / 1400), v = to * (1 - Math.pow(1 - k, 3)); b.textContent = v.toFixed(dec) + suf; if (k < 1) requestAnimationFrame(f); }; reduce ? (b.textContent = to.toFixed(dec) + suf) : requestAnimationFrame(f); }

// ---------- website builder demo (View Transitions API) ----------
const DATA = {
  barber: { n: 'Fade House', u: 'fadehouse.co.uk', h: 'Sharp fades. No waiting.', s: 'Walk ins and online booking, 7 days a week in Aldershot.', b: 'Book a chair', k: '7 days', kl: 'open' },
  plumber: { n: 'FlowRight', u: 'flowright.co.uk', h: 'Burst pipe? We are on the way.', s: 'Gas Safe engineers across Aldershot and Farnborough, day and night.', b: 'Call out now', k: '24/7', kl: 'emergency cover' },
  dentist: { n: 'Fairlands Dental', u: 'fairlandsdental.co.uk', h: 'Calm, modern dentistry.', s: 'Private care, implants and hygiene in Guildford. New patients welcome.', b: 'Book a consultation', k: '12 yrs', kl: 'in Guildford' },
  bakery: { n: 'Rise & Crust', u: 'riseandcrust.co.uk', h: 'Slow sourdough, baked at dawn.', s: 'Order by 8pm, collect warm from the shop the next morning.', b: 'Order for collection', k: '48 hr', kl: 'ferment' },
};
const site = document.getElementById('site'); const $ = id => document.getElementById(id);
let state = { trade: 'barber', style: 'bold' };
function apply() { const d = DATA[state.trade]; site.dataset.style = state.style; $('sName').textContent = d.n; $('url').textContent = d.u; $('sHead').textContent = d.h; $('sSub').textContent = d.s; $('sBtn').textContent = d.b; $('sK2').textContent = d.k; $('sK2l').textContent = d.kl; }
['trade', 'style'].forEach(g => $(g).addEventListener('click', e => { const btn = e.target.closest('button'); if (!btn) return;
  $(g).querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === btn)); state[g] = btn.dataset.v;
  if (document.startViewTransition && !reduce) document.startViewTransition(apply); else apply(); }));

// ---------- tender assistant demo (local, rule based) ----------
const THEMES = [
  [/safe|health|risk|hazard/i, 'Evidence', 'Cite your H&S policy, RAMS for each site type, RIDDOR record and CHAS or SafeContractor status.'],
  [/staff|train|people|team|workforce/i, 'People', 'Named supervisor, induction and toolbox talks, training matrix with renewal dates.'],
  [/public|resident|communit|social value/i, 'Public', 'Exclusion zones, signage, working hours near schools, how complaints are logged and closed.'],
  [/environment|carbon|sustain|waste/i, 'Carbon', 'Fleet and fuel data, waste hierarchy, battery tools on sensitive sites, a measurable target.'],
  [/quality|standard|ISO|monitor/i, 'Quality', 'ISO 9001 or equivalent, site audits, KPIs reported monthly to the contract manager.'],
  [/deliver|maintenance|service|site|contract/i, 'Method', 'Mobilisation plan, schedule per site, how you cover absence and seasonal peaks.'],
];
$('run').addEventListener('click', () => {
  const q = $('q').value.trim(), out = $('out'); if (!q) return;
  const words = q.split(/\s+/).length;
  const rows = [['Question', `${words} words parsed. Scored on method, evidence and outcomes.`]];
  THEMES.forEach(([re, k, v]) => re.test(q) && rows.push([k, v]));
  if (rows.length < 3) rows.push(['Method', 'Break the answer into approach, resources, controls and results, one paragraph each.']);
  rows.push(['Structure', 'Mirror the buyer wording in headings, one claim per paragraph, each backed by proof.']);
  rows.push(['Next', 'We turn this plan into a full, scored answer using your own evidence library.']);
  out.innerHTML = ''; rows.forEach(([k, v], i) => { const r = document.createElement('div'); r.className = 'row'; r.innerHTML = `<b>${k}</b><span></span>`; r.querySelector('span').textContent = v; out.appendChild(r); setTimeout(() => r.classList.add('in'), reduce ? 0 : 140 * i); });
});
