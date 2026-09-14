import './scroll.js';
import { initNav } from './nav.js';
import { papers, hrefOfPaper } from './papers.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initMobileNav } from './mobilenav.js';

const slug = document.body.dataset.paper;
const i = papers.findIndex((p) => p.slug === slug);
const p = papers[i];

function render() {
  if (!p) return;

  const decode = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; };
  document.title = `${decode(p.short)} — K. Mangalam`;

  const set = (sel, html) => {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  };

  set('.paper-hero__venue', p.venue);
  set('.paper-hero__year', p.year);
  set('.paper-hero__where', p.where);
  set('.paper-hero__title', p.title);
  set('.paper-hero__authors', p.authors);
  set('.paper-lede', p.lede);
  set('.paper-tags', p.tags.map((t) => `<span>${t}</span>`).join(''));

  const statusEl = document.querySelector('.paper-hero__status');
  if (statusEl && p.status) statusEl.innerHTML = p.status;
  else if (statusEl) statusEl.remove();

  // access: a published paper gets its links, an embargoed one gets a reason
  const access = document.querySelector('.paper-access');
  if (access) {
    const bits = [];
    if (p.href) bits.push(`<a class="button-chip meta primary" href="${p.href}" target="_blank" rel="noopener" data-cursor="READ">Read the paper &#8599;</a>`);
    if (p.doi) bits.push(`<a class="paper__doi meta" href="${p.doi.href}" target="_blank" rel="noopener" data-cursor="OPEN">DOI ${p.doi.label}</a>`);
    if (p.mirror) bits.push(`<a class="paper__doi meta" href="${p.mirror.href}" target="_blank" rel="noopener" data-cursor="OPEN">${p.mirror.label} &#8599;</a>`);
    if (p.embargo) bits.push(`<span class="paper__embargo meta">${p.embargo}</span>`);
    access.innerHTML = bits.join('');
  }

  const statsEl = document.querySelector('.paper-findings');
  if (statsEl && p.findings && p.findings.length) {
    statsEl.innerHTML = p.findings
      .map(([v, l]) => `<div class="paper__finding"><span class="paper__finding-v">${v}</span><span class="paper__finding-l meta">${l}</span></div>`)
      .join('');
  } else if (statsEl) {
    statsEl.remove();
  }

  set(
    '.paper-body',
    (p.body || [])
      .map((s, n) => `
        <section class="proj-block">
          <h2 class="proj-block__h">
            <span class="proj-block__n meta">${String(n + 1).padStart(2, '0')}</span>
            <span>${s.h}</span>
          </h2>
          <div class="proj-block__body">
            ${s.p.map((t) => `<p class="body-text">${t}</p>`).join('')}
          </div>
        </section>`)
      .join('')
  );

  const figsEl = document.querySelector('.paper-figs');
  if (figsEl && p.figs && p.figs.length) {
    figsEl.innerHTML = p.figs
      .map((f, n) => `
        <figure class="paper__fig">
          <button type="button" class="paper__fig-btn" data-f="${n}" data-cursor="EXPAND" aria-label="Enlarge figure ${n + 1}">
            <img src="${f.src}" alt="${String(f.cap).replace(/<[^>]+>/g, '').replace(/"/g, '&quot;')}" loading="lazy" decoding="async">
          </button>
          <figcaption class="paper__fig-cap">Fig. ${n + 1} &mdash; ${f.cap}</figcaption>
        </figure>`)
      .join('');
  } else if (figsEl) {
    figsEl.remove();
  }

  const wire = (sel, q) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (!q) { el.remove(); return; }
    el.href = hrefOfPaper(q.slug);
    el.querySelector('.paper-pager__name').innerHTML = q.short;
    el.dataset.cursor = 'READ';
  };
  wire('.paper-pager__prev', papers[i - 1]);
  wire('.paper-pager__next', papers[i + 1]);
}

function lightbox() {
  const box = document.querySelector('#lightbox');
  const figs = (p && p.figs) || [];
  if (!box || !figs.length) return;
  const img = box.querySelector('.lightbox__img');
  const cap = box.querySelector('.lightbox__cap');
  let n = 0;

  const show = (k) => {
    n = (k + figs.length) % figs.length;
    img.src = figs[n].src;
    cap.innerHTML = figs[n].cap;
  };
  const close = () => { box.hidden = true; document.body.style.overflow = ''; };

  document.querySelectorAll('.paper__fig-btn').forEach((b) => {
    b.addEventListener('click', () => {
      show(Number(b.dataset.f));
      box.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(n - 1));
  box.querySelector('.lightbox__nav--next').addEventListener('click', () => show(n + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(n - 1);
    if (e.key === 'ArrowRight') show(n + 1);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  lightbox();
  initNav();
  initMobileNav();
  initTheme();
  initContact();
  if (window.attachCursorEvents) window.attachCursorEvents();

  if (window.gsap && window.ScrollTrigger) {
    document.querySelectorAll('.proj-block, .paper__fig, .paper__finding').forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 22, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
    ScrollTrigger.refresh();
  }
});
