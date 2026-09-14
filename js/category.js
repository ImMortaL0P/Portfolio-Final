import './scroll.js';
import { workCategories } from './data.js';
import { showcase } from './showcase.js';
import { initNav } from './nav.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initMobileNav } from './mobilenav.js';

const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => String(s).replace(/"/g, '&quot;');

const params = new URLSearchParams(location.search);
const want = params.get('c') || slug(workCategories[0].category);
const idx = Math.max(0, workCategories.findIndex((c) => slug(c.category) === want));
const cat = workCategories[idx];

/* ---------- header ---------- */
document.title = `${cat.category} — K. Mangalam`;
document.querySelector('.cat-hero__n').textContent = `${cat.n} / ${String(workCategories.length).padStart(2, '0')}`;
document.querySelector('.cat-hero__tags').textContent = cat.tags;
const isShowcase = cat.items.every((i) => showcase[slug(i.title)]);
document.querySelector('.cat-hero__count').textContent = isShowcase
  ? `${cat.items.length} products · designed + built`
  : `${cat.items.length} series · ${cat.items.reduce((a, i) => a + (i.mid || i.shots).length, 0)} pieces`;
document.querySelector('.cat-hero__title').textContent = cat.category;

/* ---------- Websites renders as a product showcase, not a gallery ---------- */
function buildShowcase(item) {
  const sc = showcase[slug(item.title)];
  if (!sc) return null;

  const sec = document.createElement('section');
  sec.className = 'product';
  sec.id = slug(item.title);

  const feats = sc.features.map((f) => `
    <article class="feat">
      <div class="feat__text">
        <span class="feat__n meta">${f.n}</span>
        <h3 class="feat__title">${f.t}</h3>
        <p class="feat__note">${f.d}</p>
      </div>
      <figure class="feat__shot">
        <img src="${esc(f.shot)}" alt="${esc(f.t)}" loading="lazy" decoding="async"
             onerror="this.closest('.feat__shot').classList.add('is-missing')">
        <figcaption class="meta">Screenshot pending</figcaption>
      </figure>
    </article>`).join('');

  sec.innerHTML = `
    <header class="product__head">
      <p class="product__meta meta">
        <span>${sc.year} &middot; ${sc.kind}</span>
        <span class="product__stack">${sc.stack.join(' &middot; ')}</span>
      </p>
      <h2 class="product__title">${sc.title}</h2>
      <p class="product__full meta">${sc.full}</p>
      <p class="product__lede">${sc.lede}</p>
      <a class="button-chip meta product__visit" href="${esc(sc.href)}" target="_blank" rel="noopener" data-cursor="VISIT">Visit live site &#8599;</a>
    </header>

    <figure class="product__hero">
      <img src="${esc(sc.hero)}" alt="${esc(sc.title)} — home screen" loading="lazy" decoding="async">
    </figure>

    <div class="product__feats">${feats}</div>`;
  return sec;
}

/* ---------- series ---------- */
const host = document.querySelector('#series');
const flat = [];   /* every image on the page, for the lightbox */

cat.items.forEach((item) => {
  const product = buildShowcase(item);
  if (product) { host.appendChild(product); return; }

  const mids = item.mid || item.shots;
  const fulls = item.full || item.shots;
  const sec = document.createElement('section');
  sec.className = 'series';
  sec.id = slug(item.title);

  const figures = mids.map((src, i) => {
    const k = flat.length;
    flat.push({ full: fulls[i] || src, caption: `${item.title} — ${i + 1} / ${mids.length}` });
    return `
      <figure class="series__shot" style="--i:${i}">
        <button type="button" class="series__open" data-k="${k}" data-cursor="EXPAND"
                aria-label="Open ${esc(item.title)} image ${i + 1} full size">
          <img src="${esc(src)}" alt="${esc(item.title)} — piece ${i + 1}" loading="lazy" decoding="async">
        </button>
      </figure>`;
  }).join('');

  sec.innerHTML = `
    <div class="series__head">
      <p class="series__meta meta">${item.year} &middot; ${item.kind}</p>
      <h2 class="series__title">${item.title}</h2>
      ${item.note ? `<p class="series__note">${item.note}</p>` : ''}
      ${item.live ? `<a class="button-chip meta series__live" href="${esc(item.href)}" target="_blank" rel="noopener" data-cursor="VISIT">Visit live site &#8599;</a>` : ''}
      ${item.video ? `<a class="button-chip meta series__live" href="${esc(item.video)}" target="_blank" rel="noopener" data-cursor="PLAY">Watch the reel &#8599;</a>` : ''}
    </div>
    <div class="series__grid">${figures}</div>`;
  host.appendChild(sec);
});

/* ---------- pager ---------- */
const prev = workCategories[(idx - 1 + workCategories.length) % workCategories.length];
const next = workCategories[(idx + 1) % workCategories.length];
const pPrev = document.querySelector('.cat-pager__prev');
const pNext = document.querySelector('.cat-pager__next');
pPrev.href = `category.html?c=${slug(prev.category)}`;
pNext.href = `category.html?c=${slug(next.category)}`;
pPrev.querySelector('.cat-pager__name').textContent = prev.category;
pNext.querySelector('.cat-pager__name').textContent = next.category;

/* ---------- lightbox ---------- */
const box = document.querySelector('#lightbox');
const boxImg = box.querySelector('.lightbox__img');
const boxCap = box.querySelector('.lightbox__cap');
let at = 0;

function show(k) {
  at = (k + flat.length) % flat.length;
  boxImg.src = flat[at].full;
  boxImg.alt = flat[at].caption;
  boxCap.textContent = flat[at].caption;
}
function open(k) {
  show(k);
  box.hidden = false;
  document.documentElement.style.overflow = 'hidden';
  box.querySelector('.lightbox__close').focus();
}
function close() {
  box.hidden = true;
  boxImg.removeAttribute('src');
  document.documentElement.style.overflow = '';
}

host.addEventListener('click', (e) => {
  const b = e.target.closest('.series__open');
  if (b) open(+b.dataset.k);
});
box.querySelector('.lightbox__close').addEventListener('click', close);
box.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(at - 1));
box.querySelector('.lightbox__nav--next').addEventListener('click', () => show(at + 1));
box.addEventListener('click', (e) => { if (e.target === box) close(); });
document.addEventListener('keydown', (e) => {
  if (box.hidden) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') show(at - 1);
  if (e.key === 'ArrowRight') show(at + 1);
});

/* ---------- reveal + cursor ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce && window.gsap) {
  gsap.from('.cat-hero__title', { yPercent: 40, opacity: 0, duration: 0.8, ease: 'expo.out' });
}

/* Masonry heights only become real once images decode, so let ScrollTrigger
   re-measure after the last one lands. No opacity gating: nothing on a detail
   page should be able to get stranded invisible. */
const imgs = [...document.querySelectorAll('.series__open img')];
let settled = 0;
const done = () => {
  if (++settled === imgs.length && window.ScrollTrigger) ScrollTrigger.refresh();
};
imgs.forEach((img) => {
  if (img.complete && img.naturalWidth) done();
  else {
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }
});

const pill = document.querySelector('.cursor-pill');
if (pill && matchMedia('(hover: hover)').matches && window.gsap) {
  const xTo = gsap.quickTo(pill, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(pill, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-cursor]');
    if (el) { pill.textContent = el.dataset.cursor; gsap.to(pill, { scale: 1, opacity: 1, duration: 0.2 }); }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-cursor]')) gsap.to(pill, { scale: 0.4, opacity: 0, duration: 0.2 });
  });
}

initNav();
initMobileNav();
initTheme();
initContact();
