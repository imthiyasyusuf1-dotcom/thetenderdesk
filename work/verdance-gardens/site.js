(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
setTimeout(()=>document.body.classList.add('loaded'),60);

// word reveal
$$('[data-words]').forEach(el=>{
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return}const s=document.createElement('span');s.className='w';s.textContent=t;f.appendChild(s)});c.replaceWith(f)}
    else walk(c)})};
  walk(el);
});
const words=$$('.w');

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'});
$$('.rv').forEach(el=>io.observe(el));

const nav=$('#nav'),arch=$('#arch'),hc=$('#heroCopy'),hf=$('#heroFoot'),hero=$('.hero');
const seas=$('.seasons'),track=$('#sTrack'),bar=$('#sBar');
const ch=$('.change'),cb=$('#cBefore'),cbp=cb.querySelector('picture'),cl=$('#cLine'),steps=$$('#cSteps li');
const bleed=$('.bleed'),bimg=$('#bImg');
const pImgs=$$('.p-img'),pSteps=$$('.p-step');

const prog=el=>{const r=el.getBoundingClientRect();const d=r.height-innerHeight;return d<=0?0:Math.min(1,Math.max(0,-r.top/d))};
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

function frame(){
  const vh=innerHeight,mob=innerWidth<=760;
  // nav
  nav.classList.toggle('solid',scrollY>vh*.25 && !(ch.getBoundingClientRect().top<=0&&ch.getBoundingClientRect().bottom>vh));
  // hero: photo folds into an arch
  if(!RM){
    const p=prog(hero),e=ease(Math.min(1,p*1.25));
    const sx=mob?7:18,st=mob?16:12,sb=mob?6:6;
    arch.style.clipPath=`inset(${e*st}% ${e*sx}% ${e*sb}% ${e*sx}% round ${e*(mob?180:420)}px ${e*(mob?180:420)}px 6px 6px)`;
    hc.style.transform=`translate3d(0,${-p*90}px,0)`;hc.style.opacity=1-Math.min(1,p*1.8);
    hf.style.opacity=1-Math.min(1,p*4);
  }
  // words
  words.forEach(w=>{const t=w.getBoundingClientRect().top;w.classList.toggle('on',t<vh*.78)});
  // seasons
  const sp=prog(seas),max=track.scrollWidth-innerWidth;
  track.style.transform=`translate3d(${-sp*max}px,0,0)`;bar.style.transform=`scaleX(${sp})`;
  // change wipe: before layer slides out to the left, image counter-moves so it stays fixed
  const cp=prog(ch),w=Math.min(1,Math.max(0,(cp-.08)/.72)),x=(1-w)*100;
  cb.style.transform=`translate3d(${-(100-x)}%,0,0)`;cbp.style.transform=`translate3d(${100-x}%,0,0)`;
  cl.style.transform=`translate3d(${x/100*innerWidth}px,0,0)`;cl.style.opacity=(w>0&&w<1)?1:0;
  const si=w<.34?0:w<.8?1:2;steps.forEach((s,i)=>s.classList.toggle('on',i<=si));
  // process
  let cur=0;pSteps.forEach((s,i)=>{if(s.getBoundingClientRect().top<vh*(mob?.9:.6))cur=i});
  pImgs.forEach((f,i)=>f.classList.toggle('on',i===cur));
  // bleed parallax
  const br=bleed.getBoundingClientRect();if(br.top<vh&&br.bottom>0&&!RM){bimg.style.transform=`translate3d(0,${(br.top/vh)*-8}%,0)`}
}
let tick=false;const req=()=>{if(!tick){tick=true;requestAnimationFrame(()=>{tick=false;frame()})}};
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);frame();

$('#form').addEventListener('submit',e=>{e.preventDefault();e.target.classList.add('sent')});
})();
