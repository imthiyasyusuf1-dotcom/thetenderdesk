(() => {
  "use strict";
  const PHONE = matchMedia("(max-width: 860px)").matches;
  const V = PHONE ? { dir: "seq/m", n: 200, w: 720, h: 1280 } : { dir: "seq/d", n: 300, w: 1440, h: 810 };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (i) => String(i).padStart(3, "0");

  /* ---------- frame sequence: two layers (behind the type, in front of it) ---------- */
  const cB = document.getElementById("cBack"), cF = document.getElementById("cFront");
  const xB = cB.getContext("2d"), xF = cF.getContext("2d");
  const back = new Array(V.n), front = new Array(V.n), ready = new Uint8Array(V.n);
  let cur = -1, want = 0, dirty = true;

  function size() {
    const r = Math.min(window.devicePixelRatio || 1, PHONE ? 1.6 : 1.5);
    const w = Math.round(cB.clientWidth * r), h = Math.round(cB.clientHeight * r);
    for (const c of [cB, cF]) { if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } }
    dirty = true;
  }
  function nearest(i) {
    if (ready[i]) return i;
    for (let d = 1; d < V.n; d++) {
      if (i - d >= 0 && ready[i - d]) return i - d;
      if (i + d < V.n && ready[i + d]) return i + d;
    }
    return -1;
  }
  function paint() {
    const i = nearest(want);
    if (i < 0 || (i === cur && !dirty)) return;
    cur = i; dirty = false;
    const W = cB.width, H = cB.height;
    const s = Math.max(W / V.w, H / V.h);
    const dw = V.w * s, dh = V.h * s, dx = (W - dw) / 2, dy = (H - dh) / 2;
    xB.clearRect(0, 0, W, H); xF.clearRect(0, 0, W, H);
    const ok = (im) => im && im.complete && im.naturalWidth > 0;
    if (ok(back[i])) xB.drawImage(back[i], dx, dy, dw, dh);
    if (ok(front[i])) xF.drawImage(front[i], dx, dy, dw, dh);
  }

  // load order: first frame, then coarse to fine so scrubbing works before everything lands
  const order = [], seen = new Set();
  for (const step of [V.n, 24, 12, 6, 3, 1]) for (let i = 0; i < V.n; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  if (!seen.has(V.n - 1)) order.splice(1, 0, V.n - 1);
  const bar = document.querySelector("#bar"), barI = bar.querySelector("i");
  let done = 0, q = 0;
  function loadOne(i) {
    return Promise.all(["b", "f"].map((l) => new Promise((res) => {
      const im = new Image();
      im.decoding = "async";
      im.src = `${V.dir}/${l}/${pad(i)}.webp`;
      const fin = () => { (l === "b" ? back : front)[i] = im; res(); };
      im.decode ? im.decode().then(fin, fin) : (im.onload = im.onerror = fin);
    }))).then(() => {
      ready[i] = 1; done++;
      barI.style.transform = `scaleX(${done / V.n})`;
      if (done === V.n) bar.classList.add("done");
      dirty = true;
    });
  }
  function pump() {
    while (q < order.length && pumping < 6) {
      const i = order[q++]; pumping++;
      loadOne(i).then(() => { pumping--; pump(); });
    }
  }
  let pumping = 0;
  if (reduce) { order.length = 0; order.push(0); want = 0; }
  pump();

  window.addEventListener("resize", size);
  size();

  /* ---------- smooth scroll ---------- */
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.6 }); }
    }));
  }
  gsap.ticker.add(paint);

  /* ---------- stage choreography: one film, timed in film time T ---------- */
  const prog = document.querySelector(".progress i");
  const sticky = document.querySelector(".sticky");
  const P = (T) => 0.015 + 0.94 * T;          // film time -> scroll progress
  const D = (dT) => 0.94 * dT;
  gsap.set([".sc-flow", ".sc-fit", ".sc-heat", ".sc-done"], { autoAlpha: 0 });

  function beat(sel, tIn, tOut, ghost) {
    tl.fromTo(sel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, P(tIn))
      .fromTo(sel + " .col > *", { y: 70, opacity: 0 }, { y: 0, opacity: 1, stagger: D(0.012), duration: D(0.05), ease: "power2.out" }, P(tIn));
    if (ghost) tl.fromTo(sel + " .ghost", { xPercent: 18, opacity: 0 }, { xPercent: -10, opacity: 1, duration: D(tOut - tIn) }, P(tIn - 0.01));
    if (tOut < 1) {
      tl.to(sel + " .col > *", { y: -60, opacity: 0, stagger: D(0.008), duration: D(0.04) }, P(tOut - 0.04));
      if (ghost) tl.to(sel + " .ghost", { opacity: 0, duration: D(0.03) }, P(tOut - 0.03));
      tl.set(sel, { autoAlpha: 0 }, P(tOut + 0.005));
    }
  }
  const tl = gsap.timeline({ defaults: { ease: "none" } });
  // hero: the type gets swallowed as we dive into the pipe
  tl.to(".sc-hero .giant .l1", { yPercent: -60, opacity: 0, duration: D(0.035) }, P(0.025))
    .to(".sc-hero .giant .l2", { yPercent: -40, opacity: 0, duration: D(0.035) }, P(0.03))
    .to([".sc-hero .eyebrow", ".sc-hero .tag", ".sc-hero .cue"], { y: -40, opacity: 0, duration: D(0.03) }, P(0.015))
    .set(".sc-hero", { autoAlpha: 0 }, P(0.07));
  beat(".sc-flow", 0.13, 0.30, false);   // out of the bore, the water ribbon
  beat(".sc-fit", 0.33, 0.52, true);     // parts snap together
  beat(".sc-heat", 0.55, 0.755, true);    // water turns to flame, flame sinks into the copper
  // the cream void becomes the warm room: page and film go navy together
  tl.fromTo(sticky, { backgroundColor: "#f3e9d8" }, { backgroundColor: "#0b1a33", duration: D(0.05) }, P(0.75));
  beat(".sc-done", 0.785, 1, false);
  // the room sinks into the services navy so the film hands straight over to the page
  tl.fromTo(".veil", { opacity: 0 }, { opacity: 0.82, duration: D(0.07) }, P(0.93));
  // hold after the film: copy lifts away, room and radiator sink into navy, then services takes over
  tl.to(".sc-done .col > *", { y: -50, opacity: 0, stagger: 0.004, duration: 0.02 }, 0.962)
    .to(".veil", { opacity: 1, duration: 0.03 }, 0.965)
    .to("#cFront", { opacity: 0, duration: 0.03 }, 0.965);
  tl.to({}, { duration: 0.001 }, 1);

  const navEl = document.querySelector(".nav");
  ScrollTrigger.create({
    trigger: "#stage", start: "top top", end: "bottom bottom", scrub: reduce ? false : 0.6,
    animation: reduce ? null : tl,
    onUpdate: (st) => {
      if (reduce) return;
      const T = gsap.utils.clamp(0, 1, (st.progress - 0.015) / 0.94);
      want = Math.round(T * (V.n - 1));
      prog.style.transform = `scaleX(${st.progress})`;
    }
  });
  // nav goes light while it sits over the navy room and the navy services block
  ScrollTrigger.create({
    trigger: "#stage", start: () => "top+=" + (P(0.77) * (document.getElementById("stage").offsetHeight - innerHeight)) + " top",
    endTrigger: "#services", end: "bottom top",
    onToggle: (st) => { stageDark = st.isActive; setNav(); }
  });
  // every navy section below the film keeps the nav light too
  let stageDark = false; const darkSecs = new Set();
  const setNav = () => navEl.classList.toggle("dark", stageDark || darkSecs.size > 0);
  // once past the film the nav gets a soft glass backing so headlines never run under it
  ScrollTrigger.create({ trigger: "#services", start: "top 80px",
    onEnter: () => navEl.classList.add("glass"), onLeaveBack: () => navEl.classList.remove("glass") });
  document.querySelectorAll("main > section, body > section, footer").forEach((s) => {
    const cs = getComputedStyle(s);
    let bg = cs.backgroundColor.match(/[\d.]+/g);
    if (!bg || (bg[3] !== undefined && +bg[3] === 0)) bg = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).pop()?.match(/[\d.]+/g);
    if (!bg) return;
    if ((+bg[0] * 299 + +bg[1] * 587 + +bg[2] * 114) / 1000 > 110) return;
    ScrollTrigger.create({ trigger: s, start: "top 40px", end: "bottom 40px",
      onToggle: (st) => { st.isActive ? darkSecs.add(s) : darkSecs.delete(s); setNav(); } });
  });

  // hero intro on load
  gsap.from(".sc-hero .giant span", { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.1 });
  gsap.from([".sc-hero .eyebrow", ".sc-hero .tag", ".sc-hero .cue"], { y: 20, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.35 });

  /* ---------- sections below ---------- */
  gsap.utils.toArray(".big, .giant2, .svc li, .step, .t, .badges span, .form, .tel").forEach((el) => {
    if (el.closest("#stage")) return;
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  gsap.utils.toArray(".macro img").forEach((im, k) => {
    gsap.fromTo(im, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: im.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.to(".pipe .flow", { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".steps", start: "top 70%", end: "bottom 60%", scrub: true } });
  gsap.utils.toArray(".step .num").forEach((n) => {
    gsap.fromTo(n, { color: "#d9c7ab" }, { color: "#c8642e", scrollTrigger: { trigger: n, start: "top 65%", end: "top 45%", scrub: true } });
  });
  document.querySelectorAll(".t b").forEach((b) => {
    const to = parseFloat(b.dataset.to), dec = +(b.dataset.dec || 0), pre = b.dataset.pre || "", suf = b.dataset.suf || "";
    const o = { v: 0 };
    const fmt = () => (b.textContent = pre + o.v.toFixed(dec) + suf);
    fmt();
    ScrollTrigger.create({ trigger: b, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: "power3.out", onUpdate: fmt }) });
  });

  /* ---------- quote form ---------- */
  const f = document.getElementById("qform");
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    f.querySelectorAll("[required]").forEach((el) => { const bad = !el.value.trim(); el.classList.toggle("bad", bad); if (bad) ok = false; });
    const out = f.querySelector(".ok");
    if (!ok) { out.style.color = "#c0392b"; out.textContent = "Pop your name, number and the job in and we will call you."; return; }
    out.style.color = ""; out.textContent = "Got it. An engineer will ring you back shortly.";
    f.querySelector("button").disabled = true;
  });
})();
