import { scrambleTo, swapTo } from './scramble.js';
/* ------------------------------------------------------------------
   HERO GENRE ENGINE
   A canvas that cycles through the eight disciplines, drawing a small
   generative animation for each. Nothing here is portfolio imagery —
   each scene is a diagram of how that kind of work is actually made.
------------------------------------------------------------------ */

/* Drawn straight onto the page ground: ink on paper, no panel behind it. */
/* The scenes are drawn in the page's own ink, so they have to follow the
   theme. These are reassigned from the live tokens at init and whenever
   the theme changes — the accent never moves. */
let INK_RGB = '17,17,17';
let INK_GAIN = 1;

/* Every mark in every scene goes through this, so one assignment in
   syncPalette() re-inks the whole set. Light ink on a near-black ground
   reads weaker than dark ink on paper at the same alpha, so dark mode
   carries a gain — the hierarchy between marks is preserved, the whole
   drawing just holds its presence. */
function ink(a) { return 'rgba(' + INK_RGB + ',' + Math.min(1, a * INK_GAIN) + ')'; }

let INK = '#111111';
let GROUND = '#111111';     /* "bright" marks are drawn in ink */
let DIM = ink(0.24);
let MID = ink(0.62);
const ACCENT = '#FF4C24';

function syncPalette() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  INK_RGB = dark ? '239,237,232' : '17,17,17';
  INK_GAIN = dark ? 1.6 : 1;
  INK = GROUND = dark ? '#EFEDE8' : '#111111';
  DIM = ink(dark ? 0.26 : 0.24);
  MID = ink(dark ? 0.64 : 0.62);
}
syncPalette();
addEventListener('themechange', syncPalette);

const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
/* staggered sub-progress: piece i of n, each taking `span` of the timeline */
const step = (t, i, n, span = 0.55) => clamp01((t - (i / n) * (1 - span)) / span);

/* ---------- 01 Photography: an aperture, thirds, grain ---------- */
function photography(c, w, h, t) {
  const cx = w / 2, cy = h * 0.46, R = Math.min(w, h) * 0.27;
  const open = 0.30 + 0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 - Math.PI / 2));

  c.strokeStyle = DIM; c.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    c.beginPath(); c.moveTo(w * i / 3, 0); c.lineTo(w * i / 3, h); c.stroke();
    c.beginPath(); c.moveTo(0, h * i / 3); c.lineTo(w, h * i / 3); c.stroke();
  }

  const blades = 7;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2 + t * 0.6;
    const a2 = ((i + 1) / blades) * Math.PI * 2 + t * 0.6;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * R * 1.7, cy + Math.sin(a) * R * 1.7);
    c.lineTo(cx + Math.cos(a) * R * open, cy + Math.sin(a) * R * open);
    c.lineTo(cx + Math.cos(a2) * R * open, cy + Math.sin(a2) * R * open);
    c.lineTo(cx + Math.cos(a2) * R * 1.7, cy + Math.sin(a2) * R * 1.7);
    c.closePath();
    c.fillStyle = i % 2 ? ink(0.13) : ink(0.07);
    c.fill();
    c.strokeStyle = ink(0.42); c.stroke();
  }

  c.beginPath(); c.arc(cx, cy, R * open, 0, Math.PI * 2);
  c.strokeStyle = ACCENT; c.lineWidth = 3; c.stroke();

  c.fillStyle = MID; c.font = '11px "Spline Sans Mono", monospace';
  c.fillText('f/' + (1.4 + open * 6).toFixed(1), 16, h - 42);
  c.fillText('1/250  ISO 200', 16, h - 24);
}

/* ---------- 02 Illustrations: a profile drawn the way you'd draw one ----------
   Construction marks first, then the contour, then hatching, then the one
   piece of colour. That sequence is the actual craft, so it's the diagram. */
function catmullRom(pts, samples) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (let j = 0; j < samples; j++) {
      const t = j / samples, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
      ]);
    }
  }
  return out;
}

/* left-facing profile, normalised to a 0..1 box */
const HEAD = [
  [0.62, 0.04], [0.44, 0.07], [0.31, 0.16], [0.26, 0.28],
  [0.27, 0.36], [0.21, 0.45], [0.30, 0.50], [0.27, 0.56],
  [0.32, 0.62], [0.29, 0.70], [0.41, 0.80], [0.58, 0.85],
  [0.73, 0.78], [0.79, 0.60], [0.80, 0.34], [0.74, 0.13]
];

