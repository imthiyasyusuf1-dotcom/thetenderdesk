/**
 * glasses/profile.js
 * 2D outlines for the front of a BLVD wayfarer, in centimetres.
 * Traced from the product shots: a straight, slightly lifted brow line,
 * a wide outer "wing" at the hinge corner, a keyhole bridge and lenses
 * that taper toward the nose. Only the right half is authored; the left
 * is mirrored so both sides are guaranteed identical.
 */
import * as THREE from 'three';

/** Right half of the outer frame, top centre round to bottom centre. */
const OUTER_R = [
  [0.0, 1.72], [1.5, 1.96], [4.0, 2.13], [6.2, 2.16], [7.08, 2.02], [7.36, 1.5],
  [7.22, 0.6], [6.82, -0.62], [6.12, -1.62], [5.0, -2.14], [3.6, -2.22], [2.38, -2.0],
  [1.58, -1.4], [1.18, -0.62], [0.8, -0.08], [0.0, 0.14],
];

/** Right lens aperture. Wide at the temple, narrower and lower at the nose. */
export const LENS_R = [
  [1.52, 1.34], [3.0, 1.55], [5.0, 1.62], [6.45, 1.5], [6.84, 1.0], [6.68, 0.0],
  [6.22, -0.98], [5.3, -1.8], [3.8, -1.93], [2.62, -1.68], [1.86, -1.02], [1.52, 0.0],
];

const toVecs = (pts, sx = 1) => pts.map(([x, y]) => new THREE.Vector2(x * sx, y));

/** Full front outline (both halves) as one closed spline. */
function outerShape() {
  const right = OUTER_R;
  const left = right.slice(1, -1).reverse().map(([x, y]) => [-x, y]);
  const s = new THREE.Shape();
  // Clockwise: top centre, down the right side, bottom centre, up the left.
  const pts = toVecs([...right, ...left]);
  s.moveTo(pts[0].x, pts[0].y);
  s.splineThru(pts.slice(1).concat([pts[0]]));
  return s;
}

/** Lens outline for one side as a closed path. side = 1 (right) or -1 (left). */
export function lensPath(side, grow = 0) {
  const c = new THREE.Vector2(4.1 * side, 0);
  let pts = toVecs(LENS_R, side);
  if (grow) pts = pts.map((p) => p.clone().sub(c).multiplyScalar(1 + grow).add(c));
  if (side < 0) pts.reverse();
  const p = new THREE.Shape();
  p.moveTo(pts[0].x, pts[0].y);
  p.splineThru(pts.slice(1).concat([pts[0]]));
  return p;
}

/** The front as a shape with both lens apertures cut out. */
export function frontShape() {
  const s = outerShape();
  s.holes.push(lensPath(1), lensPath(-1));
  return s;
}

/** Face-form wrap: the front bows back toward the temples like a real frame. */
export const WRAP = 0.021;
export const wrapZ = (x) => -WRAP * x * x;

/** Hinge position (cm) on the right side before wrap is applied. */
export const HINGE = { x: 6.95, y: 1.18 };
