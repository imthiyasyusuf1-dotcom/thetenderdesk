(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = window.gsap && window.ScrollTrigger;
  $('#yr') && ($('#yr').textContent = new Date().getFullYear());

  // mobile menu
  const burger = $('.burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const o = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    document.body.style.overflow = o ? 'hidden' : '';
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); document.body.style.overflow = ''; }));

  // hide header on scroll down
  const hdr = $('.hdr'); let last = 0;
  addEventListener('scroll', () => { const y = scrollY; hdr.classList.toggle('hide', y > last && y > 400 && !nav.classList.contains('open')); last = y; }, { passive: true });

  // mailto forms (the office inbox receives every enquiry)
  $$('.mform').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const err = $('.ferr', f); let ok = true;
    $$('input,select,textarea', f).forEach(el => {
      const bad = (el.required && !el.value.trim()) || (el.type === 'email' && el.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      el.classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) { err.textContent = 'Please fill in the highlighted fields.'; return; }
    err.textContent = '';
    const lines = $$('input,select,textarea', f).filter(el => el.value).map(el => `${el.name}: ${el.value}`);
    location.href = `mailto:info@7ei8ht6properties.com?subject=${encodeURIComponent(f.dataset.subject)}&body=${encodeURIComponent(lines.join('\n') + '\n\nSent from 7ei8ht6properties.com')}`;
  }));

  // team filter + search
  const q = $('#tsearch');
  if (q) {
    let role = 'all';
    const apply = () => {
      const t = q.value.trim().toLowerCase(); let n = 0;
      $$('.member').forEach(m => {
        const show = (role === 'all' || $('.role', m).textContent === role) && m.textContent.toLowerCase().includes(t);
        m.hidden = !show; if (show) n++;
      });
      $('.empty').hidden = n > 0; hasG && ScrollTrigger.refresh();
    };
    $$('.chip').forEach(c => c.addEventListener('click', () => { $$('.chip').forEach(x => x.classList.remove('on')); c.classList.add('on'); role = c.dataset.f; apply(); }));
    q.addEventListener('input', apply);
  }

  // counters (static fallback)
  const setCounts = () => $$('[data-count]').forEach(el => el.textContent = (+el.dataset.count).toLocaleString('en'));
  if (!hasG || reduce) { setCounts(); $$('.words .w').forEach(w => w.style.opacity = 1); return; }

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t); t.focus?.(); } }));

  // cursor glow
  if (matchMedia('(pointer:fine)').matches) {
    const g = document.createElement('div'); g.className = 'glow'; document.body.appendChild(g);
    const x = gsap.quickTo(g, 'x', { duration: .6 }), y = gsap.quickTo(g, 'y', { duration: .6 });
    addEventListener('mousemove', e => { x(e.clientX); y(e.clientY); });
    $$('.tilt').forEach(c => {
      c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); gsap.to(c, { rotateY: ((e.clientX - r.left) / r.width - .5) * 8, rotateX: -((e.clientY - r.top) / r.height - .5) * 8, transformPerspective: 900, duration: .5 }); });
      c.addEventListener('mouseleave', () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: .7 }));
    });
  }

  // split headings into lines of words
  $$('.split').forEach(h => {
    h.innerHTML = h.innerHTML.split(/(\s+)/).map(w => /^\s+$/.test(w) ? w : `<span style="display:inline-block;overflow:hidden;vertical-align:top"><span class="sw" style="display:inline-block">${w}</span></span>`).join('');
    gsap.from($$('.sw', h), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .04, scrollTrigger: { trigger: h, start: 'top 88%' } });
  });
  // scrubbed word highlight
  $$('.words').forEach(p => {
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; f.append(s); } }); c.replaceWith(f); }
      else if (c.nodeType === 1) walk(c);
    });
    walk(p);
    gsap.to($$('.w', p), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });
  $$('.reveal').forEach(el => gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  $$('[data-count]').forEach(el => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 2.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('en') });
  });
  $$('[data-parallax]').forEach(el => gsap.to(el.tagName === 'IMG' ? el : el, { yPercent: el.tagName === 'IMG' ? -18 : 12, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } }));

  // sub-hero intro
  const sh = $('.sub-hero');
  if (sh) gsap.from('.sub-bg img', { scale: 1.3, duration: 2.2, ease: 'expo.out' });

  // cinematic scroll-scrubbed hero: images zoom and cross-dissolve like film frames
  const hero = $('#hero');
  if (hero) {
    const frames = $$('.hf'), hc = $('#hc');
    gsap.from('.hero-t span', { yPercent: 100, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: .12, delay: .1 });
    gsap.from('.hero-copy .lead,.hero-ctas', { y: 30, opacity: 0, duration: 1.2, delay: .5, stagger: .1, ease: 'power3.out' });
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6,
      onUpdate: s => { hc.textContent = '0' + Math.min(frames.length, 1 + Math.floor(s.progress * frames.length * .999)); } } });
    frames.forEach((f, i) => {
      tl.to(f, { scale: 1, duration: 1, ease: 'none' }, i);
      if (i > 0) tl.to(f, { opacity: 1, duration: .35, ease: 'none' }, i - .15);
    });
    tl.to('.hero-copy', { y: -60, opacity: .0, duration: .8 }, frames.length - 1.2);
  }

  // horizontal services scroll (desktop)
  const hs = $('.hscroll');
  if (hs) ScrollTrigger.matchMedia({
    '(min-width: 961px)': () => {
      const tr = $('.hs-track');
      gsap.to(tr, { x: () => -(tr.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { trigger: hs, pin: true, scrub: .8, end: () => '+=' + (tr.scrollWidth - innerWidth), invalidateOnRefresh: true } });
      $$('.hs-panel img', hs).forEach(im => gsap.to(im, { scale: 1, ease: 'none', scrollTrigger: { trigger: hs, start: 'top top', end: () => '+=' + (tr.scrollWidth - innerWidth), scrub: true } }));
    }
  });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
