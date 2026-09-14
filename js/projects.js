/* Engineering project pages — one record per eng-*.html.
   The HTML shells are thin: they set data-project and js/project.js
   renders from here, so the whole set shares one design system. */

export const projects = {

  fintabula: {
    n: '01',
    title: 'FinTabula',
    kicker: 'Financial-statement table extractor',
    years: '2024 &mdash; Now',
    discipline: 'AI Engineering',
    stack: ['FastAPI', 'pdfplumber', 'Gemini 1.5 Flash', 'openpyxl'],
    lede: 'A light web application that automates the tedious part of financial analysis &mdash; pulling balance sheets, income statements and cash-flow tables out of PDFs and into structured, presentation-ready workbooks.',
    live: { href: 'https://huggingface.co/spaces/kmangalam/FinTabula', label: 'Try it live' },
    stats: [
      ['2', 'extraction engines'],
      ['3 sheets', 'from one 10-K filing'],
      ['Free', 'on the local engine, no API cost'],
    ],
    shots: [
      {
        src: 'assets/projects/fintabula-upload.webp',
        cap: 'A Tesla 10-K dropped in: the pages render for review, and the engine is chosen before anything is parsed.',
      },
      {
        src: 'assets/projects/fintabula-sheet.webp',
        cap: 'The consolidated balance sheet, reconstructed. Two comparative year columns held apart, currency markers preserved, every cell editable before export.',
      },
      {
        src: 'assets/projects/fintabula-operations.webp',
        cap: 'Sheet two from the same filing &mdash; statements of operations across three years, each split into its own column.',
      },
    ],
    sections: [
      {
        h: 'Dual extraction engines',
        p: [
          '<strong>Local engine.</strong> <em>pdfplumber</em> parses vector-text statements on the machine itself &mdash; instant, private, zero cost. It calculates bounding boxes and infers table structure from strict coordinates.',
          '<strong>Gemini engine.</strong> When the layout defeats geometry &mdash; scanned pages, hierarchical headers, footnotes running across margins &mdash; Gemini 1.5 Flash reads the page as an image and reconstructs the table semantically, without splitting words in dense columns.',
        ],
      },
      {
        h: 'Interactive spreadsheet editor',
        p: [
          'Extraction is only half the job. The app ships a browser spreadsheet grid: preview every extracted sheet, double-click to correct a cell, add or drop rows and columns, rename or delete sheets &mdash; all before the export is generated.',
        ],
      },
      {
        h: 'Export that needs no cleanup',
        p: [
          'Output is a styled Excel workbook: zebra striping, bold navy headers, auto-fitted column widths and alignment that follows the data &mdash; numbers right, text left. It goes straight into a deck.',
        ],
      },
    ],
  },

  whatsapp: {
    n: '02',
    title: 'WhatsApp Command Center',
    kicker: 'An AI chief of staff for messy group chat',
    years: '2024 &mdash; Now',
    discipline: 'Generative AI',
    stack: ['TypeScript', 'React + Vite', 'Express', 'Baileys', 'SQLite', 'Gemini'],
    lede: 'An operations command center sitting directly on top of WhatsApp. It reads a live message database and turns chaotic group chatter into summaries, priority matrices and deadlines &mdash; and still works with the AI switched off.',
    live: { href: 'https://github.com/ImMortaL0P/Whatsapp-Agent', label: 'View on GitHub' },
    shots: [
      {
        src: 'assets/projects/wa-dashboard.webp',
        cap: 'Three panels: chats sorted into priority tiers on the left, the intelligence feed in the middle, the command terminal on the right &mdash; here answering <code>&gt; help</code> with its full command surface. Until a device is linked the feed says so plainly and shows the pairing code rather than faking data.',
      },
      {
        src: 'assets/projects/wa-deadlines.webp',
        cap: 'Deadlines lifted out of ordinary group messages and filed with a link back to the message they came from. Senders and group names are redacted here; the extraction is real.',
      },
    ],
    stats: [
      ['10&ndash;99', 'live AI priority score'],
      ['24h', 'rolling executive summary'],
      ['P1&ndash;P3', 'auto-extracted task matrix'],
      ['8', 'terminal commands'],
    ],
    sections: [
      {
        h: 'Smart chat navigator',
        p: [
          'Synchronised with the live WhatsApp database, it sorts threads into priority tiers &mdash; the handful of groups that actually matter, direct messages, and general noise &mdash; and computes a rolling priority score from 10 to 99, flagging deadline risk, unread volume and mentions of your own name in real time.',
        ],
      },
      {
        h: 'Intelligence feed',
        p: [
          'An executive summary of the last 24 hours, a mention radar, unread-group digests, and a task engine that lifts checklist items out of prose and files them into P1 critical, P2 important and P3 optional &mdash; with detected dates turned into countdowns rather than left buried in a thread.',
        ],
      },
      {
        h: 'Gemini terminal',
        p: [
          'An interactive command line over the same data. <code>&gt; summarize &lt;group&gt;</code>, <code>&gt; extract all deadlines</code> into a table, <code>&gt; draft response to &lt;contact&gt;</code> from chat context, <code>&gt; find all messages mentioning &lt;query&gt;</code>, <code>&gt; reply to &lt;contact&gt; &lt;message&gt;</code> to send for real, and <code>&gt; prepare briefing for today&rsquo;s call</code> to assemble the day&rsquo;s open items.',
        ],
      },
      {
        h: 'AFK mode',
        p: [
          'Switch it on before stepping away and any message that arrives gets an auto-response, logged afterwards with the full context that triggered it &mdash; so a day offline does not become an evening of scrollback.',
        ],
      },
      {
        h: 'Degrades honestly',
        p: [
          'The dashboard looks for a Gemini key at startup. With one, summaries, briefings and drafts are fully generative; without one it falls back to a regex NLP heuristic over the same real messages, so the tool keeps working offline rather than showing an error where the intelligence should be.',
          'Authentication happens once &mdash; a QR panel appears if the session drops, and credentials persist locally after a single scan.',
        ],
      },
      {
        h: 'Interface',
        p: [
          'TypeScript throughout, React and Vite on an Express backend. The UI borrows from Notion, Linear and a Bloomberg terminal &mdash; dark by default, tactical crimson accents, activity heatmaps, response analytics and a relationship graph across contacts.',
        ],
      },
    ],
  },

  scm: {
    n: '03',
    title: 'SCM Mission Control',
    kicker: 'Real-time supply-chain visibility',
    years: '2024 &mdash; Now',
    discipline: 'Logistics Dashboards',
    stack: ['React', 'TomTom Traffic API', 'OSRM', 'A* pathfinding', 'WAQI', 'Leaflet'],
    lede: 'A mission-control dashboard for a live logistics network out of Patna: every lane on one map, delay forecasting against real traffic and weather, and a shortest-path engine that proposes the reroute before a dispatcher asks for it.',
    live: { href: 'https://huggingface.co/spaces/kmangalam/scm-mission-control', label: 'Open the dashboard' },
    stats: [
      ['20', 'hubs monitored live'],
      ['40', 'transit lanes in the matrix'],
      ['5', 'live data sources cascaded'],
      ['A*', 'shortest-path routing'],
    ],
    shots: [
      {
        src: 'assets/projects/scm-overview.webp',
        cap: 'The overview: delivery KPIs against yesterday, every hub and lane drawn on a live map, and a thermal overlay that can be driven from real telemetry or a simulated weather profile.',
      },
      {
        src: 'assets/projects/scm-routes.webp',
        cap: 'Route optimisation. The lane matrix holds every warehouse-to-hub pair; picking one runs A* over the road graph and draws the candidate paths snapped to real roads, with the distance saved against the lane currently in use.',
      },
      {
        src: 'assets/projects/scm-weather.webp',
        cap: 'Twenty corridor cities with temperature, wind, rainfall and AQI, each scored for severity and translated into the delay it actually adds to that hub.',
      },
      {
        src: 'assets/projects/scm-apis.webp',
        cap: 'Diagnostics for the five feeds behind it &mdash; orders, TomTom traffic, the weather cascade, WAQI air quality and a disruption news feed &mdash; each independently re-syncable when a provider goes quiet.',
      },
    ],
    sections: [
      {
        h: 'Live route traffic',
        p: [
          'The dashboard reads current speed against free-flow speed straight from the TomTom Traffic Flow Segment API, and maps hub coordinates through OSRM so the lines on the map are real driving geometry rather than great-circle arcs. A time-seeded traffic simulator stands in when the API is unavailable, emulating highway blockages and peak hours.',
        ],
      },
      {
        h: 'A* lane optimisation',
        p: [
          'Forty transit lanes sit in a matrix of warehouses against delivery hubs. Selecting one runs A* across the road graph and lists the candidate paths hop by hop &mdash; Patna HQ &rarr; Patna &rarr; Asansol &rarr; Durgapur &rarr; Kolkata &mdash; against the route in service, so a dispatcher sees the kilometres saved before committing.',
          'Where the current lane is already optimal the panel says so plainly. A recommendation only appears when it is worth acting on.',
        ],
      },
      {
        h: 'Load-balanced weather cascade',
        p: [
          'Rather than lean on one provider, the system queries OpenWeatherMap, WeatherAPI, Visual Crossing and Open-Meteo by city priority tier, with air quality from WAQI. Everything is cached per city, so API consumption stays flat as the hub list grows.',
          'Each reading is scored for severity and converted into a delay estimate for that hub, which is what feeds the alerts and the impact-cost figure at the top of the board.',
        ],
      },
      {
        h: 'Synchronised refresh',
        p: [
          'A single-page React app on a shared countdown. Order details, transit incidents and fresh telemetry update in place &mdash; no reloads, no losing your position on the board &mdash; and any one feed can be force-synced from the diagnostics panel without disturbing the others.',
        ],
      },
    ],
  },

  tools101: {
    n: '04',
    title: 'Tools 101 Suite',
    kicker: 'A monorepo against repetitive work',
    years: '2024 &mdash; Now',
    discipline: 'Workflow Tools',
    stack: ['Python', 'Node.js', 'SQL', 'Telethon', 'Tkinter'],
    lede: 'A collection of standalone utilities built to strip repetition out of daily digital work. Nothing installs globally; each tool is independent, run from its own folder, and does one job completely.',
    live: { href: 'https://github.com/ImMortaL0P/TOOLS_101', label: 'View on GitHub' },
    stats: [
      ['3', 'independent tools'],
      ['MIT', 'open source'],
      ['Zero-config', 'each runs from its own folder'],
    ],
    sections: [
      {
        h: 'Telegram to Drive sync',
        p: [
          'Watches a Telegram channel strictly for PDFs, downloads them with a progress indicator in the terminal, streams them to a Google Drive folder in chunks, and deletes the local copy once the upload is confirmed. Telethon, asyncio and the Drive API, running happily on a machine with nothing to spare.',
        ],
      },
      {
        h: 'WhatsApp group tool',
        p: [
          'Reads phone numbers from a CSV and adds them to a group. QR login once per machine, with a batch script for Windows &mdash; and deliberately no Selenium or ChromeDriver, so it does not break every time a browser updates.',
        ],
      },
      {
        h: 'Floating launcher',
        p: [
          'A desktop widget in Python and Tkinter: always on top, draggable, 85% opacity, custom icons through Pillow. One click fires an application or a macro through <code>subprocess</code>, so routine tasks never require opening a terminal.',
        ],
      },
      {
        h: 'Design philosophy',
        p: [
          'The whole suite is built for frictionless execution. Whether it is moving files, parsing documents or dispatching messages, each tool runs silently, logs accurately and asks for no interface unless one is strictly necessary.',
        ],
      },
    ],
  },

  'pdf-bot': {
    n: '05',
    title: 'Telegram &rarr; Drive Sync',
    kicker: 'An archive that maintains itself',
    years: '2024',
    discipline: 'Python &amp; API',
    stack: ['Telethon', 'asyncio', 'Google Drive API'],
    lede: 'An asynchronous bridge between a Telegram channel and Google Drive. PDFs posted to the channel archive themselves, with nobody touching anything.',
    live: { href: 'https://github.com/ImMortaL0P/TOOLS_101', label: 'View on GitHub' },
    stats: [
      ['2 MB', 'resumable upload chunks'],
      ['Self-clearing', 'nothing left on disk after upload'],
    ],
    sections: [
      {
        h: 'Async operations and smart filtering',
        p: [
          'Built on Telethon and asyncio for high-throughput message parsing and concurrent media downloads. Smart filtering walks channel history and targets <code>application/pdf</code> strictly, so bandwidth never goes to irrelevant media.',
        ],
      },
      {
        h: 'Robust cloud streaming',
        p: [
          'Uploads run as 2MB chunked resumable streams through the Google API &mdash; stable even for large technical documents. The CLI draws its own progress bars for both the download and upload phases.',
        ],
      },
      {
        h: 'Zero footprint',
        p: [
          'Designed for resource-constrained hosts &mdash; a Raspberry Pi, a low-tier VPS. The local copy is deleted the moment the API verifies the upload succeeded.',
        ],
      },
    ],
  },

  jspl: {
    n: '06',
    title: 'Jindal Steel &amp; Power',
    kicker: 'Assistant Manager &mdash; Steel Melting Shop',
    years: 'Jul 2023 &mdash; Dec 2024',
    discipline: 'Process Control &amp; Operations',
    stack: ['Process control', 'KPI analytics', 'BI reporting'],
    lede: 'Control room engineer in the Steel Melting Shop, leading a team of 20+ engineers and operators across critical shift operations &mdash; and commissioning JSPL&rsquo;s first twin-strand slab caster.',
    stats: [
      ['2.4 m/min', 'highest casting speed'],
      ['980 min', 'longest SES ramping profile'],
      ['52 min', 'fastest restranding'],
      ['+9%', 'yield, year on year'],
      ['&minus;8%', 'scrap, year on year'],
      ['20+', 'engineers and operators led'],
    ],
    sections: [
      {
        h: 'Operations leadership',
        p: [
          'As Control Room Engineer my remit was process control: keeping the floor running, keeping it safe, and keeping it efficient across every shift. Twenty-plus engineers and operators reported into that room.',
        ],
      },
      {
        h: 'Commissioning Caster 2',
        p: [
          'I worked on the deployment and commissioning of Caster 2, JSPL&rsquo;s first high-speed twin-strand slab caster. Watching telemetry and issuing precise process-control commands from the control room, we stabilised operations and broke several internal records in the process.',
        ],
      },
      {
        h: 'Quality, yield and data',
        p: [
          'Improved process definition functions lifted yield 9% year on year and cut scrap 8%. Alongside that I ran KPI analytics for the shop &mdash; BI tooling and automated reporting that gave management operational data they could actually act on.',
        ],
      },
      {
        h: 'Recognition',
        p: [
          '<strong>Employee of the Month, April 2024.</strong> Selected from 200+ employees for the commissioning of the twin-strand caster and the resulting quality and yield gains.',
          '<strong>Shabbash Award.</strong> Recognised among 50+ employees for a record-time restart of production after the first capital shutdown of the CCM.',
        ],
      },
    ],
  },

  sail: {
    n: '07',
    title: 'SAIL &amp; EIL',
    kicker: 'Summer internships',
    years: 'May &mdash; Jul 2022',
    discipline: 'Heavy Machinery &amp; Engineering Design',
    stack: ['Locomotive maintenance', 'Process data sheets', 'Procurement engineering'],
    lede: 'Two internships at India&rsquo;s premier public-sector engineering enterprises &mdash; hands-on with heavy machinery maintenance at SAIL, then engineering design at EIL.',
    stats: [
      ['3', 'diesel-electric locomotives'],
      ['2', 'public-sector enterprises'],
    ],
    sections: [
      {
        h: 'Steel Authority of India',
        p: [
          'At Rourkela Steel Plant, one of SAIL&rsquo;s largest integrated works, I was placed in the Traffic &amp; Raw Materials department.',
          'The project was assisting maintenance on three diesel-electric locomotives managed under RITES: studying the mechanical and electrical subsystems, working through maintenance schedules, and seeing what it actually takes to keep heavy transport running in a high-stress industrial environment.',
        ],
        quote: 'Ensuring the continuous flow of raw materials is the lifeblood of an integrated steel plant.',
      },
      {
        h: 'Engineers India Limited',
        p: [
          'Then to EIL in New Delhi, a global engineering consultancy and EPC firm, in the Rotating Equipment Division &mdash; procurement engineering for industrial pumps.',
          'I read process flow diagrams and mechanical specifications and drafted the process data sheets that govern how pumps get specified and bought for large refinery and petrochemical projects.',
        ],
      },
    ],
  },

};

/* The engineering index and the prev/next pager both walk this list.
   JSPL and SAIL & EIL are work history, not projects — they live in the
   resume now, and their pages are reached from there. */
export const order = ['fintabula', 'whatsapp', 'scm', 'tools101', 'pdf-bot'];
export const hrefOf = (key) => `eng-${key}.html`;
