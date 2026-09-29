/* FlowRight 2026 layer: water ripple canvas, booking flow, reveal fallback */
(function(){
  'use strict';
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };

  /* Reveal targets (CSS scroll-driven where supported, IO fallback otherwise) */
  var sel = '.sec-head,.card,.how li,.badges li,.towns li,.faq details,.book,.contact>div,.iq-out,.ptable';
  var els = document.querySelectorAll(sel);
  els.forEach(function(el){ el.classList.add('rv'); });
  if (!CSS.supports('animation-timeline: view()')) {
    if (RM || !('IntersectionObserver' in window)) els.forEach(function(el){ el.classList.add('in'); });
    else {
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px'});
      els.forEach(function(el){ io.observe(el); });
    }
  }

  /* Signature effect: low-res water ripple (height-field) scaled up by CSS. Cheap, pauses off screen. */
  var cv = $('ripple');
  if (cv && !RM) {
    var W = 160, H = 100, ctx = cv.getContext('2d');
    cv.width = W; cv.height = H;
    var a = new Float32Array(W*H), b = new Float32Array(W*H), img = ctx.createImageData(W, H), d = img.data;
    var on = true, last = 0;
    var drop = function(x, y, s){ x|=0; y|=0; if (x<2||y<2||x>W-3||y>H-3) return; for (var j=-2;j<=2;j++) for (var i=-2;i<=2;i++) a[(y+j)*W+x+i] += s; };
    var step = function(t){
      if (!on) return;
      requestAnimationFrame(step);
      if (t - last < 30) return; last = t;
      if (Math.random() < .12) drop(Math.random()*W, Math.random()*H, 180 + Math.random()*220);
      for (var y=1;y<H-1;y++) for (var x=1;x<W-1;x++){
        var k = y*W+x;
        var v = (a[k-1]+a[k+1]+a[k-W]+a[k+W])/2 - b[k];
        b[k] = v - v/28;
      }
      var tmp = a; a = b; b = tmp;
      for (var p=0,k2=0;k2<W*H;k2++,p+=4){
        var s = (a[k2] - (a[k2+1]||0)) * 1.4;
        d[p] = 20 + s*.35; d[p+1] = 70 + s*.8; d[p+2] = 140 + s*1.3; d[p+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };
    new IntersectionObserver(function(es){ var v = es[0].isIntersecting; if (v && !on){ on = true; requestAnimationFrame(step); } on = v; }).observe(cv);
    document.addEventListener('visibilitychange', function(){ if (!document.hidden && !on){ on = true; requestAnimationFrame(step); } else if (document.hidden) on = false; });
    var hero = cv.parentNode;
    hero.addEventListener('pointermove', function(e){ var r = cv.getBoundingClientRect(); drop((e.clientX-r.left)/r.width*W, (e.clientY-r.top)/r.height*H, 90); }, {passive:true});
    requestAnimationFrame(step);
  }

  /* Booking flow demo */
  var f = $('bkForm'); if (!f) return;
  var steps = f.querySelectorAll('.bk-step'), prog = document.querySelectorAll('.bk-prog li');
  var next = $('bkNext'), back = $('bkBack'), msg = $('bkMsg'), cur = 0;
  var DN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var days = [], dt = new Date();
  while (days.length < 5){ dt.setDate(dt.getDate()+1); if (dt.getDay() !== 0) days.push(new Date(dt)); }
  $('bkDays').innerHTML = days.map(function(x,i){ return '<label><input type="radio" name="bd" value="'+DN[x.getDay()]+' '+x.getDate()+' '+MN[x.getMonth()]+'"'+(i===0?' checked':'')+'><span><small>'+DN[x.getDay()]+'</small><b>'+x.getDate()+'</b><small>'+MN[x.getMonth()]+'</small></span></label>'; }).join('');
  var SL = ['8am to 10am','10am to 12pm','12pm to 2pm','2pm to 4pm','4pm to 6pm','6pm to 8pm'];
  var slots = function(){
    var seed = f.bd ? (f.querySelector('[name=bd]:checked').value.length) : 0;
    $('bkSlots').innerHTML = SL.map(function(s,i){ var full = (i*7+seed)%5===0; return '<label><input type="radio" name="bs" value="'+s+'"'+(full?' disabled':'')+'><span>'+s+'<small>'+(full?'Fully booked':(i===5?'Evening rate':'Available'))+'</small></span></label>'; }).join('');
    var first = $('bkSlots').querySelector('input:not(:disabled)'); if (first) first.checked = true;
  };
  $('bkDays').addEventListener('change', slots); slots();
  var show = function(n){
    cur = n;
    steps.forEach(function(s,i){ s.hidden = i !== n; });
    prog.forEach(function(p,i){ p.classList.toggle('on', i <= n); });
    back.hidden = n === 0; next.textContent = n === 3 ? 'Confirm booking' : 'Continue'; msg.textContent = '';
  };
  var go = function(n){ if (document.startViewTransition && !RM) document.startViewTransition(function(){ show(n); }); else show(n); };
  back.addEventListener('click', function(){ go(cur-1); });
  next.addEventListener('click', function(){
    if (cur < 3) return go(cur+1);
    var bad = null;
    ['bn','bp','bt'].forEach(function(id){ var el = $(id), ok = el.value.trim().length > 1; if (id==='bp') ok = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(el.value.trim()); el.closest('.field').classList.toggle('err', !ok); el.setAttribute('aria-invalid', !ok); if (!ok && !bad) bad = el; });
    if (bad){ msg.className = 'form-msg no'; msg.textContent = 'Please check the highlighted fields.'; bad.focus(); return; }
    var v = function(n){ var x = f.querySelector('[name='+n+']:checked'); return x ? x.value : ''; };
    $('bkSum').textContent = v('bj') + ' on ' + v('bd') + ', arriving ' + v('bs') + ' at ' + $('bp').value.trim().toUpperCase() + '. We will text ' + $('bt').value.trim() + ' when your engineer sets off.';
    $('bkRef').textContent = 'FR-' + Math.random().toString(36).slice(2,7).toUpperCase();
    var done = function(){ f.hidden = true; document.querySelector('.bk-prog').hidden = true; $('bkDone').hidden = false; };
    if (document.startViewTransition && !RM) document.startViewTransition(done).finished.then(function(){ $('bkDone').focus({preventScroll:true}); }); else { done(); $('bkDone').focus({preventScroll:true}); }
  });
  $('bkAgain').addEventListener('click', function(){ f.reset(); slots(); f.hidden = false; document.querySelector('.bk-prog').hidden = false; $('bkDone').hidden = true; show(0); });
})();
