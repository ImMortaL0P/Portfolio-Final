import './scroll.js';
import { initNav } from './nav.js';
import { posts, hrefOf } from './posts.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initMobileNav } from './mobilenav.js';

const slug = document.body.dataset.post;
const i = posts.findIndex((p) => p.slug === slug);

function pager() {
  const wire = (sel, p) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (!p) { el.remove(); return; }
    el.href = hrefOf(p.slug);
    el.querySelector('.post-pager__name').innerHTML = p.title;
    el.dataset.cursor = 'READ';
  };
  wire('.post-pager__prev', posts[i - 1]);
  wire('.post-pager__next', posts[i + 1]);
}

/* A hairline that fills as the article is read — the only chrome a
   long read needs. */
function progress() {
  const bar = document.createElement('div');
  bar.className = 'post-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  const article = document.querySelector('.post-body');
  if (!article) return;
  const update = () => {
    const r = article.getBoundingClientRect();
    const total = r.height - innerHeight * 0.5;
    const seen = -r.top + innerHeight * 0.5;
    bar.style.transform = `scaleX(${Math.max(0, Math.min(1, seen / Math.max(1, total)))})`;
  };
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  if (window.gsap) gsap.ticker.add(update);
}

document.addEventListener('DOMContentLoaded', () => {
  pager();
  progress();
  initNav();
  initMobileNav();
  initTheme();
  initContact();
  if (window.attachCursorEvents) window.attachCursorEvents();

  if (window.gsap && window.ScrollTrigger) {
    document
      .querySelectorAll('.post-text, .post-fig, .post-grid, .post-entry, .post-quote, .post-body > p')
      .forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 22,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
    ScrollTrigger.refresh();
  }
});