function illustrations(c, w, h, t) {
  const S = Math.min(w, h * 0.92);
  const ox = (w - S) / 2, oy = (h - S) / 2 - h * 0.02;
  const P = (p) => [ox + p[0] * S, oy + p[1] * S];
  const pts = catmullRom(HEAD, 14).map(P);

  /* 1. construction — the marks you make before you commit */
  const con = clamp01(t / 0.18);
  if (con > 0) {
    c.save();
    c.globalAlpha = con * (1 - clamp01((t - 0.62) / 0.22) * 0.55);
    c.strokeStyle = DIM; c.lineWidth = 1; c.setLineDash([4, 5]);
    const cx = ox + S * 0.52, cy = oy + S * 0.42, R = S * 0.29;
    c.beginPath(); c.arc(cx, cy, R * con, 0, Math.PI * 2); c.stroke();
    c.beginPath();
    c.moveTo(ox + S * 0.18, cy); c.lineTo(ox + S * 0.86, cy);      /* eye line   */
    c.moveTo(ox + S * 0.20, oy + S * 0.56); c.lineTo(ox + S * 0.86, oy + S * 0.56); /* nose base */
    c.moveTo(ox + S * 0.24, oy + S * 0.68); c.lineTo(ox + S * 0.86, oy + S * 0.68); /* mouth line */
    c.stroke();
    c.setLineDash([]);
    c.restore();
  }

  /* 2. contour — one continuous line, drawn */
  const draw = easeInOut(clamp01((t - 0.10) / 0.48));
  const upto = Math.floor(pts.length * draw);
  if (upto > 1) {
    c.beginPath();
    for (let i = 0; i < upto; i++) i ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[0][0], pts[0][1]);
    c.strokeStyle = ink(0.92);
    c.lineWidth = 2.4; c.lineJoin = 'round'; c.lineCap = 'round';
    c.stroke();
    if (draw < 1) {
      const tip = pts[upto - 1];
      c.beginPath(); c.arc(tip[0], tip[1], 3.5, 0, Math.PI * 2);
      c.fillStyle = ACCENT; c.fill();
    }
  }

  /* 3. hatching — shading, clipped inside the head */
  const hatch = clamp01((t - 0.52) / 0.30);
  if (hatch > 0 && draw >= 1) {
    const clip = new Path2D();
    pts.forEach((p, i) => i ? clip.lineTo(p[0], p[1]) : clip.moveTo(p[0], p[1]));
    clip.closePath();
    c.save(); c.clip(clip);
    c.strokeStyle = ink(0.30); c.lineWidth = 1.4;
    const gap = 9, span = S * 1.15;
    const lines = Math.floor(span / gap);
    for (let i = 0; i < lines * hatch; i++) {
      const d = ox + S * 0.46 + i * gap;
      c.beginPath(); c.moveTo(d, oy - S * 0.1); c.lineTo(d - S * 0.55, oy + S * 1.05); c.stroke();
    }
    c.restore();
  }

  /* 4. the one piece of colour */
  const col = clamp01((t - 0.74) / 0.22);
  if (col > 0) {
    const ex = ox + S * 0.375, ey = oy + S * 0.415;
    c.save();
    c.globalAlpha = col;
    c.beginPath();
    c.ellipse(ex, ey, S * 0.058, S * 0.030, -0.12, 0, Math.PI * 2);
    c.fillStyle = ACCENT; c.fill();
    c.beginPath(); c.arc(ex + S * 0.004, ey, S * 0.013, 0, Math.PI * 2);
    c.fillStyle = GROUND; c.fill();
    /* brow */
    c.beginPath();
    c.moveTo(ex - S * 0.075, ey - S * 0.065); c.quadraticCurveTo(ex, ey - S * 0.092, ex + S * 0.072, ey - S * 0.060);
    c.strokeStyle = ink(0.88); c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
    c.restore();
  }

  c.fillStyle = MID; c.font = '11px "Spline Sans Mono", monospace';
  const stage = t < 0.18 ? 'CONSTRUCTION' : t < 0.58 ? 'CONTOUR' : t < 0.80 ? 'SHADING' : 'COLOUR';
  c.fillText(stage, 0, h - 8);
}

