# Dev Notes — Mangalam Portfolio

Single-page static portfolio site. No build step, no framework, no package.json — `index.html` is the entire site (HTML + CSS + JS inline). Deployed via GitHub Pages using the `CNAME` file at the repo root.

## Files

- `index.html` — the live site. Everything lives here.
- `assets/` — images (`.webp`, `.jpg`), videos (`.mp4`), poster frames (`.jpg`), `favicon.svg`. Typography and Mockups sections currently use generated placeholder `.jpg` images (prefixed `typo-*` / `mockup-*`) — swap these for real work assets when available.
- `portfolio.html` — an older draft with the previous "Noir Luxe" theme. **Not linked from anywhere, not deployed.** Safe to ignore or delete; kept only for reference.
- `CNAME` — custom domain for GitHub Pages.

## Running locally

No build tooling needed — just serve the directory statically:

```bash
python3 -m http.server 8934
# open http://localhost:8934/index.html
```

## Design system (current)

Direction: **neo-brutalist maximalism** — thick borders, hard offset drop-shadows, oversized uppercase display type, animated gradient blobs, color-blocked sections. Chosen deliberately over the site's previous "Noir Luxe" (dark brown/gold, serif, subtle) aesthetic — see git history (`revamped` commit) for the before/after.

**Palette** — "Warm Sunset", defined as CSS custom properties in `:root` (top of `<style>`):

| Variable | Value | Role |
|---|---|---|
| `--bg` | `#120a10` | page background (deep plum-black) |
| `--surface` / `--surface-2` | `#1e1218` / `#291721` | card/panel backgrounds |
| `--cream` | `#f7ede1` | primary text, light-panel backgrounds |
| `--cream-dim` | `#b3a196` | secondary/muted text |
| `--ink` | `#120a10` | text on light/accent backgrounds |
| `--lime` | `#ff6b4a` (coral) | accent 1 — Graphic Design category, primary CTA |
| `--pink` | `#ffb703` (amber) | accent 2 — Photography category, ticker bg |
| `--violet` | `#d94fd4` (magenta) | accent 3 — Motion & Clients category, contact modal |
| _(inline)_ | `#2ec4b6` (teal) | accent 4 — Typography category |
| _(inline)_ | `#e76f51` (terracotta) | accent 5 — Mockups category |

Variable names (`--lime`/`--pink`/`--violet`) are legacy from an earlier palette iteration and no longer match their literal colors — if reassigning colors again, just edit the values in `:root`, no need to rename. Accents 4 & 5 are set directly on `.cat-block:nth-of-type(4)` / `(5)` rather than as CSS custom properties; promote them to `:root` variables if they start being referenced elsewhere. To change the palette again, `:root` + those two `nth-of-type` rules are the only blocks that need touching; everything else references `var(...)`.

**Type**: `Bricolage Grotesque` (800 weight, uppercase, headlines/display) + `Space Grotesk` (body/UI), both Google Fonts, loaded via `<link>` in `<head>`.

**Cursor**: custom dot + ring cursor. Uses `mix-blend-mode: difference` with a white base color so it stays visible over both the dark page and the light modal panels (cream/violet). Don't reintroduce a fixed accent color here without re-checking contrast against `.project-panel` (cream bg) and `.contact-panel` (violet bg) — that was a real bug already fixed once.

**Modals are intentionally light**: `.project-panel` renders on `var(--cream)`, `.contact-panel` on `var(--violet)` — a deliberate high-contrast "pop" against the dark page rather than staying on-theme dark. If asked to "make the modal match the site," confirm first — this contrast was a deliberate design choice, not an oversight.

## Structure of `index.html`

Top to bottom:
1. Ambient background: `#blob-bg` (3 animated blurred gradient circles) + noise overlay
2. Custom cursor (dot + ring, JS-driven via `mousemove`)
3. Scroll-progress ring (bottom-right, SVG stroke-dashoffset tied to scroll %)
4. Preloader (fades out on `window.onload`)
5. `nav` — logo + hamburger button opening `.menu-overlay` (fullscreen lime menu)
6. `header.hero` — big two-line headline, floating rotated "polaroid" images, badge, CTA buttons
7. `.ticker-wrap` — rotated infinite-scroll marquee strip (pure CSS `@keyframes scroll`, no JS)
8. `main#work` — five `.cat-block` sections (Graphic Design / Photography / Motion & Clients / Typography / Mockups), each a `.bento-grid` of `.art-card`s. Category accent color set via `--accent` on `.cat-block` (nth-of-type 1/2/3/4/5 → coral/amber/magenta/teal/terracotta).
9. `#about` — pull quote + stats row
10. CTA section — big outline/fill headline, links to contact modal
11. Two modals: `#projectModal` (project detail, populated from the `db` JS object by `openModal(id)`) and `#contactModal` (formsubmit.co form, POSTs to `kumarmangalam.patna@gmail.com`)
12. `footer`

**Project data** lives in the `db` object in the `<script>` block near the bottom — each entry maps an id (`graphic1`, `photo1`, `video1`, `clients`, `typo1`, `mockup1`, etc.) to title/desc/hero asset/gallery assets. `onclick="openModal('id')"` on each `.art-card` is what wires a card to its modal content. Adding a new project = add a `db` entry + a new `.art-card` in the matching `.cat-block`.

## Known non-issues / intentional choices

- `cursor: none` is set globally and overridden back to `auto` under `@media (pointer: coarse)` — touch devices get a normal cursor, the custom one is desktop-only.
- `@media (prefers-reduced-motion: reduce)` disables blob animation and entrance animations.
- No JS framework, no bundler, no lint config — keep it a plain single file unless there's a real reason to split it up.

## Outstanding / possible next steps

- `portfolio.html` (old draft) could be deleted if it's confirmed unused — currently left in place untouched.
- No automated tests; changes were verified manually via headless-browser screenshots (Playwright) during development, not via a checked-in test suite.
- **Typography & Mockups placeholder images** — the 12 `.jpg` images in `assets/` (prefixed `typo-*` and `mockup-*`) are AI-generated placeholders. Replace them with real portfolio work when available.
