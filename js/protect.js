/* ------------------------------------------------------------------
   Asset protection.

   Nothing a browser can display can be made truly undownloadable — a
   screenshot or the network panel always works. What this does is close
   every casual route, which is how nearly all lifting happens:
     · no context menu (so no "Save image as" / "Open image in new tab")
     · no dragging images or videos out to the desktop
     · no Save page / View source / Print shortcuts, and the common
       developer-tools shortcuts
     · no long-press "Save to Photos" callout on iOS / Android (CSS)
     · images and video are blanked when the page is printed (CSS)

   Form fields keep their context menu so paste and spell-check still work.
------------------------------------------------------------------- */
const editable = (el) => !!el?.closest?.('input, textarea, select, [contenteditable="true"]');

export function initProtect() {
  if (window.__mgProtected) return;
  window.__mgProtected = true;

  document.addEventListener('contextmenu', (e) => {
    if (!editable(e.target)) e.preventDefault();
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target.closest?.('img, video, picture, svg, canvas, .reel__fig, .series__open, .pc__media')) e.preventDefault();
  });

  addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    const blocked =
      (mod && (k === 's' || k === 'u' || k === 'p')) ||              /* save, view source, print */
      e.key === 'F12' ||
      (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) || /* dev tools, console, inspect */
      (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c' || k === 'u'));  /* the same on macOS */
    if (blocked) e.preventDefault();
  }, true);

  /* images and videos added later (store grid, reel, lightboxes) get the
     same attributes as the ones in the markup */
  const harden = (root) => {
    root.querySelectorAll?.('img:not([data-guarded])').forEach((img) => {
      img.setAttribute('draggable', 'false');
      img.dataset.guarded = '';
    });
    root.querySelectorAll?.('video:not([data-guarded])').forEach((v) => {
      v.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
      v.setAttribute('disablepictureinpicture', '');
      v.setAttribute('disableremoteplayback', '');
      v.setAttribute('draggable', 'false');
      v.dataset.guarded = '';
    });
  };
  harden(document);
  new MutationObserver((muts) => {
    muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) harden(n.parentNode || n); }));
  }).observe(document.body, { childList: true, subtree: true });
}
