
(function(){
'use strict';
var ROOT=document.body.getAttribute('data-root')||'';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var KEY='if_cart',VK='if_vat',DATA=null,BY={};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
var vat=ls(VK)==='inc'?'inc':'ex';
function gbp(n){return '\u00a3'+(Math.round(n*100)/100).toFixed(2)}
function px(p){return vat==='inc'?p*1.2:p}
function label(){return vat==='inc'?'inc VAT':'ex VAT'}
var cart={get:function(){try{return JSON.parse(ls(KEY))||[]}catch(e){return[]}},set:function(c){ls(KEY,JSON.stringify(c));refresh()},
add:function(id,q){var c=this.get(),l=c.filter(function(x){return x.id===id})[0];if(l)l.q+=q;else c.push({id:id,q:q});this.set(c)},
setq:function(id,q){var c=this.get().map(function(x){return x.id===id?{id:id,q:q}:x}).filter(function(x){return x.q>0});this.set(c)},
clear:function(){ls(KEY,null);refresh()},count:function(){return this.get().reduce(function(a,x){return a+x.q},0)}};
function lines(){return cart.get().map(function(l){return {id:l.id,q:l.q,p:BY[l.id]}}).filter(function(l){return l.p})}
function totals(L){var ex=0;L.forEach(function(l){ex+=l.p.p*l.q});ex=Math.round(ex*100)/100;var v=Math.round(ex*0.2*100)/100;return {ex:ex,vat:v,inc:Math.round((ex+v)*100)/100}}
function img(p,s){var k=p.i&&p.i[0];return k?ROOT+'img/p/'+k+(s?'-s':'')+'.webp':''}
function purl(p){return ROOT+'product/?id='+encodeURIComponent(p.id)}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('on')},2200)}
function load(){if(DATA)return Promise.resolve(DATA);return fetch(ROOT+'data/cat.json').then(function(r){return r.json()}).then(function(d){DATA=d;d.items.forEach(function(p){BY[p.id]=p});return d})}
function card(p){return '<a class="card" href="'+purl(p)+'"><div class="im"><img src="'+img(p,true)+'" alt="" loading="lazy" width="200" height="200"></div><div class="tx"><span class="nm">'+esc(p.n)+'</span><span class="sk">'+esc(p.sku)+'</span><span class="pr">'+gbp(px(p.p))+' <small>'+label()+'</small></span></div></a>'}
function renderBag(){var L=lines(),b=$('#dr-b'),f=$('#dr-f');if(!b)return;
if(!L.length){b.innerHTML='<p style="padding:20px 0">Your basket is empty.</p>';f.innerHTML='<a class="btn" href="'+ROOT+'shop/">Browse the shop</a>';return}
b.innerHTML=L.map(function(l){return '<div class="dl"><img src="'+img(l.p,true)+'" alt=""><div><div class="nm">'+esc(l.p.n)+'</div><div class="sk sm">'+esc(l.p.sku)+' &middot; '+gbp(px(l.p.p))+' '+label()+'</div><div class="ctl"><div class="qty"><button type="button" data-q="-1" data-id="'+esc(l.id)+'" aria-label="Less">-</button><span>'+l.q+'</span><button type="button" data-q="1" data-id="'+esc(l.id)+'" aria-label="More">+</button></div><button class="rm" type="button" data-rm="'+esc(l.id)+'">Remove</button></div></div></div>'}).join('');
var t=totals(L);f.innerHTML='<div class="sumr"><span>Subtotal ex VAT</span><span>'+gbp(t.ex)+'</span></div><div class="sumr"><span>VAT 20%</span><span>'+gbp(t.vat)+'</span></div><div class="sumr t"><span>Total inc VAT</span><span>'+gbp(t.inc)+'</span></div><p class="sm" style="margin:6px 0 0">Delivery confirmed with your order.</p><a class="btn" href="'+ROOT+'checkout/">Checkout</a>'}
function refresh(){$$('.bag b').forEach(function(b){b.textContent=cart.count()||''});if(DATA)renderBag()}
function openBag(){load().then(function(){renderBag();$('#drawer').hidden=false;$('.drawer-bg').hidden=false;document.body.style.overflow='hidden'})}
function closeBag(){$('#drawer').hidden=true;$('.drawer-bg').hidden=true;document.body.style.overflow=''}
function setVat(v){vat=v;ls(VK,v);$$('[data-vat]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-vat')===v)});if(window.__rerender)window.__rerender();if(DATA)renderBag()}
document.addEventListener('click',function(e){var t=e.target.closest('[data-open-basket],[data-close-basket],[data-vat],[data-burger],[data-q],[data-rm],[data-add]');if(!t)return;
if(t.hasAttribute('data-open-basket'))openBag();
else if(t.hasAttribute('data-close-basket'))closeBag();
else if(t.hasAttribute('data-vat'))setVat(t.getAttribute('data-vat'));
else if(t.hasAttribute('data-burger')){var m=$('#mmenu'),o=m.hidden;m.hidden=!o;t.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''}
else if(t.hasAttribute('data-q')){var id=t.getAttribute('data-id'),l=cart.get().filter(function(x){return x.id===id})[0];if(l)cart.setq(id,l.q+parseInt(t.getAttribute('data-q'),10))}
else if(t.hasAttribute('data-rm'))cart.setq(t.getAttribute('data-rm'),0);
else if(t.hasAttribute('data-add')){e.preventDefault();cart.add(t.getAttribute('data-add'),1);toast('Added to basket')}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeBag()});

