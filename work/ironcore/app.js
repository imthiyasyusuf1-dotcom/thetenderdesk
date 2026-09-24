(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  const burger = $('#burger'), links = $('#navlinks');
  const setMenu = open => { burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); links.classList.toggle('open', open); };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  /* ---------- live status ---------- */
  const now = new Date(), h = now.getHours(), wd = now.getDay();
  const staffed = (wd >= 1 && wd <= 5) ? (h >= 6 && h < 22) : (h >= 8 && h < 18);
  $('#livetext').textContent = staffed ? 'Open now · Coaches on the floor' : 'Open now 24/7 · Coaches back ' + ((wd >= 1 && wd <= 5) || (wd === 0 && h >= 18) ? '6am' : '8am');

  /* ---------- reveal + counters ---------- */
  const countUp = el => {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en-GB'); if (p < 1) requestAnimationFrame(step); };
    reduce ? (el.textContent = end.toLocaleString('en-GB')) : requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('in'));
  $$('[data-count]').forEach(countUp);

  /* ---------- billing toggle ---------- */
  $$('.toggle button').forEach(b => b.addEventListener('click', () => {
    const annual = b.dataset.bill === 'annual';
    $$('.toggle button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    $$('.price [data-m]').forEach(p => { const v = annual ? p.dataset.a : p.dataset.m; p.textContent = v.replace(/\.00$/, ''); });
  }));
  $$('[data-plan]').forEach(a => a.addEventListener('click', () => { $('#tf-plan').value = a.dataset.plan; }));

  /* ---------- timetable ---------- */
  const CATS = { Strength: '#c8ff2e', Conditioning: '#ff5a1f', HYROX: '#41c7ff', Mobility: '#c79bff', Lifting: '#ffd23f' };
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const C = (t, n, cat, coach, mins, cap, booked) => ({ t, n, cat, coach, mins, cap, booked });
  const weekday = [
    [C('06:15', 'Engine Room', 'Conditioning', 'Jade', 45, 16, 11), C('07:00', 'Barbell Basics', 'Strength', 'Marcus', 60, 10, 6), C('12:15', 'Lunch Lift', 'Strength', 'Dev', 45, 12, 7), C('17:30', 'HYROX Stations', 'HYROX', 'Jade', 60, 16, 16), C('18:30', 'Powerbuilding', 'Strength', 'Marcus', 60, 12, 9), C('19:45', 'Mobility Flow', 'Mobility', 'Sophie', 45, 14, 5)],
    [C('06:15', 'Snatch & Clean', 'Lifting', 'Sophie', 60, 8, 5), C('07:15', 'Metcon 30', 'Conditioning', 'Jade', 30, 16, 10), C('12:15', 'Core & Carry', 'Strength', 'Dev', 45, 12, 4), C('17:30', 'Squat Club', 'Strength', 'Marcus', 60, 10, 10), C('18:45', 'Engine Room', 'Conditioning', 'Jade', 45, 16, 14), C('20:00', 'Stretch & Reset', 'Mobility', 'Sophie', 30, 14, 3)],
    [C('06:15', 'HYROX Run Club', 'HYROX', 'Jade', 50, 20, 12), C('07:00', 'Barbell Basics', 'Strength', 'Marcus', 60, 10, 8), C('12:15', 'Metcon 30', 'Conditioning', 'Dev', 30, 16, 9), C('17:30', 'Clean & Jerk', 'Lifting', 'Sophie', 60, 8, 8), C('18:30', 'Powerbuilding', 'Strength', 'Marcus', 60, 12, 7), C('19:45', 'Mobility Flow', 'Mobility', 'Sophie', 45, 14, 6)],
    [C('06:15', 'Engine Room', 'Conditioning', 'Jade', 45, 16, 13), C('07:15', 'Deadlift Club', 'Strength', 'Marcus', 60, 10, 7), C('12:15', 'Lunch Lift', 'Strength', 'Dev', 45, 12, 5), C('17:30', 'HYROX Simulation', 'HYROX', 'Jade', 75, 16, 15), C('18:45', 'Snatch & Clean', 'Lifting', 'Sophie', 60, 8, 4), C('20:00', 'Stretch & Reset', 'Mobility', 'Sophie', 30, 14, 2)],
    [C('06:15', 'Metcon 30', 'Conditioning', 'Jade', 30, 16, 12), C('07:00', 'Bench Club', 'Strength', 'Marcus', 60, 10, 9), C('12:15', 'Core & Carry', 'Strength', 'Dev', 45, 12, 6), C('17:00', 'Friday Finisher', 'Conditioning', 'Jade', 45, 20, 18), C('18:00', 'Open Platform', 'Lifting', 'Sophie', 90, 10, 3)]
  ];
  const TT = [...weekday,
    [C('08:30', 'Team WOD', 'Conditioning', 'Jade', 60, 24, 22), C('09:45', 'Saturday Strength', 'Strength', 'Marcus', 75, 14, 10), C('10:00', 'Lifting Clinic', 'Lifting', 'Sophie', 90, 8, 6), C('11:30', 'Mobility Flow', 'Mobility', 'Sophie', 45, 14, 4)],
    [C('09:00', 'HYROX Long Run', 'HYROX', 'Jade', 75, 20, 9), C('10:30', 'Beginners Barbell', 'Strength', 'Dev', 60, 10, 5), C('16:00', 'Sunday Reset', 'Mobility', 'Sophie', 45, 14, 7)]
  ];
  let day = (new Date().getDay() + 6) % 7, cat = 'All';
  const daysEl = $('#days'), catsEl = $('#cats'), listEl = $('#ttlist');
  const dateFor = i => { const d = new Date(); d.setDate(d.getDate() + ((i - (d.getDay() + 6) % 7) + 7) % 7); return d; };
  daysEl.innerHTML = DAYS.map((d, i) => `<button role="tab" id="tab-${i}" aria-selected="${i === day}" tabindex="${i === day ? 0 : -1}" data-day="${i}">${d}<small>${dateFor(i).getDate()}</small></button>`).join('');
  catsEl.innerHTML = ['All', ...Object.keys(CATS)].map(c => `<button aria-pressed="${c === cat}" data-cat="${c}">${c}</button>`).join('');
  const endTime = (t, m) => { const [H, M] = t.split(':').map(Number), x = H * 60 + M + m; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };
  function renderTT() {
    listEl.setAttribute('aria-labelledby', 'tab-' + day);
    const rows = TT[day].filter(c => cat === 'All' || c.cat === cat);
    listEl.innerHTML = rows.length ? rows.map((c, i) => {
      const left = c.cap - c.booked, full = left <= 0;
      return `<article class="cls${full ? ' full' : ''}" style="--c:${CATS[c.cat]};animation-delay:${i * 40}ms">
        <time>${c.t}<small>to ${endTime(c.t, c.mins)}</small></time>
        <div><p class="cat">${c.cat}</p><h3>${c.n}</h3><p>with ${c.coach} · ${c.mins} min</p></div>
        <div class="spaces">${full ? 'Full, waitlist open' : left + ' of ' + c.cap + ' spaces'}<span class="meter"><i style="width:${Math.min(100, c.booked / c.cap * 100)}%"></i></span></div>
        <button class="btn ${full ? 'btn-outline' : 'btn-volt'}" data-book="${DAYS[day]}|${c.t}|${c.n}">${full ? 'Join waitlist' : 'Try it free'}</button>
      </article>`;
    }).join('') : `<p class="empty">No ${cat} classes on ${DAYS[day]}. Try another day.</p>`;
  }
  daysEl.addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (b) selectDay(+b.dataset.day); });
  daysEl.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
    e.preventDefault(); selectDay((day + k + 7) % 7); daysEl.children[day].focus();
  });
  function selectDay(i) { day = i; $$('button', daysEl).forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; }); renderTT(); }
  catsEl.addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; $$('button', catsEl).forEach(x => x.setAttribute('aria-pressed', x === b)); renderTT(); });
  listEl.addEventListener('click', e => {
    const b = e.target.closest('[data-book]'); if (!b) return;
    const [d, t] = b.dataset.book.split('|');
    $('#tf-day').value = d; renderSlots(t);
    $('#trial').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(() => $('#tf-name').focus({ preventScroll: true }), 600);
  });
  renderTT();

  /* ---------- trial form ---------- */
  const tfDay = $('#tf-day'), slotsEl = $('#slots');
  tfDay.innerHTML = DAYS.map((d, i) => `<option value="${d}">${d} ${dateFor(i).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</option>`).join('');
  tfDay.value = DAYS[day];
  function renderSlots(pref) {
    const i = DAYS.indexOf(tfDay.value);
    const times = [...new Set(TT[i].map(c => c.t))];
    slotsEl.innerHTML = times.map((t, j) => `<label><input type="radio" name="time" value="${t}" ${(pref ? t === pref : j === 0) ? 'checked' : ''}><span>${t}</span></label>`).join('');
  }
  tfDay.addEventListener('change', () => renderSlots());
  renderSlots();
  $('#trialform').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#tf-name'), email = $('#tf-email'), msg = $('#formmsg');
    const okName = name.value.trim().length > 1, okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    name.setAttribute('aria-invalid', !okName); email.setAttribute('aria-invalid', !okEmail);
    if (!okName || !okEmail) { msg.className = 'form-msg err'; msg.textContent = !okName ? 'Please add your name.' : 'Please add a valid email.'; (!okName ? name : email).focus(); return; }
    const t = ($('input[name=time]:checked') || {}).value;
    msg.className = 'form-msg ok';
    msg.textContent = `Booked (demo): ${name.value.trim().split(' ')[0]}, see you ${tfDay.selectedOptions[0].text} at ${t}. Your coach will email a confirmation.`;
  });

  /* ---------- demo assistant ---------- */
  const chat = $('#chat'), log = $('#chatlog'), quick = $('#chatquick'), fab = $('#chatfab'), input = $('#chatmsg');
  let started = false, flow = null, ans = {};
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function openChat() {
    chat.hidden = false; fab.setAttribute('aria-expanded', 'true');
    if (!started) { started = true; greet(); }
    setTimeout(() => input.focus(), 50);
  }
  function closeChat() { chat.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); }
  $$('[data-open-chat]').forEach(b => b.addEventListener('click', () => chat.hidden ? openChat() : (b === fab ? closeChat() : input.focus())));
  $('#chatclose').addEventListener('click', closeChat);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !chat.hidden) closeChat(); });

  function add(html, who = 'bot') { const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function say(html, chips = [], delay = 550) {
    quick.innerHTML = '';
    const t = add('<span class="typing"><i></i><i></i><i></i></span>'); t.style.padding = '0';
    return new Promise(r => setTimeout(() => { t.remove(); add(html); setChips(chips); r(); }, reduce ? 0 : delay));
  }
  function setChips(chips) { quick.innerHTML = chips.map(c => `<button type="button">${c}</button>`).join(''); }
  quick.addEventListener('click', e => { const b = e.target.closest('button'); if (b) handle(b.textContent); });
  $('#chatform').addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ''; handle(v); } });

  const MENU = ['Find my membership', 'Book a free trial', 'Prices', 'Opening hours', 'Parking'];
  const greet = () => say("Hey 👋 I'm IronCore's assistant (a scripted demo). I can <b>match you to a membership</b>, answer questions, or <b>book your free trial session</b>. What do you need?", MENU, 350);

  const FAQ = [
    [/price|cost|how much|£|fee|expensive|cheap|compare|plans/i, 'Plans are <b>Off-Peak £24</b>, <b>Core £39</b> and <b>Coached £149</b> a month. No joining fee, and annual saves two months.'],
    [/hour|open|close|24|time.*open/i, "Members get in <b>24/7</b>. Coaches are on the floor 6am–10pm weekdays and 8am–6pm at weekends."],
    [/park|car/i, 'Free parking for 40 cars right outside, and the station is a 6-minute walk.'],
    [/contract|cancel|leave|tie/i, 'No long contract: monthly plans roll every 30 days. Cancel with 30 days\' notice in the app.'],
    [/freeze|pause|holiday|injur/i, 'Freeze for up to 3 months a year, free, for any reason.'],
    [/beginner|never|new to|nervous|scared/i, "You're in good company: about a third of members had never touched a barbell. You start with a 1:1 induction and a plan built for you."],
    [/discount|student|nhs|forces|military/i, '15% off for students, NHS staff and the Armed Forces. Just bring ID to your induction.'],
    [/shower|changing|locker|towel/i, 'Yes: showers, lockers, hair dryers and changing rooms. Bring a padlock or borrow one at reception.'],
    [/class|timetable|hyrox|yoga|mobility/i, 'We run 62 classes a week across Strength, Conditioning, HYROX, Lifting and Mobility. The timetable above filters by day.'],
    [/pt|personal train|coach|nutrition/i, 'Personal training comes with the <b>Coached</b> plan (4 sessions a month plus nutrition), or £45 a session on any plan.']
  ];

  function handle(text) {
    add(esc(text), 'me'); quick.innerHTML = '';
    const t = text.toLowerCase();
    if (flow) return flow(text);
    if (/member|which plan|recommend|match|right for me/.test(t)) return startQuiz();
    if (/book|trial|free|session|visit|tour/.test(t) && !/price|cost/.test(t)) return startBooking();
    if (/hi\b|hello|hey/.test(t)) return greet();
    for (const [re, a] of FAQ) if (re.test(text)) return say(a, ['Find my membership', 'Book a free trial', 'Something else']);
    if (/something else|menu|help/.test(t)) return say('Sure. Pick one, or type your question:', MENU);
    say("I'm a simple demo, so I didn't catch that. Try asking about prices, hours, parking, contracts, beginners, or book a free trial.", MENU);
  }

  /* membership quiz */
  function startQuiz() {
    ans = {};
    say('Three quick questions. <b>What\'s your main goal?</b>', ['Get stronger', 'Lose fat', 'Race HYROX', 'General fitness']);
    flow = v => {
      ans.goal = v;
      say('<b>When can you usually train?</b>', ['Early mornings', 'Daytime', 'Evenings', 'Weekends']);
      flow = v2 => {
        ans.when = v2;
        say('<b>How much guidance do you want?</b>', ['Just the plan', 'Classes and community', '1:1 coaching']);
        flow = v3 => { ans.help = v3; flow = null; recommend(); };
      };
    };
  }
  function recommend() {
    let plan = 'Core', price = '£39/mo', why = 'unlimited classes, 24/7 access and a monthly program review';
    if (/1:1|coach/i.test(ans.help) || /lose fat/i.test(ans.goal) && !/class/i.test(ans.help)) { plan = 'Coached'; price = '£149/mo'; why = '4 PT sessions a month plus nutrition coaching, which is the fastest route for your goal'; }
    else if (/just the plan/i.test(ans.help) && /daytime/i.test(ans.when)) { plan = 'Off-Peak'; price = '£24/mo'; why = 'you train in off-peak hours and want a plan more than classes'; }
    const cls = { 'Get stronger': 'Powerbuilding and Squat Club', 'Lose fat': 'Engine Room and Metcon 30', 'Race HYROX': 'HYROX Stations and Run Club', 'General fitness': 'Metcon 30 and Mobility Flow' }[ans.goal] || 'Engine Room';
    $('#tf-plan').value = plan;
    say(`My pick for you:<div class="card"><strong>${plan} · ${price}</strong>Because ${why}. Classes to try: <b>${cls}</b>.</div>Want to try it free for 7 days?`, ['Book a free trial', 'Compare plans', 'Something else'], 900)
      .then(() => { ans.plan = plan; });
  }
  /* booking */
  function startBooking() {
    const b = {};
    say("Let's book your free induction. <b>Which day suits?</b>", DAYS.map((d, i) => `${d} ${dateFor(i).getDate()}`));
    flow = v => {
      const i = DAYS.findIndex(d => v.toLowerCase().startsWith(d.toLowerCase()));
      if (i < 0) return say('Pick a day from the buttons (e.g. "Tue").', DAYS.map((d, j) => `${d} ${dateFor(j).getDate()}`));
      b.i = i; b.day = v;
      const times = [...new Set(TT[i].map(c => c.t))];
      say(`<b>${v}</b>, nice. What time?`, times);
      flow = t => {
        if (!/^\d{1,2}:\d{2}$/.test(t.trim())) return say('Tap one of the times.', [...new Set(TT[i].map(c => c.t))]);
        b.t = t.trim();
        say("And your first name?", []);
        flow = n => {
          b.name = n.trim().split(' ')[0].slice(0, 24);
          flow = null;
          $('#tf-name').value = n.trim(); $('#tf-day').value = DAYS[b.i]; renderSlots(b.t);
          if (ans.plan) $('#tf-plan').value = ans.plan;
          const ref = 'IC-' + Math.random().toString(36).slice(2, 7).toUpperCase();
          say(`Done, ${esc(b.name)} 💪<div class="card"><strong>Free session booked</strong>${esc(b.day)} at ${b.t} · Coach-led induction<br><small>Ref ${ref} · demo booking, nothing is sent</small></div>Bring trainers and water. Anything else?`, ['Prices', 'Parking', 'Find my membership'], 800);
        };
      };
    };
  }
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
})();
