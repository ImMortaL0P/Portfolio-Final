/* Theme toggle.
   The stored choice is applied by an inline boot script in <head>, before
   first paint, so the page never flashes the wrong ground. This module
   only builds the control and handles the switch. */

const KEY = 'mg-theme';

const read = () => {
  try { return localStorage.getItem(KEY); } catch (e) { return null; }
};
const write = (v) => {
  try { localStorage.setItem(KEY, v); } catch (e) { /* private mode — fine */ }
};

export function initTheme() {
  const host = document.querySelector('.nav-inner');
  if (!host || document.querySelector('.theme-toggle')) return;

  const btn = document.createElement('button');
  btn.className = 'theme-toggle meta';
  btn.type = 'button';
  btn.dataset.cursor = 'SWITCH';
  btn.innerHTML = `
    <span class="theme-toggle__track" aria-hidden="true">
      <span class="theme-toggle__knob"></span>
    </span>
    <span class="theme-toggle__label"></span>`;
  host.appendChild(btn);

  const label = btn.querySelector('.theme-toggle__label');

  const paint = (mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
    btn.setAttribute('aria-pressed', String(mode === 'dark'));
    btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    label.textContent = mode === 'dark' ? 'Dark' : 'Light';
  };

  const current = () =>
    document.documentElement.getAttribute('data-theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  paint(current());

  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    write(next);
    paint(next);
    /* the pinned resume and the canvas scenes measure against the ground,
       so let them re-read it */
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });

  /* follow the system only while the visitor has not chosen for themselves */
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener?.('change', (e) => {
    if (!read()) paint(e.matches ? 'dark' : 'light');
  });
}
