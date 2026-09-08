/* ============================================================
   AMR IBRAHIM — CYBERSECURITY PORTFOLIO
   script.js  |  Vanilla JS, no dependencies
   ============================================================ */
'use strict';

const qs  = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ----------------------------------------------------------
   1. NAV — scroll shadow
   ---------------------------------------------------------- */
(function () {
  const hdr = qs('#nav-header');
  if (!hdr) return;
  const fn = () => hdr.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', fn, { passive: true });
  fn();
})();

/* ----------------------------------------------------------
   2. HAMBURGER
   ---------------------------------------------------------- */
(function () {
  const btn   = qs('#hamburger');
  const links = qs('#nav-links');
  if (!btn || !links) return;

  const open = () => {
    btn.classList.add('open');
    links.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    btn.classList.remove('open');
    links.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => btn.classList.contains('open') ? close() : open());
  qsa('.nav-link', links).forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('click',   e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) close();
  });
})();

/* ----------------------------------------------------------
   3. SCROLL REVEAL
   ---------------------------------------------------------- */
(function () {
  const els = qsa('.reveal');
  if (!els.length) return;
  if (reduced) { els.forEach(el => el.classList.add('visible')); return; }

  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach(el => obs.observe(el));
})();

/* ----------------------------------------------------------
   4. ACTIVE NAV HIGHLIGHT
   ---------------------------------------------------------- */
(function () {
  const secs  = qsa('section[id]');
  const links = qsa('.nav-link[data-section]');
  if (!secs.length || !links.length) return;

  const setActive = id => links.forEach(l => l.classList.toggle('active', l.dataset.section === id));

  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
    { threshold: 0.35 }
  );
  secs.forEach(s => obs.observe(s));
})();

/* ----------------------------------------------------------
   5. SMOOTH SCROLL
   ---------------------------------------------------------- */
(function () {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = qs(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10
      ) || 68;
      window.scrollTo({
        top: t.getBoundingClientRect().top + scrollY - navH,
        behavior: 'smooth'
      });
    });
  });
})();

/* ----------------------------------------------------------
   6. FOOTER YEAR
   ---------------------------------------------------------- */
(function () {
  const el = qs('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ----------------------------------------------------------
   7. CERTIFICATE IMAGE FALLBACK
   ---------------------------------------------------------- */
(function () {
  const placeholder = () => `
    <div class="cred-placeholder" role="img" aria-label="Certificate image placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38"
           viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      <p>Certificate image<br>will appear here</p>
    </div>`;

  const applyFallback = img => {
    const wrap = img.closest('.cred-img-wrap');
    if (!wrap || wrap.querySelector('.cred-placeholder')) return;
    wrap.innerHTML = placeholder();
  };

  qsa('.cred-img').forEach(img => {
    if (img.complete && img.naturalWidth === 0) applyFallback(img);
    img.addEventListener('error', () => applyFallback(img));
  });
})();

/* ----------------------------------------------------------
   8. TERMINAL TYPEWRITER
   ---------------------------------------------------------- */
(function () {
  if (reduced) return;
  const lines = [qs('#term-line-1'), qs('#term-line-2')];
  lines.forEach((line, i) => {
    if (!line) return;
    const text = line.textContent;
    line.textContent = '';
    line.style.opacity = '0';
    setTimeout(() => {
      line.style.opacity = '1';
      let idx = 0;
      const iv = setInterval(() => {
        line.textContent += text[idx++];
        if (idx >= text.length) clearInterval(iv);
      }, 26);
    }, 900 + i * 650);
  });
})();

/* ----------------------------------------------------------
   9. SUBTLE CARD TILT  (desktop only)
   ---------------------------------------------------------- */
(function () {
  if (reduced || innerWidth < 768) return;
  qsa('.svc-card, .skill-cat').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -3;
      const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  3;
      card.style.transform =
        `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();
/* ----------------------------------------------------------
   10. CERTIFICATE MODAL
   ---------------------------------------------------------- */
(function () {
  const links = qsa('.cred-img-link, .cred-body a.btn-sm');
  if (!links.length) return;

  const modal = document.createElement('div');
  modal.className = 'certificate-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Certificate viewer');
  modal.innerHTML = `
    <div class="certificate-modal__panel">
      <button type="button" class="certificate-modal__close" aria-label="Close certificate viewer">&times;</button>
      <img class="certificate-modal__image" alt="Certificate preview">
    </div>`;
  document.body.appendChild(modal);

  const image = qs('.certificate-modal__image', modal);
  const closeBtn = qs('.certificate-modal__close', modal);
  let lastTrigger = null;

  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    image.removeAttribute('src');
    if (lastTrigger) lastTrigger.focus();
  };

  const open = trigger => {
    const src = trigger.getAttribute('href');
    if (!src) return;
    lastTrigger = trigger;
    image.src = src;
    const sourceImg = trigger.closest('.cred-card')?.querySelector('.cred-img');
    image.alt = sourceImg?.alt || 'Certificate preview';
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    closeBtn.focus();
  };

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      open(link);
    });
  });

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();
