// Sinhala KW · site interactions
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- i18n (Sinhala is the HTML default; English below) ---------- */
  const en = {
    navAbout: 'Teacher', navResults: 'Results', navProcess: 'Method', navClasses: 'Classes',
    navGallery: 'Gallery', navFaq: 'FAQ', navContact: 'Contact', navEnroll: 'Enroll',
    heroPill: '2026 · 2027 batches now enrolling',
    heroT1: 'O/L Sinhala,',
    heroT2: '× 2',
    heroSub: 'Language and Literature Appreciation from one teacher, made simple with mind maps and special techniques.',
    heroCta: 'Enroll now', heroCta2: 'Our method', globeHint: 'Drag to rotate',
    teacherName: 'Kaushalya Wicramarachchi',
    aboutEyebrow: 'Your teacher',
    stampAL: 'A/L Arts',
    aboutP1: 'Earned 3 A passes in the G.C.E. A/L Arts stream, entered the Faculty of Arts at the University of Peradeniya and graduated with a Special Degree with class honours.',
    aboutP2: 'As a lecturer in O/L Sinhala Language & Literature and Sinhala Literature Appreciation, she has guided students across Sri Lanka to double A passes through a clear, structured programme.',
    fact1: 'A/L Arts stream', fact2: 'Special Degree, Peradeniya', fact3: 'subjects, one place',
    resEyebrow: 'Results', resTitle: 'Results speak', resSub: 'Grades earned by our students at the 2022 O/L examination.',
    st1: 'Sinhala Language & Literature', st2: 'Sinhala Literature Appreciation',
    resHint: 'Tap a result sheet to view it full size',
    procEyebrow: 'Our method', procTitle: '6 steps to an A',
    procSub: 'A structured programme that takes you from the first lesson to the exam hall.',
    s1t: 'Theory Class', s1d: 'The full syllabus taught step by step, simplified with mind maps and special techniques.',
    s2t: 'Live Exam', s2d: 'Timed live exams to master time management, marked and ranked.',
    s3t: 'Revision', s3d: 'Full syllabus revision starting about 4 months before the exam.',
    s4t: 'Final Shot Paper Class', s4d: 'Teacher-made papers in the exact exam pattern, full theory discussion and past paper review.',
    s5t: 'Seminars', s5d: 'Our signature seminar series: Term Test Revise, MCQ and Final Seminar.',
    s6t: 'Recorded Class', s6d: 'Recordings for students who cannot join live, with the same personal attention.',
    spEyebrow: 'What makes us different', spTitle: 'Sri Lanka’s best A-making programme',
    sp1t: 'Tutes to your door', sp1d: 'A complete set of tutes that builds you up step by step, delivered home.',
    sp2t: 'Exam practice in class', sp2d: 'Every question type, including critiques and appreciation, written in class within exam time.',
    sp3t: 'Every answer checked', sp3d: 'The teacher personally marks your work in class and via WhatsApp, including for students watching recordings.',
    clEyebrow: 'Classes', clTitle: 'The Sinhala class that works', clSub: 'Online from home, or in person at Mathugama and Meegahathenna.',
    v1t: 'Island-wide, from home', v1a: 'Live Zoom classes and recordings', v1b: 'Tutes delivered by courier', v1c: 'Work checked via WhatsApp',
    v2t: 'Mathugama', v2a: 'Physical classroom', v2b: 'In-class papers and marking', v2c: 'Tutes given in class',
    v3t: 'Meegahathenna', v3a: 'Physical classroom', v3b: 'Personal attention for every student', v3c: 'Tutes given in class',
    vidEyebrow: 'Inside the class', vidTitle: 'Watch how we teach',
    galEyebrow: 'Gallery', galTitle: 'Classes & seminar moments', fAll: 'All', fSem: 'Seminars', fClass: 'Classes',
    faqEyebrow: 'FAQ', faqTitle: 'Frequently asked', faqSub: 'Still have a question? Ask us on WhatsApp.',
    q1: 'How do online students get tutes?', a1: 'After registering, Theory Tutes, Paper Tutes, Q Books and more are sent to your home by courier.',
    q2: 'What if I miss a live class?', a2: 'Every class is recorded, and the teacher checks the work of students who learn from recordings too.',
    q3: 'Does the teacher check answers herself?', a3: 'Yes. All work, including critiques, is marked personally by the teacher in class and via WhatsApp.',
    q4: 'How do I register?', a4: 'Send a WhatsApp message to 074 362 4117, or fill in the form below.',
    ctEyebrow: 'Contact', ctTitle: 'Start your A journey today', ctPlace: 'Location', ctPlaceV: 'Meegahathenna, Sri Lanka',
    fmTitle: 'Register', fmName: 'Student name', fmPhone: 'WhatsApp number', fmSchool: 'School',
    fmGrade: 'Exam year', fmMode: 'Class', fmBtn: 'Send via WhatsApp',
  };
  const formMsgs = {
    si: { invalid: 'කරුණාකර සියලු තොරතුරු නිවැරදිව පුරවන්න.' },
    en: { invalid: 'Please fill in all fields correctly.' },
  };

  let lang = localStorage.getItem('kw-lang') === 'en' ? 'en' : 'si';
  const i18nEls = $$('[data-i18n]');
  i18nEls.forEach(el => { el.dataset.si = el.innerHTML; });

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    i18nEls.forEach(el => {
      const k = el.dataset.i18n;
      el.innerHTML = l === 'en' && en[k] ? en[k] : el.dataset.si;
    });
    $('#langLabel').textContent = l === 'en' ? 'සිං' : 'EN';
    const lbl = $('.globe-label');
    if (lbl) lbl.textContent = l === 'en' ? 'Sri Lanka' : 'ශ්‍රී ලංකාව';
    localStorage.setItem('kw-lang', l);
  }
  $('#langBtn')?.addEventListener('click', () => applyLang(lang === 'si' ? 'en' : 'si'));
  if (lang === 'en') applyLang('en');
  // globe label is created later by the module; sync once it exists
  const labelSync = new MutationObserver(() => {
    const lbl = $('.globe-label');
    if (lbl) { if (lang === 'en') lbl.textContent = 'Sri Lanka'; labelSync.disconnect(); }
  });
  const gs = $('#globeStage');
  if (gs) labelSync.observe(gs, { childList: true });

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

  /* ---------- registration form -> WhatsApp ---------- */
  const form = $('#regForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#fName'), phone = $('#fPhone'), school = $('#fSchool');
    const phoneOk = /^[0-9+\s-]{9,15}$/.test(phone.value.trim());
    const fields = [[name, name.value.trim().length > 1], [phone, phoneOk], [school, school.value.trim().length > 1]];
    fields.forEach(([el, ok]) => el.classList.toggle('is-invalid', !ok));
    const note = $('#formNote');
    if (fields.some(([, ok]) => !ok)) { note.textContent = formMsgs[lang].invalid; return; }
    note.textContent = '';
    const msg =
      'ආයුබෝවන් ගුරුතුමියනි,\nSinhala KW වෙබ් අඩවිය හරහා ලියාපදිංචි වීමට කැමැත්තෙමි.\n\n' +
      `• නම: ${name.value.trim()}\n` +
      `• WhatsApp: ${phone.value.trim()}\n` +
      `• පාසල: ${school.value.trim()}\n` +
      `• විභාග වර්ෂය: ${$('#fGrade').value}\n` +
      `• පන්තිය: ${$('#fMode').value}\n\nස්තූතියි!`;
    window.open(`https://wa.me/94743624117?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
  $$('.field input').forEach(i => i.addEventListener('input', () => i.classList.remove('is-invalid')));

  /* ---------- misc ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
