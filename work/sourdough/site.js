(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const M = window.MENU || {};
const gbp = n => '£' + n.toFixed(2);
const HOURS = {0:[8,12],1:null,2:[7,15],3:[7,15],4:[7,15],5:[7,15],6:[7.5,14]};
const fmtH = h => `${Math.floor(h)}:${String(Math.round((h%1)*60)).padStart(2,'0')}`;

/* header + mobile nav */
const hdr = $('#hdr'), burger = $('#burger');
const onScroll = () => hdr.classList.toggle('scrolled', scrollY > 10);
addEventListener('scroll', onScroll, {passive:true}); onScroll();
const setNav = o => { hdr.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
burger.onclick = () => setNav(!hdr.classList.contains('open'));
$$('#mnav a').forEach(a => a.onclick = () => setNav(false));

/* open status + hours */
function status(){
  const d = new Date(), day = d.getDay(), h = d.getHours() + d.getMinutes()/60, t = HOURS[day];
  const open = t && h >= t[0] && h < t[1];
  $('#openDot').classList.toggle('off', !open);
  if (open) $('#openTxt').textContent = `Open now · until ${fmtH(t[1])}`;
  else {
    let nd = day, k = 0, soon = t && h < t[0];
    if (!soon) do { nd = (nd+1)%7; k++; } while (!HOURS[nd]);
    const when = soon ? 'today' : k === 1 ? 'tomorrow' : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][nd];
    $('#openTxt').textContent = `Closed · opens ${when} ${fmtH(HOURS[nd][0])}`;
  }
  $$('#hours li').forEach(li => li.classList.toggle('today', +li.dataset.d === day));
}
status(); setInterval(status, 60000);

/* oven timeline */
function oven(){
  const d = new Date(), h = d.getHours() + d.getMinutes()/60, t = HOURS[d.getDay()];
  const lis = $$('#tl li'); let last = -1;
  const open = t && h >= t[0] && h < t[1];
  lis.forEach((li, i) => { const [a,b] = li.dataset.t.split(':').map(Number); if (open && h >= a + b/60) last = i; });
  lis.forEach((li, i) => { li.classList.toggle('done', i < last); li.classList.toggle('now', i === last); });
  const fill = $('#tlFill');
  if (last >= 0) { const li = lis[last]; fill.style.height = (li.offsetTop + 18 - 10) + 'px'; } else fill.style.height = 0;
  const nxt = open ? lis[last+1] : null;
  if (!open) { $('#ovenLede').textContent = "The ovens are cold right now. Here's how a normal day goes, so you know when to turn up."; }
  if (nxt) { $('#heroNext').textContent = nxt.querySelector('time').textContent; $('#heroNextName').textContent = 'Next out of the oven'; $('#heroNextSub').textContent = nxt.querySelector('strong').textContent.replace(/&amp;/g,'&'); }
  else if (open) { $('#heroNext').textContent = 'Now'; $('#heroNextName').textContent = 'Last bake is out'; $('#heroNextSub').textContent = 'Grab it before close'; }
}
oven(); setInterval(oven, 60000); addEventListener('resize', oven);

/* cut-off countdown (8pm) */
function cut(){
  const n = new Date(), c = new Date(n); c.setHours(20,0,0,0);
  if (n >= c) c.setDate(c.getDate()+1);
  const s = Math.floor((c - n)/1000);
  $('#cutClock').textContent = [s/3600, s%3600/60, s%60].map(v => String(Math.floor(v)).padStart(2,'0')).join(':');
  const tom = new Date(c); tom.setDate(c.getDate()+1);
  const day = tom.toLocaleDateString('en-GB',{weekday:'long'});
  $('#cutK').textContent = `Order window for ${day}`;
  $('#cutSub').textContent = HOURS[tom.getDay()] ? `Left to order for ${day} collection from ${fmtH(HOURS[tom.getDay()][0])}.` : `We're closed ${day}; orders roll to the next opening.`;
}
cut(); setInterval(cut, 1000);

/* menu */
const tags = {vg:'Vegan', v:'Veg', gf:'GF', pop:'Popular'};
$('#mlist').innerHTML = Object.entries(M).map(([k, m]) => `
  <div class="mi" data-k="${k}" data-cat="${m.cat}">
    <h3>${m.n}${m.t.map(t => `<span class="badge ${t==='pop'?'pop':''}">${tags[t]}</span>`).join('')}</h3>
    <span class="pr">${gbp(m.p)}</span>
    <span class="al">${m.a.length ? 'Contains <b>' + m.a.join(', ') + '</b>' : 'No major allergens'}</span>
    <button class="add" data-add="${k}" aria-label="Add ${m.n}">+ Add</button>
  </div>`).join('');
let cat = 'all';
function filt(){
  const f = $$('#filters input:checked').map(i => i.value); let shown = 0;
  $$('.mi').forEach(el => {
    const m = M[el.dataset.k];
    let ok = (cat === 'all' || m.cat === cat)
      && (!f.includes('vg') || m.t.includes('vg'))
      && (!f.includes('gf') || !m.a.includes('Gluten'))
      && (!f.includes('nonut') || !m.a.includes('Tree nuts'))
      && (!f.includes('nomilk') || !m.a.includes('Milk'));
    el.classList.toggle('hide', !ok); shown += ok;
  });
  $('#mempty').style.display = shown ? 'none' : 'block';
}
$$('.tab').forEach(b => b.onclick = () => {
  const go = () => { $$('.tab').forEach(x => x.setAttribute('aria-selected', x === b)); cat = b.dataset.cat; filt(); };
  document.startViewTransition ? document.startViewTransition(go) : go();
});
$('#filters').onchange = filt;

/* basket */
let bag = {}; try { bag = JSON.parse(localStorage.rcBag || '{}'); } catch(e) {}
const save = () => { try { localStorage.rcBag = JSON.stringify(bag); } catch(e) {} };
const count = () => Object.values(bag).reduce((a,b) => a+b, 0);
const sum = () => Object.entries(bag).reduce((a,[k,q]) => a + (M[k]?.p||0)*q, 0);
function slots(){
  const n = new Date(), d = new Date(n); if (n.getHours() >= 20) d.setDate(d.getDate()+1); d.setDate(d.getDate()+1);
  while (!HOURS[d.getDay()]) d.setDate(d.getDate()+1);
  const [a,b] = HOURS[d.getDay()], lab = d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
  let o = ''; for (let t = a; t < b - .25; t += .25) o += `<option>${lab} · ${fmtH(t)} to ${fmtH(t+.25)}</option>`;
  $('#oSlot').innerHTML = o;
}
slots();
function render(){
  const n = count();
  $('#bagN').textContent = n;
  $('#total').textContent = gbp(sum());
  $('#place').disabled = !n;
  $('#dbody').innerHTML = n ? Object.entries(bag).filter(([k]) => M[k]).map(([k,q]) => `
    <div class="li"><b>${M[k].n}</b><span class="pp">${gbp(M[k].p*q)}</span>
    <span style="font-size:13px;color:var(--mute)">${gbp(M[k].p)} each</span>
    <span class="qty"><button data-q="${k}" data-d="-1" aria-label="One fewer ${M[k].n}">−</button><span>${q}</span><button data-q="${k}" data-d="1" aria-label="One more ${M[k].n}">+</button></span></div>`).join('')
    : `<div class="dempty"><p>Your bag's empty.</p>Add a loaf or two from the menu.</div>`;
  $('#mbT').textContent = n ? `${n} item${n>1?'s':''} · ${gbp(sum())}` : 'Skip the queue';
  $('#mbS').textContent = n ? 'Ready to collect from 7am' : 'Order by 8pm, collect from 7am';
  const mb = $('#mbBtn'); mb.textContent = n ? 'View bag' : 'Order now'; mb.onclick = n ? e => { e.preventDefault(); openBag(true); } : null;
}
function add(k, btn){
  bag[k] = (bag[k]||0) + 1; save(); render();
  const b = $('#bagBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  if (btn) { const t = btn.textContent; btn.classList.add('done'); btn.textContent = '✓ Added'; setTimeout(() => { btn.classList.remove('done'); btn.textContent = t; }, 1300); }
  toast(`${M[k].n} added`);
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-add]'); if (a) return add(a.dataset.add, a);
  const q = e.target.closest('[data-q]');
  if (q) { const k = q.dataset.q; bag[k] += +q.dataset.d; if (bag[k] <= 0) delete bag[k]; save(); render(); }
  const t = e.target.closest('[data-toast]'); if (t) { e.preventDefault(); toast(t.dataset.toast); }
});
function openBag(o){
  document.body.classList.toggle('bag-open', o); $('#drawer').setAttribute('aria-hidden', !o);
  if (o) { setNav(false); setTimeout(() => $('#closeBag').focus(), 300); }
}
$('#bagBtn').onclick = () => openBag(true);
$('#closeBag').onclick = $('#scrim').onclick = () => openBag(false);
addEventListener('keydown', e => { if (e.key === 'Escape') { openBag(false); setNav(false); } });
$('#place').onclick = () => {
  const name = $('#oName').value.trim() || 'friend', slot = $('#oSlot').value;
  const ref = 'RC-' + Math.random().toString(36).slice(2,6).toUpperCase();
  $('#dbody').innerHTML = `<div class="ok"><div class="tick">✓</div><h3>See you soon, ${name.replace(/[<>&]/g,'')}.</h3><p>Your bag will be on the collection shelf for <b>${slot}</b>.</p><div class="ref">${ref}</div><p class="note" style="margin-top:14px">Demo only: nothing was sent or charged.</p></div>`;
  bag = {}; save(); $('#bagN').textContent = 0; $('#dfoot').style.display = 'none';
  setTimeout(() => { $('#dfoot').style.display = ''; }, 100000);
  $('#closeBag').addEventListener('click', () => { $('#dfoot').style.display = ''; render(); }, {once:true});
};
render();

/* toast */
let tt; function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800); }

/* mobile bar: show after hero, hide near footer or when bag open */
const mbar = $('#mbar');
const mb = () => { const y = scrollY, f = document.querySelector('footer.f').offsetTop; mbar.classList.toggle('show', y > innerHeight*.7 && y + innerHeight < f + 80); };
addEventListener('scroll', mb, {passive:true}); mb();

/* reveals */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px'});
$$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });

/* signature: soft 3D tilt on the hero loaf (pointer devices only, rAF, transform only) */
const tilt = $('#tilt');
if (tilt && matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches) {
  let raf; tilt.parentElement.addEventListener('pointermove', e => { const r = tilt.getBoundingClientRect(), x = (e.clientX - r.left)/r.width - .5, y = (e.clientY - r.top)/r.height - .5;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(() => tilt.style.transform = `rotateY(${x*8}deg) rotateX(${-y*8}deg)`); });
  tilt.parentElement.addEventListener('pointerleave', () => tilt.style.transform = '');
}
})();
