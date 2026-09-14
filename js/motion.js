document.addEventListener('DOMContentLoaded', () => {

    /* --- 7.1 Hero --- */
    gsap.from('.hero-line', {
        yPercent: 115, duration: 0.9, stagger: 0.08,
        ease: 'expo.out', delay: 0.15
    });

    const subEl = document.querySelector('.hero-sub');
    if (subEl) {
        subEl.innerHTML = subEl.textContent.trim().split(/\s+/)
            .map(w => `<span class="word">${w}</span>`).join(' ');
        
        gsap.from('.hero-sub .word', {
            opacity: 0.25, duration: 0.5, stagger: 0.03,
            ease: 'power2.out', delay: 0.6
        });
    }


    /* --- 7.2 Nav --- */
    const nav = { logo: '.nav-logo', links: '.nav-links', cta: '.nav-cta' };
    ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: (self) => {
            const down = self.direction === 1 && self.scroll() > 120;
            gsap.to(nav.logo,  { xPercent: down ? -130 : 0, autoAlpha: down ? 0 : 1, duration: 0.55, ease: 'power3.out' });
            gsap.to(nav.links, { y: down ? -96 : 0, autoAlpha: down ? 0 : 1, duration: 0.55, ease: 'power3.out' });
            gsap.to(nav.cta,   { xPercent: down ? 130 : 0, autoAlpha: down ? 0 : 1, duration: 0.55, ease: 'power3.out' });
        }
    });

    /* --- 7.3 Services (Accordion) --- */
    document.querySelectorAll('.service').forEach((item) => {
        const panel = item.querySelector('.service__panel');
        const trigger = item.querySelector('.service__trigger');
        ScrollTrigger.create({
            trigger: item, start: 'top 62%', end: 'bottom 38%',
            onEnter: () => {
                gsap.to(panel, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out' });
                trigger.setAttribute('aria-expanded', 'true');
            },
            onLeave: () => {
                gsap.to(panel, { height: 0, opacity: 0, duration: 0.4 });
                trigger.setAttribute('aria-expanded', 'false');
            },
            onEnterBack: () => {
                gsap.to(panel, { height: 'auto', opacity: 1, duration: 0.5 });
                trigger.setAttribute('aria-expanded', 'true');
            },
            onLeaveBack: () => {
                gsap.to(panel, { height: 0, opacity: 0, duration: 0.4 });
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    /* --- 7.4 About Pin & Grow --- */
    if (document.querySelector('.about-section')) {
        gsap.timeline({
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top top',
                end: '+=750',
                pin: '.about__card',
                scrub: 0.6,
                anticipatePin: 1
            }
        })
        .fromTo('.about__card',
            { width: '40vw', height: '50vh', borderRadius: 'var(--r-panel)', top: '25vh' },
            { width: '100vw', height: '100vh', borderRadius: 0, top: 0, ease: 'none' }
        )
        .from('.about__content > *', { opacity: 0, y: 24, stagger: 0.08 }, 0.2);
    }

    /* --- 7.5 Lit Row Spotlight --- */
    document.querySelectorAll('.value-row').forEach((row) => {
        gsap.to(row.querySelector('.value-row__label'), {
            color: 'var(--on-dark-1)',
            ease: 'none',
            scrollTrigger: {
                trigger: row,
                start: 'top 62%', end: 'bottom 42%',
                toggleActions: 'play reverse play reverse'
            }
        });
    });

    /* --- 7.7 Cursor Pill --- */
    const pill = document.querySelector('.cursor-pill');
    if (pill && window.innerWidth > 600) {
        const xTo = gsap.quickTo(pill, 'x', { duration: 0.35, ease: 'power3' });
        const yTo = gsap.quickTo(pill, 'y', { duration: 0.35, ease: 'power3' });

        window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
        
        // Attaches cursor hover states
        window.attachCursorEvents = () => {
            document.querySelectorAll('[data-cursor]').forEach((el) => {
                // avoid attaching multiple times
                if (el.dataset.cursorAttached) return;
                el.dataset.cursorAttached = true;
                
                el.addEventListener('mouseenter', () => {
                    pill.textContent = el.dataset.cursor;
                    gsap.to(pill, { scale: 1, opacity: 1, duration: 0.2 });
                });
                el.addEventListener('mouseleave', () => gsap.to(pill, { scale: 0.4, opacity: 0, duration: 0.2 }));
            });
        };
        window.attachCursorEvents();
    }
});


/* --- 7.6 Work rows ---------------------------------------------------
   Hover (monochrome -> colour, strip grows) is pure CSS in sections.css:
   GPU-composited, no JS per frame, and it still works without JS.
   This only handles the at-rest reveal as each row scrolls in.        */
window.initWorkReveal = () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.work-category').forEach((cat) => {
    gsap.from(cat.querySelectorAll('.work-row'), {
      opacity: 0, y: 18, duration: 0.55, stagger: 0.06, ease: 'power2.out',
      scrollTrigger: { trigger: cat, start: 'top 82%', once: true }
    });
    gsap.from(cat.querySelector('.cat-header'), {
      opacity: 0, y: 14, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: cat, start: 'top 88%', once: true }
    });
  });
  if (window.attachCursorEvents) window.attachCursorEvents();
};

/* Back-compat: older markup called this. */
window.initWorkRowHover = () => window.initWorkReveal && window.initWorkReveal();
