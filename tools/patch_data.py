#!/usr/bin/env python3
"""Rewrite the Poster Designs + Illustrations series lists in js/data.js."""
import re

DATA = "/Users/mangalam/Public/Portfolio-Final/js/data.js"

POP_NEW = [
    ("Beautiful Day", "beautiful-day", "7c6c20"),
    ("Menu F Ni Penda", "menu-f-ni-penda", "059ae2"),
    ("Oh Sh Baddie", "oh-sh-baddie", "ad8b07"),
    ("Pop Skeleton Mohawk", "pop-skeleton-mohawk", "bc2545"),
    ("Save Me", "save-me", "6186c2"),
    ("Are You Pooping", "are-you-pooping", "5d27f8"),
    ("What The Actual Duck", "what-the-actual-duck", "2dde8b"),
    ("Shut The F Up", "shut-the-f-up", "6b460d"),
]
DESI = [
    ("Dilli", "dilli", "59a84a"),
    ("Rajasthan", "rajasthan", "d418e6"),
    ("Naritva", "naritva", "e14671"),
    ("Love Da Lahsun", "love-da-lahsun", "f68b2a"),
    ("Dekho Magar Pyaar Se", "dekho-magar-pyaar-se", "412c29"),
]
ARCANA = [
    ("Dimensions", "dimensions", "f4843c"),
    ("Icarus", "icarus", "c0168a"),
    ("Needing Nothing", "needing-nothing", "52af58"),
    ("Pressure Is A Privilege", "pressure-is-a-privilege", "1e032e"),
]
REDRAWS = [
    ("Gunter", "gunter", "bf9c7a"),
    ("Jake", "jake", "0a6194"),
    ("Jiji", "jiji", "ec68c2"),
    ("Shinchan", "shinchan", "ca2604"),
    ("Courage", "courage", "f8d54b"),
    ("Oggy", "oggy", "37b7aa"),
    ("Bad Piggy", "bad-piggy", "55fa04"),
]


def arrays(folder, rows):
    thumbs = ", ".join(f"'assets/thumbs/{s}-{h}.webp'" for _, s, h in rows)
    fulls = ", ".join(f"'assets/{folder}/{s}.webp'" for _, s, _ in rows)
    mids = ", ".join(f"'assets/mid/{s}-{h}.webp'" for _, s, h in rows)
    return thumbs, fulls, mids


def series(year, kind, title, folder, rows, note=None, page=None):
    thumbs, fulls, mids = arrays(folder, rows)
    head = f"      {{ year: '{year}', kind: '{kind}', title: '{title}', href: '{page or '#'}',"
    if page:
        head += f" page: '{page}',"
    if note:
        head += f"\n        note: '{note}',"
    return (head + f"\n        shots: [{thumbs}], full: [{fulls}], mid: [{mids}] }}")


src = open(DATA).read()

# --- 1. Poster Designs: drop MOTIVATION and DESTINATIONS -----------------
for title in ("MOTIVATION", "DESTINATIONS"):
    pattern = re.compile(
        r"\n      \{ year: '[^']*', kind: '[^']*', title: '" + title + r"'.*?\n        shots:.*?\},",
        re.S,
    )
    src, n = pattern.subn("", src)
    print(f"removed {title}: {n}")

# --- 2. Poster Designs: extend POP ART ------------------------------------
pop = re.search(
    r"(\{ year: '[^']*', kind: '[^']*', title: 'POP ART'.*?shots: \[)(.*?)(\], full: \[)(.*?)(\], mid: \[)(.*?)(\] \})",
    src, re.S,
)
t_new, f_new, m_new = arrays("Pop Art", POP_NEW)
src = (src[:pop.start()]
       + pop.group(1) + pop.group(2) + "," + t_new
       + pop.group(3) + pop.group(4) + ", " + f_new
       + pop.group(5) + pop.group(6) + ", " + m_new
       + pop.group(7)
       + src[pop.end():])
print("extended POP ART")

# --- 3. Poster Designs: add DESI TYPE + ARCANA after FLORAL STUDIES -------
floral = re.search(
    r"\n      \{ year: '[^']*', kind: '[^']*', title: 'FLORAL STUDIES'.*?\n        shots:.*?\}",
    src, re.S,
)
addition = ",\n" + series(
    "2026", "Devanagari Series", "DESI TYPE", "Desi Type", DESI,
    note="Indian type and iconography — Devanagari lettering, truck-art framing and regional colour.",
) + ",\n" + series(
    "2026", "Esoteric Series", "ARCANA", "Arcana", ARCANA,
    note="Line-engraved plates: one aphorism, one diagram, no colour.",
)
src = src[:floral.end()] + addition + src[floral.end():]
print("added DESI TYPE + ARCANA")

# --- 4. Illustrations: add REDRAW LAB after FREEHAND COMICS ---------------
fh = re.search(
    r"\n      \{ year: '[^']*', kind: '[^']*', title: 'FREEHAND COMICS'.*?\n        shots:.*?\}",
    src, re.S,
)
redraw = ",\n" + series(
    "2026", "Vector Studies", "REDRAW LAB", "Redraws", REDRAWS,
    note="Seven cartoon characters rebuilt from scratch as vector studies in line weight, flat colour and silhouette. Laid out as a comic page.",
    page="comics.html",
)
src = src[:fh.end()] + redraw + src[fh.end():]
print("added REDRAW LAB")

open(DATA, "w").write(src)
print("written")
