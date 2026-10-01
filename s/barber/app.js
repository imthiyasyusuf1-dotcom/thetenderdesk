(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  var lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){ var t = document.querySelector(a.getAttribute('href')); if (t){ e.preventDefault(); lenis.scrollTo(t); } });
  });

  // 1 hero intro: slit opens, image settles, words rise
  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.hero-img', { clipPath: 'inset(0% 0 0% 0)', duration: 1.3, ease: 'expo.inOut' })
    .to('.hero-img', { scale: 1, duration: 1.8 }, 0.3)
    .to('.hero-title .w', { y: 0, duration: 1.1, stagger: 0.08 }, 0.55)
    .to('.hero-foot', { opacity: 1, duration: 0.8 }, 1.2);
  gsap.to('.hero-img img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-title', { yPercent: -30, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // 2 frame grows to full bleed, words part
  var r = gsap.timeline({ scrollTrigger: { trigger: '.reveal', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  r.to('.reveal-frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 })
   .to('.reveal-frame img', { scale: 1, ease: 'power2.out', duration: 1 }, 0)
   .to('.reveal-word:not(.r2)', { xPercent: -60, opacity: 0, duration: 0.8 }, 0.15)
   .to('.reveal-word.r2', { xPercent: 60, opacity: 0, duration: 0.8 }, 0.15)
   .to('.reveal-cap', { opacity: 1, duration: 0.3 }, 0.85);

  // 3 kinetic rows
  document.querySelectorAll('.row').forEach(function(row){
    var d = +row.dataset.dir;
    gsap.fromTo(row, { xPercent: d < 0 ? -5 : -45 }, { xPercent: d < 0 ? -45 : -5, ease: 'none', scrollTrigger: { trigger: '.kinetic', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // 4 horizontal gallery
  var track = document.querySelector('.hz-track');
  gsap.to(track, { x: function(){ return -(track.scrollWidth - innerWidth); }, ease: 'none',
    scrollTrigger: { trigger: '.hz', pin: '.hz-pin', start: 'top top', end: function(){ return '+=' + (track.scrollWidth - innerWidth); }, scrub: 0.7, invalidateOnRefresh: true } });
  gsap.utils.toArray('.card img').forEach(function(img){ gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.hz', start: 'top top', end: '+=1500', scrub: true } }); });

  // 5 ritual wipe + steps
  var items = document.querySelectorAll('.ritual-copy li');
  gsap.to('.ritual-img.top', { clipPath: 'inset(0 0 0 0%)', ease: 'power1.inOut',
    scrollTrigger: { trigger: '.ritual', start: 'top top', end: 'bottom bottom', scrub: 0.6,
      onUpdate: function(s){ var k = Math.min(3, Math.floor(s.progress * 4)); items.forEach(function(li, i){ li.classList.toggle('on', i === k); }); } } });

  // 6 book title rise
  gsap.from('.book-title span', { yPercent: 100, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.book', start: 'top 70%' } });
})();
