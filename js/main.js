import './scroll.js';
import './motion.js';
import { workCategories } from './data.js';
import { initGenreEngine } from './genre.js';

const esc = (s) => String(s).replace(/"/g, '&quot;');

/* Build one work row: meta · title · always-visible greyscale strip · icon */
function buildRow(item) {
  const a = document.createElement('a');
  a.className = 'work-row' + (item.live ? ' work-row--live' : '');
  a.href = item.href;
  if (item.live) { a.target = '_blank'; a.rel = 'noopener'; }
  a.dataset.cursor = item.live ? 'VISIT' : 'VIEW';

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
    <span class="work-row__icon" aria-hidden="true">${item.live ? '&#8599;' : '&#8594;'}</span>`;
  return a;
}

function buildCategory(cat) {
  const wrap = document.createElement('section');
  wrap.className = 'work-category';
  wrap.id = 'cat-' + cat.category.toLowerCase().replace(/[^a-z]+/g, '-');

  const head = document.createElement('div');
  head.className = 'cat-header';
  head.innerHTML = `
    <span class="cat-header__n meta">${cat.n}</span>
    <h3 class="cat-header__title display-l">${cat.category}</h3>
    <span class="cat-header__tags meta">${cat.tags}</span>
    <span class="cat-header__count meta">${cat.items.length} ${cat.items.length === 1 ? 'series' : 'series'}</span>`;
  wrap.appendChild(head);

  const list = document.createElement('div');
  list.className = 'cat-items';
  cat.items.forEach((item) => list.appendChild(buildRow(item)));
  wrap.appendChild(list);
  return wrap;
}

document.addEventListener('DOMContentLoaded', () => {
  const workList = document.querySelector('.work-list');
  if (workList) {
    workCategories.forEach((cat) => workList.appendChild(buildCategory(cat)));
  }
  initGenreEngine();
  if (window.attachCursorEvents) window.attachCursorEvents();
  if (window.initWorkReveal) window.initWorkReveal();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});
