import './scroll.js';
import './motion.js';

/* --- Data Model --- */
export const workCategories = [
  {
    category: 'Engineering',
    tags: 'Web / Full-stack',
    items: [
      { year: '2026', kind: 'School Website', title: 'U.M.V. ADLA', href: 'https://umvadla.in/', thumb: 'assets/work/umv-adla.webp' },
      { year: '2026', kind: 'Hotel CRM', title: 'SHARDA PALACE', href: 'https://hotel-booking-crm-community.vercel.app/', thumb: 'assets/work/sharda-crm.webp' }
    ]
  },
  {
    category: 'Graphic Design',
    tags: 'Print / Brand',
    items: [
      { year: '2025', kind: 'Print', title: 'THE PASTEL VECTOR POSTERS', href: '#', thumb: 'assets/work/pastel-vector.webp' },
      { year: '2025', kind: 'Poster Series', title: 'ONE WORDERS SERIES', href: '#', thumb: 'assets/work/one-worders.webp' },
      { year: '2025', kind: 'Creative Series', title: 'MODERN HYPERREALISM', href: '#', thumb: 'assets/work/hyperrealism.webp' },
      { year: '2025', kind: 'Creative Series', title: 'PERSPECTIVE SERIES', href: '#', thumb: 'assets/Perspective/khznl6sjfq8ihp43g44c.webp' }
    ]
  },
  {
    category: 'Illustrations',
    tags: 'Vector / Digital Art',
    items: [
      { year: '2025', kind: 'Illustration Series', title: 'JAIPUR BLUES', href: '#', thumb: 'assets/Jaipur Blues/Jaipur Blues Title.webp' },
      { year: '2025', kind: 'Vector Icons', title: 'ICON PACKS', href: '#', thumb: 'assets/Icon Packs/24 Y2K RETRO FUTURISTIC SHAPES.webp' }
    ]
  },
  {
    category: 'Photography',
    tags: 'Street / B&W',
    items: [
      { year: '2025', kind: 'Street Series', title: 'STREETS OF PATNA', href: '#', thumb: 'assets/work/patna.webp' },
      { year: '2025', kind: 'Silhouette Series', title: 'B&W', href: '#', thumb: 'assets/dsc-2295.webp' }
    ]
  },
  {
    category: 'Static Creatives',
    tags: 'AI Made / Manipulated',
    items: [
      { year: '2025', kind: 'Static Creative', title: 'TRAVEL', href: '#', thumb: 'assets/Travel/evcc00hhl2baraepbpg8.webp' },
      { year: '2025', kind: 'Static Creative', title: 'FLORAL', href: '#', thumb: 'assets/Floral/cn2o6jieto9dforlwwix.webp' },
      { year: '2025', kind: 'Static Creative', title: 'POP ART', href: '#', thumb: 'assets/Pop Art/I_Love_Rollercoasters_A3_p01.webp' },
      { year: '2025', kind: 'Static Creative', title: 'MOTIVATION', href: '#', thumb: 'assets/Motivation/aucr6wybedndhm4b85pa.webp' },
      { year: '2025', kind: 'Static Creative', title: 'AUTOMOTIVE', href: '#', thumb: 'assets/Automotive/afoeg90rlfvjwawmenna.webp' },
      { year: '2025', kind: 'Static Creative', title: 'PERSONALITY', href: '#', thumb: 'assets/Personality/cwmldaonxtobvfefotyj.webp' }
    ]
  },
  {
    category: 'Mockups',
    tags: 'Product / Brand',
    items: [
      { year: '2025', kind: 'Packaging', title: 'LUNÉA SKINCARE', href: '#', thumb: 'assets/lunea-serum.webp' },
      { year: '2025', kind: 'Packaging', title: 'PACKAGING SPREAD', href: '#', thumb: 'assets/Packaging Mockups/Lunea Gift Pack.webp' },
      { year: '2025', kind: 'UI Mockup', title: 'DEVICE SHOWCASE', href: '#', thumb: 'assets/mockup-device.webp' }
    ]
  },
  {
    category: 'Motion & Clients',
    tags: 'Film / Brand',
    items: [
      { year: '2025', kind: 'Motion Graphics', title: "KINETIC SHOWREEL '25", href: '#', thumb: 'assets/work/showreel.webp' },
      { year: '2025', kind: 'Client Selects', title: 'SP SERVICES & BRUSH', href: '#', thumb: 'assets/sp-1.webp' }
    ]
  },
  {
    category: 'Typography',
    tags: 'Type / Lettering',
    items: [
      { year: '2025', kind: 'Retro / Vintage', title: 'RETRO TYPOGRAPHY', href: '#', thumb: 'assets/Retro Sticker.webp' },
      { year: '2025', kind: 'Illustration / Type', title: 'ILLUSTRATIVE LETTERING', href: '#', thumb: 'assets/Comic.webp' },
      { year: '2025', kind: 'Cut-Out / Collage', title: 'PAPER CRAFT TYPE', href: '#', thumb: 'assets/Paper Patched.webp' },
      { year: '2025', kind: 'Nature / Organic', title: 'BOTANICAL & FLORAL TYPE', href: '#', thumb: 'assets/Spring .webp' }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {

    // Populate Work list
    const workList = document.querySelector('.work-list');
    if (workList) {
        workCategories.forEach(cat => {
            const catEl = document.createElement('div');
            catEl.className = 'work-category';

            const catHead = document.createElement('div');
            catHead.className = 'cat-header';
            catHead.innerHTML = `
                <h3 class="display-m">${cat.category}</h3>
                <span class="meta" style="color: var(--on-light-3); padding-bottom: var(--s-1);">${cat.tags}</span>
            `;
            catEl.appendChild(catHead);

            const catItems = document.createElement('div');
            catItems.className = 'cat-items';

            cat.items.forEach(item => {
                const el = document.createElement('a');
                el.className = 'work-row';
                el.href = item.href;
                el.dataset.cursor = 'VIEW';

                el.innerHTML = `
                    <span class="work-row__meta meta">${item.year}, ${item.kind}</span>
                    <span class="work-row__thumb"><img src="${item.thumb}" alt="${item.title} — preview" loading="lazy" width="320" height="200"></span>
                    <h3 class="work-row__title display-m">${item.title}</h3>
                    <span class="work-row__icon display-m" aria-hidden="true">&#8599;</span>
                `;
                catItems.appendChild(el);
            });

            catEl.appendChild(catItems);
            workList.appendChild(catEl);
        });

        // Re-init hover effect from motion.js since rows are dynamically created
        window.initWorkRowHover && window.initWorkRowHover();
    }
});
