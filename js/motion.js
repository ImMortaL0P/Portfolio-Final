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


    /* Nav lives in js/nav.js now — shared with the category pages. */

    /* --- 7.3 Services (Accordion) --- */
    const reduceMo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMo) {
        document.querySelectorAll('.service__panel').forEach((p) => {
            p.style.height = 'auto'; p.style.opacity = '1';
        });
    } else
    document.querySelectorAll('.service').forEach((item) => {
        const panel = item.querySelector('.service__panel');
        ScrollTrigger.create({
            trigger: item, start: 'top 62%', end: 'bottom 38%',
            onEnter: () => {
                gsap.to(panel, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out' });
            },
            onLeave: () => {
                gsap.to(panel, { height: 0, opacity: 0, duration: 0.4 });
            },
            onEnterBack: () => {
                gsap.to(panel, { height: 'auto', opacity: 1, duration: 0.5 });
            },
            onLeaveBack: () => {
                gsap.to(panel, { height: 0, opacity: 0, duration: 0.4 });
            }
        });
    });

    /* --- 7.3b FAQ (click accordion) ---
       The services panels open on scroll; the FAQ is a real accordion
       and needs a click handler, which was never wired up. */
    document.querySelectorAll('.faq').forEach((item) => {
        const trigger = item.querySelector('.faq__trigger');
        const panel = item.querySelector('.faq__panel');
        const icon = item.querySelector('.row__icon');
        if (!trigger || !panel) return;

        const setOpen = (open) => {
            trigger.setAttribute('aria-expanded', String(open));
            item.classList.toggle('is-open', open);
            if (icon) icon.textContent = open ? '−' : '+';
            if (reduceMo) {
                panel.style.height = open ? 'auto' : '0';
                panel.style.opacity = open ? '1' : '0';
                if (window.ScrollTrigger) ScrollTrigger.refresh();
                return;
            }
            gsap.to(panel, {
                height: open ? 'auto' : 0,
                opacity: open ? 1 : 0,
                duration: open ? 0.45 : 0.35,
                ease: 'power2.out',
                onComplete: () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); }
            });
        };

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const open = trigger.getAttribute('aria-expanded') !== 'true';
            /* one answer at a time — the section stays readable */
            if (open) {
                document.querySelectorAll('.faq.is-open').forEach((other) => {
                    if (other !== item) other.querySelector('.faq__trigger')?.click();
                });
            }
            setOpen(open);
        });

        setOpen(false);
    });

    /* --- 7.4 About Pin & Grow ---
       The grow-from-a-card effect needs width to read, and a 100vh pinned
       card cannot hold this much content on a phone. Below 900px the
       section simply flows; matchMedia means crossing the breakpoint
       cleans the pin up after itself. */
    if (document.querySelector('.about-section')) {
        ScrollTrigger.matchMedia({
            '(min-width: 901px)': function () {
                gsap.timeline({
                    scrollTrigger: {
                        trigger: '.about-section',
                        start: 'top top',
                        end: '+=750',
                        pin: '.about__pin',
                        scrub: 0.6,
                        anticipatePin: 1
                    }
                })
                .fromTo('.about__card',
                    { width: '52vw', height: '56vh', borderRadius: 'var(--r-panel)' },
                    { width: '100vw', height: '100vh', borderRadius: 0, ease: 'none' }
                )
                .from('.about__inner > *', { opacity: 0, y: 24, stagger: 0.1 }, 0.25);
            },
            '(max-width: 900px)': function () {
                /* reveal the blocks on their own as they arrive instead */
                gsap.from('.about__inner > *', {
                    opacity: 0, y: 20, duration: 0.6, stagger: 0.08, ease: 'power3.out',
                    scrollTrigger: { trigger: '.about-section', start: 'top 78%' }
                });
            }
        });
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


