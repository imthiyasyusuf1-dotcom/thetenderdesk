/**
 * glasses/model.js
 * Assembles a BLVD frame from its parts and merges them into as few draw
 * calls as possible:
 *   1. acetate: front, nose pads, hinge blocks and both temples (one mesh)
 *   2. lenses: both lenses (one mesh)
 *   3. metal: the tiny hinge barrels (one mesh)
 * Units are centimetres; the caller scales the group.
 */
import * as THREE from 'three';
import { frontShape, lensPath, wrapZ, HINGE } from './profile.js';
import { templeGeometry, bowlCentre } from './temple.js';

const FRONT_DEPTH = 0.42;   // acetate front thickness (before bevel)
const BEVEL = 0.13;

/** Minimal indexed merge (position, normal, uv). Keeps this dependency free. */
export function merge(geos) {
  let vCount = 0, iCount = 0;
  const list = geos.map((g) => (g.index ? g : g.toNonIndexed && indexify(g)));
  list.forEach((g) => { vCount += g.attributes.position.count; iCount += g.index.count; });
  const pos = new Float32Array(vCount * 3), nor = new Float32Array(vCount * 3), uv = new Float32Array(vCount * 2);
  const idx = new Uint32Array(iCount);
  let vo = 0, io = 0;
  for (const g of list) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, vo * 3);
    nor.set(g.attributes.normal.array, vo * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0, n * 2), vo * 2);
    const gi = g.index.array;
    for (let k = 0; k < gi.length; k++) idx[io + k] = gi[k] + vo;
    vo += n; io += gi.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  return out;
}
function indexify(g) {
  const n = g.attributes.position.count, a = new Uint32Array(n);
  for (let i = 0; i < n; i++) a[i] = i;
  g.setIndex(new THREE.BufferAttribute(a, 1));
  return g;
}

/** Bend a geometry around the face: z += wrapZ(x). */
function wrap(g, k = 1) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + wrapZ(p.getX(i)) * k);
  g.computeVertexNormals();
  return g;
}

function frontGeometry(detail) {
  const g = new THREE.ExtrudeGeometry(frontShape(), {
    depth: FRONT_DEPTH, curveSegments: detail, steps: 1,
    bevelEnabled: true, bevelThickness: BEVEL, bevelSize: 0.11, bevelSegments: Math.max(3, detail >> 2),
  });
  g.translate(0, 0, -FRONT_DEPTH / 2);
  g.clearGroups();
  // Crease-free normals on the bevel look like polished acetate.
  return wrap(g);
}

function lensGeometry(detail) {
  const geos = [1, -1].map((side) => {
    const g = new THREE.ShapeGeometry(lensPath(side, 0.035), detail);
    // Give each lens a gentle spherical base curve so reflections bend.
    const p = g.attributes.position, cx = 4.1 * side;
    for (let i = 0; i < p.count; i++) {
      const dx = p.getX(i) - cx, dy = p.getY(i);
      p.setZ(i, 0.05 - (dx * dx + dy * dy) * 0.012);
    }
    return wrap(g);
  });
  return merge(geos);
}

/** Hinge block: a small rounded lug on the back of the front at each corner. */
function hingeBlocks() {
  const geos = [];
  for (const side of [1, -1]) {
    const g = new THREE.BoxGeometry(0.42, 0.9, 0.9, 2, 2, 2);
    // Round the box a little by normalising toward a capsule.
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const r = new THREE.Vector3(v.x / 0.21, v.y / 0.45, v.z / 0.45);
      const f = 1 / Math.max(1, r.length() * 0.8);
      p.setXYZ(i, v.x * (0.6 + 0.4 * f), v.y * (0.8 + 0.2 * f), v.z * (0.6 + 0.4 * f));
    }
    g.computeVertexNormals();
    const x = side * (HINGE.x - 0.12);
    g.translate(x, HINGE.y, wrapZ(x) - FRONT_DEPTH / 2 - BEVEL - 0.4);
    geos.push(g);
  }
  return geos;
}

/** Nose pads moulded into the bridge (acetate, like the real frames). */
function nosePads() {
  const geos = [];
  for (const side of [1, -1]) {
    const g = new THREE.SphereGeometry(1, 16, 12);
    g.scale(0.14, 0.42, 0.24);
    g.rotateZ(side * 0.42);
    g.translate(side * 1.02, -0.62, -FRONT_DEPTH / 2 - BEVEL - 0.08);
    geos.push(g);
  }
  return geos;
}

/**
 * Temple placement: from the hinge, toe out slightly (the arms splay
 * wider than the front) and tilt down (pantoscopic angle), so at rest
 * the arms read as a real pair of glasses, not a rigid box.
 */
export const ARM_POSE = { toe: 0.085, tilt: -0.1 };
function armMatrix(side) {
  const x = side * HINGE.x;
  const m = new THREE.Matrix4().makeTranslation(x, HINGE.y - 0.08, wrapZ(x) - FRONT_DEPTH / 2 - BEVEL - 0.7);
  m.multiply(new THREE.Matrix4().makeRotationY(side * ARM_POSE.toe));
  m.multiply(new THREE.Matrix4().makeRotationX(ARM_POSE.tilt));
  return m;
}

/**
 * Build the frames. Returns the group plus handles the scene needs:
 * materials (for colourways) and the bowl anchor on the (screen right)
 * arm the camera flies to.
 */
export function buildGlasses({ acetate, lens, metal, detail = 24 } = {}) {
  const group = new THREE.Group();
  group.name = 'blvd-frames';

  const arms = [1, -1].map((side) => templeGeometry(side, detail < 20 ? { along: 180, around: 32 } : undefined).applyMatrix4(armMatrix(side)));
  const acetateGeo = merge([frontGeometry(detail), ...nosePads(), ...hingeBlocks(), ...arms]);
  group.add(new THREE.Mesh(acetateGeo, acetate));
  const lenses = new THREE.Mesh(lensGeometry(detail), lens);
  lenses.renderOrder = 2;
  group.add(lenses);

  // Hinge barrels: five-knuckle look, one cylinder each side.
  const barrels = [1, -1].map((side) => {
    const g = new THREE.CylinderGeometry(0.075, 0.075, 0.62, 12);
    const x = side * (HINGE.x + 0.02);
    g.translate(x, HINGE.y - 0.08, wrapZ(x) - FRONT_DEPTH / 2 - BEVEL - 0.62);
    return g;
  });
  group.add(new THREE.Mesh(merge(barrels), metal));

  // Anchor at the bowl centre of the +X arm.
  const bowl = new THREE.Object3D();
  bowl.position.copy(bowlCentre(1)).applyMatrix4(armMatrix(1));
  group.add(bowl);
  // The direction the bowl opens toward (inner side), in model space.
  const bowlNormal = new THREE.Vector3(-1, 0, 0).applyMatrix4(new THREE.Matrix4().extractRotation(armMatrix(1)));

  return { group, bowl, bowlNormal };
}