function home(){var pop=['D1011.900','H1005.480','A1001.700','F2000.960','H2002.000','E4000.700','H3000.000','H1003.480'];
Promise.all([load(),fetch(ROOT+'data/kit.json').then(function(r){return r.json()})]).then(function(r){var d=r[0],K=r[1];
var bySku={};d.items.forEach(function(p){bySku[p.sku]=p});
$$('[data-count]').forEach(function(el){var n=d.items.filter(function(p){return p.c===el.getAttribute('data-count')}).length;el.textContent=n+' products'});
function drawPop(){$('#popular').innerHTML=pop.map(function(s){return bySku[s]}).filter(Boolean).map(function(p){return card(p).replace('<a class="card"','<a class="card"')}).join('')}
function drawKit(){var rt=$('input[name=kr]:checked').value,ds=$('input[name=kd]:checked').value,L=K[rt+'-'+ds],tot=0;
var h=L.map(function(k){var p=BY[k.id];tot+=p.p*k.q;return '<div class="kl-row"><img src="'+img(p,true)+'" alt=""><div><a href="'+purl(p)+'"><b>'+k.q+' x '+esc(p.n)+'</b></a><small>'+esc(p.sku)+' - '+esc(k.note)+'</small></div><b>'+gbp(px(p.p*k.q))+'</b></div>'}).join('');
h+='<div class="kl-tot"><span>Kit total '+label()+': '+gbp(px(tot))+'</span><button class="btn" type="button" id="kitadd">Add whole kit to basket</button></div>';
$('#kitlist').innerHTML=h;$('#kitadd').onclick=function(){L.forEach(function(k){cart.add(k.id,k.q)});toast('Kit added to basket');openBag()}}
$$('input[name=kr],input[name=kd]').forEach(function(i){i.addEventListener('change',drawKit)});
window.__rerender=function(){drawPop();drawKit()};window.__rerender()})}

