/* ------------------------------------------------------------------
   CTA background — a slow halftone field.
   Reads as print, not decoration: a regular dot grid whose radii are
   modulated by two very slow travelling waves, with a thin accent
   crest riding the peak. Deliberately quiet — it should register as
   texture, never as motion competing with the type.
------------------------------------------------------------------- */

const INK_DOT = 'rgba(235,233,228,';
const ACCENT  = 'rgba(255,76,36,';

export function initCtaBg() {
  const canvas = document.querySelector('.cta__bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = 1;
  const GAP = 24;          // grid pitch in CSS px
  const RMAX = 2.6;        // largest dot radius

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (t) => {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    // two slow travelling waves, one diagonal, one near-horizontal
    const a1 = t * 0.00012;
    const a2 = t * 0.00007;
    const cx = w * 0.5, cy = h * 0.5;

    for (let y = GAP * 0.5; y < h; y += GAP) {
      for (let x = GAP * 0.5; x < w; x += GAP) {
        const nx = (x - cx) / w;
        const ny = (y - cy) / h;

        const wave =
          Math.sin(nx * 5.2 + ny * 2.1 + a1) * 0.5 +
          Math.sin(ny * 4.4 - nx * 1.6 + a2) * 0.5;

        // 0..1
        const u = (wave + 1) * 0.5;

        // fade the field out toward the centre so the type always wins
        const d = Math.hypot(nx * 1.15, ny * 1.35);
        const vignette = Math.min(1, Math.max(0, (d - 0.16) / 0.42));
        if (vignette <= 0.01) continue;

        const r = RMAX * (0.18 + u * 0.82) * vignette;
        if (r < 0.18) continue;

        const crest = u > 0.94;
        const alpha = (crest ? 0.42 : 0.10 + u * 0.09) * vignette;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fillStyle = (crest ? ACCENT : INK_DOT) + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }
  };

  let raf = 0, visible = true, last = 0;
  const loop = (t) => { last = t; draw(t); raf = requestAnimationFrame(loop); };

  const start = () => { if (!raf && !reduce) raf = requestAnimationFrame(loop); };
  const stop  = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  resize();
  draw(0);

  if (!reduce) {
    // only run while the card is actually on screen
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }, { rootMargin: '10% 0px' });
    io.observe(canvas);

    document.addEventListener('visibilitychange', () => {
      document.hidden || !visible ? stop() : start();
    });
  }

  // the panel is fluid, so re-measure on any layout change
  // 
  // a resize reallocates the bitmap, which clears it — always repaint,
  // otherwise the panel sits blank until the next frame (and in a
  // background tab there is no next frame)
  new ResizeObserver(() => { resize(); draw(last); }).observe(canvas);
}