/* ---------- 03 Design: a modular grid assembling ---------- */
function design(c, w, h, t) {
  const cols = 6, rows = 8, pad = w * 0.14;
  const gw = (w - pad * 2) / cols, gh = (h * 0.78 - pad) / rows;
  const oy = h * 0.1;

  c.strokeStyle = DIM; c.lineWidth = 1.2;
  for (let x = 0; x <= cols; x++) {
    c.beginPath(); c.moveTo(pad + x * gw, oy); c.lineTo(pad + x * gw, oy + rows * gh); c.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    c.beginPath(); c.moveTo(pad, oy + y * gh); c.lineTo(pad + cols * gw, oy + y * gh); c.stroke();
  }

  const blocks = [
    [0, 0, 4, 2], [4, 0, 2, 2], [0, 2, 2, 3],
    [2, 2, 4, 3], [0, 5, 6, 1], [0, 6, 3, 2], [3, 6, 3, 2]
  ];
  blocks.forEach((b, i) => {
    const s = easeOut(step(t, i, blocks.length, 0.5));
    if (s <= 0) return;
    const x = pad + b[0] * gw, y = oy + b[1] * gh;
    const bw = b[2] * gw, bh = b[3] * gh;
    c.globalAlpha = s;
    c.fillStyle = i === 3 ? ACCENT : ink(0.17 + (i % 3) * 0.11);
    c.fillRect(x + 3, y + 3 - (1 - s) * 14, bw - 6, bh - 6);
    c.globalAlpha = 1;
  });
}

/* ---------- 04 Poster Designs: halftone + type blocks ---------- */
function posters(c, w, h, t) {
  const pw = w * 0.54, ph = pw * Math.SQRT2, px = (w - pw) / 2, py = h * 0.5 - ph / 2;

  c.fillStyle = ink(0.08); c.fillRect(px, py, pw, ph);
  c.strokeStyle = DIM; c.lineWidth = 1; c.strokeRect(px, py, pw, ph);

  /* halftone disc swelling */
  const grow = 0.55 + 0.45 * Math.sin(t * Math.PI * 2 - Math.PI / 2);
  const R = pw * 0.34 * grow, cx = px + pw / 2, cy = py + ph * 0.34;
  const gap = 7;
  for (let y = -R; y < R; y += gap) {
    for (let x = -R; x < R; x += gap) {
      const d = Math.hypot(x, y);
      if (d > R) continue;
      const r = (1 - d / R) * 3.1;
      c.beginPath(); c.arc(cx + x, cy + y, r, 0, Math.PI * 2);
      c.fillStyle = d / R < 0.34 ? ACCENT : ink(0.78);
      c.fill();
    }
  }

  const bars = [[0.62, 0.74], [0.70, 0.52], [0.78, 0.34]];
  bars.forEach((b, i) => {
    const s = easeOut(step(t, i, bars.length, 0.6));
    c.fillStyle = i === 0 ? GROUND : MID;
    c.fillRect(px + pw * 0.1, py + ph * b[0], pw * b[1] * s, i === 0 ? 13 : 6);
  });
}

/* ---------- 05 Websites: a wireframe that reflows ---------- */
function websites(c, w, h, t) {
  const narrow = clamp01((t - 0.45) / 0.28) - clamp01((t - 0.86) / 0.14);
  const bw = w * (0.74 - 0.36 * narrow), bh = h * 0.62;
  const bx = (w - bw) / 2, by = h * 0.2;

  c.strokeStyle = ink(0.80); c.lineWidth = 1.6;
  c.strokeRect(bx, by, bw, bh);
  c.fillStyle = ink(0.13); c.fillRect(bx, by, bw, 22);
  [0, 1, 2].forEach((i) => {
    c.beginPath(); c.arc(bx + 13 + i * 13, by + 11, 3.2, 0, Math.PI * 2);
    c.fillStyle = i === 0 ? ACCENT : DIM; c.fill();
  });

  const ix = bx + 14, iy = by + 36, iw = bw - 28;
  c.fillStyle = GROUND; c.fillRect(ix, iy, iw * 0.62, 12);
  c.fillStyle = DIM; c.fillRect(ix, iy + 20, iw * 0.44, 6);

  /* three cards: side by side, then stacked when narrow */
  const cy0 = iy + 42;
  for (let i = 0; i < 3; i++) {
    const wide = { x: ix + i * (iw / 3), y: cy0, w: iw / 3 - 8, h: bh * 0.3 };
    const tall = { x: ix, y: cy0 + i * (bh * 0.19), w: iw, h: bh * 0.15 };
    /* each card moves in turn, so they never overlap mid-reflow */
    const ni = easeInOut(clamp01((narrow - i * 0.14) / 0.72));
    const x = wide.x + (tall.x - wide.x) * ni;
    const y = wide.y + (tall.y - wide.y) * ni;
    const cw = wide.w + (tall.w - wide.w) * ni;
    const ch = wide.h + (tall.h - wide.h) * ni;
    c.fillStyle = i === 1 ? 'rgba(255,76,36,0.38)' : ink(0.13);
    c.fillRect(x, y, cw, ch);
    c.strokeStyle = i === 1 ? ACCENT : DIM; c.lineWidth = 1; c.strokeRect(x, y, cw, ch);
  }

  c.fillStyle = MID; c.font = '11px "Spline Sans Mono", monospace';
  c.fillText(narrow > 0.5 ? '390px' : '1440px', bx, by - 10);
}

