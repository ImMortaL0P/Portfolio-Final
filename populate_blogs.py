import re

def process_text_to_html(text_path, title_level='h2'):
    with open(text_path, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
    if not lines: return ""
    title = lines[0]
    html_out = f"        <{title_level}>{title}</{title_level}>\n"
    for p in lines[1:]:
        html_out += f"        <p>{p}</p>\n"
    return html_out

def process_patna_to_html(text_path):
    with open(text_path, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
    if not lines: return ""
    
    html_out = "        <div class=\"text-block\">\n"
    for i, p in enumerate(lines[1:10]):
        html_out += f"            <p>{p}</p>\n"
    html_out += "        </div>\n\n"
    
    html_out += """        <!-- Full width Image -->
        <div>
            <img class="img-full hover-trigger" src="https://images.unsplash.com/photo-1555448248-2571daf6344b?auto=format&fit=crop&w=1600&q=80" alt="Placeholder Patna Street View">
            <div class="img-caption">Shot on a mix of 35mm & medium format film.</div>
        </div>\n\n"""

    html_out += "        <div class=\"text-block\">\n"
    for p in lines[10:20]:
        html_out += f"            <p>{p}</p>\n"
    html_out += "        </div>\n\n"
    
    html_out += """        <!-- 2 Column Grid -->
        <div class="img-grid-2">
            <img class="hover-trigger" src="https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80" alt="Placeholder Portrait">
            <img class="hover-trigger" src="https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=800&q=80" alt="Placeholder Detail">
        </div>\n\n"""
        
    html_out += "        <div class=\"text-block\">\n"
    for p in lines[20:30]:
        html_out += f"            <p>{p}</p>\n"
    html_out += "        </div>\n\n"
    
    html_out += """        <!-- 3 Column Grid -->
        <div class="img-grid-3">
            <img class="hover-trigger" src="https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&w=600&q=80" alt="Placeholder Street 1">
            <img class="hover-trigger" src="https://images.unsplash.com/photo-1512413340034-727827de85e5?auto=format&fit=crop&w=600&q=80" alt="Placeholder Street 2">
            <img class="hover-trigger" src="https://images.unsplash.com/photo-1471018231920-53bc32205562?auto=format&fit=crop&w=600&q=80" alt="Placeholder Street 3">
        </div>\n\n"""
        
    html_out += "        <div class=\"text-block\">\n"
    for p in lines[30:]:
        html_out += f"            <p>{p}</p>\n"
    html_out += "        </div>\n"
    
    return html_out

def process_mountains_to_html(text_path):
    with open(text_path, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
    if not lines: return ""
    
    html_out = "        <div class=\"text-block\">\n"
    for p in lines[1:8]:
        html_out += f"            <p>{p}</p>\n"
    html_out += "        </div>\n\n"
    
    html_out += """        <!-- Full width Image -->
        <div>
            <img class="img-full hover-trigger" src="assets/IMG_7183.gif" alt="The Call of the Mountains">
            <div class="img-caption">Where the air thins and the world below disappears.</div>
        </div>\n\n"""

    html_out += "        <div class=\"text-block\">\n"
    for p in lines[8:20]:
        html_out += f"            <p>{p}</p>\n"
    html_out += "        </div>\n\n"
    
    html_out += """        <!-- 2 Column Grid -->
        <div class="img-grid-2">
            <img class="hover-trigger" src="assets/4D4A9268-D89D-4B09-B78F-DF51096F0645_1_105_c.jpeg" alt="Mountain Peak">
            <img class="hover-trigger" src="assets/AAF700C5-98AA-4666-B354-46FD0FFAA627_1_102_o.jpeg" alt="Starry Mountain Night">
        </div>\n\n"""
        
    html_out += "        <div class=\"text-block\">\n"
    for p in lines[20:30]:
        html_out += f"            <p>{p}</p>\n"
    html_out += "        </div>\n\n"
    
    html_out += """        <!-- 3 Column Grid -->
        <div class="img-grid-3">
            <img class="hover-trigger" src="assets/F1CCF357-C729-45C9-A8E4-DA4E026AECA9_1_105_c.jpeg" alt="Mountain Trail">
            <img class="hover-trigger" src="assets/F8632A8A-5A33-41AF-8735-D1AC31C6D3C8_1_102_o.jpeg" alt="Himalayan Range">
            <img class="hover-trigger" src="assets/DE275104-0FF1-44E4-A0F7-4150EBB7B0F9_1_102_o.jpeg" alt="Misty Valley">
        </div>\n\n"""
        
    html_out += "        <div class=\"text-block\">\n"
    for p in lines[30:]:
        html_out += f"            <p>{p}</p>\n"
    html_out += "        </div>\n"
    
    return html_out

def process_steel_to_html(text_path):
    with open(text_path, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
    
    title = lines[0]
    html_out = f"        <h2>{title}</h2>\n"
    
    # insert first batch of paras
    for p in lines[1:8]:
        html_out += f"        <p>{p}</p>\n"
    html_out += "        <figure class=\"article-image hover-trigger\" style=\"background-image: url('assets/wide-angle-shot-excavation-machines.jpg');\" aria-label=\"Excavation Machines at Work\"></figure>\n"
    
    for p in lines[8:22]:
        html_out += f"        <p>{p}</p>\n"
    html_out += "        <figure class=\"article-image hover-trigger\" style=\"background-image: url('assets/interior-view-steel-factory.jpg');\" aria-label=\"Interior of a Steel Factory\"></figure>\n"
    
    for p in lines[22:30]:
        html_out += f"        <p>{p}</p>\n"
    html_out += "        <figure class=\"article-image hover-trigger\" style=\"background-image: url('assets/12019-steel-1968194.jpg');\" aria-label=\"Molten Steel\"></figure>\n"
    
    for p in lines[30:]:
        html_out += f"        <p>{p}</p>\n"
        
    html_out += "        <div class=\"article-author\">— K. Mangalam</div>\n"
    return html_out

def process_research_to_html(text_path):
    with open(text_path, 'r', encoding='utf-8') as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
    
    title = lines[0]
    html_out = f"        <h2>{title}</h2>\n"
    
    for p in lines[1:5]:
        html_out += f"        <p>{p}</p>\n"
    html_out += "        <figure class=\"article-image hover-trigger\" style=\"background-image: url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80');\" aria-label=\"Library and Research\"></figure>\n"
    
    for p in lines[5:10]:
        html_out += f"        <p>{p}</p>\n"
    html_out += "        <figure class=\"article-image hover-trigger\" style=\"background-image: url('https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1600&q=80');\" aria-label=\"Books and Study\"></figure>\n"
    
    for p in lines[10:15]:
        html_out += f"        <p>{p}</p>\n"
    html_out += "        <figure class=\"article-image hover-trigger\" style=\"background-image: url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1600&q=80');\" aria-label=\"Notes and Writing\"></figure>\n"
    
    for p in lines[15:]:
        html_out += f"        <p>{p}</p>\n"
        
    html_out += "        <div class=\"article-author\">— K. Mangalam</div>\n"
    return html_out

def update_file(filepath, inner_html, tag="<main class=\"article-body\">"):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    import re
    if tag == "<main class=\"article-body\">":
        pattern = re.compile(r'(<main class="article-body">)(.*?)(</main>)', re.DOTALL)
    else:
        pattern = re.compile(r'(<main class="editorial-body">)(.*?)(</main>)', re.DOTALL)
        
    new_content = pattern.sub(r'\1\n' + inner_html + r'    \3', content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {filepath}")


steel_html = process_steel_to_html('/Users/mangalam/.gemini/antigravity-cli/brain/cfb9381b-b7d5-4f99-9c8a-c58cf1f65564/.system_generated/steps/164/content.md')
update_file('/Users/mangalam/Public/Portfolio-Final/blog-steel.html', steel_html, "<main class=\"article-body\">")

patna_html = process_patna_to_html('/Users/mangalam/.gemini/antigravity-cli/brain/cfb9381b-b7d5-4f99-9c8a-c58cf1f65564/.system_generated/steps/165/content.md')
update_file('/Users/mangalam/Public/Portfolio-Final/blog-patna.html', patna_html, "<main class=\"editorial-body\">")

mountains_html = process_mountains_to_html('/Users/mangalam/.gemini/antigravity-cli/brain/cfb9381b-b7d5-4f99-9c8a-c58cf1f65564/.system_generated/steps/166/content.md')
update_file('/Users/mangalam/Public/Portfolio-Final/blog-mountains.html', mountains_html, "<main class=\"editorial-body\">")

research_html = process_research_to_html('/Users/mangalam/.gemini/antigravity-cli/brain/cfb9381b-b7d5-4f99-9c8a-c58cf1f65564/.system_generated/steps/167/content.md')
update_file('/Users/mangalam/Public/Portfolio-Final/blog-research.html', research_html, "<main class=\"article-body\">")
