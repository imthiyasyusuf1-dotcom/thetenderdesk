/**
 * glasses/temple.js
 * One temple arm, generated as a single swept BufferGeometry so the arm,
 * the S-bend and the spoon paddle are one continuous acetate surface.
 *
 * Reference: ref-arm.jpg / ref-spoon.jpg (Coco Chanel close-up).
 *  - a thick, flat, glossy bar, tall near the hinge and tapering back
 *  - a gentle S-bend down behind the ear
 *  - the last ~2 cm swells into a teardrop paddle, ~1.5x the arm width,
 *    with a rounded end
 *  - a deep, polished teardrop bowl recessed into the INNER face, narrow
 *    where it meets the arm, with a thin raised rim all the way round
 *
 * Units are centimetres. The arm starts at the hinge (origin) and runs
 * back along -Z. `side` is +1 for the wearer's left (screen right when
 * facing the frames) and -1 for the other arm; the inner face points
 * toward the head, i.e. along -side on X.
 */
import * as THREE from 'three';

/**
 * Signed distance to the bowl outline, in the paddle plane.
 * x: across the paddle (cm), z: along the arm, 0 at the tip, negative toward the hinge.
 * Uneven capsule (after Inigo Quilez): circle r1 near the tip, r2 at the neck.
 */
const BOWL = { z1: -0.5, r1: 0.4, z2: -1.5, r2: 0.13 };
function bowlSDF(x, z) {
  const px = Math.abs(x), py = z - BOWL.z1, h = BOWL.z1 - BOWL.z2;
  const { r1, r2 } = BOWL;
  const py2 = -py; // capsule runs from the tip circle (0) toward the neck (h)
  const b = (r1 - r2) / h, a = Math.sqrt(1 - b * b), k = -px * b + py2 * a;
  if (k < 0) return Math.hypot(px, py2) - r1;
  if (k > a * h) return Math.hypot(px, py2 - h) - r2;
  return px * a + py2 * b - r1;
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Centreline of the arm, in the arm's own Y/Z plane. */
export function templeCurve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.02, -4.0),
    new THREE.Vector3(0, -0.06, -8.6),
    new THREE.Vector3(0, -0.45, -10.9),
    new THREE.Vector3(0, -1.45, -12.1),
    new THREE.Vector3(0, -2.7, -12.5),
    new THREE.Vector3(0, -3.9, -12.4),
  ], false, 'centripetal');
}

export const TEMPLE = {
  armH0: 0.95,   // bar height at the hinge (cm)
  armH1: 0.52,   // bar height where the paddle begins
  armT: 0.19,    // half thickness of the bar
  padStart: 0.8, // fraction of arc length where the paddle begins to swell
  padW: 1.04,    // paddle full width (about 1.5x armH1)
  padT: 0.28,    // paddle half thickness (thicker, so the bowl can be deep)
  bowlDepth: 0.34,
};

/**
 * Build the arm. Cross sections are superellipses (flat faces, rounded
 * edges, the look of polished acetate). Near the end the section height
 * follows a teardrop, closing to a hemispherical tip.
 */
export function templeGeometry(side = 1, { along = 380, around = 72 } = {}) {
  const T = TEMPLE, curve = templeCurve();
  const L = curve.getLength();
  const frames = curve.computeFrenetFrames(along, false);
  const pos = [], uv = [], idx = [];
  const P = new THREE.Vector3(), tan = new THREE.Vector3();
  const B = new THREE.Vector3(1, 0, 0);          // across the bar (thickness)
  const N = new THREE.Vector3();                  // in plane (height)

  const s0 = T.padStart * L;       // paddle swell starts
  const tipR = T.padW / 2;         // the end is a half disc of this radius
  const sEnd = L;                  // end of centreline
  for (let i = 0; i <= along; i++) {
    const u = i / along, s = u * L;
    curve.getPointAt(u, P); curve.getTangentAt(u, tan);
    N.crossVectors(tan, B).normalize();           // perpendicular to tangent in Y/Z

    // Height profile: the bar tapers from hinge to neck, then over the last
    // PAD cm it swells into a teardrop (max ~1.55x the neck) and closes
    // with a round end: section half-height follows a circle of radius R.
    const PAD = 2.3, R = T.padW / 2, neck = T.armH1 / 2;
    let hh = THREE.MathUtils.lerp(T.armH0, T.armH1, smooth(0, L - PAD, s)) / 2;
    const t = (s - (L - PAD)) / PAD;                       // 0 neck .. 1 tip
    const k = smooth(0, 0.55, t);
    let tt = THREE.MathUtils.lerp(T.armT, T.padT, k);
    if (t > 0) {
      const cz = L - R;                                    // centre of the round end
      const d = s - cz;
      const round = d > 0 ? Math.sqrt(Math.max(0, R * R - d * d)) : R;
      // Blend neck to full width with an ease, then follow the circle.
      hh = d > 0 ? round : THREE.MathUtils.lerp(neck, R, Math.pow(k, 0.9));
      if (d > 0) tt *= Math.pow(Math.max(round / R, 0.001), 0.5);
    }
    let push = 0;
    if (i === along) { hh = 0.0001; tt = 0.0001; push = 0; }

    for (let j = 0; j <= around; j++) {
      const a = (j / around) * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      // Rounded-rectangle section: flat faces, soft acetate edges.
      const cx = Math.sign(ca) * Math.pow(Math.abs(ca), 0.6);
      const sy = Math.sign(sa) * Math.pow(Math.abs(sa), 0.35);
      const v = cx * hh;          // in-plane offset (height / paddle width)
      let w = sy * tt;            // across offset (thickness), + = outer face

      // Teardrop bowl pressed into the inner face (w < 0 side). Its outline
      // is an exact 2D signed distance (an "uneven capsule": big round end
      // near the tip, narrow end toward the arm) in real cm, so the bowl
      // shape does not depend on how the section is sampled.
      if (sy < 0) {
        const d = bowlSDF(v, s - L);
        if (d < 0.05) {
          const inside = Math.min(1, Math.max(0, -d / 0.24));
          // Rounded floor, shallower toward the narrow neck like a real spoon bowl.
          const depth = T.bowlDepth * (1 - (1 - inside) ** 2) * (0.3 + 0.7 * smooth(-1.85, -0.95, s - L));
          const lip = Math.exp(-(((d - 0.03) / 0.035) ** 2)) * 0.02;  // thin raised rim
          const face = smooth(0.45, 0.85, -sy);
          w += face * (depth - lip);
        }
      }
      pos.push(P.x + B.x * w * side, P.y + N.y * v, P.z + N.z * v);
      uv.push(u, j / around);
    }
  }
  const R = around + 1;
  for (let i = 0; i < along; i++) for (let j = 0; j < around; j++) {
    const a = i * R + j, b = a + R, c = b + 1, d = a + 1;
    if (side > 0) idx.push(a, b, d, b, c, d); else idx.push(a, d, b, b, d, c);
  }
  // Cap the hinge end.
  const centre = pos.length / 3; pos.push(0, 0, 0); uv.push(0, 0);
  for (let j = 0; j < around; j++) side > 0 ? idx.push(centre, j + 1, j) : idx.push(centre, j, j + 1);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Centre of the bowl in arm space (salt is poured from here). */
export function bowlCentre(side = 1) {
  const c = templeCurve(), L = c.getLength();
  const p = c.getPointAt((L - 0.95) / L);
  p.x -= side * TEMPLE.padT * 0.6;
  return p;
}