function shop(){load().then(function(d){var q=$('#q'),c=$('#cat'),s=$('#sort'),g=$('#grid'),more=$('#more'),n=36;
c.innerHTML='<option value="">All categories</option>'+d.cats.map(function(x){return '<option value="'+x.id+'">'+esc(x.n)+'</option>'}).join('');
var u=new URLSearchParams(location.search);c.value=u.get('c')||'';q.value=u.get('q')||'';s.value=u.get('o')||'';
function list(){var t=q.value.trim().toLowerCase(),L=d.items.filter(function(p){return (!c.value||p.c===c.value)&&(!t||(p.n+' '+p.sku).toLowerCase().indexOf(t)>-1)});
if(s.value==='asc')L=L.slice().sort(function(a,b){return a.p-b.p});if(s.value==='desc')L=L.slice().sort(function(a,b){return b.p-a.p});return L}
function draw(reset){if(reset)n=36;var L=list();$('#count').textContent=L.length+' product'+(L.length===1?'':'s')+' ('+label()+')';
g.innerHTML=L.slice(0,n).map(card).join('')||'<p>No products match. Try another search.</p>';more.hidden=L.length<=n;
var p=new URLSearchParams();if(c.value)p.set('c',c.value);if(q.value)p.set('q',q.value);if(s.value)p.set('o',s.value);history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''))}
[q,c,s].forEach(function(e){e.addEventListener('input',function(){draw(true)})});more.onclick=function(){n+=36;draw()};
window.__rerender=function(){draw()};draw(true)})}

function product(){load().then(function(d){var id=new URLSearchParams(location.search).get('id'),p=BY[id],m=$('#pd');
if(!p){m.innerHTML='<div><h1 class="h1s">Product not found</h1><p><a class="tl" href="'+ROOT+'shop/">Back to the shop</a></p></div>';return}
document.title=p.n+' | Ironside Fire';var qty=1;
function dh(){var h='',ul=0;p.d.forEach(function(l){if(/^\u2022/.test(l)){if(!ul){h+='<ul>';ul=1}h+='<li>'+esc(l.replace(/^\u2022\s*/,''))+'</li>'}else{if(ul){h+='</ul>';ul=0}h+='<p>'+esc(l)+'</p>'}});if(ul)h+='</ul>';return h}
function draw(){m.innerHTML='<div class="pim"><img src="'+img(p)+'" alt="'+esc(p.n)+'"></div><div><h1 class="h1s">'+esc(p.n)+'</h1><p class="sm">SKU '+esc(p.sku)+'</p><p class="big">'+gbp(px(p.p))+' <small>'+label()+'</small></p><div class="row"><div class="qty"><button type="button" id="qm" aria-label="Less">-</button><span id="qv">'+qty+'</span><button type="button" id="qp" aria-label="More">+</button></div><button class="btn" type="button" id="add">Add to basket</button></div><div class="cert">Need the fire test certificate? <a class="tl" href="mailto:'+window.IF.email+'?subject='+encodeURIComponent('Test certificate: '+p.sku)+'">Ask us</a></div>'+dh()+'</div>';
$('#qm').onclick=function(){qty=Math.max(1,qty-1);$('#qv').textContent=qty};$('#qp').onclick=function(){qty++;$('#qv').textContent=qty};
$('#add').onclick=function(){cart.add(p.id,qty);toast('Added to basket');openBag()}}
window.__rerender=function(){var qv=qty;draw();qty=qv};draw();
var rel=d.items.filter(function(x){return x.c===p.c&&x.id!==p.id}).slice(0,4);if(rel.length){$('#rel-h').hidden=false;$('#rel').innerHTML=rel.map(card).join('')}})}

