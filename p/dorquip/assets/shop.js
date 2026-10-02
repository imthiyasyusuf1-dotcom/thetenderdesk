(()=>{
const ROOT=document.documentElement.dataset.root||'../';
const VAT=0.2, FREE=150, SHIP=9.95, EMAIL='sales@dorquip.com';
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gbp=n=>'£'+(Math.round(n*100)/100).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
const img=(k,s)=>ROOT+'img/p/'+k+(s?'-s':'')+'.webp';
const CATS=[
 ['From The Anvil','from-the-anvil','Hand-finished traditional door, window and cabinet furniture.'],
 ['Architectural Ironmongery','architectural-ironmongery','Levers, hinges, locks, closers and fire door hardware.'],
 ['Onyx - Matt Black','onyx','The full Onyx matt black range, finish-matched across the door.'],
 ['Intumescent and Automatic Seals','seals','Intumescent, smoke and automatic drop seals for fire doors.'],
 ['Washroom Fittings','washroom','Washroom hardware and fittings.'],
 ['Shelving Systems','shelving','Shelving systems and brackets.'],
 ['Hygiene+','hygiene','Hand sanitiser, dispensers and infection control.'],
];
const catBySlug=s=>CATS.find(c=>c[1]===s), slugOf=n=>(CATS.find(c=>c[0]===n)||[,''])[1];
const catName=n=>n==='Onyx - Matt Black'?'Onyx Matt Black':n;
const SW={'black':'#1b1b1b','matt black':'#222','polished chrome':'linear-gradient(135deg,#f4f6f8,#9aa3ab)','satin chrome':'#b9bec2','polished brass':'linear-gradient(135deg,#f3dc8a,#b38b2e)','satin brass':'#c2a35e','pewter':'#7d7f7c','beeswax':'#8a5a2b','polished nickel':'linear-gradient(135deg,#f2f0ea,#a9a596)','satin nickel':'#bdb9ad','polished stainless':'linear-gradient(135deg,#f4f4f4,#a2a4a6)','satin stainless':'#b5b7b8','satin stainless steel':'#b5b7b8','polished stainless steel':'linear-gradient(135deg,#f4f4f4,#a2a4a6)','aged brass':'#8f7440','bronze':'#6c4a2c','antique brass':'#8b6b33','white':'#fff','graphite':'#45484a'};
const sw=f=>SW[(f||'').toLowerCase()]||'#9a958a';

/* cart */
const KEY='dq_cart_v1';
const cart={
 get(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}},
 set(c){localStorage.setItem(KEY,JSON.stringify(c));badge(true)},
 add(id,q=1){const c=cart.get(),l=c.find(x=>x.id===id);l?l.q=Math.min(999,l.q+q):c.push({id,q});cart.set(c)},
 qty(id,q){let c=cart.get();q<1?c=c.filter(x=>x.id!==id):c.find(x=>x.id===id).q=Math.min(999,q);cart.set(c)},
 clear(){localStorage.removeItem(KEY);badge()},
 count(){return cart.get().reduce((a,b)=>a+b.q,0)}
};
function badge(bump){const n=cart.count();$$('.bag b').forEach(b=>{b.textContent=n;const a=b.closest('.bag');if(bump){a.classList.remove('bump');void a.offsetWidth;a.classList.add('bump')}})}
window.addEventListener('storage',()=>badge());

let DATA=null;const byId={};
async function load(){if(DATA)return DATA;const r=await fetch(ROOT+'data/cat.json');DATA=await r.json();DATA.forEach(p=>{p.p=Math.round(p.p/1.2*100)/100;if(p.w)p.w=Math.round(p.w/1.2*100)/100;byId[p.id]=p;p.f=(p.a.Finish||[])[0]||'';p.q=(p.n+' '+p.sku+' '+p.f+' '+p.c+' '+p.s).toLowerCase()});return DATA}
const url=p=>ROOT+'product/?p='+encodeURIComponent(p.id);

function totals(lines){const ex=lines.reduce((a,l)=>a+l.p.p*l.q,0);const ship=0;const vat=(ex+ship)*VAT;return{ex,ship,vat,inc:ex+ship+vat}}
function resolve(){return cart.get().map(l=>({...l,p:byId[l.id]})).filter(l=>l.p)}

let tt;function toast(p,q){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.append(t)}
 t.innerHTML=`<img src="${img(p.i[0],1)}" alt=""><div><span>Added ${q>1?q+' × ':''}to basket</span><span><b>${esc(p.n)}</b></span></div><a href="${ROOT}basket/">View basket</a>`;
 requestAnimationFrame(()=>t.classList.add('on'));clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),3800)}

