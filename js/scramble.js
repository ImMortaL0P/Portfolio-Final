/* Shared text-scramble — the resume ticker and the hero discipline
   panel use the same transition, so the two read as one system. */

/* Filler is drawn from the word being scrambled to, not from a fixed
   alphabet: a random run of #%WM is far wider than the real text, which
   used to push the resume ticker onto a second line for the length of
   the transition before it snapped back. Same letters in, same width. */
const FALLBACK = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function scrambleTo(el, text, duration = 620) {
  if (!el) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return; }
  const start = performance.now();
  const from = el.textContent.length;
  const to = text.length;
  /* the pool stays close to the target's own letterforms */
  const pool = (text.replace(/\s+/g, '') + FALLBACK).split('');
  cancelAnimationFrame(el._raf || 0);
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    /* and the line grows or shrinks into the new length instead of
       running at max(from, to) for the whole transition */
    const len = Math.round(from + (to - from) * Math.min(1, p / 0.45));
    let out = '';
    for (let i = 0; i < len; i++) {
      const settle = (i / Math.max(1, len)) * 0.65;   /* locks in left to right */
      const target = text[i] || '';
      if (p >= settle + 0.35) out += target;
      else if (target === ' ' || target === '') out += target;
      else out += pool[(Math.random() * pool.length) | 0];
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
