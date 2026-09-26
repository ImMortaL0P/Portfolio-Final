/* ------------------------------------------------------------------
   All Work — the store.

   Every piece in one grid, narrowed with checkbox filters (category,
   series, year, prints), a search box and a sort, the way a shop
   catalogue works. State lives in the URL so a filtered view can be
   shared or bookmarked, and back/forward restores it.

   Desktop: filters sit in a sticky sidebar and apply as you tick.
   Mobile: they move into a bottom sheet with a "Show N results" button.
------------------------------------------------------------------- */
import './scroll.js';
import { initSite } from './site.js';
import { pieces, categories, POSTER_CATEGORY } from './catalog.js';
import { cart, initCartUI, toast, BAG } from './cart.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (s, r = document) => r.querySelector(s);

const grid = $('.store__grid');
const groups = $('.store__groups');
const chips = $('.store__chips');
const count = $('.store__count');
const empty = $('.store__empty');
const search = $('.store__search input');
const sortSel = $('.store__sort select');
const panel = $('.store__filters');
const filterBtn = $('.store__filter-btn');
const sheetMQ = matchMedia('(max-width: 899.98px)');

/* ---------------- state ---------------- */
const state = { cats: new Set(), series: new Set(), years: new Set(), print: false, q: '', sort: 'featured' };

