/* Lenis — lerp-based smoothing reads smoother on a trackpad than
   duration-based, and survives fast flicks without overshoot.

   Lenis and GSAP come from CDNs. If either fails to arrive (an outage, a
   content blocker) this module must not throw: every page script imports
   it first, so an exception here would take the whole page down with it.
   Without them the page simply scrolls natively. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const smooth = typeof window.Lenis === 'function' && !!window.gsap;

const lenis = smooth ? new Lenis({
  lerp: reduce ? 1 : 0.085,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.5,
  syncTouch: true,
  syncTouchLerp: 0.09,
  gestureOrientation: 'vertical',
  autoToggle: true
}) : null;
/* exposed so the footer's back-to-top can use the same easing */
window.lenis = lenis;

if (lenis) {
  if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const scrollToY = (y, immediate) => {
  if (lenis) lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: reduce ? 0 : 1.2 });
  else window.scrollTo({ top: y, behavior: immediate || reduce ? 'auto' : 'smooth' });
};

/* THE scroll bug: Lenis caches the document height once. The work list is
   rendered by JS and ScrollTrigger then inserts pin-spacers, so the real
   page grew to ~10,250px while Lenis still clamped at ~5,670 — the page
   simply stopped scrolling partway down. Re-measure whenever the document
   changes size, and on every ScrollTrigger refresh. */
let resizeTimer = 0;
const remeasure = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => lenis && lenis.resize(), 60);   /* not rAF: that is
    throttled to nothing in a background tab, and the limit must be right
    the moment the tab comes back */
};
if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', remeasure);
new ResizeObserver(remeasure).observe(document.body);
addEventListener('load', () => {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
  if (lenis) lenis.resize();
  arriveAtHash();
  /* images and fonts land after `load` on a cold cache, so sweep once more */
  if (lenis) [200, 800, 2000].forEach((t) => setTimeout(() => lenis.resize(), t));
});
document.addEventListener('DOMContentLoaded', () => setTimeout(() => lenis && lenis.resize(), 120));

/* Arriving from another page on index.html#work (every subpage nav links
   that way): the browser jumps before the work list is rendered and before
   the pinned resume adds its spacer, so it lands in the wrong place. Once
   layout has settled, put the target under the nav where it belongs. */
function arriveAtHash() {
  const id = decodeURIComponent(location.hash || '');
  if (id.length < 2) return;
  const target = document.getElementById(id.slice(1));
  if (!target) return;
  scrollToY(Math.max(0, targetY(target)), true);
}

/* Anchor links route through Lenis.
   Lenis' own element targeting uses offsetTop, which is wrong once
   ScrollTrigger has inserted pin-spacers above the target — that's why
   jumps landed past the section. Measure the live position instead. */
const NAV_CLEARANCE = 104;

/* Where a jump to `el` should land. A pinned section (the resume card)
   plays its reveal across the pin, so its top is the half-drawn frame:
   land at the end of the pin, where the content is fully shown. */
const targetY = (el) => {
  const st = window.ScrollTrigger && ScrollTrigger.getAll().find((t) => t.pin && t.trigger === el);
  if (st) return st.end;
  return el.getBoundingClientRect().top + window.scrollY - NAV_CLEARANCE;
};

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (!id || id === '#') return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();

  if (window.ScrollTrigger) ScrollTrigger.refresh();
  scrollToY(Math.max(0, targetY(target)));
});

export default lenis;
