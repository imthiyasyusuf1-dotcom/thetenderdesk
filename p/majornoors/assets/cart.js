/* Major Noor's basket: localStorage cart, drawer, checkout by email */
(function () {
  const ROOT = document.documentElement.dataset.root || './';
  const P = {
    single: { name: 'Chilli & Mint Sauce', pack: 'Single bottle', price: 5.99, img: 'assets/bottle.webp?v=3' },
    twin: { name: 'Chilli & Mint Sauce', pack: 'Twin pack, 2 bottles', price: 10.99, img: 'assets/g-twin-s.webp' }
  };
  const KEY = 'mn-cart';
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const set = c => { localStorage.setItem(KEY, JSON.stringify(c)); render(); };
  const money = n => '£' + n.toFixed(2);
  const lines = c => Object.keys(c).filter(k => P[k] && c[k] > 0).map(k => ({ k, q: c[k], ...P[k] }));
  const total = c => lines(c).reduce((s, l) => s + l.q * l.price, 0);
  const count = c => lines(c).reduce((s, l) => s + l.q, 0);
  window.MN = { P, get, set, money, lines, total, count, add, ROOT };

  // drawer
  const d = document.createElement('div');
  d.className = 'cart';
  d.innerHTML = `<div class="cart-bg" data-x></div><aside class="cart-p" role="dialog" aria-label="Your basket">
    <div class="cart-h"><h2>Your basket</h2><button class="cart-x" data-x aria-label="Close basket">&times;</button></div>
    <div class="cart-l"></div>
    <div class="cart-f"><div class="cart-t"><span>Subtotal</span><b></b></div>
    <p class="cart-n">10p from every bottle goes to the Royal British Veterans Enterprise.</p>
    <a class="btn cart-go" href="${ROOT}checkout/">Checkout <i>&rarr;</i></a></div></aside>`;
  document.body.append(d);
  d.addEventListener('click', e => {
    if (e.target.closest('[data-x]')) close();
    const b = e.target.closest('[data-q]'); if (b) { const c = get(); c[b.dataset.k] = Math.max(0, (c[b.dataset.k] || 0) + +b.dataset.q); set(c); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  function open() { d.classList.add('on'); document.documentElement.classList.add('cart-on'); }
  function close() { d.classList.remove('on'); document.documentElement.classList.remove('cart-on'); }
  window.MN.open = open;
  function add(k, q = 1) { const c = get(); c[k] = (c[k] || 0) + q; set(c); open(); }

  function render() {
    const c = get(), ls = lines(c), n = count(c);
    document.querySelectorAll('.bag b').forEach(b => { b.textContent = n; b.hidden = !n; });
    d.querySelector('.cart-l').innerHTML = ls.length ? ls.map(l => `<div class="cl">
      <img src="${ROOT}${l.img}" alt="" width="64" height="80"><div><b>${l.name}</b><span>${l.pack}</span>
      <div class="qty"><button data-k="${l.k}" data-q="-1" aria-label="One less">&minus;</button><em>${l.q}</em><button data-k="${l.k}" data-q="1" aria-label="One more">+</button></div></div>
      <strong>${money(l.q * l.price)}</strong></div>`).join('')
      : `<div class="cart-e"><p>Your basket is empty.</p><a class="btn" href="${ROOT}shop/">Shop the sauce <i>&rarr;</i></a></div>`;
    d.querySelector('.cart-t b').textContent = money(total(c));
    d.querySelector('.cart-f').hidden = !ls.length;
    document.dispatchEvent(new CustomEvent('mn:cart'));
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'); if (a) { e.preventDefault(); add(a.dataset.add, +(a.dataset.qty || 1)); }
    if (e.target.closest('.bag')) { e.preventDefault(); open(); }
  });
  addEventListener('storage', render);
  render();
})();
document.addEventListener('click',e=>{const b=e.target.closest('.item-add');if(!b)return;const t=b.textContent;b.classList.add('ok');b.textContent='Added ✓';setTimeout(()=>{b.classList.remove('ok');b.textContent=t},1400)});
