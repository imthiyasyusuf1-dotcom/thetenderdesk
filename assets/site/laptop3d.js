// Hero laptop: glossy aluminium laptop built from primitives. Scroll opens it,
// turns it to camera and cycles its screen through the showcase sites.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('lap');
const SCREENS = window.TD_SCREENS || [];
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(3, 6, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = key.shadow.camera.bottom = -4; key.shadow.camera.right = key.shadow.camera.top = 4;
scene.add(key, new THREE.AmbientLight(0xffffff, 0.15));
const rim = new THREE.DirectionalLight(0xffd2b0, 1.2); rim.position.set(-4, 2, -3); scene.add(rim);

const W = 3.2, D = 2.2, BH = 0.11, LH = 0.07;
const alu = new THREE.MeshPhysicalMaterial({ color: 0xb9bcc2, metalness: 1, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.2 });
const dark = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0b, metalness: 0.2, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.05 });

const laptop = new THREE.Group(); scene.add(laptop);
const base = new THREE.Mesh(new RoundedBoxGeometry(W, BH, D, 4, 0.06), alu);
base.position.y = BH / 2; base.castShadow = true; laptop.add(base);

// keyboard deck texture
const kc = document.createElement('canvas'); kc.width = 1024; kc.height = 420;
const kx = kc.getContext('2d');
kx.fillStyle = '#9ea1a7'; kx.fillRect(0, 0, 1024, 420);
kx.fillStyle = '#16171a';
for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) { kx.beginPath(); kx.roundRect(40 + c * 67, 20 + r * 64, 58, 54, 7); kx.fill(); }
const deck = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.86, D * 0.44), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(kc), metalness: 0.6, roughness: 0.45 }));
deck.rotation.x = -Math.PI / 2; deck.position.set(0, BH + 0.001, -D * 0.2); laptop.add(deck);
const pad = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.34, D * 0.3), new THREE.MeshPhysicalMaterial({ color: 0xa9acb2, metalness: 1, roughness: 0.18 }));
pad.rotation.x = -Math.PI / 2; pad.position.set(0, BH + 0.002, D * 0.29); laptop.add(pad);

// lid on a hinge at the back edge
const hinge = new THREE.Group(); hinge.position.set(0, BH, -D / 2); laptop.add(hinge);
const lid = new THREE.Mesh(new RoundedBoxGeometry(W, LH, D, 4, 0.05), alu);
lid.position.set(0, LH / 2, D / 2); lid.castShadow = true; hinge.add(lid);
const bezel = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.97, D * 0.96), dark);
bezel.rotation.x = Math.PI / 2; bezel.position.set(0, -0.001, D / 2); hinge.add(bezel);

// screen: canvas texture that crossfades between sites
const SW = 1600, SH = 1000;
const sc = document.createElement('canvas'); sc.width = SW; sc.height = SH;
const sx = sc.getContext('2d');
const stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace; stex.anisotropy = 8;
const screen = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.93, W * 0.93 * SH / SW), new THREE.MeshBasicMaterial({ map: stex, toneMapped: false }));
screen.rotation.x = Math.PI / 2; screen.position.set(0, -0.002, D / 2 + 0.02); hinge.add(screen);
// glass sheen over the screen
const glass = new THREE.Mesh(screen.geometry, new THREE.MeshPhysicalMaterial({ color: 0x000000, transparent: true, opacity: 0.12, roughness: 0.02, metalness: 0, clearcoat: 1 }));
glass.rotation.x = Math.PI / 2; glass.position.set(0, -0.004, D / 2 + 0.02); hinge.add(glass);

const imgs = SCREENS.map(([name, src, col]) => {
  const o = { name, col, img: null };
  if (src) { const im = new Image(); im.decoding = 'async'; im.onload = () => { o.img = im; dirty = true; }; im.src = src; }
  return o;
});
function drawScreen(o, a) {
  sx.globalAlpha = a;
  if (o.img) sx.drawImage(o.img, 0, 0, SW, SH);
  else {
    const g = sx.createRadialGradient(SW * 0.3, SH * 0.25, 0, SW * 0.3, SH * 0.25, SW);
    g.addColorStop(0, o.col); g.addColorStop(0.7, '#0b0b0c'); sx.fillStyle = g; sx.fillRect(0, 0, SW, SH);
    sx.fillStyle = '#f3efe8'; sx.font = 'italic 220px "Instrument Serif", Georgia, serif'; sx.textAlign = 'center'; sx.textBaseline = 'middle';
    sx.fillText(o.name, SW / 2, SH / 2);
  }
  sx.globalAlpha = 1;
}
let dirty = true, lastKey = '';
function paint(pos) { // pos: fractional index through the screens
  const n = imgs.length; if (!n) return;
  const i = Math.min(n - 1, Math.floor(pos)), f = Math.min(1, Math.max(0, (pos - i - 0.7) / 0.3));
  const k = i + ':' + f.toFixed(2);
  if (k === lastKey && !dirty) return; lastKey = k; dirty = false;
  sx.fillStyle = '#000'; sx.fillRect(0, 0, SW, SH);
  drawScreen(imgs[i], 1);
  if (f > 0 && i + 1 < n) drawScreen(imgs[i + 1], f);
  stex.needsUpdate = true;
  const el = document.getElementById('playing'); const cur = imgs[f > 0.5 && i + 1 < n ? i + 1 : i].name;
  if (el && el.textContent !== cur) el.textContent = cur;
}

// soft shadow catcher
const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.45 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

let mx = 0, my = 0, tmx = 0, tmy = 0;
addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; });

const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
let sp = 0;
function frame(t) {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const p = window.TD_heroProgress || 0;
  sp += (p - sp) * 0.12;
  mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
  const open = ease((sp - 0.05) / 0.2);                  // 0..0.22 open the lid
  const turn = ease((sp - 0.05) / 0.25);         // swing to face camera
  hinge.rotation.x = -open * (Math.PI * 0.58);
  laptop.rotation.y = (1 - turn) * -0.75 + mx * 0.25;
  laptop.rotation.x = my * 0.06;
  laptop.position.y = Math.sin(t / 1400) * 0.03;
  // camera: starts high and wide (laptop sits under the headline), dollies in to fill the frame
  const z = ease((sp - 0.12) / 0.3);
  camera.position.set(0, 3.4 - z * 1.7, 9.5 - z * 4.2);
  camera.lookAt(0, 0.9 + z * 0.35 - (1 - z) * 1.3, 0);
  paint(Math.max(0, (sp - 0.3) / 0.7) * imgs.length);
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
canvas.classList.add('on');
