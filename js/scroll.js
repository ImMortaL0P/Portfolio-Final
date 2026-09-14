/* Lenis — lerp-based smoothing reads smoother on a trackpad than
   duration-based, and survives fast flicks without overshoot. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const lenis = new Lenis({
  lerp: reduce ? 1 : 0.085,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.5,
  syncTouch: true,
  syncTouchLerp: 0.09,
  gestureOrientation: 'vertical',
  autoToggle: true
});
/* exposed so the footer's back-to-top can use the same easing */
window.lenis = lenis;

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* THE scroll bug: Lenis caches the document height once. The work list is
   rendered by JS and ScrollTrigger then inserts pin-spacers, so the real
   page grew to ~10,250px while Lenis still clamped at ~5,670 — the page
   simply stopped scrolling partway down. Re-measure whenever the document
   changes size, and on every ScrollTrigger refresh. */
let resizeTimer = 0;
const remeasure = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => lenis.resize(), 60);   /* not rAF: that is
    throttled to nothing in a background tab, and the limit must be right
    the moment the tab comes back */
};
if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', remeasure);
new ResizeObserver(remeasure).observe(document.body);
addEventListener('load', () => {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
  lenis.resize();
  /* images and fonts land after `load` on a cold cache, so sweep once more */
  [200, 800, 2000].forEach((t) => setTimeout(() => lenis.resize(), t));
});
document.addEventListener('DOMContentLoaded', () => setTimeout(() => lenis.resize(), 120));

/* Anchor links route through Lenis.
   Lenis' own element targeting uses offsetTop, which is wrong once
   ScrollTrigger has inserted pin-spacers above the target — that's why
   jumps landed past the section. Measure the live position instead. */
const NAV_CLEARANCE = 104;

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (!id || id === '#') return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();

  if (window.ScrollTrigger) ScrollTrigger.refresh();
  const y = target.getBoundingClientRect().top + window.scrollY - NAV_CLEARANCE;
  lenis.scrollTo(Math.max(0, y), { duration: reduce ? 0 : 1.2 });
});

export default lenis;
