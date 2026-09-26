/**
 * transition.js
 * WebGL page-transition mask. A fullscreen noise-dissolve in crimson that
 * wipes in before we leave the page and wipes out on arrival. The canvas
 * only renders while a transition runs, so it costs zero frames at rest.
 */
const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `precision mediump float;
uniform vec2 r; uniform float t; uniform float dir;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float n=noise(uv*vec2(r.x/r.y,1.)*5.)*.35+noise(uv*22.)*.08;
  // sweep bottom to top on the way in, top to bottom on the way out
  float edge=mix(uv.y,1.-uv.y,dir)*.75+n;
  float a=smoothstep(t*1.25-.12,t*1.25,edge);
  a=1.-a;
  vec3 c=mix(vec3(.84,.15,.24),vec3(.027,.02,.024),smoothstep(t*1.25-.35,t*1.25-.12,edge));
  gl_FragColor=vec4(c,a);
}`;

export function createTransition(canvas) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
  if (!gl) return { out: (go) => go(), in: () => {} };
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uD = gl.getUniformLocation(pr, 'dir');
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const size = () => {
    const d = Math.min(devicePixelRatio, 1) * 0.5; // it's a soft mask; half res is plenty
    canvas.width = innerWidth * d; canvas.height = innerHeight * d;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  size(); addEventListener('resize', size);

  function run(dir, from, to, dur, done) {
    canvas.style.visibility = 'visible';
    const t0 = performance.now();
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // easeInOutCubic
      gl.uniform2f(uR, canvas.width, canvas.height); gl.uniform1f(uT, from + (to - from) * e); gl.uniform1f(uD, dir);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (k < 1) requestAnimationFrame(frame); else done && done();
    };
    requestAnimationFrame(frame);
  }
  return {
    /** Cover the screen, then call go(). */
    out: (go) => run(0, 0, 1, 750, go),
    /** Reveal the page. */
    in: () => run(1, 1, 0, 900, () => { canvas.style.visibility = 'hidden'; }),
  };
}
