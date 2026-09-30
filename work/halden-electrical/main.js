(function(){
  var NS='http://www.w3.org/2000/svg';
  function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e}
  // rooms: id, name, x, y, w, h, lamp x, ceiling y, route (polyline from consumer unit)
  var CU=[253,380];
  var ROOMS=[
    ['hall','Hallway',230,340,170,130,315,343,[[253,380],[253,352],[315,352],[315,356]]],
    ['kit','Kitchen',90,340,140,130,160,343,[[253,352],[160,352],[160,356]]],
    ['liv','Living room',400,340,150,130,475,343,[[315,352],[475,352],[475,356]]],
    ['bed1','Main bedroom',90,210,160,130,170,213,[[253,352],[253,330],[240,330],[240,222],[170,222],[170,226]]],
    ['bath','Bathroom',250,210,140,130,320,213,[[240,222],[320,222],[320,226]]],
    ['bed2','Second bedroom',390,210,160,130,470,213,[[320,222],[470,222],[470,226]]],
    ['loft','Loft',160,100,320,110,320,120,[[320,222],[320,200],[320,134]]],
    ['ev','EV charger',0,0,0,0,0,0,[[475,352],[545,352],[545,412],[562,412]]]
  ];
  var roomsG=document.getElementById('rooms'),wires=document.getElementById('wires'),cur=document.getElementById('current');
  var lit={},segs={};
  ROOMS.forEach(function(r){
    var id=r[0];
    if(id!=='ev'){
      if(id==='loft'){
        el('polygon',{points:'96,210 320,80 544,210',fill:'#101114'},roomsG);
        lit[id]=el('polygon',{points:'96,210 320,80 544,210',fill:'url(#lit)',class:'room-lit',opacity:0},roomsG);
      }else{
        el('rect',{x:r[2],y:r[3],width:r[4],height:r[5],fill:'#101114'},roomsG);
        lit[id]=el('rect',{x:r[2],y:r[3],width:r[4],height:r[5],fill:'url(#lit)',class:'room-lit',opacity:0},roomsG);
      }
      var cp=el('clipPath',{id:'c-'+id},roomsG);
      if(id==='loft')el('polygon',{points:'96,210 320,80 544,210'},cp);else el('rect',{x:r[2],y:r[3],width:r[4],height:r[5]},cp);
      var g=el('g',{class:'fx',opacity:0,'clip-path':'url(#c-'+id+')'},roomsG);lit[id+'fx']=g;
      el('ellipse',{cx:r[6],cy:r[7]+2,rx:Math.min(70,r[4]*.45),ry:Math.min(110,r[5]*.95),fill:'url(#pool)',opacity:.5},g);
      el('line',{x1:r[6],y1:r[7],x2:r[6],y2:r[7]+14,stroke:'#3a3e44','stroke-width':1.5},roomsG);
      el('circle',{cx:r[6],cy:r[7]+17,r:3.6,fill:'#2a2d31'},roomsG);
      el('circle',{cx:r[6],cy:r[7]+17,r:3.6,fill:'#fff3da'},g);
    }
    // wiring split into short segments so the current can run using opacity only
    var pts=r[8],list=[];
    el('polyline',{points:pts.map(function(p){return p.join(',')}).join(' ')},wires);
    for(var i=0;i<pts.length-1;i++){
      var a=pts[i],b=pts[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(len/7));
      for(var k=0;k<n;k++){
        var t0=k/n,t1=(k+1)/n;
        list.push(el('line',{x1:a[0]+(b[0]-a[0])*t0,y1:a[1]+(b[1]-a[1])*t0,x2:a[0]+(b[0]-a[0])*t1,y2:a[1]+(b[1]-a[1])*t1,class:'seg',opacity:0},cur));
      }
    }
    segs[id]=list;
  });

  // form
  var qf=document.getElementById('qf');
  qf.addEventListener('submit',function(e){e.preventDefault();var ok=true;
    [].forEach.call(qf.querySelectorAll('[required]'),function(i){if(!i.value.trim()){ok=false;i.style.borderColor='#c8894f'}});
    if(ok)qf.classList.add('sent')});

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
  gsap.from('h1 .ln span',{yPercent:110,duration:1.3,ease:'expo.out',stagger:.1,delay:.1});

  var rk=document.getElementById('rk'),rn=document.getElementById('rn'),shown=-1;
  function readout(i){if(i===shown)return;shown=i;
    rk.textContent='Circuit '+(i<0?'00':('0'+(i+1)));
    rn.textContent=i<0?'Mains off':(i>=ROOMS.length-1&&i!==ROOMS.length-1?'All circuits live':ROOMS[i][1]);
    if(i===ROOMS.length) {rk.textContent='Certified';rn.textContent='All circuits live'}}

  function allOn(){ROOMS.forEach(function(r){if(lit[r[0]]){lit[r[0]].setAttribute('opacity',.92);lit[r[0]+'fx'].setAttribute('opacity',1)}segs[r[0]].forEach(function(s){s.setAttribute('opacity',1)})});
    document.getElementById('evLed').setAttribute('opacity',1);document.getElementById('cuLed').setAttribute('opacity',1);readout(ROOMS.length)}

  if(reduce){allOn()}
  else{
    var tl=gsap.timeline({scrollTrigger:{trigger:'#hero',start:'top top',end:'+='+(mobile?440:500)+'%',scrub:.5,pin:true,anticipatePin:1,
      onUpdate:function(s){var p=(s.progress-.06)/.84*ROOMS.length;readout(s.progress<.06?-1:Math.min(ROOMS.length,Math.floor(p)))}}});
    tl.to('.scrollcue',{opacity:0,duration:.2},0)
      .to('#cuLed',{opacity:1,duration:.2},.25);
    var t=.5;
    ROOMS.forEach(function(r){
      var id=r[0],s=segs[id];
      tl.to(s,{opacity:1,duration:.05,stagger:.55/s.length,ease:'none'},t);
      if(lit[id]){
        tl.to(lit[id],{attr:{opacity:.92},duration:.35,ease:'power2.out'},t+.55)
          .to(lit[id+'fx'],{attr:{opacity:1},duration:.3},t+.55);
      }else{
        tl.to('#evLed',{attr:{opacity:1},duration:.2},t+.55);
      }
      t+=1;
    });
    tl.to({},{duration:.6});
  }

  var st=document.getElementById('stmt');
  st.innerHTML=st.textContent.split(' ').map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');
  if(reduce){gsap.set('#stmt .w',{opacity:1});addEventListener('load',function(){ScrollTrigger.refresh()});return}
  gsap.to('#stmt .w',{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:'.statement',start:'top top',end:'+=110%',scrub:true,pin:true}});

  gsap.utils.toArray('.svc').forEach(function(s){
    gsap.timeline({scrollTrigger:{trigger:s,start:'top top',end:'+=100%',scrub:true,pin:true}})
      .fromTo(s.querySelector('.media img'),{scale:1.2},{scale:1,ease:'none',duration:1},0)
      .fromTo(s.querySelector('.inner'),{y:70,opacity:0},{y:0,opacity:1,ease:'power2.out',duration:.35},.05)
      .to(s.querySelector('.inner'),{y:-50,opacity:0,ease:'power2.in',duration:.22},.78);
  });

  gsap.timeline({scrollTrigger:{trigger:'#certs',start:'top top',end:'+=90%',scrub:.5,pin:true}})
    .from('.ch',{y:50,opacity:0,duration:.3},0)
    .from('.badges li',{y:60,opacity:0,scale:.9,stagger:.08,duration:.3},.15)
    .to({},{duration:.3});

  var qs=gsap.utils.toArray('.q');
  var qtl=gsap.timeline({scrollTrigger:{trigger:'#testi',start:'top top',end:'+=220%',scrub:.5,pin:true}});
  qtl.fromTo('#testi .media img',{scale:1.15},{scale:1,ease:'none',duration:3},0);
  qs.forEach(function(q,i){if(i<qs.length-1)qtl.to(q,{opacity:0,y:-30,duration:.2},i+.8).fromTo(qs[i+1],{opacity:0,y:30},{opacity:1,y:0,duration:.2},i+.95)});

  gsap.timeline({scrollTrigger:{trigger:'#emergency',start:'top top',end:'+=80%',scrub:true,pin:true}})
    .fromTo('#emergency .media img',{scale:1.18},{scale:1,ease:'none',duration:1},0)
    .from('#emergency .copy > *',{y:50,opacity:0,stagger:.08,duration:.3},0);

  gsap.from('.cta-s .h, .cta-s .lead, .direct, form .f, form button',{y:40,opacity:0,stagger:.06,duration:1,ease:'expo.out',scrollTrigger:{trigger:'.cta-s',start:'top 70%'}});
  addEventListener('load',function(){ScrollTrigger.refresh()});
})();
