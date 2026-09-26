/* ------------------------------------------------------------------
   Cart & checkout. Every piece in the store is sold as a digital file
   with a licence (Personal or Commercial — see pricing.js).

   The site is static, so checkout is an order form rather than a card
   payment: the order (items, licences, total, buyer) is emailed to the
   studio, which replies with an invoice (UPI / bank transfer) and sends
   the full-resolution files and licence certificate once it's paid.

   The cart lives in localStorage so it survives moving between pages and
   syncs across open tabs.
------------------------------------------------------------------- */
import { pieces } from './catalog.js';
import { priceOf, money, tiersFor, defaultTier, LICENSES } from './pricing.js';

const KEY = 'mg-cart';
const OLD_KEY = 'mg-poster-cart';
const TO = 'kumarmangalam.patna@gmail.com';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const byId = new Map(pieces.map((p) => [p.id, p]));

let items = load();

function load() {
  let list = [];
  try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { /* none */ }
  /* carry over anything from the old poster-print cart */
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY)) || [];
    if (old.length) {
      old.forEach((o) => { if (!list.some((x) => x.id === o.id)) list.push({ id: o.id }); });
      localStorage.removeItem(OLD_KEY);
    }
  } catch (e) { /* none */ }
  /* keep only pieces still on sale, with a licence they can still have */
  return list
    .map((x) => ({ id: x.id, p: byId.get(x.id), tier: x.tier }))
    .filter((x) => x.p && tiersFor(x.p).length)
    .map((x) => ({ id: x.id, tier: tiersFor(x.p).includes(x.tier) ? x.tier : defaultTier(x.p) }));
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode: session only */ }
  dispatchEvent(new CustomEvent('cartchange', { detail: items }));
}
addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  items = load();
  dispatchEvent(new CustomEvent('cartchange', { detail: items }));
});

const lineOf = (x) => {
  const p = byId.get(x.id);
  return { ...x, p, price: priceOf(p, x.tier) };
};

export const cart = {
  lines: () => items.map(lineOf),
  count: () => items.length,
  has: (id) => items.some((x) => x.id === id),
  tier: (id) => items.find((x) => x.id === id)?.tier,
  total: () => items.reduce((a, x) => a + (priceOf(byId.get(x.id), x.tier) || 0), 0),
  add(p, tier = defaultTier(p)) {
    if (!tiersFor(p).includes(tier)) return false;
    const found = items.find((x) => x.id === p.id);
    if (found) { found.tier = tier; save(); return true; }
    items.push({ id: p.id, tier });
    save();
    return true;
  },
  setTier(id, tier) {
    const x = items.find((i) => i.id === id);
    if (!x || !tiersFor(byId.get(id)).includes(tier)) return;
    x.tier = tier;
    save();
  },
  remove(id) { items = items.filter((x) => x.id !== id); save(); },
  toggle(p, tier) { if (cart.has(p.id)) { cart.remove(p.id); return false; } return cart.add(p, tier); },
  clear() { items = []; save(); },
};

/* ---- a small confirmation that doesn't steal focus ---- */
let toastTimer = 0;
export function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast meta';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2400);
}

/* ---- the licence picker, shared by the quick view and the cart ---- */
export function tierPicker(p, current, name) {
  const tiers = tiersFor(p);
  return `
    <div class="lic" role="radiogroup" aria-label="Licence for ${esc(p.title)}">
      ${tiers.map((t) => `
        <label class="lic__opt">
          <input type="radio" name="${esc(name)}" value="${t}"${t === current ? ' checked' : ''}>
          <span class="lic__box">
            <span class="lic__row"><span class="lic__name">${LICENSES[t].label}</span><span class="lic__price">${money(priceOf(p, t))}</span></span>
            <span class="lic__blurb">${LICENSES[t].blurb}</span>
          </span>
        </label>`).join('')}
      ${tiers.length === 1 ? '<p class="lic__only meta">Personal licence only &mdash; this piece features third-party characters, brands or people.</p>' : ''}
    </div>`;
}

