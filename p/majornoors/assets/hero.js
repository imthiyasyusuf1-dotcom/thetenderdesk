// Photoreal parallax hero: every pixel is the real bottle / chilli photo, displaced by a depth map.
(function () {
  const cv = document.getElementById('gl');
  if (!cv) return;
  const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true });
  if (!gl) { document.documentElement.classList.add('nogl'); return; }
  const V = `attribute vec2 p;uniform vec4 r;uniform float rot;uniform vec2 res;varying vec2 uv;
  void main(){uv=vec2(p.x*.5+.5,.5+p.y*.5);vec2 q=p*r.zw*.5;float c=cos(rot),s=sin(rot);q=mat2(c,s,-s,c)*q;
  vec2 xy=(r.xy+q)/res*2.-1.;gl_Position=vec4(xy.x,-xy.y,0.,1.);}`;
  const F = `precision highp float;varying vec2 uv;uniform sampler2D t,d;uniform vec2 off;uniform float sh,al,dk;
  void main(){vec2 u=uv;float h=0.;for(int i=0;i<4;i++){h=texture2D(d,u).r;u=uv+off*(h-.45);}
  vec4 c=texture2D(t,clamp(u,0.,1.));float band=smoothstep(.16,0.,abs(uv.x-.34-off.x*6.-sh*.25));
  c.rgb+=c.a*band*.16*h;c.rgb*=dk;gl_FragColor=c*al;}`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) console.log('SHERR',gl.getShaderInfoLog(o)); return o; }
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, V)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, F)); gl.linkProgram(pr); if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){console.log('GLERR',gl.getProgramInfoLog(pr));} gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const P = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(P); gl.vertexAttribPointer(P, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n); const u = { r: U('r'), rot: U('rot'), res: U('res'), off: U('off'), sh: U('sh'), al: U('al'), dk: U('dk'), t: U('t'), d: U('d') };
  gl.uniform1i(u.t, 0); gl.uniform1i(u.d, 1); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const load = s => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = s; });
  function tex(img) { const x = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, x); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return x; }
  const v = '?v=3';
  const names = ['bottle', 'chilli-cut'];
  Promise.all(names.flatMap(n => [load('assets/' + n + '.webp' + v), load('assets/' + n + '-depth.webp' + v)])).then(im => {
    const T = {}; names.forEach((n, i) => T[n] = { t: tex(im[i * 2]), d: tex(im[i * 2 + 1]), ar: im[i * 2].width / im[i * 2].height });
    let W, H, dpr; let mx = 0, my = 0, tx = 0, ty = 0;
    function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(u.res, cv.width, cv.height); }
    size(); addEventListener('resize', size);
    addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
    const st = document.querySelector('.hero');
    function quad(o, x, y, h, rot, ox, oy, al, dk) {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, o.t); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, o.d);
      gl.uniform4f(u.r, x * dpr, y * dpr, h * o.ar * dpr, h * dpr); gl.uniform1f(u.rot, rot); gl.uniform2f(u.off, ox, oy); gl.uniform1f(u.al, al); gl.uniform1f(u.dk, dk);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    const SHOT = location.search.includes('shot'); const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function draw(now) {
      const r = st.getBoundingClientRect(); const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      const tm = reduce ? 0 : now / 1000;
      mx += (tx + Math.sin(tm * .6) * .25 - mx) * .06; my += (ty + Math.cos(tm * .5) * .12 - my) * .06;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const mob = W < 760; const bh = Math.min(H * (mob ? .52 : .78), W * (mob ? 1.35 : .62)) * (1 + p * .18);
      const cx = W * (mob ? .5 : .5), cy = H * (mob ? .45 : .52) - p * H * .06;
      gl.uniform1f(u.sh, p);
      // back chilli (blurred feel via darker + smaller)
      quad(T['chilli-cut'], cx + W * (mob ? .3 : -.2) + mx * 30, cy - bh * (mob ? .36 : .3) - p * H * .25 + my * 20, bh * .2, (mob ? -0.9 : 0.6) + p * .5, mx * .015, my * .015, 1, .62);
      quad(T.bottle, cx + mx * 14, cy + my * 8, bh, (mx * .05) + p * -.08, mx * -.03, my * -.02, 1, 1);
      // front chilli
      quad(T['chilli-cut'], cx + W * (mob ? -.2 : .2) - mx * 60, cy + bh * (mob ? .34 : .3) + p * H * .2 - my * 30, bh * .3, (mob ? .32 : -.35) - p * .4, mx * .03, my * .03, 1, 1);
    }
    function loop(t){ draw(t); if (!document.hidden && !SHOT) requestAnimationFrame(loop); }
    window.__heroDraw = () => draw(performance.now());
    requestAnimationFrame(loop); document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(loop); });
    document.documentElement.classList.add('gl-on');
  }).catch(() => document.documentElement.classList.add('nogl'));
})();
