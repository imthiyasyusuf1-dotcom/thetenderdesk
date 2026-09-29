// The Tender Desk: cinematic particle story. Particles morph through the three services as you scroll.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const story = document.getElementById('story');
const canvas = document.getElementById('story-gl');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 760;
const N = small ? 26000 : 90000;

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
  uSize: { value: small ? 1.9 : 1.35 }, uColA: { value: new THREE.Color('#ff5b2e') }, uColB: { value: new THREE.Color('#ffd9c2') }, uColC: { value: new THREE.Color('#7fd1ff') }, uHot: { value: 0 }, uShock: { value: 1 }, uAlpha: { value: .5 }, uShockP: { value: new THREE.Vector3() },
};
const mat = new THREE.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `
    attribute vec3 aTo; attribute vec3 aRnd;
    uniform float uMix,uTime,uPR,uSize,uHot,uShock; uniform vec3 uMouse,uShockP;
    vec3 flow(vec3 p,float t){return vec3(sin(p.y*1.7+t)+cos(p.z*1.3-t*.7),sin(p.z*1.5+t*.8)+cos(p.x*1.9+t*.5),sin(p.x*1.3-t*.6)+cos(p.y*1.1+t));}
    varying float vA; varying float vC;
    void main(){
      float d = clamp((uMix - aRnd.x*.35)/.65, 0., 1.);
      float e = d<.5 ? 4.*d*d*d : 1.-pow(-2.*d+2.,3.)/2.;
      vec3 p = mix(position, aTo, e);
      // mid-flight swirl
      float fly = sin(e*3.14159);
      p += (aRnd - .5) * fly * 3.2;
      p.z += fly * (aRnd.y - .3) * 4.;
      // flow field turbulence, strongest mid-morph
      p += flow(p*.6+aRnd*2., uTime*.5) * (.03 + fly*.55);
      // click shockwave ring
      float sd = length(p.xy-uShockP.xy); float ring = exp(-pow((sd-uShock*9.)*1.6,2.)) * (1.-uShock);
      p += vec3(normalize(p.xy-uShockP.xy+1e-4),.8) * ring * 1.4;
      // idle drift
      p += .035*vec3(sin(uTime*.9+aRnd.x*40.), cos(uTime*.8+aRnd.y*40.), sin(uTime*.7+aRnd.z*40.));
      // mouse repel
      vec3 m = p - uMouse; float md = length(m.xy);
      p.xy += normalize(m.xy+1e-4) * smoothstep(1.6,0.,md) * .9;
      p.z += smoothstep(1.6,0.,md) * 1.2;
      vec4 mv = modelViewMatrix * vec4(p,1.);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * uPR * (1. + aRnd.z*1.4 + uHot*.6) * (11. / -mv.z);
      vA = (.55 + aRnd.y*.45) * (1. + ring*2.); vC = aRnd.z + fly*.6 + ring;
    }`,
  fragmentShader: `
    uniform float uAlpha; uniform vec3 uColA,uColB,uColC; varying float vA; varying float vC;
    void main(){
      vec2 c = gl_PointCoord - .5; float r = length(c);
      float a = smoothstep(.5,.0,r);
      vec3 col = mix(uColA,uColB,clamp(vC*vC,0.,1.)); col = mix(col,uColC,clamp(vC-1.,0.,1.)); gl_FragColor = vec4(col, a*vA*uAlpha);
    }`,
});
const points = new THREE.Points(geo, mat); scene.add(points);

// post: bloom + chromatic aberration + vignette + film grain
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .8, .55, .35);
composer.addPass(bloom);
const lens = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uAb: { value: .0015 }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform sampler2D tDiffuse;uniform float uAb,uTime;varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uTime)*43758.5453);}
    void main(){vec2 d=vUv-.5;float r=dot(d,d);vec2 o=d*uAb*(1.+r*8.);
      vec3 c=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);
      c*=1.-r*1.2; c=max(c-vec3(.035),0.)*1.04; c+=(h(vUv*1000.)-.5)*.035; gl_FragColor=vec4(c,1.);}`,
});
composer.addPass(lens);
composer.addPass(new OutputPass());

// palettes per chapter: ember, electric, gold, aurora, ember
const PAL = [['#ff5b2e','#ffd9c2','#7fd1ff'],['#3d7bff','#bfe4ff','#ff5b2e'],['#ffb020','#fff1c9','#ff5b2e'],['#19e3b1','#c9fff0','#8a6bff'],['#ff5b2e','#ffe2d4','#ffffff']].map(a=>a.map(c=>new THREE.Color(c)));
const tmpC = new THREE.Color();

// click / tap shockwave
addEventListener('pointerdown', e => { if (!visible || e.target.closest('a,button')) return; const v = new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(v, camera); const hit = new THREE.Vector3(); if (ray.ray.intersectPlane(plane, hit)) { hit.sub(points.position).divideScalar(points.scale.x); U.uShockP.value.copy(hit); U.uShock.value = 0; } });


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

function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); composer && composer.setSize(w, h); bloom && bloom.resolution.set(w, h); camera.aspect = w / h; camera.fov = w / h < .8 ? 58 : 40; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);

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
  // palette blend between chapters
  const pa = PAL[i], pb = PAL[i + 1];
  ['uColA','uColB','uColC'].forEach((u, j) => U[u].value.copy(tmpC.copy(pa[j]).lerp(pb[j], m)));
  U.uShock.value = Math.min(1, U.uShock.value + .012);
  // camera dolly: pushes in during morphs, slight orbit with mouse
  camera.position.z += ((small ? 12 : 11) - U.uHot.value * 2.2 - camera.position.z) * .08;
  camera.position.x += (mouse.x < 5 ? mouse.x * .8 : 0) - camera.position.x * .05;
  camera.position.y += (mouse.y < 5 ? mouse.y * .5 : 0) - camera.position.y * .05;
  camera.lookAt(points.position.x * .3, points.position.y * .3, 0);
  lens.uniforms.uAb.value = .0012 + U.uHot.value * .006;
  lens.uniforms.uTime.value = t;
  bloom.strength = (small ? .55 : .75) + U.uHot.value * .6;
  const dens = [.55, .42, .36, .42, .16]; U.uAlpha.value = dens[i] + (dens[i + 1] - dens[i]) * m;
  composer.render();
}

(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  build(); setPair(0, 1); resize(); requestAnimationFrame(frame);
  requestAnimationFrame(() => document.documentElement.classList.add('gl-ready'));
});
