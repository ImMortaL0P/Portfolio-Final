/* ------------------------------------------------------------------
   Nav behaviour, shared by the home page and every category page.
   Three independently fixed elements that disperse on scroll down and
   reassemble on scroll up, a blurred scrim behind them once assembled,
   and a contrast flip over dark grounds.
------------------------------------------------------------------ */
export function initNav() {
  const logo = document.querySelector('.nav-logo');
  const links = document.querySelector('.nav-links');
  const cta = document.querySelector('.nav-cta');
  if (!logo) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- disperse / reassemble ---- */
  let lastY = window.scrollY;
  let dispersed = null;

  const setDispersed = (down) => {
    if (down === dispersed) return;
    dispersed = down;
    document.body.classList.toggle('nav-visible', !down && window.scrollY > 120);
    document.body.classList.toggle('nav-hidden', down);
    if (!window.gsap) return;
    const d = reduce ? 0 : 0.55;
    gsap.to(logo,  { xPercent: down ? -130 : 0, autoAlpha: down ? 0 : 1, duration: d, ease: 'power3.out' });
    if (links) gsap.to(links, { y: down ? -96 : 0, autoAlpha: down ? 0 : 1, duration: d, ease: 'power3.out' });
    if (cta)   gsap.to(cta,   { xPercent: down ? 130 : 0, autoAlpha: down ? 0 : 1, duration: d, ease: 'power3.out' });
  };

  /* ---- contrast over dark grounds ---- */
  const NAV_Y = 56;
  const card = document.querySelector('.about__card');
  let wasDark = null;

  /* read the palette rather than hardcoding it, so the flip is correct
     in either theme: over a dark section the nav always goes light, and
     over the page ground it takes whatever --ink currently is */
  const token = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  const setDark = (dark, force) => {
    if (dark === wasDark && !force) return;
    wasDark = dark;
    document.body.classList.toggle('nav-on-dark', dark);

    const onDark = token('--on-dark-1') || '#EBE9E4';
    const onGround = token('--ink') || '#111111';
    const panel = token('--panel') || '#111111';
    const invert = token('--surface-invert') || '#EBE9E4';

    logo.style.color = dark ? onDark : onGround;
    if (cta) {
      cta.style.color = dark ? onDark : onGround;
      cta.style.borderColor = dark ? onDark : onGround;
    }
    if (links) {
      links.style.background = dark ? invert : panel;
      links.querySelectorAll('a').forEach((a) => { a.style.color = dark ? panel : invert; });
    }
  };

  const update = () => {
    const y = window.scrollY;

    /* scroll direction, with a dead zone so a jitter doesn't flip it */
    if (Math.abs(y - lastY) > 4) {
      setDispersed(y > lastY && y > 120);
      lastY = y;
    }
    /* keep the scrim honest even when direction hasn't changed */
    document.body.classList.toggle('nav-visible', dispersed === false && y > 120);

    const vw = document.documentElement.clientWidth;
    let dark = false;
    document.querySelectorAll('.section--dark, .about__card').forEach((el) => {
      if (dark) return;
      const r = el.getBoundingClientRect();
      if (r.top <= NAV_Y && r.bottom >= NAV_Y && r.left <= 8 && r.right >= vw - 8) dark = true;
    });
    setDark(dark);
  };

  update();
  if (window.gsap) gsap.ticker.add(update);
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', update);
  /* the inline colours above are painted from tokens, so they have to be
     repainted when the tokens change */
  addEventListener('themechange', () => setDark(wasDark === true, true), { passive: true });

  /* returned so the behaviour can be driven directly in a headless or
     background tab, where neither scroll events nor rAF fire */
  return update;
}