function card(p){return `<a class="card" href="${url(p)}">
 <figure>${p.i[0]?`<img src="${img(p.i[0],1)}" alt="${esc(p.n)}" loading="lazy" decoding="async" width="360" height="360">`:''}</figure>
 ${p.w?'<span class="tag-sale mono">Offer</span>':''}
 <button class="quick" type="button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.n)} to basket">+</button>
 <div class="meta"><span class="sku mono">${esc(p.sku)}${p.f?' · '+esc(p.f):''}</span><h3>${esc(p.n)}</h3>
 <div class="pr"><b>${gbp(p.p)}</b>${p.w?`<s>${gbp(p.w)}</s>`:''}<small>ex VAT</small></div></div></a>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;e.preventDefault();const p=byId[b.dataset.add];if(!p)return;cart.add(p.id,1);toast(p,1)});

/* ---------- SHOP ---------- */
async function shop(){
 const P=await load();const qs=new URLSearchParams(location.search);
 const st={c:qs.get('c')||'',s:qs.get('s')||'',f:qs.get('f')||'',q:qs.get('q')||'',o:qs.get('o')||'',n:36};
 const grid=$('#grid'),cnt=$('#count'),more=$('#more'),q=$('#q'),sort=$('#sort');
 q.value=st.q;sort.value=st.o;
 const subs=[...new Set(P.filter(p=>p.s).map(p=>p.s))].sort();
 function list(){let L=P;if(st.c)L=L.filter(p=>slugOf(p.c)===st.c);if(st.s)L=L.filter(p=>p.s===st.s);if(st.f)L=L.filter(p=>p.f===st.f);
  if(st.q){const t=st.q.toLowerCase().split(/\s+/).filter(Boolean);L=L.filter(p=>t.every(w=>p.q.includes(w)))}
  if(st.o==='lo')L=[...L].sort((a,b)=>a.p-b.p);else if(st.o==='hi')L=[...L].sort((a,b)=>b.p-a.p);else if(st.o==='az')L=[...L].sort((a,b)=>a.n.localeCompare(b.n));return L}
 function filters(){
  const base=P.filter(p=>!st.q||st.q.toLowerCase().split(/\s+/).every(w=>p.q.includes(w)));
  let h=`<div class="fgroup"><h4>Category</h4><button class="fcat" data-c="" aria-pressed="${!st.c}"><span>All products</span><span>${base.length}</span></button>`;
  CATS.forEach(([n,s])=>{const k=base.filter(p=>p.c===n).length;h+=`<button class="fcat" data-c="${s}" aria-pressed="${st.c===s&&!st.s}"><span>${esc(catName(n))}</span><span>${k}</span></button>`;
   if(s==='from-the-anvil'&&st.c===s)subs.forEach(x=>{h+=`<button class="fcat sub" data-c="${s}" data-s="${esc(x)}" aria-pressed="${st.s===x}"><span>${esc(x)}</span><span>${base.filter(p=>p.s===x).length}</span></button>`})});
  h+='</div>';
  const pool=base.filter(p=>(!st.c||slugOf(p.c)===st.c)&&(!st.s||p.s===st.s));
  const fc={};pool.forEach(p=>{if(p.f)fc[p.f]=(fc[p.f]||0)+1});
  const fs=Object.entries(fc).sort((a,b)=>b[1]-a[1]);
  if(fs.length>1)h+=`<div class="fgroup"><h4>Finish</h4><div class="chips">${fs.map(([f,k])=>`<button class="chip" data-f="${esc(f)}" aria-pressed="${st.f===f}"><i style="--c:${sw(f)}"></i>${esc(f)} <span class="mono" style="opacity:.6">${k}</span></button>`).join('')}</div></div>`;
  h+=`<div class="fgroup"><h4>Need help?</h4><p style="font-size:.9rem;color:var(--ink2)">Scheduling a whole project? Send us drawings and we'll quote the lot.</p><p style="margin-top:.6rem"><a class="mono" href="tel:+441483310333">01483 310333</a></p></div>`;
  $('#fbody').innerHTML=h}
 function sync(){const u=new URLSearchParams();['c','s','f','q','o'].forEach(k=>st[k]&&u.set(k,st[k]));history.replaceState(null,'',location.pathname+(u+''?'?'+u:''));
  const c=catBySlug(st.c);$('#title').textContent=st.s||(c?catName(c[0]):'The Shop');$('#lede').textContent=c&&!st.s?c[2]:st.s?'From The Anvil, '+st.s.toLowerCase()+'.':'Every product we stock, priced and ready to order. Trade quantities welcome.';
  document.title=($('#title').textContent)+' | Dorquip Group'}
 function render(reset){if(reset)st.n=36;const L=list();cnt.textContent=`${L.length} product${L.length===1?'':'s'}${st.f?' in '+st.f:''}${st.q?' for “'+st.q+'”':''}`;
  grid.innerHTML=L.length?L.slice(0,st.n).map(card).join(''):`<div class="empty"><h3 style="font-size:2rem">Nothing matches that.</h3><p style="margin:.8rem 0 1.4rem;color:var(--mute)">Try fewer words, or ask us. We stock far more than we list.</p><button class="btn ghost" id="reset">Clear filters</button></div>`;
  more.hidden=L.length<=st.n;more.querySelector('button').textContent=`Show more (${L.length-st.n} left)`;filters();sync()}
 $('#fbody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if('c'in b.dataset){st.c=b.dataset.c;st.s=b.dataset.s||'';st.f=''}if('f'in b.dataset)st.f=st.f===b.dataset.f?'':b.dataset.f;render(1);if(innerWidth<980&&'c'in b.dataset)$('.filters').classList.remove('open');scrollTo({top:0,behavior:'smooth'})});
 grid.addEventListener('click',e=>{if(e.target.id==='reset'){Object.assign(st,{c:'',s:'',f:'',q:''});q.value='';render(1)}});
 let d;q.addEventListener('input',()=>{clearTimeout(d);d=setTimeout(()=>{st.q=q.value.trim();render(1)},140)});
 sort.addEventListener('change',()=>{st.o=sort.value;render(1)});
 more.querySelector('button').addEventListener('click',()=>{st.n+=36;render()});
 $('#fopen').addEventListener('click',()=>$('.filters').classList.add('open'));$('#fclose').addEventListener('click',()=>$('.filters').classList.remove('open'));
 render(1)}

