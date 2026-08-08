// Shared site chrome: nav-scroll state, custom cursor, hover triggers.
(function () {
    const navEl = document.querySelector('nav');
    if (navEl) {
        let scrollTicking = false;
        function onScroll() {
            navEl.classList.toggle('scrolled', window.scrollY > 40);
            scrollTicking = false;
        }
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(onScroll);
                scrollTicking = true;
            }
        }, { passive: true });
        onScroll();
    }

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const cursorLabel = document.querySelector('.cursor-label');

    if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let targetX = 0, targetY = 0, ringX = 0, ringY = 0, ringInit = false;
        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX; targetY = e.clientY;
            cursorDot.style.left = `${targetX}px`;
            cursorDot.style.top = `${targetY}px`;
            if (!ringInit) { ringX = targetX; ringY = targetY; ringInit = true; }
        });
        if (prefersReducedMotion) {
            window.addEventListener('mousemove', (e) => {
                cursorRing.style.left = `${e.clientX}px`;
                cursorRing.style.top = `${e.clientY}px`;
                if (cursorLabel) {
                    cursorLabel.style.left = `${e.clientX}px`;
                    cursorLabel.style.top = `${e.clientY}px`;
                }
            });
        } else {
            (function trackRing() {
                ringX += (targetX - ringX) * 0.2;
                ringY += (targetY - ringY) * 0.2;
                cursorRing.style.left = `${ringX}px`;
                cursorRing.style.top = `${ringY}px`;
                if (cursorLabel) {
                    cursorLabel.style.left = `${ringX}px`;
                    cursorLabel.style.top = `${ringY}px`;
                }
                requestAnimationFrame(trackRing);
            })();
        }

        document.querySelectorAll('.hover-trigger').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }
})();

function toggleMenu(show) {
    document.getElementById('menuOverlay').classList.toggle('open', show);
    document.body.style.overflow = show ? 'hidden' : '';
}

function toggleTheme() {
    var root = document.documentElement;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (next === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    try { localStorage.setItem('mg-theme', next); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#120a10' : '#fff7f0');
}