/* ---------- 06 Brand Design: a mark resolving ---------- */
function brand(c, w, h, t) {
  const cx = w / 2, cy = h * 0.40;
  const R = Math.min(w, h) * 0.215;

  /* three acts: guides draw, mark assembles, system proves itself */
  const a1 = easeInOut(clamp01(t / 0.34));            /* construction */
  const a2 = easeInOut(clamp01((t - 0.26) / 0.40));   /* lockup */
  const a3 = easeInOut(clamp01((t - 0.66) / 0.34));   /* scale proof */
  const guides = 1 - a3;                              /* guides retire last */

  /* ---- construction geometry ---- */
  c.save();
  c.translate(cx, cy);
  c.lineWidth = 1;
  c.strokeStyle = ink(0.20 * guides);

  c.beginPath(); c.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a1); c.stroke();

  if (guides > 0.02) {
    c.setLineDash([3, 5]);
    c.beginPath(); c.arc(0, 0, R * 1.34, 0, Math.PI * 2 * a1); c.stroke();
    const g = R * 1.34 * a1;
    c.beginPath(); c.moveTo(-g, 0); c.lineTo(g, 0); c.moveTo(0, -g); c.lineTo(0, g); c.stroke();
    /* the 45s a monogram actually gets built on */
    const d = g * 0.72;
    c.beginPath(); c.moveTo(-d, -d); c.lineTo(d, d); c.moveTo(-d, d); c.lineTo(d, -d); c.stroke();
    c.setLineDash([]);
  }
  c.restore();

  /* ---- the mark: an M cut from three strokes, swinging into lockup ---- */
  const drawMark = (s, alpha, accent) => {
    const r = R * s;
    c.save();
    c.scale(s, s);
    c.lineWidth = Math.max(1.2, 3 / Math.max(s, 0.35)) * s;
    c.lineCap = 'butt';
    c.lineJoin = 'miter';

    const legs = [[-1, 1], [0, -1], [1, 1]];
    for (let i = 0; i < 3; i++) {
      const settle = easeInOut(clamp01((a2 - i * 0.12) / 0.7));
      const swing = (1 - settle) * (i === 1 ? 0.9 : -0.6);
      c.save();
      c.rotate(swing);
      c.globalAlpha = alpha * settle;
      c.strokeStyle = (accent && i === 1) ? ACCENT : INK;
      c.lineWidth = R * 0.145;
      const x = legs[i][0] * R * 0.42;
      const top = -R * 0.46, bot = R * 0.46;
      c.beginPath();
      if (i === 1) { c.moveTo(-R * 0.42, top); c.lineTo(0, bot * 0.55); c.lineTo(R * 0.42, top); }
      else { c.moveTo(x, top); c.lineTo(x, bot); }
      c.stroke();
      c.restore();
    }
    c.restore();
    return r;
  };

  c.save(); c.translate(cx, cy); drawMark(1, 1, true); c.restore();

  /* ---- act three: the same mark at three sizes, on a baseline ---- */
  if (a3 > 0.01) {
    const sizes = [0.42, 0.26, 0.15];
    const gap = R * 0.9;
    let x = cx - gap;
    const y = cy + R * 2.05;
    c.save();
    c.globalAlpha = a3;
    sizes.forEach((s, i) => {
      const appear = clamp01((a3 - i * 0.18) / 0.5);
      if (appear <= 0) return;
      c.save();
      c.translate(x, y);
      c.globalAlpha = a3 * appear;
      drawMark(s, 1, false);
      c.restore();
      c.font = '10px "Spline Sans Mono", monospace';
      c.textAlign = 'center';
      c.fillStyle = DIM;
      c.fillText(['64', '32', '16'][i] + 'px', x, y + R * 0.62);
      x += gap;
    });
    c.restore();
  }

  /* ---- wordmark: tracking settles as the mark locks ---- */
  const word = 'IDENTITY';
  c.font = '13px "Spline Sans Mono", monospace';
  c.textAlign = 'left';
  const track = 22 - 14 * a2;
  const total = word.length * track;
  const wy = cy + R * 1.5;
  c.fillStyle = MID;
  c.globalAlpha = a2;
  for (let i = 0; i < word.length; i++) {
    c.fillText(word[i], cx - total / 2 + i * track, wy);
  }
  c.globalAlpha = 1;

  c.strokeStyle = DIM;
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx - total / 2, wy + 12);
  c.lineTo(cx - total / 2 + total * a2, wy + 12);
  c.stroke();
}

