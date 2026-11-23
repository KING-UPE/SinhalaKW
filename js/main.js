// Sinhala KW · site interactions
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Clear any cached language override so descriptions always render in authentic Sinhala
  try {
    localStorage.removeItem('kw-lang');
  } catch {}

  const formMsgs = {
    invalid: 'කරුණාකර සියලු තොරතුරු නිවැරදිව පුරවන්න.',
    success: 'ස්තූතියි! student.sinhalakw.lk සඳහා ඔබගේ ලියාපදිංචිය තහවුරු විය.'
  };

  /* ---------- header ---------- */
  const header = $('#siteHeader');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const menuBtn = $('#menuBtn');
  const menu = $('#mobileMenu');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  };
  menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) setMenu(false); });

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 6) * 70}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
        setTimeout(() => { el.style.transitionDelay = ''; }, 1200);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- count up ---------- */
  const counters = $$('.count');
  const runCount = el => {
    const to = +el.dataset.to;
    if (reduceMotion) { el.textContent = to; return; }
    const dur = 1400, t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    counters.forEach(c => { c.textContent = '0'; });
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- active nav link ---------- */
  const navLinks = $$('.nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const nio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => nio.observe(s));
  }

  /* ---------- hero parallax shapes ---------- */
  const hero = $('.hero');
  const decos = $$('.deco[data-depth]');
  if (hero && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let raf = 0;
    hero.addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        decos.forEach(d => {
          const k = +d.dataset.depth * 40;
          d.style.translate = `${-x * k}px ${-y * k}px`;
        });
      });
    });
  }

  /* ---------- gallery filter ---------- */
  const filters = $$('.filter');
  const items = $$('.m-item');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.filter;
    items.forEach(it => it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f));
  }));

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let group = [], idx = 0, lastFocus = null;
  const show = i => {
    idx = (i + group.length) % group.length;
    const t = group[idx];
    lbImg.src = t.dataset.src;
    lbImg.alt = t.querySelector('img')?.alt || '';
    lbCap.textContent = `${t.dataset.caption || ''}  ·  ${idx + 1} / ${group.length}`;
  };
  const open = trigger => {
    const name = trigger.dataset.lightbox;
    group = $$(`[data-lightbox="${name}"]`).filter(t => !t.closest('.is-hidden'));
    lastFocus = trigger;
    show(group.indexOf(trigger));
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  };
  const close = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  };
  $$('[data-lightbox]').forEach(t => t.addEventListener('click', () => open(t)));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-figure')) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
      return;
    }
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = 0;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });

  /* ---------- video ---------- */
  const video = $('#introVideo'), playBtn = $('#videoPlay');
  const card = video?.closest('.video-card');
  if (video && playBtn) {
    playBtn.addEventListener('click', () => {
      video.controls = true;
      video.play();
    });
    video.addEventListener('play', () => card.classList.add('is-playing'));
    video.addEventListener('pause', () => { if (!video.seeking) card.classList.remove('is-playing'); });
    video.addEventListener('ended', () => card.classList.remove('is-playing'));
  }

  /* ---------- interactive Student LMS modal (student.sinhalakw.lk) ---------- */
  const lmsModal = $('#lmsModal');
  const lmsClose = $('#lmsClose');
  const lmsDismiss = $('#lmsDismiss');
  const lmsTriggers = $$('[data-lms-trigger]');
  const lmsCopyBtn = $('#lmsCopyBtn');
  const lmsCopyTxt = $('#lmsCopyTxt');
  const lmsTabs = $$('.lms-tab');
  const lmsPanels = $$('.lms-preview-panel');
  const lmsPassForm = $('#lmsPassForm');
  const lmsNameInput = $('#lmsNameInput');
  const lmsPassCard = $('#lmsPassCard');
  const passStudentName = $('#passStudentName');
  const passId = $('#passId');

  function openLmsModal(prefillName = '') {
    if (!lmsModal) return;
    setMenu(false);
    lmsModal.classList.add('is-open');
    lmsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (prefillName) {
      if (lmsNameInput) lmsNameInput.value = prefillName;
      generateStudentPass(prefillName);
    }
    lmsClose?.focus();
  }

  function closeLmsModal() {
    if (!lmsModal) return;
    lmsModal.classList.remove('is-open');
    lmsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function generateStudentPass(name) {
    if (!name || !name.trim()) return;
    if (passStudentName) passStudentName.textContent = name.trim();
    if (passId) {
      const code = Math.floor(1000 + Math.random() * 9000);
      passId.textContent = `SKW-2026-LMS-${code}`;
    }
    if (lmsPassCard) {
      lmsPassCard.style.display = 'block';
      lmsPassCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  lmsTriggers.forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    openLmsModal();
  }));

  lmsClose?.addEventListener('click', closeLmsModal);
  lmsDismiss?.addEventListener('click', closeLmsModal);
  lmsModal?.addEventListener('click', e => {
    if (e.target === lmsModal) closeLmsModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lmsModal?.classList.contains('is-open')) closeLmsModal();
  });

  // Copy portal URL with visual feedback
  lmsCopyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('https://student.sinhalakw.lk');
      if (lmsCopyTxt) lmsCopyTxt.textContent = 'Copied! ✓';
      lmsCopyBtn.style.background = 'var(--yellow)';
      lmsCopyBtn.style.color = 'var(--ink)';
      setTimeout(() => {
        if (lmsCopyTxt) lmsCopyTxt.textContent = 'Copy Link';
        lmsCopyBtn.style.background = '';
        lmsCopyBtn.style.color = '';
      }, 2400);
    } catch {
      if (lmsCopyTxt) lmsCopyTxt.textContent = 'student.sinhalakw.lk';
    }
  });

  // Interactive LMS Feature Preview Tabs
  lmsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.lmsTab;
      lmsTabs.forEach(t => t.classList.toggle('is-active', t === tab));
      lmsPanels.forEach(p => p.classList.toggle('is-active', p.id === `prev-${target}`));
    });
  });

  // Interactive Student Pass Generator Form
  lmsPassForm?.addEventListener('submit', e => {
    e.preventDefault();
    const name = lmsNameInput?.value.trim();
    if (name) generateStudentPass(name);
  });

  /* ---------- registration form -> Student LMS Registration ---------- */
  const form = $('#regForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#fName'), phone = $('#fPhone'), school = $('#fSchool');
    const phoneOk = /^[0-9+\s-]{9,15}$/.test(phone.value.trim());
    const fields = [[name, name.value.trim().length > 1], [phone, phoneOk], [school, school.value.trim().length > 1]];
    fields.forEach(([el, ok]) => el.classList.toggle('is-invalid', !ok));
    const note = $('#formNote');
    if (fields.some(([, ok]) => !ok)) {
      if (note) note.textContent = formMsgs.invalid;
      return;
    }
    const studentData = {
      name: name.value.trim(),
      phone: phone.value.trim(),
      school: school.value.trim(),
      grade: $('#fGrade')?.value,
      mode: $('#fMode')?.value,
      registeredAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('kw_lms_student', JSON.stringify(studentData));
    } catch {}

    if (note) {
      note.style.color = '#10B981';
      note.textContent = formMsgs.success;
    }
    // Launch the LMS Coming Soon Modal with their pass immediately pre-generated!
    setTimeout(() => {
      openLmsModal(studentData.name);
    }, 400);
  });
  $$('.field input').forEach(i => i.addEventListener('input', () => i.classList.remove('is-invalid')));

  /* ---------- misc ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
