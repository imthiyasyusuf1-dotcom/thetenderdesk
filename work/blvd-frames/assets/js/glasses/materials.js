/**
 * glasses/materials.js
 * Glossy acetate and tinted lens materials, plus the real in-stock
 * colourways (sampled from the product photography).
 */
import * as THREE from 'three';

/** In-stock frame colours. `lens` is the tint, `mirror` adds a flash coat. */
export const COLOURWAYS = [
  { id: 'coco-chanel', name: 'Coco Chanel', frame: 0xf3ddd6, lens: 0x2b2522, mirror: 0.0 },
  { id: 'red-groovers', name: 'Cherry Groovers', frame: 0x9e1522, lens: 0x1a1414, mirror: 0.0 },
  { id: 'salmon-bomber', name: 'Salmon Bomber', frame: 0xf4a0b8, lens: 0x3a332c, mirror: 0.0, clear: true },
  { id: 'ghost-chrome', name: 'Ghost Chrome', frame: 0xf2d6dc, lens: 0xb9bcc2, mirror: 0.75 },
  { id: 'raver', name: 'Raver', frame: 0xf6eeee, lens: 0xff5a1a, mirror: 0.6 },
];

export function makeAcetate(mobile) {
  const m = new THREE.MeshPhysicalMaterial({
    color: COLOURWAYS[0].frame,
    roughness: 0.16,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.15,
    // Clear acetate (Salmon Bomber) uses a cheap alpha, not transmission:
    // transmission needs an extra full screen pass and kills phones.
    transparent: false,
  });
  if (!mobile) { m.sheen = 0.25; m.sheenColor = new THREE.Color(0xffffff); }
  return m;
}

export function makeLens() {
  return new THREE.MeshPhysicalMaterial({
    color: COLOURWAYS[0].lens,
    roughness: 0.02,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 1.6,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export function makeMetal() {
  return new THREE.MeshStandardMaterial({ color: 0xd9d6d2, metalness: 1, roughness: 0.25 });
}

/** Apply a colourway. Returns true so callers can request a re-render. */
export function applyColourway(cw, { acetate, lens }) {
  acetate.color.setHex(cw.frame);
  acetate.transparent = !!cw.clear;
  acetate.opacity = cw.clear ? 0.72 : 1;
  acetate.depthWrite = !cw.clear;
  acetate.needsUpdate = true;
  lens.color.setHex(cw.lens);
  lens.metalness = 0.1 + cw.mirror * 0.8;
  lens.opacity = cw.mirror ? 0.96 : 0.88;
  return true;
}