function checkout(){load().then(function(){var m=$('#ck');
function draw(){var L=lines();if(!L.length){m.innerHTML='<p>Your basket is empty.</p><a class="btn" href="'+ROOT+'shop/">Browse the shop</a>';return}
var t=totals(L),sv={};try{sv=JSON.parse(ls('if_details'))||{}}catch(e){}
function v(k){return esc(sv[k]||'')}
m.innerHTML='<div class="ckg"><form id="cf" class="form" novalidate style="margin-top:0"><label>Name<input name="name" required autocomplete="name" value="'+v('name')+'"></label><label>Company<input name="company" autocomplete="organization" value="'+v('company')+'"></label><label>Email<input name="email" type="email" required autocomplete="email" value="'+v('email')+'"></label><label>Phone<input name="phone" type="tel" required autocomplete="tel" value="'+v('phone')+'"></label><label>Delivery address<textarea name="address" rows="4" required autocomplete="street-address">'+v('address')+'</textarea></label><label>Notes<textarea name="notes" rows="3">'+v('notes')+'</textarea></label><p class="err" id="ce" role="alert"></p><button class="btn" type="submit">Send order</button><p class="sm">We will confirm your order and send payment details. No payment is taken on this page.</p></form><div class="sumbox"><h2 style="font-size:1.3rem">Your order</h2>'+L.map(function(l){return '<div class="sumr"><span>'+l.q+' x '+esc(l.p.n)+'</span><span>'+gbp(px(l.p.p*l.q))+'</span></div>'}).join('')+'<hr><div class="sumr"><span>Subtotal ex VAT</span><span>'+gbp(t.ex)+'</span></div><div class="sumr"><span>Delivery</span><span>Confirmed with order</span></div><div class="sumr"><span>VAT 20%</span><span>'+gbp(t.vat)+'</span></div><div class="sumr t"><span>Total inc VAT</span><span>'+gbp(t.inc)+'</span></div></div></div>';
$('#cf').onsubmit=function(e){e.preventDefault();var f=e.target,o={};new FormData(f).forEach(function(val,k){o[k]=String(val).trim()});
if(!o.name||!o.email||!o.phone||!o.address||o.email.indexOf('@')<1){$('#ce').textContent='Please fill in name, a valid email, phone and delivery address.';return}
ls('if_details',JSON.stringify(o));
var body='New order from the Ironside Fire site\n\n'+L.map(function(l){return l.q+' x '+l.p.n+' ('+l.p.sku+') '+gbp(l.p.p)+' ex VAT each'}).join('\n')+'\n\nSubtotal ex VAT: '+gbp(t.ex)+'\nVAT 20%: '+gbp(t.vat)+'\nTotal inc VAT: '+gbp(t.inc)+'\nDelivery: to be confirmed\n\nName: '+o.name+'\nCompany: '+o.company+'\nEmail: '+o.email+'\nPhone: '+o.phone+'\nDelivery address:\n'+o.address+'\n\nNotes: '+o.notes;
cart.clear();
m.innerHTML='<div class="done"><h2>Order received</h2><p>Thank you, '+esc(o.name)+'. We will confirm your order and send payment details to '+esc(o.email)+'.</p><p class="sm">If your email app did not open, email your basket to <a class="tl" href="mailto:'+window.IF.email+'">'+window.IF.email+'</a>.</p><a class="btn" href="'+ROOT+'shop/">Back to the shop</a></div>';
window.location.href='mailto:'+window.IF.email+'?subject='+encodeURIComponent('Order from Ironside Fire: '+o.name)+'&body='+encodeURIComponent(body)}}
window.__rerender=draw;draw()})}

function trade(){var f=$('#tf');f.onsubmit=function(e){e.preventDefault();var o={};new FormData(f).forEach(function(v,k){o[k]=String(v).trim()});
if(!o.company||!o.name||!o.email||o.email.indexOf('@')<1||!o.phone||!o.type||!o.spend){$('#te').textContent='Please fill in every field except the message.';return}
var body='Trade account application\n\nCompany: '+o.company+'\nContact: '+o.name+'\nEmail: '+o.email+'\nPhone: '+o.phone+'\nTrade type: '+o.type+'\nExpected monthly spend: '+o.spend+'\n\nMessage: '+o.msg;
$('#te').textContent='';f.hidden=true;$('#tdone').hidden=false;
window.location.href='mailto:'+window.IF.email+'?subject='+encodeURIComponent('Trade account application: '+o.company)+'&body='+encodeURIComponent(body)}}

var pg=document.body.className;
$$('[data-vat]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-vat')===vat)});
refresh();
load().then(refresh);
if(pg==='home')home();else if(pg==='shop')shop();else if(pg==='product')product();else if(pg==='checkout')checkout();else if(pg==='trade')trade();
})();
