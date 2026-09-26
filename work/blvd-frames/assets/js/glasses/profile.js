/**
 * glasses/profile.js
 * 2D outlines for the front of a BLVD frame, in centimetres.
 * Traced from hires/coco-chanel_1.jpg and the Groovers / Ghost Chrome
 * product shots: soft rounded-square lenses (a superellipse, the brow
 * lifted a touch at the temple), a thick chunky acetate rim of even width
 * all the way round and a solid moulded bridge. Only the right half is
 * authored; the left is mirrored so both sides are identical.
 */
import * as THREE from 'three';

/** Lens centre and size (right side). */
export const LENS = { cx: 3.62, cy: -0.02, a: 2.36, b: 1.62, n: 3.4 };
/** Outer rim: the lens grown by a chunky, even acetate border. */
const RIM = { a: 3.0, b: 2.24, n: 3.8, cy: 0.1 };

const se = (t, n) => Math.sign(t) * Math.pow(Math.abs(t), 2 / n);

/** Point on the lens outline at angle th (0 = temple side, PI = nose). */
function lensPoint(th) {
  const { cx, cy, a, b, n } = LENS;
  let x = se(Math.cos(th), n) * a, y = se(Math.sin(th), n) * b;
  if (y > 0) y += 0.1 * (x / a);                                  // brow lift
  if (y < 0 && x < 0) x *= 1 - 0.12 * (-y / b) * (-x / a);       // nasal tuck
  return [cx + x, cy + y];
}

function outerPoint(th) {
  let x = se(Math.cos(th), RIM.n) * RIM.a, y = se(Math.sin(th), RIM.n) * RIM.b;
  if (y > 0) y += 0.1 * (x / RIM.a);
  return [LENS.cx + x, RIM.cy + y];
}

/** Right half of the outer frame: bridge top, round the lens, bridge bottom. */
function outerRight() {
  const pts = [[0, 1.86], [0.5, 1.87]];
  const N = 72, th0 = 0.79 * Math.PI, th1 = -0.76 * Math.PI;
  for (let i = 0; i <= N; i++) pts.push(outerPoint(th0 + (th1 - th0) * (i / N)));
  // Solid bridge underside: a soft arch over the nose.
  pts.push([0.72, -1.05], [0.5, -0.4], [0.26, 0.04], [0, 0.14]);
  return pts;
}

const toVecs = (pts, sx = 1) => pts.map(([x, y]) => new THREE.Vector2(x * sx, y));

function outerShape() {
  const right = outerRight();
  const left = right.slice(1, -1).reverse().map(([x, y]) => [-x, y]);
  const pts = toVecs([...right, ...left]);
  const s = new THREE.Shape();
  s.moveTo(pts[0].x, pts[0].y);
  s.splineThru(pts.slice(1).concat([pts[0]]));
  return s;
}

/** Lens outline for one side as a closed path. side = 1 (right) or -1 (left). */
export function lensPath(side, grow = 0, N = 120) {
  const pts = [];
  for (let i = 0; i < N; i++) {
    let [x, y] = lensPoint((i / N) * Math.PI * 2);
    if (grow) { x = LENS.cx + (x - LENS.cx) * (1 + grow); y = LENS.cy + (y - LENS.cy) * (1 + grow); }
    pts.push(new THREE.Vector2(x * side, y));
  }
  if (side > 0) pts.reverse();
  const p = new THREE.Shape();
  p.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i].x, pts[i].y);
  p.closePath();
  return p;
}

/** The front as a shape with both lens apertures cut out. */
export function frontShape() {
  const s = outerShape();
  s.holes.push(lensPath(1), lensPath(-1));
  return s;
}

/** Face-form wrap: the front bows back toward the temples like a real frame. */
export const WRAP = 0.019;
export const wrapZ = (x) => -WRAP * x * x;

/** Hinge position (cm) on the right side before wrap is applied. */
export const HINGE = { x: 6.42, y: 1.05 };
