/* Solstice Climate — interaction layer */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll progress + header shrink + completion dial ---------- */
  const progress = document.getElementById('scrollProgress');
  const header = document.getElementById('siteHeader');
  const dial = document.getElementById('progressDial');
  const dialFill = document.getElementById('progressDialFill');
  const dialNum = document.getElementById('progressDialNum');
  const DIAL_CIRCUMFERENCE = 2 * Math.PI * 24;

  const onScroll = () => {
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = h.scrollHeight - h.clientHeight;
    const pct = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    if (progress) progress.style.width = `${pct * 100}%`;
    if (header) header.classList.toggle('is-scrolled', scrollTop > 40);
    if (dial) dial.classList.toggle('is-visible', scrollTop > window.innerHeight * 0.6);
    if (dialFill) dialFill.style.strokeDashoffset = String(DIAL_CIRCUMFERENCE * (1 - pct));
    if (dialNum) dialNum.textContent = `${Math.round(pct * 100)}%`;
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (dial) {
    dial.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mobileMenu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal-up, .hero-title .line');
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = Number(entry.target.dataset.delay || 0) * 90;
            setTimeout(() => entry.target.classList.add('is-visible'), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Animated counters + stat rings ---------- */
  const counters = document.querySelectorAll('.counter');
  const statRings = document.querySelectorAll('.stat-ring-fill');

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const counter = card.querySelector('.counter');
        const ring = card.querySelector('.stat-ring-fill');
        if (counter) animateCounter(counter);
        if (ring) {
          const pct = Number(ring.dataset.target) / 100;
          const circumference = 2 * Math.PI * 52;
          ring.style.strokeDashoffset = String(circumference * (1 - pct));
        }
        statIO.unobserve(card);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('.stat-ring-card').forEach((c) => statIO.observe(c));

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      let raf = null;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
        });
      });
      btn.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Parallax floating cards + hero bg ---------- */
  if (!reduceMotion) {
    const heroBgImg = document.querySelector('.hero-bg img');
    const card2 = document.getElementById('floatCard2');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (heroBgImg) heroBgImg.style.transform = `scale(1.08) translateY(${y * 0.12}px)`;
        if (card2) card2.style.transform = `translateY(${y * -0.05}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Before / After compare slider ---------- */
  const compare = document.getElementById('compareSlider');
  const before = document.getElementById('compareBefore');
  const handle = document.getElementById('compareHandle');
  if (compare && before && handle) {
    let dragging = false;

    const setPosition = (clientX) => {
      const rect = compare.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      before.style.width = `${pct}%`;
      handle.style.left = `${pct}%`;
    };

    const start = () => { dragging = true; };
    const stop = () => { dragging = false; };
    const move = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    };

    compare.addEventListener('mousedown', (e) => { start(); setPosition(e.clientX); });
    compare.addEventListener('touchstart', (e) => { start(); setPosition(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
  }

  /* ---------- Contact form validation + success ---------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (form && formSuccess) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach((input) => {
        const field = input.closest('.field');
        if (!field) return;
        const isValid = input.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value) : input.value.trim().length > 0;
        field.classList.toggle('is-invalid', !isValid);
        if (!isValid) valid = false;
      });
      if (!valid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        formSuccess.classList.add('is-visible');
        form.reset();
        setTimeout(() => formSuccess.classList.remove('is-visible'), 4500);
      }, 1100);
    });

    form.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('input', () => input.closest('.field')?.classList.remove('is-invalid'));
    });
  }

  /* ---------- Newsletter ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button');
      const input = newsletterForm.querySelector('input');
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>';
      input.value = '';
      setTimeout(() => {
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      }, 2200);
    });
  }

  /* ---------- Smooth anchor scroll offset for fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
})();
