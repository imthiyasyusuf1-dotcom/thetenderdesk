import * as THREE from 'three';
import {GLTFLoader} from './js/GLTFLoader.js';
import {RoomEnvironment} from './js/RoomEnvironment.js';

const PHONE = Math.min(innerWidth, innerHeight) < 700 || matchMedia('(pointer:coarse)').matches && innerWidth < 900;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const sm = (a, b, v) => { const t = cl((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;

/* ---------------- renderer ---------------- */
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'high-performance'});
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
let DPR = Math.min(devicePixelRatio || 1, PHONE ? 1.6 : 1.75);
renderer.setPixelRatio(DPR);
const scene = new THREE.Scene(); window.__scene = scene;
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.03, 300);
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 7, 5); scene.add(key);
const rimL = new THREE.DirectionalLight(0xbcd2ff, 1.2); rimL.position.set(-5, 3, -6); scene.add(rimL);
const hemi = new THREE.HemisphereLight(0xffffff, 0x222228, .35); scene.add(hemi);

/* ---------------- helpers: canvas textures ---------------- */
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const radial = (stops) => ctex(256, 256, (g, w, h) => { const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => r.addColorStop(s[0], s[1])); g.fillStyle = r; g.fillRect(0, 0, w, h); });
const additive = (o = {}) => new THREE.MeshBasicMaterial(Object.assign({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false}, o));

