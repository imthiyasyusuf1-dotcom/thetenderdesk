/* Woody's ordering: shared store, menu, item builder, basket, checkout. Vanilla JS, no build step. */
(function(){
"use strict";
const B = window.BRANCHES, MS = window.MENUS || {};
const Mn = () => MS[S.branch] || [];
const KEY = "woodys_basket_v2";
const $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const gbp = n => "£" + (Math.round(n*100)/100).toFixed(2);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- store ---------- */
function load(){ try{ return Object.assign({branch:"aldershot",mode:"collection",postcode:"",pcOk:false,items:[]}, JSON.parse(localStorage.getItem(KEY)||"{}")); }catch(e){ return {branch:"aldershot",mode:"collection",postcode:"",pcOk:false,items:[]}; } }
let S = load();
function save(){ localStorage.setItem(KEY, JSON.stringify(S)); render(); }
const lineTotal = l => (l.base + l.sel.reduce((a,s)=>a+s[2],0)) * l.qty;
const subTotal = () => S.items.reduce((a,l)=>a+lineTotal(l),0);
const count = () => S.items.reduce((a,l)=>a+l.qty,0);
function zoneFor(pc){ const z=B[S.branch].delivery.zones; if(!z||!pc) return null; const c=pc.toUpperCase(); let best=null,bl=0; z.forEach(r=>r.m.forEach(m=>{ const out=c.split(" ")[0]; const hit = m.includes(" ") ? c.startsWith(m) : out===m; if(hit && m.length>bl){ best=r; bl=m.length; } })); return best; }
function deliveryFee(){ if(S.mode!=="delivery") return 0; const z=zoneFor(S.postcode); if(!z) return 0; const sub=subTotal(); if(z.freeOver && sub>=z.freeOver) return 0; if(z.over12 && sub>=12) return z.over12; return z.fee; }

/* ---------- opening hours ---------- */
function openState(key, now=new Date()){
  const h=B[key].hours, t=now.getHours()+now.getMinutes()/60, d=now.getDay();
  const prev=h[(d+6)%7];
  if(prev && prev[1]>24 && t < prev[1]-24) return {open:true, closes:prev[1]-24};
  const td=h[d];
  if(td && t>=td[0] && t<td[1]) return {open:true, closes:td[1]};
  for(let i=0;i<7;i++){ const dd=(d+i)%7, x=h[dd]; if(!x) continue; if(i===0 && t<x[0]) return {open:false, opens:x[0], day:0}; if(i>0) return {open:false, opens:x[0], day:i}; }
  return {open:false};
}
const fmtH = h => { const hh=Math.floor(h)%24, mm=Math.round((h%1)*60); const ap=hh>=12?"pm":"am"; const h12=hh%12||12; return hh===0&&mm===0?"midnight":h12+(mm?"."+String(mm).padStart(2,"0"):"")+ap; };
function statusText(key){ const s=openState(key); if(s.open) return {on:true, txt:`Open now until ${fmtH(s.closes)}`};
  const days=["today","tomorrow"]; const when = s.day<2 ? days[s.day] : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][(new Date().getDay()+s.day)%7];
  return {on:false, txt:`Closed. Opens ${when} at ${fmtH(s.opens)}`}; }
window.WOODY = {openState, statusText, fmtH};

/* ---------- postcode ---------- */
const PC_RE=/^([A-Z]{1,2}[0-9][0-9A-Z]?)\s*([0-9][A-Z]{2})$/;
function checkPostcode(raw){
  const pc=(raw||"").toUpperCase().replace(/\s+/g," ").trim(); const m=pc.replace(/\s/g,"").match(/^([A-Z]{1,2}[0-9][0-9A-Z]?)([0-9][A-Z]{2})$/);
  if(!m) return {ok:false,msg:"Enter a full UK postcode, e.g. GU11 1JZ"};
  const out=m[1], nice=m[1]+" "+m[2], zones=B[S.branch].delivery.zones;
  if(!zones) return {ok:false,pc:nice,msg:`Call ${B[S.branch].name} on ${B[S.branch].tel} to check delivery to ${nice}, or choose collection.`};
  const z=zoneFor(nice);
  if(z) return {ok:true,pc:nice,msg:`${B[S.branch].name} delivers to ${nice}. ${z.freeOver?`£${z.fee} delivery, free over £${z.freeOver}.`:z.min?`£${z.fee} delivery, £${z.min} minimum order.`:`£${z.fee} delivery, £${z.over12} over £12.`}`};
  return {ok:false,pc:nice,msg:`Sorry, ${B[S.branch].name} does not deliver to ${out}. Try collection or another branch.`};
}

/* ---------- item builder modal ---------- */
let cur=null;
function findItem(id){ for(const c of Mn()) for(const i of c.items) if(i.id===id) return i; }
function openItem(id){
  const it=findItem(id); if(!it) return; cur={it,qty:1};
  const m=$("#itemModal"); if(!m) return;
  $(".sh-h h3",m).textContent=it.n; $(".sh-h p",m).textContent=it.d||"";
  const body=$(".sh-b",m);
  body.innerHTML = it.g.map((g,gi)=>{
    const single=g.max===1, req=g.min>0;
    const lab = req ? (g.min===g.max ? (g.min===1?"Required":`Pick ${g.min}`) : `Pick at least ${g.min}`) : (single?"Optional":`Up to ${g.max}`);
    return `<div class="grp" data-gi="${gi}"><div class="grp-h"><b>${esc(g.title)}</b><span class="tag ${req?"req":""}">${lab}</span></div>`+
      g.opts.map((o,oi)=>`<label class="ch"><input type="${single?"radio":"checkbox"}" name="g${gi}" value="${oi}"><span>${esc(o[0])}</span>${o[1]?`<em>+${gbp(o[1])}</em>`:""}</label>`).join("")+`</div>`;
  }).join("") + `<div class="grp"><div class="grp-h"><b>Anything we should know?</b><span class="tag">Optional</span></div><textarea class="note" maxlength="200" placeholder="e.g. no onion, extra crispy"></textarea></div>
  <p class="allergy"><b>Allergies?</b> Please call ${esc(B[S.branch].name)} on <a href="tel:${B[S.branch].tel.replace(/\s/g,"")}">${B[S.branch].tel}</a> before you order. They can talk you through every ingredient.</p>`;
  body.scrollTop=0;
  $$("input",body).forEach(inp=>inp.addEventListener("change",e=>{
    const gi=+e.target.name.slice(1), g=it.g[gi];
    if(e.target.type==="checkbox" && g.max>1){ const on=$$(`input[name=g${gi}]:checked`,body); if(on.length>g.max){ e.target.checked=false; } }
    if(e.target.type==="radio"){ /* allow unselect for optional radios via click handled below */ }
    updItem();
  }));
  $$("input[type=radio]",body).forEach(r=>r.addEventListener("click",e=>{ const g=it.g[+r.name.slice(1)]; if(g.min===0 && r.dataset.was==="1"){ r.checked=false; r.dataset.was="0"; updItem(); return;} $$(`input[name=${r.name}]`,body).forEach(x=>x.dataset.was="0"); r.dataset.was=r.checked?"1":"0"; }));
  $(".qv",m).textContent="1"; updItem(); show(m);
}
function itemSel(){ const body=$("#itemModal .sh-b"); const sel=[]; cur.it.g.forEach((g,gi)=>$$(`input[name=g${gi}]:checked`,body).forEach(i=>{const o=g.opts[+i.value]; sel.push([g.title,o[0],o[1]]);})); return sel; }
function updItem(){
  const sel=itemSel(), each=cur.it.p+sel.reduce((a,s)=>a+s[2],0);
  $("#itemAdd").innerHTML=`<span>Add ${cur.qty>1?cur.qty+" ":""}to order</span><span>${gbp(each*cur.qty)}</span>`;
  $$("#itemModal .grp[data-gi]").forEach(el=>{ const g=cur.it.g[+el.dataset.gi], n=$$("input:checked",el).length; const t=$(".tag",el); if(el.dataset.err && n>=g.min){ t.classList.remove("err"); delete el.dataset.err; } });
}
window.__q=n=>{ if(cur){ cur.qty=n; updItem(); } };
function addCurrent(){
  const body=$("#itemModal .sh-b"); let bad=null;
  cur.it.g.forEach((g,gi)=>{ const n=$$(`input[name=g${gi}]:checked`,body).length; if(n<g.min){ const el=$(`.grp[data-gi="${gi}"]`,body); el.dataset.err=1; $(".tag",el).classList.add("err"); bad=bad||el; } });
  if(bad){ bad.scrollIntoView({behavior:"smooth",block:"center"}); return; }
  const sel=itemSel(), note=$("textarea.note",body).value.trim();
  const key=cur.it.id+"|"+JSON.stringify(sel)+"|"+note;
  const ex=S.items.find(l=>l.key===key);
  if(ex) ex.qty+=cur.qty; else S.items.push({key,id:cur.it.id,n:cur.it.n,base:cur.it.p,sel,note,qty:cur.qty});
  save(); hide($("#itemModal")); toast(`${cur.it.n} added`);
}
function quickAdd(id){ const it=findItem(id); if(it.g.length){ openItem(id); return; } const key=id+"|[]|"; const ex=S.items.find(l=>l.key===key); if(ex) ex.qty++; else S.items.push({key,id,n:it.n,base:it.p,sel:[],note:"",qty:1}); save(); toast(`${it.n} added`); }

/* ---------- sheets ---------- */
function show(el){ el.classList.add("on"); $("#scrim").classList.add("on"); document.documentElement.style.overflow="hidden"; }
function hide(el){ el.classList.remove("on"); if(!$$(".sheet.on").length){ $("#scrim").classList.remove("on"); document.documentElement.style.overflow=""; } }
function toast(t){ let el=$("#toast"); if(!el){ el=document.createElement("div"); el.id="toast"; el.style.cssText="position:fixed;left:50%;top:76px;transform:translateX(-50%);z-index:120;background:#f6efe3;color:#141210;font-weight:800;padding:10px 18px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.4);transition:opacity .2s"; document.body.appendChild(el);} el.textContent=t; el.style.opacity=1; clearTimeout(el._t); el._t=setTimeout(()=>el.style.opacity=0,1600); }

/* ---------- basket rendering ---------- */
function basketHTML(){
  if(!S.items.length) return `<p class="empty">Your basket is empty. Tap any dish to add it.</p>`;
  return `<ul class="bl">`+S.items.map((l,i)=>`<li><span class="nm">${esc(l.n)}</span><span>${gbp(lineTotal(l))}</span>${l.sel.length||l.note?`<span class="ex">${esc(l.sel.map(s=>s[1]).join(", "))}${l.note?`${l.sel.length?" · ":""}Note: ${esc(l.note)}`:""}</span>`:""}<span class="qty"><button aria-label="Remove one" data-q="${i}" data-d="-1">−</button><b>${l.qty}</b><button aria-label="Add one" data-q="${i}" data-d="1">+</button></span></li>`).join("")+`</ul>`;
}
function totalsHTML(){
  const d=B[S.branch].delivery, sub=subTotal();
  let rows=`<div class="tot"><span>Subtotal</span><span>${gbp(sub)}</span></div>`;
  if(S.mode==="delivery") rows+=`<div class="tot"><span>Delivery</span><span>${deliveryFee()?gbp(deliveryFee()):"Free"}</span></div>`;
  rows+=`<div class="tot g"><span>Total</span><span>${gbp(sub+deliveryFee())}</span></div>`;
  return rows;
}
function canCheckout(){ if(!S.items.length) return "Add something to your basket first."; if(S.mode==="delivery" && !S.pcOk) return "Check your postcode for delivery, or switch to collection."; const z=zoneFor(S.postcode); if(S.mode==="delivery" && z && z.min && subTotal()<z.min) return `Minimum delivery order to ${S.postcode.split(" ")[0]} is ${gbp(z.min)}.`; return ""; }
function render(){
  const n=count(), sub=subTotal();
  $$(".cnt").forEach(e=>e.textContent=n);
  $$("[data-basket]").forEach(el=>{ el.innerHTML=basketHTML(); });
  $$("[data-totals]").forEach(el=>{ el.innerHTML=S.items.length?totalsHTML():""; });
  const why=canCheckout();
  $$("[data-checkout]").forEach(b=>{ b.toggleAttribute("aria-disabled",!!why); b.style.opacity=why?.55:1; });
  $$("[data-why]").forEach(e=>{ e.textContent=S.items.length?why:""; });
  const mb=$("#mbar .btn"); if(mb) mb.innerHTML = n ? `<span>View basket · ${n} item${n>1?"s":""}</span><span>${gbp(sub)}</span>` : `<span>Start your order</span><span>→</span>`;
  $$(".item").forEach(el=>{ const q=S.items.filter(l=>l.id===el.dataset.id).reduce((a,l)=>a+l.qty,0); const a=$(".add",el); a.textContent=q?q:"+"; a.classList.toggle("inb",!!q); });
  $$("[data-branchname]").forEach(e=>e.textContent=B[S.branch].name);
  $$(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.mode===S.mode));
  const pc=$("#pcRow"); if(pc) pc.hidden = S.mode!=="delivery";
  const bs=$("#branchSel"); if(bs) bs.value=S.branch;
  buildStatus();
}
document.addEventListener("click",e=>{
  const q=e.target.closest("[data-q]"); if(q){ const l=S.items[+q.dataset.q]; l.qty+= +q.dataset.d; if(l.qty<=0) S.items.splice(+q.dataset.q,1); save(); return; }
  const it=e.target.closest(".item"); if(it){ e.target.closest(".add") ? quickAdd(it.dataset.id) : openItem(it.dataset.id); return; }
  const c=e.target.closest("[data-checkout]"); if(c){ e.preventDefault(); const why=canCheckout(); if(why){ toast(why); if(!S.items.length){ hide($("#drawer")); location.hash="order"; } else if(S.mode==="delivery"){ hide($("#drawer")); $("#pc")&&$("#pc").focus(); } return; } location.href="checkout.html"; return; }
  if(e.target.closest("[data-open-basket]")){ e.preventDefault(); if(!count() && $("#order")){ $("#order").scrollIntoView({behavior:"smooth"}); return; } show($("#drawer")); return; }
  if(e.target.closest(".x") || e.target.id==="scrim"){ $$(".sheet.on").forEach(hide); }
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape") $$(".sheet.on").forEach(hide); });

/* ---------- menu page ---------- */
function menuHTML(){
  const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  const M=Mn();
  $("#cats").innerHTML=M.map(c=>`<a href="#c-${slug(c.c)}">${esc(c.c)}</a>`).join("");
  $("#menu").innerHTML=M.map(c=>`<section class="cat" id="c-${slug(c.c)}" data-cat><div class="cat-h"><h3>${esc(c.c)}</h3><span>${c.items.length}</span></div>${c.note?`<p class="note">${esc(c.note)}</p>`:""}<div class="items">`+
    c.items.map(i=>`<button class="item${i.img?" has-img":""}" data-id="${i.id}" data-s="${esc((i.n+" "+i.d+" "+c.c).toLowerCase())}">${i.img?`<span class="thumb ${i.k}"><img loading="lazy" decoding="async" src="assets/img/dish/${i.img}${i.k==="ph"?"-ph":""}.webp" alt="${esc(i.n)}" width="160" height="120"></span>`:""}<span class="t"><b>${esc(i.n)}</b>${i.d?`<span class="d">${esc(i.d)}</span>`:""}<span class="p">${i.g.some(g=>g.title==="Choose Size")?"From ":""}${gbp(i.p)}${i.g.length?`<span class="opt">Customise</span>`:""}</span></span><span class="add" aria-label="Add ${esc(i.n)}">+</span></button>`).join("")+`</div></section>`).join("");
  const links=$$("#cats a");
  const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ const id=en.target.id; links.forEach(a=>{ const on=a.getAttribute("href")==="#"+id; a.classList.toggle("on",on); if(on){ const n=$("#cats"); n.scrollTo({left:a.offsetLeft-n.clientWidth/2+a.clientWidth/2,behavior:"smooth"}); } }); } }),{rootMargin:"-160px 0px -65% 0px"});
  $$("[data-cat]").forEach(s=>io.observe(s));
  const q=$("#q"); if(q.value) q.dispatchEvent(new Event("input"));
  document.dispatchEvent(new CustomEvent("menu:built"));
}
function buildMenu(){
  const host=$("#menu"); if(!host) return;
  menuHTML();
  $("#q").addEventListener("input",e=>{ const v=e.target.value.toLowerCase().trim(); $$(".item").forEach(b=>b.hidden=v&&!b.dataset.s.includes(v)); $$("[data-cat]").forEach(s=>s.hidden=!$$(".item",s).some(b=>!b.hidden)); });
  const pcMsg=r=>{ const el=$("#pcMsg"); el.textContent=r.msg; el.className="pcmsg "+(r.ok?"ok":"bad"); };
  const setBranch=v=>{ if(v===S.branch) return; if(S.items.length){ S.items=[]; toast("Basket cleared for the "+B[v].name+" menu"); } S.branch=v; S.pcOk=false; if(S.postcode){ const r=checkPostcode(S.postcode); S.pcOk=r.ok; pcMsg(r);} menuHTML(); save(); };
  window.WOODY.setBranch=setBranch;
  $("#branchSel").addEventListener("change",e=>setBranch(e.target.value));
  $$(".seg button").forEach(b=>b.addEventListener("click",()=>{ S.mode=b.dataset.mode; save(); if(S.mode==="delivery") $("#pc").focus({preventScroll:true}); }));
  $("#pc").value=S.postcode||"";
  if(S.postcode){ pcMsg(checkPostcode(S.postcode)); }
  $("#pcForm").addEventListener("submit",e=>{ e.preventDefault(); const r=checkPostcode($("#pc").value); S.pcOk=r.ok; if(r.pc) { S.postcode=r.pc; $("#pc").value=r.pc; } pcMsg(r); save(); });
}
function buildStatus(){
  $$("[data-status]").forEach(el=>{ if(el.closest("#brList")) return; const k=el.dataset.status||S.branch; const s=statusText(k); el.innerHTML=`<i class="dot ${s.on?"on":"off"}"></i>${el.dataset.label?esc(B[k].name)+": ":""}${s.txt}`; });
}
/* ---------- checkout page ---------- */
function slots(){
  const k=S.branch, out=[], now=new Date(); const st=openState(k);
  if(st.open) out.push(["asap", S.mode==="delivery"?"As soon as possible":"As soon as possible"]);
  for(let day=0; day<2 && out.length<40; day++){
    const d=new Date(now); d.setDate(d.getDate()+day); const h=B[k].hours[d.getDay()]; if(!h) continue;
    for(let t=h[0]+0.5; t<=h[1]-0.25; t+=0.25){ const dt=new Date(d); dt.setHours(0,0,0,0); dt.setMinutes(Math.round(t*60)); if(dt-now < 30*60000) continue;
      out.push([dt.toISOString(), (day?"Tomorrow ":"Today ")+fmtH(t)]); }
  }
  return out;
}
function buildCheckout(){
  const f=$("#coForm"); if(!f) return;
  const br=B[S.branch];
  if(!S.items.length && !sessionStorage.getItem("woodys_last")){ $("#coMain").innerHTML=`<div class="box"><h3>Your basket is empty</h3><p>Head back to the menu to add something.</p><p style="margin-top:14px"><a class="btn btn-y" href="index.html#order">Back to the menu</a></p></div>`; }
  $("#coMode").textContent = S.mode==="delivery" ? `Delivery to ${S.postcode} from ${br.name}` : `Collection from ${br.street}, ${br.town}`;
  $("#addrBox").hidden = S.mode!=="delivery";
  $$("#addrBox input[required-if]").forEach(i=>i.required = S.mode==="delivery");
  if(S.mode==="delivery") $("#postcodeF").value=S.postcode;
  $("#slot").innerHTML = slots().map(s=>`<option value="${s[0]}">${s[1]}</option>`).join("") || `<option value="">No times available</option>`;
  const st=statusText(S.branch); $("#coStatus").innerHTML=`<i class="dot ${st.on?"on":"off"}"></i>${br.name}: ${st.txt}${st.on?"":". You can order now for later."}`;
  try{ const saved=JSON.parse(localStorage.getItem("woodys_customer")||"{}"); ["name","phone","email","addr1","addr2","town"].forEach(k=>{ if(saved[k] && f.elements[k]) f.elements[k].value=saved[k]; }); }catch(e){}
  f.addEventListener("submit",e=>{
    e.preventDefault(); const why=canCheckout(); if(why){ $("#coErr").textContent=why; return; }
    const ph=(f.elements.phone.value||"").replace(/[^0-9+]/g,""); if(ph.length<10||ph.length>14){ $("#coErr").textContent="Please enter a valid mobile number so the shop can reach you."; f.elements.phone.focus(); return; }
    if(!f.reportValidity()) return;
    const data=Object.fromEntries(new FormData(f).entries());
    localStorage.setItem("woodys_customer",JSON.stringify({name:data.name,phone:data.phone,email:data.email,addr1:data.addr1,addr2:data.addr2,town:data.town}));
    const order={ ref:"W"+Date.now().toString(36).toUpperCase().slice(-6), placed:new Date().toISOString(), branch:S.branch, mode:S.mode, postcode:S.postcode, slot:data.slot, slotLabel:$("#slot").selectedOptions[0]?.textContent, customer:data, items:S.items, subtotal:subTotal(), delivery:deliveryFee(), total:subTotal()+deliveryFee() };
    // PAYMENT STUB: in production POST `order` to PAYMENT.endpoint, which validates prices server-side,
    // creates a Stripe Checkout Session and returns its URL; then location.href = session.url.
    sessionStorage.setItem("woodys_pending",JSON.stringify(order));
    $("#stubTotal").textContent=gbp(order.total); $("#stubTotal2").textContent=gbp(order.total);
    show($("#payStub"));
  });
  const payNow=()=>{ const o=JSON.parse(sessionStorage.getItem("woodys_pending")); sessionStorage.setItem("woodys_last",JSON.stringify(o)); S.items=[]; save(); hide($("#payStub")); confirmScreen(o); };
  $("#stubPay").addEventListener("click",payNow); $$("[data-pay]").forEach(b=>b.addEventListener("click",payNow));
  const last=sessionStorage.getItem("woodys_last"); if(location.hash==="#done" && last) confirmScreen(JSON.parse(last));
}
function confirmScreen(o){
  const br=B[o.branch]; history.replaceState(null,"","#done"); window.scrollTo(0,0);
  $("#coMain").innerHTML=`<div class="done"><div class="tick">✓</div><p class="kick">Order received</p><h1>Thanks, ${esc(o.customer.name.split(" ")[0])}</h1><div class="ref">Order ${o.ref}</div>
  <p>${o.mode==="delivery"?`Delivery to ${esc(o.customer.addr1)}, ${esc(o.postcode)}`:`Collect from Woody's ${br.name}, ${br.street}`}: <b>${esc(o.slotLabel||"")}</b>.</p>
  <div class="box" style="text-align:left;margin-top:22px"><h3>Your order</h3><ul class="bl">${o.items.map(l=>`<li><span class="nm">${l.qty} × ${esc(l.n)}</span><span>${gbp(lineTotal(l))}</span>${l.sel.length||l.note?`<span class="ex">${esc(l.sel.map(s=>s[1]).join(", "))}${l.note?" · Note: "+esc(l.note):""}</span>`:""}</li>`).join("")}</ul>${o.delivery?`<div class="tot"><span>Delivery</span><span>${gbp(o.delivery)}</span></div>`:""}<div class="tot g"><span>Total</span><span>${gbp(o.total)}</span></div></div>
  <p class="mini">Questions about your order? Call ${br.name} on <a href="tel:${br.tel.replace(/\s/g,"")}">${br.tel}</a>. Keep this reference handy when you collect or call.</p>
  <p style="margin-top:20px"><a class="btn btn-y" href="index.html#order">Back to the menu</a></p></div>`;
  $("#coSide") && ($("#coSide").hidden=true);
}

/* ---------- reveal ---------- */
function reveal(){ const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }),{rootMargin:"0px 0px -8% 0px"}); $$(".rv-in").forEach(el=>io.observe(el)); }

document.addEventListener("click",e=>{ if(e.target.id==="itemAdd"||e.target.closest("#itemAdd")) addCurrent(); });
buildMenu(); buildStatus(); buildCheckout(); render(); reveal();
setInterval(buildStatus,60000);
const mbar=$("#mbar"); if(mbar){ const f=()=>mbar.hidden = !count() && scrollY<420; addEventListener("scroll",f,{passive:true}); document.addEventListener("click",()=>setTimeout(f,50)); f(); }
})();
