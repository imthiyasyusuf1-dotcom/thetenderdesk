/* Full-page Arabic: swaps every text node and label from ar.json when html.ar-on is set. */
(() => {
  const root = document.documentElement;
  let dict = null, nodes = null, attrs = null;
  const norm = s => s.replace(/\s+/g, ' ').trim();
  const skip = el => el.closest('script,style,svg,.credits,.ar,[lang="ar"],[data-words]');
  function collect() {
    nodes = []; attrs = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const k = norm(n.nodeValue);
      if (k && dict[k] && !skip(n.parentElement)) nodes.push([n, n.nodeValue, n.nodeValue.replace(k, dict[k])]);
    }
    document.querySelectorAll('[placeholder],[aria-label],[alt],[title]').forEach(el => {
      if (el.closest('.credits')) return;
      ['placeholder', 'aria-label', 'alt', 'title'].forEach(a => {
        const v = el.getAttribute(a); const k = v && norm(v);
        if (k && dict[k]) attrs.push([el, a, v, dict[k]]);
      });
    });
    const t = norm(document.title);
    attrs.title = [t, dict[t] || t];
  }
  let cur = false;
  function apply(on) {
    if (!dict || on === cur) return;
    cur = on;
    if (!nodes) collect();
    nodes.forEach(([n, en, ar]) => { n.nodeValue = on ? ar : en; });
    attrs.forEach(([el, a, en, ar]) => el.setAttribute(a, on ? ar : en));
    document.title = on ? attrs.title[1] : attrs.title[0];
    document.querySelectorAll('[data-words]').forEach(el => {
      const en = el.dataset.en; if (!en || !window.__wordsSet) return;
      const k = norm(en.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'));
      const ar = dict['__w__' + k];
      if (ar) window.__wordsSet(el, on ? ar : en);
    });
    root.setAttribute('lang', on ? 'ar' : 'en');
    root.setAttribute('dir', on ? 'rtl' : 'ltr');
  }
  window.__arApply = apply;
  fetch('ar.json?v=3').then(r => r.json()).then(d => {
    dict = d;
    const sync = () => apply(root.classList.contains('ar-on'));
    sync();
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
  }).catch(() => {});
})();