/* ---------------- world: floor, shadow, rings, grid ---------------- */
const world = new THREE.Group(); scene.add(world);
const poolMat = new THREE.MeshBasicMaterial({map: radial([[0, 'rgba(255,255,255,.55)'], [.35, 'rgba(255,255,255,.18)'], [1, 'rgba(255,255,255,0)']]), transparent: true, depthWrite: false, toneMapped: false});
const pool = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.y = -0.002; world.add(pool);
const shadowMat = new THREE.MeshBasicMaterial({map: radial([[0, 'rgba(0,0,0,.92)'], [.45, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false});
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 5.6), shadowMat); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; world.add(shadow);
const glowMat = additive({map: radial([[0, 'rgba(170,205,255,1)'], [.3, 'rgba(120,170,255,.45)'], [1, 'rgba(80,120,255,0)']]), opacity: 0});
const glow = new THREE.Mesh(new THREE.PlaneGeometry(7, 9), glowMat); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.004; world.add(glow);
const dustMat = additive({map: ctex(256, 256, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, w * .28, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(.55, 'rgba(220,230,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); }), opacity: 0});
const dust = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), dustMat); dust.rotation.x = -Math.PI / 2; dust.position.y = 0.006; world.add(dust);
// turntable ring with degree ticks
const ringTex = ctex(1024, 1024, (g, w) => { g.translate(w / 2, w / 2); g.strokeStyle = 'rgba(20,20,24,.55)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, w * .46, 0, 7); g.stroke(); for (let i = 0; i < 360; i += 2) { const L = i % 30 === 0 ? 26 : i % 10 === 0 ? 14 : 7; g.save(); g.rotate(i * D2R); g.fillStyle = i % 30 === 0 ? 'rgba(20,20,24,.75)' : 'rgba(20,20,24,.35)'; g.fillRect(-1, -w * .46 - L, 2, L); g.restore(); } });
const ringMat = new THREE.MeshBasicMaterial({map: ringTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false});
const ring = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.4), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.003; world.add(ring);
// moving grid
const gridTex = ctex(512, 512, (g, w) => { g.strokeStyle = 'rgba(160,190,230,.5)'; g.lineWidth = 2; g.strokeRect(0, 0, w, w); g.strokeStyle = 'rgba(160,190,230,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, w); g.moveTo(0, w / 2); g.lineTo(w, w / 2); g.stroke(); });
gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping; gridTex.repeat.set(24, 24);
const gridMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: {map: {value: gridTex}, uOp: {value: 0}, uOff: {value: new THREE.Vector2()}},
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform sampler2D map;uniform float uOp;uniform vec2 uOff;varying vec2 vUv;void main(){vec4 c=texture2D(map,vUv*24.+uOff);float r=length(vUv-.5)*2.;gl_FragColor=vec4(c.rgb,c.a*uOp*smoothstep(1.,.15,r));}'});
const grid = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), gridMat); grid.rotation.x = -Math.PI / 2; grid.position.y = 0.001; world.add(grid);

/* speed lines for flight */
const SL = PHONE ? 110 : 260;
const slPos = new Float32Array(SL * 6), slSeed = [];
for (let i = 0; i < SL; i++) slSeed.push({x: (Math.random() - .5) * 26, y: (Math.random() - .3) * 14, z: (Math.random() - .5) * 70, l: .6 + Math.random() * 3.2});
const slGeo = new THREE.BufferGeometry(); slGeo.setAttribute('position', new THREE.BufferAttribute(slPos, 3));
const slMat = new THREE.LineBasicMaterial({color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false});
const speedLines = new THREE.LineSegments(slGeo, slMat); speedLines.frustumCulled = false; world.add(speedLines);

/* ---------------- car rig ---------------- */
const rig = new THREE.Group(); scene.add(rig);           // lift / heading / bank
rig.rotation.order = 'YXZ';
const model = new THREE.Group(); model.position.z = -0.24; rig.add(model);   // car space (nose +Z)

/* thrusters */
const jetMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: {uOp: {value: 0}, uT: {value: 0}},
  vertexShader: 'varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader: 'uniform float uOp,uT;varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){float f=abs(dot(vN,vV));float y=vUv.y;float a=pow(y,2.2)*pow(f,1.8)*(.8+.2*sin(uT*70.+y*24.))*.7;vec3 c=mix(vec3(.3,.5,1.),vec3(1.),pow(y,4.));gl_FragColor=vec4(c*1.4,a*uOp);}'});
const jets = new THREE.Group(); model.add(jets);
const jetGeo = new THREE.CylinderGeometry(.24, .07, .9, 28, 1, true); jetGeo.translate(0, -.45, 0);   // wide end at the nozzle, tip below
const jetHalo = new THREE.SpriteMaterial({map: radial([[0, 'rgba(200,220,255,.8)'], [.25, 'rgba(120,160,255,.3)'], [1, 'rgba(80,120,255,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false});
const nozMat = additive({map: radial([[0, 'rgba(255,255,255,1)'], [.25, 'rgba(190,215,255,.8)'], [1, 'rgba(120,160,255,0)']]), opacity: 0});
[[.72, 1.42], [-.72, 1.42], [.72, -1.3], [-.72, -1.3]].forEach(([x, z]) => {
  const j = new THREE.Mesh(jetGeo, jetMat); j.position.set(x, .16, z); j.scale.set(1, 1, 1); jets.add(j);
  const n = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), nozMat); n.rotation.x = -Math.PI / 2; n.position.set(x, .1, z); jets.add(n);
  const hs = new THREE.Sprite(jetHalo); hs.position.set(x, -.05, z); hs.scale.set(.9, 1.4, 1); jets.add(hs);
});

/* headlight beams */
const beamMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: {uOp: {value: 0}},
  vertexShader: 'varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader: 'uniform float uOp;varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){float f=pow(abs(dot(vN,vV)),1.5);float a=pow(vUv.y,2.2)*f*.5;gl_FragColor=vec4(vec3(.85,.92,1.)*a*uOp,1.);}'});
const beamGeo = new THREE.ConeGeometry(.9, 6, 32, 1, true); beamGeo.translate(0, -3, 0); beamGeo.rotateX(-Math.PI / 2);
const beams = new THREE.Group(); model.add(beams);
[.42, -.42].forEach(x => { const b = new THREE.Mesh(beamGeo, beamMat); b.position.set(x, .47, 2.2); b.rotation.x = .05; beams.add(b); });

/* light blade across the nose */
const bladeTex = ctex(1024, 64, (g, w, h) => { const lg = g.createLinearGradient(0, 0, w, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.08, 'rgba(210,228,255,.9)'); lg.addColorStop(.5, 'rgba(255,255,255,1)'); lg.addColorStop(.92, 'rgba(210,228,255,.9)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(0, 0, w, h); const vg = g.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, 'rgba(0,0,0,1)'); vg.addColorStop(.42, 'rgba(0,0,0,0)'); vg.addColorStop(.58, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = vg; g.fillRect(0, 0, w, h); });
const bladeMat = additive({map: bladeTex, opacity: 0, side: THREE.DoubleSide});
const blade = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .12), bladeMat); blade.position.set(0, .438, 2.262); model.add(blade);
const haloMat = new THREE.SpriteMaterial({map: radial([[0, 'rgba(235,242,255,.95)'], [.12, 'rgba(190,212,255,.45)'], [.4, 'rgba(120,160,255,.12)'], [1, 'rgba(100,140,255,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false});
const halos = [.42, -.42, 0].map(x => { const s = new THREE.Sprite(haloMat); s.position.set(x, .45, 2.3); s.scale.setScalar(x ? 1.1 : 2.2); model.add(s); return s; });
const lpoolMat = additive({map: radial([[0, 'rgba(200,220,255,.55)'], [.4, 'rgba(160,190,255,.18)'], [1, 'rgba(120,160,255,0)']]), opacity: 0});
const lpool = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), lpoolMat); lpool.rotation.x = -Math.PI / 2; lpool.position.set(0, .008, 4.6); model.add(lpool);
const tailHaloMat = new THREE.SpriteMaterial({map: radial([[0, 'rgba(255,120,110,.95)'], [.15, 'rgba(255,40,30,.45)'], [1, 'rgba(255,0,0,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false});
[.5, -.5, 0].forEach(x => { const s = new THREE.Sprite(tailHaloMat); s.position.set(x, .712, -2.0); s.scale.setScalar(x ? .9 : 1.6); model.add(s); });

/* tail light trails */
const trailMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: {uOp: {value: 0}, uT: {value: 0}},
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform float uOp,uT;varying vec2 vUv;void main(){float e=1.-abs(vUv.x-.5)*2.;float a=pow(e,2.)*pow(1.-vUv.y,1.4)*(.75+.25*sin(vUv.y*40.+uT*30.));gl_FragColor=vec4(vec3(1.,.12,.1)*a*uOp*1.6,1.);}'});
const trails = new THREE.Group(); model.add(trails);
[.72, -.72, .3, -.3].forEach((x, i) => { const g = new THREE.PlaneGeometry(i < 2 ? .07 : .04, 14); g.rotateX(-Math.PI / 2); g.translate(0, 0, -7); const m = new THREE.Mesh(g, trailMat); m.position.set(x, i < 2 ? .712 : .47, -1.98); trails.add(m); });

/* aero streamlines (car space) */
const prof = [[7, .38], [2.5, .42], [2.3, .5], [1.9, .7], [1.4, .88], [.9, 1.0], [.2, 1.12], [-.4, 1.16], [-.9, 1.06], [-1.5, .96], [-2.05, 1.08], [-2.7, .98], [-8, .9]];
function profY(z) { for (let i = 0; i < prof.length - 1; i++) { const a = prof[i], b = prof[i + 1]; if (z <= a[0] && z >= b[0]) { const t = (a[0] - z) / (a[0] - b[0]); const s = t * t * (3 - 2 * t); return lerp(a[1], b[1], s); } } return .9; }
const AL = PHONE ? 26 : 44, AS = 140;
const aPos = new Float32Array(AL * AS * 3), aT = new Float32Array(AL * AS), aSeed = new Float32Array(AL * AS), aIdx = [];
for (let l = 0; l < AL; l++) {
  const side = l % 4 === 3; const sx = (Math.random() * 2 - 1); const off = .04 + Math.pow(Math.random(), 2.4) * .45; const seed = Math.random();
  for (let s = 0; s < AS; s++) {
    const t = s / (AS - 1), z = lerp(6.5, -7.5, t), k = (l * AS + s);
    let x, y;
    if (!side) { x = sx * 1.0; const fall = 1 - Math.pow(Math.abs(x) / 1.15, 4) * .45; y = profY(z) * fall + off; }
    else { const sg = sx < 0 ? -1 : 1; const bump = Math.exp(-Math.pow(z / 2.4, 4)); x = sg * (1.05 + Math.abs(sx) * .35 + bump * .22); y = .25 + off * .9; }
    aPos[k * 3] = x; aPos[k * 3 + 1] = y; aPos[k * 3 + 2] = z; aT[k] = t; aSeed[k] = seed;
    if (s < AS - 1) aIdx.push(k, k + 1);
  }
}
const aGeo = new THREE.BufferGeometry(); aGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3)); aGeo.setAttribute('aT', new THREE.BufferAttribute(aT, 1)); aGeo.setAttribute('aS', new THREE.BufferAttribute(aSeed, 1)); aGeo.setIndex(aIdx);
const aeroMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: {uOp: {value: 0}, uT: {value: 0}},
  vertexShader: 'attribute float aT;attribute float aS;varying float vT;varying float vS;void main(){vT=aT;vS=aS;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform float uOp,uT;varying float vT;varying float vS;void main(){float p=fract(vT*2.2-uT*.45+vS);float pulse=pow(smoothstep(.0,.9,p)*smoothstep(1.,.9,p),2.);float e=smoothstep(.04,.3,vT)*smoothstep(1.,.85,vT);float a=(.12+pulse*.95)*e*uOp;gl_FragColor=vec4(mix(vec3(.35,.75,1.),vec3(1.),pulse)*a,1.);}'});
const aero = new THREE.LineSegments(aGeo, aeroMat); aero.frustumCulled = false; model.add(aero);

/* battery pack (car space) */
const COLS = 12, ROWS = 22;
const cellGeo = new THREE.BoxGeometry(.1, .065, .075);
const aG = new Float32Array(COLS * ROWS * 2);
const batMat = new THREE.ShaderMaterial({transparent: true, uniforms: {uOp: {value: 0}, uT: {value: 0}, uWave: {value: 0}, uCharge: {value: 0}},
  vertexShader: 'attribute vec2 aG;varying vec3 vN;varying vec2 vG;varying vec3 vP;void main(){vG=aG;vP=position;vN=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform float uOp,uT,uWave,uCharge;varying vec3 vN;varying vec2 vG;varying vec3 vP;void main(){float l=.35+.65*max(dot(vN,normalize(vec3(.3,1.,.4))),0.);vec3 c=vec3(.11,.14,.18)*l;float top=step(.03,vP.y);c+=top*vec3(.03,.05,.07);float w=fract(uT*.32);float d=vG.y-w;float g=exp(-d*d*90.)*uWave;c+=vec3(.35,.8,1.)*g*1.6;float ch=smoothstep(vG.y-.02,vG.y+.02,uCharge);c=mix(c,vec3(.45,1.,.72)*(.6+.4*l)+top*.2,ch*.85);float edge=max(step(.045,abs(vP.x)),step(.033,abs(vP.z)));c+=edge*vec3(.15,.3,.4)*(.4+g);gl_FragColor=vec4(c,uOp);}'});
const cells = new THREE.InstancedMesh(cellGeo, batMat, COLS * ROWS);
{ const m = new THREE.Matrix4(); let i = 0; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { m.makeTranslation((c - (COLS - 1) / 2) * .118, 0, (r - (ROWS - 1) / 2) * .09 + .05); cells.setMatrixAt(i, m); aG[i * 2] = c / (COLS - 1); aG[i * 2 + 1] = r / (ROWS - 1); i++; } }
cellGeo.setAttribute('aG', new THREE.InstancedBufferAttribute(aG, 2));
const pack = new THREE.Group(); pack.add(cells);
const caseMat = new THREE.LineBasicMaterial({color: 0x7fd8ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false});
const caseL = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, .12, 2.12)), caseMat); caseL.position.z = .05; pack.add(caseL);
model.add(pack);

/* motors (car space) */
const motors = new THREE.Group(); model.add(motors);
const metal = new THREE.MeshStandardMaterial({color: 0xa7adb4, metalness: 1, roughness: .32});
const copper = new THREE.MeshStandardMaterial({color: 0xd2763a, metalness: 1, roughness: .35});
const mGlow = additive({color: 0x66d9ff, opacity: 0});
const rotors = [];
function motor(x, z, flip) {
  const g = new THREE.Group(); g.position.set(x, .384, z);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .32, 40, 1), metal); st.rotation.z = Math.PI / 2; g.add(st);
  for (let i = 0; i < 5; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(.172, .014, 8, 48), copper); t.rotation.y = Math.PI / 2; t.position.x = -.12 + i * .06; g.add(t); }
  const rot = new THREE.Group(); rot.position.x = (flip ? -1 : 1) * .17; g.add(rot); rotors.push(rot);
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.012, .2, .03), metal); b.rotation.x = i * Math.PI / 6; rot.add(b); }
  const gr = new THREE.Mesh(new THREE.TorusGeometry(.13, .006, 6, 64), mGlow); gr.rotation.y = Math.PI / 2; gr.position.x = (flip ? -1 : 1) * .172; g.add(gr);
  g.scale.setScalar(.001); motors.add(g); return g;
}
const motorList = [motor(0, 1.486, false), motor(.36, -1.314, false), motor(-.36, -1.314, true)];
motorList[0].scale.set(1, 1, 1); motorList[0].children[0].scale.set(1, 1.4, 1);

/* floating display (car space) */
const scrTex = ctex(1024, 620, (g, w, h) => {
  const rr = (x, y, ww, hh, r) => { g.beginPath(); g.roundRect(x, y, ww, hh, r); };
  rr(0, 0, w, h, 34); g.fillStyle = '#0c0e12'; g.fill();
  g.save(); rr(0, 0, w, h, 34); g.clip();
  const mg = g.createLinearGradient(w * .42, 0, w, h); mg.addColorStop(0, '#16202c'); mg.addColorStop(1, '#0d131b'); g.fillStyle = mg; g.fillRect(w * .42, 0, w, h);
  g.strokeStyle = 'rgba(120,150,190,.18)'; g.lineWidth = 3; for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(w * .42 + i * 48, 0); g.lineTo(w * .42 + i * 48 - 160, h); g.stroke(); }
  g.strokeStyle = '#3e8bff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * .62, h * .92); g.bezierCurveTo(w * .66, h * .6, w * .86, h * .55, w * .8, h * .14); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(w * .62, h * .9, 14, 0, 7); g.fill();
  g.restore();
  g.fillStyle = '#fff'; g.font = '200 170px Inter, sans-serif'; g.fillText('0', 60, 250);
  g.font = '500 26px Inter, sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('MPH', 64, 296);
  g.font = '400 30px Inter, sans-serif'; g.fillStyle = '#fff'; g.fillText('P  R  N  D', 64, 380);
  g.fillStyle = 'rgba(255,255,255,.12)'; rr(60, 450, 290, 14, 7); g.fill(); g.fillStyle = '#6ff0b4'; rr(60, 450, 262, 14, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '400 28px Inter, sans-serif'; g.fillText('300 mi', 60, 515);
  g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '500 30px Inter, sans-serif'; g.fillText('Navigate', w * .47, 70);
});
const screenM = new THREE.Mesh(new THREE.PlaneGeometry(.62, .375), new THREE.MeshBasicMaterial({map: scrTex, toneMapped: false, transparent: true, opacity: 0}));
screenM.position.set(0, .9, .9); screenM.rotation.set(-.22, Math.PI, 0); model.add(screenM);

/* charge port glow (car space) */
const portMat = additive({map: radial([[0, 'rgba(180,255,220,1)'], [.3, 'rgba(110,240,180,.55)'], [1, 'rgba(110,240,180,0)']]), opacity: 0});
const port = new THREE.Mesh(new THREE.PlaneGeometry(.6, .6), portMat); port.position.set(.985, .62, -1.3); port.rotation.y = Math.PI / 2; model.add(port);

/* sensors (world) */
const sensors = new THREE.Group(); world.add(sensors);
const sRings = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(1, 1.025, 160), additive({color: 0x7fd8ff, opacity: 0, side: THREE.DoubleSide})); m.rotation.x = -Math.PI / 2; m.position.y = .01; sensors.add(m); sRings.push(m); }
const sweepMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: {uOp: {value: 0}},
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform float uOp;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p)*2.;float an=atan(p.y,p.x);float a=smoothstep(.0,.55,an+1.57)*smoothstep(1.,.2,r)*(1.-step(1.,r));gl_FragColor=vec4(vec3(.45,.85,1.)*a*.35*uOp,1.);}'});
const sweep = new THREE.Mesh(new THREE.CircleGeometry(11, 64, 0, .55), sweepMat); sweep.rotation.x = -Math.PI / 2; sweep.position.y = .012; sensors.add(sweep);
const frPts = [];
const cams = [[0, .9, 2, 0, 20, 30], [0, 1.1, .6, 0, 50, 22], [0, 1.1, .6, 0, 120, 14], [1, .95, .4, 70, 70, 14], [-1, .95, .4, -70, 70, 14], [1, .95, -.6, 125, 70, 12], [-1, .95, -.6, -125, 70, 12], [0, .95, -1.9, 180, 70, 12]];
cams.forEach(([x, y, z, yaw, fov, far]) => { const o = new THREE.Vector3(x, y, z - .24); const hw = Math.tan(fov / 2 * D2R) * far, hh = hw * .35; const cs = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([a, b]) => new THREE.Vector3(a, b, far).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw * D2R).add(o)); cs.forEach((c, i) => { frPts.push(o.clone(), c, c, cs[(i + 1) % 4]); }); });
const frMat = new THREE.LineBasicMaterial({color: 0x7fd8ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false});
sensors.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(frPts), frMat));
const objs = [[0, 11, 1.9, 1.4, 4.4, 'o1'], [-4.2, 7, .6, 1.75, .6, 'o2'], [4.6, 2.5, .6, 1.7, 1.8, 'o3'], [0, -9, 1.9, 1.4, 4.4, 'o4']];
const boxMat = new THREE.LineBasicMaterial({color: 0x9fe7ff, transparent: true, opacity: 0, depthWrite: false, toneMapped: false});
const objBoxes = objs.map(([x, z, w, h, d]) => { const b = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), boxMat); b.position.set(x, h / 2, z); sensors.add(b); return b; });

