(function(){
  var NS='http://www.w3.org/2000/svg';
  function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}

  // build studs and brick courses
  var studs=document.querySelector('#frame .studs');
  for(var x=150;x<=644;x+=38.0){el('rect',{x:x,y:254,width:6,height:216,class:'stud'},studs)}
  el('rect',{x:644,y:254,width:6,height:216,class:'stud'},studs);
  var walls=document.getElementById('walls');
  for(var y=450,i=0;y>=250;y-=20,i++){el('rect',{x:150,y:y,width:500,height:(y===250?20:20),fill:'url(#brick)',class:'course'},walls)}
  el('rect',{x:150,y:360,width:500,height:6,fill:'#cfc6b6',class:'course band'},walls);
  el('rect',{x:146,y:254,width:508,height:6,fill:'#cfc6b6',class:'course band'},walls);

  // form
  var qf=document.getElementById('qf');
  qf.addEventListener('submit',function(e){e.preventDefault();var ok=true;
    [].forEach.call(qf.querySelectorAll('[required]'),function(i){if(!i.value.trim()){ok=false;i.style.borderColor='#b8935a'}});
    if(ok)qf.classList.add('sent')});

  // before/after slider (works without GSAP)
  var ba=document.getElementById('ba'),after=ba.querySelector('.ba-after'),inner=ba.querySelector('.ba-in'),handle=ba.querySelector('.ba-handle');
  var pos=.5;
  function setBA(p){pos=Math.max(0,Math.min(1,p));var w=ba.clientWidth;
    after.style.transform='translateX('+(pos*w)+'px)';inner.style.transform='translateX('+(-pos*w)+'px)';
    handle.style.transform='translateX('+(pos*w)+'px)';handle.setAttribute('aria-valuenow',Math.round((1-pos)*100))}
  window.__setBA=setBA;
  setBA(.5);addEventListener('resize',function(){setBA(pos)});
  var drag=false;
  function px(e){var r=ba.getBoundingClientRect();return ((e.touches?e.touches[0].clientX:e.clientX)-r.left)/r.width}
  handle.addEventListener('pointerdown',function(e){drag=true;handle.setPointerCapture(e.pointerId);setBA(px(e))});
  handle.addEventListener('pointermove',function(e){if(drag)setBA(px(e))});
  handle.addEventListener('pointerup',function(){drag=false});
  ba.addEventListener('click',function(e){if(e.target===handle||handle.contains(e.target))return;setBA(px(e))});
  handle.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')setBA(pos-.05);if(e.key==='ArrowRight')setBA(pos+.05)});

  if(!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile=matchMedia('(max-width:760px)').matches;
  if(window.Lenis&&!reduce){
    var lenis=new Lenis({lerp:.09,smoothWheel:true});window.lenis=lenis;
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();lenis.scrollTo(t,{duration:1.6})}})});
  }

  // stage copy
  var STAGES=[
    ['00','The plot','Every home we build starts as a line on the ground.'],
    ['01','Foundations','Trench fill footings and a level slab. Nothing above is better than what is below.'],
    ['02','Frame','Structure up and checked, plumb and square, before a single brick is laid.'],
    ['03','Walls','Hand laid brick, course by course, with openings set exactly to drawing.'],
    ['04','Roof','Natural slate on treated battens. Watertight, and built to outlast the mortgage.'],
    ['05','Lights on','Keys handed over. The part we still enjoy most.']
  ];
  var sn=document.getElementById('sn'),stt=document.getElementById('st'),sd=document.getElementById('sd'),box=document.querySelector('.stagebox');
  var lis=document.querySelectorAll('.stages li'),cur=0;
  function setStage(i){if(i===cur)return;cur=i;box.classList.add('swap');
    setTimeout(function(){sn.textContent=STAGES[i][0];stt.textContent=STAGES[i][1];sd.textContent=STAGES[i][2];box.classList.remove('swap')},reduce?0:220);
    lis.forEach(function(l,k){l.classList.toggle('on',k<i)})}

  gsap.from('h1 .ln span',{yPercent:110,duration:1.3,ease:'expo.out',stagger:.09,delay:.1});

  if(reduce){setStage(5);lis.forEach(function(l){l.classList.add('on')});gsap.set('.stages b',{scaleX:1});gsap.set('.ghost,.dims',{opacity:0});gsap.set('.dusk',{opacity:1})}
  else{
  // initial states
  gsap.set('.fo',{y:-30,opacity:0});
  gsap.set('.slab',{scaleX:0,transformOrigin:'50% 50%'});
  gsap.set('.stud',{scaleY:0,transformOrigin:'50% 100%'});
  gsap.set('.plate',{scaleX:0,transformOrigin:'0% 50%'});
  gsap.set('.truss',{y:-50,opacity:0});
  gsap.set('.course',{opacity:0,y:8});
  gsap.set('#openings .win',{opacity:0,y:6});
  gsap.set('#chimney',{opacity:0,y:20});
  gsap.set('#roof',{opacity:0,y:-70});
  gsap.set('.glow,.spill,.lamp',{opacity:0});

  var bars=document.querySelectorAll('.stages b');
  var tl=gsap.timeline({defaults:{ease:'power2.out'},scrollTrigger:{trigger:'#hero',start:'top top',end:'+='+(mobile?420:480)+'%',scrub:.6,pin:true,anticipatePin:1,
    onUpdate:function(s){var p=s.progress*5.4;setStage(p<.1?0:Math.min(5,Math.floor(p)+1))}}});
  // 0-1 foundations
  tl.to('.hcopy .label,.scrollcue',{opacity:.35,duration:.3},0)
    .to('.scrollcue',{opacity:0,duration:.2},.1)
    .to('.fo',{y:0,opacity:1,stagger:.12,duration:.4},.1)
    .to('.slab',{scaleX:1,duration:.5},.45)
    .to(bars[0],{scaleX:1,ease:'none',duration:.9},.1)
  // 1-2 frame
    .to('.stud',{scaleY:1,stagger:.03,duration:.35},1)
    .to('.plate',{scaleX:1,stagger:.1,duration:.35},1.35)
    .to('.truss',{y:0,opacity:1,duration:.4},1.55)
    .to(bars[1],{scaleX:1,ease:'none',duration:.9},1)
  // 2-3 walls
    .to('.course',{opacity:1,y:0,stagger:.055,duration:.25},2)
    .to('#openings .win',{opacity:1,y:0,stagger:.06,duration:.25},2.45)
    .to('#frame',{opacity:0,duration:.3},2.6)
    .to('.ghost',{opacity:.12,duration:.4},2.4)
    .to(bars[2],{scaleX:1,ease:'none',duration:.9},2)
  // 3-4 roof
    .to('#chimney',{opacity:1,y:0,duration:.3},3)
    .to('#roof',{opacity:1,y:0,duration:.55,ease:'power3.out'},3.15)
    .to('.ghost,.dims',{opacity:0,duration:.3},3.5)
    .to(bars[3],{scaleX:1,ease:'none',duration:.9},3)
  // 4-5 lights on
    .to('.dusk',{opacity:1,duration:.8,ease:'none'},4)
    .to('.win .glow',{opacity:1,stagger:{each:.1,from:'random'},duration:.25},4.15)
    .to('.lamp',{opacity:1,duration:.2},4.5)
    .to('.spill',{opacity:1,duration:.4},4.55)
    .to(bars[4],{scaleX:1,ease:'none',duration:.9},4)
    .to({},{duration:.4});
  }

  // statement words
  var st=document.getElementById('stmt');
  st.innerHTML=st.textContent.split(' ').map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');
  if(reduce){gsap.set('#stmt .w',{opacity:1})}
  else gsap.to('#stmt .w',{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:'.statement',start:'top top',end:'+=110%',scrub:true,pin:true}});

  if(reduce){addEventListener('load',function(){ScrollTrigger.refresh()});return}

  // services
  gsap.utils.toArray('.svc').forEach(function(s){
    gsap.timeline({scrollTrigger:{trigger:s,start:'top top',end:'+=100%',scrub:true,pin:true}})
      .fromTo(s.querySelector('.media img'),{scale:1.2},{scale:1,ease:'none',duration:1},0)
      .fromTo(s.querySelector('.inner'),{y:70,opacity:0},{y:0,opacity:1,ease:'power2.out',duration:.35},.05)
      .to(s.querySelector('.inner'),{y:-50,opacity:0,ease:'power2.in',duration:.22},.78);
  });

  // before/after: scroll sweeps the slider once, then it is draggable
  var o={p:.92};
  gsap.timeline({scrollTrigger:{trigger:'#ba',start:'top top',end:'+=120%',scrub:.5,pin:true}})
    .fromTo(o,{p:.94},{p:.5,ease:'power1.inOut',duration:1,onUpdate:function(){if(!drag)setBA(o.p)}},0)
    .from('.ba-copy',{y:40,opacity:0,duration:.3},0);

  // horizontal gallery
  var track=document.querySelector('.g-track');
  gsap.to(track,{x:function(){return -(track.scrollWidth-innerWidth)},ease:'none',scrollTrigger:{trigger:'#gallery',start:'top top',end:function(){return '+='+(track.scrollWidth-innerWidth)},scrub:.5,pin:true,invalidateOnRefresh:true}});

  // process
  var steps=gsap.utils.toArray('.step'),tls=document.querySelectorAll('.tl-labels li');
  var ptl=gsap.timeline({scrollTrigger:{trigger:'#process',start:'top top',end:'+=300%',scrub:.5,pin:true,
    onUpdate:function(s){var k=Math.min(3,Math.floor(s.progress*4));tls.forEach(function(l,j){l.classList.toggle('on',j<=k)})}}});
  ptl.to('.tl-fill',{scaleX:1,ease:'none',duration:4},0);
  steps.forEach(function(el,i){
    ptl.fromTo(el.querySelector('.n'),{yPercent:25},{yPercent:-8,ease:'none',duration:1},i);
    if(i<steps.length-1) ptl.to(el,{opacity:0,y:-40,duration:.2},i+.8).fromTo(steps[i+1],{opacity:0,y:40},{opacity:1,y:0,duration:.2},i+.9);
  });

  // testimonials cycle
  var qs=gsap.utils.toArray('.q');
  var qtl=gsap.timeline({scrollTrigger:{trigger:'#testi',start:'top top',end:'+=220%',scrub:.5,pin:true}});
  qtl.fromTo('#testi .media img',{scale:1.15},{scale:1,ease:'none',duration:3},0);
  qs.forEach(function(q,i){if(i<qs.length-1)qtl.to(q,{opacity:0,y:-30,duration:.2},i+.8).fromTo(qs[i+1],{opacity:0,y:30},{opacity:1,y:0,duration:.2},i+.95)});

  gsap.from('.cta-s .h, .cta-s .lead, .direct, form .f, form button',{y:40,opacity:0,stagger:.06,duration:1,ease:'expo.out',scrollTrigger:{trigger:'.cta-s',start:'top 70%'}});
  addEventListener('load',function(){ScrollTrigger.refresh()});
})();
