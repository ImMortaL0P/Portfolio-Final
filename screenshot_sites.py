from playwright.sync_api import sync_playwright
import os
import subprocess

def run():
    os.makedirs("assets/work", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        # 2. ShardaCRM
        page.goto("https://hotel-booking-crm-community.vercel.app/")
        page.wait_for_timeout(3000)
        
        # Inject JS to scramble numbers and specific words!
        page.evaluate("""
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let node;
            while (node = walker.nextNode()) {
                if(node.nodeValue.trim() !== '') {
                    // Replace digits with random digits
                    node.nodeValue = node.nodeValue.replace(/\d/g, () => Math.floor(Math.random() * 10));
                    // Replace specific names if they exist, or just general words that look like names
                    node.nodeValue = node.nodeValue.replace(/Mangalam/gi, 'John Doe');
                    node.nodeValue = node.nodeValue.replace(/Kumar/gi, 'Smith');
                    // Add more targeted redaction depending on CRM contents (like ₹ amounts)
                    node.nodeValue = node.nodeValue.replace(/₹\s*\d+(,\d+)*(\.\d+)?/g, '₹ **,***');
                }
            }
            
            // Also blur avatars or specific images if any
            document.querySelectorAll('img').forEach(img => {
                if(img.src.includes('avatar') || img.alt.includes('avatar')) {
                    img.style.filter = 'blur(4px)';
                }
            });
        """)
        
        page.screenshot(path="assets/work/sharda-crm-raw.png")
        
        browser.close()
        
    subprocess.run(["cwebp", "-q", "80", "-resize", "640", "400", "assets/work/sharda-crm-raw.png", "-o", "assets/work/sharda-crm.webp"])
    os.remove("assets/work/sharda-crm-raw.png")

run()
