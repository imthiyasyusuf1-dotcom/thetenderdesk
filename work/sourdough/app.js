/* Rise & Crust demo: basket, menu tabs, allergen filter, hours, scripted assistant. No network calls. */
(() => {
  'use strict';
  document.body.classList.remove('no-js');
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const M = window.MENU || {};
  const gbp = n => '£' + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ---------- hours ---------- */
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const HOURS = {0:[8,12],1:null,2:[7,15],3:[7,15],4:[7,15],5:[7,15],6:[7.5,14]};
  const fmt = h => { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); const ap = hh >= 12 ? 'pm' : 'am'; const h12 = ((hh + 11) % 12) + 1; return h12 + (mm ? ':' + String(mm).padStart(2, '0') : '') + ap; };
  const hoursText = d => HOURS[d] ? fmt(HOURS[d][0]) + ' – ' + fmt(HOURS[d][1]) : 'Closed';
  const now = new Date(), today = now.getDay(), hNow = now.getHours() + now.getMinutes() / 60;
  const order = [2,3,4,5,6,0,1];
  $('#hours').innerHTML = order.map(d => `<li class="${d === today ? 'today' : ''}"><span>${DAYS[d]}</span><span>${hoursText(d)}</span></li>`).join('');
  function nextOpen() { for (let i = 0; i < 8; i++) { const d = (today + i) % 7, h = HOURS[d]; if (!h) continue; if (i === 0 && hNow >= h[0]) continue; return (i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d]) + ' ' + fmt(h[0]); } }
  const openNow = HOURS[today] && hNow >= HOURS[today][0] && hNow < HOURS[today][1];
  const st = $('#status');
  st.classList.toggle('open', !!openNow);
  st.querySelector('span').textContent = openNow ? 'Open now · until ' + fmt(HOURS[today][1]) : 'Closed · opens ' + nextOpen();
  $('#yr').textContent = now.getFullYear();

  /* ---------- nav + reveal ---------- */
  const nav = $('.nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), {passive: true});
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -8% 0px'});
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- menu tabs (WAI-ARIA tabs pattern) ---------- */
  const tabs = $$('[role=tab]');
  function selectTab(t, focus) {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      const k = {ArrowRight: 1, ArrowLeft: -1}[e.key];
      if (k) { e.preventDefault(); selectTab(tabs[(i + k + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });

  /* ---------- allergen filter ---------- */
  const ALL = {G:'Gluten',M:'Milk',E:'Egg',N:'Tree nuts',SE:'Sesame',SO:'Soya'};
  const excluded = new Set();
  $('#filterOpts').innerHTML = Object.entries(ALL).map(([k, v]) => `<label><input type="checkbox" value="${k}">${v}</label>`).join('');
  const fBtn = $('#filterBtn'), fPop = $('#filterPop');
  fBtn.addEventListener('click', e => { e.stopPropagation(); const o = fPop.hidden; fPop.hidden = !o; fBtn.setAttribute('aria-expanded', o); });
  document.addEventListener('click', e => { if (!fPop.hidden && !e.target.closest('.filter')) { fPop.hidden = true; fBtn.setAttribute('aria-expanded', false); } });
  function applyFilter() {
    $$('.dish').forEach(d => { const a = d.dataset.allergens.split(' ').filter(Boolean); d.classList.toggle('hidden-a', a.some(x => excluded.has(x))); });
    const n = $('#filterN'); n.hidden = !excluded.size; n.textContent = excluded.size;
  }
  $('#filterOpts').addEventListener('change', e => { e.target.checked ? excluded.add(e.target.value) : excluded.delete(e.target.value); applyFilter(); });

  /* ---------- basket ---------- */
  let basket = {};
  try { basket = JSON.parse(localStorage.getItem('rc-basket') || '{}'); } catch (_) {}
  Object.keys(basket).forEach(k => { if (!M[k]) delete basket[k]; });
  const save = () => { try { localStorage.setItem('rc-basket', JSON.stringify(basket)); } catch (_) {} };
  const count = () => Object.values(basket).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(basket).reduce((a, [k, q]) => a + M[k].p * q, 0);
  const toastEl = $('#toast'); let tt;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2200); };

  // collection slots: next opening day, 15-min windows
  function slots() {
    const out = []; const start = new Date(); start.setHours(20, 0, 0, 0);
    for (let i = 1; i < 8 && out.length === 0; i++) {
      const d = new Date(); d.setDate(d.getDate() + i); const h = HOURS[d.getDay()]; if (!h) continue;
      const label = i === 1 ? 'Tomorrow' : DAYS[d.getDay()];
      for (let t = h[0]; t < Math.min(h[1], h[0] + 3); t += .25) out.push(`${label} ${fmt(t)}`);
    }
    return out;
  }
  $('#oSlot').innerHTML = slots().map(s => `<option>${s}</option>`).join('');

  function add(id, qty = 1, quiet) {
    if (!M[id]) return;
    basket[id] = (basket[id] || 0) + qty; save(); render();
    const b = $('#count'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    const btn = $(`[data-add="${id}"]`);
    if (btn) { btn.textContent = 'Added ✓'; btn.classList.add('done'); setTimeout(() => { btn.textContent = 'Add'; btn.classList.remove('done'); }, 1400); }
    if (!quiet) toast(`${M[id].n} added · ${count()} in basket`);
  }
  function render() {
    $('#count').textContent = count();
    const lines = $('#lines'), ids = Object.keys(basket).filter(k => basket[k] > 0);
    if (!ids.length) {
      lines.innerHTML = `<div class="empty"><span class="big">Nothing on the shelf yet.</span>Add a loaf or a bun from the menu and it'll show up here.<br><br><a class="btn btn-ghost" href="#menu" data-close>Browse the menu</a></div>`;
    } else {
      lines.innerHTML = ids.map(k => `<div class="line"><div><b>${esc(M[k].n)}</b><small>${gbp(M[k].p)} each${M[k].a.length ? ' · contains ' + M[k].a.join(', ').toLowerCase() : ''}</small></div>
        <div class="qty" role="group" aria-label="Quantity of ${esc(M[k].n)}"><button data-q="${k}" data-d="-1" aria-label="Remove one">−</button><span>${basket[k]}</span><button data-q="${k}" data-d="1" aria-label="Add one">+</button></div><b>${gbp(M[k].p * basket[k])}</b></div>`).join('');
    }
    $('#total').textContent = gbp(total());
    $('#placeBtn').disabled = !ids.length;
    $('#checkout').hidden = false;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'); if (a) add(a.dataset.add);
    const q = e.target.closest('[data-q]');
    if (q) { const k = q.dataset.q; basket[k] += +q.dataset.d; if (basket[k] <= 0) delete basket[k]; save(); render(); }
    if (e.target.closest('[data-open-basket]')) openDrawer(e.target.closest('[data-open-basket]'));
    if (e.target.closest('[data-close]')) closeDrawer();
    const c = e.target.closest('[data-chat]'); if (c) openChat(c.dataset.chat);
  });

  const drawer = $('#drawer'), scrim = $('#scrim'); let lastFocus;
  function openDrawer(from) { lastFocus = from || document.activeElement; render(); drawer.classList.add('on'); scrim.classList.add('on'); drawer.setAttribute('aria-hidden', false); setTimeout(() => $('.x', drawer).focus(), 50); }
  function closeDrawer() { if (!drawer.classList.contains('on')) return; drawer.classList.remove('on'); scrim.classList.remove('on'); drawer.setAttribute('aria-hidden', true); lastFocus && lastFocus.focus && lastFocus.focus(); }
  $('#basketBtn').addEventListener('click', e => openDrawer(e.currentTarget));
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeDrawer(); closeChat(); }
    if (e.key === 'Tab' && drawer.classList.contains('on')) {
      const f = $$('button:not([disabled]),input,select,a[href]', drawer).filter(x => x.offsetParent);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  const ref = () => 'RC-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  function placeOrder(name, slot) {
    const r = ref(), n = count(), t = total(); basket = {}; save(); render();
    return {r, n, t, name, slot};
  }
  $('#placeBtn').addEventListener('click', () => {
    const nameIn = $('#oName'), name = nameIn.value.trim();
    if (!name) { nameIn.focus(); nameIn.style.borderColor = '#b0412e'; toast('Add a name so we can label your bag'); return; }
    nameIn.style.borderColor = '';
    const o = placeOrder(name, $('#oSlot').value);
    $('#lines').innerHTML = `<div class="confirm"><div class="tick" aria-hidden="true">✓</div><h3>See you soon, ${esc(o.name)}.</h3><p>${o.n} item${o.n > 1 ? 's' : ''} · ${gbp(o.t)}, ready for <b>${esc(o.slot)}</b>. Pay when you collect.</p><div class="ref">Ref ${o.r}</div><p class="demo-note">This is a demo: nothing was sent or charged. On a real site this would email the customer and ping the bakery.</p></div>`;
    $('#checkout').hidden = true;
    $('.x', drawer).focus();
  });
  render();

  /* ---------- scripted assistant ---------- */
  const chat = $('#chat'), fab = $('#chatFab'), msgs = $('#msgs'), chips = $('#chips'), input = $('#chatIn');
  let started = false, flow = null;
  const WORDS = {gluten:'Gluten',wheat:'Gluten',milk:'Milk',dairy:'Milk',lactose:'Milk',egg:'Egg',eggs:'Egg',nut:'Tree nuts',nuts:'Tree nuts',almond:'Tree nuts',walnut:'Tree nuts',sesame:'Sesame',soy:'Soya',soya:'Soya',peanut:'Peanuts',peanuts:'Peanuts'};
  function openChat(topic) {
    chat.classList.add('on'); chat.setAttribute('aria-hidden', false); fab.setAttribute('aria-expanded', true);
    if (!started) { started = true; bot(`Hi! I'm <b>Crumb</b>, Rise &amp; Crust's demo assistant. I can answer menu, allergen and opening-hours questions, take a pre-order, or start a cake enquiry.`, ['What\'s vegan?', 'Nut-free options', 'Opening hours', 'Pre-order', 'Cake enquiry']); }
    if (topic === 'cake') { flow = null; setTimeout(() => handle('cake enquiry', true), started ? 300 : 1200); }
    setTimeout(() => input.focus(), 320);
  }
  function closeChat() { if (!chat.classList.contains('on')) return; chat.classList.remove('on'); chat.setAttribute('aria-hidden', true); fab.setAttribute('aria-expanded', false); }
  fab.addEventListener('click', () => chat.classList.contains('on') ? (closeChat(), fab.focus()) : openChat());
  $('#chatX').addEventListener('click', () => { closeChat(); fab.focus(); });
  function push(html, who) { const d = document.createElement('div'); d.className = 'm ' + who; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; }
  function setChips(list) { chips.innerHTML = (list || []).map(c => `<button type="button">${esc(c)}</button>`).join(''); }
  function bot(html, next) {
    const t = document.createElement('div'); t.className = 'm bot typing'; t.innerHTML = '<i></i><i></i><i></i>'; t.setAttribute('aria-label', 'Assistant is typing'); msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight;
    setChips([]);
    setTimeout(() => { t.remove(); push(html, 'bot'); setChips(next); }, 450 + Math.min(900, html.length * 4));
  }
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) send(b.textContent); });
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (v) { send(v); input.value = ''; } });
  function send(t) { push(esc(t), 'me'); handle(t); }

  const list = ids => '<ul>' + ids.map(k => `<li>${esc(M[k].n)} <b>${gbp(M[k].p)}</b></li>`).join('') + '</ul>';
  const findItems = t => Object.keys(M).filter(k => { const n = M[k].n.toLowerCase(); return n.split(/[^a-z]+/).filter(w => w.length > 3 && !['sourdough','slice','with'].includes(w)).some(w => t.includes(w)) || t.includes(n); });
  const MAIN = ['Show the menu', 'Opening hours', 'Pre-order', 'Cake enquiry'];

  function handle(raw, silent) {
    const t = raw.toLowerCase();
    // multi-step flows
    if (flow && /^(cancel|stop|never ?mind|start over)/.test(t)) { flow = null; return bot('No problem, cancelled. Anything else?', MAIN); }
    if (flow && flow.type === 'order') return orderFlow(t, raw);
    if (flow && flow.type === 'cake') return cakeFlow(t, raw);

    if (t === 'open basket') { closeChat(); openDrawer(fab); return; }
    if (t === 'cakes & sweet') return bot('Cakes & sweet:' + list(Object.keys(M).filter(k => M[k].cat === 'sweet')), ['Pre-order', 'Cake enquiry']);
    if (/cake|birthday|wedding|celebrat/.test(t) && !/fudge|slice/.test(t)) { flow = {type: 'cake', step: 'size'}; return bot('Lovely! Celebration cakes need <b>5 days\' notice</b>. What size are you thinking?', ['6″ (serves 8–10) from £38', '8″ (serves 14–16) from £52', 'Two-tier (serves 30) from £120']); }
    if (/pre-?order|order|collect|reserve|put aside/.test(t)) { flow = {type: 'order', items: {}}; return bot('Happy to set a demo pre-order aside. What would you like? e.g. <i>"2 croissants and a country sourdough"</i>.', ['2 croissants and a country sourdough', 'A cinnamon bun', '4 cookies']); }
    if (/hour|open|close|when|time|today|tomorrow|sunday|monday|saturday/.test(t)) {
      const rows = order.map(d => `<li>${DAYS[d]}: ${hoursText(d)}</li>`).join('');
      return bot(`${openNow ? `We're <b>open now</b> until ${fmt(HOURS[today][1])}.` : `We're <b>closed</b> right now; we open ${nextOpen()}.`}<ul>${rows}</ul>Order by 8pm for collection the next morning.`, ['Pre-order', 'Where are you?']);
    }
    if (/where|address|location|park|find you|directions/.test(t)) return bot('We\'re a fictional bakery, so there\'s no real address. On a live site I\'d give the address, parking tips and a Maps link here.', MAIN);
    if (/vegan|plant/.test(t)) { const v = Object.keys(M).filter(k => M[k].t.includes('vg')); return bot('These are vegan:' + list(v) + 'Oat milk is free with any coffee.', ['Pre-order', 'Nut-free options']); }
    if (/gluten|coeliac|celiac|gf\b/.test(t) && /free|without|no |coeliac|celiac|option|gf/.test(t)) return bot(`Our <b>${M.brownie.n}</b> has no gluten ingredients, but it's baked in a kitchen full of flour, so it isn't suitable for coeliacs. Everything else contains gluten.`, ['Nut-free options', 'Pre-order']);
    const items = findItems(t);
    if (items.length && /allerg|contain|safe|free|nut|gluten|dairy|milk|egg|sesame|soy|vegan/.test(t)) return bot(items.map(k => `<b>${esc(M[k].n)}</b>: ${M[k].a.length ? 'contains ' + M[k].a.join(', ').toLowerCase() : 'none of the 14 major allergens'}${M[k].t.includes('vg') ? ' (vegan)' : ''}.`).join('<br>') + '<br><small>Made in a kitchen that handles nuts, sesame and gluten.</small>', ['Nut-free options', 'Pre-order']);
    // "X-free" / "without X"
    const freeM = t.match(/(\w+)[ -]free|without (\w+)|no (\w+)|allergic to (\w+)/);
    if (freeM) {
      const w = (freeM[1] || freeM[2] || freeM[3] || freeM[4]); const al = WORDS[w];
      if (al) { const ok = Object.keys(M).filter(k => !M[k].a.includes(al)); return bot(`Items with no ${al.toLowerCase()} in the recipe:` + list(ok) + `<small>Our kitchen handles all major allergens, so we can't rule out traces. Severe allergy? Please speak to us before ordering.</small>`, ['Pre-order', 'Opening hours']); }
    }
    if (/allerg|contain|ingredient|safe|in it|nut|gluten|dairy|milk|egg|sesame|soy/.test(t)) {
      if (items.length) return bot(items.map(k => `<b>${esc(M[k].n)}</b>: ${M[k].a.length ? 'contains ' + M[k].a.join(', ').toLowerCase() : 'none of the 14 major allergens'}.`).join('<br>') + '<br><small>Made in a kitchen that handles nuts, sesame and gluten.</small>', ['Nut-free options', 'Pre-order']);
      const al = Object.keys(WORDS).find(w => new RegExp('\\b' + w + '\\b').test(t));
      if (al) { const has = Object.keys(M).filter(k => M[k].a.includes(WORDS[al])); return bot(`Items containing ${WORDS[al].toLowerCase()}:` + (has.length ? list(has) : ' none.') + `Want the ${WORDS[al].toLowerCase()}-free list instead?`, [`${WORDS[al]}-free options`.replace('Tree nuts', 'Nut')]); }
      return bot('Every item on the menu shows its allergens, and there\'s a filter at the top of the menu. Which item or allergen should I check?', ['Is the almond croissant nut-free?', 'Nut-free options', 'Dairy-free options']);
    }
    if (/price|how much|cost|£/.test(t) && items.length) return bot(items.map(k => `<b>${esc(M[k].n)}</b> is ${gbp(M[k].p)}.`).join('<br>'), ['Pre-order']);
    if (/menu|what do you (have|sell)|food|bake|bread|pastr|coffee|drink/.test(t)) {
      const cats = {bread: 'Breads', pastry: 'Pastry', sweet: 'Cakes & sweet', coffee: 'Coffee & drinks'};
      const pick = Object.keys(cats).find(c => t.includes(c.slice(0, 5))) || (/drink/.test(t) ? 'coffee' : null);
      if (pick) return bot(cats[pick] + ':' + list(Object.keys(M).filter(k => M[k].cat === pick)), ['Pre-order', 'Show the menu']);
      return bot('Today we have ' + Object.values(cats).join(', ').toLowerCase() + '. Most loved: the <b>cinnamon bun</b> (£3.50). Which section?', ['Breads', 'Pastry', 'Cakes & sweet', 'Coffee & drinks']);
    }
    if (items.length) return bot(items.map(k => `<b>${esc(M[k].n)}</b>, ${gbp(M[k].p)}. ${M[k].a.length ? 'Contains ' + M[k].a.join(', ').toLowerCase() + '.' : 'No major allergens.'}`).join('<br>'), ['Pre-order', 'Opening hours']);
    if (/^(hi|hello|hey|yo|morning|hiya)\b/.test(t)) return bot('Hello! What can I help with?', MAIN);
    if (/thank|cheers|ta\b/.test(t)) return bot('Any time. Enjoy the bread! 🍞', MAIN);
    if (/human|person|phone|call|email|contact/.test(t)) return bot('This is a demo, so there\'s nobody to hand over to. On a live site I\'d pass your message to the team and they\'d reply by email.', MAIN);
    return bot('I\'m a scripted demo, so I only know this bakery\'s menu, allergens, hours, pre-orders and cakes. Try one of these:', MAIN);
  }

  function parseItems(t) {
    const found = {}; const nums = {a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 6, dozen: 12};
    t.split(/,| and |\+|&/).forEach(part => {
      const ids = findItems(part); if (!ids.length) return;
      const m = part.match(/(\d+|a|an|one|two|three|four|five|six|dozen)\b/); const q = m ? (+m[1] || nums[m[1]] || 1) : 1;
      found[ids[0]] = (found[ids[0]] || 0) + Math.min(q, 24);
    });
    return found;
  }
  function orderFlow(t, raw) {
    if (!flow.step) {
      const it = parseItems(t);
      if (!Object.keys(it).length) return bot('I couldn\'t match that to the menu. Try something like <i>"2 croissants and a cinnamon bun"</i>, or say <i>cancel</i>.', ['A cinnamon bun', 'Show the menu']);
      flow.items = it; flow.step = 'confirm';
      const sum = Object.entries(it).map(([k, q]) => `<li>${q} × ${esc(M[k].n)} <b>${gbp(M[k].p * q)}</b></li>`).join('');
      const tot = Object.entries(it).reduce((a, [k, q]) => a + M[k].p * q, 0);
      return bot(`Got it:<ul>${sum}</ul>Total <b>${gbp(tot)}</b>. Shall I add these to your basket?`, ['Yes, add them', 'Change it', 'Cancel']);
    }
    if (flow.step === 'confirm') {
      if (/^(y|yes|yep|sure|ok|add|please)/.test(t)) { Object.entries(flow.items).forEach(([k, q]) => add(k, q, true)); flow = null; toast('Added from chat'); return bot('Done, they\'re in your basket. Open it to pick a collection slot and place the demo order.', ['Open basket', 'Opening hours']); }
      if (/change|no|edit/.test(t)) { flow.step = null; return bot('Sure, what would you like instead?'); }
    }
    return bot('Say <i>yes</i> to add these to your basket, or <i>cancel</i>.', ['Yes, add them', 'Cancel']);
  }
  function cakeFlow(t, raw) {
    const f = flow;
    if (f.step === 'size') { f.size = raw.replace(/ from.*$/, ''); f.step = 'flavour'; return bot('Great. Which flavour?', ['Triple chocolate', 'Blueberry & vanilla', 'Lemon & elderflower', 'Vegan carrot']); }
    if (f.step === 'flavour') { f.flavour = raw; f.step = 'date'; return bot('And what date do you need it? (We need 5 days\' notice.)', ['Next Saturday', 'In two weeks']); }
    if (f.step === 'date') { f.date = raw; f.step = 'name'; return bot('Last thing: what name should the enquiry go under?'); }
    if (f.step === 'name') {
      f.name = raw.slice(0, 40); flow = null; const r = ref();
      return bot(`Thanks, ${esc(f.name)}! Here's your demo cake enquiry:<ul><li>${esc(f.size)}</li><li>${esc(f.flavour)}</li><li>For: ${esc(f.date)}</li></ul>Ref <b>${r}</b>. On a real site this lands in the bakery's inbox with a quote to follow. (Demo: nothing was sent.)`, MAIN);
    }
  }
})();