/* sound ring */
const SB = PHONE ? 72 : 128;
const sbMat = additive({color: 0xffffff, opacity: 0});
const sBars = new THREE.InstancedMesh(new THREE.BoxGeometry(.035, 1, .035).translate(0, .5, 0), sbMat, SB); sBars.frustumCulled = false; world.add(sBars);

/* ---------------- load the car ---------------- */
const parts = {}; let car = null;
const fadeable = [], ghosts = [], paintMats = [], interiorM = [];
const ghostMat = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: {uOp: {value: 0}, uCol: {value: new THREE.Color(0x5cc8ff)}},
  vertexShader: 'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader: 'uniform float uOp;uniform vec3 uCol;varying vec3 vN;varying vec3 vV;void main(){float f=1.-abs(dot(normalize(vN),vV));f=pow(f,2.2);gl_FragColor=vec4(uCol*(f*1.1+.035)*uOp,1.);}'});
const glassMat = new THREE.MeshPhysicalMaterial({color: 0x16181d, metalness: 0, roughness: .04, transparent: true, opacity: .62, side: THREE.DoubleSide, envMapIntensity: 1.6, clearcoat: 1, depthWrite: false});
const paint = {cur: new THREE.Color('#e7e6e2'), tgt: new THREE.Color('#e7e6e2'), metal: .15, mt: .15};
const mats = {};
const base = {};

const pb = $('#pb'), pc = $('#pc');
new GLTFLoader().load('models/roadster.glb?v=5', gl => { car = gl.scene.getObjectByName('Roadster') || gl.scene; pb.style.transform = 'scaleX(1)'; pc.textContent = 100; setup(); },
  e => { if (e.total) { const f = e.loaded / e.total; pb.style.transform = `scaleX(${f})`; pc.textContent = Math.round(f * 100); } },
  err => console.warn('model load failed', err));

