/* ------------------------------------------------------------------
   Mobile navigation.

   The desktop nav is three independently fixed elements that disperse
   on scroll. That pattern has nowhere to go under ~860px, so below the
   breakpoint they are replaced by a compact bar and a full-screen
   sheet. Built here rather than in markup so every page inherits it.
------------------------------------------------------------------- */

const BP = 860;

export function initMobileNav() {
  if (document.querySelector('.mnav')) return;

  const links = document.querySelector('.nav-links');
  const cta = document.querySelector('.nav-cta');
  if (!links && !cta) return;

  /* ---- the bar ---- */
  const bar = document.createElement('div');
  bar.className = 'mnav';
  bar.innerHTML = `
    <button class="mnav__btn" type="button" aria-expanded="false" aria-controls="mnav-sheet">
      <span class="mnav__bars" aria-hidden="true"><i></i><i></i></span>
      <span class="mnav__btn-label meta">Menu</span>
    </button>`;
  document.body.appendChild(bar);

  /* ---- the sheet ---- */
  const sheet = document.createElement('div');
  sheet.className = 'mnav__sheet section--dark';
  sheet.id = 'mnav-sheet';
  sheet.hidden = true;

  const items = [...(links ? links.querySelectorAll('a') : [])].map(
    (a, i) => `<li><a href="${a.getAttribute('href')}" class="mnav__link">
        <span class="mnav__n meta">${String(i + 1).padStart(2, '0')}</span>
        <span>${a.textContent.trim()}</span>
      </a></li>`
  );

  sheet.innerHTML = `
    <div class="mnav__sheet-inner">
      <ul class="mnav__list">${items.join('')}</ul>
      <div class="mnav__foot">
        <a class="button-chip meta primary mnav__cta" href="${cta ? cta.getAttribute('href') : '#contact'}" data-contact>Get in Touch &#8599;</a>
        <p class="mnav__meta meta">
          <span>Patna, India</span>
          <a href="https://www.behance.net/kumarmangalam3" target="_blank" rel="me noopener">Behance &#8599;</a>
        </p>
      </div>
    </div>`;
  document.body.appendChild(sheet);

  const btn = bar.querySelector('.mnav__btn');
  const label = bar.querySelector('.mnav__btn-label');
  let open = false;

  const setOpen = (v) => {
    open = v;
    btn.setAttribute('aria-expanded', String(v));
    label.textContent = v ? 'Close' : 'Menu';
    bar.classList.toggle('is-open', v);
    document.body.classList.toggle('mnav-open', v);
    if (v) {
      sheet.hidden = false;
      /* the sheet owns the scroll while it is up */
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
      if (window.gsap) {
        gsap.fromTo(sheet, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
        gsap.from(sheet.querySelectorAll('.mnav__link, .mnav__foot > *'), {
          y: 26, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', delay: 0.05,
        });
      }
    } else {
      sheet.hidden = true;
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }
  };

  btn.addEventListener('click', () => setOpen(!open));

  /* any destination closes the sheet before it navigates or scrolls */
  sheet.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });

  /* leaving mobile width must not strand the sheet open */
  const mq = matchMedia(`(min-width: ${BP}px)`);
  mq.addEventListener?.('change', (e) => { if (e.matches && open) setOpen(false); });

  return { setOpen };
}