function readURL() {
  const p = new URLSearchParams(location.search);
  const list = (k) => (p.get(k) || '').split(',').filter(Boolean);
  state.cats = new Set(list('c'));
  state.series = new Set(list('s'));
  state.years = new Set(list('y'));
  state.print = p.get('print') === '1';
  state.q = p.get('q') || '';
  state.sort = p.get('sort') || 'featured';
}
function writeURL() {
  const p = new URLSearchParams();
  if (state.cats.size) p.set('c', [...state.cats].join(','));
  if (state.series.size) p.set('s', [...state.series].join(','));
  if (state.years.size) p.set('y', [...state.years].join(','));
  if (state.print) p.set('print', '1');
  if (state.q) p.set('q', state.q);
  if (state.sort !== 'featured') p.set('sort', state.sort);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

const isPoster = (p) => p.cat === POSTER_CATEGORY;
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function matches(p, skip) {
  if (skip !== 'cats' && state.cats.size && !state.cats.has(p.catSlug)) return false;
  if (skip !== 'series' && state.series.size && !state.series.has(p.seriesSlug)) return false;
  if (skip !== 'years' && state.years.size && !state.years.has(p.year)) return false;
  if (state.print && !isPoster(p)) return false;
  if (state.q) {
    const hay = norm(`${p.title} ${p.series} ${p.cat} ${p.catShort} ${p.kind} ${p.year}`);
    if (!norm(state.q).split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

const sorters = {
  featured: (a, b) => a.order - b.order,
  new: (a, b) => b.year - a.year || a.order - b.order,
  old: (a, b) => a.year - b.year || a.order - b.order,
  az: (a, b) => a.title.localeCompare(b.title),
};

let results = [];

/* ---------------- filter groups ---------------- */
function group(key, title, options, open = true) {
  const rows = options.map((o) => `
    <li>
      <label class="fchk${o.n ? '' : ' is-zero'}">
        <input type="checkbox" data-key="${key}" value="${esc(o.value)}"${o.on ? ' checked' : ''}>
        <span class="fchk__box" aria-hidden="true"></span>
        <span class="fchk__label">${esc(o.label)}</span>
        <span class="fchk__n meta">${o.n}</span>
      </label>
    </li>`).join('');
  return `
    <details class="fgroup" data-group="${key}"${open ? ' open' : ''}>
      <summary class="fgroup__head meta">${title}</summary>
      <ul class="fgroup__list">${rows}</ul>
    </details>`;
}

/* counts are "how many you'd get if you ticked this too", so a zero
   tells you before you click that the combination is empty */
function renderGroups() {
  const openState = {};
  groups.querySelectorAll('details').forEach((d) => { openState[d.dataset.group] = d.open; });
  const isOpen = (k, dflt) => (k in openState ? openState[k] : dflt);

  const cOpts = categories.map((c) => ({
    value: c.slug, label: c.short, on: state.cats.has(c.slug),
    n: pieces.filter((p) => p.catSlug === c.slug && matches(p, 'cats')).length,
  }));

  /* series only make sense inside the categories in view */
  const seen = new Map();
  pieces.forEach((p) => {
    if (state.cats.size && !state.cats.has(p.catSlug)) return;
    if (!seen.has(p.seriesSlug)) seen.set(p.seriesSlug, p);
  });
  const sOpts = [...seen.values()].map((p) => ({
    value: p.seriesSlug, label: p.series, on: state.series.has(p.seriesSlug),
    n: pieces.filter((q) => q.seriesSlug === p.seriesSlug && matches(q, 'series')).length,
  }));

  const years = [...new Set(pieces.map((p) => p.year))].sort((a, b) => b - a);
  const yOpts = years.map((y) => ({
    value: y, label: y, on: state.years.has(y),
    n: pieces.filter((p) => p.year === y && matches(p, 'years')).length,
  }));

  const printN = pieces.filter((p) => isPoster(p) && matches({ ...p }, 'none')).length;

  groups.innerHTML = `
    <div class="fgroup fgroup--flat">
      <label class="fchk fchk--toggle">
        <input type="checkbox" data-key="print"${state.print ? ' checked' : ''}>
        <span class="fchk__box" aria-hidden="true"></span>
        <span class="fchk__label">Available as a print</span>
        <span class="fchk__n meta">${state.print ? printN : pieces.filter((p) => isPoster(p)).length}</span>
      </label>
    </div>
    ${group('cats', 'Category', cOpts, isOpen('cats', true))}
    ${group('series', `Series <span class="fgroup__hint">${sOpts.length}</span>`, sOpts, isOpen('series', state.series.size > 0))}
    ${group('years', 'Year', yOpts, isOpen('years', true))}`;
}

groups.addEventListener('change', (e) => {
  const box = e.target.closest('input[type="checkbox"]');
  if (!box) return;
  const k = box.dataset.key;
  if (k === 'print') state.print = box.checked;
  else {
    const set = state[k];
    box.checked ? set.add(box.value) : set.delete(box.value);
    /* dropping a category drops its series too, or they'd filter to nothing */
    if (k === 'cats') {
      const allowed = new Set(pieces.filter((p) => !state.cats.size || state.cats.has(p.catSlug)).map((p) => p.seriesSlug));
      state.series.forEach((s) => { if (!allowed.has(s)) state.series.delete(s); });
    }
  }
  update({ keepFocus: box });
});

/* ---------------- active chips ---------------- */
function renderChips() {
  const label = (k, v) => {
    if (k === 'cats') return categories.find((c) => c.slug === v)?.short || v;
    if (k === 'series') return pieces.find((p) => p.seriesSlug === v)?.series || v;
    return v;
  };
  const list = [];
  ['cats', 'series', 'years'].forEach((k) => state[k].forEach((v) => list.push({ k, v, t: label(k, v) })));
  if (state.print) list.push({ k: 'print', v: '1', t: 'Prints' });
  if (state.q) list.push({ k: 'q', v: state.q, t: `“${state.q}”` });

  chips.innerHTML = list.map((c) => `
    <button class="fchip meta" type="button" data-k="${c.k}" data-v="${esc(c.v)}" aria-label="Remove filter ${esc(c.t)}">
      ${esc(c.t)} <span aria-hidden="true">&times;</span>
    </button>`).join('') + (list.length > 1 ? '<button class="fchip fchip--clear meta store__clear" type="button">Clear all</button>' : '');

  const n = state.cats.size + state.series.size + state.years.size + (state.print ? 1 : 0);
  $('.store__filter-n').textContent = n ? `(${n})` : '';
}

chips.addEventListener('click', (e) => {
  const c = e.target.closest('.fchip[data-k]');
  if (!c) return;
  const { k, v } = c.dataset;
  if (k === 'print') state.print = false;
  else if (k === 'q') { state.q = ''; search.value = ''; }
  else state[k].delete(v);
  update();
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.store__clear')) return;
  state.cats.clear(); state.series.clear(); state.years.clear();
  state.print = false; state.q = ''; search.value = '';
  update();
});

/* ---------------- grid ---------------- */
function card(p, i) {
  const poster = isPoster(p);
  const inCart = poster && cart.has(p.id);
  const badge = poster ? '<span class="pc__badge meta">Print</span>'
    : p.count > 1 ? `<span class="pc__badge pc__badge--ghost meta">${p.count} screens</span>` : '';
  return `
    <li class="pc${poster ? ' pc--poster' : ''}${p.catSlug === 'photography' ? ' is-mono' : ''}" style="--d:${Math.min(i, 12)}">
      <button class="pc__open" type="button" data-i="${i}" data-cursor="VIEW" aria-label="Quick view: ${esc(p.title)}">
        <span class="pc__media"><img src="${esc(p.thumb)}" alt="" loading="${i < 8 ? 'eager' : 'lazy'}" decoding="async"></span>
        ${badge}
      </button>
      <div class="pc__body">
        <span class="pc__cat meta">${esc(p.catShort)} &middot; ${esc(p.year)}</span>
        <h3 class="pc__title"><a href="${esc(p.href)}">${esc(p.title)}</a></h3>
        <p class="pc__note">${esc(p.series)}</p>
        ${poster ? `<button class="pc__cart meta${inCart ? ' is-in' : ''}" type="button" data-cart="${i}" aria-pressed="${inCart}">
          ${BAG}<span>${inCart ? 'In cart' : 'Add to cart'}</span></button>` : ''}
      </div>
    </li>`;
}

function renderGrid() {
  grid.innerHTML = results.map(card).join('');
  empty.hidden = results.length > 0;
  const total = pieces.length;
  count.textContent = results.length === total
    ? `Showing all ${total} pieces`
    : `Showing ${results.length} of ${total} pieces`;
  $('[data-total]').textContent = `${total} pieces · ${categories.length} categories`;
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}

function update({ keepFocus } = {}) {
  results = pieces.filter((p) => matches(p)).sort(sorters[state.sort] || sorters.featured);
  const focusKey = keepFocus && `${keepFocus.dataset.key}:${keepFocus.value}`;
  renderGroups();
  renderChips();
  renderGrid();
  writeURL();
  $('.store__apply').textContent = `Show ${results.length} result${results.length === 1 ? '' : 's'}`;
  /* re-rendering the list would otherwise drop keyboard focus to <body> */
  if (focusKey) {
    const [k, v] = focusKey.split(':');
    groups.querySelector(`input[data-key="${k}"]${k === 'print' ? '' : `[value="${CSS.escape(v)}"]`}`)?.focus();
  }
}

/* ---------------- cart buttons on cards ---------------- */
function paintCartButton(b, inCart) {
  b.classList.toggle('is-in', inCart);
  b.setAttribute('aria-pressed', String(inCart));
  b.querySelector('span').textContent = inCart ? 'In cart' : 'Add to cart';
}
grid.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cart]');
  if (b) {
    const p = results[+b.dataset.cart];
    const added = cart.toggle(p);
    paintCartButton(b, added);
    toast(added ? `Added “${p.title}” to cart` : `Removed “${p.title}”`);
    return;
  }
  const o = e.target.closest('.pc__open');
  if (o) openQV(+o.dataset.i, o);
});
addEventListener('cartchange', () => {
  grid.querySelectorAll('[data-cart]').forEach((b) => paintCartButton(b, cart.has(results[+b.dataset.cart].id)));
  if (!qv.hidden) paintQV();
});

/* ---------------- search & sort ---------------- */
let t = 0;
search.addEventListener('input', () => {
  clearTimeout(t);
  t = setTimeout(() => { state.q = search.value.trim(); update(); }, 160);
});
search.closest('form')?.addEventListener('submit', (e) => e.preventDefault());
search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); search.blur(); } });
sortSel.addEventListener('change', () => { state.sort = sortSel.value; update(); });