/* ---------- 07 Kinetic Showreel: type on a timeline ---------- */
function showreel(c, w, h, t) {
  const words = ['CUT', 'BEAT', 'HOLD', 'SNAP'];
  const beat = t * words.length;
  const idx = Math.min(words.length - 1, Math.floor(beat));
  const local = beat - idx;
  const pop = 1 + 0.5 * Math.pow(1 - local, 5);

  c.save();
  c.translate(w / 2, h * 0.44);
  c.scale(pop, pop);
  c.textAlign = 'center';
  c.font = '700 ' + Math.round(w * 0.2) + 'px Anton, Impact, sans-serif';
  c.fillStyle = GROUND;
  c.fillText(words[idx], 0, 0);
  c.globalAlpha = 0.35 * (1 - local);
  c.fillStyle = ACCENT;
  c.fillText(words[idx], 6 * (1 - local), -6 * (1 - local));
  c.globalAlpha = 1;
  c.restore();
  c.textAlign = 'left';

  /* timeline */
  const tx = w * 0.12, tw = w * 0.76, ty = h * 0.74;
  c.strokeStyle = DIM; c.lineWidth = 1;
  c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + tw, ty); c.stroke();
  for (let i = 0; i <= 24; i++) {
    const x = tx + (tw * i) / 24;
    const tall = i % 6 === 0;
    c.beginPath(); c.moveTo(x, ty); c.lineTo(x, ty + (tall ? 10 : 5));
    c.strokeStyle = tall ? MID : DIM; c.stroke();
  }
  c.fillStyle = ACCENT; c.fillRect(tx + tw * t - 1, ty - 14, 2, 28);
  c.fillStyle = MID; c.font = '11px "Spline Sans Mono", monospace';
  c.fillText('00:' + String(Math.floor(t * 58)).padStart(2, '0'), tx, ty + 30);
}

/* ---------- 08 Typography: one glyph, extruded ---------- */
function typography(c, w, h, t) {
  const size = Math.round(w * 0.40);
  const osc = Math.sin(t * Math.PI * 2);
  const layers = 9;

  c.textAlign = 'center';
  c.font = '700 ' + size + 'px Anton, Impact, sans-serif';
  const cx = w / 2, cy = h * 0.52;

  for (let i = layers; i >= 1; i--) {
    const k = i / layers;
    c.fillStyle = ink(0.06 + k * 0.11);
    c.fillText('Aa', cx + osc * 16 * k, cy + osc * 10 * k);
  }
  c.fillStyle = GROUND;
  c.fillText('Aa', cx, cy);

  /* baseline + x-height guides */
  c.strokeStyle = ACCENT; c.lineWidth = 1;
  c.beginPath(); c.moveTo(w * 0.1, cy + 2); c.lineTo(w * 0.9, cy + 2); c.stroke();
  c.strokeStyle = DIM;
  c.beginPath(); c.moveTo(w * 0.1, cy - size * 0.52); c.lineTo(w * 0.9, cy - size * 0.52); c.stroke();
  c.beginPath(); c.moveTo(w * 0.1, cy - size * 0.72); c.lineTo(w * 0.9, cy - size * 0.72); c.stroke();

  c.textAlign = 'left';
  c.fillStyle = MID; c.font = '11px "Spline Sans Mono", monospace';
  c.fillText('baseline', w * 0.1, cy + 18);
  c.fillText('x-height', w * 0.1, cy - size * 0.52 - 7);
}

