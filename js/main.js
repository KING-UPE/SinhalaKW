// Sinhala KW · site interactions
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- i18n (Sinhala is the HTML default; English below) ---------- */
  const en = {
    navAbout: 'About Teacher', navResults: 'Results', navProcess: 'Methodology', navClasses: 'Classes',
    navGallery: 'Gallery', navFaq: 'FAQ', navContact: 'Contact & Enroll', navEnroll: 'Enroll Now',
    heroPill: '2026 · 2027 Batches Now Enrolling',
    heroT1: 'O/L Sinhala Language & Literature,',
    heroT2: 'Dual A Passes',
    heroSub: 'Master both Sinhala Language & Literature (Subject 41) and Literature Appreciation (Subject 42) under one expert educator. Simplified through visual mind maps, timed exam drills, and personalized grading.',
    heroCta: 'Enroll Now', heroCta2: 'Our Methodology', globeHint: 'Drag to rotate · Hover to explore in 3D',
    emSolid: 'Gold', emParticles: 'Particles', emGlass: 'Glass', emLayers: 'Layers',
    cfgTitle: '3D Logo', cfgStyle: 'Style', cfgColour: 'Colours', cfgBrand: 'Brand', cfgNavy: 'Navy', cfgGold: 'Gold',
    cfgDepth: 'Depth', cfgSpeed: 'Motion Speed', cfgSway: 'Gentle Sway', cfgSpin: 'Spin Emblem',
    cfgHover: 'Hover Effect', cfgReset: 'Reset Defaults',
    teacherName: 'Kaushalya Wicramarachchi',
    aboutEyebrow: 'ABOUT THE TEACHER',
    stampAL: 'A/L Arts Stream',
    aboutP1: 'Having achieved 3 A passes in the G.C.E. Advanced Level Arts stream, Kaushalya Wicramarachchi graduated with honors from the Faculty of Arts at the University of Peradeniya. Her deep academic grounding in classical Sinhala literature, linguistics, and pedagogical psychology forms the backbone of her structured teaching approach.',
    aboutP2: 'Specializing in both G.C.E. Ordinary Level Sinhala Language & Literature (Subject 41) and Sinhala Literature Appreciation (Subject 42), she delivers a unified curriculum where grammar fundamentals directly enhance literary criticism. Through conceptual mind-mapping, answer-writing templates, and line-by-line personal evaluation, she has guided hundreds of students across Sri Lanka to secure double A passes in their official O/L examinations.',
    fact1: 'G.C.E. A/L Arts Stream', fact2: 'Special Degree, University of Peradeniya', fact3: 'Dual A Track Under One Teacher',
    resEyebrow: 'PROVEN RESULTS', resTitle: 'Proven Results That Speak for Themselves',
    resSub: 'Verified achievements of our students in the official G.C.E. Ordinary Level examinations, reflecting our structured methodology and individual attention.',
    st1: 'Sinhala Language & Literature (සිංහල භාෂාව හා සාහිත්‍යය)', st2: 'Literature Appreciation (සාහිත්‍ය රසාස්වාදය)',
    resHint: 'Click any verified result sheet to inspect in high resolution',
    procEyebrow: 'OUR METHODOLOGY', procTitle: '6 Structured Steps to Achieving an A',
    procSub: 'A comprehensive, step-by-step academic pathway engineered to transform foundational concepts into exam-room perfection.',
    s1t: 'Comprehensive Theory Mastery', s1d: 'Complete coverage of the official syllabus using visual mind maps, root grammar breakdowns, and clear literary analysis that makes complex concepts intuitive and memorable.',
    s2t: 'Timed Live Exam Simulations', s2d: 'Regular timed paper sessions mimicking real exam hall pressures. Teaches precise time management, builds rapid essay composition speed, and provides objective island-wide ranking.',
    s3t: 'Cyclical Syllabus Revision', s3d: 'Complete syllabus revision starting 4 months before the exam. Focuses on high-frequency question patterns, recurring grammar traps, and targeted consolidation of weak areas.',
    s4t: 'Final Shot Target Paper Class', s4d: 'Exclusive model papers crafted to match the exact Department of Examinations blueprint. Comprehensive discussion of marking schemes, model answer structures, and mark allocation criteria.',
    s5t: 'Exclusive Masterclass Seminars', s5d: 'High-impact academic seminars including Term Test Revise, 100+ Rapid MCQ Workshops, and our flagship Final Motivation & Exam-Strategy Masterclass.',
    s6t: 'HD Video Archive & Continuous Mentoring', s6d: 'Full access to high-definition recordings for missed or revision lectures, accompanied by 1-on-1 teacher feedback on all homework and creative writing submissions.',
    spEyebrow: 'THE KW ADVANTAGE', spTitle: 'Why Top Students Choose Sinhala KW',
    sp1t: 'Complete Study Packs Delivered Home', sp1d: 'Professionally printed and bound study packs couriered directly to your home before each term starts. You receive comprehensive theory modules, classified question banks, rapid MCQ sheets, and exclusive final guess papers.',
    sp2t: 'In-Class Real-Time Writing Mastery', sp2d: 'No passive listening. In every session, students practice writing essay introductions, literary appreciations, and analytical critiques against the clock, building the muscle memory needed for the actual exam.',
    sp3t: '1-on-1 Personalized Marking by the Teacher', sp3d: 'Every single answer script, creative writing task, and model paper is personally evaluated with detailed corrections by Kaushalya Wicramarachchi herself—both in physical halls and via the student.sinhalakw.lk student LMS.',
    clEyebrow: 'CLASS VENUES & MODES', clTitle: 'Flexible Learning Across Sri Lanka', clSub: 'Experience the same high-standard curriculum whether you learn from home or in our dedicated physical lecture halls in Mathugama and Meegahathenna.',
    v1t: 'Island-Wide Live Online Platform', v1a: 'Live Zoom lectures with two-way interaction + HD backup recordings', v1b: 'Full printed study packs couriered directly to your home address', v1c: 'Direct assignment evaluation and feedback via student.sinhalakw.lk LMS platform',
    v2t: 'ZINERGY Institute · Mathugama', v2a: 'Modern, comfortable, and air-conditioned lecture facility', v2b: 'In-person timed testing and instant teacher grading', v2c: 'Complete printed study packs distributed in class',
    v3t: 'LAYARA Institute · Meegahathenna', v3a: 'Focused small-group classroom atmosphere with individual attention', v3b: 'Direct guidance and continuous academic progress tracking', v3c: 'Complete printed study packs distributed in class',
    vidEyebrow: 'CLASSROOM EXPERIENCE', vidTitle: 'Experience Our Teaching Methodology in Action',
    galEyebrow: 'CAMPUS LIFE & SEMINARS', galTitle: 'Moments of Learning, Inspiration & Success', fAll: 'All Moments', fSem: 'Seminars', fClass: 'Classes',
    faqEyebrow: 'FREQUENTLY ASKED QUESTIONS', faqTitle: 'Frequently Asked Questions', faqSub: 'Have questions about classes, study materials, or our new student.sinhalakw.lk LMS?',
    q1: 'How do online students receive their printed study packs?', a1: 'After completing registration, the full curriculum package—including Theory Manuals, Model Paper Tutes, and Question Books—is dispatched via registered courier straight to your home anywhere in Sri Lanka.',
    q2: 'What happens if a student misses a scheduled live lecture?', a2: 'All live sessions are recorded in high-definition video and uploaded to our student portal. Students can watch anytime, and their homework submissions receive the same thorough teacher evaluation.',
    q3: 'Does teacher Kaushalya Wicramarachchi evaluate student papers personally?', a3: 'Yes, 100%. All submitted essays, literary appreciations, and exam papers are personally graded with line-by-line feedback by Kaushalya Wicramarachchi herself, ensuring genuine individual improvement.',
    q4: 'Can students enroll for both Sinhala Language and Literature Appreciation?', a4: 'Yes! In fact, we strongly recommend it. Our curriculum is seamlessly synchronized so that grammatical precision reinforces literary appreciation, maximizing your chances of achieving double A passes.',
    q5: 'How do I enroll for the upcoming batches?', a5: 'Enroll online through student.sinhalakw.lk or complete the early registration form below to secure your LMS portal access.',
    ctEyebrow: 'ENROLLMENT & INQUIRIES', ctTitle: 'Begin Your Journey to 2 A Passes Today', ctPlace: 'Location', ctPlaceV: 'Meegahathenna, Sri Lanka',
    fmTitle: 'Fast-Track Student Registration', fmName: 'Student Full Name', fmPhone: 'Contact Phone Number', fmSchool: 'School Name',
    fmGrade: 'Target Examination Year', fmMode: 'Preferred Learning Mode', fmBtn: 'Register for student.sinhalakw.lk',
  };
  const formMsgs = {
    si: { invalid: 'කරුණාකර සියලු තොරතුරු නිවැරදිව පුරවන්න.', success: 'ස්තූතියි! student.sinhalakw.lk සඳහා ඔබගේ ලියාපදිංචිය තහවුරු විය.' },
    en: { invalid: 'Please fill in all fields correctly.', success: 'Thank you! Your registration for student.sinhalakw.lk has been recorded.' },
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
    localStorage.setItem('kw-lang', l);
  }
  $('#langBtn')?.addEventListener('click', () => applyLang(lang === 'si' ? 'en' : 'si'));
  if (lang === 'en') applyLang('en');

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
      if (note) note.textContent = formMsgs[lang].invalid;
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
      note.textContent = formMsgs[lang].success;
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
