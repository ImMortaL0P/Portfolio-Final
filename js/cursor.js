/* ------------------------------------------------------------------
   Cursor pill. One delegated listener pair on the document, so rows
   and cards rendered later by JS pick it up without re-binding. Only
   for a real hovering pointer; touch never sees it.
------------------------------------------------------------------- */
export function initCursor() {
  const pill = document.querySelector('.cursor-pill');
  if (!pill || pill.dataset.live || !window.gsap) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  pill.dataset.live = '1';

  const xTo = gsap.quickTo(pill, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(pill, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });

  let current = null;
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-cursor]');
    if (el === current) return;
    current = el;
    if (el) {
      pill.textContent = el.dataset.cursor;
      gsap.to(pill, { scale: 1, opacity: 1, duration: 0.2 });
    } else {
      gsap.to(pill, { scale: 0.4, opacity: 0, duration: 0.2 });
    }
  });
  document.addEventListener('mouseleave', () => {
    current = null;
    gsap.to(pill, { scale: 0.4, opacity: 0, duration: 0.2 });
  });
}
