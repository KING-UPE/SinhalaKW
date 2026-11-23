// Sinhala KW · site interactions
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WA_NUMBER = '94743624117';
  const formMsgs = {
    invalid: 'කරුණාකර සියලු තොරතුරු නිවැරදිව පුරවන්න.',
    sent: 'WhatsApp විවෘත විය. පණිවිඩය යවා ලියාපදිංචිය සම්පූර්ණ කරන්න. WhatsApp විවෘත නොවුණේ නම් 074 362 4117 අංකයට අමතන්න.'
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
    filters.forEach(b => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
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
    document.body.classList.add('modal-open');
    $('#lbClose').focus();
  };
  const close = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
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

  /* ---------- Student LMS · Coming Soon modal ---------- */
  const cs = $('#lmsModal');
  const csDialog = cs && $('.cs-dialog', cs);
  let csLastFocus = null;
  const focusables = () => $$('a[href], button:not([disabled])', csDialog);

  const openCs = trigger => {
    if (!cs) return;
    setMenu(false);
    csLastFocus = trigger || document.activeElement;
    cs.classList.add('is-open');
    cs.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => $('.cs-close', cs)?.focus(), 60);
  };
  const closeCs = () => {
    if (!cs?.classList.contains('is-open')) return;
    cs.classList.remove('is-open');
    cs.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    csLastFocus?.focus?.();
  };

  $$('[data-lms-trigger]').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    openCs(btn);
  }));
  if (cs) $$('[data-cs-close]', cs).forEach(el => el.addEventListener('click', closeCs));
  document.addEventListener('keydown', e => {
    if (!cs?.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeCs(); return; }
    if (e.key === 'Tab') {
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* floating LMS button: only after the hero, and out of the way of the footer */
  const fab = $('.lms-fab');
  const footer = $('.footer');
  if (fab && hero && 'IntersectionObserver' in window) {
    let pastHero = false, atFooter = false;
    const sync = () => fab.classList.toggle('is-shown', pastHero && !atFooter);
    new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting; sync(); }, { threshold: 0.15 }).observe(hero);
    if (footer) new IntersectionObserver(([en]) => { atFooter = en.isIntersecting; sync(); }).observe(footer);
  } else {
    fab?.classList.add('is-shown');
  }

  /* ---------- registration form -> WhatsApp message ---------- */
  const form = $('#regForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#fName'), phone = $('#fPhone'), school = $('#fSchool');
    const phoneOk = /^[0-9+\s-]{9,15}$/.test(phone.value.trim());
    const fields = [[name, name.value.trim().length > 1], [phone, phoneOk], [school, school.value.trim().length > 1]];
    fields.forEach(([el, ok]) => el.classList.toggle('is-invalid', !ok));
    const note = $('#formNote');
    note.classList.toggle('is-ok', false);
    if (fields.some(([, ok]) => !ok)) {
      note.textContent = formMsgs.invalid;
      fields.find(([, ok]) => !ok)[0].focus();
      return;
    }
    const msg = [
      'ආයුබෝවන්! සිංහල KW පන්තියට ලියාපදිංචි වීමට කැමැත්තෙමි.',
      '',
      `නම: ${name.value.trim()}`,
      `දුරකථන අංකය: ${phone.value.trim()}`,
      `පාසල: ${school.value.trim()}`,
      `විභාග වර්ෂය: ${$('#fGrade').value}`,
      `පන්තිය: ${$('#fMode').value}`
    ].join('\n');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    note.classList.toggle('is-ok', true);
    note.textContent = formMsgs.sent;
  });
  $$('.field input').forEach(i => i.addEventListener('input', () => i.classList.toggle('is-invalid', false)));

  /* ---------- misc ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
