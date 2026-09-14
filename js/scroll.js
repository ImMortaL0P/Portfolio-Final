const lenis = new Lenis({ duration: 1.1, smoothWheel: true, autoToggle: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
export default lenis;