/* ---------- PRODUCT ---------- */
function descHTML(d){let h='',ul=0;d.forEach(l=>{if(l.startsWith('•')){if(!ul){h+='<ul>';ul=1}h+=`<li>${esc(l.slice(1).trim())}</li>`;return}if(ul){h+='</ul>';ul=0}
 if(/^(IN STOCK|Product (Details|Features|Finish)|Other)/i.test(l)&&l.length<60)h+=`<p class="hl">${esc(l)}</p>`;else h+=`<p>${esc(l)}</p>`});if(ul)h+='</ul>';return h}
async function product(){
 await load();const id=new URLSearchParams(location.search).get('p');const p=byId[id];const m=$('#pd');
 if(!p){m.innerHTML=`<div class="done"><h1>Not found.</h1><p>That product has moved or been discontinued.</p><div class="acts"><a class="btn" href="${ROOT}shop/">Back to the shop</a></div></div>`;return}
 document.title=p.n+' | Dorquip Group';$('meta[name=description]')?.setAttribute('content',(p.d.find(x=>x.length>60)||p.n).slice(0,155));
 const c=slugOf(p.c);
 const sibs=DATA.filter(x=>x!==p&&x.c===p.c&&x.s===p.s&&x.n.replace(x.f,'').slice(0,18)===p.n.replace(p.f,'').slice(0,18)&&x.f&&x.f!==p.f);
 const rel=DATA.filter(x=>x!==p&&x.c===p.c&&x.s===p.s&&!sibs.includes(x)).sort(()=>Math.random()-.5).slice(0,4);
 const specs=[['Code',p.sku],p.f&&['Finish',p.f],p.a.Brand&&['Brand',p.a.Brand[0]],['Range',catName(p.c)+(p.s?' / '+p.s:'')],...Object.entries(p.a).filter(([k])=>!['Finish','Brand'].includes(k)).map(([k,v])=>[k,v.join(', ')])].filter(Boolean);
 m.innerHTML=`<nav class="crumbs mono"><a href="${ROOT}shop/">Shop</a>/<a href="${ROOT}shop/?c=${c}">${esc(catName(p.c))}</a>${p.s?`/<a href="${ROOT}shop/?c=${c}&s=${encodeURIComponent(p.s)}">${esc(p.s)}</a>`:''}</nav>
 <div class="pd"><div class="gal"><div class="main" id="main"><img id="mi" src="${img(p.i[0])}" alt="${esc(p.n)}" width="800" height="800"></div>
 ${p.i.length>1?`<div class="thumbs">${p.i.map((k,i)=>`<button data-k="${k}" aria-current="${!i}" aria-label="Image ${i+1}"><img src="${img(k,1)}" alt="" loading="lazy"></button>`).join('')}</div>`:''}</div>
 <div class="info"><p class="sku mono">${esc(p.sku)}</p><h1>${esc(p.n)}</h1>
 <div class="bigpr"><b>${gbp(p.p)}</b>${p.w?`<s>${gbp(p.w)}</s>`:''}<small class="mono">ex VAT</small><span style="color:var(--mute);width:100%">${gbp(p.p*(1+VAT))} inc VAT</span></div>
 ${p.f?`<div class="opt"><h4>Finish: ${esc(p.f)}</h4><div class="chips"><span class="chip" aria-pressed="true"><i style="--c:${sw(p.f)}"></i>${esc(p.f)}</span>${sibs.slice(0,10).map(s=>`<a class="chip" href="${url(s)}"><i style="--c:${sw(s.f)}"></i>${esc(s.f)}</a>`).join('')}</div></div>`:''}
 <div class="buy"><div class="qty"><button type="button" data-d="-1" aria-label="Fewer">−</button><input id="qn" type="number" inputmode="numeric" min="1" max="999" value="1" aria-label="Quantity"><button type="button" data-d="1" aria-label="More">+</button></div><button class="btn" id="addb">Add to basket</button></div>
 <div class="assure"><div>Shipping in 2 to 3 working days</div><div>30-day money-back guarantee</div><div>Trade accounts and project pricing on request</div></div>
 ${p.d.length?`<div class="desc">${descHTML(p.d)}</div>`:''}
 <table class="spec">${specs.map(([k,v])=>`<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table></div></div>
 ${rel.length?`<section class="rel" style="padding-bottom:5rem"><h2>Pairs well with</h2><div class="grid">${rel.map(card).join('')}</div></section>`:''}`;
 const qn=$('#qn');$$('.qty [data-d]').forEach(b=>b.onclick=()=>qn.value=Math.max(1,Math.min(999,(+qn.value||1)+ +b.dataset.d)));
 $('#addb').onclick=()=>{const n=Math.max(1,Math.min(999,+qn.value||1));cart.add(p.id,n);toast(p,n)};
 $$('.thumbs button').forEach(b=>b.onclick=()=>{$('#mi').src=img(b.dataset.k);$$('.thumbs button').forEach(x=>x.setAttribute('aria-current',x===b))});
 const mn=$('#main');mn.onclick=e=>{mn.classList.toggle('z');move(e)};const move=e=>{if(!mn.classList.contains('z'))return;const r=mn.getBoundingClientRect();$('#mi').style.transformOrigin=`${(e.clientX-r.left)/r.width*100}% ${(e.clientY-r.top)/r.height*100}%`};mn.onmousemove=move;
 const ld={"@context":"https://schema.org","@type":"Product",name:p.n,sku:p.sku,image:location.origin+img(p.i[0]).replace(/^\.\.\//,location.pathname.replace(/product\/.*/,'')),offers:{"@type":"Offer",priceCurrency:"GBP",price:p.p.toFixed(2),availability:"https://schema.org/InStock"}};
 const s=document.createElement('script');s.type='application/ld+json';s.textContent=JSON.stringify(ld);document.head.append(s)}

/* ---------- BASKET ---------- */
function sumHTML(t,btn){return `<div class="r"><span>Subtotal ex VAT</span><span>${gbp(t.ex)}</span></div><div class="r"><span>Delivery</span><span>Confirmed with order</span></div><div class="r"><span>VAT 20%</span><span>${gbp(t.vat)}</span></div><div class="r t"><span>Total inc VAT</span><span>${gbp(t.inc)}</span></div>
 <p class="note">Delivery cost, if any, is confirmed by our sales team before you pay.</p>${btn||''}`}
async function basket(){await load();const m=$('#bk');
 function r(){const L=resolve();if(!L.length){m.innerHTML=`<div class="done" style="padding:3rem 0"><h1 style="font-size:clamp(2.6rem,8vw,5rem)">Your basket is empty.</h1><p style="color:var(--mute)">Everything we stock is in the shop.</p><div class="acts"><a class="btn" href="${ROOT}shop/">Browse the shop</a></div></div>`;return}
  const t=totals(L);
  m.innerHTML=`<div class="two"><div><div class="lines">${L.map(l=>`<div class="line"><a href="${url(l.p)}"><img src="${img(l.p.i[0],1)}" alt=""></a><div><h3><a href="${url(l.p)}">${esc(l.p.n)}</a></h3><div class="var mono">${esc(l.p.sku)} · ${gbp(l.p.p)} each ex VAT</div>
   <div class="ctl"><div class="qty"><button data-id="${esc(l.id)}" data-d="-1" aria-label="Fewer">−</button><input data-id="${esc(l.id)}" type="number" inputmode="numeric" min="1" value="${l.q}" aria-label="Quantity"><button data-id="${esc(l.id)}" data-d="1" aria-label="More">+</button></div><button class="rm" data-rm="${esc(l.id)}">Remove</button></div></div><div class="tot">${gbp(l.p.p*l.q)}</div></div>`).join('')}</div>
   <p style="margin-top:1.2rem"><a class="mono" href="${ROOT}shop/">← Continue shopping</a></p></div>
   <aside class="sum"><h2>Summary</h2>${sumHTML(t,`<a class="btn" href="${ROOT}checkout/">Checkout</a>`)}<p class="note">Ordering for a project? Send us the schedule and we'll quote the lot.</p></aside></div>`}
 m.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.rm){cart.qty(b.dataset.rm,0);r()}else if(b.dataset.d){const l=cart.get().find(x=>x.id===b.dataset.id);cart.qty(b.dataset.id,l.q+ +b.dataset.d);r()}});
 m.addEventListener('change',e=>{if(e.target.dataset.id){cart.qty(e.target.dataset.id,Math.max(0,+e.target.value||0));r()}});r()}