const upg = {};
function under(o, re) { while (o) { if (re.test(o.name)) return true; o = o.parent; } return false; }
function setup() {
  model.add(car);
  car.traverse(o => { if (o.name) parts[o.name] = o; });
  car.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = true;
    let m = o.material;
    if (m.name === 'Glass') { o.material = glassMat; m = glassMat; }
    else if (/^Paint 1|GlossBlack|RimFace|Carbon/.test(m.name)) { if (!upg[m.name]) upg[m.name] = new THREE.MeshPhysicalMaterial({name: m.name, color: m.color, metalness: m.metalness, roughness: m.roughness, emissive: m.emissive, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: 1.1}); o.material = m = upg[m.name]; }
    mats[m.name] = m;
    if (/^Paint 1/.test(m.name)) { m.color.copy(paint.cur); m.metalness = paint.metal; if (!paintMats.includes(m)) paintMats.push(m); }
    const isWheel = under(o, /^Wheel|^Axles/);
    if (isWheel) return;
    const isInt = /^Interior/.test(o.name) || under(o, /^Interior/);
    const rec = {mesh: o, orig: o.material, fade: null, int: isInt};
    if (o.material !== glassMat) { rec.fade = o.material.clone(); rec.fade.transparent = true; rec.fade.depthWrite = true; if (/^Paint 1/.test(o.material.name)) paintMats.push(rec.fade); }
    fadeable.push(rec);
    if (!isInt) { const gm = new THREE.Mesh(o.geometry, ghostMat); gm.visible = false; gm.matrixAutoUpdate = false; o.parent.add(gm); ghosts.push({g: gm, m: o}); }
  });
  ['InteriorSeatsColor1', 'InteriorSeatsColor2', 'InteriorSeatsFrame1', 'InteriorSeatsFrame2', 'InteriorCage', 'InteriorPillar', 'BodyRoofPanel', 'InteriorRearHatch', 'BodyRearwindow', 'BodyPillars', 'BodyCanopyTrim'].forEach(n => { const o = parts[n]; if (o) o.traverse(m => { if (m.isMesh) { cabMeshes.push(m); cabSet.add(m); } }); });
  // headlights / taillights
  ['Headlight', 'Brakelight', 'Signallight', 'Dashboard'].forEach(n => { const m = mats[n]; if (m) { m.emissive = m.emissive || new THREE.Color(); m.toneMapped = true; } });
  if (mats.Headlight) mats.Headlight.emissive.set('#eaf2ff');
  if (mats.Brakelight) mats.Brakelight.emissive.set('#e00a00');
  if (mats.Signallight) mats.Signallight.emissive.set('#ff9a2a');
  ['BodyDoorLColor1', 'BodyDoorRColor1', 'BodyHood', 'BodyRearPanelsColor1', 'BodyRoofPanel', 'BodyWindshield', 'BodyWindshieldGasket', 'BodyWindshieldWipers', 'BodyWindshieldWipersBase', 'BodyPillars', 'BodyPanelsColor2', 'WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR'].forEach(n => { const o = parts[n]; if (o) base[n] = {p: o.position.clone(), r: o.rotation.clone()}; });
  // wheel sub parts
  wheels = ['WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR'].map(n => { const w = parts[n]; const kids = w.children.slice(); const find = re => kids.find(k => re.test(k.name)); const rim = find(/Rim$/), pad = find(/BrakePad$/), disc = find(/BrakeDisc$/); const tyre = kids.find(k => k !== rim && k !== pad && k !== disc); return {w, rim, pad, disc, tyre, side: w.position.x > 0 ? 1 : -1, bp: {rim: rim.position.clone(), pad: pad.position.clone(), disc: disc.position.clone(), tyre: tyre.position.clone()}}; });
  // warm up both material sets so later swaps never stall
  fadeable.forEach(f => { if (f.fade) f.mesh.material = f.fade; }); ghosts.forEach(g => g.g.visible = true);
  pack.visible = motors.visible = aero.visible = sensors.visible = sBars.visible = true;
  renderer.compile(scene, camera);
  fadeable.forEach(f => f.mesh.material = f.orig); ghosts.forEach(g => g.g.visible = false);
  renderer.compile(scene, camera);
  ready();
}
let wheels = [];
const cabMeshes = [], cabSet = new Set();

