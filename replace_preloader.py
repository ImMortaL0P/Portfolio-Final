import re

new_preloader = """        // --- 1. PRELOADER ---
        (function() {
            const pctWrap = document.querySelector('.preloader-percent-wrap');
            const pctSpan = document.getElementById('preloaderPercent');
            const preloader = document.querySelector('.preloader');
            
            let currentVal = 0;
            let targetVal = 0;
            
            const media = Array.from(document.querySelectorAll('img, video'));
            const totalMedia = media.length;
            let loadedMedia = 0;

            if (totalMedia === 0) {
                targetVal = 100;
            } else {
                media.forEach(m => {
                    if (m.tagName === 'IMG') {
                        if (m.complete) {
                            loadedMedia++;
                        } else {
                            m.addEventListener('load', () => loadedMedia++);
                            m.addEventListener('error', () => loadedMedia++);
                        }
                    } else if (m.tagName === 'VIDEO') {
                        if (m.readyState >= 3) {
                            loadedMedia++;
                        } else {
                            m.addEventListener('canplay', () => loadedMedia++);
                            m.addEventListener('error', () => loadedMedia++);
                        }
                    }
                });
            }

            function hidePreloader() {
                if (preloader) {
                    preloader.classList.add('hidden');
                }
                if (window.location.hash === '#contact') {
                    setTimeout(() => {
                        if (typeof openContactModal === 'function') openContactModal();
                    }, 300);
                }
            }

            function updateProgress() {
                if (totalMedia > 0) {
                    let mediaProgress = Math.floor((loadedMedia / totalMedia) * 100);
                    if (document.readyState === 'complete') mediaProgress = 100;
                    targetVal = Math.max(targetVal, mediaProgress);
                } else if (document.readyState === 'complete') {
                    targetVal = 100;
                }
                
                if (currentVal < targetVal) {
                    currentVal += (targetVal - currentVal) * 0.1 + 0.5;
                    if (currentVal > targetVal) currentVal = targetVal;
                }
                
                let displayVal = Math.floor(currentVal);
                if (displayVal > 100) displayVal = 100;

                if (pctSpan) pctSpan.textContent = displayVal;
                if (pctWrap) {
                    pctWrap.setAttribute('data-text', displayVal + '%');
                    pctWrap.style.setProperty('--clip', (100 - displayVal) + '%');
                }

                if (displayVal >= 100 && document.readyState === 'complete') {
                    setTimeout(hidePreloader, 400);
                } else {
                    requestAnimationFrame(updateProgress);
                }
            }

            const maxWait = setTimeout(() => { targetVal = 100; }, 6000);

            window.addEventListener('load', () => { 
                targetVal = 100; 
                clearTimeout(maxWait);
                
                const nextInput = document.querySelector('input[name="_next"]');
                if (nextInput) nextInput.value = window.location.href;
            });
            
            requestAnimationFrame(updateProgress);
        })();"""

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use regex to find // --- 1. PRELOADER --- block and replace it up to // --- 2. DATA STORE ---
    pattern = re.compile(r'(\s*// --- 1\. PRELOADER ---[\s\S]*?)(?=\s*// --- 2\. DATA STORE ---)')
    if pattern.search(content):
        new_content = pattern.sub(f'\n{new_preloader}', content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Preloader block not found in {filepath}")

replace_in_file('/Users/mangalam/Public/Portfolio-Final/index.html')
replace_in_file('/Users/mangalam/Public/Portfolio-Final/portfolio.html')
