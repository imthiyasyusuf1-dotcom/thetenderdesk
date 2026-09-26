/**
 * gl-hero.js
 * The 3D centrepiece: a procedurally modelled pair of BLVD frames with
 * spoon temple tips, a custom chromatic lens shader, and a GPU salt sim
 * that pours off the spoon and settles into type.
 *
 * Nothing here owns a rAF loop. main.js calls `hero.render(time)` from the
 * single GSAP ticker so Lenis, ScrollTrigger and WebGL share one frame.
 */
import * as THREE from 'three';
import { RoomEnvironment } from '../three/environments/RoomEnvironment.js';
import { EffectComposer } from '../three/postprocessing/EffectComposer.js';
import { RenderPass } from '../three/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../three/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../three/postprocessing/OutputPass.js';
import { makeLensMaterial } from './lens-shader.js';
import { makeSalt } from './salt.js';

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

/** Rounded rectangle-ish lens outline (a wayfarer-leaning trapezoid). */
function lensShape(w, h, r, taper = 0.08) {
  const s = new THREE.Shape();
  const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2, t = w * taper;
  s.moveTo(x0 + r, y1);
  s.lineTo(x1 - r, y1);
  s.quadraticCurveTo(x1, y1, x1, y1 - r);
  s.lineTo(x1 - t, y0 + r);
  s.quadraticCurveTo(x1 - t, y0, x1 - t - r, y0);
  s.lineTo(x0 + t + r * 1.4, y0);
  s.quadraticCurveTo(x0 + t * 0.4, y0, x0 + t * 0.2, y0 + r * 1.2);
  s.lineTo(x0, y1 - r);
  s.quadraticCurveTo(x0, y1, x0 + r, y1);
  return s;
}

/** Break the salt phrase onto two lines on portrait screens. */
function saltWords(t) {
  if (innerWidth >= innerHeight) return t;
  const w = t.split(' '), k = Math.ceil(w.length / 2);
  return w.slice(0, k).join(' ') + '\n' + w.slice(k).join(' ');
}

