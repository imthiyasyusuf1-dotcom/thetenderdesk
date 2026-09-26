/**
 * gl-hero.js
 * The live WebGL scene: a BLVD frame (see ./glasses/), a studio PMREM
 * environment, and the GPU salt that pours from the spoon bowl.
 *
 * The whole choreography is a pure function of one number, T in [0, 2]:
 *   0..1  hero turntable (the frames turn from the front to a 3/4 view)
 *   1..2  camera flies down the arm to the spoon bowl, then salt pours
 * Because pose(T) is deterministic, the same code bakes the WebP image
 * sequence used on phones (bake.html) and runs live on laptops.
 * This module owns no rAF loop: main.js calls `draw()` only when
 * something changed (render on demand).
 */
import * as THREE from 'three';
import { RoomEnvironment } from '../three/environments/RoomEnvironment.js';
import { buildGlasses } from './glasses/model.js';
import { makeAcetate, makeLens, makeMetal, applyColourway, COLOURWAYS } from './glasses/materials.js';
import { makeSalt } from './salt.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => x * x * (3 - 2 * x);
const SCALE = 0.26; // cm to scene units: the front is about 3.8 units wide

/** Split the salt phrase over two lines on portrait screens. */
function saltWords(t, portrait) {
  if (!portrait) return t;
  const w = t.split(' '), k = Math.ceil(w.length / 2);
  return w.slice(0, k).join(' ') + '\n' + w.slice(k).join(' ');
}

/** Split T into the named phases the scene uses. */
export function phases(T) {
  return {
    turn: clamp01(T),                     // hero turntable
    fly: ease(clamp01((T - 1) / 0.32)),   // camera to the spoon
    salt: clamp01((T - 1.36) / 0.6),      // salt pours then settles into type
  };
}

export function createHero(canvas, {
  mobile = false, width = innerWidth, height = innerHeight, dpr, bake = false,
  saltCount, saltText = 'COMES WITH A SPOON', colour = 0, spoonDist = 1.3,
} = {}) {
  const DPR = dpr ?? Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: !mobile || bake, powerPreference: 'high-performance',
    preserveDrawingBuffer: bake,
  });
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);
  scene.add(camera);

  // Studio reflections, prefiltered once and shared by every material.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.03);
  scene.environment = envRT.texture;
  pmrem.dispose();

  // A warm key and a crimson rim (the brand colour) on top of the env.
  const key = new THREE.DirectionalLight(0xfff1e6, 1.1); key.position.set(-4, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff3b52, 2.2); rim.position.set(5, 2, -6); scene.add(rim);

  /* ------------------------------------------------------------ model */
  const mats = { acetate: makeAcetate(mobile), lens: makeLens(), metal: makeMetal() };
  const { group, bowl, bowlNormal } = buildGlasses({ ...mats, detail: mobile ? 16 : 28 });
  group.scale.setScalar(SCALE);
  group.position.set(0, -0.1, 1.55); // pivot near the middle of the object
  const rig = new THREE.Group(); // scroll + pointer rotate this
  rig.add(group); scene.add(rig);
  let colourIndex = colour;
  applyColourway(COLOURWAYS[colourIndex], mats);

  /* ------------------------------------------------------------ salt */
  let portrait = width < height;
  const salt = makeSalt({
    count: saltCount ?? (mobile ? 1500 : 5000),
    text: saltWords(window.BLVD?.saltText || saltText, portrait), dpr: DPR,
  });
  camera.add(salt.points);

  /* ------------------------------------------------------------ layout */
  let w = width, h = height;
  function resize(W = innerWidth, H = innerHeight) {
    w = W; h = H; portrait = w < h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = portrait ? 50 : 30; // similar visual width on narrow screens
    camera.updateProjectionMatrix();
    salt.resize(w, h, camera);
  }
  resize(width, height);

  /* ------------------------------------------------------------ pose */
  const bowlW = new THREE.Vector3(), nW = new THREE.Vector3(), tipL = new THREE.Vector3();
  const start = new THREE.Vector3(), end = new THREE.Vector3(), look = new THREE.Vector3(), lookEnd = new THREE.Vector3();
  const q = new THREE.Quaternion();

  /** Put the scene in the state for scroll position T. */
  function pose(T, mx = 0, my = 0, time = 0) {
    const { turn, fly, salt: s } = phases(T);
    const wide = w > 900;
    // Flattering 3/4 angle that turns to reveal the arm as you scroll.
    const ry = THREE.MathUtils.lerp(-0.55, 0.95, ease(turn)) + mx * 0.3 * (1 - fly);
    const rx = THREE.MathUtils.lerp(0.2, 0.08, turn) + my * 0.15 * (1 - fly);
    rig.rotation.set(rx, ry, 0);
    rig.position.set((wide ? 1.35 - 0.4 * turn : (portrait ? 0.4 * (1 - turn) : 0)) * (1 - fly), (wide ? 0.3 : portrait ? 1.8 : 0.9) * (1 - turn) * (1 - fly), 0);
    rig.updateMatrixWorld(true);

    // Fly to the inner face of the bowl so the arm hangs into frame with
    // the scoop facing the lens, like ref-spoon.jpg.
    bowl.getWorldPosition(bowlW);
    rig.getWorldQuaternion(q);
    nW.copy(bowlNormal).applyQuaternion(q).normalize();
    start.set(0, 0, portrait ? 11.4 : 7.6);
    end.copy(bowlW).addScaledVector(nW, spoonDist); end.y -= 0.1;
    camera.position.copy(start).lerp(end, fly);
    const arc = Math.sin(Math.PI * fly); // arc up so the path never cuts a lens
    camera.position.y += 2.4 * arc; camera.position.x += 1.2 * arc;
    lookEnd.copy(bowlW); lookEnd.y += portrait ? 0.02 : 0.22;
    look.set(0, 0, 0).lerp(lookEnd, fly);
    camera.lookAt(look);
    camera.updateMatrixWorld(true);

    // Salt is emitted from the bowl, in camera space.
    tipL.copy(bowlW); camera.worldToLocal(tipL);
    salt.update(time, s, tipL);
  }

  function draw(T, mx, my, time) {
    pose(T, mx, my, time);
    renderer.render(scene, camera);
  }

  return {
    draw, resize, renderer,
    setColour(i) { colourIndex = i; applyColourway(COLOURWAYS[i], mats); },
    colour: () => colourIndex,
    dispose() { renderer.dispose(); envRT.dispose(); },
  };
}