/* ---------------- chapters ---------------- */
const D = {az: 30, el: 8, dist: 9, tx: 0, ty: .55, tz: 0, fov: 32, shift: 0, shY: 0, carY: 0, ry: 0, rx: 0, rz: 0, bob: 0, thrust: 0, doors: 0, hood: 0, hatch: 0, roof: 0, glass: 1, ghost: 0, interior: 1, explode: 0, wexp: 0, spin: 0, lights: 0, brake: 0, battery: 0, wave: 0, charge: 0, motors: 0, sensors: 0, aero: 0, speed: 0, grid: 0, floor: 1, shadow: 1, ring: 0, screen: 0, beams: 0, trails: 0, env: 1, expo: 1, sky: 0, clouds: 0, cloudY: 0, road: 0, title: 0, sound: 0, port: 0, rimLight: 1, bg: '#0d0d10', floorCol: '#ffffff', lt: 0, cab: 0};
const CH = {
  hero: {h: 260, base: {bg: '#0c0c10', title: 1, floor: .8, floorCol: '#8e98ad', thrust: 1, bob: 1, env: .9, lights: .6},
    keys: [{p: 0, az: 32, el: 4, dist: 8, ty: .75, carY: .7, shY: -.2}, {p: .55, az: 18, el: 5, dist: 7.6, carY: 1.25, rx: -3, rz: 3, title: .35, shY: -.1}, {p: 1, az: 0, el: 3, dist: 8.6, ty: 2.1, carY: 2.2, rx: -4, rz: -2, title: 0, shY: 0, floor: .2}]},
  flight: {h: 320, base: {bg: '#3a2a3a', sky: 1, clouds: 1, floor: 0, shadow: 0, speed: 1, thrust: 1, bob: .6, env: 1.15, carY: 2.2, ty: 2.25, lights: .6},
    keys: [{p: 0, az: 150, el: 10, dist: 10, rz: -7, ry: 6, cloudY: 0, shift: .16, shY: .2}, {p: .5, az: 120, el: 8, dist: 9, rz: 8, ry: -8, rx: 2, cloudY: .5, shift: .17, shY: .2}, {p: 1, az: 72, el: 12, dist: 9.6, rz: -4, ry: 4, cloudY: 1, speed: 1.6, shift: .17, shY: .2}]},
  turn: {h: 400, base: {bg: '#e8e9eb', lt: 1, floor: 1, floorCol: '#ffffff', ring: 1, env: 1.25, expo: 1.05, rimLight: .5},
    keys: [{p: 0, carY: 1.6, thrust: .8, az: 32, el: 18, dist: 11.5, ty: .6, shift: .2, shY: .02}, {p: .2, carY: 0, thrust: 0, ry: 0, el: 15, dist: 11}, {p: 1, ry: 360, az: 32, el: 14, dist: 10.6, shift: .2, shY: .02}]},
  perf: {h: 340, base: {bg: '#0a0b0e', grid: 1, spin: 45, floor: .35, floorCol: '#6a7a96', env: .9, lights: 1},
    keys: [{p: 0, az: 92, el: 4, dist: 9.6, ty: .62, shift: .06, shY: .36}, {p: 1, az: 80, el: 2, dist: 8.8, rx: -1.2, shift: .06, shY: .36}]},
  lights: {h: 280, base: {bg: '#050507', floor: .2, floorCol: '#9fb4d6', env: .35, expo: .9, rimLight: .3},
    keys: [{p: 0, az: 4, el: 4, dist: 5.6, ty: .55, tz: 1.2, lights: 0, beams: 0, shift: .2}, {p: .35, lights: 1, beams: 1}, {p: 1, az: -26, el: 8, dist: 6, lights: 1, beams: 1, shift: .2}]},
  aero: {h: 340, base: {bg: '#071019', aero: 1, floor: .25, floorCol: '#5b8bb5', env: .55, lights: 1, expo: .95},
    keys: [{p: 0, az: 90, el: 5, dist: 11.2, ty: .6, shift: .1, shY: -.1}, {p: .5, az: 66, el: 20, dist: 10.8}, {p: 1, az: 112, el: 9, dist: 10.6, shift: .1, shY: -.1}]},
  wheels: {h: 400, base: {bg: '#0f1013', floor: .45, floorCol: '#8a93a4', env: 1},
    keys: [{p: 0, az: 76, el: 3, dist: 4.2, tx: .95, ty: .4, tz: 1.25, spin: 30, shift: .24}, {p: .32, spin: 0, az: 60}, {p: .42, wexp: 0}, {p: .82, wexp: 1, az: 38, el: 12, dist: 6, tx: 1.85, tz: 1.25, shift: .26, shY: -.14, rimLight: 2}, {p: 1, wexp: 1, az: 32, el: 14, dist: 6.2, tx: 1.85, tz: 1.25, shift: .26, shY: -.14, rimLight: 2}]},
  doors: {h: 320, base: {bg: '#dcdde0', lt: 1, floor: 1, floorCol: '#ffffff', env: 1.25, rimLight: .5},
    keys: [{p: 0, az: 44, el: 8, dist: 8.8, ty: .6, doors: 0, shift: -.12}, {p: .6, doors: 1}, {p: 1, az: 26, el: 14, dist: 8.2, doors: 1, shift: -.12}]},
  roof: {h: 340, base: {bg: '#e1e4e8', lt: 1, floor: 1, floorCol: '#ffffff', env: 1.25, rimLight: .5},
    keys: [{p: 0, az: 24, el: 30, dist: 10, ty: .6, roof: 0, shift: .14}, {p: .5, az: 4, el: 62, dist: 9, roof: 1, ty: 1}, {p: 1, az: -18, el: 74, dist: 9.4, roof: 1, glass: .5, ty: 1, shift: .14}]},
  cockpit: {h: 380, base: {bg: '#0e1013', road: 0, floor: .3, env: 1, lights: 1, glass: .35, fov: 40},
    keys: [{p: 0, az: 180, el: 22, dist: 6.5, tx: 0, ty: .8, tz: .9, fov: 32}, {p: .3, cab: 0}, {p: .42, dist: 1.15, el: 9, ty: .86, tz: 1.0, fov: 52, cab: 1}, {p: .55, screen: 1}, {p: 1, screen: 1, cab: 1, dist: 1.05, el: 7, ty: .86, tz: 1.0, az: 186, fov: 54}]},
  seats: {h: 300, base: {bg: '#121317', roof: 1, ghost: .7, floor: .4, floorCol: '#8e98ad', env: 1},
    keys: [{p: 0, az: 140, el: 42, dist: 8.8, ty: .6, shift: -.2, shY: .04}, {p: 1, az: 215, el: 54, dist: 8.2, shift: -.2, shY: .04}]},
  battery: {h: 420, base: {bg: '#05070a', ghost: 1, interior: 0, battery: 1, wave: 1, floor: .25, floorCol: '#4fb6ff', env: .5, shadow: .5},
    keys: [{p: 0, az: 52, el: 28, dist: 10.4, battery: 0, ghost: .4, shift: .16, shY: .05}, {p: .25, ghost: 1, battery: 1}, {p: .6, az: 22, el: 50, dist: 9.2}, {p: 1, az: -28, el: 40, dist: 9.6, shift: .16, shY: .05}]},
  motors: {h: 380, base: {bg: '#05070a', ghost: 1, interior: 0, battery: 1, wave: .5, motors: 1, spin: 10, floor: .25, floorCol: '#4fb6ff', env: .6, shadow: .4},
    keys: [{p: 0, az: -30, el: 30, dist: 8.6, motors: 0, explode: 0, shift: -.14}, {p: .3, motors: 1}, {p: .75, explode: 1, az: -52, el: 24, dist: 11.6, shift: -.12}, {p: 1, explode: 1, az: -68, el: 22, dist: 11.8, shift: -.12}]},
  charge: {h: 340, base: {bg: '#05080a', ghost: 1, interior: 0, battery: 1, wave: .2, port: 1, floor: .25, floorCol: '#6ff0b4', env: .55, shadow: .5},
    keys: [{p: 0, az: 120, el: 24, dist: 8.6, charge: 0, shift: .14}, {p: .85, charge: 1}, {p: 1, az: 150, el: 20, dist: 8, charge: 1, shift: .14}]},
  auto: {h: 380, base: {bg: '#030507', sensors: 1, grid: .55, floor: 0, lights: 1, env: .4, expo: .9, shadow: .6},
    keys: [{p: 0, az: 10, el: 58, dist: 24, ty: 0, tz: 1, shift: .14}, {p: .5, az: -40, el: 66, dist: 28}, {p: 1, az: -95, el: 34, dist: 21, shift: .14}]},
  tail: {h: 300, base: {bg: '#050405', brake: 1, lights: 1, floor: .25, floorCol: '#ff5a4d', env: .55, expo: 1, rimLight: 1.2},
    keys: [{p: 0, az: 182, el: 7, dist: 8.6, ty: .72, trails: 0, shift: -.17}, {p: .4, trails: 1}, {p: 1, az: 204, el: 4, dist: 7.8, trails: 1, shift: -.17}]},
  storage: {h: 320, base: {bg: '#e5e6e9', lt: 1, floor: 1, floorCol: '#ffffff', env: 1.25, rimLight: .5},
    keys: [{p: 0, az: 150, el: 20, dist: 11, ty: .6, shift: .25, shY: -.06}, {p: .38, hatch: 1}, {p: .6, az: 110}, {p: .78, hood: 1}, {p: 1, az: 52, el: 22, dist: 11.4, hood: 1, hatch: 1, shift: .25, shY: -.06}]},
  sound: {h: 300, base: {bg: '#0b0b0d', sound: 1, floor: .5, floorCol: '#8e98ad', env: .9, lights: 1},
    keys: [{p: 0, az: 30, el: 28, dist: 14.5, shift: .2}, {p: 1, az: -24, el: 18, dist: 13.4, shift: .2}]},
  config: {h: 300, base: {bg: '#f1f1f2', lt: 1, floor: 1, floorCol: '#ffffff', ring: .35, env: 1.3, rimLight: .5},
    keys: [{p: 0, az: 36, el: 10, dist: 10, ty: .55, ry: 0, shY: .1}, {p: 1, az: 36, el: 12, dist: 9.6, ry: 50, shY: .1}]},
  reserve: {h: 230, base: {bg: '#0b0b0d', thrust: 1, bob: 1, carY: .8, floor: .8, floorCol: '#8e98ad', env: .9, lights: 1},
    keys: [{p: 0, az: 4, el: 3, dist: 12, ty: .9, shY: .2}, {p: 1, az: -18, el: 6, dist: 11.4, shY: .2}]}
};
const NUM = Object.keys(D).filter(k => typeof D[k] === 'number');
for (const k in CH) { const c = CH[k]; let prev = Object.assign({}, D, c.base); c.K = c.keys.map(kf => { prev = Object.assign({}, prev, kf); return prev; }); }

const chs = $$('.ch').map(el => { const k = el.dataset.k; el.style.height = CH[k].h + 'vh'; return {el, k, def: CH[k], copy: $(`.cp[data-c="${k}"]`)}; });
const specEl = $('#spec');
function measure() { chs.forEach(c => { c.top = c.el.offsetTop; c.hh = c.el.offsetHeight; }); }

function sample(def, p) {
  const K = def.K; if (p <= K[0].p) return K[0];
  for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (p <= b.p) { const t = sm(a.p, b.p, p); const o = {}; for (const n of NUM) o[n] = a[n] + (b[n] - a[n]) * t; o.bg = a.bg; o.floorCol = a.floorCol; o.lt = a.lt; o.bgB = b.bg; o.bgT = t; return o; } }
  return K[K.length - 1];
}

/* ---------------- state ---------------- */
const S = Object.assign({}, D); const T = Object.assign({}, D);
const bgB = new THREE.Color(), bgC = new THREE.Color(D.bg), bgT = new THREE.Color(D.bg), flC = new THREE.Color('#fff'), flT = new THREE.Color('#fff');
const intro = {thr: 0, lift: 0, title: 0, cam: 1};
let active = chs[0], activeP = 0, scrollY = 0, time = 0, wAng = 0, mAng = 0;
const mouse = {x: 0, y: 0, sx: 0, sy: 0};
addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; } }, {passive: true});

