/**
 * photo-hero.js
 * The hero is built from BLVD's own product photography, not a 3D model.
 * Each colourway is two real packshots (front + angle), cut out of their
 * studio background, each with a depth map baked from its silhouette
 * (see cut/depth.py). A small shader displaces the photo by its depth as
 * the pointer and scroll move, so the frame reads as a physical object
 * while every pixel is a real photo of the real product.
 *
 * Same contract as the old gl-hero: a pure function of T in [0, 2].
 *   0..1  front packshot turns into the angled shot (crossfade + parallax)
 *   1..2  cut to the real arm photo, push in on the spoon, salt pours
 * Salt is the unchanged GPU sim (salt.js), emitted from the real spoon tip.
 */
import * as THREE from 'three';
import { makeSalt } from './salt.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => x * x * (3 - 2 * x);

export const COLOURS = [
  { h: 'coco-chanel', b: 'side' },
  { h: 'red-groovers', b: 'side' },
  { h: 'salmon-bomber', b: 'side' },
  { h: 'ghost-chrome', b: 'q' },
  { h: 'raver', b: 'q' },
];
const ARM = { src: 'arm', tip: [0.646, 0.935], aspect: 1064 / 1600 };

export function phases(T) {
  return { turn: clamp01(T), fly: ease(clamp01((T - 1) / 0.32)), salt: clamp01((T - 1.36) / 0.6) };
}

function saltWords(t, portrait) {
  if (!portrait) return t;
  const w = t.split(' '), k = Math.ceil(w.length / 2);
  return w.slice(0, k).join(' ') + '\n' + w.slice(k).join(' ');
}

const VERT = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
// Parallax occlusion-lite: march the depth map a few steps along the view offset.
const FRAG = /* glsl */`
  uniform sampler2D map, depth; uniform vec2 uPar; uniform float uAlpha, uSheen, uLift;
  varying vec2 vUv;
  void main(){
    vec2 uv = vUv; float d = 0.;
    for (int i = 0; i < 4; i++) { d = texture2D(depth, uv).r; uv = vUv - uPar * (d - .45); }
    vec4 c = texture2D(map, uv);
    // Moving studio highlight across the nearest surfaces.
    float band = exp(-pow((uv.x + uv.y * .35 - uSheen) * 7., 2.)) * d * .22;
    c.rgb = c.rgb * uLift + band * c.a;
    gl_FragColor = vec4(c.rgb * c.a, c.a) * uAlpha;
  }`;
const SHADOW = /* glsl */`
  uniform float uAlpha; varying vec2 vUv;
  void main(){ vec2 p = (vUv - .5) * vec2(2., 2.); float k = smoothstep(1., 0., length(p));
    gl_FragColor = vec4(0., 0., 0., k * k * .55 * uAlpha); }`;

