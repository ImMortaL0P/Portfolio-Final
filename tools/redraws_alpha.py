#!/usr/bin/env python3
"""Re-render the redraws with a transparent page.

poppler here has no -transp, so the PDF renders on white. Knocking out
every near-white pixel would also punch holes in eyes and highlights, so
the background is flood-filled from the page edges instead: only white
that is connected to the border goes.
"""
import os
import subprocess
import sys
from collections import deque
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_assets import REDRAWS, SQ, emit, trim  # noqa: E402

WHITE = 246          # anything brighter than this counts as page
FEATHER = 1


def knockout(im):
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    gray = im.convert("L").load()

    seen = bytearray(w * h)
    q = deque()

    def push(x, y):
        i = y * w + x
        if not seen[i] and gray[x, y] >= WHITE:
            seen[i] = 1
            q.append((x, y))

    for x in range(w):
        push(x, 0); push(x, h - 1)
    for y in range(h):
        push(0, y); push(w - 1, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (255, 255, 255, 0)
        if x > 0: push(x - 1, y)
        if x < w - 1: push(x + 1, y)
        if y > 0: push(x, y - 1)
        if y < h - 1: push(x, y + 1)
    return im


def main():
    for stem, title in REDRAWS:
        ai = os.path.join(SQ, f"{stem}.ai")
        png = f"/tmp/redraw-{stem}"
        if not os.path.exists(png + ".png"):
            subprocess.run(["pdftoppm", "-r", "300", "-png", "-singlefile", ai, png],
                           check=True, capture_output=True)
        with Image.open(png + ".png") as im:
            out = trim(knockout(im))
            emit(out, "Redraws", title, 88)
        print("redraw", title, out.size)


if __name__ == "__main__":
    main()
