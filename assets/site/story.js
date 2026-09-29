// The Tender Desk: cinematic particle story. Particles morph through the three services as you scroll.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const story = document.getElementById('story');
const canvas = document.getElementById('story-gl');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 760;
const N = small ? 14000 : 36000;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x0b0b0c, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 0, 11);

// ---------- shape sampling from 2D drawings ----------
function sample(draw, depth = 0.35, W = 1000, H = 1000) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.strokeStyle = '#fff'; draw(g, W, H);
  const d = g.getImageData(0, 0, W, H).data, pts = [];
  for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) if (d[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
  const out = new Float32Array(N * 3), n = pts.length / 2, span = small ? 6.4 : 8.4;
  for (let i = 0; i < N; i++) {
    const k = (Math.random() * n | 0) * 2;
    out[i * 3] = (pts[k] / W - .5) * span + (Math.random() - .5) * .02;
    out[i * 3 + 1] = -(pts[k + 1] / H - .5) * span + (Math.random() - .5) * .02;
    out[i * 3 + 2] = (Math.random() - .5) * depth;
  }
  return out;
}
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const FONT = '"Inter Tight", system-ui, sans-serif';

// 0: galaxy swirl
function galaxy() {
  const o = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const arm = i % 3, r = Math.pow(Math.random(), .6) * 5.4, a = r * 1.15 + arm * 2.094 + (Math.random() - .5) * .55;
    o[i * 3] = Math.cos(a) * r; o[i * 3 + 1] = Math.sin(a) * r * .55 + (Math.random() - .5) * .25; o[i * 3 + 2] = Math.sin(a) * r * .6 + (Math.random() - .5) * .5;
  }
  return o;
}
// 1: phone with booking UI (websites)
const phone = () => sample((g, W, H) => {
  g.lineWidth = 16; rr(g, 330, 90, 340, 820, 60); g.stroke();
  rr(g, 450, 118, 100, 22, 11); g.fill();
  g.font = `600 64px ${FONT}`; g.fillText('Book now', 372, 330);
  g.fillRect(372, 360, 200, 10); g.fillRect(372, 385, 150, 10);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { g.lineWidth = 6; rr(g, 372 + c * 88, 430 + r * 70, 76, 52, 12); (r === 1 && c === 1) ? g.fill() : g.stroke(); }
  rr(g, 372, 700, 256, 80, 40); g.fill();
  g.font = `600 30px ${FONT}`; g.fillText('\u2605\u2605\u2605\u2605\u2605', 400, 840);
}, .25);
// 2: tender document with tick (tenders)
const doc = () => sample((g) => {
  g.lineWidth = 14; g.beginPath(); g.moveTo(290, 90); g.lineTo(600, 90); g.lineTo(710, 200); g.lineTo(710, 910); g.lineTo(290, 910); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(600, 90); g.lineTo(600, 200); g.lineTo(710, 200); g.stroke();
  g.font = `700 54px ${FONT}`; g.fillText('TENDER', 340, 180);
  for (let i = 0; i < 7; i++) g.fillRect(340, 260 + i * 52, i % 3 === 2 ? 200 : 320, 12);
  g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(420, 760); g.lineTo(490, 830); g.lineTo(630, 660); g.stroke();
}, .3);
// 3: AI chat bubbles (automation)
const chat = () => sample((g) => {
  g.lineWidth = 14; rr(g, 150, 190, 470, 190, 50); g.stroke(); g.beginPath(); g.moveTo(210, 380); g.lineTo(190, 450); g.lineTo(290, 380); g.stroke();
  g.font = `500 52px ${FONT}`; g.fillText('Open Sunday?', 200, 305);
  rr(g, 380, 530, 470, 210, 50); g.fill(); g.beginPath(); g.moveTo(760, 740); g.lineTo(810, 810); g.lineTo(700, 740); g.fill();
  g.globalCompositeOperation = 'destination-out'; g.font = `600 52px ${FONT}`; g.fillText('Yes, 10 to 4.', 430, 620); g.fillText('Booked you in.', 430, 690);
  g.globalCompositeOperation = 'source-over'; g.font = `700 70px ${FONT}`; g.fillText('AI', 180, 690);
  g.lineWidth = 10; g.beginPath(); g.arc(215, 665, 80, 0, Math.PI * 2); g.stroke();
}, .3);
// 4: brand wordmark
const word = () => sample((g) => {
  g.textAlign = 'center'; g.font = `600 ${small ? 150 : 132}px ${FONT}`;
  g.fillText('THE', 500, 360); g.fillText('TENDER', 500, 530); g.fillText('DESK', 500, 700);
}, .2);

let SHAPES;
function build() { SHAPES = [galaxy(), phone(), doc(), chat(), word()]; }

