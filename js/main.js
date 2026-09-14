import './scroll.js';
import './motion.js';
import { workCategories } from './data.js';
import { initGenreEngine } from './genre.js';
import { initNav } from './nav.js';
import { initCtaBg } from './ctabg.js';
import { scrambleTo } from './scramble.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initLayers } from './layers.js';
import { initMobileNav } from './mobilenav.js';

const esc = (s) => String(s).replace(/"/g, '&quot;');

/* Build one work row: meta · title · always-visible greyscale strip · icon */
function buildRow(item) {
  const a = document.createElement('a');
  a.className = 'work-row' + (item.live ? ' work-row--live' : '');
  a.href = item._href;
  a.dataset.cursor = 'VIEW';

  const shots = (item.shots || []).slice(0, 4).map((src, i) => `
    <span class="shot" style="--i:${i}">
      <img src="${esc(src)}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="320" height="213">
    </span>`).join('');

  a.innerHTML = `
    <span class="work-row__meta meta">${item.year} &middot; ${item.kind}</span>
    <span class="work-row__title-wrap">
      <h4 class="work-row__title display-h3">${item.title}</h4>
      ${item.note ? `<span class="work-row__note">${item.note}</span>` : ''}
    </span>
    <span class="work-row__strip" aria-hidden="true">${shots}</span>
    <span class="work-row__icon" aria-hidden="true">&#8594;</span>`;
  return a;
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

function buildCategory(cat) {
  const cslug = slugify(cat.category);
  const wrap = document.createElement('section');
  wrap.className = 'work-category';
  wrap.id = 'cat-' + cslug;

  const head = document.createElement('div');
  head.className = 'cat-header';
  head.innerHTML = `
    <span class="cat-header__meta">
      <span class="cat-header__n meta">${cat.n}</span>
      <span class="meta">${cat.tags}</span>
    </span>
    <span class="cat-header__count meta">${cat.items.length} ${cat.items.length === 1 ? 'series' : 'series'}</span>
    <h3 class="cat-header__title display-l"><a href="category.html?c=${cslug}" data-cursor="OPEN">${cat.category}</a></h3>`;
  wrap.appendChild(head);

  const list = document.createElement('div');
  list.className = 'cat-items';
  cat.items.forEach((item) => {
    item._href = `category.html?c=${cslug}#${slugify(item.title)}`;
    list.appendChild(buildRow(item));
  });
  wrap.appendChild(list);
  return wrap;
}


/* ------------------------------------------------------------------
   About / Resume — the "currently working in" panel.
   Real category data, cycled, with the word scrambling into place.
------------------------------------------------------------------ */
function initAboutTicker() {
  const host = document.querySelector('.about__now');
  if (!host) return;
  const word = host.querySelector('.about__now-word');
  const index = host.querySelector('.about__now-index');
  const tags = host.querySelector('.about__now-tags');
  const rail = host.querySelector('.about__rail');

  rail.innerHTML = workCategories.map(() => '<li><span></span></li>').join('');
  const fills = [...rail.querySelectorAll('span')];

  const DUR = 3200;
  let i = -1, start = 0, raf = 0;

  const show = (k) => {
    const c = workCategories[k];
    scrambleTo(word, c.category);
    index.textContent = `${c.n} / 08`;
    tags.textContent = c.tags;
  };

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (!start) start = now;
    const t = (now - start) / DUR;
    if (t >= 1 || i < 0) { i = (i + 1) % workCategories.length; start = now; show(i); }
    fills.forEach((f, j) => {
      f.style.transform = `scaleX(${j < i ? 1 : j === i ? Math.min(1, t) : 0})`;
    });
  };

  /* only run while the section is on screen */
  new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting && !raf) { start = 0; raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    });
  }, { threshold: 0.1 }).observe(host);

  show(0); i = 0;
}

document.addEventListener('DOMContentLoaded', () => {
  const workList = document.querySelector('.work-list');
  if (workList) {
    workCategories.forEach((cat) => workList.appendChild(buildCategory(cat)));
  }
  initGenreEngine();
  initAboutTicker();
  if (window.attachCursorEvents) window.attachCursorEvents();
  if (window.initWorkReveal) window.initWorkReveal();
  initNav();
  initMobileNav();
  initTheme();
  initContact();
  initLayers();
  initCtaBg();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});
