/* Shared text-scramble — the resume ticker and the hero discipline
   panel use the same transition, so the two read as one system. */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/\\*+=<>';

export function scrambleTo(el, text, duration = 620) {
  if (!el) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
  const start = performance.now();
  const len = Math.max(el.textContent.length, text.length);
  cancelAnimationFrame(el._raf || 0);
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    let out = '';
    for (let i = 0; i < len; i++) {
      const settle = (i / len) * 0.65;        /* letters lock in left to right */
      const target = text[i] || '';
      if (p >= settle + 0.35) out += target;
      else if (target === ' ' || target === '') out += target;
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) el._raf = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  el._raf = requestAnimationFrame(tick);
}

/* Quieter sibling for supporting lines: they wipe up and back rather
   than scrambling, so only one thing is churning at a time. */
export function swapTo(el, text, duration = 420) {
  if (!el) return;
  if (el.textContent === text) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
  el.style.transition = `opacity ${duration / 2}ms var(--ease-out, ease), transform ${duration / 2}ms var(--ease-out, ease)`;
  el.style.opacity = '0';
  el.style.transform = 'translateY(6px)';
  clearTimeout(el._swap);
  el._swap = setTimeout(() => {
    el.textContent = text;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, duration / 2);
}