// ---------- particle material ----------
const geo = new THREE.BufferGeometry();
const aFrom = new THREE.BufferAttribute(new Float32Array(N * 3), 3), aTo = new THREE.BufferAttribute(new Float32Array(N * 3), 3);
const rnd = new Float32Array(N * 3); for (let i = 0; i < N * 3; i++) rnd[i] = Math.random();
geo.setAttribute('position', aFrom); geo.setAttribute('aTo', aTo); geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 3));
const U = {
  uMix: { value: 0 }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 0) }, uPR: { value: renderer.getPixelRatio() },
  uSize: { value: small ? 2.3 : 2.0 }, uColA: { value: new THREE.Color('#ff5b2e') }, uColB: { value: new THREE.Color('#ffd9c2') }, uHot: { value: 0 },
};
const mat = new THREE.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `
    attribute vec3 aTo; attribute vec3 aRnd;
    uniform float uMix,uTime,uPR,uSize,uHot; uniform vec3 uMouse;
    varying float vA; varying float vC;
    void main(){
      float d = clamp((uMix - aRnd.x*.35)/.65, 0., 1.);
      float e = d<.5 ? 4.*d*d*d : 1.-pow(-2.*d+2.,3.)/2.;
      vec3 p = mix(position, aTo, e);
      // mid-flight swirl
      float fly = sin(e*3.14159);
      p += (aRnd - .5) * fly * 3.2;
      p.z += fly * (aRnd.y - .3) * 4.;
      // idle drift
      p += .035*vec3(sin(uTime*.9+aRnd.x*40.), cos(uTime*.8+aRnd.y*40.), sin(uTime*.7+aRnd.z*40.));
      // mouse repel
      vec3 m = p - uMouse; float md = length(m.xy);
      p.xy += normalize(m.xy+1e-4) * smoothstep(1.6,0.,md) * .9;
      p.z += smoothstep(1.6,0.,md) * 1.2;
      vec4 mv = modelViewMatrix * vec4(p,1.);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * uPR * (1. + aRnd.z*1.4 + uHot*.6) * (11. / -mv.z);
      vA = .55 + aRnd.y*.45; vC = aRnd.z;
    }`,
  fragmentShader: `
    uniform vec3 uColA,uColB; varying float vA; varying float vC;
    void main(){
      vec2 c = gl_PointCoord - .5; float r = length(c);
      float a = smoothstep(.5,.0,r);
      gl_FragColor = vec4(mix(uColA,uColB,vC*vC), a*vA*.9);
    }`,
});
const points = new THREE.Points(geo, mat); scene.add(points);

// faint dust backdrop
const dustN = small ? 600 : 1500, dp = new Float32Array(dustN * 3);
for (let i = 0; i < dustN; i++) { dp[i * 3] = (Math.random() - .5) * 40; dp[i * 3 + 1] = (Math.random() - .5) * 24; dp[i * 3 + 2] = -Math.random() * 20 - 2; }
const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffb08a, size: .05, transparent: true, opacity: .35, depthWrite: false }));
scene.add(dust);

// ---------- scroll + stages ----------
const steps = [...story.querySelectorAll('.st')];
const nS = 5; const dots = [...story.querySelectorAll('.story-prog i')];
let from = -1, to = -1;
function setPair(a, b) { if (a === from && b === to) return; from = a; to = b; aFrom.array.set(SHAPES[a]); aTo.array.set(SHAPES[b]); aFrom.needsUpdate = aTo.needsUpdate = true; }
function progress() { const r = story.getBoundingClientRect(); const total = r.height - innerHeight; return Math.min(1, Math.max(0, -r.top / total)); }

const mouse = new THREE.Vector2(9, 9), mw = new THREE.Vector3(99, 99, 0), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
addEventListener('pointermove', e => { mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); }, { passive: true });
addEventListener('pointerleave', () => mouse.set(9, 9));
addEventListener('touchend', () => setTimeout(() => mouse.set(9, 9), 300));

function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 58 : 40; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

let visible = true, sp = 0, t0 = performance.now(), active = -1;
new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(story);
const nav = document.getElementById('nav');

function frame(now) {
  requestAnimationFrame(frame);
  const p = progress();
  const sb = story.getBoundingClientRect().bottom; nav && nav.classList.toggle('on-dark', sb > 70); document.documentElement.classList.toggle('in-story', sb > innerHeight * .9);
  if (!visible) return;
  sp += (p - sp) * (reduce ? 1 : .09);
  const f = sp * (nS - 1), i = Math.min(nS - 2, Math.floor(f)), k = f - i;
  // hold each shape: morph only in the middle 60% of each segment
  const m = Math.min(1, Math.max(0, (k - .2) / .6));
  setPair(i, i + 1);
  U.uMix.value = m;
  const st = Math.round(f);
  if (st !== active) { active = st; steps.forEach((s, j) => s.classList.toggle('on', j === st)); dots.forEach((d, j) => d.style.background = j <= st ? '#ff5b2e' : ''); }
  U.uTime.value = (now - t0) / 1000;
  U.uHot.value = Math.sin(m * Math.PI);
  ray.setFromCamera(mouse, camera); ray.ray.intersectPlane(plane, mw) || mw.set(99, 99, 0);
  U.uMouse.value.lerp(mw, .15);
  const t = U.uTime.value;
  points.rotation.y = (reduce ? 0 : Math.sin(t * .25) * .18) + (i === 0 ? (1 - m) * t * .05 % 6.283 * 0 : 0) + (i === 0 && !reduce ? (1 - m) * Math.sin(t * .1) * .5 : 0);
  points.rotation.x = reduce ? 0 : Math.sin(t * .2) * .06;
  points.position.x += ((small ? 0 : (active === 2 ? -2.6 : active === 1 || active === 3 ? 2.6 : 0)) - points.position.x) * .06;
  points.position.y += ((small ? (active === 0 ? 3.4 : active === 4 ? 1.2 : 1.6) : (active === 4 ? .5 : 0)) - points.position.y) * .06;
  const sc = small && active === 0 ? .62 : 1; points.scale.setScalar(points.scale.x + (sc - points.scale.x) * .06);
  dust.rotation.y = t * .01;
  renderer.render(scene, camera);
}

(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  build(); setPair(0, 1); requestAnimationFrame(frame);
  requestAnimationFrame(() => document.documentElement.classList.add('gl-ready'));
});
