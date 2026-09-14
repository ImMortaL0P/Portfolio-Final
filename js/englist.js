import './scroll.js';
import { initNav } from './nav.js';
import { projects, order, hrefOf } from './projects.js';
import { papers, hrefOfPaper } from './papers.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initMobileNav } from './mobilenav.js';

document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.eng-list');
  if (list) {
    list.innerHTML = order
      .map((k) => {
        const p = projects[k];
        return `
        <a class="eng-row" href="${hrefOf(k)}" data-cursor="READ">
          <span class="eng-row__meta meta">${p.years} &middot; ${p.discipline}</span>
          <span class="eng-row__body">
            <h3 class="eng-row__title">${p.title}</h3>
            <span class="eng-row__note">${p.lede}</span>
            <span class="eng-row__stack meta">${p.stack.join(' &middot; ')}</span>
          </span>
          <span class="eng-row__icon" aria-hidden="true">&#8594;</span>
        </a>`;
      })
      .join('');
  }

  /* The index carries the summary and a few figures only. Everything
     else — charts, captions, detail — lives on the paper's own page. */
  const paperList = document.querySelector('.paper-list');
  if (paperList) {
    paperList.innerHTML = papers
      .map(
        (p, i) => `
        <a class="paper-row" href="${hrefOfPaper(p.slug)}" data-cursor="READ">
          <span class="paper-row__n meta">${String(i + 1).padStart(2, '0')}</span>
          <span class="paper-row__body">
            <span class="paper-row__meta meta">
              <span class="paper-row__venue">${p.venue}</span>
              <span>${p.year}</span>
              ${p.status ? `<span class="paper__status">${p.status}</span>` : ''}
            </span>
            <h3 class="paper-row__title">${p.title}</h3>
            <span class="paper-row__authors meta">${p.authors}</span>
            <span class="paper-row__summary">${p.summary}</span>
            <span class="paper-row__hints">
              ${p.hints.map(([v, l]) => `<span class="paper-row__hint"><span class="paper-row__hint-v">${v}</span><span class="paper-row__hint-l meta">${l}</span></span>`).join('')}
            </span>
          </span>
          <span class="eng-row__icon" aria-hidden="true">&#8594;</span>
        </a>`
      )
      .join('');
  }

  const count = document.querySelector('.eng-count');
  if (count) count.textContent = `${order.length} projects · ${papers.length} papers`;

  initNav();
  initMobileNav();
  initTheme();
  initContact();
  if (window.attachCursorEvents) window.attachCursorEvents();

  if (window.gsap && window.ScrollTrigger) {
    gsap.from('.eng-row', {
      opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: '.eng-list', start: 'top 82%' },
    });
    gsap.from('.paper-row', {
      opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: '.paper-list', start: 'top 84%' },
    });
    ScrollTrigger.refresh();
  }
});
