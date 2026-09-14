/* ------------------------------------------------------------------
   Scroll layers. Each of these earns its place by carrying meaning —
   a heading arriving, a number counting to itself, the reader's
   position in a long page. Nothing moves purely to move.
------------------------------------------------------------------- */

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- a hairline that fills as the page is read ---- */
export function initProgress() {
  if (document.querySelector('.scroll-progress')) return;
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  if (window.gsap) gsap.ticker.add(update);
}

/* ---- section headings arrive a word at a time ---- */
export function initHeadingReveal() {
  if (!window.gsap || !window.ScrollTrigger || reduce()) return;

  document.querySelectorAll('[data-reveal-words]').forEach((el) => {
    if (el.dataset.revealed) return;
    el.dataset.revealed = '1';
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="rv"><span class="rv__i">${w}</span></span>`)
      .join(' ');
    gsap.from(el.querySelectorAll('.rv__i'), {
      yPercent: 108,
      duration: 0.75,
      ease: 'expo.out',
      stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });
}

/* ---- the hero facts count to their own value ---- */
export function initFactCounters() {
  const cells = document.querySelectorAll('.hero-facts dd');
  if (!cells.length) return;

  cells.forEach((dd) => {
    const raw = dd.textContent.trim();
    const target = parseInt(raw, 10);
    if (Number.isNaN(target)) return;
    const pad = raw.length;
    const isYear = target > 1900;

    if (reduce() || !window.gsap) return;

    const from = isYear ? target - 9 : 0;
    const o = { v: from };
    dd.textContent = String(from).padStart(pad, '0');

    gsap.to(o, {
      v: target,
      duration: isYear ? 1.4 : 1.1,
      ease: 'power2.out',
      delay: 0.5,
      onUpdate: () => { dd.textContent = String(Math.round(o.v)).padStart(pad, '0'); },
    });
  });
}

/* ---- slow drift on the client marks as they pass ---- */
export function initClientDrift() {
  const row = document.querySelector('.client-row');
  if (!row || !window.gsap || !window.ScrollTrigger || reduce()) return;
  gsap.fromTo(
    row.querySelectorAll('li'),
    { y: 22, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.09,
      scrollTrigger: { trigger: row, start: 'top 92%' },
    }
  );
}

/* ---- the start cards deal in like a hand of cards ---- */
export function initStartCards() {
  const grid = document.querySelector('.start__grid');
  if (!grid || !window.gsap || !window.ScrollTrigger || reduce()) return;
  gsap.from(grid.querySelectorAll('.start__card'), {
    opacity: 0,
    y: 34,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.09,
    scrollTrigger: { trigger: grid, start: 'top 84%' },
  });
}

/* ---- the process rows light up as they reach the middle ---- */
export function initProcessRows() {
  const rows = document.querySelectorAll('.process-row');
  if (!rows.length || !window.gsap || !window.ScrollTrigger) return;
  rows.forEach((row) => {
    const label = row.querySelector('.value-row__label');
    const body = row.querySelector('.process-row__body');
    ScrollTrigger.create({
      trigger: row,
      start: 'top 72%',
      end: 'bottom 34%',
      onToggle: (self) => {
        row.classList.toggle('is-lit', self.isActive);
        if (reduce() || !label) return;
        gsap.to(label, {
          color: self.isActive ? 'var(--on-dark-1)' : 'var(--on-dark-dim)',
          x: self.isActive ? 10 : 0,
          duration: 0.5,
          ease: 'power2.out',
        });
        if (body) gsap.to(body, { opacity: self.isActive ? 1 : 0.5, duration: 0.5 });
      },
    });
  });
}

/* ---- footer: live local time, and back to top ---- */
export function initFooter() {
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const tick = () => {
      clock.textContent = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }).format(new Date());
    };
    tick();
    setInterval(tick, 30000);
  }

  document.querySelectorAll('[data-top]').forEach((b) => {
    b.addEventListener('click', () => {
      if (window.lenis) window.lenis.scrollTo(0, { duration: 1.1 });
      else scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' });
    });
  });

  const mark = document.querySelector('.footer-wordmark span');
  if (mark && window.gsap && window.ScrollTrigger && !reduce()) {
    gsap.fromTo(mark, { yPercent: 30 }, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: 0.5 },
    });
  }
}

export function initLayers() {
  initProgress();
  initHeadingReveal();
  initFactCounters();
  initClientDrift();
  initStartCards();
  initProcessRows();
  initFooter();
}
