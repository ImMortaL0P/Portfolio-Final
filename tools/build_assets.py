#!/usr/bin/env python3
"""One-off: bring the new posters and the character redraws into the site's
asset convention (full webp + mid + thumb, slug-hash filenames)."""
import hashlib
import os
import re
import subprocess
import sys
from PIL import Image

ROOT = "/Users/mangalam/Public/Portfolio-Final"
ASSETS = os.path.join(ROOT, "assets")
DRIVE = "/Volumes/MangalamHDD/Brush Content/New/Typography Centric Illustrated"
SQ = os.path.expanduser("~/Desktop/The Side Quest Design")

FULL_W, MID_W, THUMB_W = 1600, 900, 420


def slug(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return re.sub(r"-+", "-", s)


def short_hash(name):
    return hashlib.md5(name.encode()).hexdigest()[:6]


def save_webp(img, out, width, quality=82):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im = img.copy()
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGBA", im.size, (255, 255, 255, 0))
        im = Image.alpha_composite(bg, im)
    else:
        im = im.convert("RGB")
    im.save(out, "WEBP", quality=quality, method=5)


def trim(img, pad=24):
    """Crop transparent / uniform-white margins, then re-pad evenly."""
    im = img.convert("RGBA")
    bbox = im.getbbox()
    alpha = im.split()[-1]
    if alpha.getextrema() == (255, 255):          # no transparency: trim white
        gray = im.convert("L").point(lambda v: 0 if v > 246 else 255)
        bbox = gray.getbbox() or bbox
    if bbox:
        im = im.crop(bbox)
    out = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    out.paste(im, (pad, pad))
    return out


def emit(img, folder, base, quality=82):
    """Write full/mid/thumb and return the three site-relative paths."""
    sl, h = slug(base), short_hash(base)
    full_rel = f"assets/{folder}/{sl}.webp"
    mid_rel = f"assets/mid/{sl}-{h}.webp"
    thumb_rel = f"assets/thumbs/{sl}-{h}.webp"
    save_webp(img, os.path.join(ROOT, full_rel), FULL_W, quality)
    save_webp(img, os.path.join(ROOT, mid_rel), MID_W, quality)
    save_webp(img, os.path.join(ROOT, thumb_rel), THUMB_W, 78)
    return full_rel, mid_rel, thumb_rel


POSTERS = {
    "Pop Art": [
        ("upload 2", "Beautiful day.png", "Beautiful Day"),
        ("upload 2", "Menu Fuck Ni Penda.png", "Menu F Ni Penda"),
        ("upload 2", "Oh Shit Baddie.png", "Oh Sh Baddie"),
        ("upload 2", "Pop Skeleton Mohawk.png", "Pop Skeleton Mohawk"),
        ("upload 2", "Save Me .png", "Save Me"),
        ("upload 2", "are you pooping.png", "Are You Pooping"),
        ("upload 2", "what the actual duck.png", "What The Actual Duck"),
        ("upload 3", "shut the fuck up.png", "Shut The F Up"),
    ],
    "Desi Type": [
        ("upload 3", "Dilli.png", "Dilli"),
        ("upload 3", "Rajasthan.png", "Rajasthan"),
        ("upload 3", "Naritva.png", "Naritva"),
        ("upload 3", "Love da Lahsun.png", "Love Da Lahsun"),
        ("upload 2", "Dekho magar Pyaar se.png", "Dekho Magar Pyaar Se"),
    ],
    "Arcana": [
        ("upload", "Dimensions.png", "Dimensions"),
        ("upload", "Icarus.png", "Icarus"),
        ("upload", "Needing Nothing.png", "Needing Nothing"),
        ("upload", "Pressure is a Privilege.png", "Pressure Is A Privilege"),
    ],
}

REDRAWS = [
    ("duck", "Gunter"),
    ("sq2", "Jake"),
    ("cat1", "Jiji"),
    ("sh1", "Shinchan"),
    ("cd1", "Courage"),
    ("og1", "Oggy"),
    ("bbz1", "Bad Piggy"),
]


def main():
    manifest = {}
    for folder, items in ({} if "--redraws-only" in sys.argv else POSTERS).items():
        rows = []
        for src_dir, filename, title in items:
            path = os.path.join(DRIVE, src_dir, filename)
            if not os.path.exists(path):
                print("MISSING", path, file=sys.stderr)
                continue
            with Image.open(path) as im:
                rows.append((title,) + emit(im, folder, title))
            print("poster", folder, title)
        manifest[folder] = rows

    rows = []
    for stem, title in REDRAWS:
        ai = os.path.join(SQ, f"{stem}.ai")
        if not os.path.exists(ai):
            print("MISSING", ai, file=sys.stderr)
            continue
        png = f"/tmp/redraw-{stem}"
        subprocess.run(
            ["pdftoppm", "-r", "300", "-png", "-transp", "-singlefile", ai, png],
            check=True, capture_output=True,
        )
        with Image.open(png + ".png") as im:
            rows.append((title,) + emit(trim(im), "Redraws", title, 88))
        print("redraw", title)
    manifest["Redraws"] = rows

    with open(os.path.join(ROOT, "_pick", "manifest.txt"), "w") as fh:
        for folder, rows in manifest.items():
            for title, full, mid, thumb in rows:
                fh.write(f"{folder}\t{title}\t{full}\t{mid}\t{thumb}\n")
    print("done")


if __name__ == "__main__":
    main()
