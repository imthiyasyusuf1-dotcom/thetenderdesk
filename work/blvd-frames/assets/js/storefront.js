/* storefront.js: demo bag, drawer, fake checkout, sticky mobile CTA, review reveals.
   Static demo only. On Shopify the theme cart replaces all of this. */
(() => {
  const PRICE = 55, FREE = 50, KEY = 'blvd-bag';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let products = [], bag = [];
  try { bag = JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { bag = []; }
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(bag)); } catch {} };
  const count = () => bag.reduce((a, l) => a + l.q, 0);
  const find = (h) => products.find((p) => p.handle === h);

  const drawer = $('#drawer'), lines = $('#lines'), foot = $('#drawerFoot'), shipTxt = $('#shipTxt'), shipBar = $('#shipBar');
  const toast = $('#toast');
  let lastFocus = null;

  function badge() {
    document.querySelectorAll('[data-bag-count]').forEach((b) => (b.textContent = count()));
  }
  function render() {
    badge();
    const n = count(), sub = n * PRICE;
    if (!n) {
      lines.innerHTML = '<p class="empty">Your bag is empty.<br>Thirteen frames, one price. Go on.</p>';
      foot.hidden = true; shipTxt.textContent = `Free US shipping on orders over $${FREE}`; shipBar.style.width = '0%';
      return;
    }
    foot.hidden = false;
    shipTxt.textContent = sub >= FREE ? 'You have unlocked free US shipping' : `$${FREE - sub} away from free US shipping`;
    shipBar.style.width = Math.min(100, (sub / FREE) * 100) + '%';
    lines.innerHTML = bag.map((l) => { const p = find(l.h) || { name: l.h, images: [''], sku: '' };
      return `<div class="line-i"><img src="${p.images[0]}-s.webp" alt="" width="76" height="76" loading="lazy"><div><h4>${esc(p.name)}</h4><small>${esc(p.sku)} | Spoon tips included</small><div class="qty"><button data-dec="${l.h}" aria-label="Remove one ${esc(p.name)}">&minus;</button><span>${l.q}</span><button data-inc="${l.h}" aria-label="Add one ${esc(p.name)}">+</button></div></div><b>$${l.q * PRICE}</b></div>`; }).join('');
    $('#subTot').textContent = '$' + sub;
  }
  function add(h) {
    const l = bag.find((x) => x.h === h); l ? l.q++ : bag.push({ h, q: 1 });
    save(); render();
    document.querySelectorAll('.bag-btn').forEach((b) => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    const p = find(h); toast.textContent = `${p ? p.name : 'Frame'} added. Spoon included.`;
    toast.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }
  function open() {
    lastFocus = document.activeElement; render(); drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    window.BLVD_LENIS && window.BLVD_LENIS.stop(); setTimeout(() => $('.drawer-x').focus(), 50);
  }
  function close() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    window.BLVD_LENIS && window.BLVD_LENIS.start(); lastFocus && lastFocus.focus && lastFocus.focus();
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-bag-open],[data-add],[data-inc],[data-dec],[data-drawer-close],#checkout,#qvBuy,#heroAdd');
    if (!t) return;
    if (t.matches('[data-bag-open]')) { e.preventDefault(); open(); }
    else if (t.matches('[data-add]')) { e.preventDefault(); add(t.dataset.add); }
    else if (t.id === 'heroAdd') { e.preventDefault(); add(t.dataset.handle); open(); }
    else if (t.id === 'qvBuy') {
      const name = $('#qvTitle').textContent, p = products.find((x) => x.name === name);
      if (p) { e.preventDefault(); e.stopImmediatePropagation(); document.querySelector('#qv [data-close]').click(); add(p.handle); setTimeout(open, 250); }
    }
    else if (t.matches('[data-inc]')) { add(t.dataset.inc); }
    else if (t.matches('[data-dec]')) { const l = bag.find((x) => x.h === t.dataset.dec); if (l && --l.q <= 0) bag = bag.filter((x) => x !== l); save(); render(); }
    else if (t.matches('[data-drawer-close]')) close();
    else if (t.id === 'checkout') {
      const n = count(), ref = 'BLVD-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      lines.innerHTML = `<div class="done"><div class="tick"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h4>Order placed.<br>Salt ready.</h4><p>${n} pair${n > 1 ? 's' : ''}, order ${ref}. This is a demo checkout, so nothing was charged. On the live store this hands off to Shopify checkout with Shop Pay, Apple Pay and PayPal.</p><a class="btn ghost" href="https://blvdframes.com/collections/all" data-no-tx>Shop the real store <span aria-hidden="true">&rarr;</span></a></div>`;
      foot.hidden = true; bag = []; save(); badge();
    }
  }, true);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });

  // Add-to-bag buttons on each rail card once rail.js has rendered them.
  function decorate() {
    const rail = $('#rail'); if (!rail || !products.length) return;
    rail.querySelectorAll('.card').forEach((c) => {
      if (c.querySelector('[data-add]')) return; const p = products[+c.dataset.i]; if (!p) return;
      const info = c.querySelector('.card-info'); if (!info) return;
      info.insertAdjacentHTML('beforeend', `<button class="card-add" data-add="${p.handle}" aria-label="Add ${esc(p.name)} to bag">+ Bag</button>`);
    });
  }
  fetch('products.json').then((r) => r.json()).then((d) => {
    products = d.products || d; render(); decorate();
    const rail = $('#rail'); rail && new MutationObserver(decorate).observe(rail, { childList: true });
  }).catch(() => {});

  // Sticky mobile CTA shows once the hero CTA scrolls away, hides over the footer.
  const mcta = $('#mcta'), anchor = $('.hero-buy'), footEl = $('.foot');
  if (mcta && anchor) {
    let pastHero = false, atFoot = false;
    const upd = () => { const s = pastHero && !atFoot; mcta.classList.toggle('show', s); document.body.classList.toggle('mc', s); };
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; upd(); }).observe(anchor);
    footEl && new IntersectionObserver(([e]) => { atFoot = e.isIntersecting; upd(); }).observe(footEl);
  }

  // Review cards reveal.
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.rev').forEach((r) => io.observe(r));
  render();
})();
