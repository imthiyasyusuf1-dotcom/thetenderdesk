/* NOIR v2: single full-screen raw WebGL layer.
   Scene photos as textures, film grain, noise-warped blur, mouse lens ripple,
   scroll-driven noise-threshold dissolves. Falls back to the CSS scenes if unavailable. */
(function(){
  var LITE=matchMedia('(max-width:760px)').matches; // phones: lighter shader (3 octaves, 3 blur taps, low-res buffer)
  if(LITE&&(navigator.hardwareConcurrency||4)<4) return;
  var cv=document.getElementById('gl'); if(!cv) return;
  var gl=cv.getContext('webgl',{antialias:false,alpha:false,premultipliedAlpha:false,powerPreference:'high-performance'});
  if(!gl) return;
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

  var VS='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FS=[
  (LITE?'#define OCT 3\n#define TAPS 3\n':'#define OCT 5\n#define TAPS 6\n')+'precision highp float;varying vec2 v;',
  'uniform sampler2D uA,uB;uniform vec2 uRes,uSA,uSB,uMouse;uniform float uTime,uProg,uDimA,uDimB,uVel,uMotion;',
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
  ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
  'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<OCT;i++){s+=a*n2(p);p*=2.03;a*=.5;}return s;}',
  'vec2 cover(vec2 uv,vec2 img){float r=uRes.x/uRes.y,ir=img.x/img.y;vec2 s=r>ir?vec2(1.,ir/r):vec2(r/ir,1.);return (uv-.5)*s+.5;}',
  'vec3 samp(sampler2D t,vec2 uv,vec2 sz,float blur){',
  ' uv=cover(uv,sz);uv.y=1.-uv.y;vec3 c=vec3(0.);float ang=fbm(uv*3.+uTime*.05)*6.2831;',
  ' for(int i=0;i<TAPS;i++){float a=ang+float(i)*6.2831/float(TAPS);c+=texture2D(t,uv+vec2(cos(a),sin(a))*blur).rgb;}',
  ' return c/float(TAPS);}',
  'void main(){',
  ' vec2 uv=v;float asp=uRes.x/uRes.y;',
  ' vec2 d=(uv-uMouse)*vec2(asp,1.);float r=length(d);',
  ' float lens=exp(-r*r*18.)*.035*uMotion;',
  ' float rip=sin(r*46.-uTime*5.)*exp(-r*7.)*.006*uVel;',
  ' vec2 dir=r>0.?d/r:vec2(0.);uv-=dir*(lens*r*4.+rip)/vec2(asp,1.);',
  ' vec2 w=vec2(fbm(uv*2.+uTime*.03),fbm(uv*2.+7.3-uTime*.03))-.5;uv+=w*.012*uMotion;',
  ' float bl=.0016+.004*smoothstep(.2,.9,fbm(uv*1.5+uTime*.02));',
  ' vec3 A=samp(uA,uv,uSA,bl)*uDimA,B=samp(uB,uv,uSB,bl)*uDimB;',
  ' float n=fbm(v*vec2(asp,1.)*2.2+uTime*.04);float e=.09;',
  ' float t=uProg*(1.+2.*e)-e;float m=smoothstep(n-e,n+e,t);',
  ' vec3 col=mix(A,B,m);',
  ' float edge=(1.-abs(m*2.-1.))*step(.001,uProg)*step(uProg,.999);',
  ' col+=vec3(.79,.64,.36)*edge*.35;',
  ' float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,.88);',
  ' col=col*vec3(1.02,.96,1.)+vec3(.012,.004,.01);',
  ' col=pow(col,vec3(1.08));',
  ' float vg=smoothstep(1.25,.25,length((v-.5)*vec2(asp*.8,1.)));col*=mix(.35,1.,vg);',
  ' float g=h(v*uRes+fract(uTime*7.)*100.)-.5;col+=g*.07;',
  ' col+=(h(gl_FragCoord.xy)-.5)/255.;',
  ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  function sh(t,src){var s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(s));return null}return s}
  var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS); if(!vs||!fs) return;
  var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var U={};['uA','uB','uRes','uSA','uSB','uMouse','uTime','uProg','uDimA','uDimB','uVel','uMotion'].forEach(function(n){U[n]=gl.getUniformLocation(pr,n)});
  gl.uniform1i(U.uA,0);gl.uniform1i(U.uB,1);

  // scene textures in scroll order: hero, smoke, oud, rose, amber, collection, craft, quiz
  var SRC=['hero','smoke','oud','rose','amber','f2','craft','quiz'];
  var DIM=[1,1,1,1,1,.32,1,.7];
  var tex=SRC.map(function(){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array([10,7,9]));
    return {t:t,w:1,h:1}});
  var pending=SRC.length;
  SRC.forEach(function(n,i){var im=new Image();im.decoding='async';im.onload=function(){
    var T=tex[i];gl.bindTexture(gl.TEXTURE_2D,T.t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    T.w=im.naturalWidth;T.h=im.naturalHeight;
    if(--pending===0) document.documentElement.classList.add('gl');
  };im.onerror=function(){pending=-99};im.src='img/'+n+(LITE?'-m':'')+'.webp';});
  // until all textures are ready the CSS scenes stay visible (no black flash)
  tex.forEach(function(T){gl.bindTexture(gl.TEXTURE_2D,T.t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)});

  function resize(){var dpr=LITE?Math.min(devicePixelRatio||1,2)*.5:Math.min(devicePixelRatio||1,1.5);
    cv.width=Math.round(innerWidth*dpr);cv.height=Math.round(innerHeight*dpr);gl.viewport(0,0,cv.width,cv.height);}
  resize();addEventListener('resize',resize);

  // scroll -> scene value, piecewise linear keyframes rebuilt on every ScrollTrigger refresh
  var K=[[0,0]];
  function stFor(id){if(!window.ScrollTrigger)return null;var el=document.getElementById(id);
    return ScrollTrigger.getAll().filter(function(s){return s.trigger===el&&s.pin})[0]||null}
  function top(id){var el=document.getElementById(id);return el.getBoundingClientRect().top+scrollY}
  function build(){
    var H=innerHeight,k=[],hs=stFor('hero'),ns=stFor('notes'),cs=stFor('craft');
    if(!hs||!ns){k=[[0,0],[H,1]];K=k;return}
    var hl=hs.end-hs.start;k.push([hs.start,0],[hs.start+hl*.45,0],[hs.end,1]);
    var nl=ns.end-ns.start;
    for(var i=1;i<4;i++){k.push([ns.start+nl*(i-.25)/4,i],[ns.start+nl*(i+.15)/4,i+1]);}
    var ct=top('collection');var co=stFor('collection');
    k.push([Math.max(ns.end,ct-H*.5),4],[co?co.start:ct,5]);
    var cst=cs?cs.start:top('craft');k.push([cst-H*.6,5],[cst,6]);
    var qt=cs?cs.end+H:top('discover');k.push([qt-H*.8,6],[qt-H*.05,7]);
    k.sort(function(a,b){return a[0]-b[0]});K=k;
  }
  function sceneAt(y){if(y<=K[0][0])return K[0][1];
    for(var i=1;i<K.length;i++){if(y<=K[i][0]){var a=K[i-1],c=K[i],d=c[0]-a[0];return d>0?a[1]+(c[1]-a[1])*(y-a[0])/d:c[1]}}
    return K[K.length-1][1]}
  if(window.ScrollTrigger){ScrollTrigger.addEventListener('refresh',build);}
  build();

  var mx=.5,my=.5,sx=.5,sy=.5,vel=0,lx=0,ly=0;
  addEventListener('pointermove',function(e){mx=e.clientX/innerWidth;my=1-e.clientY/innerHeight;},{passive:true});
  if(LITE){addEventListener('touchstart',function(e){var T=e.touches[0];mx=T.clientX/innerWidth;my=1-T.clientY/innerHeight;},{passive:true});addEventListener('touchmove',function(e){var T=e.touches[0];mx=T.clientX/innerWidth;my=1-T.clientY/innerHeight;},{passive:true});}

  var raf=0,t0=performance.now(),last=t0,frozen=0;
  function frame(now){
    raf=requestAnimationFrame(frame);
    var dt=Math.min(.05,(now-last)/1000);last=now;
    var t=reduce?frozen:(now-t0)/1000;
    sx+=(mx-sx)*Math.min(1,dt*6);sy+=(my-sy)*Math.min(1,dt*6);
    var sp=Math.hypot(sx-lx,sy-ly)/Math.max(dt,.001);lx=sx;ly=sy;
    vel+=(Math.min(1,sp*.6)-vel)*Math.min(1,dt*4);
    var s=Math.max(0,Math.min(SRC.length-1,sceneAt(scrollY))),a=Math.floor(s),bI=Math.min(SRC.length-1,a+1),p=s-a;
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex[a].t);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tex[bI].t);
    gl.uniform2f(U.uRes,cv.width,cv.height);gl.uniform2f(U.uSA,tex[a].w,tex[a].h);gl.uniform2f(U.uSB,tex[bI].w,tex[bI].h);
    gl.uniform2f(U.uMouse,sx,sy);gl.uniform1f(U.uTime,t);gl.uniform1f(U.uProg,p);
    gl.uniform1f(U.uDimA,DIM[a]);gl.uniform1f(U.uDimB,DIM[bI]);
    gl.uniform1f(U.uVel,reduce?0:vel);gl.uniform1f(U.uMotion,reduce?0:1);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
  function stop(){if(raf){cancelAnimationFrame(raf);raf=0}}
  document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();stop();document.documentElement.classList.remove('gl')});
  start();
})();
