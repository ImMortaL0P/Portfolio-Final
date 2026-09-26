/* ------------------------------------------------------------------
   Catalogue. data.js is organised as category → series → images; the
   store and the poster reel both want one flat list of pieces, each
   with a name, so that shape is derived here once.
------------------------------------------------------------------- */
import { workCategories } from './data.js';
import { showcase } from './showcase.js';

export const slug = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* the rule category.html and main.js build their ids and ?c= keys with;
   links into those pages have to use it, accents and digits and all */
export const pageSlug = (s) => String(s).toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

/* series titles are stored in caps; the store sets names in sentence case */
export const titleCase = (s) =>
  String(s).toLowerCase().replace(/(^|[\s\-/(&])([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase())
    .replace(/\b(Of|And|The|A|An|In|On|To)\b(?!$)/g, (w, _x, i) => (i === 0 ? w : w.toLowerCase()))
    .replace(/\bB&w\b/, 'B&W').replace(/\bSp\b/, 'SP').replace(/\bU\.m\.v\./i, 'U.M.V.');

/* A readable name from a file name, or null when the name is a camera
   counter or an upload hash and the piece should be numbered instead. */
function nameFromFile(path) {
  const stem = decodeURIComponent(path.split('/').pop()).replace(/\.\w+$/, '')
    .replace(/_A3_p\d+$/i, '').replace(/[_-]+/g, ' ').trim();
  if (!stem) return null;
  if (/^(dsc|img)\s?\d+$/i.test(stem)) return null;                 /* camera counters */
  if (/^[a-z0-9]{14,}$/i.test(stem) && /\d/.test(stem)) return null;  /* upload hashes */
  if (/^(main|sqm p|sp \d+)$/i.test(stem)) return null;               /* working names */
  return titleCase(stem);
}

export const CATEGORY_SHORT = {
  'Poster Designs': 'Posters',
  'Kinetic Showreel': 'Motion',
};

export const POSTER_CATEGORY = 'Poster Designs';

function build() {
  const out = [];
  workCategories.forEach((cat, ci) => {
    const cslug = pageSlug(cat.category);
    cat.items.forEach((item, si) => {
      const sslug = pageSlug(item.title);
      const series = titleCase(item.title);
      const base = {
        cat: cat.category,
        catSlug: cslug,
        catShort: CATEGORY_SHORT[cat.category] || cat.category,
        series,
        seriesSlug: sslug,
        kind: item.kind,
        year: item.year,
        href: `category.html?c=${cslug}#${sslug}`,
        order: ci * 1000 + si * 50,
      };

      /* a website is one product, not four screenshots */
      const sc = showcase[sslug];
      if (sc || item.live) {
        out.push({
          ...base,
          id: slug(item.title),
          title: sc ? sc.title : series,
          thumb: sc ? sc.hero : (item.mid || item.shots)[0],
          full: sc ? sc.hero : (item.full || item.shots)[0],
          note: sc ? sc.kind : item.kind,
          count: sc ? sc.gallery.length : (item.mid || item.shots).length,
        });
        return;
      }

      const mids = item.mid || item.shots;
      const fulls = item.full || item.shots;
      const used = new Set();
      mids.forEach((src, i) => {
        let name = nameFromFile(fulls[i] || src);
        /* a series that repeats its own title ("Jaipur Blues 2") keeps it */
        if (!name || used.has(name)) name = `${series} No. ${String(i + 1).padStart(2, '0')}`;
        used.add(name);
        out.push({
          ...base,
          id: `${slug(item.title)}--${slug(name)}`,
          title: name,
          thumb: src,
          small: (item.shots || [])[i] || src,
          full: fulls[i] || src,
          note: `${series} · ${i + 1} of ${mids.length}`,
          count: 1,
          order: base.order + i,
        });
      });
    });
  });
  return out;
}

export const pieces = build();
export const posters = pieces.filter((p) => p.cat === POSTER_CATEGORY);
export const categories = workCategories.map((c) => ({
  name: c.category,
  short: CATEGORY_SHORT[c.category] || c.category,
  slug: pageSlug(c.category),
}));
