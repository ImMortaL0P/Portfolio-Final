/* ------------------------------------------------------------------
   Site chrome, shared by every page: the nav (desktop and mobile),
   theme toggle, contact form, cursor pill and footer. Each page script
   calls initSite() once and then only deals with its own content, so
   the furniture around the work behaves identically everywhere.
------------------------------------------------------------------- */
import { initNav } from './nav.js';
import { initMobileNav } from './mobilenav.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initCursor } from './cursor.js';
import { initFooter } from './layers.js';
import { initProtect } from './protect.js';

export function initSite() {
  initProtect();
  initNav();
  initMobileNav();
  initTheme();
  initContact();
  initCursor();
  initFooter();
}
