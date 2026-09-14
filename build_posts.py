#!/usr/bin/env python3
"""Rebuild the blog pages in the new design system.

The old pages came in three shapes (article / editorial / journal).
This reads each one, lifts the real content out, maps the old class
names onto the new post vocabulary, and re-wraps it in the site shell.
Originals are kept in _legacy/.
"""
import re, os, json, html, glob, shutil

SRC = sorted(glob.glob('blog-*.html'))
os.makedirs('_legacy', exist_ok=True)

SHELL = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{desc}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>K</text></svg>">
  <title>{title_plain} &mdash; K. Mangalam</title>

  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/sections.css">
  <link rel="stylesheet" href="css/motion.css">
  <link rel="stylesheet" href="css/post.css">
</head>
<body class="post-page" data-post="{slug}">
  <a class="skip" href="#main">Skip to content</a>
  <div class="noise-overlay" aria-hidden="true"></div>

  <div class="nav-scrim" aria-hidden="true"></div>
  <nav class="nav">
    <div class="wrap nav-inner">
      <a href="index.html" class="nav-logo display-m">K. Mangalam</a>
      <ul class="nav-links">
        <li><a href="writings.html" class="label">Blogs</a></li>
        <li><a href="index.html#work" class="label">Work</a></li>
      </ul>
      <a href="index.html#contact" class="nav-cta button-chip meta">Get in Touch</a>
    </div>
  </nav>

  <main id="main">
    <header class="post-hero">
      <div class="wrap">
        <a class="post-back meta" href="writings.html" data-cursor="BACK">&#8592; All writing</a>
        <p class="post-hero__meta meta">
          <span class="post-hero__kind">{kind}</span>
          <span class="post-hero__date">{date}</span>
          <span class="post-hero__read">{read} min read</span>
        </p>
        <h1 class="post-hero__title">{title_html}</h1>
      </div>
    </header>
{lead_media}
    <article class="post-body wrap">
{body}
    </article>

    <nav class="post-pager wrap" aria-label="Other writing">
      <a class="post-pager__prev" href="#"><span class="meta">Previous</span><span class="post-pager__name"></span></a>
      <a class="post-pager__next" href="#"><span class="meta">Next</span><span class="post-pager__name"></span></a>
    </nav>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-legal row">
        <span class="meta">&copy; 2026 K. Mangalam</span>
        <span class="meta">All Rights Reserved</span>
      </div>
    </div>
  </footer>

  <div class="cursor-pill meta" aria-hidden="true" style="opacity: 0; transform: scale(0.4);">VIEW</div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
  <script type="module" src="js/post.js"></script>
