import './scroll.js';
import { initNav } from './nav.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initMobileNav } from './mobilenav.js';

/* ------------------------------------------------------------------
   REDRAW LAB
   The seven vector studies, laid out as a comic page. Panel shapes
   repeat in a 5-beat rhythm so the page never reads as a plain grid.
------------------------------------------------------------------ */

const PANELS = [
  { file: 'gunter',    name: 'Gunter',     src: 'Adventure Time',              sfx: 'wenk',  note: '3 shapes' },
  { file: 'jake',      name: 'Jake',       src: 'Adventure Time',              sfx: 'stretch', note: 'one weight' },
  { file: 'jiji',      name: 'Jiji',       src: "Kiki's Delivery Service",     sfx: 'mrow',  note: 'silhouette only' },
  { file: 'shinchan',  name: 'Shinchan',   src: 'Crayon Shin-chan',            sfx: 'ohayo', note: 'flat fill' },
  { file: 'oggy',      name: 'Oggy',       src: 'Oggy and the Cockroaches',    sfx: 'ha',    note: 'curve control' },
  { file: 'bad-piggy', name: 'Pig',        src: 'Unfiled study',               sfx: 'oink',  note: 'from memory' },
];

/* the beat each panel is cut to — every row still adds up to 12 */
const SHAPES = ['a', 'b', 'c', 'd', 'f', 'f'];

const HASH = {
  gunter: 'bf9c7a', jake: '0a6194', jiji: 'ec68c2', shinchan: 'ca2604',
  oggy: '37b7aa', 'bad-piggy': '55fa04',
};

const esc = (s) => String(s).replace(/"/g, '&quot;');
const strip = document.querySelector('#strip');
const flat = [];

PANELS.forEach((p, i) => {
  const n = String(i + 1).padStart(2, '0');
  const mid = `assets/mid/${p.file}-${HASH[p.file]}.webp`;
  const full = `assets/Redraws/${p.file}.webp`;
  flat.push({ full, caption: `${p.name} — ${p.src}` });

  const fig = document.createElement('figure');
  fig.className = `panel panel--${SHAPES[i]} ${i % 2 ? 'panel--left' : ''}`;
  fig.innerHTML = `
    <span class="panel__n">${n}</span>
    <span class="panel__sfx">${esc(p.sfx)}</span>
    <button type="button" class="panel__art sheet" data-k="${i}" data-cursor="EXPAND"
            aria-label="Open the ${esc(p.name)} study full size">
      <img src="${esc(mid)}" alt="${esc(p.name)} — vector redraw study" loading="lazy" decoding="async">
    </button>
    <figcaption class="panel__cap">
      <span class="panel__name">${esc(p.name)}</span>
      <span class="panel__src">${esc(p.src)}</span>
      <span class="panel__note">${esc(p.note)}</span>
    </figcaption>`;
  strip.appendChild(fig);
});

const end = document.createElement('figure');
end.className = 'panel panel--end';
end.innerHTML = `
  <h2>To be continued</h2>
  <p>The set grows whenever a silhouette looks harder than it should. The rest of the
     illustration work — comics, vector series and icon systems — sits back in the category.</p>
  <a class="button-chip meta" href="category.html?c=illustrations" data-cursor="BACK">All illustrations &#8594;</a>`;
strip.appendChild(end);

/* ---------- panel art opens in the shared lightbox ---------- */
const box = document.querySelector('#lightbox');
const boxImg = box.querySelector('.lightbox__img');
const boxCap = box.querySelector('.lightbox__cap');
let at = 0;

function show(k) {
  at = (k + flat.length) % flat.length;
  boxImg.src = flat[at].full;
  boxImg.alt = flat[at].caption;
  boxImg.classList.add('is-sheet');   /* line art needs paper under it */
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

strip.addEventListener('click', (e) => {
  const b = e.target.closest('.panel__art');
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

/* ---------- reveal: panels print onto the page in reading order ------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce && window.gsap) {
  gsap.from('.comic-hero__title', { yPercent: 40, opacity: 0, duration: 0.8, ease: 'expo.out' });

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.panel').forEach((panel) => {
      gsap.from(panel, {
        opacity: 0, y: 26, duration: 0.7, ease: 'expo.out',
        scrollTrigger: { trigger: panel, start: 'top 88%' },
      });
    });
  }
}

/* masonry-ish heights settle once the art decodes */
const imgs = [...document.querySelectorAll('.panel__art img')];
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

/* ---------- cursor pill, same behaviour as the category pages --------- */
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
