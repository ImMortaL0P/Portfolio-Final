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

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* Anchor links route through Lenis so in-page jumps are eased too */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (!id || id === '#') return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  lenis.scrollTo(target, { offset: -96, duration: reduce ? 0 : 1.25 });
});

export default lenis;
