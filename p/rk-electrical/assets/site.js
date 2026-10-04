(() => {
  const nav = document.getElementById('nav'), hero = document.querySelector('.hero'), dim = document.getElementById('dim');
  const sw = document.getElementById('switch');
  sw.addEventListener('click', () => { const on = sw.getAttribute('aria-pressed') === 'true'; sw.setAttribute('aria-pressed', !on); hero.classList.toggle('off', on); });
  let tick = false;
  const onScroll = () => {
    const y = scrollY, h = innerHeight;
    nav.classList.toggle('solid', y > 40);
    document.body.classList.toggle('at-top', y < h * .5);
    const r = dim.getBoundingClientRect(), span = r.height - h;
    const p = Math.min(1, Math.max(0, -r.top / (span * .8)));
    dim.style.setProperty('--b', (.12 + p * .88).toFixed(3));
    tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  document.querySelectorAll('.sec-head > *, .svc li, .svc-pics figure, .rob-num, .rob-copy > *, .q-copy > *, .q-form').forEach(e => e.classList.add('rv'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(e => io.observe(e));
  const f = document.getElementById('qform');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const body = `Name: ${d.name}\nPhone: ${d.phone}\nJob: ${d.job}\nPostcode: ${d.pc}\n\n${d.msg}`;
    location.href = 'mailto:rob.kerr@ntlworld.com?subject=' + encodeURIComponent('Quote request: ' + d.job) + '&body=' + encodeURIComponent(body);
    f.querySelector('.ok').hidden = false;
  });
})();