/* ---------------- lenis ---------------- */
const lenis = new Lenis({lerp: .085, smoothWheel: true, wheelMultiplier: .9});
lenis.stop();
$$('[data-go]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const g = a.dataset.go; const t = g === 'spec' ? specEl : chs.find(c => c.k === g)?.el; if (t) lenis.scrollTo(t, {offset: g === 'spec' ? 0 : 2, duration: 2.4}); }));

/* ---------------- configurator ---------------- */
const PAINTS = [['Pearl White', '#e7e6e2', .15], ['Red Multi-Coat', '#8f0a14', .55], ['Stealth Grey', '#3a3d41', .6], ['Deep Blue', '#14295a', .65], ['Quicksilver', '#8e9398', .85], ['Diamond Black', '#060607', .5]];
const sw = $('#sw');
PAINTS.forEach((p, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', p[0]); b.style.background = `radial-gradient(circle at 35% 30%, ${p[1] === '#060607' ? '#4a4a4c' : '#ffffff55'}, ${p[1]} 60%)`; b.style.backgroundColor = p[1]; if (!i) b.classList.add('on'); b.onclick = () => { $$('#sw button').forEach(x => x.classList.remove('on')); b.classList.add('on'); paint.tgt.set(p[1]); paint.mt = p[2]; $('#cn').textContent = p[0]; $('#okc').textContent = p[0]; }; sw.appendChild(b); });
$('#rsv').onclick = () => { $('#rsv').textContent = 'Reserved'; $('#ok').style.opacity = 1; };

/* ---------------- sound ---------------- */
let actx = null, analyser = null, fData = null, playing = false;
$('#snd').onclick = () => {
  if (playing) return;
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  analyser = analyser || (() => { const a = actx.createAnalyser(); a.fftSize = 256; a.connect(actx.destination); fData = new Uint8Array(a.frequencyBinCount); return a; })();
  const t0 = actx.currentTime + .05, dur = 3.4;
  const out = actx.createGain(); out.gain.setValueAtTime(0, t0); out.gain.linearRampToValueAtTime(.32, t0 + .25); out.gain.setValueAtTime(.32, t0 + dur - .8); out.gain.linearRampToValueAtTime(0, t0 + dur); out.connect(analyser);
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 6; lp.frequency.setValueAtTime(300, t0); lp.frequency.exponentialRampToValueAtTime(5200, t0 + dur * .8); lp.connect(out);
  [[60, 1], [120.5, .55], [181, .25]].forEach(([f, g]) => { const o = actx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 15, t0 + dur * .85); const gg = actx.createGain(); gg.gain.value = g * .5; o.connect(gg).connect(lp); o.start(t0); o.stop(t0 + dur); });
  const n = actx.createBufferSource(); const buf = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = buf;
  const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .8; bp.frequency.setValueAtTime(400, t0); bp.frequency.exponentialRampToValueAtTime(3000, t0 + dur); const ng = actx.createGain(); ng.gain.setValueAtTime(0, t0); ng.gain.linearRampToValueAtTime(.25, t0 + dur * .7); ng.gain.linearRampToValueAtTime(0, t0 + dur); n.connect(bp).connect(ng).connect(out); n.start(t0); n.stop(t0 + dur);
  playing = true; $('#snd').classList.add('on'); setTimeout(() => { playing = false; $('#snd').classList.remove('on'); }, dur * 1000 + 100);
};

/* ---------------- dom refs ---------------- */
const bgEl = $('#bg'), ttl = $('#ttl'), skyEl = $('#sky'), cloudsEl = $('#clouds'), roadEl = $('#road');
const tagEls = {}; $$('.tag').forEach(t => tagEls[t.dataset.id] = t);
const ctrs = $$('[data-c="perf"] .ctr div');
const hA = $('#hA'), hS = $('#hS'), dg = $('#dg'), cg = $('#cg'), cgb = $('#cgb'), nm = $('#nm');
let lastLt = -1, lastBg = '';

/* ---------------- resize ---------------- */
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); measure(); }
addEventListener('resize', resize);

/* ---------------- frame ---------------- */
const v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), tgt = new THREE.Vector3();
const dummy = new THREE.Object3D();
function damp(a, b, l, dt) { return a + (b - a) * (1 - Math.exp(-l * dt)); }
function project(local, el, op) {
  if (op < .01) { if (el._o !== 0) { el.style.opacity = 0; el._o = 0; } return; }
  model.localToWorld(v3.copy(local)); v3.project(camera);
  if (v3.z > 1) { el.style.opacity = 0; el._o = 0; return; }
  const x = (v3.x * .5 + .5) * innerWidth, y = (-v3.y * .5 + .5) * innerHeight;
  el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; el.style.opacity = op.toFixed(3); el._o = op;
}
function worldProject(wp, el, op) { if (op < .01) { if (el._o !== 0) { el.style.opacity = 0; el._o = 0; } return; } v3.copy(wp).project(camera); const x = (v3.x * .5 + .5) * innerWidth, y = (-v3.y * .5 + .5) * innerHeight; op *= sm(90, 130, y) * (1 - sm(innerHeight - 70, innerHeight - 30, y)) * sm(10, 60, x) * (1 - sm(innerWidth - 230, innerWidth - 180, x)); el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; el.style.opacity = op.toFixed(3); el._o = op; }

