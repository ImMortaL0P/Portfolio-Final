import './scroll.js';
import { initNav } from './nav.js';
import { posts, hrefOf } from './posts.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initMobileNav } from './mobilenav.js';

const esc = (s) => String(s).replace(/"/g, '&quot;');

function row(p) {
  const thumb = p.cover
    ? `<img class="writ-row__thumb" src="${esc(p.cover)}" alt="" loading="lazy" decoding="async">`
    : '<span class="writ-row__thumb" aria-hidden="true"></span>';
  return `
    <a class="writ-row" href="${hrefOf(p.slug)}" data-kind="${esc(p.kind)}" data-cursor="READ">
      <span class="writ-row__meta meta">
        <span class="writ-row__kind">${p.kind}</span>
        <span class="writ-row__date">${p.date}</span>
        <span class="writ-row__read">${p.read} min</span>
      </span>
      <span class="writ-row__body">
        <h2 class="writ-row__title">${p.title}</h2>
        <span class="writ-row__ex">${p.excerpt}</span>
      </span>
      ${thumb}
    </a>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.writ-list');
  if (list) list.innerHTML = posts.map(row).join('');

  const count = document.querySelector('.writ-count');
  if (count) count.textContent = `${posts.length} pieces`;

  /* filter chips, built from the kinds actually present */
  const kinds = [...new Set(posts.map((p) => p.kind))];
  const bar = document.querySelector('.writ-filters');
  if (bar) {
    bar.innerHTML = ['All', ...kinds]
      .map((k, n) => `<button class="writ-filter meta" type="button" data-k="${esc(k)}" aria-pressed="${n === 0}">${k}</button>`)
      .join('');
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('.writ-filter');
      if (!b) return;
      bar.querySelectorAll('.writ-filter').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const k = b.dataset.k;
      list.querySelectorAll('.writ-row').forEach((r) => {
        r.hidden = k !== 'All' && r.dataset.kind !== k;
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  initNav();
  initMobileNav();
  initTheme();
  initContact();
  if (window.attachCursorEvents) window.attachCursorEvents();

  if (window.gsap && window.ScrollTrigger) {
    gsap.from('.writ-row', {
      opacity: 0, y: 26, duration: 0.7, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: '.writ-list', start: 'top 85%' },
    });
    ScrollTrigger.refresh();
  }
});
