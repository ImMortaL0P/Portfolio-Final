/* ------------------------------------------------------------------
   Browse posters — a reel.

   One poster per screen, snapped. Scroll, swipe or press ↓ for the next
   one; it never runs out: after the last poster a short "that's all of
   them" card appears and a fresh shuffle follows. Add to cart with the
   button, or double-tap / double-click the poster.

   Native scroll-snap does the physics (no Lenis here: smoothing fights
   snapping). An IntersectionObserver decides which slide is current,
   loads images a couple of slides ahead and keeps the URL hash on the
   current poster so it can be shared.
------------------------------------------------------------------- */
import { posters } from './catalog.js';
import { cart, initCartUI, toast, BAG } from './cart.js';
import { initContact } from './contact.js';
import { initProtect } from './protect.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reel = document.querySelector('#reel');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const big = matchMedia('(min-width: 700px)').matches;
const TOTAL = posters.length;

const SHARE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 15V4"/><path d="M7.5 8.5 12 4l4.5 4.5"/><path d="M5 12v7h14v-7"/></svg>';
const GRID = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/></svg>';

/* ---------------- feed ---------------- */
function shuffle(list, avoidFirst) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  /* never show the same poster twice in a row across the seam */
  if (avoidFirst && a[0].id === avoidFirst) a.push(a.shift());
  return a;
}

let round = 0;
let lastId = null;
const slides = [];       /* DOM nodes in feed order */

function slideHTML(p, pos) {
  const inCart = cart.has(p.id);
  return `
    <div class="reel__bg" aria-hidden="true" data-bg="${esc(p.small)}"></div>
    <figure class="reel__fig">
      <img data-src="${esc(big ? p.full : p.thumb)}" alt="${esc(p.title)} — poster from the ${esc(p.series)} series" decoding="async" draggable="false">
      <span class="reel__burst" aria-hidden="true">${BAG}</span>
    </figure>
    <div class="reel__info">
      <p class="reel__series meta">${esc(p.series)} &middot; ${esc(p.year)}</p>
      <h2 class="reel__title">${esc(p.title)}</h2>
      <p class="reel__note">Poster &middot; printed to order</p>
    </div>
    <div class="reel__rail">
      <button class="reel__act reel__add${inCart ? ' is-in' : ''}" type="button" data-add aria-pressed="${inCart}" aria-label="${inCart ? 'Remove from cart' : 'Add to cart'}: ${esc(p.title)}">
        <span class="reel__icon">${BAG}</span><span class="reel__act-label">${inCart ? 'In cart' : 'Add'}</span>
      </button>
      <button class="reel__act" type="button" data-share aria-label="Share ${esc(p.title)}">
        <span class="reel__icon">${SHARE}</span><span class="reel__act-label">Share</span>
      </button>
      <a class="reel__act" href="${esc(p.href)}" aria-label="See the full ${esc(p.series)} series">
        <span class="reel__icon">${GRID}</span><span class="reel__act-label">Series</span>
      </a>
      <span class="reel__pos meta" aria-hidden="true">${String(pos + 1).padStart(2, '0')}/${TOTAL}</span>
    </div>`;
}

function appendRound(startWith) {
  let list = round === 0 ? posters.slice() : shuffle(posters, lastId);
  if (startWith) {
    const k = list.findIndex((p) => p.id === startWith);
    if (k > 0) list = list.slice(k).concat(list.slice(0, k));
  }

  if (round > 0) {
    const end = document.createElement('section');
    end.className = 'reel__slide reel__slide--end';
    end.setAttribute('aria-label', 'End of this round');
    end.innerHTML = `
      <div class="reel__end">
        <p class="meta">That&rsquo;s all ${TOTAL}</p>
        <h2 class="reel__end-title">You&rsquo;ve seen every poster.</h2>
        <p class="reel__end-note">Keep scrolling for another pass in a new order, or check what you&rsquo;ve picked.</p>
        <div class="reel__end-actions">
          <button class="button-chip meta primary" type="button" data-cart-open>Open cart (<span class="cart-count">${cart.count()}</span>)</button>
          <a class="button-chip meta" href="work.html?c=poster-designs">See them as a grid</a>
        </div>
        <span class="reel__end-down meta" aria-hidden="true">Keep going &darr;</span>
      </div>`;
    reel.appendChild(end);
    slides.push(end);
    io.observe(end);
  }

  list.forEach((p, i) => {
    const s = document.createElement('section');
    s.className = 'reel__slide';
    s.dataset.id = p.id;
    s.setAttribute('aria-label', `${p.title}, ${posters.indexOf(p) + 1} of ${TOTAL}`);
    s.innerHTML = slideHTML(p, posters.indexOf(p));
    s._p = p;
    reel.appendChild(s);
    slides.push(s);
    io.observe(s);
  });
  lastId = list[list.length - 1].id;
  round++;
}