/* ---------------- mobile filter sheet ---------------- */
let sheetOpener = null;
function setSheet(open) {
  panel.classList.toggle('is-open', open);
  filterBtn.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('sheet-open', open);
  if (open) {
    sheetOpener = document.activeElement;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    if (window.lenis) window.lenis.stop();
    setTimeout(() => $('.store__filters-close').focus(), 50);
  } else {
    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
    if (window.lenis) window.lenis.start();
    sheetOpener?.focus?.();
  }
}
filterBtn.addEventListener('click', () => setSheet(!panel.classList.contains('is-open')));
$('.store__filters-close').addEventListener('click', () => setSheet(false));
$('.store__apply').addEventListener('click', () => {
  setSheet(false);
  const top = $('.store__results').getBoundingClientRect().top + scrollY - 90;
  window.lenis ? window.lenis.scrollTo(top) : scrollTo({ top, behavior: 'smooth' });
});
sheetMQ.addEventListener?.('change', (e) => { if (!e.matches) setSheet(false); });

/* ---------------- quick view ---------------- */
const qv = $('.qv');
const qvImg = $('.qv__media img', qv);
let qvIndex = 0;
let qvOpener = null;

function paintQV() {
  const p = results[qvIndex];
  if (!p) return;
  const poster = isPoster(p);
  qv.classList.toggle('is-mono', p.catSlug === 'photography');
  qvImg.src = p.full;
  qvImg.alt = `${p.title} — ${p.series}`;
  $('.qv__cat', qv).textContent = `${p.catShort} · ${p.year} · ${p.kind}`;
  $('.qv__title', qv).textContent = p.title;
  $('.qv__note', qv).textContent = poster
    ? `${p.note}. Printed to order — add it to your cart and send the list; I'll reply with sizes and price.`
    : p.note;
  const inCart = poster && cart.has(p.id);
  $('.qv__actions', qv).innerHTML = `
    ${poster ? `<button class="button-chip meta primary qv__cart" type="button" aria-pressed="${inCart}">${inCart ? 'In cart &#10003;' : 'Add to cart'}</button>
      <a class="button-chip meta" href="posters.html#${esc(p.id)}">See it in the reel &#8594;</a>` : ''}
    <a class="button-chip meta" href="${esc(p.href)}">View the full series &#8594;</a>`;
  $('.qv__pos', qv).textContent = `${qvIndex + 1} / ${results.length}`;
}

