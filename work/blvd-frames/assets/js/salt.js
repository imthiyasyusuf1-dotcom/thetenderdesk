/**
 * salt.js
 * GPU salt sim. Each grain has a target on a word, sampled from an
 * offscreen 2D canvas. The vertex shader does the whole flight:
 * spoon tip -> gravity arc with curl-ish noise -> settle on the glyph.
 * One uniform (uProgress) drives it, so it is fully scroll scrubbable
 * and costs nothing on the CPU per frame.
 */
import * as THREE from 'three';

function sampleText(text, count) {
  const c = document.createElement('canvas');
  const lines = text.split('\n');
  const W = 1400, H = 230 * lines.length + 30; c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  // Two lines on narrow screens is handled by the caller via scale.
  g.font = `400 ${lines.length > 1 ? 210 : 150}px Anton, Impact, sans-serif`;
  lines.forEach((l, i) => g.fillText(l, W / 2, (H / lines.length) * (i + .5), W - 40));
  const d = g.getImageData(0, 0, W, H).data;
  const pts = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 128) pts.push(x / W - 0.5, 0.5 - y / H);
  const out = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const k = (Math.random() * (pts.length / 2)) | 0;
    out[i * 2] = pts[k * 2] + (Math.random() - 0.5) * 0.002;
    out[i * 2 + 1] = (pts[k * 2 + 1]) * (H / W) + (Math.random() - 0.5) * 0.002;
  }
  return out;
}

export function makeSalt({ count, text, dpr }) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seed[i] = Math.random();
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  const target = new THREE.BufferAttribute(sampleText(text, count), 2);
  geo.setAttribute('aTarget', target);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100); // never cull

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uProgress: { value: 0 }, uTime: { value: 0 }, uTip: { value: new THREE.Vector3() },
      uScale: { value: new THREE.Vector2(3, 3) }, uSize: { value: (w0 => w0 < 600 ? 2.3 : 2.6)(innerWidth) * dpr },
    },
    vertexShader: /* glsl */`
      attribute vec4 aSeed; attribute vec2 aTarget;
      uniform float uProgress, uTime, uSize; uniform vec3 uTip; uniform vec2 uScale;
      varying float vA;
      // cheap hash noise, good enough for grain jitter
      float h(float n){ return fract(sin(n) * 43758.5453); }
      void main(){
        // Staggered start: grains leave the spoon in a stream, not a block.
        float delay = aSeed.x * .5;
        float t = clamp((uProgress - delay) / .38, 0., 1.);
        float e = t * t * (3. - 2. * t);
        vec3 start = uTip + (aSeed.yzw - .5) * vec3(.03, .012, .04);
        vec3 end = vec3(aTarget * uScale.x + vec2(0., uScale.y), -4.2);
        // Arc: drop under gravity first, then swing to the glyph.
        vec3 mid = mix(start, end, .5) + vec3((aSeed.y - .5) * 1.4, -1.2 - aSeed.z, .6);
        vec3 p = mix(mix(start, mid, e), mix(mid, end, e), e);
        // Drift that dies as the grain lands.
        float n = (1. - e) * .25;
        p.x += sin(uTime * 1.7 + aSeed.w * 40.) * n;
        p.y += cos(uTime * 1.3 + aSeed.y * 40.) * n;
        // Settled grains shimmer very slightly.
        p.xy += (vec2(h(aSeed.x + floor(uTime * 8.)), h(aSeed.y + floor(uTime * 8.))) - .5) * .004 * e;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (.7 + aSeed.w * .8) * (4.2 / -mv.z);
        vA = step(.001, uProgress - delay) * (.55 + .45 * aSeed.z);
      }`,
    fragmentShader: /* glsl */`
      varying float vA;
      void main(){
        vec2 c = gl_PointCoord - .5;
        // Faceted crystal, not a soft dot: diamond falloff.
        float d = abs(c.x) + abs(c.y);
        if (d > .5) discard;
        gl_FragColor = vec4(vec3(1., .97, .94), min(1., vA * 1.6) * (1. - d * 1.2));
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 10;

  return {
    points,
    resize(w, h, camera) {
      // Fit the word to ~84% of the visible width at z = -4.2.
      const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 4.2;
      const vw = vh * (w / h);
      mat.uniforms.uScale.value.set(vw * (w < h ? 0.92 : 0.84), vh * (w < h ? -0.1 : -0.12));
    },
    update(time, progress, tip) {
      mat.uniforms.uTime.value = time;
      mat.uniforms.uProgress.value = progress;
      mat.uniforms.uTip.value.copy(tip);
      points.visible = progress > 0.001;
    },
  };
}