export function createHero(canvas, { mobile = false } = {}) {
  const DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
  camera.position.set(0, 0, 7.5);
  scene.add(camera);

  // Studio reflections, prefiltered once. Frames and lens share it.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.035);
  scene.environment = envRT.texture;
  pmrem.dispose();

  // Rim lights for the cinematic edge glow the bloom picks up.
  const rim = new THREE.DirectionalLight(0xff3b52, 3.2); rim.position.set(-4, 2, -3); scene.add(rim);
  const key = new THREE.DirectionalLight(0xfff1e6, 1.6); key.position.set(3, 4, 5); scene.add(key);

  /* ------------------------------------------------------------ model */
  const rig = new THREE.Group();        // scroll + mouse rotate this
  const frames = new THREE.Group();     // the actual glasses
  rig.add(frames); scene.add(rig);

  const acetate = new THREE.MeshPhysicalMaterial({
    color: 0x16090b, roughness: 0.18, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.06,
    sheen: 0.4, sheenColor: new THREE.Color(0x6b0f1a), envMapIntensity: 1.4,
  });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdedad6, metalness: 1, roughness: 0.22, envMapIntensity: 1.1 });

  const LW = 1.62, LH = 1.08, GAP = 0.34;
  const outer = lensShape(LW + 0.26, LH + 0.24, 0.26);
  outer.holes.push(new THREE.Path(lensShape(LW, LH, 0.2).getPoints(24)));
  const rimGeo = new THREE.ExtrudeGeometry(outer, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 4, curveSegments: 18 });
  rimGeo.center();
  const lensGeo = new THREE.ExtrudeGeometry(lensShape(LW, LH, 0.2), { depth: 0.02, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 3, curveSegments: 18 });
  lensGeo.center();

  const lensMat = makeLensMaterial(envRT.texture);
  const half = LW / 2 + GAP / 2 + 0.13;
  for (const side of [-1, 1]) {
    const r = new THREE.Mesh(rimGeo, acetate);
    r.position.x = side * half; r.scale.x = side;       // mirror the taper
    const l = new THREE.Mesh(lensGeo, lensMat);
    l.position.set(side * half, 0, 0.01); l.scale.x = side;
    frames.add(r, l);
  }
  // Bridge: a short arched tube.
  const bridge = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-GAP / 2 - 0.1, 0.28, 0), new THREE.Vector3(0, 0.46, 0.04), new THREE.Vector3(GAP / 2 + 0.1, 0.28, 0)), 16, 0.07, 10), acetate);
  frames.add(bridge);

  // Hinge studs, a little chrome glint for the bloom to catch.
  const stud = new THREE.SphereGeometry(0.045, 12, 8);
  for (const side of [-1, 1]) for (const y of [0.34, 0.2]) {
    const m = new THREE.Mesh(stud, chrome); m.position.set(side * (half + LW / 2 + 0.06), y, 0.1); frames.add(m);
  }

  // Arms: tapered tubes running back, ending in a modelled spoon.
  const armLen = 3.3;
  const spoonTips = [];
  const bowlProfile = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; bowlProfile.push(new THREE.Vector2(Math.sin(t * Math.PI / 2) * 0.16, -Math.cos(t * Math.PI / 2) * 0.07)); }
  const bowlGeo = new THREE.LatheGeometry(bowlProfile, 28);
  bowlGeo.scale(0.8, 0.8, 1.35);
  for (const side of [-1, 1]) {
    const x = side * (half + LW / 2 + 0.1);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 0.27, 0), new THREE.Vector3(x + side * 0.03, 0.27, -armLen * 0.45),
      new THREE.Vector3(x + side * 0.02, 0.22, -armLen * 0.85), new THREE.Vector3(x, 0.02, -armLen),
    ]);
    const arm = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.05, 10), acetate);
    arm.scale.set(1, 1.35, 1);
    frames.add(arm);
    // Neck + bowl, in chrome, angled like a real spoon lip.
    const end = curve.getPoint(1), tan = curve.getTangent(1);
    const spoon = new THREE.Group();
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.035, 0.34, 10), chrome);
    neck.rotation.x = Math.PI / 2; neck.position.z = -0.17;
    const bowl = new THREE.Mesh(bowlGeo, chrome);
    bowl.rotation.x = Math.PI / 2 + 0.25; bowl.position.set(0, 0.02, -0.5);
    spoon.add(neck, bowl);
    spoon.position.copy(end);
    spoon.lookAt(end.clone().add(tan));
    spoon.rotateY(Math.PI);
    frames.add(spoon);
    const tip = new THREE.Object3D(); tip.position.set(0, 0.06, -0.5); spoon.add(tip);
    spoonTips.push(tip);
  }
  frames.position.z = armLen * 0.35;  // pivot near the middle of the object

  /* ------------------------------------------------------------ salt */
  const salt = makeSalt({ count: mobile ? 2600 : 7000, text: saltWords(window.BLVD?.saltText || 'COMES WITH A SPOON'), dpr: DPR });
  camera.add(salt.points);

  /* ------------------------------------------------------------ post */
  let composer = null, bloom = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.45, 0.9);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* ------------------------------------------------------------ state */
  const state = { p: 0, spoon: 0, salt: 0, mx: 0, my: 0, vel: 0 };
  const cur = { rx: 0, ry: 0, spin: 0 };
  const tipW = new THREE.Vector3(), tipL = new THREE.Vector3();
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), look = new THREE.Vector3();
  let last = 0, w = 0, h = 0;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the frames the same visual width on narrow screens.
    camera.fov = w < h ? 62 : 32;
    camera.updateProjectionMatrix();
    if (composer) { composer.setSize(w, h); bloom.resolution.set(w / 2, h / 2); }
    salt.resize(w, h, camera);
  }
  resize();

  function render(time) {
    const t = time / 1000, dt = Math.min(0.05, t - last || 0.016); last = t;
    const { p, spoon } = state;

    // Hero rotation: idle spin + mouse + scroll. Velocity adds a flick.
    cur.spin += dt * (0.18 + Math.min(Math.abs(state.vel) * 0.02, 0.6)) * (1 - spoon);
    const targetY = -0.5 + Math.sin(cur.spin) * 0.35 + state.mx * 0.35 + p * 2.4;
    const targetX = 0.12 + state.my * 0.2 - p * 0.25;
    cur.ry = damp(cur.ry, targetY * (1 - spoon) + (-2.1) * spoon, 5, dt);
    cur.rx = damp(cur.rx, targetX * (1 - spoon) + 0.18 * spoon, 5, dt);
    rig.rotation.set(cur.rx, cur.ry, 0);
    rig.position.x = damp(rig.position.x, (w > 900 ? 1.1 : 0) * Math.min(p * 2, 1) * (1 - spoon), 4, dt);
    rig.position.y = damp(rig.position.y, (w > 900 ? 0.15 : 0.55) * (1 - p), 4, dt);
    rig.updateMatrixWorld(true);

    // Camera fly: from the front, down the arm, to hover over the spoon.
    spoonTips[0].getWorldPosition(tipW);
    const e = spoon * spoon * (3 - 2 * spoon); // smoothstep
    camPos.set(0, 0, 7.5).lerp(tipW.clone().add(new THREE.Vector3(0.45, 0.7, 1.9)), e);
    // Arc outward and up so the fly swings around the lens, never through it.
    const arc = Math.sin(Math.PI * e);
    camPos.x += -3.2 * arc; camPos.y += 1.4 * arc;
    look.set(0, 0, 0).lerp(tipW, e);
    camera.position.copy(camPos);
    camLook.lerp(look, 1); camera.lookAt(camLook);
    camera.updateMatrixWorld(true);

    // Feed the salt sim the spoon tip in camera space.
    tipL.copy(tipW); camera.worldToLocal(tipL);
    salt.update(t, state.salt, tipL);

    if (composer) { bloom.strength = 0.42 - e * 0.2; composer.render(dt); }
    else renderer.render(scene, camera);
  }

  return { state, render, resize, dispose: () => renderer.dispose() };
}
