(function(){
  var body=document.body,nav=document.querySelector('.nav'),cta=document.querySelector('.float-cta'),clock=document.getElementById('clock');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  var chs=[].slice.call(document.querySelectorAll('.ch')),barn=document.querySelector('.barn'),visit=document.getElementById('visit');
  var ticking=false;
  function upd(){
    ticking=false;
    var y=scrollY,h=innerHeight,mid=h*.55,sky='0',t=null;
    nav.classList.toggle('solid',y>h*.6);
    chs.forEach(function(c){var r=c.getBoundingClientRect();if(r.top<mid){sky=c.dataset.sky;t=c.dataset.t}});
    if(barn.getBoundingClientRect().top<mid)sky='3';
    if(body.dataset.sky!==sky)body.dataset.sky=sky;
    if(t&&clock.textContent!==t)clock.textContent=t;
    var vr=visit.getBoundingClientRect();
    cta.classList.toggle('show',y>h*.8&&vr.top>h);
    document.querySelectorAll('.rv:not(.in)').forEach(function(el){if(el.getBoundingClientRect().bottom<0)el.classList.add('in')});
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd)}},{passive:true});
  addEventListener('resize',upd);upd();
  var dayEl=document.getElementById('day'),ck=document.querySelector('.clock');
  var f=document.getElementById('f');
  f.addEventListener('submit',function(e){e.preventDefault();
    if(!f.n.value.trim()||!/\S+@\S+\.\S+/.test(f.e.value)){(f.n.value.trim()?f.e:f.n).focus();return}
    [].forEach.call(f.querySelectorAll('label,button'),function(x){x.style.display='none'});
    f.querySelector('.ok').hidden=false;});
})();
