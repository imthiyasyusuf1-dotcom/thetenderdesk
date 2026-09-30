(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
// statement words
document.querySelectorAll('[data-words]').forEach(function(p){
  p.innerHTML=p.innerHTML.replace(/(<[^>]+>)|([^\s<]+)/g,function(m,tag,w){return tag?tag:'<span class="w">'+w+'</span>'});
});
// reveals
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
// forms
document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();f.classList.add('sent')})});
if(RM)return;

var H=innerHeight,W=innerWidth;
var hero=document.querySelector('.hero'),chaps=[].slice.call(document.querySelectorAll('.chap')),bas=[].slice.call(document.querySelectorAll('.ba')),
    gal=document.querySelector('.gal'),stmts=[].slice.call(document.querySelectorAll('[data-words]'));
function prog(el){var r=el.getBoundingClientRect();var d=r.height-H;return d>0?Math.min(1,Math.max(0,-r.top/d)):0}
function vis(el){var r=el.getBoundingClientRect();return r.bottom>-50&&r.top<H+50}
function sizeGal(){if(!gal)return;var t=gal.querySelector('.track');gal._dx=Math.max(0,t.scrollWidth-W);gal.style.height=(H+gal._dx*1.1)+'px'}
sizeGal();
addEventListener('resize',function(){H=innerHeight;W=innerWidth;sizeGal()});
addEventListener('load',sizeGal);
var last=-1;
function frame(){
  var y=scrollY;
  if(y!==last){last=y;
    if(hero&&vis(hero)){var p=prog(hero);
      hero.querySelector('.bg').style.transform='translate3d(0,'+(p*8)+'%,0) scale('+(1+p*.12)+')';
      hero.querySelector('.copy').style.transform='translate3d(0,'+(-p*18)+'svh,0)';
      hero.querySelector('.copy').style.opacity=1-p*1.4;
      hero.querySelector('.dim').style.opacity=p*.85;}
    chaps.forEach(function(c){if(!vis(c))return;var p=prog(c);
      c._bg=c._bg||c.querySelector('.bg');c._t=c._t||c.querySelector('.txt');
      c._bg.style.transform='scale('+(1.18-p*.18)+') translate3d(0,'+((p-.5)*-4)+'%,0)';
      var ti=Math.min(1,p*3.2),to=Math.max(0,(p-.78)*4.5);
      c._t.style.transform='translate3d(0,'+((1-ti)*60-to*40)+'px,0)';c._t.style.opacity=ti-to;});
    bas.forEach(function(b){if(!vis(b))return;var p=prog(b);var q=Math.min(1,Math.max(0,(p-.12)/.72));
      q=q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2;var x=(1-q)*100;
      b._a=b._a||b.querySelector('.after');b._i=b._i||b.querySelector('.after .inner');b._e=b._e||b.querySelector('.edge');
      b._a.style.transform='translate3d('+x+'%,0,0)';b._i.style.transform='translate3d('+(-x)+'%,0,0)';
      b._e.style.transform='translate3d('+(x/100*W)+'px,0,0)';b._e.style.opacity=(q>0&&q<1)?1:0;});
    if(gal&&vis(gal)){var p=prog(gal);gal._t=gal._t||gal.querySelector('.track');gal._t.style.transform='translate3d('+(-p*gal._dx)+'px,0,0)';
      gal._imgs=gal._imgs||[].slice.call(gal.querySelectorAll('img'));
      gal._imgs.forEach(function(im,i){im.style.transform='scale(1.12) translate3d('+((p*2-1)*-4+i*.3)+'%,0,0)'});}
    stmts.forEach(function(s){if(!vis(s))return;var r=s.getBoundingClientRect();var p=Math.min(1,Math.max(0,(H*.85-r.top)/(r.height+H*.35)));
      s._w=s._w||s.querySelectorAll('.w');var n=Math.round(p*s._w.length);for(var i=0;i<s._w.length;i++)s._w[i].classList.toggle('on',i<n)});
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