/* ---- order submission ---- */
const orderId = () => {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `KM-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

async function sendOrder(order) {
  const rows = order.lines.map((l, i) =>
    `${i + 1}. ${l.p.title} — ${l.p.series} (${l.p.catShort})\n   ${LICENSES[l.tier].label} licence · ${money(l.price)}\n   id: ${l.id}`);
  const body = [
    `Order:     ${order.id}`,
    `Name:      ${order.name}`,
    `Email:     ${order.email}`,
    `Company:   ${order.company || '—'}`,
    `GSTIN:     ${order.gstin || '—'}`,
    '',
    'Items',
    '-----',
    ...rows,
    '',
    `Total:     ${money(order.total)}`,
    '',
    'Intended use',
    '------------',
    order.use || '—',
  ].join('\n');
  const subject = `Licence order ${order.id} — ${money(order.total)} — ${order.name}`;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${TO}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: subject, _template: 'box', name: order.name, email: order.email, message: body }),
    });
    if (!res.ok) throw new Error('send failed');
    return true;
  } catch (e) {
    /* no network or the relay is down: hand it to their mail app instead */
    location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return false;
  }
}

/* ---- the drawer: cart → checkout → confirmation ---- */
export function initCartUI({ fab = true } = {}) {
  if (document.querySelector('.cart')) return;

  const drawer = document.createElement('div');
  drawer.className = 'cart';
  drawer.hidden = true;
  drawer.innerHTML = `
    <div class="cart__scrim" data-cart-close></div>
    <aside class="cart__panel section--dark" role="dialog" aria-modal="true" aria-labelledby="cart-title" data-lenis-prevent>
      <header class="cart__head">
        <div>
          <p class="cart__eyebrow meta">Digital files &middot; licensed</p>
          <h2 class="cart__title" id="cart-title">Your cart</h2>
        </div>
        <button class="cart__close meta" type="button" data-cart-close aria-label="Close cart">Close &times;</button>
      </header>

      <div class="cart__view" data-view="cart">
        <ul class="cart__list"></ul>
        <div class="cart__empty">
          <p>Nothing here yet.</p>
          <a class="button-chip meta" href="work.html">Browse the store &#8594;</a>
        </div>
        <footer class="cart__foot">
          <p class="cart__total"><span class="meta">Total</span><strong class="cart__sum"></strong></p>
          <p class="cart__note">High-resolution files with a licence certificate, sent by email once payment is confirmed. <a href="license.html">Licence terms</a></p>
          <button class="button-chip meta primary cart__checkout" type="button">Checkout &#8594;</button>
          <button class="cart__clear meta" type="button">Clear cart</button>
        </footer>
      </div>

      <form class="cart__view cart__form" data-view="checkout" hidden novalidate>
        <button class="cart__back meta" type="button">&#8592; Back to cart</button>
        <div class="cart__summary"></div>
        <label class="cart__field"><span class="meta">Full name</span>
          <input name="name" required autocomplete="name"></label>
        <label class="cart__field"><span class="meta">Email &mdash; files and invoice go here</span>
          <input name="email" type="email" required autocomplete="email" inputmode="email"></label>
        <label class="cart__field"><span class="meta">Company <em>optional</em></span>
          <input name="company" autocomplete="organization"></label>
        <label class="cart__field"><span class="meta">GSTIN <em>optional, for a GST invoice</em></span>
          <input name="gstin" autocomplete="off" maxlength="15" style="text-transform:uppercase"></label>
        <label class="cart__field"><span class="meta">What will you use them for? <em>optional</em></span>
          <textarea name="use" rows="2"></textarea></label>
        <label class="cart__agree">
          <input type="checkbox" name="agree" required>
          <span>I&rsquo;ve read the <a href="license.html" target="_blank" rel="noopener">licence terms</a> and the licence I picked covers my use.</span>
        </label>
        <p class="cart__error meta" role="alert" hidden></p>
        <button class="button-chip meta primary cart__place" type="submit">Place order</button>
        <p class="cart__note">Placing the order doesn&rsquo;t charge you. You&rsquo;ll get an invoice by email to pay by UPI or bank transfer; the files and your licence follow.</p>
      </form>

      <div class="cart__view cart__done" data-view="done" hidden tabindex="-1">
        <h3 class="cart__done-title">Thank you.</h3>
        <p class="cart__done-id meta"></p>
        <ol class="cart__steps">
          <li>An invoice arrives at <strong class="cart__done-email"></strong>.</li>
          <li>Pay it by UPI or bank transfer.</li>
          <li>Your high-resolution files and licence certificate are emailed to you.</li>
        </ol>
        <p class="cart__note">Questions about the order? Write to <a href="mailto:${TO}">${TO}</a> with your order number.</p>
        <button class="button-chip meta" type="button" data-cart-close>Done</button>
      </div>
    </aside>`;
  document.body.appendChild(drawer);

  let btn = null;
  if (fab) {
    btn = document.createElement('button');
    btn.className = 'cart-fab meta';
    btn.type = 'button';
    btn.dataset.cartOpen = '';
    btn.innerHTML = `${BAG}<span>Cart</span><span class="cart-count" aria-hidden="true">0</span>`;
    document.body.appendChild(btn);
  }

  const panel = drawer.querySelector('.cart__panel');
  const list = drawer.querySelector('.cart__list');
  const form = drawer.querySelector('.cart__form');
  const err = drawer.querySelector('.cart__error');
  let opener = null;

  const show = (view) => {
    drawer.querySelectorAll('.cart__view').forEach((v) => { v.hidden = v.dataset.view !== view; });
    drawer.dataset.view = view;
    panel.scrollTop = 0;
    const title = drawer.querySelector('.cart__title');
    title.textContent = view === 'checkout' ? 'Checkout' : view === 'done' ? 'Order placed' : (cart.count() ? `Your cart (${cart.count()})` : 'Your cart');
  };

  const render = () => {
    const n = cart.count();
    document.querySelectorAll('.cart-count').forEach((c) => { c.textContent = n; });
    document.querySelectorAll('[data-cart-open]').forEach((b) =>
      b.setAttribute('aria-label', `Open cart, ${n} item${n === 1 ? '' : 's'}`));
    if (btn) btn.classList.toggle('is-on', n > 0);
    drawer.classList.toggle('is-empty', n === 0);
    if (drawer.dataset.view !== 'done') drawer.querySelector('.cart__title').textContent =
      drawer.dataset.view === 'checkout' ? 'Checkout' : n ? `Your cart (${n})` : 'Your cart';
    drawer.querySelector('.cart__sum').textContent = money(cart.total());

    list.innerHTML = cart.lines().map((l) => {
      const tiers = tiersFor(l.p);
      const sel = tiers.length > 1
        ? `<select class="cart__tier" data-tier="${esc(l.id)}" aria-label="Licence for ${esc(l.p.title)}">
            ${tiers.map((t) => `<option value="${t}"${t === l.tier ? ' selected' : ''}>${LICENSES[t].label} · ${money(priceOf(l.p, t))}</option>`).join('')}
           </select>`
        : `<span class="cart__tier cart__tier--fixed meta">${LICENSES[l.tier].label} only</span>`;
      return `
      <li class="cart__item">
        <img src="${esc(l.p.thumb)}" alt="" loading="lazy" decoding="async">
        <div class="cart__item-text">
          <span class="cart__item-title">${esc(l.p.title)}</span>
          <span class="cart__item-series meta">${esc(l.p.catShort)} &middot; ${esc(l.p.series)}</span>
          ${sel}
        </div>
        <div class="cart__item-end">
          <span class="cart__price">${money(l.price)}</span>
          <button class="cart__remove meta" type="button" data-remove="${esc(l.id)}" aria-label="Remove ${esc(l.p.title)}">Remove</button>
        </div>
      </li>`;
    }).join('');

    drawer.querySelector('.cart__summary').innerHTML = `
      <p class="cart__summary-line"><span>${n} file${n === 1 ? '' : 's'}</span><strong>${money(cart.total())}</strong></p>`;
    if (!n && drawer.dataset.view === 'checkout') show('cart');
  };

  const open = (from) => {
    opener = from || document.activeElement;
    if (drawer.dataset.view !== 'checkout') show('cart');
    drawer.hidden = false;
    document.body.classList.add('cart-open');
    if (window.lenis) window.lenis.stop();
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    setTimeout(() => drawer.querySelector('.cart__close').focus(), 60);
  };
  const close = () => {
    drawer.classList.remove('is-open');
    document.body.classList.remove('cart-open');
    if (window.lenis) window.lenis.start();
    setTimeout(() => {
      drawer.hidden = true;
      if (drawer.dataset.view === 'done') show('cart');
    }, 280);
    opener?.focus?.();
  };

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-cart-open]');
    if (o) { e.preventDefault(); open(o); return; }
    if (e.target.closest('[data-cart-close]')) close();
    const r = e.target.closest('[data-remove]');
    if (r) cart.remove(r.dataset.remove);
  });
  list.addEventListener('change', (e) => {
    const s = e.target.closest('[data-tier]');
    if (s) cart.setTier(s.dataset.tier, s.value);
  });
  addEventListener('keydown', (e) => { if (!drawer.hidden && e.key === 'Escape') close(); });

  drawer.querySelector('.cart__clear').addEventListener('click', () => cart.clear());
  drawer.querySelector('.cart__checkout').addEventListener('click', () => {
    show('checkout');
    setTimeout(() => form.querySelector('input[name="name"]').focus(), 50);
  });
  drawer.querySelector('.cart__back').addEventListener('click', () => show('cart'));

  form.addEventListener('input', () => { err.hidden = true; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const missing = [];
    if (!String(d.name || '').trim()) missing.push('your name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email || '').trim())) missing.push('a valid email');
    if (d.gstin && !/^[0-9A-Z]{15}$/i.test(d.gstin.trim())) missing.push('a 15-character GSTIN (or leave it empty)');
    if (!d.agree) missing.push('agreement to the licence terms');
    if (missing.length) { err.textContent = `Still need ${missing.join(', ')}.`; err.hidden = false; return; }
    err.hidden = true;

    const order = {
      id: orderId(),
      name: d.name.trim(),
      email: d.email.trim(),
      company: (d.company || '').trim(),
      gstin: (d.gstin || '').trim().toUpperCase(),
      use: (d.use || '').trim(),
      lines: cart.lines(),
      total: cart.total(),
    };
    const place = form.querySelector('.cart__place');
    place.disabled = true;
    place.textContent = 'Placing order…';
    const sent = await sendOrder(order);
    place.disabled = false;
    place.textContent = 'Place order';
    if (!sent) return;   /* the mail app took over; keep the cart */

    drawer.querySelector('.cart__done-id').textContent = `Order ${order.id} · ${money(order.total)}`;
    drawer.querySelector('.cart__done-email').textContent = order.email;
    form.reset();
    cart.clear();
    show('done');
    drawer.querySelector('.cart__done').focus();
  });

  /* trap Tab inside the open drawer */
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...panel.querySelectorAll('a[href], button, input, select, textarea')].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  addEventListener('cartchange', render);
  show('cart');
  render();
  return { open, close };
}

export const BAG = `<svg class="bag" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>`;