function openQV(i, from) {
  qvIndex = i;
  qvOpener = from;
  paintQV();
  qv.hidden = false;
  document.body.classList.add('qv-open');
  if (window.lenis) window.lenis.stop();
  requestAnimationFrame(() => qv.classList.add('is-open'));
  setTimeout(() => $('.qv__close', qv).focus(), 50);
}
function closeQV() {
  qv.classList.remove('is-open');
  document.body.classList.remove('qv-open');
  if (window.lenis) window.lenis.start();
  setTimeout(() => { qv.hidden = true; }, 220);
  qvOpener?.focus?.();
}
function stepQV(d) {
  qvIndex = (qvIndex + d + results.length) % results.length;
  paintQV();
}
qv.addEventListener('click', (e) => {
  if (e.target.closest('[data-qv-close]')) return closeQV();
  const s = e.target.closest('[data-step]');
  if (s) return stepQV(+s.dataset.step);
  if (e.target.closest('.qv__cart')) {
    const p = results[qvIndex];
    const added = cart.toggle(p);
    toast(added ? `Added “${p.title}” to cart` : `Removed “${p.title}”`);
  }
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel.classList.contains('is-open')) setSheet(false);
  if (qv.hidden) return;
  if (e.key === 'Escape') closeQV();
  if (e.key === 'ArrowRight') stepQV(1);
  if (e.key === 'ArrowLeft') stepQV(-1);
});
/* swipe between pieces in the quick view on touch */
let sx = 0;
qvImg.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
qvImg.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) stepQV(dx < 0 ? 1 : -1);
}, { passive: true });

/* ---------------- boot ---------------- */
readURL();
search.value = state.q;
sortSel.value = sorters[state.sort] ? state.sort : 'featured';
update();

/* a small fan of real posters on the reel banner */
$('.reel-promo__stack').innerHTML = pieces.filter(isPoster).filter((_, i) => i % 7 === 1).slice(0, 3)
  .map((p) => `<img src="${esc(p.thumb)}" alt="" loading="lazy" decoding="async">`).join('');

addEventListener('popstate', () => { readURL(); search.value = state.q; sortSel.value = state.sort; update(); });

initSite();
initCartUI();
