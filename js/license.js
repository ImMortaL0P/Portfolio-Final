/* Licensing page: the price table is drawn from pricing.js so it can
   never disagree with the store. */
import './scroll.js';
import { initSite } from './site.js';
import { initCartUI } from './cart.js';
import { PRICES, money } from './pricing.js';
import { categories } from './catalog.js';

const host = document.querySelector('.lic-prices');
if (host) {
  host.innerHTML = `
    <div class="lic-compare lic-compare--prices" role="table" aria-label="Prices per piece">
      <div class="lic-compare__row lic-compare__head" role="row">
        <span role="columnheader">Per piece</span><span role="columnheader">Personal</span><span role="columnheader">Commercial</span>
      </div>
      ${categories.filter((c) => PRICES[c.name]).map((c) => `
        <div class="lic-compare__row" role="row">
          <span role="rowheader"><a href="work.html?c=${c.slug}">${c.short}</a></span>
          <span role="cell">${money(PRICES[c.name][0])}</span>
          <span role="cell">${money(PRICES[c.name][1])}</span>
        </div>`).join('')}
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  initSite();
  initCartUI();
});
