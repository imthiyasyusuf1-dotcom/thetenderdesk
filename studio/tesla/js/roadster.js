// Procedural model of the 2026 Tesla Roadster (faceted wedge), built from public reference
// photos and published proportions. Car space: nose +Z, up +Y, left (driver, LHD) +X.
import * as THREE from 'three';

const L = 4.4, N = 2.24;                 // overall length, nose z
const z = s => N - s * L;                // s = fraction of length from nose
const sF = .185, sR = .805;                // wheel stations
const WR = .345, AR = .40;               // wheel radius, arch radius
export const RS = {nose: N, tail: z(.955), zF: z(sF), zR: z(sR), wr: WR, hw: .96, len: L};

/* key sections: s, width factor, centre top, crest y, crest x (of hw), belt y, low side y, skirt bottom y */
const K = [
  [0,    .66, .44, .46, .55, .40, .27, .14],
  [.03,  .78, .48, .53, .58, .44, .27, .15],
  [.08,  .87, .55, .63, .62, .50, .28, .17],
  [.14,  .95, .66, .73, .64, .56, .30, .20],
  [.21,  .975, .79, .80, .66, .60, .31, .22],
  [.30,  1,   .80, .82, .70, .62, .31, .19],
  [.45,  1,   .80, .80, .72, .62, .31, .19],
  [.60,  1,   .82, .83, .70, .64, .31, .19],
  [.70,  .99, .88, .92, .62, .66, .32, .22],
  [.80,  .985, .86, .93, .60, .67, .32, .22],
  [.87,  .965, .82, .87, .60, .66, .32, .22],
  [.94,  .90, .76, .78, .58, .64, .30, .24],
  [.955, .84, .75, .76, .56, .62, .30, .24]
];
function key(s) {
  if (s <= K[0][0]) return K[0].slice(1);
  for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (s <= b[0] + 1e-9) { const t = (s - a[0]) / (b[0] - a[0]); return a.slice(1).map((v, j) => v + (b[j + 1] - v) * t); } }
  return K[K.length - 1].slice(1);
}
function archY(s) {
  let y = -1; const zz = z(s);
  for (const sw of [sF, sR]) { const dz = zz - z(sw); if (Math.abs(dz) < AR) y = Math.max(y, WR + Math.sqrt(AR * AR - dz * dz)); }
  return y;
}
// half section, points P0..P5 as [x,y]
function section(s) {
  const [wF, yc, yi, xi, yb, yl, ys] = key(s); const hw = .96 * wF;
  const a = archY(s);
  const p4y = Math.max(yl, a), p5y = Math.max(ys, a);
  const p3y = Math.max(yb, a + .025);
  let p2y = yb + (yi - yb) * .45; p2y = Math.max(p2y, p3y + .015);
  const p1y = Math.max(yi, p2y + .012);
  return [[0, yc], [xi * hw, p1y], [.93 * hw, p2y], [hw, p3y], [hw * (a > 0 ? 1 : .975), p4y], [hw * (a > 0 ? 1 : .9), p5y]];
}
// canopy roof height
const RK = [[.21, .80], [.30, .885], [.40, .965], [.50, 1.04], [.58, 1.095], [.64, 1.115], [.70, 1.085], [.76, .99], [.83, .89]];
function roofY(s) { for (let i = 0; i < RK.length - 1; i++) { const a = RK[i], b = RK[i + 1]; if (s <= b[0] + 1e-9) return a[1] + (b[1] - a[1]) * (s - a[0]) / (b[0] - a[0]); } return RK[RK.length - 1][1]; }
function canopy(s) {
  const P = section(s); let bx, by;
  if (s <= .70) { bx = P[1][0] - .012; by = P[1][1] + .004; }
  else { const P7 = section(.70); const t = (s - .70) / .13; const bx0 = P7[1][0] - .012; bx = bx0 + (.30 - bx0) * t; by = P[0][1] + (P[1][1] - P[0][1]) * (bx / P[1][0]) + .006; if (s <= .70 + 1e-9) by = P7[1][1] + .004; }
  const R = Math.max(roofY(s), by);
  return [[bx, by], [bx * .9, by + (R - by) * .62], [bx * .6, R], [0, R + .012]];
}

