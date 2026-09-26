/* ------------------------------------------------------------------
   PRICING & LICENSING — the one file to edit.

   Every piece in the store is sold as a digital file with a licence.
   Prices are per category, in rupees, for two licence tiers. Change a
   number here and the store, quick view, reel, category pages and cart
   all follow.

   ⚠ The amounts below are starting placeholders — set your own.
------------------------------------------------------------------- */

export const CURRENCY = 'INR';

/* per category: [personal, commercial] */
export const PRICES = {
  'Photography':    [399, 999],
  'Illustrations':  [299, 799],
  'Graphic Design': [399, 999],
  'Poster Designs': [299, 799],
  'Brand Design':   [499, 1499],
  'Typography':     [249, 699],
};

/* Not sold at all: client work that belongs to the client, and things
   that aren't a file (a showreel, a live website). Category names or
   series titles exactly as in data.js. */
export const NOT_FOR_SALE = [
  'Websites',
  'Kinetic Showreel',
  'SP SERVICES',          /* a client's identity */
];

/* Personal licence only. These pieces show characters, brands or real
   people owned by someone else, and a commercial licence for third-party
   IP or someone's likeness isn't yours to grant (the buyer could be sued
   for using it). Remove an entry here once you have the rights.
   Series titles, or a single piece as "SERIES / Piece name". */
export const PERSONAL_ONLY = [
  'REDRAW LAB',                       /* cartoon characters */
  'FREEHAND COMICS',                  /* includes Looney Tunes' ACME */
  'PASTEL STYLE POSTERS',             /* celebrity portraits */
  'CLASSIC MARQUES',                  /* car brands */
  'POP ART / Focus Poster',           /* real athlete + Audi rings */
  'POP ART / I Love Rollercoasters',  /* book cover fan art */
  'POP ART / Dont Stop Smoking',      /* film stills of real actors */
  'POP ART / Sanskrit Savage',        /* likeness of a real person */
];

export const LICENSES = {
  personal: {
    label: 'Personal',
    short: 'Personal use',
    blurb: 'Print it, set it as a wallpaper, frame it for your own space. Not for anything you sell or promote.',
  },
  commercial: {
    label: 'Commercial',
    short: 'Commercial use',
    blurb: 'Use it in client work, marketing, merchandise and products you sell — unlimited projects, no attribution needed.',
  },
};

/* ---------------------------------------------------------------- */

const norm = (s) => String(s).trim().toLowerCase();
const nfs = new Set(NOT_FOR_SALE.map(norm));
const personalOnly = new Set(PERSONAL_ONLY.map(norm));

export function forSale(p) {
  if (!p || nfs.has(norm(p.cat)) || nfs.has(norm(p.seriesRaw || p.series))) return false;
  return !!PRICES[p.cat];
}

export function commercialAllowed(p) {
  const series = norm(p.seriesRaw || p.series);
  return !personalOnly.has(series) && !personalOnly.has(`${series} / ${norm(p.title)}`);
}

export function tiersFor(p) {
  if (!forSale(p)) return [];
  return commercialAllowed(p) ? ['personal', 'commercial'] : ['personal'];
}

/* the licence a one-tap "add" uses: commercial when it's offered */
export const defaultTier = (p) => (commercialAllowed(p) ? 'commercial' : 'personal');

export function priceOf(p, tier = defaultTier(p)) {
  const row = PRICES[p.cat];
  if (!row) return null;
  return tier === 'commercial' ? row[1] : row[0];
}

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 });
export const money = (n) => fmt.format(n || 0);
