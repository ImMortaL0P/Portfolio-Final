/* ------------------------------------------------------------------
   Poster cart. Posters are the only work sold as prints, so this is the
   only place a cart exists. It is a request list rather than a checkout:
   "Request these prints" opens the contact form with the list filled in,
   and sizes, price and delivery are confirmed by email.

   Stored in localStorage so it survives moving between the store, the
   poster reel and the category page, and syncs across open tabs.
------------------------------------------------------------------- */
const KEY = 'mg-poster-cart';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let items = load();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
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

export const cart = {
  items: () => items.slice(),
  count: () => items.length,
  has: (id) => items.some((p) => p.id === id),
  add(p) {
    if (cart.has(p.id)) return false;
    items.push({ id: p.id, title: p.title, series: p.series, thumb: p.thumb, href: p.href });
    save();
    return true;
  },
  remove(id) { items = items.filter((p) => p.id !== id); save(); },
  toggle(p) { if (cart.has(p.id)) { cart.remove(p.id); return false; } cart.add(p); return true; },
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
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}

/* ---- the drawer, plus a floating trigger that appears once it has
       something in it. `trigger` is an optional extra button that opens
       it (the reel's top bar has its own). ---- */
export function initCartUI({ fab = true } = {}) {
  if (document.querySelector('.cart')) return;

  const drawer = document.createElement('div');
  drawer.className = 'cart';
  drawer.hidden = true;
  drawer.innerHTML = `
    <div class="cart__scrim" data-cart-close></div>
    <aside class="cart__panel section--dark" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <header class="cart__head">
        <div>
          <p class="cart__eyebrow meta">Poster prints</p>
          <h2 class="cart__title" id="cart-title">Your cart</h2>
        </div>
        <button class="cart__close meta" type="button" data-cart-close aria-label="Close cart">Close &times;</button>
      </header>
      <ul class="cart__list"></ul>
      <div class="cart__empty">
        <p>Nothing here yet.</p>
        <a class="button-chip meta" href="posters.html">Browse posters &#8594;</a>
      </div>
      <footer class="cart__foot">
        <p class="cart__note">Prints are made to order. Send the list and I&rsquo;ll reply with sizes, price and delivery.</p>
        <button class="button-chip meta primary cart__request" type="button">Request these prints &#8599;</button>
        <button class="cart__clear meta" type="button">Clear cart</button>
      </footer>
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
  let opener = null;

  const render = () => {
    const n = cart.count();
    document.querySelectorAll('.cart-count').forEach((c) => { c.textContent = n; });
    document.querySelectorAll('[data-cart-open]').forEach((b) =>
      b.setAttribute('aria-label', `Open cart, ${n} poster${n === 1 ? '' : 's'}`));
    if (btn) btn.classList.toggle('is-on', n > 0);
    drawer.classList.toggle('is-empty', n === 0);
    drawer.querySelector('.cart__title').textContent = n ? `Your cart (${n})` : 'Your cart';
    list.innerHTML = cart.items().map((p) => `
      <li class="cart__item">
        <img src="${esc(p.thumb)}" alt="" loading="lazy" decoding="async">
        <div class="cart__item-text">
          <span class="cart__item-title">${esc(p.title)}</span>
          <span class="cart__item-series meta">${esc(p.series)}</span>
        </div>
        <button class="cart__remove meta" type="button" data-remove="${esc(p.id)}" aria-label="Remove ${esc(p.title)}">Remove</button>
      </li>`).join('');
  };

  const open = (from) => {
    opener = from || document.activeElement;
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
    setTimeout(() => { drawer.hidden = true; }, 280);
    opener?.focus?.();
  };

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-cart-open]');
    if (o) { e.preventDefault(); open(o); return; }
    if (e.target.closest('[data-cart-close]')) close();
    const r = e.target.closest('[data-remove]');
    if (r) cart.remove(r.dataset.remove);
  });
  addEventListener('keydown', (e) => { if (!drawer.hidden && e.key === 'Escape') close(); });

  drawer.querySelector('.cart__clear').addEventListener('click', () => cart.clear());
  drawer.querySelector('.cart__request').addEventListener('click', () => {
    const lines = cart.items().map((p, i) => `${i + 1}. ${p.title} — ${p.series}`);
    close();
    window.mgContact?.open(null, {
      kind: 'Poster prints',
      eyebrow: 'Print request',
      message: `I'd like prints of these posters:\n\n${lines.join('\n')}\n\nSize / quantity / city: `,
    });
  });

  /* trap Tab inside the open drawer */
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...panel.querySelectorAll('a[href], button')].filter((n) => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  addEventListener('cartchange', render);
  render();
  return { open, close };
}

export const BAG = `<svg class="bag" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>`;
