import './scroll.js';
import { initNav } from './nav.js';
import { projects, order, hrefOf } from './projects.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initMobileNav } from './mobilenav.js';

const key = document.body.dataset.project;
const p = projects[key];

function render() {
  if (!p) return;

  const decode = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; };
  document.title = `${decode(p.title)} — K. Mangalam`;

  const set = (sel, html) => {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  };

  set('.proj-hero__n', p.n);
  set('.proj-hero__disc', p.discipline);
  set('.proj-hero__years', p.years);
  set('.proj-hero__title', p.title);
  set('.proj-hero__kicker', p.kicker);
  set('.proj-lede', p.lede);
  set('.proj-stack', p.stack.map((s) => `<li>${s}</li>`).join(''));

  const statsEl = document.querySelector('.proj-stats');
  if (statsEl && p.stats && p.stats.length) {
    statsEl.innerHTML = p.stats
      .map(([v, l]) => `<div class="proj-stat"><span class="proj-stat__v">${v}</span><span class="proj-stat__l meta">${l}</span></div>`)
      .join('');
  } else if (statsEl) {
    statsEl.remove();
  }

  // live demo button, when the project has something to click through to
  const liveWrap = document.querySelector('.proj-live');
  if (liveWrap && p.live) {
    liveWrap.innerHTML =
      `<a class="button-chip meta primary" href="${p.live.href}" target="_blank" rel="noopener" data-cursor="OPEN">${p.live.label} &#8599;</a>`;
  } else if (liveWrap) {
    liveWrap.remove();
  }

  // screenshots of the thing actually running
  const shotsEl = document.querySelector('.proj-shots');
  if (shotsEl && p.shots && p.shots.length) {
    shotsEl.innerHTML = p.shots
      .map((s, i) => `
        <figure class="proj-shot">
          <button type="button" class="proj-shot__btn" data-i="${i}" data-cursor="EXPAND" aria-label="Enlarge screenshot ${i + 1}">
            <img src="${s.src}" alt="${String(s.cap).replace(/<[^>]+>/g, '').replace(/"/g, '&quot;')}" loading="lazy" decoding="async">
          </button>
          <figcaption class="proj-shot__cap meta">${s.cap}</figcaption>
        </figure>`)
      .join('');
  } else if (shotsEl) {
    shotsEl.remove();
  }

  set(
    '.proj-body',
    p.sections
      .map((s, i) => `
        <section class="proj-block">
          <h2 class="proj-block__h">
            <span class="proj-block__n meta">${String(i + 1).padStart(2, '0')}</span>
            <span>${s.h}</span>
          </h2>
          <div class="proj-block__body">
            ${s.p.map((t) => `<p class="body-text">${t}</p>`).join('')}
            ${s.quote ? `<blockquote class="proj-quote">${s.quote}</blockquote>` : ''}
          </div>
        </section>`)
      .join('')
  );

  // prev / next through the engineering set. A page outside that set
  // (the work-history entries) gets no pager rather than a wrong one.
  const i = order.indexOf(key);
  const wire = (sel, k) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (!k) { el.remove(); return; }
    el.href = hrefOf(k);
    el.querySelector('.proj-pager__name').innerHTML = projects[k].title;
    el.dataset.cursor = 'READ';
  };
  wire('.proj-pager__prev', i < 0 ? null : order[i - 1]);
  wire('.proj-pager__next', i < 0 ? null : order[i + 1]);
}

/* Back always lands on the engineering section of the new site.
   If the visitor actually arrived from it, step back through history
   instead so their scroll position survives. */
function wireBack() {
  const back = document.querySelector('.proj-back');
  if (!back) return;

  /* the work-history pages are reached from the resume, so that is
     where back belongs for them */
  if (order.indexOf(key) < 0) {
    back.setAttribute('href', 'index.html#about');
    back.innerHTML = '&#8592; Resume';
  }

  back.addEventListener('click', (e) => {
    const ref = document.referrer;
    if (ref && new URL(ref, location.href).origin === location.origin && /\/(index\.html)?(\?|#|$)/.test(new URL(ref, location.href).pathname + location.search)) {
      e.preventDefault();
      history.back();
    }
  });
}

/* Screenshots are the evidence on these pages, so they need to open
   big — same lightbox behaviour as the work galleries. */
function lightbox() {
  const box = document.querySelector('#lightbox');
  const shots = (p && p.shots) || [];
  if (!box || !shots.length) return;
  const img = box.querySelector('.lightbox__img');
  const cap = box.querySelector('.lightbox__cap');
  let i = 0;

  const show = (n) => {
    i = (n + shots.length) % shots.length;
    img.src = shots[i].src;
    cap.innerHTML = shots[i].cap;
  };
  const open = (n) => { show(n); box.hidden = false; document.body.style.overflow = 'hidden'; };
  const close = () => { box.hidden = true; document.body.style.overflow = ''; };

  document.querySelectorAll('.proj-shot__btn').forEach((b) => {
    b.addEventListener('click', () => open(Number(b.dataset.i)));
  });
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(i - 1));
  box.querySelector('.lightbox__nav--next').addEventListener('click', () => show(i + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  wireBack();
  lightbox();
  if (window.attachCursorEvents) window.attachCursorEvents();
  initNav();
  initMobileNav();
  initTheme();
  initContact();

  if (window.gsap && window.ScrollTrigger) {
    gsap.from('.proj-block', {
      opacity: 0,
      y: 28,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '.proj-body', start: 'top 78%' },
    });
    gsap.from('.proj-stat', {
      opacity: 0,
      y: 18,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.06,
      scrollTrigger: { trigger: '.proj-stats', start: 'top 85%' },
    });
    ScrollTrigger.refresh();
  }
});
