/* ------------------------------------------------------------------
   Websites → product showcase.
   Everything below was read off the running applications, not assumed.
------------------------------------------------------------------ */
export const showcase = {
  'u-m-v-adla': {
    title: 'U.M.V. Adla',
    full: 'Uchcha Madhyamik Vidyalaya, Adla, Naubatpur, Patna',
    kind: 'School Website + Admin',
    year: '2026',
    href: 'https://umvadla.in/',
    stack: ['React', 'MongoDB', 'Bilingual EN / हिं', 'Admin CMS'],
    lede: 'A Bihar government school teaching Class 9 to 12 needed a site its actual audience could use — parents checking whether admissions are open, students looking for a notice, officials verifying the school exists. Two scripts, one page, and nobody on staff who writes code.',
    hero: 'assets/showcase/umv-home.webp',
    features: [
      { n: '01', t: 'An admin panel that removes the developer',
        d: 'Eight modules behind a staff login: Notices, Routines, Press Notice, Gallery, System Images, Staff Directory, Admission &amp; Text, and a live System Health readout. Publishing an examination notice is a form submission — English title, Hindi title, PDF, publish — not a commit and a deploy. That is the difference between a site that stays current and one that freezes on launch day.',
        shot: 'assets/showcase/umv-admin.webp' },
      { n: '02', t: 'A gallery the school actually fills',
        d: 'Images upload into named categories with bilingual event names, a date and a description — 41 photographs across 8 categories at last count, stored against a linked Google Drive rather than in the repository. The school adds a sports day; nobody opens an editor.',
        shot: 'assets/showcase/umv-admin-gallery.webp' },

      { n: '03', t: 'Bilingual by construction, not by plugin',
        d: 'Every page runs English ⇄ Hindi from a toggle in the nav, with Devanagari set in Tiro Devanagari Hindi and Noto Sans Devanagari rather than left to a system fallback. Getting Devanagari to sit correctly beside a Latin grotesk is the hardest typographic problem on the site.',
        shot: 'assets/showcase/umv-home.webp' },
      { n: '04', t: 'An information architecture that matches the institution',
        d: 'About the School · Headmaster’s Message · Infrastructure · Academics, split into Overview, Secondary (9–10) and Sr. Secondary (11–12) · Staff · Gallery · Notices · Admission · Contact · Downloads · Mandatory Disclosure. Board codes sit on the class pages; the medium of instruction is stated up front.',
        shot: 'assets/showcase/umv-academics.webp' },
      { n: '05', t: 'The details a parent actually verifies',
        d: 'The UDISE code is surfaced in the hero, the admission banner states plainly whether the session is open or closed, and a mandatory disclosure page carries the statutory record. Trust signals, in the places people look for them.',
        shot: 'assets/showcase/umv-notices.webp' }
    ],
    gallery: [
      'assets/showcase/umv-home.webp',
      'assets/showcase/umv-academics.webp',
      'assets/showcase/umv-notices.webp',
      'assets/showcase/umv-gallery.webp',
      'assets/showcase/umv-admin.webp',
      'assets/showcase/umv-admin-gallery.webp'
    ]
  },

  'sharda-palace': {
    title: 'Sharda Palace',
    full: 'ShardaCRM — Sharda Palace Management, Deoghar',
    kind: 'Hotel CRM',
    year: '2026',
    href: 'https://hotel-booking-crm-community.vercel.app/',
    stack: ['Twelve modules', 'OTA reconciliation', 'Ledger → P&L'],
    lede: 'Not a marketing site — a property management system the hotel runs on. Bookings, billing, channel reconciliation and guest communication in one place, built so the front desk and the owner are looking at the same numbers.',
    hero: 'assets/showcase/crm-dashboard.webp',
    features: [
      { n: '01', t: 'A ledger that builds the accounts',
        d: 'Every booking payment and every expense posts to one ledger. Pick a date range and it resolves into Total Income, Total Expenses and Net Profit / Loss for that period — segmentable by room or taken property-wide, and exportable as a report. The owner gets a P&L without anyone opening a spreadsheet.',
        shot: 'assets/showcase/crm-ledger.webp' },
      { n: '02', t: 'OTA commission booked against the reservation',
        d: 'A Booking.com reservation posts twice: the payment as income, the channel commission as an expense tied to the same room and reference. Gross revenue, commission and net are visible per channel instead of being reconciled by hand at month end.',
        shot: 'assets/showcase/crm-ledger.webp' },
      { n: '03', t: 'Twelve modules, one surface',
        d: 'Dashboard · Bookings · Guests · Rooms · Calendar · Communications · Payments · Checkout &amp; Bill · Custom Invoice · Expenses &amp; Ledger · Channel Settings · Activity Logs. Occupancy by room type, upcoming arrivals and channel performance sit on the dashboard; bulk guest communication and a document repository sit behind it.',
        shot: 'assets/showcase/crm-dashboard.webp' },
      { n: '04', t: 'Built to be operated, not demonstrated',
        d: 'A system-health panel reports frontend, backend and database status in the sidebar, and an activity log records who changed what. The unglamorous parts are what make a back-office tool survive contact with a real property.',
        shot: 'assets/showcase/crm-dashboard.webp' }
    ],
    gallery: ['assets/showcase/crm-dashboard.webp', 'assets/showcase/crm-ledger.webp']
  }
};