/* station list: keys + dense around wheel arches + part boundaries */
const ST = new Set(K.map(k => k[0]).concat([.21, .30, .55, .66, .70, .83]));
for (const sw of [sF, sR]) { const ds = AR / L; for (let i = 0; i <= 14; i++) ST.add(+(sw - ds + 2 * ds * i / 14).toFixed(5)); for (const e of [-1, 1]) ST.add(+(sw + e * (ds + .004)).toFixed(5)); }
const STATIONS = [...ST].filter(s => s >= 0 && s <= .955).sort((a, b) => a - b);
const CST = [...new Set(STATIONS.concat(RK.map(r => r[0])))].filter(s => s >= .21 && s <= .83).sort((a, b) => a - b);

/* geometry builder: G[m] = {p:[], n:[]}; normals smooth along the length, crisp across bands (creases) */
function build(G) { const out = []; G.forEach((a, i) => { if (!a || !a.p.length) return; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a.p, 3)); if (a.n.length === a.p.length) g.setAttribute('normal', new THREE.Float32BufferAttribute(a.n, 3)); else g.computeVertexNormals(); out.push([i, g]); }); return out; }
const V = THREE.Vector3; const _a = new V(), _b = new V();
function qn(a, b, c, d) { _a.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]); _b.set(d[0] - b[0], d[1] - b[1], d[2] - b[2]); const n = new V().crossVectors(_a, _b); return n.lengthSq() < 1e-12 ? null : n.normalize(); }
function strip(G, m, rows) {  // rows[i] = [P_j, P_j+1] two 3d points per row, a strip of quads along i
  G[m] = G[m] || {p: [], n: []}; const A = G[m]; const N = [];
  for (let i = 0; i < rows.length - 1; i++) N.push(qn(rows[i][0], rows[i + 1][0], rows[i + 1][1], rows[i][1]));
  const vn = i => { const a = N[i - 1], b = N[i]; const n = new V(); if (a) n.add(a); if (b) n.add(b); if (n.lengthSq() < 1e-12) n.set(0, 1, 0); return n.normalize(); };
  const VN = rows.map((_, i) => vn(i));
  for (let i = 0; i < rows.length - 1; i++) { if (!N[i]) continue; const a = rows[i][0], b = rows[i + 1][0], c = rows[i + 1][1], d = rows[i][1]; const na = VN[i], nb = VN[i + 1];
    A.p.push(...a, ...b, ...c, ...a, ...c, ...d); A.n.push(na.x, na.y, na.z, nb.x, nb.y, nb.z, nb.x, nb.y, nb.z, na.x, na.y, na.z, nb.x, nb.y, nb.z, na.x, na.y, na.z); }
}
function loftSide(G, list, s0, s1, secFn, bandMat, sg, off = [0, 0, 0]) {
  const ss = list.filter(s => s >= s0 - 1e-9 && s <= s1 + 1e-9); const secs = ss.map(secFn);
  for (let j = 0; j < secs[0].length - 1; j++) { const m = bandMat[j]; if (m === undefined || m < 0) continue;
    const rows = ss.map((s, i) => { const zz = z(s) - off[2], P = secs[i]; const p = (q) => [sg * q[0] - off[0], q[1] - off[1], zz]; return sg > 0 ? [p(P[j]), p(P[j + 1])] : [p(P[j + 1]), p(P[j])]; });
    strip(G, m, rows); }
}
function loft(G, list, s0, s1, secFn, bandMat, off = [0, 0, 0]) { loftSide(G, list, s0, s1, secFn, bandMat, 1, off); loftSide(G, list, s0, s1, secFn, bandMat, -1, off); }

function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

