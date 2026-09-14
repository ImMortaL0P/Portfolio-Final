import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract and remove style tags
styles = re.findall(r'<style>(.*?)</style>', html, re.DOTALL)
html = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="css/tokens.css">\n    <link rel="stylesheet" href="css/base.css">\n    <link rel="stylesheet" href="css/sections.css">\n    <link rel="stylesheet" href="css/motion.css">', html, flags=re.DOTALL)

with open('css/legacy-inline.css', 'w', encoding='utf-8') as f:
    for s in styles:
        f.write(s + '\n')

# Extract and remove script tags that have inline content (ignoring the tiny theme toggle and those with src)
script_blocks = re.findall(r'<script(?!\s+src)(?:[^>]*)>(.*?)</script>', html, re.DOTALL)
# keep the first theme toggle maybe, just extract the big one
scripts = []
for idx, s in enumerate(script_blocks):
    if len(s) > 100:  # skip the tiny ones temporarily
        scripts.append(s)
        # remove from html
        html = html.replace(f'<script>{s}</script>', '')
    
html = html.replace('</body>', '    <script src="js/main.js"></script>\n    <script src="js/scroll.js"></script>\n    <script src="js/motion.js"></script>\n    <script src="js/cursor.js"></script>\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

with open('js/legacy-inline.js', 'w', encoding='utf-8') as f:
    for s in scripts:
        f.write(s + '\n')

print("Extraction complete.")
