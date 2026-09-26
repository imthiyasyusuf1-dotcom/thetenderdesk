/**
 * sequence.js
 * The phone renderer: a pre-baked WebP image sequence of the exact same
 * Three.js scene (bake.html), scrubbed on a 2D canvas. Decoding happens
 * off the main thread via createImageBitmap, and drawing one bitmap per
 * frame costs well under a millisecond, so it stays smooth on any phone.
 */
export function createSequence(canvas, { base, count, width = 540, height = 1170 }) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const frames = new Array(count);
  let loaded = 0, drawn = -1, w = 0, h = 0, token = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

  function resize() {
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    drawn = -1;
  }

  /** Load frames in a coarse to fine order so scrubbing works early. */
  function load(src = base) {
    const my = ++token; loaded = 0;
    const order = [];
    for (let step = 16; step >= 1; step >>= 1) for (let i = 0; i < count; i += step) if (!order.includes(i)) order.push(i);
    let next = 0;
    const one = () => {
      if (my !== token || next >= order.length) return;
      const i = order[next++];
      fetch(`${src}${String(i).padStart(3, '0')}.webp`).then((r) => r.blob()).then(createImageBitmap).then((bmp) => {
        if (my !== token) return bmp.close?.();
        frames[i] = bmp; loaded++; drawn = -1; one();
      }).catch(one);
    };
    for (let k = 0; k < 4; k++) one(); // four parallel requests
    return new Promise((res) => { const iv = setInterval(() => { if (frames[0] || my !== token) { clearInterval(iv); res(); } }, 30); });
  }

  /** Nearest frame that has loaded. */
  function nearest(i) {
    for (let d = 0; d < count; d++) {
      if (frames[i - d]) return i - d;
      if (frames[i + d]) return i + d;
    }
    return -1;
  }

  /** Draw position T in [0, 2]. Only touches the canvas if the frame changed. */
  function draw(T) {
    const i = nearest(Math.round((T / 2) * (count - 1)));
    if (i < 0 || i === drawn) return;
    drawn = i;
    const img = frames[i];
    // Cover fit, anchored to the centre.
    const s = Math.max(canvas.width / width, canvas.height / height);
    const dw = width * s, dh = height * s;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
  }

  /** Swap to another colourway's sequence. */
  function swap(src) { frames.fill(undefined); drawn = -1; return load(src); }

  resize();
  return { load, draw, resize, swap, progress: () => loaded / count };
}
