import './scroll.js';
import './motion.js';

/* --- Data Model (Section 8) --- */
export const work = [
  { year: '2026', kind: 'School Website', title: 'U.M.V. ADLA',      href: 'https://umvadla.in/', thumb: 'assets/work/umv-adla.webp' },
  { year: '2026', kind: 'Hotel CRM',      title: 'SHARDA PALACE',    href: 'https://hotel-booking-crm-community.vercel.app/', thumb: 'assets/work/sharda-crm.webp' },
  { year: '2025', kind: 'Motion',       title: "KINETIC SHOWREEL '25",    href: '#', thumb: 'assets/work/showreel.webp' },
  { year: '2025', kind: 'Poster Series',title: 'THE PASTEL VECTOR POSTERS',href: '#', thumb: 'assets/work/pastel-vector.webp' },
  { year: '2025', kind: 'Poster Series',title: 'ONE WORDERS SERIES',      href: '#', thumb: 'assets/work/one-worders.webp' },
  { year: '2025', kind: 'Creative',     title: 'MODERN HYPERREALISM',     href: '#', thumb: 'assets/work/hyperrealism.webp' },
  { year: '2025', kind: 'Street',       title: 'STREETS OF PATNA',        href: '#', thumb: 'assets/work/patna.webp' }
];

document.addEventListener('DOMContentLoaded', () => {
    
    // Populate Work list
    const workList = document.querySelector('.work-list');
    if (workList) {
        work.forEach(item => {
            const el = document.createElement('a');
            el.className = 'work-row';
            el.href = item.href;
            el.dataset.cursor = 'VIEW';
            
            // Thumbnail setup (if it's video, use video tag ideally but spec says img preview)
            el.innerHTML = `
                <span class="work-row__meta meta">${item.year}, ${item.kind}</span>
                <span class="work-row__thumb"><img src="${item.thumb}" alt="${item.title} — preview" loading="lazy" width="320" height="200"></span>
                <h3 class="work-row__title display-m">${item.title}</h3>
                <span class="work-row__icon display-m" aria-hidden="true">&#8599;</span>
            `;
            workList.appendChild(el);
        });
        
        // Re-init hover effect from motion.js since rows are dynamically created
        window.initWorkRowHover && window.initWorkRowHover();
    }
});
