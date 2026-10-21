// The Tender Desk hero: physically lit glossy 3D objects that float, react to the cursor and regroup on scroll.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const wrap = document.getElementById('h3d');
const canvas = document.getElementById('h3d-gl');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 760;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 2 : 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;
const camera = new THREE.PerspectiveCamera(small ? 42 : 30, 1, 0.1, 100);
camera.position.set(0, 0, 18);

const key = new THREE.DirectionalLight('#ffffff', 2.4);
key.position.set(6, 10, 8); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 });
key.shadow.radius = 8; key.shadow.bias = -0.0004;
scene.add(key, new THREE.AmbientLight('#ffffff', .25));

// shadow catcher floor
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: .12 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -5.2; floor.receiveShadow = true; if (!small) scene.add(floor);

// ---------- materials ----------
const M = {
  orange: new THREE.MeshPhysicalMaterial({ color: '#ff5b2e', roughness: .22, clearcoat: 1, clearcoatRoughness: .08 }),
  ink: new THREE.MeshPhysicalMaterial({ color: '#16161a', roughness: .35, clearcoat: 1, clearcoatRoughness: .15 }),
  cream: new THREE.MeshPhysicalMaterial({ color: '#f4efe6', roughness: .4, clearcoat: .6, sheen: .4 }),
  glass: new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .05, transmission: 1, thickness: 1.2, ior: 1.45, iridescence: .6, iridescenceIOR: 1.3 }),
  chrome: new THREE.MeshPhysicalMaterial({ color: '#dfe3ea', metalness: 1, roughness: .12 }),
};
if (small) M.glass = new THREE.MeshPhysicalMaterial({ color: '#dfe9ff', roughness: .1, metalness: .1, transparent: true, opacity: .55, clearcoat: 1 });

// ---------- geometry kit ----------
const G = {
  tile: new RoundedBoxGeometry(1.6, 1.6, .5, 5, .22),
  brick: new RoundedBoxGeometry(2.6, 1.1, 1.1, 5, .3),
  slab: new RoundedBoxGeometry(2.2, 3, .28, 4, .12),
  cube: new RoundedBoxGeometry(1.3, 1.3, 1.3, 5, .32),
  pill: new THREE.CapsuleGeometry(.5, 1.6, 10, 24),
  torus: new THREE.TorusGeometry(.9, .36, 32, 64),
  sphere: new THREE.SphereGeometry(.75, 48, 32),
  cyl: new THREE.CylinderGeometry(.7, .7, 1.1, 48, 1),
};
const kit = [
  ['slab', 'orange'], ['brick', 'orange'], ['torus', 'chrome'], ['cube', 'ink'], ['pill', 'orange'], ['sphere', 'cream'],
  ['tile', 'orange'], ['cyl', 'ink'], ['cube', 'cream'], ['torus', 'orange'], ['brick', 'cream'], ['sphere', 'chrome'],
  ['pill', 'ink'], ['tile', 'chrome'], ['cube', 'orange'], ['slab', 'cream'], ['sphere', 'orange'], ['cyl', 'chrome'],
];
const COUNT = small ? 12 : kit.length;

// ---------- formations (one per chapter) ----------
const rnd = (a, b) => a + Math.random() * (b - a);
function scatter() { return kit.map((_, i) => { const a = i / kit.length * Math.PI * 2 * 1.618; const r = 3 + (i % 5) * 1.1; return new THREE.Vector3(Math.cos(a) * r * 1.35, Math.sin(a) * r * .62, rnd(-3, 2)); }); }
function stack() { return kit.map((_, i) => new THREE.Vector3(((i % 3) - 1) * 2.1 + (Math.floor(i / 3) % 2) * .5, -3.6 + Math.floor(i / 3) * 1.35, ((i % 2) - .5) * .8)); }
function ring() { return kit.map((_, i) => { const a = i / kit.length * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * 4.4, Math.sin(a) * 4.4, Math.sin(a * 3) * 1.2); }); }
function wave() { return kit.map((_, i) => new THREE.Vector3((i - kit.length / 2) * .82, Math.sin(i * .7) * 1.6, Math.cos(i * .5) * 1.5)); }
const FORMS = [scatter(), stack(), ring(), wave()];

// ---------- bodies ----------
const bodies = [];
for (let i = 0; i < COUNT; i++) {
  const [g, m] = kit[i];
  const mesh = new THREE.Mesh(G[g], M[m]); mesh.castShadow = true; mesh.receiveShadow = true;
  const s = small ? .78 : 1; mesh.scale.setScalar(s);
  mesh.position.copy(FORMS[0][i]).multiplyScalar(small ? .62 : 1).add(new THREE.Vector3(0, 12 + i * .6, 0));
  mesh.rotation.set(rnd(0, 6), rnd(0, 6), rnd(0, 6));
  scene.add(mesh);
  bodies.push({ mesh, v: new THREE.Vector3(), spin: new THREE.Vector3(rnd(-.4, .4), rnd(-.4, .4), rnd(-.4, .4)), phase: rnd(0, 6), mass: rnd(.8, 1.3) });
}