export const SCENES = [
  { n: '01', name: 'Photography',      note: 'Light, framing, the decisive moment', draw: photography },
  { n: '02', name: 'Illustrations',    note: 'One line, then everything after it',  draw: illustrations },
  { n: '03', name: 'Graphic Design',   note: 'A grid, and the judgement to break it', draw: design },
  { n: '04', name: 'Poster Designs',   note: 'One idea, read from across the room',  draw: posters },
  { n: '05', name: 'Websites',         note: 'Designed and built by the same hands', draw: websites },
  { n: '06', name: 'Brand Design',     note: 'A mark that still works at 16px',      draw: brand },
  { n: '07', name: 'Kinetic Showreel', note: 'Type that moves on the beat',          draw: showreel },
  { n: '08', name: 'Typography',       note: 'Letterforms as the whole argument',    draw: typography }
];

export function initGenreEngine() {
  const host = document.querySelector('.hero-genre');
  if (!host) return;

  host.innerHTML = `
    <div class="genre-stage">
      <canvas class="genre-canvas"></canvas>
      <div class="genre-corner meta">DISCIPLINE</div>
    </div>
    <div class="genre-caption">
      <span class="genre-n meta">01</span>
      <h2 class="genre-name">Photography</h2>
      <p class="genre-note">Light, framing, the decisive moment</p>
    </div>
    <ol class="genre-rail" role="tablist" aria-label="Disciplines">
      ${SCENES.map((s, i) => `
        <li><button type="button" role="tab" data-i="${i}"
            aria-selected="${i === 0}" aria-label="${s.name}">
          <span class="genre-rail__fill"></span>
        </button></li>`).join('')}
    </ol>`;

  const cv = host.querySelector('.genre-canvas');
  const ctx = cv.getContext('2d');
  const elN = host.querySelector('.genre-n');
  const elName = host.querySelector('.genre-name');
  const elNote = host.querySelector('.genre-note');
  const bars = [...host.querySelectorAll('.genre-rail button')];

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = 5200;
  let i = 0, start = performance.now(), paused = false, pinned = false, raf = 0;

  function size() {
    const r = cv.getBoundingClientRect();
    const d = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * d);
    cv.height = Math.round(r.height * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  new ResizeObserver(size).observe(cv);
  size();

  function label(k) {
    const s = SCENES[k];
    elN.textContent = s.n;
    scrambleTo(elName, s.name);
    swapTo(elNote, s.note);
    bars.forEach((b, j) => b.setAttribute('aria-selected', String(j === k)));
  }

  function go(k) { i = ((k % SCENES.length) + SCENES.length) % SCENES.length; start = performance.now(); label(i); }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const r = cv.getBoundingClientRect();
    if (r.width < 2) return;

    let t = (now - start) / DUR;
    if (t >= 1) {
      /* Hover and a pinned choice hold the discipline, but the scene keeps
         playing — freezing mid-fade just looks broken. */
      if (paused || pinned) { start = now; t = 0; }
      else { go(i + 1); t = 0; }
    }

    ctx.clearRect(0, 0, r.width, r.height);

    /* fade the scene in and out at the seams */
    const fade = Math.min(1, t / 0.06, (1 - t) / 0.06);
    ctx.globalAlpha = reduce ? 1 : fade;
    SCENES[i].draw(ctx, r.width, r.height, reduce ? 0.5 : t);
    ctx.globalAlpha = 1;

    bars.forEach((b, j) => {
      const f = b.querySelector('.genre-rail__fill');
      f.style.transform = 'scaleX(' + (j < i ? 1 : j === i ? t : 0) + ')';
    });
  }

  /* only animate while the panel is actually on screen */
  new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting && !raf) { start = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    });
  }, { threshold: 0.05 }).observe(host);

  host.addEventListener('mouseenter', () => { paused = true; });
  host.addEventListener('mouseleave', () => { paused = false; });
  bars.forEach((b) => {
    b.addEventListener('click', () => { pinned = true; go(+b.dataset.i); });
    b.addEventListener('focus', () => { paused = true; });
    b.addEventListener('blur', () => { paused = false; });
  });

  document.fonts && document.fonts.ready.then(size);
  label(0);
}
