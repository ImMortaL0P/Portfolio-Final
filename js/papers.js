/* Research. Every figure and number below comes from the papers
   themselves — nothing is rounded, restated or inferred.

   `summary` + `hints` are what the engineering index shows.
   Everything else belongs to the paper's own page. */

export const papers = [
  {
    slug: 'argon-mould-flow',
    title: 'Numerical Investigation of the Effect of Argon Injection on Liquid Steel Flow in the Mould of a Twin-Strand Slab Caster',
    short: 'Argon Injection &amp; Mould Flow',
    authors: 'Kumar Mangalam',
    venue: 'Submitted for publication',
    where: 'Steel Melting Shop 2, JSP Odisha',
    year: '2026',
    status: 'Under review',
    tags: ['Continuous casting', 'Mould flow', 'Computational study'],

    summary: 'Argon keeps a caster nozzle clear of alumina, but what it does to the flow arriving in the mould has never been settled &mdash; and cannot be measured on a producing machine. The question is answered computationally instead.',
    hints: [
      ['&minus;46%', 'mean meniscus speed'],
      ['70 &rarr; 36%', 'surface in the stable window'],
      ['4', 'argon rates compared'],
    ],

    /* Under review: results only. No manuscript, and nothing on how
       the computation was set up. */
    embargo: 'Full paper withheld while under review &mdash; results shown, method withheld.',
    lede: 'Argon is injected through the stopper rod to keep a caster nozzle clear of alumina and help inclusions float out. What it does to the flow arriving in the mould has never been settled, because it cannot be measured: argon cannot be switched off on a producing caster to obtain a control condition, its rate moves over too narrow a band to resolve an effect, and it varies with the same circumstances that govern casting speed.',
    body: [
      {
        h: 'The finding',
        p: [
          'Argon suppresses the meniscus. At the measured plant rate the mean meniscus speed falls by 46 per cent and the maximum by nearly as much, so the fraction of the free surface sitting inside the window associated with stable operation drops from 70 to 36 per cent.',
          'That is a shift in the <em>kind</em> of risk, not only its size: with the surface too slow, the danger moves away from slag entrainment and toward meniscus freezing.',
        ],
      },
      {
        h: 'The jet is flattened, not slowed',
        p: [
          'Across the argon range the jet inclination falls monotonically from 33.4 to 29.6 degrees while the jet speed rises. Gas hold-up is linear in injection rate to within 6 per cent.',
          'The surface also stops being symmetric about the strand: inner/outer asymmetry rises from 19.8 to 31.4 per cent as gas increases.',
        ],
      },
      {
        h: 'Why the plant record cannot answer it',
        p: [
          'Argon rate and casting speed move together on a working caster, so the apparent association between argon and mould-level stability does not survive control for speed. The effect is real, but it is not recoverable from operating data alone &mdash; which is the reason the study exists.',
        ],
      },
    ],
    findings: [
      ['&minus;46%', 'mean meniscus speed at the measured plant rate'],
      ['70 &rarr; 36%', 'of the surface inside the stable operating window'],
      ['33.4 &rarr; 29.6&deg;', 'jet inclination across the argon range'],
      ['19.8 &rarr; 31.4%', 'inner/outer meniscus asymmetry'],
    ],
    figs: [
      {
        src: 'assets/papers/figures/argon-flow-four-cases.webp',
        cap: 'Time-averaged flow on the wide-face centre plane at four argon rates, on one colour scale. Red contours mark the argon volume fraction. Adding gas lifts the jet and reorganises the recirculation the mould depends on.',
      },
      {
        src: 'assets/papers/figures/argon-rate-series.webp',
        cap: 'Left: meniscus speed from the strand centre to the narrow face, with the stable operating window shaded &mdash; the argon-free case sits inside it, the gassed cases fall out of it. Right: mean meniscus speed and jet inclination against argon rate.',
      },
      {
        src: 'assets/papers/figures/argon-meniscus-plan.webp',
        cap: 'The meniscus in plan view at two rates. Inner/outer asymmetry rises from 19.8 to 31.4 per cent as gas increases &mdash; the surface stops being symmetric about the strand.',
      },
    ],
  },

  {
    slug: 'twin-strand-speed',
    title: 'A Review on Twin Strand Slab Casting and Impact of Speed Variation on Quality of Steel',
    short: 'Twin-Strand Casting Speed',
    authors: 'Kumar Mangalam',
    venue: 'International Journal for Multidisciplinary Research',
    where: 'IJFMR &middot; Vol 08, Issue 04',
    year: '2026',
    tags: ['Continuous casting', 'Process metallurgy', 'Review'],
    doi: { href: 'https://doi.org/10.36948/ijfmr.2026.v08i04.83789', label: '10.36948/ijfmr.2026.v08i04.83789' },
    href: 'assets/papers/twin-strand-casting-speed-review.pdf',

    summary: 'Withdrawal speed is the dominant variable on a twin-strand caster: it fixes the time available for heat extraction, and with it shell growth, liquid core depth and the defect population. A review of where that leaves slab quality.',
    hints: [
      ['1.05 &rarr; 1.40', 'segregation index'],
      ['&lt;10 mm', 'shell above ~1.4 m/min'],
      ['+40%', 'longitudinal cracking'],
    ],

    lede: 'A single tundish feeding two parallel strands roughly doubles caster output at modest additional cost, which is why the configuration dominates high-tonnage flat steel. Within it, withdrawal speed governs almost everything that decides slab quality &mdash; and every caster has a speed window that is narrower than operators would like.',
    body: [
      {
        h: 'What speed costs',
        p: [
          'Faster withdrawal thins the mould-exit shell in inverse proportion to the square root of speed, lengthens the metallurgical length in direct proportion to it, and raises the ferrostatic load &mdash; intensifying centreline segregation, porosity and bulging. Abrupt speed transients are worse than a steady high speed: they thin the shell locally and trap solute-rich liquid.',
          'Too slow is also a defect condition. Below the window, mould flux does not melt properly and slag entrapment follows. An optimum band exists for every machine.',
        ],
      },
      {
        h: 'What widens the window',
        p: [
          'Dynamic soft reduction, optimised mould taper, high-frequency non-sinusoidal oscillation, electromagnetic braking and stirring, engineered mould fluxes and data-driven control each buy back part of the range.',
        ],
      },
      {
        h: 'Twin-strand specifics',
        p: [
          'Two strands drawing from one tundish raise problems a single-strand review would not reach: symmetric flow distribution between strands, sensitivity to any imbalance in the shared vessel, and the fact that a correction applied to one strand is rarely neutral for the other.',
        ],
      },
    ],
    findings: [
      ['1.05 &rarr; 1.40', 'centreline segregation index, 1.2 to 2.0 m/min'],
      ['&lt;10 mm', 'mould-exit shell above roughly 1.4 m/min'],
      ['+40%', 'longitudinal cracking above about 1.6 m/min'],
    ],
    figs: [
      {
        src: 'assets/papers/figures/review-shell-metallurgical-length.webp',
        cap: 'Mould-exit shell thickness and metallurgical length against casting speed. The shell thins as the inverse square root of speed while the liquid core runs deeper in direct proportion &mdash; the two curves that bracket the usable window.',
      },
      {
        src: 'assets/papers/figures/review-segregation-index.webp',
        cap: 'Centreline segregation index against casting speed, with and without dynamic soft reduction. Soft reduction is what keeps the index tolerable at the top of the speed range.',
      },
      {
        src: 'assets/papers/figures/review-oscillation-marks.webp',
        cap: 'Oscillation mark depth against oscillation frequency. Higher frequency shallows the marks, which is why non-sinusoidal high-frequency oscillation appears among the countermeasures.',
      },
    ],
  },

  {
    slug: 'rotary-blade',
    title: 'Design and Analysis of Cutting Blade for Rotary Type Grass Cutters',
    short: 'Rotary Cutting Blade',
    authors: 'Kumar Mangalam, Soumen Mandal',
    venue: 'International Research Journal of Modernization in Engineering Technology and Science',
    where: 'IRJMETS &middot; Vol 07, Issue 04',
    year: 'April 2025',
    tags: ['CFD', 'ANSYS Fluent', 'Static structural'],
    doi: { href: 'https://doi.org/10.56726/IRJMETS73979', label: '10.56726/IRJMETS73979' },
    mirror: { href: 'https://www.academia.edu/145001854/DESIGN_AND_ANALYSIS_OF_CUTTING_BLADE_FOR_ROTARY_TYPE_GRASS_CUTTERS', label: 'Academia.edu' },
    href: 'assets/papers/rotary-cutting-blade-design.pdf',

    summary: 'What happens to a mower blade if you add triangular fins to it. Simulated in ANSYS Fluent for the air flow around it, then checked structurally against the forces it meets in service.',
    hints: [
      ['20&deg;', 'cutting angle'],
      ['2500 RPM', 'structural case'],
      ['1702 N', 'shearing force at speed'],
    ],

    lede: 'A rotary cutter is a blade problem before it is anything else. This paper adds triangular fins to a stainless blade, simulates the air flow around it, and checks whether the aerodynamic gain survives the forces the blade actually meets.',
    body: [
      {
        h: 'Aerodynamics',
        p: [
          'The blade was analysed in ANSYS Fluent to resolve the flow around it. The fins cut turbulence at the trailing edge and reduce drag by a substantial margin against the unfinned blade &mdash; a design lever that costs nothing in material.',
        ],
      },
      {
        h: 'Structure',
        p: [
          'Deformation, strain energy and normal and shear stress were computed across the working speed range. The blade holds: at 2500 RPM it carries the loads it would meet in service without exceeding its limits, so the aerodynamic gain is not paid for in integrity.',
        ],
      },
      {
        h: 'Why it matters',
        p: [
          'Blade design for lawn equipment is usually treated as a cutting-geometry problem alone. The study argues that aerodynamics belongs in the same conversation: the same rotation that cuts also drags, and the drag is addressable.',
        ],
      },
    ],
    findings: [
      ['1702 N', 'shearing force at 2500 RPM'],
      ['340 N', 'at 500 RPM &mdash; linear in speed'],
      ['20&deg;', 'blade cutting angle'],
    ],
    figs: [
      {
        src: 'assets/papers/figures/blade-velocity-vectors.webp',
        cap: 'Velocity vectors around the finned blade. The fins break up the wake at the trailing edge, which is where the drag penalty on an unfinned blade is paid.',
      },
      {
        src: 'assets/papers/figures/blade-pressure-contours.webp',
        cap: 'Total pressure contours through the fluid domain, showing the pressure difference across the blade that the fin geometry is there to manage.',
      },
      {
        src: 'assets/papers/figures/blade-shearing-force.webp',
        cap: 'Shearing force against rotational speed, from 340 N at 500 RPM to 1702 N at 2500 RPM &mdash; the load case the structural analysis had to answer.',
      },
    ],
  },
];

export const hrefOfPaper = (slug) => `paper-${slug}.html`;