// ---------- interaction ----------
const mouse = new THREE.Vector2(9, 9), world = new THREE.Vector3(), prevWorld = new THREE.Vector3(), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
let hasMouse = false;
addEventListener('pointermove', e => { mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); hasMouse = true; }, { passive: true });
addEventListener('touchend', () => { hasMouse = false; });
wrap.addEventListener('pointerdown', e => {
  if (e.target.closest('a,button')) return;
  ray.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  const hit = new THREE.Vector3(); if (!ray.ray.intersectPlane(plane, hit)) return;
  bodies.forEach(b => { const d = b.mesh.position.clone().sub(hit); const l = Math.max(.6, d.length()); b.v.add(d.normalize().multiplyScalar(14 / (l * l) + .6)); b.spin.addScalar(rnd(-2, 2)); });
});

function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

// ---------- chapters ----------
const steps = [...wrap.querySelectorAll('.hs')];
const dots = [...wrap.querySelectorAll('.h3d-prog i')];
function prog() { const r = wrap.getBoundingClientRect(); return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))); }
let visible = true, active = -1, last = performance.now();
new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(wrap);
const nav = document.getElementById('nav');
const tmp = new THREE.Vector3(), q = new THREE.Quaternion(), e3 = new THREE.Euler();

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.033, (now - last) / 1000); last = now;
  const rb = wrap.getBoundingClientRect().bottom;
  nav && nav.classList.toggle('on-light', rb > 70);
  document.documentElement.classList.toggle('in-story', rb > innerHeight * .9);
  if (!visible) return;
  const p = prog(), f = p * (steps.length - 1), st = Math.round(f);
  if (st !== active) { active = st; steps.forEach((s, j) => s.classList.toggle('on', j === st)); dots.forEach((d, j) => d.classList.toggle('on', j <= st)); }
  const fi = Math.min(FORMS.length - 1, st);
  const t = now / 1000;

  // cursor in world
  ray.setFromCamera(mouse, camera); if (hasMouse && ray.ray.intersectPlane(plane, world)) {} else world.set(99, 99, 0);
  const sweep = tmp.copy(world).sub(prevWorld); const speed = Math.min(2, sweep.length() / Math.max(dt, .001) / 30); prevWorld.copy(world);

  const sideX = small ? 0 : (st === 0 ? 4.6 : st % 2 ? -3.6 : 3.6), sideY = small ? (st === 0 ? 6.2 : 3.2) : 0, sc = small ? (st === 0 ? .36 : .55) : (st === 0 ? .72 : .9);
  bodies.forEach((b, i) => {
    const m = b.mesh;
    const home = tmp.copy(FORMS[fi][i]).multiplyScalar(sc); home.x += sideX; home.y += sideY + Math.sin(t * .8 + b.phase) * .18;
    // spring to home
    const k = reduce ? 30 : 5.5 / b.mass;
    b.v.addScaledVector(home.sub(m.position), k * dt);
    // cursor repel
    const dx = m.position.x - world.x, dy = m.position.y - world.y, d2 = dx * dx + dy * dy;
    if (d2 < 6) { const f = (6 - d2) * (1.4 + speed * 2.5) * dt; b.v.x += dx * f; b.v.y += dy * f; b.v.z += f * .8; b.spin.x += dy * f * .6; b.spin.y -= dx * f * .6; }
    // soft collisions
    for (let j = i + 1; j < bodies.length; j++) {
      const o = bodies[j].mesh; const cx = m.position.x - o.position.x, cy = m.position.y - o.position.y, cz = m.position.z - o.position.z;
      const dd = cx * cx + cy * cy + cz * cz, min = 2.2 * sc; if (dd < min * min && dd > 1e-4) { const push = (min - Math.sqrt(dd)) * 4 * dt; const n = tmp.set(cx, cy, cz).normalize().multiplyScalar(push); b.v.add(n); bodies[j].v.sub(n); }
    }
    b.v.multiplyScalar(Math.pow(.18, dt));
    m.position.addScaledVector(b.v, dt);
    // rotation
    b.spin.multiplyScalar(Math.pow(.5, dt));
    const idle = reduce ? 0 : .25;
    e3.set((b.spin.x + idle * .6) * dt, (b.spin.y + idle) * dt, b.spin.z * dt); q.setFromEuler(e3); m.quaternion.premultiply(q);
  });

  // camera parallax
  const cx = hasMouse ? mouse.x : Math.sin(t * .2) * .3, cy = hasMouse ? mouse.y : 0;
  camera.position.x += (cx * 1.4 - camera.position.x) * .04; camera.position.y += (cy * .9 - camera.position.y) * .04;
  camera.lookAt(0, small ? 1 : 0, 0);
  renderer.render(scene, camera);
}
requestAnimationFrame(t => { last = t; frame(t); document.documentElement.classList.add('h3d-ready'); });
