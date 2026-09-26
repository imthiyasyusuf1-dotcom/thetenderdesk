/**
 * rail.js
 * Product rail (built from products.json), 3D pointer tilt with a moving
 * glare, lookbook RGB split layers, and an accessible quick view dialog.
 */
const url = (h) => (window.BLVD && window.BLVD.productUrl ? window.BLVD.productUrl(h) : 'https://blvdframes.com/products/' + h);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initRail(products, { lenis, addToCart }) {
  const { gsap } = window;
  const rail = document.getElementById('rail');

  // Editorial rhythm: every third card runs tall, so the rail never reads as a template grid.
  // Shopify renders the cards server side (Liquid). Only build them for the static demo.
  if (!rail.children.length) rail.innerHTML = products.map((p, i) => `
    <article class="card${i % 3 === 1 ? ' tall' : ''}" data-i="${i}">
      <div class="card-in">
        <a class="card-ph" href="${url(p.handle)}" data-cursor="Shop" aria-label="${esc(p.name)}, $55">
          <img src="${p.images[0]}-s.webp" alt="${esc(p.name)} sunglasses" loading="lazy" decoding="async" width="560" height="840">
          ${p.images[1] ? `<img class="alt" src="${p.images[1]}-s.webp" alt="" loading="lazy" decoding="async" width="560" height="840">` : ''}
          <span class="card-glare"></span>
          <span class="card-tag">${esc(p.lens)}</span>
        </a>
        <button class="card-qv" data-qv="${i}">Quick view</button>
      </div>
      <div class="card-info"><div><h3>${esc(p.name)}</h3><small>${esc(p.sku)} | Spoon tips</small></div><span class="price">$55</span></div>
    </article>`).join('');

  // Rail buttons scroll by one card.
  const step = () => (rail.querySelector('.card')?.offsetWidth || 300) + 22;
  document.getElementById('prev').onclick = () => rail.scrollBy({ left: -step(), behavior: 'smooth' });
  document.getElementById('next').onclick = () => rail.scrollBy({ left: step(), behavior: 'smooth' });
  // Keep the horizontal wheel on the rail from fighting Lenis.
  rail.setAttribute('data-lenis-prevent-wheel', '');

  // 3D tilt + glare, transform only.
  if (matchMedia('(hover: hover)').matches) {
    rail.querySelectorAll('.card').forEach((card) => {
      const inner = card.querySelector('.card-in'), glare = card.querySelector('.card-glare');
      const rX = gsap.quickTo(inner, 'rotationX', { duration: .6, ease: 'power3' });
      const rY = gsap.quickTo(inner, 'rotationY', { duration: .6, ease: 'power3' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        rX((0.5 - y) * 12); rY((x - 0.5) * 14);
        glare.style.transform = `translate3d(${(x - .5) * 60}%, ${(y - .5) * 60}%, 0)`;
      });
      card.addEventListener('pointerleave', () => { rX(0); rY(0); });
    });
  }

  // Lookbook RGB split: two tinted copies of the photo, offset on hover.
  document.querySelectorAll('.look-card .shift').forEach((s) => {
    const src = s.querySelector('img').getAttribute('src');
    s.insertAdjacentHTML('beforeend', `<span class="ch r" style="background-image:url(${src})"></span><span class="ch b" style="background-image:url(${src})"></span>`);
  });

  /* quick view */
  const qv = document.getElementById('qv'), gal = document.getElementById('qvGal'), dots = document.getElementById('qvDots');
  let lastFocus = null, cur = 0;
  function show(i) {
    cur = i;
    gal.querySelectorAll('img').forEach((im, k) => im.classList.toggle('on', k === i));
    dots.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i));
  }
  function open(p) {
    lastFocus = document.activeElement;
    gal.querySelectorAll('img').forEach((n) => n.remove());
    dots.innerHTML = '';
    gal.insertAdjacentHTML('afterbegin', p.images.map((src, k) => `<img src="${/^(https?:)?\/\//.test(src) ? src : src + '.webp'}" alt="${esc(p.name)} view ${k + 1}" decoding="async">`).join(''));
    dots.innerHTML = p.images.map((_, k) => `<button aria-label="Photo ${k + 1}"></button>`).join('');
    dots.querySelectorAll('button').forEach((b, k) => (b.onclick = () => show(k)));
    show(0);
    document.getElementById('qvSku').textContent = `${p.sku} | Degenerate Collection`;
    document.getElementById('qvTitle').textContent = p.name;
    const pr = document.getElementById('qvPrice'); if (pr) pr.textContent = p.price;
    document.getElementById('qvList').innerHTML = (p.details || []).map((d) => d.trim()).filter(Boolean).map((d) => `<li>${esc(d)}</li>`).join('');
    const buy = document.getElementById('qvBuy');
    buy.href = p.url || url(p.handle);
    buy.onclick = addToCart && p.variantId ? (e) => { e.preventDefault(); addToCart(p.variantId, 1).then(close); } : null;
    if (addToCart) buy.firstChild.textContent = p.available === false ? 'Sold out ' : 'Add to bag ';
    qv.classList.add('open'); lenis && lenis.stop();
    qv.querySelector('.qv-x').focus();
  }
  function close() { qv.classList.remove('open'); lenis && lenis.start(); lastFocus && lastFocus.focus(); }
  rail.addEventListener('click', (e) => { const b = e.target.closest('[data-qv]'); if (b) open(products[+b.dataset.qv]); });
  qv.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  gal.addEventListener('click', (e) => { if (e.target.tagName === 'IMG') show((cur + 1) % gal.querySelectorAll('img').length); });
  addEventListener('keydown', (e) => {
    if (!qv.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show((cur + 1) % gal.querySelectorAll('img').length);
    if (e.key === 'ArrowLeft') { const n = gal.querySelectorAll('img').length; show((cur - 1 + n) % n); }
  });
}