export function buildRoadster(glassMat) {
  const car = new THREE.Group(); car.name = 'Roadster';
  const DS = THREE.DoubleSide;
  /* materials */
  const paint = new THREE.MeshPhysicalMaterial({name: 'Paint 1', color: '#e7e6e2', metalness: .15, roughness: .3, clearcoat: 1, clearcoatRoughness: .05, side: DS});
  const black = new THREE.MeshPhysicalMaterial({name: 'GlossBlack', color: '#060607', metalness: .2, roughness: .18, clearcoat: 1, clearcoatRoughness: .05, side: DS});
  const carbonTex = ctex(128, 128, (g, w) => { g.fillStyle = '#0d0e10'; g.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 16) for (let x = 0; x < w; x += 16) { const o = ((x + y) / 16) % 2; g.fillStyle = o ? '#1b1d21' : '#121316'; g.fillRect(x, y, 16, 8); g.fillStyle = o ? '#121316' : '#1b1d21'; g.fillRect(x, y + 8, 16, 8); } });
  carbonTex.wrapS = carbonTex.wrapT = THREE.RepeatWrapping; carbonTex.repeat.set(6, 6);
  const carbon = new THREE.MeshPhysicalMaterial({name: 'Carbon', color: '#ffffff', map: carbonTex, metalness: .3, roughness: .35, clearcoat: .8, side: DS});
  const matte = new THREE.MeshStandardMaterial({name: 'Underbody', color: '#050506', roughness: .9, side: DS});
  const head = new THREE.MeshStandardMaterial({name: 'Headlight', color: '#dfe6f0', emissive: '#eaf2ff', emissiveIntensity: 0, roughness: .2});
  const brake = new THREE.MeshStandardMaterial({name: 'Brakelight', color: '#a3100c', emissive: '#ff1a14', emissiveIntensity: 0, roughness: .3});
  const chrome = new THREE.MeshStandardMaterial({name: 'Chrome', color: '#d9dce0', metalness: 1, roughness: .15});
  const tyreM = new THREE.MeshStandardMaterial({name: 'Tireside', color: '#0b0b0c', roughness: .62});
  const rimW = new THREE.MeshPhysicalMaterial({name: 'RimFace', color: '#e9e8e4', metalness: .2, roughness: .28, clearcoat: 1, side: DS});
  const spokeM = new THREE.MeshPhysicalMaterial({name: 'Rim1', color: '#0a0a0b', metalness: .5, roughness: .2, clearcoat: 1});
  const barrel = new THREE.MeshStandardMaterial({name: 'Barrel', color: '#3a2a1e', metalness: .9, roughness: .4, side: DS});
  const discM = new THREE.MeshStandardMaterial({name: 'Disc', color: '#7d8085', metalness: 1, roughness: .45});
  const calM = new THREE.MeshStandardMaterial({name: 'Caliper', color: '#1e2024', metalness: .6, roughness: .35});
  const iWhite = new THREE.MeshStandardMaterial({name: 'Interior 3', color: '#ecebe7', roughness: .55, side: DS});
  const iSuede = new THREE.MeshStandardMaterial({name: 'Interior Suede', color: '#2a2b2e', roughness: .97, side: DS});
  const iBlack = new THREE.MeshStandardMaterial({name: 'Interior Black', color: '#0b0b0c', roughness: .6, side: DS});
  const ambient = new THREE.MeshBasicMaterial({name: 'Ambient', color: '#ff2a22', toneMapped: false});
  const scrTex = ctex(640, 400, (g, w, h) => { g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, h * .5, 0, h); gr.addColorStop(0, '#0b1018'); gr.addColorStop(1, '#1c2533'); g.fillStyle = gr; g.fillRect(0, h * .5, w, h * .5); g.fillStyle = '#e8e8e8'; g.beginPath(); g.moveTo(w * .22, h * .7); g.lineTo(w * .38, h * .6); g.lineTo(w * .62, h * .57); g.lineTo(w * .8, h * .66); g.lineTo(w * .8, h * .72); g.lineTo(w * .22, h * .74); g.closePath(); g.fill(); g.fillStyle = '#3a2414'; g.beginPath(); g.moveTo(w * .42, h * .6); g.lineTo(w * .6, h * .58); g.lineTo(w * .7, h * .645); g.lineTo(w * .45, h * .66); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '500 30px Inter, sans-serif'; g.fillText('Roadster', 34, 58); g.fillStyle = 'rgba(255,255,255,.45)'; g.font = '400 20px Inter, sans-serif'; g.fillText('P  R  N  D', 34, 96); g.fillStyle = '#6ff0b4'; g.fillRect(34, h - 50, 170, 6); g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(204, h - 50, 40, 6); });
  const dash = new THREE.MeshStandardMaterial({name: 'Dashboard', color: '#000000', emissive: '#ffffff', emissiveMap: scrTex, emissiveIntensity: .6, roughness: .2});
  const MATS = [paint, black, carbon, glassMat, matte];   // body material indices

  const addMesh = (parent, G, name, mats = MATS) => { const grp = new THREE.Group(); grp.name = name; build(G).forEach(([i, g]) => { const m = new THREE.Mesh(g, mats[i]); m.name = name + '_' + i; grp.add(m); }); parent.add(grp); return grp; };
  const pivot = (name, p) => { const g = new THREE.Group(); g.name = name; g.position.set(...p); car.add(g); return g; };

  /* ---- body sides (crest -> skirt): paint bands 0..3, skirt band 4 carbon ---- */
  const sideBands = [-1, 0, 0, 0, 2];
  { const G = []; loft(G, STATIONS, 0, .30, section, sideBands); loft(G, STATIONS, .55, .955, section, sideBands); addMesh(car, G, 'BodyPanelsColor1'); }
  { const G = []; loft(G, STATIONS, .30, .55, section, [-1, -1, -1, -1, 2]); addMesh(car, G, 'BodySills'); }
  /* hood (pivot at windscreen base) */
  const hp = [0, section(.21)[0][1], z(.21)];
  const hood = pivot('BodyHood', hp);
  { const G = []; loft(G, STATIONS, 0, .21, section, [0], hp); addMesh(hood, G, 'BodyHoodPanel'); }
  /* doors: scissor, hinge at front top of the door */
  const doorBands = [-1, 0, 0, 0, -1];
  [1, -1].forEach(sg => {
    const P = section(.30); const hpD = [sg * P[3][0], P[1][1], z(.30)];
    const d = pivot(sg > 0 ? 'BodyDoorLColor1' : 'BodyDoorRColor1', hpD);
    const G = []; loftSide(G, STATIONS, .30, .55, section, doorBands, sg, hpD);
    loftSide(G, CST, .30, .55, canopy, [3, -1, -1], sg, hpD);   // door glass
    addMesh(d, G, d.name + 'Skin');
    // door card + ambient strip (inside)
    const cardG = []; loftSide(cardG, STATIONS, .30, .55, s => { const p = section(s); const x = p[3][0] - .07; return [[x, p[1][1] - .04], [x, .58], [x, .565], [x, .3]]; }, [0, 1, 0], sg, hpD);
    addMesh(d, cardG, 'InteriorDoorCard' + (sg > 0 ? 'L' : 'R'), [iSuede, ambient]);
  });
  /* deck lid / hatch (pivot at canopy end) with the rear pane */
  const dp = [0, section(.70)[0][1], z(.70)];
  const hatch = pivot('BodyRearPanelsColor1', dp);
  { const G = []; loft(G, STATIONS, .70, .955, section, [0], dp); addMesh(hatch, G, 'BodyDeck'); }
  { const G = []; loft(G, CST, .70, .83, canopy, [3, 3, 3], dp); addMesh(hatch, G, 'BodyRearwindow'); }
  /* canopy: windscreen, fixed side glass, roof */
  { const G = []; loft(G, CST, .21, .30, canopy, [3, 3, 3]); addMesh(car, G, 'BodyWindshield'); }
  { const G = []; loft(G, CST, .55, .70, canopy, [3, -1, -1]); loft(G, CST, .66, .70, canopy, [-1, 3, 3]); addMesh(car, G, 'BodyPillars'); }
  { const G = []; loft(G, CST, .30, .66, canopy, [-1, 3, 3]); addMesh(car, G, 'BodyRoofPanel'); }
  // thin black frame along the canopy base and the roof edge
  { const G = []; const fr = s => { const c = canopy(s); return [[c[0][0] + .004, c[0][1] - .004], [c[0][0] - .002, c[0][1] + .022]]; }; const fr2 = s => { const c = canopy(s); return [[c[2][0] + .02, c[2][1] - .004], [c[2][0] - .02, c[2][1] + .003]]; }; loft(G, CST, .27, .66, fr2, [1]); addMesh(car, G, 'BodyCanopyTrim'); }

  /* nose and tail caps */
  const capShape = (s) => { const P = section(s); const pts = P.slice(0).concat(P.slice(1).reverse().map(p => [-p[0], p[1]])); const sh = new THREE.Shape(); pts.forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])); return sh; };
  { const m = new THREE.Mesh(new THREE.ShapeGeometry(capShape(0)), black); m.position.z = N; m.name = 'BodyNoseFascia'; car.add(m); }
  { const m = new THREE.Mesh(new THREE.ShapeGeometry(capShape(.955)), paint); m.position.z = RS.tail; m.name = 'BodyTailPanel'; car.add(m); }
  const box = (w, h, d, mat, x, y, zz, name, parent = car) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, zz); m.name = name; parent.add(m); return m; };
  // front light bar along the hood edge + headlight clusters
  const hw0 = section(0)[1][0];
  box(hw0 * 2 * 1.02, .014, .02, head, 0, .438, N + .006, 'FrontLightBar');
  [1, -1].forEach(sg => { const h = box(.15, .014, .03, head, sg * .36, .468, z(.022), 'Headlamp'); h.rotation.set(-.55, 0, sg * .32); const h2 = box(.05, .01, .02, head, sg * .46, .5, z(.04), 'Headlamp'); h2.rotation.set(-.55, 0, sg * .5); });
  box(1.18, .02, .26, black, 0, .145, N - .14, 'Splitter');
  box(.62, .05, .02, black, 0, .2, N + .004, 'FrontIntake');
  // rear: black lower fascia, diffuser, nozzles, light bar
  const hwT = section(.955)[3][0];
  box(hwT * 2 * .63, .42, .05, carbon, 0, .37, RS.tail + .015, 'RearFascia');
  for (let i = -1; i <= 1; i++) box(.012, .14, .3, black, i * .2, .23, RS.tail + .12, 'DiffuserFin');
  box(hwT * 2 * .7, .015, .34, black, 0, .16, RS.tail + .14, 'DiffuserTray');
  box(hwT * 2 * .98, .06, .03, black, 0, .705, RS.tail + .002, 'TailBezel');
  box(hwT * 2 * .94, .022, .02, brake, 0, .712, RS.tail - .018, 'TailLightBar');
  [1, -1].forEach(sg => box(.16, .012, .02, brake, sg * hwT * .82, .5, RS.tail - .01, 'TailLightLow'));
  [-.3, -.1, .1, .3].forEach(x => { const r = new THREE.Mesh(new THREE.TorusGeometry(.036, .008, 10, 32), chrome); r.position.set(x, .47, RS.tail - .012); r.name = 'Nozzle'; car.add(r); const c = new THREE.Mesh(new THREE.CircleGeometry(.036, 24), matte); c.position.set(x, .47, RS.tail - .004); c.rotation.y = Math.PI; car.add(c); });
  [-.3, -.1, .1, .3].forEach(x => { const f = new THREE.Mesh(new THREE.CircleGeometry(.065, 28), matte); f.position.set(x, .3, RS.tail - .012); f.rotation.y = Math.PI; f.name = 'Fan'; car.add(f); const rr = new THREE.Mesh(new THREE.TorusGeometry(.065, .006, 8, 32), black); rr.position.copy(f.position); car.add(rr); });
  // wing on two pylons, black endplates
  const wing = box(1.76, .03, .34, carbon, 0, 1.04, -1.98, 'Wing'); wing.rotation.x = -.07;
  [1, -1].forEach(sg => {
    const sh = new THREE.Shape(); sh.moveTo(.15, .02); sh.lineTo(-.15, .02); sh.lineTo(-.06, -.2); sh.closePath();
    const ep = new THREE.Mesh(new THREE.ShapeGeometry(sh), black); ep.rotation.y = -Math.PI / 2; ep.position.set(sg * .882, 1.04, -1.98); ep.name = 'WingEndplate'; car.add(ep);
    const py = box(.04, .3, .16, black, sg * .4, .9, -1.87, 'WingPylon'); py.rotation.x = -.3;
  });
  // storage tubs: frunk under the hood, trunk under the deck (suede liner so the opening reads as a space, not a hole)
  const tub = (x0, x1, z0, z1, y0, y1, name) => { const g = new THREE.Group(); g.name = name; car.add(g); const w = x1 - x0, d = z0 - z1, h = y1 - y0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    box(w, .012, d, iSuede, cx, y0, cz, name + 'Floor', g); box(.012, h, d, iSuede, x0, y0 + h / 2, cz, name + 'Wall', g); box(.012, h, d, iSuede, x1, y0 + h / 2, cz, name + 'Wall', g); box(w, h, .012, iSuede, cx, y0 + h / 2, z0, name + 'Wall', g); box(w, h, .012, iSuede, cx, y0 + h / 2, z1, name + 'Wall', g); };
  tub(-.5, .5, z(.05), z(.17), .3, .5, 'InteriorFrunk');
  tub(-.62, .62, z(.71), z(.86), .42, .78, 'InteriorTrunk');
  // underbody + arch liners
  box(1.6, .01, 4.0, matte, 0, .215, .2, 'Underbody');
  [sF, sR].forEach(sw => [1, -1].forEach(sg => { const g = new THREE.CylinderGeometry(AR, AR, .42, 24, 1, true, 0, Math.PI); g.rotateZ(Math.PI / 2); const m = new THREE.Mesh(g, matte); m.material.side = DS; m.position.set(sg * (.96 - .22), WR, z(sw)); m.name = 'ArchLiner'; car.add(m); const w = new THREE.Mesh(new THREE.CircleGeometry(AR, 24, 0, Math.PI), matte); w.rotation.y = Math.PI / 2; w.position.set(sg * .52, WR, z(sw)); car.add(w); }));

  /* ---- wheels ---- */
  const tyreGeo = (w) => { const pts = []; const r0 = .262, r1 = WR; const prof = [[r0, -w / 2 + .01], [r0 + .02, -w / 2], [r1 - .03, -w / 2], [r1, -w / 2 + .03], [r1, w / 2 - .03], [r1 - .03, w / 2], [r0 + .02, w / 2], [r0, w / 2 - .01]]; prof.forEach(p => pts.push(new THREE.Vector2(p[0], p[1]))); const g = new THREE.LatheGeometry(pts, 56); g.rotateZ(Math.PI / 2); return g; };
  const wheel = (name, sw, sg, w) => {
    const grp = new THREE.Group(); grp.name = name; grp.position.set(sg * (.96 - w / 2 - .02), WR, z(sw)); car.add(grp);
    const tyre = new THREE.Mesh(tyreGeo(w), tyreM); tyre.name = name + 'Tyre'; grp.add(tyre);
    const rim = new THREE.Group(); rim.name = name + 'Rim'; grp.add(rim);
    const face = sg * (w / 2 - .035);
    const bg = new THREE.CylinderGeometry(.262, .262, w - .02, 48, 1, true); bg.rotateZ(Math.PI / 2); rim.add(new THREE.Mesh(bg, barrel));
    const dg = new THREE.RingGeometry(.075, .262, 48); dg.rotateY(sg * Math.PI / 2); const disc = new THREE.Mesh(dg, rimW); disc.position.x = face; rim.add(disc);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const sp = new THREE.Mesh(new THREE.BoxGeometry(.03, .19, .05), spokeM); sp.position.set(face + sg * .012, Math.cos(a) * .165, Math.sin(a) * .165); sp.rotation.x = -a; rim.add(sp); }
    const hub = new THREE.CylinderGeometry(.075, .085, .03, 32); hub.rotateZ(Math.PI / 2); const hb = new THREE.Mesh(hub, spokeM); hb.position.x = face + sg * .01; rim.add(hb);
    const rl = new THREE.TorusGeometry(.262, .008, 6, 64); rl.rotateY(Math.PI / 2); const lip = new THREE.Mesh(rl, spokeM); lip.position.x = face; rim.add(lip);
    const dsc = new THREE.CylinderGeometry(.19, .19, .028, 40); dsc.rotateZ(Math.PI / 2); const bd = new THREE.Mesh(dsc, discM); bd.name = name + 'BrakeDisc'; bd.position.x = sg * (w / 2 - .11); grp.add(bd);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(.07, .1, .16), calM); pad.name = name + 'BrakePad'; pad.position.set(sg * (w / 2 - .11), .14, -.06 * (sw < .5 ? 1 : -1)); grp.add(pad);
  };
  wheel('WheelFrontL', sF, 1, .27); wheel('WheelFrontR', sF, -1, .27); wheel('WheelRearL', sR, 1, .34); wheel('WheelRearR', sR, -1, .34);

  /* ---- interior (LHD, driver at +x) ---- */
  const I = new THREE.Group(); I.name = 'Interior'; car.add(I);
  box(1.56, .02, 2.3, iBlack, 0, .235, .22, 'InteriorTub', I);
  box(1.56, .55, .03, iBlack, 0, .5, -.62, 'InteriorBulkhead', I);
  box(1.56, .38, .03, iBlack, 0, .42, 1.33, 'InteriorFootwell', I);
  // fixed side trim ahead of and behind the doors
  [1, -1].forEach(sg => { const G = []; const card = s => { const p = section(s); const x = p[3][0] - .07; return [[x, p[1][1] - .04], [x, .58], [x, .565], [x, .3]]; }; loftSide(G, STATIONS, .21, .30, card, [0, 0, 0], sg, [0, 0, 0]); loftSide(G, STATIONS, .55, .70, card, [0, 0, 0], sg, [0, 0, 0]); addMesh(I, G, 'InteriorTrim', [iSuede, ambient]); });
  // dash: low, thin, full width, gloss black lower band with vent slots
  const dashTop = box(1.52, .1, .4, iSuede, 0, .7, 1.06, 'InteriorDash', I); dashTop.rotation.x = .08;
  box(1.52, .045, .02, black, 0, .635, .865, 'InteriorDashBand', I);
  for (let i = 0; i < 5; i++) box(.34, .004, .004, iBlack, -.4, .62 + i * .008, .853, 'InteriorVent', I);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(.34, .21), dash); scr.position.set(0, .77, .84); scr.rotation.set(-.22, Math.PI, 0); scr.name = 'InteriorScreen'; I.add(scr);
  box(.36, .23, .012, iBlack, 0, .77, .846, 'InteriorScreenBack', I).rotation.x = .22;
  const dd = new THREE.Mesh(new THREE.PlaneGeometry(.17, .045), dash); dd.position.set(.36, .79, .97); dd.rotation.set(-.4, Math.PI, 0); dd.name = 'InteriorDriverDisplay'; I.add(dd);
  // yoke: white squircle rim, dark grips, dark hub
  const yoke = new THREE.Group(); yoke.name = 'InteriorYoke'; yoke.position.set(.36, .74, .6); yoke.rotation.x = -.32; I.add(yoke);
  const yp = []; for (let i = 0; i < 64; i++) { const t = i / 64 * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); yp.push(new THREE.Vector3(.17 * Math.sign(c) * Math.pow(Math.abs(c), .4), .085 * Math.sign(s) * Math.pow(Math.abs(s), .4), 0)); }
  yoke.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(yp, true), 96, .016, 10, true), iWhite));
  [1, -1].forEach(sg => { const gr = new THREE.Mesh(new THREE.CapsuleGeometry(.021, .1, 4, 10), iSuede); gr.position.x = sg * .168; yoke.add(gr); });
  const hubG = new THREE.CylinderGeometry(.05, .055, .04, 24); hubG.rotateX(Math.PI / 2); yoke.add(new THREE.Mesh(hubG, iBlack));
  [1, -1].forEach(sg => { const sp = new THREE.Mesh(new THREE.BoxGeometry(.12, .018, .015), iBlack); sp.position.x = sg * .1; yoke.add(sp); });
  const col = new THREE.CylinderGeometry(.03, .04, .3, 12); col.rotateX(Math.PI / 2); const cm = new THREE.Mesh(col, iBlack); cm.position.set(.36, .78, .76); cm.rotation.x = -.32; cm.name = 'InteriorColumn'; I.add(cm);
  // seats: monolithic, faceted, integrated headrest, white with charcoal insert
  [1, -1].forEach(sg => {
    const S = new THREE.Group(); S.name = sg > 0 ? 'InteriorSeatsColor1' : 'InteriorSeatsColor2'; I.add(S);
    const bs = new THREE.Shape(); bs.moveTo(-.24, 0); bs.lineTo(.24, 0); bs.lineTo(.255, .46); bs.lineTo(.19, .62); bs.lineTo(.12, .68); bs.lineTo(-.12, .68); bs.lineTo(-.19, .62); bs.lineTo(-.255, .46); bs.closePath();
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(bs, {depth: .1, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 1}), iWhite);
    back.position.set(sg * .36, .33, -.3); back.rotation.x = -.36; S.add(back);
    const ins = new THREE.Shape(); ins.moveTo(-.11, .06); ins.lineTo(.11, .06); ins.lineTo(.12, .44); ins.lineTo(.07, .58); ins.lineTo(-.07, .58); ins.lineTo(-.12, .44); ins.closePath();
    const im = new THREE.Mesh(new THREE.ShapeGeometry(ins), iSuede); im.position.set(0, 0, .122); back.add(im);
    const cs = new THREE.Shape(); cs.moveTo(-.24, 0); cs.lineTo(.24, 0); cs.lineTo(.22, .46); cs.lineTo(-.22, .46); cs.closePath();
    const cush = new THREE.Mesh(new THREE.ExtrudeGeometry(cs, {depth: .09, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 1}), iWhite);
    cush.rotation.x = -Math.PI / 2 + .1; cush.position.set(sg * .36, .27, -.26); S.add(cush);
    const ci = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-.1, .05), new THREE.Vector2(.1, .05), new THREE.Vector2(.09, .4), new THREE.Vector2(-.09, .4)])), iSuede); ci.position.z = .112; cush.add(ci);
  });
  // centre console wedge (white) + dark front console
  const cw = new THREE.Shape(); cw.moveTo(0, 0); cw.lineTo(.95, 0); cw.lineTo(.9, .14); cw.lineTo(.12, .3); cw.lineTo(0, .3); cw.closePath();
  const cg = new THREE.ExtrudeGeometry(cw, {depth: .16, bevelEnabled: false}); cg.translate(0, 0, -.08); cg.rotateY(Math.PI / 2);
  const con = new THREE.Mesh(cg, iWhite); con.position.set(0, .24, -.42); con.name = 'InteriorConsole'; I.add(con);
  box(.2, .12, .5, iBlack, 0, .3, .55, 'InteriorConsoleFront', I);

  return car;
}
