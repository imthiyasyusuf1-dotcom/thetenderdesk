(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav'), sticky = document.getElementById('sticky');
  var hero = document.querySelector('.hero'), enq = document.getElementById('enquire');

  // word reveal
  document.querySelectorAll('[data-words]').forEach(function(el){
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');
  });
  var words = [].slice.call(document.querySelectorAll('.say .w'));

  // reveals
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{rootMargin:'0px 0px -12% 0px'});
  var pend = [].slice.call(document.querySelectorAll('.reveal'));
  pend.forEach(function(el){ io.observe(el); });

  // courses: build strips from the finished roof photo
  var roof = document.getElementById('roof'), N = 12, strips = [];
  var cnum = document.getElementById('cnum'), cline = document.getElementById('cline');
  var lines = [
    'Double eaves course first. Nothing gets past the bottom edge.',
    'Every slate graded by thickness. Heaviest at the eaves.',
    'Head-lap set to the pitch, never guessed.',
    'Two copper nails per slate. They do not rust.',
    'Joints broken by half a slate, every course.',
    'Cuts made with the hammer, not the grinder.',
    'Lead soakers slipped in where the roof meets the wall.',
    'Gauge checked with a batten rod, course after course.',
    'Diminishing courses on old roofs, kept as they were.',
    'Valleys lined in lead, dressed by hand.',
    'Top course shortened to finish tight under the ridge.',
    'Ridge bedded and pointed. Watertight, for generations.'
  ];
  function srcFor(){ return innerWidth <= 760 ? 'img/courses-m.webp' : 'img/courses.webp'; }
  var IMG_A = 1152/2048; // source aspect (w/h)
  function build(){
    roof.innerHTML=''; strips=[];
    var src = srcFor();
    var W = roof.clientWidth || innerWidth, H = roof.clientHeight || innerHeight;
    var bw, bh;
    if(W/H > IMG_A){ bw = W; bh = W/IMG_A; } else { bh = H; bw = H*IMG_A; }
    var ox = (W-bw)/2, oy = (H-bh)/2, sh = H/N;
    for(var i=0;i<N;i++){
      var d = document.createElement('div'); d.className='course';
      var top = H - (i+1)*sh; // i=0 is the eaves course at the bottom
      d.style.top = top+'px'; d.style.height = Math.ceil(sh+2)+'px';
      d.style.left = '0'; d.style.width = '100%';
      d.style.backgroundImage = 'url('+src+')';
      d.style.backgroundSize = bw+'px '+bh+'px';
      d.style.backgroundPosition = ox+'px '+(oy-top)+'px';
      d.style.zIndex = i+1; // each new course lands over the top edge of the one below
      roof.appendChild(d); strips.push(d);
    }
  }
  build();
  var lastW = innerWidth;
  addEventListener('resize', function(){ if(innerWidth!==lastW){ build(); lastC=-1; } lastW=innerWidth; });

  var courses = document.getElementById('courses');
  var bleedImg = document.querySelector('.bleed img'), bleed = document.querySelector('.bleed');
  var track = document.getElementById('track'), strip = document.querySelector('.strip');
  var lastC = -1, ticking = false;

  function frame(){
    ticking = false;
    var vh = innerHeight, y = scrollY;
    var heroH = hero.offsetHeight;
    nav.classList.toggle('solid', y > heroH - 70);
    var er = enq.getBoundingClientRect();
    sticky.classList.toggle('on', y > heroH*0.9 && er.top > vh);
    for(var ri=pend.length-1; ri>=0; ri--){ if(pend[ri].getBoundingClientRect().top < vh*0.92){ pend[ri].classList.add('in'); pend.splice(ri,1); } }

    // word reveal
    if(words.length){
      var sr = words[0].parentNode.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh*0.85 - sr.top) / (sr.height + vh*0.35)));
      var k = Math.round(p*words.length);
      for(var i=0;i<words.length;i++) words[i].classList.toggle('on', i<k);
    }

    // courses
    var cr = courses.getBoundingClientRect();
    if(cr.top < vh && cr.bottom > 0){
      var total = courses.offsetHeight - vh;
      var prog = Math.min(1, Math.max(0, -cr.top / (total*0.88)));
      var f = 2 + prog*(N-2);
      for(var j=0;j<N;j++){
        var t = Math.min(1, Math.max(0, f - j));
        var e = 1 - Math.pow(1-t, 3);
        strips[j].style.transform = 'translate3d(0,'+((1-e)*-38)+'vh,0) rotate('+((1-e)*(j%2?1.5:-1.5))+'deg)';
        strips[j].style.opacity = t>0 ? Math.min(1, t*3) : 0;
      }
      var c = Math.max(1, Math.min(N, Math.ceil(f)));
      if(c !== lastC){ lastC = c; cnum.textContent = (c<10?'0':'')+c; cline.textContent = lines[c-1]; }
    }

    // bleed parallax
    var br = bleed.getBoundingClientRect();
    if(br.top < vh && br.bottom > 0){
      var q = (br.top + br.height/2 - vh/2) / vh;
      bleedImg.style.transform = 'translate3d(0,'+(q*-6)+'%,0)';
    }
    // strip drift
    var tr = strip.getBoundingClientRect();
    if(tr.top < vh && tr.bottom > 0){
      var s = (vh - tr.top) / (vh + tr.height);
      var max = Math.max(0, track.scrollWidth - innerWidth);
      track.style.transform = 'translate3d('+(-s*max)+'px,0,0)';
    }
  }
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }
  if(reduce){
    strips.forEach(function(s){ s.style.opacity=1; });
    addEventListener('scroll', function(){ nav.classList.toggle('solid', scrollY > hero.offsetHeight-70); }, {passive:true});
  } else {
    addEventListener('scroll', onScroll, {passive:true});
    addEventListener('resize', onScroll);
    frame();
  }

  // before/after
  var r = document.getElementById('baRange'), b = document.getElementById('baBefore'), hd = document.getElementById('baHandle');
  function setBA(){ var v = r.value; b.style.clipPath = 'inset(0 '+(100-v)+'% 0 0)'; hd.style.left = v+'%'; }
  r.addEventListener('input', setBA); setBA();

  // form
  var form = document.getElementById('form');
  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    if(!form.name.value.trim() || !form.phone.value.trim()){ (form.name.value.trim()?form.phone:form.name).focus(); return; }
    form.querySelector('button').hidden = true;
    document.getElementById('ok').hidden = false;
  });
})();
