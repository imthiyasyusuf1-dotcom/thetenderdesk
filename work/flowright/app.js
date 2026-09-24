(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // Mobile menu
  const burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', () => {
    const o = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', o); menu.classList.toggle('open', o);
    burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

  // ETA ticker (cosmetic)
  const eta = $('#eta');
  setInterval(() => { eta.textContent = 45 + Math.floor(Math.random() * 14); }, 8000);

  // Pricing tabs (keyboard accessible)
  const tabs = $$('[role=tab]');
  const pick = t => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.dataset.tab).hidden = !on; });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; pick(n); n.focus(); }
    });
  });

  // Postcode checker
  const AREAS = {GU9:'Farnham',GU10:'Farnham',GU11:'Aldershot',GU12:'Aldershot & Ash',GU14:'Farnborough',GU15:'Camberley',GU16:'Frimley & Camberley',GU46:'Yateley',GU51:'Fleet',GU52:'Fleet & Church Crookham',RG27:'Hook'};
  const outward = v => (v || '').toUpperCase().replace(/\s+/g, '').replace(/\d[A-Z]{2}$/, '').match(/^[A-Z]{1,2}\d{1,2}[A-Z]?/)?.[0] || '';
  const checkPc = v => { const o = outward(v); return {o, town: AREAS[o]}; };
  $('#pcForm').addEventListener('submit', e => {
    e.preventDefault();
    const out = $('#pcOut'), {o, town} = checkPc($('#pc').value);
    if (!o) { out.className = 'pc-out no'; out.textContent = 'Please enter a UK postcode, e.g. GU11 1AA.'; return; }
    if (town) { out.className = 'pc-out ok'; out.textContent = `✓ Yes, we cover ${o} (${town}). Typical emergency arrival: under 60 min.`; }
    else { out.className = 'pc-out no'; out.textContent = `${o} is outside our core area, but call us: we often travel for planned work.`; }
  });

  // Service "Book now" preselects job
  $$('[data-job]').forEach(a => a.addEventListener('click', () => { $('#qj').value = a.dataset.job; }));

  // Quote form validation
  $('#qform').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, msg = $('#qmsg'); let bad = null;
    $$('[required]', f).forEach(el => {
      const ok = el.value.trim() && (el.id !== 'qp' || outward(el.value));
      el.closest('.field').classList.toggle('err', !ok);
      el.setAttribute('aria-invalid', !ok);
      if (!ok && !bad) bad = el;
    });
    if (bad) { msg.className = 'form-msg no'; msg.textContent = 'Please fill in the highlighted fields.'; bad.focus(); return; }
    msg.className = 'form-msg ok';
    msg.textContent = `Thanks ${f.name.value.trim().split(' ')[0]}! (Demo) A real site would text you a fixed price within 30 minutes.`;
    f.reset();
  });

  // ---------- Demo assistant ----------
  const chat = $('#chat'), fab = $('#chatFab'), log = $('#chatLog'), chips = $('#chatChips'), input = $('#chatInput'), file = $('#chatFile');
  let state = 'idle', lead = {}, started = false;

  const scroll = () => { log.scrollTop = log.scrollHeight; };
  const add = (html, who = 'bot', cls = '') => { const d = document.createElement('div'); d.className = `msg ${who} ${cls}`; d.innerHTML = html; log.appendChild(d); scroll(); return d; };
  const setChips = list => { chips.innerHTML = ''; (list || []).forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (c.em ? ' em' : ''); b.textContent = c.t; b.onclick = () => handle(c.v || c.t, c.t); chips.appendChild(b); }); };
  const bot = (html, opts = {}) => new Promise(res => {
    const t = add('<span class="typing"><i></i><i></i><i></i></span>'); t.classList.add('bot');
    setTimeout(() => { t.innerHTML = html; if (opts.cls) t.classList.add(opts.cls); setChips(opts.chips); scroll(); res(); }, opts.delay ?? 650);
  });

  const MAIN = [{t:'🚨 I have an emergency', v:'emergency', em:true},{t:'Get a quote', v:'quote'},{t:'Prices', v:'prices'},{t:'Areas you cover', v:'areas'},{t:'Opening hours', v:'hours'}];
  const JOBS = ['Leak / burst pipe','Boiler / heating','Blocked drain','Bathroom','Other'];

  const FAQ = [
    {k:/price|cost|how much|charge|£/, a:'Typical fixed prices: tap repair from <b>£79</b>, unblocking from <b>£99</b>, boiler service from <b>£89</b>, new combi fitted from <b>£2,195</b>. No call-out fee weekdays 8am–6pm. (Demo prices.)'},
    {k:/area|cover|postcode|where|town/, a:'We cover Aldershot, Farnborough, Farnham, Fleet, Camberley, Ash, Frimley, Yateley and Hook. Type your postcode and I\'ll check it.'},
    {k:/hour|open|when|weekend|night|sunday/, a:'The office is open Mon–Sat 8am–6pm, and emergency engineers are on call <b>24/7, 365 days</b>.'},
    {k:/guarantee|warrant/, a:'Every job has a <b>12-month guarantee</b> on parts and labour. New boilers also carry the manufacturer warranty.'},
    {k:/pay|card|finance/, a:'Card, bank transfer or Apple/Google Pay on completion. Finance is available on new boilers.'},
    {k:/gas|qualif|insur|registered|accredit/, a:'All gas work is done by registered gas engineers, and we carry £5m public liability insurance. (Placeholder details on this demo.)'},
    {k:/service|annual/, a:'An annual boiler service is from <b>£89</b> and takes about 45 minutes. Want me to book one in?', chips:[{t:'Yes, book a service', v:'quote:Boiler / heating'},{t:'Not now', v:'menu'}]},
    {k:/human|person|call|phone|speak/, a:'You can call the team on <b>01632 960000</b> (fictional number on this demo). Or I can take your details and have someone call you back.', chips:[{t:'Request a call back', v:'quote'},{t:'Back to menu', v:'menu'}]},
  ];
  const EMERG = /emergenc|burst|flood|leak|pouring|gas smell|smell gas|no water|urgent|water everywhere|ceiling/;

  async function emergency() {
    state = 'em-q';
    await bot('I\'m sorry, let\'s get this sorted fast. Which best describes it?', {cls:'alert', chips:[{t:'💧 Water leaking now', v:'em:leak', em:true},{t:'🔥 I can smell gas', v:'em:gas', em:true},{t:'🥶 No heating / hot water', v:'em:boiler'},{t:'🚽 Toilet / drain overflowing', v:'em:drain'}]});
  }
  async function emergencyType(t) {
    if (t === 'gas') {
      await bot('<b>Gas smell: act now.</b><ol><li>Don\'t use switches, flames or phones inside.</li><li>Open doors and windows.</li><li>Turn off the gas at the meter if safe.</li><li>Leave the property and call the <b>National Gas Emergency line on 0800 111 999</b>.</li></ol>Once it\'s made safe, we can repair the appliance.', {cls:'alert', chips:[{t:'Book a repair', v:'quote:Boiler / heating'},{t:'Back to menu', v:'menu'}]});
      return;
    }
    const tips = {
      leak:'<b>While we get an engineer to you:</b><ol><li>Turn off the stopcock (usually under the kitchen sink).</li><li>Switch off electrics near the water.</li><li>Open cold taps to drain the pipes.</li><li>Put towels or a bucket under the leak.</li></ol>',
      boiler:'<b>Quick checks first:</b><ol><li>Is the pressure gauge below 1 bar?</li><li>Any fault code on the display?</li><li>Try one reset. If it locks out again, don\'t keep resetting.</li></ol>',
      drain:'<b>Right now:</b><ol><li>Stop using taps, toilets and appliances on that drain.</li><li>Don\'t use chemical unblockers, they can harm the engineer and pipes.</li></ol>'
    }[t];
    lead.job = {leak:'Emergency leak', boiler:'Boiler / heating (urgent)', drain:'Blocked drain (urgent)'}[t];
    lead.urgent = true;
    await bot(tips, {cls:'alert', delay:800});
    await bot('I can flag this as <b>priority</b> for the on-call engineer. What\'s your first name?', {delay:700});
    state = 'name';
  }
  async function startQuote(job) {
    lead = {job: job || null};
    state = 'name';
    await bot('Great, I\'ll get you a fixed-price quote. What\'s your first name?');
  }

  async function handle(raw, label) {
    const v = String(raw).trim(); if (!v) return;
    add(esc(label || v), 'me'); setChips([]);
    const lc = v.toLowerCase();

    if (lc === 'menu') { state = 'idle'; return bot('What else can I help with?', {chips: MAIN}); }
    if (lc === 'emergency') return emergency();
    if (lc.startsWith('em:')) return emergencyType(lc.slice(3));
    if (lc === 'quote') return startQuote();
    if (lc.startsWith('quote:')) return startQuote(v.slice(6));
    if (lc === 'restart') { lead = {}; return startQuote(); }

    switch (state) {
      case 'name': {
        lead.name = v.replace(/[^\p{L}\s'-]/gu, '').trim().split(/\s+/)[0] || v;
        state = 'postcode';
        return bot(`Thanks ${esc(lead.name)}. What's your postcode?`);
      }
      case 'postcode': {
        const {o, town} = checkPc(v);
        if (!o) return bot('That doesn\'t look like a UK postcode. Try something like <b>GU11 1AA</b>.');
        lead.postcode = v.toUpperCase(); lead.town = town;
        if (!town) await bot(`${esc(o)} is just outside our core area, but I'll pass it on: we often travel for planned jobs.`, {delay:500});
        else await bot(`✓ ${esc(o)} (${town}) is in our area.`, {delay:450});
        if (lead.job) { state = 'photo'; return askPhoto(); }
        state = 'job';
        return bot('What kind of job is it?', {chips: JOBS.map(j => ({t:j, v:j}))});
      }
      case 'job': { lead.job = v; state = 'photo'; return askPhoto(); }
      case 'photo': {
        if (/skip|no/.test(lc)) { lead.photo = false; return confirm(); }
        return bot('Tap <b>📷 Upload photo</b> below or choose skip.', {chips: photoChips()});
      }
      case 'done': case 'idle': default: return answer(lc, v);
    }
  }

  const photoChips = () => [{t:'📷 Upload photo', v:'__photo'},{t:'Skip', v:'skip'}];
  async function askPhoto() {
    await bot('A photo helps us quote accurately (and bring the right parts). Want to add one?', {chips: photoChips()});
  }
  async function confirm() {
    state = 'done';
    const ref = 'FR-' + Math.floor(1000 + Math.random() * 9000);
    await bot(`All done${lead.urgent ? ' and flagged as <b>PRIORITY</b>' : ''}. Here's what I've sent to the team:<div class="summary"><b>Ref ${ref}</b><br>Name: ${esc(lead.name)}<br>Postcode: ${esc(lead.postcode)}${lead.town ? ' (' + lead.town + ')' : ''}<br>Job: ${esc(lead.job)}<br>Photo: ${lead.photo ? 'attached ✓' : 'none'}</div>${lead.urgent ? 'An engineer would call you within <b>10 minutes</b>.' : 'You\'d get a fixed price by text within <b>30 minutes</b>.'}<br><br><i>Demo only: nothing was sent. This is the AI automation add-on from The Tender Desk.</i>`, {delay:900, chips:[{t:'Start again', v:'restart'},{t:'Back to menu', v:'menu'}]});
  }

  async function answer(lc, v) {
    if (EMERG.test(lc)) return emergency();
    if (/quote|book|price for|estimate|come out|fix my/.test(lc) && !/how much/.test(lc)) return startQuote();
    const m = v.toUpperCase().match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b|\b(GU|RG)\d{1,2}\b/);
    const pc = m ? checkPc(m[0]) : {};
    if (pc.o) return bot(pc.town ? `✓ Yes, we cover ${esc(pc.o)} (${pc.town}).` : `${esc(pc.o)} is outside our core area, but we often travel for planned work.`, {chips: MAIN});
    const hit = FAQ.find(f => f.k.test(lc));
    if (hit) return bot(hit.a, {chips: hit.chips || MAIN});
    if (/^(hi|hello|hey|hiya)\b/.test(lc)) return bot('Hi! How can I help today?', {chips: MAIN});
    if (/thank|cheers/.test(lc)) return bot('You\'re welcome! Anything else?', {chips: MAIN});
    return bot('I\'m a demo assistant, so I know about prices, areas, hours, emergencies and quotes. Pick an option or rephrase:', {chips: MAIN});
  }

  // Photo upload mock
  chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b && b.textContent.startsWith('📷')) { e.stopImmediatePropagation(); file.click(); } }, true);
  file.addEventListener('change', async () => {
    const f = file.files[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    add(`<img src="${url}" alt="Uploaded photo of the problem"><br><small>${esc(f.name)}</small>`, 'me');
    setChips([]); lead.photo = true; file.value = '';
    await bot('📷 Got it. Photo attached (in a live build, AI would also flag visible issues, e.g. "corroded compression fitting").', {delay:900});
    confirm();
  });

  // Open/close
  const open = () => {
    chat.hidden = false; fab.hidden = true; fab.setAttribute('aria-expanded', 'true');
    if (!started) { started = true; bot('Hi 👋 I\'m FlowRight\'s assistant (<b>demo</b>). I can answer questions, help in an emergency or get you a quote in under a minute.', {chips: MAIN, delay:400}); }
    setTimeout(() => input.focus(), 50);
  };
  const close = () => { chat.hidden = true; fab.hidden = false; fab.setAttribute('aria-expanded', 'false'); fab.focus(); };
  $$('[data-open-chat]').forEach(b => b.addEventListener('click', open));
  $('#chatX').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !chat.hidden) close(); });
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; handle(v); });

  window.__flowright = {open, handle, state: () => state, lead: () => lead};
})();