/* ---------------- loading + current slide ---------------- */
function hydrate(s) {
  if (!s || s._ready) return;
  s._ready = true;
  const img = s.querySelector('img[data-src]');
  if (img) {
    img.src = img.dataset.src;
    img.addEventListener('load', () => s.classList.add('is-loaded'), { once: true });
    img.addEventListener('error', () => s.classList.add('is-loaded'), { once: true });
  }
  const bg = s.querySelector('[data-bg]');
  if (bg) bg.style.backgroundImage = `url("${bg.dataset.bg}")`;
}

let current = -1;
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting || e.intersectionRatio < 0.6) return;
    const k = slides.indexOf(e.target);
    if (k === current) return;
    current = k;
    slides.forEach((s, i) => s.classList.toggle('is-current', i === k));
    for (let d = -1; d <= 2; d++) hydrate(slides[k + d]);
    const p = e.target._p;
    if (p) history.replaceState(null, '', `#${p.id}`);
    /* keep the feed ahead of the reader */
    if (slides.length - k < 5) appendRound();
    if (k > 0) document.body.classList.add('has-scrolled');
  });
}, { root: reel, threshold: [0.6] });

/* ---------------- actions ---------------- */
function paintAdd(s) {
  const b = s.querySelector('[data-add]');
  if (!b) return;
  const inCart = cart.has(s._p.id);
  b.classList.toggle('is-in', inCart);
  b.setAttribute('aria-pressed', String(inCart));
  b.setAttribute('aria-label', `${inCart ? 'Remove from cart' : 'Add to cart'}: ${s._p.title}`);
  b.querySelector('.reel__act-label').textContent = inCart ? 'In cart' : 'Add';
}

function burst(s) {
  const b = s.querySelector('.reel__burst');
  if (!b || reduce) return;
  b.classList.remove('is-on');
  void b.offsetWidth;          /* restart the animation */
  b.classList.add('is-on');
}

function add(s, { onlyAdd = false } = {}) {
  const p = s._p;
  if (!p) return;
  if (onlyAdd && cart.has(p.id)) { burst(s); return; }
  const added = cart.toggle(p);
  if (added) burst(s);
  toast(added ? `Added “${p.title}” · ${cart.count()} in cart` : `Removed “${p.title}”`);
}

async function share(p) {
  const url = `${location.origin}${location.pathname}#${p.id}`;
  try {
    if (navigator.share) { await navigator.share({ title: `${p.title} — K. Mangalam`, url }); return; }
    await navigator.clipboard.writeText(url);
    toast('Link copied');
  } catch (e) { /* dismissed */ }
}

reel.addEventListener('click', (e) => {
  const s = e.target.closest('.reel__slide');
  if (!s) return;
  if (e.target.closest('[data-add]')) add(s);
  else if (e.target.closest('[data-share]')) share(s._p);
});

/* double-tap / double-click on the poster itself adds it (never removes:
   a second double-tap on something already in the cart just confirms) */
let lastTap = 0;
reel.addEventListener('dblclick', (e) => {
  const s = e.target.closest('.reel__slide');
  if (s && e.target.closest('.reel__fig')) add(s, { onlyAdd: true });
});
reel.addEventListener('touchend', (e) => {
  if (!e.target.closest('.reel__fig')) return;
  const now = Date.now();
  if (now - lastTap < 300) {
    e.preventDefault();       /* no zoom, no synthetic dblclick */
    add(e.target.closest('.reel__slide'), { onlyAdd: true });
    lastTap = 0;
  } else lastTap = now;
}, { passive: false });

addEventListener('cartchange', () => slides.forEach((s) => s._p && paintAdd(s)));

/* ---------------- keyboard + step buttons ---------------- */
/* Step from where the feed is headed, not from where it is: a second
   press while the first is still scrolling must go one further. */
let aim = null;
let aimTimer = 0;
function go(d) {
  const here = aim ?? Math.round(reel.scrollTop / reel.clientHeight);
  const k = Math.max(0, Math.min(slides.length - 1, here + d));
  aim = k;
  clearTimeout(aimTimer);
  aimTimer = setTimeout(() => { aim = null; }, 900);
  slides[k]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
reel.addEventListener('scrollend', () => { aim = null; });
document.querySelector('.reel-steps').addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) go(+b.dataset.go);
});
addEventListener('keydown', (e) => {
  if (!document.querySelector('.cart')?.hidden || !document.querySelector('#contact-modal')?.hidden) return;
  if (e.target.closest('input, textarea, select')) return;
  if (['ArrowDown', 'PageDown', 'j'].includes(e.key) || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); go(1); }
  if (['ArrowUp', 'PageUp', 'k'].includes(e.key) || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); go(-1); }
  if ((e.key === 'a' || e.key === 'Enter') && !e.target.closest('button, a') && slides[current]?._p) add(slides[current]);
});

/* ---------------- boot ---------------- */
const start = decodeURIComponent(location.hash.slice(1));
appendRound(posters.some((p) => p.id === start) ? start : null);
hydrate(slides[0]);
hydrate(slides[1]);
reel.focus({ preventScroll: true });

initProtect();
initContact();
initCartUI({ fab: false });

/* the hint goes once they've understood it */
setTimeout(() => document.body.classList.add('hint-seen'), 6000);
