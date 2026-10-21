/* The Tender Desk homepage: scroll scenes, video slots, enquiry form */
(function () {
  var desktop = window.matchMedia('(min-width:761px)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Video slots: set data-video="/path.mp4" to use a clip. Desktop only; the poster stays as fallback. */
  document.querySelectorAll('video[data-video]').forEach(function (v) {
    var src = v.getAttribute('data-video');
    if (!src || !desktop || reduce) { v.remove(); return; }
    v.src = src; v.muted = true; v.autoplay = true;
    v.addEventListener('canplay', function () { v.classList.add('ready'); }, { once: true });
    v.addEventListener('error', function () { v.remove(); }, { once: true });
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  });

  /* Enquiry form: mailto with fields prefilled */
  var f = document.getElementById('enq');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(f), ok = true;
    ['name', 'email'].forEach(function (k) {
      var el = f.elements[k], bad = !String(d.get(k) || '').trim() || (k === 'email' && !/.+@.+\..+/.test(d.get(k)));
      el.classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) return;
    var subject = (d.get('need') || 'Enquiry') + ' for ' + (d.get('business') || d.get('name'));
    var body = 'Name: ' + d.get('name') + '\nBusiness: ' + (d.get('business') || '') + '\nEmail: ' + d.get('email') +
      '\nNeed: ' + d.get('need') + '\n\n' + (d.get('msg') || '');
    location.href = 'mailto:hello@thetenderdesk.co.uk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });

  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  var lenis;
  if (desktop && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) { var t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t); } });
    });
  }

  /* intro */
  gsap.from('.hero .ln>span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.12, delay: 0.1 });
  gsap.from('.hero .founder, .hero .kicker', { opacity: 0, duration: 1, delay: 0.7 });

  var mm = gsap.matchMedia();
  mm.add('(min-width:761px)', function () {
    /* hero: the small window opens into a full-bleed frame */
    /* hero: pinned; laptop3d.js reads TD_heroProgress to open the lid and cycle the screens */
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=420%', scrub: 0.6, pin: '.hero .stage',
        onUpdate: function (st) { window.TD_heroProgress = st.progress; } } })
      .to('.hero-copy', { yPercent: -60, opacity: 0, ease: 'power1.in', duration: 0.06 }, 0)
      .to('.scroll-hint', { opacity: 0, duration: 0.05 }, 0)
      .fromTo('.playing', { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.3)
      .to('.playing', { opacity: 0, duration: 0.04 }, 0.96)
      .to({}, { duration: 0.0 }, 1);

    /* each showcase: pinned, frame opens, name rises, copy lands */
    gsap.utils.toArray('.show').forEach(function (s) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: s, start: 'top top', end: '+=120%', scrub: 0.6, pin: s.querySelector('.stage') } });
      tl.fromTo(s.querySelector('.media'), { clipPath: 'inset(14% 10% 14% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', duration: 0.5 }, 0)
        .fromTo(s.querySelector('.media img, .media .ph'), { scale: 1.25 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .from(s.querySelector('.name'), { yPercent: 60, opacity: 0, ease: 'power3.out', duration: 0.4 }, 0.15)
        .from(s.querySelectorAll('.idx,.line,.view'), { y: 30, opacity: 0, stagger: 0.05, duration: 0.25 }, 0.35)
        .to({}, { duration: 0.3 });
    });

    /* trades: rows race in opposite directions */
    gsap.timeline({ scrollTrigger: { trigger: '.trades', start: 'top top', end: '+=120%', scrub: 0.4, pin: '.trades .stage' } })
      .fromTo('.row.r1', { xPercent: 0 }, { xPercent: -45, ease: 'none' }, 0)
      .fromTo('.row.r2', { xPercent: -45 }, { xPercent: 0, ease: 'none' }, 0);

    /* steps: land one at a time */
    gsap.timeline({ scrollTrigger: { trigger: '.steps', start: 'top top', end: '+=110%', scrub: 0.5, pin: '.steps .stage' } })
      .from('.step-list li', { y: 120, opacity: 0, stagger: 0.35, ease: 'power2.out' });

    gsap.from('.also h3', { yPercent: 40, opacity: 0, stagger: 0.15, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.also', start: 'top 60%' } });
  });
  mm.add('(max-width:760px)', function () {
    gsap.utils.toArray('.show-copy, .step-list li, .also-grid > div').forEach(function (el) {
      gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
  });
})();