export function createHero(canvas, { mobile = false, width = innerWidth, height = innerHeight, dpr, saltCount, saltText = 'COMES WITH A SPOON', colour = 0, asset = (p) => p } = {}) {
  const DPR = dpr ?? Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);
  const D = 10; camera.position.set(0, 0, D); scene.add(camera);

  const loader = new THREE.TextureLoader();
  const big = !mobile && Math.max(innerWidth, innerHeight) * (window.devicePixelRatio || 1) > 1400;
  const cache = new Map();
  function tex(url, srgb) {
    if (cache.has(url)) return cache.get(url);
    const p = new Promise((res, rej) => loader.load(asset(url), (t) => {
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = 4; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
      res(t);
    }, undefined, rej));
    cache.set(url, p); return p;
  }
  const pair = (name) => Promise.all([tex(`img/cut/${name}-${big ? 1600 : 800}.webp`, true), tex(`img/cut/${name}-depth.webp`, false)]);

  function photo(aspect) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false,
      premultipliedAlpha: true, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      uniforms: { map: { value: null }, depth: { value: null }, uPar: { value: new THREE.Vector2() }, uAlpha: { value: 0 }, uSheen: { value: -1 }, uLift: { value: 1 } },
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(aspect, 1), mat);
    m.visible = false; scene.add(m);
    return m;
  }
  const A = photo(1.6), B = photo(1.6), arm = photo(ARM.aspect);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.22), new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SHADOW, transparent: true, depthWrite: false, depthTest: false, uniforms: { uAlpha: { value: 0 } } }));
  shadow.renderOrder = -1; scene.add(shadow);
  [A, B, arm].forEach((m, i) => (m.renderOrder = i));

  const set = (m, [map, depth]) => { m.material.uniforms.map.value = map; m.material.uniforms.depth.value = depth; };
  let colourIndex = colour;
  function setColour(i) {
    colourIndex = i; const c = COLOURS[i];
    return Promise.all([pair(`${c.h}-front`), pair(`${c.h}-${c.b}`)]).then(([a, b]) => { if (colourIndex === i) { set(A, a); set(B, b); } });
  }
  // Warm the other colourways after first paint.
  const ready = Promise.all([setColour(colour), pair(ARM.src).then((p) => set(arm, p))]);
  ready.then(() => setTimeout(() => COLOURS.forEach((c) => { pair(`${c.h}-front`); pair(`${c.h}-${c.b}`); }), 1500));

  let portrait = width < height;
  const salt = makeSalt({ count: saltCount ?? (mobile ? 5000 : 7000), text: saltWords(window.BLVD?.saltText || saltText, portrait), dpr: DPR });
  camera.add(salt.points);

  let w = width, h = height, vh = 1, vw = 1;
  function resize(W = innerWidth, H = innerHeight) {
    w = W; h = H; portrait = w < h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = 30; camera.updateProjectionMatrix();
    vh = 2 * D * Math.tan(THREE.MathUtils.degToRad(15)); vw = vh * camera.aspect;
    salt.resize(w, h, camera);
  }
  resize(width, height);

  const tipL = new THREE.Vector3();
  function pose(T, mx = 0, my = 0, time = 0) {
    const { turn, fly, salt: s } = phases(T);
    const e = ease(turn), wide = w > 900;
    // Product width on screen, as a fraction of the viewport.
    const size = wide ? Math.min(vw * 0.4, vh * 0.9) : Math.min(vw * 0.94, vh * 0.62);
    const baseX = wide ? vw * (0.22 - 0.08 * e) : 0;
    const baseY = wide ? vh * (0.2 - 0.12 * e) : vh * (0.2 - 0.06 * e);
    const idle = 0;
    const out = 1 - fly;
    [A, B].forEach((m, i) => {
      const k = i === 0 ? 1 - e : e;
      const sc = size / 1.6 * (1 + 0.04 * (i === 0 ? e : 1 - e)) * (1 + fly * 0.5);
      m.scale.set(sc, sc, 1);
      m.position.set(baseX + (i === 0 ? -1 : 1) * 0.04 * vw * (i === 0 ? e : 1 - e) - fly * vw * 0.3, baseY + idle + fly * vh * 0.15, 0);
      // Real perspective tilt towards the pointer, plus depth parallax inside the photo.
      m.rotation.set(my * 0.18, mx * 0.35 + (i === 0 ? -0.25 * e : 0.2 * (1 - e)), 0);
      const u = m.material.uniforms;
      u.uPar.value.set(mx * 0.028 + (i === 0 ? -0.02 : 0.02) * (i === 0 ? e : 1 - e), -my * 0.02);
      u.uAlpha.value = k * out; u.uSheen.value = -0.4 + turn * 1.9; u.uLift.value = 0.96;
      m.visible = u.uAlpha.value > 0.002 && !!u.map.value;
    });
    shadow.scale.set(size * 0.9, size * 0.9, 1);
    shadow.position.set(baseX, baseY - size / 1.6 * 0.46, -0.01);
    shadow.material.uniforms.uAlpha.value = 0;

    // Spoon: the real arm photo, framed so its tip lands on a fixed screen point.
    // Bowl lands in the centre of the upper half; the arm rises off-frame above it.
    const ah = Math.min(vh * (portrait ? 0.95 : 1.05), vw * (portrait ? 1.5 : 0.9)) * (1.15 - 0.15 * fly);
    const focus = portrait ? [vw * 0.04, vh * 0.1] : [vw * 0.02, vh * 0.16];
    arm.scale.set(ah, ah, 1);
    const tx = (ARM.tip[0] - 0.5) * ARM.aspect * ah, ty = (0.5 - ARM.tip[1]) * ah;
    arm.position.set(focus[0] - tx + (1 - fly) * vw * 0.25, focus[1] - ty - (1 - fly) * vh * 0.1, 0);
    arm.rotation.set(my * 0.1, mx * 0.2, 0);
    const au = arm.material.uniforms;
    au.uAlpha.value = clamp01((fly - 0.35) / 0.4); au.uPar.value.set(mx * 0.02, -my * 0.015);
    au.uSheen.value = 0.2 + fly * 0.5 + s * 0.3; au.uLift.value = 1.1 - s * 0.1;
    arm.visible = au.uAlpha.value > 0.002 && !!au.map.value;

    arm.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    tipL.set(arm.position.x + tx, arm.position.y + ty, 0); camera.worldToLocal(tipL);
    salt.update(time, s, tipL);
  }

  function draw(T, mx, my, time) { pose(T, mx, my, time); renderer.render(scene, camera); }
  return { draw, resize, renderer, ready, setColour, colour: () => colourIndex, dispose() { renderer.dispose(); } };
}