</body>
</html>
'''


def strip_hover(s):
    """Drop the old cursor hook and normalise the class list, so the
    exact-string replacements below still match (a stray trailing
    space is enough to make them silently miss)."""
    def clean(m):
        toks = [t for t in m.group(1).split() if t not in ('hover-trigger',)]
        return 'class="%s"' % ' '.join(toks) if toks else ''
    return re.sub(r'class="([^"]*)"', clean, s)


def bg_figure(m):
    """figure.article-image carries its picture in a background-image."""
    attrs = m.group(1)
    url = re.search(r"url\(['\"]?(.*?)['\"]?\)", attrs)
    label = re.search(r'aria-label="(.*?)"', attrs)
    inner = m.group(2).strip()
    cap = ''
    fc = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', inner, re.S)
    if fc:
        cap = f'<figcaption class="post-cap meta">{fc.group(1).strip()}</figcaption>'
    alt = label.group(1) if label else ''
    if not url:
        return ''
    return (f'<figure class="post-fig post-fig--full">'
            f'<img src="{url.group(1)}" alt="{alt}" loading="lazy" decoding="async">{cap}</figure>')


def convert(body):
    s = strip_hover(body)

    # figures that were background-images
    s = re.sub(r'<figure class="article-image"([^>]*)>(.*?)</figure>', bg_figure, s, flags=re.S)

    # quotes
    s = re.sub(r'<div class="article-quote"[^>]*>(.*?)</div>',
               r'<blockquote class="post-quote">\1</blockquote>', s, flags=re.S)

    # editorial vocabulary
    s = s.replace('class="text-block"', 'class="post-text"')
    s = re.sub(r'<div class="img-caption"[^>]*>(.*?)</div>',
               r'<p class="post-cap meta">\1</p>', s, flags=re.S)
    s = s.replace('class="img-grid-2"', 'class="post-grid post-grid--2"')
    s = s.replace('class="img-grid-3"', 'class="post-grid post-grid--3"')
    s = s.replace('class="img-full"', 'class="post-media post-media--full"')

    # journal vocabulary
    s = s.replace('class="journal-entry reverse"', 'class="post-entry post-entry--reverse"')
    s = s.replace('class="journal-entry"', 'class="post-entry"')
    s = s.replace('class="journal-entry-text"', 'class="post-entry__text"')
    s = s.replace('class="journal-entry-number"', 'class="post-entry__n meta"')
    s = s.replace('class="journal-entry-heading"', 'class="post-entry__h"')
    s = s.replace('class="journal-entry-body"', 'class="post-entry__p"')
    s = s.replace('class="journal-entry-img"', 'class="post-entry__img"')
    s = s.replace('class="journal-fullbleed"', 'class="post-media post-media--full"')
    s = s.replace('class="journal-mosaic"', 'class="post-grid post-grid--3"')
    s = s.replace('class="journal-intro"', 'class="post-lead"')
    s = s.replace('class="journal-closing"', 'class="post-closing"')

    # the old music widget doesn't survive the redesign
    s = re.sub(r'<div class="music-player-widget".*?</div>\s*</div>\s*</div>', '', s, flags=re.S)
    s = re.sub(r'<div class="music-player-widget".*?</div>\s*</div>', '', s, flags=re.S)

    # lazy-load every image that isn't already marked
    s = re.sub(r'<img (?![^>]*loading=)', '<img loading="lazy" decoding="async" ', s)

    # drop leftover inline colours/fonts from the old theme, keep object-fit
    s = re.sub(r'style="([^"]*)"', lambda m: (
        'style="%s"' % '; '.join(
            p.strip() for p in m.group(1).split(';')
            if p.strip() and re.match(r'^(max-height|object-fit|object-position|aspect-ratio)', p.strip())
        )).replace('style=""', ''), s)

    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip()


posts = []
for f in SRC:
    src = f'_legacy/{f}' if os.path.exists(f'_legacy/{f}') else f
    raw = open(src).read()
    slug = f[len('blog-'):-len('.html')]
    if src == f:
        shutil.copy(f, f'_legacy/{f}')

    title_m = (re.search(r'<h1 class="article-title">(.*?)</h1>', raw, re.S)
               or re.search(r'<h1 class="editorial-title">(.*?)</h1>', raw, re.S)
               or re.search(r'<h1 class="journal-title">(.*?)</h1>', raw, re.S))
    title_html = title_m.group(1).strip()
    title_plain = re.sub(r'<[^>]+>', ' ', title_html)
    title_plain = re.sub(r'\s+', ' ', html.unescape(title_plain)).strip()

    meta_m = (re.search(r'<div class="article-meta">(.*?)</div>', raw, re.S)
              or re.search(r'<div class="editorial-meta">(.*?)</div>', raw, re.S)
              or re.search(r'<div class="journal-meta">(.*?)</div>', raw, re.S))
    meta_txt = re.sub(r'<[^>]+>', '|', meta_m.group(1)) if meta_m else ''
    parts = [html.unescape(p).strip() for p in re.split(r'[|•]', meta_txt) if p.strip()]
    parts = [p for p in parts if not p.lower().startswith(('written by', 'by k'))]
    date = next((p for p in parts if re.search(r'\d{4}', p)), '')
    kind = next((p for p in parts if p != date), 'Essay')

    body_m = re.search(r'<main class="(?:article-body|editorial-body|journal-body)"[^>]*>(.*?)</main>', raw, re.S)
    body = convert(body_m.group(1))

    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    read = max(2, round(words / 220))

    hero = re.search(r'class="article-hero"[^>]*url\([\'"]?(.*?)[\'"]?\)', raw)
    lead_media = ''
    if hero:
        lead_media = (f'    <figure class="post-lead-media">\n'
                      f'      <img src="{hero.group(1)}" alt="" loading="eager" decoding="async">\n'
                      f'    </figure>\n')
        cover = hero.group(1)
    else:
        first = re.search(r'<img[^>]+src="([^"]+)"', body)
        cover = first.group(1) if first else ''

    first_p = re.search(r'<p[^>]*>(.*?)</p>', body, re.S)
    excerpt = re.sub(r'<[^>]+>', '', first_p.group(1)) if first_p else ''
    excerpt = re.sub(r'\s+', ' ', html.unescape(excerpt)).strip()
    if len(excerpt) > 190:
        excerpt = excerpt[:190].rsplit(' ', 1)[0] + '…'

    open(f, 'w').write(SHELL.format(
        slug=slug, title_html=title_html, title_plain=html.escape(title_plain),
        desc=html.escape(excerpt[:150]), kind=html.escape(kind), date=html.escape(date),
        read=read, lead_media=lead_media, body=body))

    posts.append(dict(slug=slug, title=title_html, plain=title_plain, kind=kind,
                      date=date, read=read, excerpt=excerpt, cover=cover))
    print(f'{f:26} {kind:22} {date:16} {read}min  cover={cover[:44]}')

open('js/posts.js', 'w').write(
    '/* Blog index — generated by build_posts.py from the post pages. */\n'
    'export const posts = ' + json.dumps(posts, indent=2, ensure_ascii=False) + ';\n'
    "export const hrefOf = (slug) => `blog-${slug}.html`;\n")
print('\nwrote js/posts.js with', len(posts), 'posts')