let frames = 0, slowAcc = 0, slowN = 0, started = false;
function frame(dt) {
  time += dt; frames++;
  scrollY = lenis.scroll; const vh = innerHeight;
  // active chapter
  let ai = 0; for (let i = 0; i < chs.length; i++) if (chs[i].top <= scrollY + vh * .5) ai = i;
  const c = chs[ai]; const p = cl((scrollY - c.top) / Math.max(1, c.hh - vh));
  active = c; activeP = p;
  const t = sample(c.def, p);
  Object.assign(T, t);
  if (c.k === 'hero') { T.carY *= intro.lift; T.thrust *= intro.thr; T.title *= intro.title; T.dist += intro.cam * 2.2; T.el += intro.cam * 4; }
  if (c.k === 'config') { T.ry += mouse.sx * 14; }
  // damping
  const L = 4.2;
  for (const n of NUM) S[n] = damp(S[n], T[n], n === 'ry' && Math.abs(T.ry - S.ry) > 200 ? 1000 : L, dt);
  bgT.set(t.bg); if (t.bgB && t.bgT > 0) bgT.lerp(bgB.set(t.bgB), t.bgT);
  bgC.lerp(bgT, 1 - Math.exp(-3.4 * dt)); flT.set(t.floorCol); flC.lerp(flT, 1 - Math.exp(-3 * dt));
  const lt = T.lt > .5 ? 1 : 0; if (lt !== lastLt) { document.body.classList.toggle('lt', !!lt); lastLt = lt; }
  const bgHex = '#' + bgC.getHexString(); if (bgHex !== lastBg) { bgEl.style.backgroundColor = bgHex; lastBg = bgHex; }
  mouse.sx = damp(mouse.sx, mouse.x, 3, dt); mouse.sy = damp(mouse.sy, mouse.y, 3, dt);

  // camera
  const aspect = innerWidth / innerHeight;
  const fit = aspect < 1 ? Math.min(1.9, .88 / aspect) : (aspect < 1.4 ? 1.12 : 1);
  const az = (S.az + mouse.sx * 5) * D2R, el = (S.el - mouse.sy * 2.5) * D2R;
  const PM = {perf: 1.1, wheels: 1.1, aero: .86, doors: .86, hero: .92, flight: 1.08, auto: .78, reserve: .82, sound: .88, tail: .88};
  const dist = S.dist * (S.dist < 2.5 ? 1 : fit * (aspect < 1 ? (PM[c.k] || 1) : 1));
  tgt.set(S.tx, S.ty + S.carY * (c.k === 'hero' || c.k === 'flight' || c.k === 'reserve' ? 0 : 1) * 0, S.tz);
  if (c.k === 'hero' || c.k === 'reserve' || c.k === 'turn') tgt.y = S.ty + S.carY * .55;
  camera.position.set(tgt.x + Math.sin(az) * Math.cos(el) * dist, tgt.y + Math.sin(el) * dist, tgt.z + Math.cos(az) * Math.cos(el) * dist);
  camera.lookAt(tgt);
  const fv = S.fov * (aspect < 1 && S.dist < 2.5 ? 1.45 : 1); if (Math.abs(camera.fov - fv) > .01) { camera.fov = fv; camera.updateProjectionMatrix(); }
  const w = innerWidth, h = innerHeight;
  const port = PHONE || aspect < 1;
  if (port && c.capTop === undefined) { const cp = document.querySelector(`.cp[data-c="${c.k}"]`); c.capTop = !!(cp && cp.classList.contains('t')); }
  const shx = port ? 0 : S.shift, shy = port ? (c.k === 'hero' || c.k === 'reserve' || c.k === 'cockpit' || S.dist < 2.5 ? S.shY * .5 + .04 : (c.capTop ? -.1 : .15)) : S.shY * .5;
  camera.setViewOffset(w, h, -shx * w, shy * h, w, h);

  // car
  const bob = Math.sin(time * 1.6) * .07 * S.bob;
  rig.position.y = S.carY + bob;
  rig.rotation.set((S.rx + Math.sin(time * 1.1) * .8 * S.bob) * D2R, S.ry * D2R, (S.rz + Math.sin(time * .8) * 1.2 * S.bob) * D2R);
  if (car) animateCar(dt);

  // world
  const lift = cl(S.carY / 3);
  poolMat.opacity = S.floor * .9; poolMat.color.copy(flC);
  shadowMat.opacity = S.shadow * (1 - lift * .8) * (T.lt ? .55 : .95); shadow.scale.setScalar(1 + lift * .7);
  glowMat.opacity = S.thrust * (1 - lift * .85) * .9; glow.scale.setScalar(.8 + S.thrust * .3 + Math.sin(time * 40) * .02);
  ringMat.opacity = S.ring; ring.rotation.z = -S.ry * D2R;
  gridMat.uniforms.uOp.value = S.grid; gridMat.uniforms.uOff.value.y += dt * (S.spin * .06 + S.grid * .2 * (c.k === 'auto' ? 1 : 0)); grid.visible = S.grid > .01;
  // dust ring on lift off
  if (dustT >= 0) { dustT += dt; const k = dustT / 2.2; dust.scale.setScalar(2 + k * 11); dustMat.opacity = (1 - k) * .55; if (k >= 1) { dustT = -1; dustMat.opacity = 0; } }
  // speed lines
  slMat.opacity = S.speed * .55; speedLines.visible = S.speed > .01;
  if (speedLines.visible) { const v = 38 * S.speed; for (let i = 0; i < SL; i++) { const s = slSeed[i]; s.z -= v * dt; if (s.z < -35) s.z += 70; const j = i * 6; slPos[j] = s.x; slPos[j + 1] = s.y + S.carY; slPos[j + 2] = s.z; slPos[j + 3] = s.x; slPos[j + 4] = s.y + S.carY; slPos[j + 5] = s.z + s.l * (1 + S.speed); } slGeo.attributes.position.needsUpdate = true; }
  // clouds / sky / road backdrop
  skyEl.style.opacity = S.sky.toFixed(3); cloudsEl.style.opacity = (S.clouds * .9).toFixed(3); roadEl.style.opacity = S.road.toFixed(3);
  if (S.clouds > .01) cloudsEl.style.transform = `translate3d(${(-mouse.sx * 18).toFixed(1)}px,${(S.cloudY * 22 + Math.sin(time * .3) * 1).toFixed(2)}vh,0) scale(1.15)`;
  if (S.sky > .01) skyEl.style.transform = `translate3d(${(-mouse.sx * 8).toFixed(1)}px,${(S.cloudY * 6).toFixed(2)}vh,0) scale(1.08)`;
  if (S.road > .01) roadEl.style.transform = `scale(${(1.1 + activeP * .12).toFixed(3)})`;
  ttl.style.opacity = S.title.toFixed(3); if (S.title > .01) ttl.style.transform = `translate3d(${(-mouse.sx * 14).toFixed(1)}px,${((1 - S.title) * 3 + (c.k === 'hero' ? -activeP * 5 : 0)).toFixed(2)}vh,0) scale(${(1 + (1 - S.title) * .05).toFixed(3)})`;
  scene.environmentIntensity = S.env; renderer.toneMappingExposure = S.expo; rimL.intensity = 1.2 * S.rimLight; key.intensity = 1.6 * (.4 + .6 * Math.min(1, S.env));

  // sensors
  sensors.visible = S.sensors > .01;
  if (sensors.visible) { sRings.forEach((r, i) => { const f = (time * .28 + i / 3) % 1; r.scale.setScalar(2.2 + f * 10); r.material.opacity = (1 - f) * .7 * S.sensors; }); sweep.rotation.z = -time * 1.2; sweepMat.uniforms.uOp.value = S.sensors; frMat.opacity = .32 * S.sensors; boxMat.opacity = (.55 + .3 * Math.sin(time * 4)) * S.sensors; objBoxes[1].position.x = -4.2 + Math.sin(time * .5) * 1.5; objBoxes[2].position.z = 2.5 + ((time * 2) % 10) - 5; }
  // sound bars
  sBars.visible = S.sound > .01;
  if (sBars.visible) { if (analyser) analyser.getByteFrequencyData(fData); for (let i = 0; i < SB; i++) { const a = i / SB * Math.PI * 2; let amp = .08 + .18 * (Math.sin(time * 2.2 + i * .45) * .5 + .5) * (Math.sin(time * 1.3 + i * .21) * .5 + .5); if (playing && fData) amp += fData[(i * 3) % 90] / 255 * 2.4; dummy.position.set(Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6); dummy.scale.set(1, amp * S.sound + .001, 1); dummy.updateMatrix(); sBars.setMatrixAt(i, dummy.matrix); } sBars.instanceMatrix.needsUpdate = true; sbMat.opacity = .85 * S.sound; }

  // copy layer
  chs.forEach(ch => { if (!ch.copy) return; let o = 0; if (ch === c) { o = c.k === 'hero' ? (1 - sm(.15, .4, p)) : c.k === 'reserve' || c.k === 'config' ? sm(.05, .25, p) : sm(.04, .16, p) * (1 - sm(.86, .98, p)); } if (Math.abs((ch._o || 0) - o) > .002 || (o === 0 && ch._o)) { ch.copy.style.opacity = o.toFixed(3); ch.copy.style.transform = `translate3d(0,${((1 - o) * 26).toFixed(1)}px,0)`; ch.copy.classList.toggle('on', o > .002); ch._o = o; } });
  if (c.k === 'hero') $('#cue').style.opacity = (1 - sm(0, .08, p)) * intro.title * .8;
  // counters
  if (c.k === 'flight') { hA.textContent = Math.round(1200 + p * 8800).toLocaleString('en-GB'); hS.textContent = Math.round(140 + p * 110); }
  if (c.k === 'turn') dg.textContent = Math.round(cl(S.ry, 0, 360)).toString().padStart(3, '0');
  if (c.k === 'perf') ctrs.forEach((d, i) => { const k = sm(.12 + i * .1, .32 + i * .1, p); d.style.opacity = k; d.style.transform = `translate3d(0,${(1 - k) * 20}px,0)`; const n = d.querySelector('.n'); const to = +n.dataset.to; const v = to * k; n.textContent = n.dataset.d ? v.toFixed(1) : Math.round(v); });
  if (c.k === 'motors') nm.textContent = Math.round(sm(.2, .6, p) * 10000).toLocaleString('en-GB');
  if (c.k === 'charge') { const v = 10 + S.charge * 90; cg.textContent = Math.round(v); cgb.style.transform = `scaleX(${(v / 100).toFixed(3)})`; }

  // tags
  updateTags(c.k);

  // render unless the spec table covers the screen
  const sr = specEl.getBoundingClientRect(); const covered = sr.top <= 0 && sr.bottom >= vh;
  if (!covered) renderer.render(scene, camera);

  // adaptive resolution
  if (started && frames > 30 && slowN < 240) { slowAcc += dt; slowN++; if (slowN === 240) { const avg = slowAcc / 240; if (avg > 1 / 45 && DPR > 1) { DPR = Math.max(1, DPR - .5); renderer.setPixelRatio(DPR); resize(); } } }
}

