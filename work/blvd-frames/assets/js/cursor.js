/**
 * cursor.js
 * Custom cursor with a trailing ring, a context label ("View", "Shop")
 * and magnetic pull on anything marked [data-mag]. Positions are written
 * with gsap.quickTo so the ring rides the shared ticker.
 */
export function initCursor() {
  const { gsap } = window;
  const ring = document.getElementById('cur'), dot = document.getElementById('curDot'), label = document.getElementById('curTxt');
  document.documentElement.classList.add('has-cursor');
  const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
  const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
  addEventListener('pointermove', (e) => { ring.style.opacity = dot.style.opacity = 1; rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); }, { passive: true });

  // Context states
  document.addEventListener('pointerover', (e) => {
    const big = e.target.closest('[data-cursor]');
    const link = e.target.closest('a,button');
    ring.classList.toggle('is-big', !!big);
    ring.classList.toggle('is-link', !big && !!link);
    if (big) label.textContent = big.dataset.cursor;
  });

  // Magnetic: the element leans toward the pointer, then springs back.
  document.querySelectorAll('[data-mag]').forEach((el) => {
    const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' });
    const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * .35); my((e.clientY - r.top - r.height / 2) * .35);
    });
    el.addEventListener('pointerleave', () => { mx(0); my(0); });
  });
}