/* ---------- CHECKOUT ---------- */
async function checkout(){await load();const m=$('#ck');const L=resolve();
 if(!L.length){m.innerHTML=`<div class="done" style="padding:3rem 0"><h1 style="font-size:clamp(2.6rem,8vw,5rem)">Nothing to check out.</h1><div class="acts"><a class="btn" href="${ROOT}shop/">Browse the shop</a></div></div>`;return}
 const t=totals(L);const sv=JSON.parse(localStorage.getItem('dq_details')||'{}');
 const f=(n,l,a='',full)=>`<div class="fd${full?' full':''}"><label for="${n}">${l}</label><input id="${n}" name="${n}" ${a} value="${esc(sv[n]||'')}"><div class="em">Please fill this in.</div></div>`;
 m.innerHTML=`<div class="two"><form class="form" id="cf" novalidate>
 <fieldset><legend><span>01</span>Your details</legend><div class="fg">${f('name','Full name','required autocomplete="name"')}${f('company','Company (optional)','autocomplete="organization"')}${f('email','Email','required type="email" autocomplete="email"')}${f('phone','Phone','required type="tel" autocomplete="tel"')}</div></fieldset>
 <fieldset><legend><span>02</span>Delivery address</legend><div class="fg">${f('addr1','Address line 1','required autocomplete="address-line1"',1)}${f('addr2','Address line 2 (optional)','autocomplete="address-line2"',1)}${f('town','Town or city','required autocomplete="address-level2"')}${f('postcode','Postcode','required autocomplete="postal-code" style="text-transform:uppercase"')}
 <div class="fd full"><label for="note">Delivery note (optional)</label><textarea id="note" name="note" placeholder="Site contact, access times, PO number, phased delivery…">${esc(sv.note||'')}</textarea></div></div></fieldset>
 <fieldset><legend><span>03</span>Payment</legend><div class="radios">
  <label class="radio"><input type="radio" name="pay" value="Pro forma invoice" checked><span><b>Pro forma invoice</b><small>We confirm stock and email an invoice. Pay by bank transfer and we dispatch.</small></span></label>
  <label class="radio"><input type="radio" name="pay" value="Card over the phone"><span><b>Card over the phone</b><small>We call you to take payment securely before dispatch.</small></span></label>
  <label class="radio"><input type="radio" name="pay" value="Trade account (30 days)"><span><b>Trade account</b><small>Existing account holders. Add your PO number in the delivery note.</small></span></label></div>
  <p style="margin-top:1.2rem"><label class="check"><input type="checkbox" id="tc" required><span>I agree to Dorquip's <a href="https://www.dorquip.com/legal/terms-and-conditions" target="_blank" rel="noopener">terms and conditions</a>.</span></label></p>
  <p class="em" id="tce" style="color:#b3412e;display:none;margin-top:.4rem">Please accept the terms to continue.</p></fieldset>
 <button class="btn" style="width:100%" type="submit">Place order</button>
 <p style="margin-top:.8rem;color:var(--mute);font-size:.88rem">Nothing is charged now. Your order goes straight to our sales team, who confirm stock, delivery date and payment by email, normally the same working day.</p></form>
 <aside class="sum"><h2>Your order</h2><div class="mini">${L.map(l=>`<div><img src="${img(l.p.i[0],1)}" alt=""><span>${l.q} × ${esc(l.p.n)}</span><span>${gbp(l.p.p*l.q)}</span></div>`).join('')}</div>${sumHTML(t)}<p class="note"><a href="${ROOT}basket/" style="color:inherit">Edit basket</a></p></aside></div>`;
 const F=$('#cf');F.addEventListener('submit',e=>{e.preventDefault();let ok=true,first;
  $$('input[required]:not([type=checkbox])',F).forEach(i=>{const bad=!i.value.trim()||(i.type==='email'&&!/^\S+@\S+\.\S+$/.test(i.value))||(i.name==='postcode'&&!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(i.value.trim()));i.closest('.fd').classList.toggle('err',bad);if(bad){ok=false;first=first||i}});
  $('#tce').style.display=$('#tc').checked?'none':'block';if(!$('#tc').checked)ok=false;
  if(!ok){(first||$('#tc')).focus();(first||$('#tc')).scrollIntoView({block:'center',behavior:'smooth'});return}
  const d=Object.fromEntries(new FormData(F));localStorage.setItem('dq_details',JSON.stringify({...d,pay:undefined}));
  const ref='DQ-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
  const pad=(s,n)=>(s+'').padEnd(n);
  const body=[`New web order ${ref}`,'',`CUSTOMER`,`${d.name}${d.company?' / '+d.company:''}`,`${d.email} / ${d.phone}`,'',`DELIVER TO`,d.addr1,d.addr2,`${d.town} ${d.postcode.toUpperCase()}`,'',d.note?`DELIVERY NOTE\n${d.note}\n`:'',`ITEMS`,
   ...L.map(l=>`${pad(l.q+' x',6)}${l.p.sku}  ${l.p.n}\n      ${gbp(l.p.p)} each = ${gbp(l.p.p*l.q)} ex VAT`),'',
   `Subtotal ex VAT: ${gbp(t.ex)}`,`Delivery: to be confirmed`,`VAT 20%: ${gbp(t.vat)}`,`TOTAL inc VAT: ${gbp(t.inc)}`,'',`PAYMENT: ${d.pay}`].filter(x=>x!=='').join('\n').replace(/\n(?=CUSTOMER|DELIVER TO|ITEMS|DELIVERY NOTE|Subtotal|PAYMENT)/g,'\n\n');
  const href=`mailto:${EMAIL}?cc=${encodeURIComponent(d.email)}&subject=${encodeURIComponent('Web order '+ref+' / '+(d.company||d.name))}&body=${encodeURIComponent(body)}`;
  location.href=href;cart.clear();
  m.innerHTML=`<div class="done"><p class="mono" style="color:var(--brass)">Order received</p><h1>Thank you, ${esc(d.name.split(' ')[0])}.</h1><span class="ref mono">Reference ${ref}</span>
  <p style="max-width:56ch;color:var(--ink2)">Your email app has opened with the full order addressed to ${EMAIL}. Press send and our sales team will confirm stock, delivery and payment, normally the same working day.</p>
  <div class="acts"><a class="btn" href="${esc(href)}">Open email again</a><button class="btn ghost" id="cp">Copy order</button><a class="btn ghost" href="${ROOT}shop/">Back to the shop</a></div>
  <p style="margin-top:1rem;color:var(--mute);font-size:.9rem">Email not opening? Call 01483 310333 (Mon to Fri, 7:30 to 16:30) and quote ${ref}.</p><pre>${esc(body)}</pre></div>`;
  $('#cp').onclick=()=>navigator.clipboard.writeText(body).then(()=>$('#cp').textContent='Copied');scrollTo(0,0)})}

badge();
const pg=document.body.dataset.page;({shop,product,basket,checkout}[pg]||(()=>{}))();
})();