let dustT = -1;
const tmpL = new THREE.Vector3();
function animateCar(dt) {
  // fades
  const gh = S.ghost;
  const cabHide = S.cab > .5;
  cabMeshes.forEach(o => o.visible = !cabHide);
  fadeable.forEach(f => { if (cabHide && cabSet.has(f.mesh)) return; const op = f.int ? Math.min(1 - gh, S.interior) * (f.mesh === parts.BodyRoofPanel ? 1 : 1) : 1 - gh; let mat; if (f.mesh.material === glassMat || !f.fade) { f.mesh.visible = op > .01; glassMat.opacity = .62 * S.glass * (1 - gh); return; } if (op >= .995) mat = f.orig; else { mat = f.fade; f.fade.opacity = op; } f.mesh.material = mat; f.mesh.visible = op > .01; });
  ghostMat.uniforms.uOp.value = gh;
  ghosts.forEach(g => { g.g.visible = gh > .01; if (g.g.visible) { g.m.updateMatrix(); g.g.matrix.copy(g.m.matrix); } });
  // paint
  paint.cur.lerp(paint.tgt, 1 - Math.exp(-4 * dt)); paint.metal = damp(paint.metal, paint.mt, 4, dt);
  paintMats.forEach(m => { m.color.copy(paint.cur); m.metalness = paint.metal; });
  // lights
  const hl = S.lights; if (mats.Headlight) mats.Headlight.emissiveIntensity = hl * 2.6;
  if (mats.Brakelight) mats.Brakelight.emissiveIntensity = (S.brake * (.75 + .25 * Math.sin(time * 3))) * 2.6 + hl * .6;
  if (mats.Dashboard) mats.Dashboard.emissiveIntensity = .5 + S.screen * 2;
  beamMat.uniforms.uOp.value = S.beams; beams.visible = S.beams > .01;
  bladeMat.opacity = Math.min(1, hl * 1.1); blade.visible = hl > .01; haloMat.opacity = S.beams * .9 + hl * .12 * (S.env < .6 ? 1 : 0); lpoolMat.opacity = S.beams * .9; lpool.visible = S.beams > .01;
  tailHaloMat.opacity = S.brake * (.7 + .2 * Math.sin(time * 3));
  trailMat.uniforms.uOp.value = S.trails; trailMat.uniforms.uT.value = time; trails.visible = S.trails > .01;
  jetMat.uniforms.uOp.value = S.thrust; jetMat.uniforms.uT.value = time; nozMat.opacity = S.thrust * .8; jetHalo.opacity = S.thrust * .55; jets.visible = S.thrust > .01;
  jets.children.forEach((j, i) => { if (i % 3 === 0) j.scale.set(1, .7 + S.thrust * .5 + Math.sin(time * 50 + i) * .04, 1); });
  aeroMat.uniforms.uOp.value = S.aero; aeroMat.uniforms.uT.value = time; aero.visible = S.aero > .01;
  // doors: swing up and out
  const dr = S.doors, ex = S.explode;
  const dl = parts.BodyDoorLColor1, drr = parts.BodyDoorRColor1;
  if (dl) { dl.rotation.set(dr * 72 * D2R, dr * 9 * D2R, 0, 'YXZ'); dl.position.copy(base.BodyDoorLColor1.p).add(tmpL.set(ex * 1.2, ex * .35, 0)); }
  if (drr) { drr.rotation.set(dr * 72 * D2R, -dr * 9 * D2R, 0, 'YXZ'); drr.position.copy(base.BodyDoorRColor1.p).add(tmpL.set(-ex * 1.2, ex * .35, 0)); }
  const hd = parts.BodyHood; if (hd) { hd.rotation.x = -S.hood * 48 * D2R - ex * 10 * D2R; hd.position.copy(base.BodyHood.p).add(tmpL.set(0, ex * .9, ex * 1.1)); }
  const rp = parts.BodyRearPanelsColor1; if (rp) { rp.rotation.x = S.hatch * 44 * D2R + ex * 8 * D2R; rp.position.copy(base.BodyRearPanelsColor1.p).add(tmpL.set(0, ex * .8, -ex * 1.1)); }
  const rf = parts.BodyRoofPanel; if (rf) { rf.position.copy(base.BodyRoofPanel.p).add(tmpL.set(0, S.roof * 1.15 + ex * 1.4, -S.roof * .25)); rf.rotation.set(-S.roof * 8 * D2R, S.roof * 6 * D2R, 0); }
  ['BodyWindshield', 'BodyWindshieldGasket', 'BodyWindshieldWipers', 'BodyWindshieldWipersBase'].forEach(n => { const o = parts[n]; if (o) o.position.copy(base[n].p).add(tmpL.set(0, ex * 1.0, ex * .55)); });
  if (parts.BodyPillars) parts.BodyPillars.position.copy(base.BodyPillars.p).add(tmpL.set(0, ex * 1.2, 0));
  if (parts.BodyPanelsColor2) parts.BodyPanelsColor2.position.copy(base.BodyPanelsColor2.p).add(tmpL.set(0, -ex * .25, 0));
  // wheels
  wAng += S.spin * dt; const we = S.wexp;
  wheels.forEach(w => { w.w.position.copy(base[w.w.name].p).add(tmpL.set(w.side * ex * .7, 0, 0)); [w.rim, w.tyre, w.disc].forEach(o => o.rotation.x = wAng); const isFL = w.w.name === 'WheelFrontL'; const e = isFL ? we : 0; w.tyre.position.copy(w.bp.tyre).x += w.side * e * 1.55; w.rim.position.copy(w.bp.rim).x += w.side * e * 1.0; w.pad.position.copy(w.bp.pad).x += w.side * e * .55; w.disc.position.copy(w.bp.disc).x += w.side * e * .2; });
  // battery + motors
  pack.visible = S.battery > .01; batMat.uniforms.uOp.value = S.battery; batMat.uniforms.uT.value = time; batMat.uniforms.uWave.value = S.wave; batMat.uniforms.uCharge.value = S.charge; caseMat.opacity = S.battery * .7; pack.position.y = .19 - (1 - S.battery) * .6 - ex * .15;
  motors.visible = S.motors > .01; mAng += S.spin * dt * 1.4; rotors.forEach((r, i) => r.rotation.x = mAng * (i === 2 ? -1 : 1));
  motorList.forEach((m, i) => { const k = sm(i * .15, .55 + i * .15, S.motors); m.scale.setScalar(Math.max(.001, k)); m.position.y = .384 - ex * .1; }); mGlow.opacity = S.motors * (.7 + .3 * Math.sin(time * 6));
  screenM.material.opacity = S.screen; screenM.visible = S.screen > .01; screenM.scale.setScalar(.85 + S.screen * .15);
  portMat.opacity = S.port * (.6 + .4 * Math.sin(time * 4)); port.visible = S.port > .01;
}

const TP = {};
function updateTags(k) {
  const FL = wheels[0] || null;
  if (FL) { const op = sm(.6, .92, S.wexp) * (k === 'wheels' ? 1 - sm(.93, 1, activeP) : 0);
    const at = (o, dy, el) => { o.getWorldPosition(v3b); v3b.y += dy; worldProject(v3b, el, op); };
    at(FL.tyre, .4, tagEls.tyre); at(FL.rim, -.3, tagEls.rim); at(FL.disc, -.2, tagEls.disc); at(FL.pad, .1, tagEls.cal); }
  const mo = k === 'motors' ? sm(.35, .5, activeP) * (1 - sm(.92, 1, activeP)) : 0;
  project(v3b.set(0, .55, 1.49), tagEls.mf, mo); project(v3b.set(.4, .55, -1.31), tagEls.mr, mo);
  project(v3b.set(-.3, .3, .4), tagEls.pack, k === 'battery' ? sm(.3, .45, activeP) * (1 - sm(.9, 1, activeP)) : 0);
  const so = k === 'auto' ? sm(.15, .3, activeP) * (1 - sm(.9, 1, activeP)) : 0;
  ['o1', 'o2', 'o3', 'o4'].forEach((id, i) => { const b = objBoxes[i]; worldProject(v3b.set(b.position.x, b.position.y * 2 + .1, b.position.z), tagEls[id], so); });
}

/* ---------------- boot ---------------- */
function ready() {
  resize();
  // pre-warm visible hero frame
  $('#pre').classList.add('gone');
  const go = () => { lenis.start(); started = true; };
  gsap.to(intro, {thr: 1, duration: .7, delay: .35, ease: 'power2.out', onStart: () => { dustT = 0; }});
  gsap.to(intro, {lift: 1, duration: 2.8, delay: .8, ease: 'power3.inOut'});
  gsap.to(intro, {cam: 0, duration: 3.6, delay: .2, ease: 'power3.inOut'});
  gsap.to(intro, {title: 1, duration: 1.8, delay: 1.5, ease: 'power2.out', onComplete: go});
  setTimeout(go, 2600);
}
measure();
gsap.ticker.lagSmoothing(0);
let lastT = performance.now();
gsap.ticker.add(() => { const now = performance.now(); const dt = Math.min(.05, (now - lastT) / 1000); lastT = now; lenis.raf(now); frame(dt); });
window.__td = {S, T, chs, get active() { return active.k + ' ' + activeP.toFixed(2); }, renderer, camera, parts, lenis};
