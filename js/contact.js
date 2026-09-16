/* ------------------------------------------------------------------
   Contact modal.

   Uses FormSubmit (formsubmit.co) to send the form directly to email via AJAX.
   The first time this runs, FormSubmit will send a confirmation email 
   to the target address. You MUST click 'Activate' in that email.
------------------------------------------------------------------- */

const TO = 'kumarmangalam.patna@gmail.com';

const FIELDS = `
  <div class="cf__cols">
    <div class="cf__col">
      <label class="cf__field">
        <span class="cf__label meta">Your name</span>
        <input class="cf__input" name="name" type="text" required autocomplete="name" placeholder="Who am I talking to?">
      </label>
      <label class="cf__field">
        <span class="cf__label meta">Email</span>
        <input class="cf__input" name="email" type="email" required autocomplete="email" placeholder="you@company.com">
      </label>
      <label class="cf__field">
        <span class="cf__label meta">Timeline</span>
        <select class="cf__input" name="timeline">
          <option>Not fixed yet</option>
          <option>Within a month</option>
          <option>One to three months</option>
          <option>Later this year</option>
        </select>
      </label>
      <label class="cf__field">
        <span class="cf__label meta">Budget <span class="cf__opt">optional</span></span>
        <select class="cf__input" name="budget">
          <option>Rather discuss it</option>
          <option>Under \u20B925,000</option>
          <option>\u20B925,000 &ndash; \u20B975,000</option>
          <option>\u20B975,000 &ndash; \u20B92,00,000</option>
          <option>Above \u20B92,00,000</option>
        </select>
      </label>
    </div>

    <div class="cf__col">
      <fieldset class="cf__fieldset">
        <legend class="cf__label meta">What do you need?</legend>
        <div class="cf__chips">
          <label class="cf__chip"><input type="radio" name="kind" value="Identity &amp; Brand" checked><span>Identity</span></label>
          <label class="cf__chip"><input type="radio" name="kind" value="Website or Product"><span>Website</span></label>
          <label class="cf__chip"><input type="radio" name="kind" value="Editorial &amp; Print"><span>Print</span></label>
          <label class="cf__chip"><input type="radio" name="kind" value="Photography"><span>Photography</span></label>
          <label class="cf__chip"><input type="radio" name="kind" value="Something else"><span>Other</span></label>
        </div>
      </fieldset>

      <label class="cf__field cf__field--grow">
        <span class="cf__label meta">The project</span>
        <textarea class="cf__input cf__textarea" name="message" rows="3" required
          placeholder="What are you making, who is it for, and what has to be true for it to work?"></textarea>
      </label>
    </div>
  </div>`;

function markup() {
  const el = document.createElement('div');
  el.className = 'cf';
  el.id = 'contact-modal';
  el.hidden = true;
  el.innerHTML = `
    <div class="cf__scrim" data-close></div>
    <div class="cf__panel section--dark" role="dialog" aria-modal="true" aria-labelledby="cf-title">
      <button class="cf__close meta" type="button" data-close aria-label="Close">Close &times;</button>

      <div class="cf__head">
        <p class="cf__eyebrow meta">New project</p>
        <h2 class="cf__title" id="cf-title">Let's Create.</h2>
        <p class="cf__sub">Tell me what you're making. I read everything myself and reply within two working days.</p>
      </div>

      <form class="cf__form" novalidate>
        ${FIELDS}
        <p class="cf__error meta" role="alert" hidden></p>
        <div class="cf__foot">
          <button class="button-chip meta primary cf__send" type="submit" data-cursor="SEND">Send it &#8599;</button>
          <span class="cf__note meta">Sends straight to my inbox via secure SMTP.</span>
        </div>
      </form>

      <div class="cf__done" hidden>
        <p class="cf__eyebrow meta">Delivered successfully</p>
        <h3 class="cf__title">On its way.</h3>
        <p class="cf__sub">If you have attachments, write to <a href="mailto:${TO}">${TO}</a> directly &mdash; it reaches the same place.</p>
        <button class="button-chip meta cf__again" type="button" data-close>Close</button>
      </div>
    </div>`;
  return el;
}

async function deliver(data) {
  const subject = `New project — ${data.kind} — ${data.name}`;
  const body = [
    `Name:      ${data.name}`,
    `Email:     ${data.email}`,
    `Needs:     ${data.kind}`,
    `Timeline:  ${data.timeline}`,
    `Budget:    ${data.budget}`,
    '',
    'The project',
    '-----------',
    data.message,
  ].join('\n');

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${TO}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: subject,
        email: data.email,
        name: data.name,
        message: body
      })
    });
    if (!res.ok) throw new Error('Failed to send message');
  } catch(e) {
    console.error(e);
    // Fallback to mailto if ajax fails
    location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

export function initContact() {
  if (document.querySelector('#contact-modal')) return;

  const modal = markup();
  document.body.appendChild(modal);

  const panel = modal.querySelector('.cf__panel');
  const form = modal.querySelector('.cf__form');
  const done = modal.querySelector('.cf__done');
  const err = modal.querySelector('.cf__error');
  let opener = null;

  const focusable = () =>
    [...panel.querySelectorAll('a[href], button, input, select, textarea')].filter((n) => !n.disabled && n.offsetParent !== null);

  const open = (from) => {
    opener = from || null;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    form.hidden = false;
    done.hidden = true;
    err.hidden = true;
    if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(panel, { y: 28, scale: 0.985 }, { y: 0, scale: 1, duration: 0.55, ease: 'power3.out' });
      gsap.from(panel.querySelectorAll('.cf__head > *, .cf__field, .cf__fieldset, .cf__foot'), {
        opacity: 0, y: 14, duration: 0.45, stagger: 0.045, ease: 'power2.out', delay: 0.08,
      });
    }
    setTimeout(() => panel.querySelector('input[name="name"]')?.focus(), 60);
  };

  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    opener?.focus?.();
  };

  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });

  addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    /* keep tabbing inside the dialog */
    const f = focusable();
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const missing = [];
    if (!String(d.name || '').trim()) missing.push('your name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email || ''))) missing.push('a valid email');
    if (String(d.message || '').trim().length < 10) missing.push('a line or two about the project');
    if (missing.length) {
      err.textContent = `Still need ${missing.join(', ')}.`;
      err.hidden = false;
      return;
    }
    err.hidden = true;
    
    const btn = form.querySelector('.cf__send');
    const origText = btn.innerHTML;
    btn.innerHTML = 'Sending...';
    btn.disabled = true;
    
    await deliver(d);
    
    btn.innerHTML = origText;
    btn.disabled = false;
    form.hidden = true;
    done.hidden = false;
  });

  /* any control that asks for contact opens this instead of jumping */
  const wire = () => {
    document.querySelectorAll('a[href="#contact"], a[href="index.html#contact"], [data-contact]').forEach((el) => {
      if (el.dataset.cfWired) return;
      el.dataset.cfWired = '1';
      /* stop it here: the smooth-scroll handler also listens for
         anchor clicks and would slide the page behind the dialog */
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        open(el);
      }, true);
    });
  };
  wire();

  return { open, close, wire };
}
