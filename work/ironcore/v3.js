(()=>{const bar=document.createElement('div');bar.className='scrollbar';bar.setAttribute('aria-hidden','true');document.body.prepend(bar);
if(!CSS.supports('animation-timeline:scroll()')){let t=0;addEventListener('scroll',()=>{if(t)return;t=requestAnimationFrame(()=>{t=0;const m=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(m>0?scrollY/m:0)+')'})},{passive:true})}
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
const s=document.querySelector('.v3shot'),w=document.querySelector('.v3hero-media');if(!s)return;let raf=0;
w.addEventListener('pointermove',e=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const r=w.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;s.style.transform=`rotateY(${x*10}deg) rotateX(${-y*10}deg)`})});
w.addEventListener('pointerleave',()=>{s.style.transform=''});})();