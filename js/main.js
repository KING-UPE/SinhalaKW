// Sinhala KW · site interactions
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const formMsgs = {
    invalid: 'කරුණාකර සියලු තොරතුරු නිවැරදිව පුරවන්න.'
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

  /* ---------- results year tabs ---------- */
  const yTabs = $$('.year-tab');
  const selectYear = (tab, focus) => {
    yTabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls'))?.classList.toggle('is-hidden', !on);
    });
    if (focus) tab.focus();
  };
  yTabs.forEach((t, i) => {
    t.addEventListener('click', () => selectYear(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      selectYear(yTabs[(i + d + yTabs.length) % yTabs.length], true);
    });
  });

  /* ---------- testimonials · read more ---------- */
  const tCards = $$('.t-card');
  const measureT = () => tCards.forEach(c => {
    if (c.classList.contains('is-open')) return;
    c.classList.remove('is-full');
    const b = $('.t-body', c), extra = b.scrollHeight - b.clientHeight;
    // only clamp when at least ~3 more lines are hidden; otherwise show it all
    c.classList.toggle('is-clamped', extra > 80);
    c.classList.toggle('is-full', extra > 4 && extra <= 80);
  });
  measureT();
  window.addEventListener('resize', measureT);
  document.fonts?.ready.then(measureT);
  tCards.forEach(c => {
    const btn = $('.t-more', c);
    btn?.addEventListener('click', () => {
      const open = !c.classList.contains('is-open');
      c.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      $('span', btn).textContent = open ? 'Show less' : 'Read more';
      if (open) c.classList.remove('is-clamped');
      else { measureT(); if (c.getBoundingClientRect().top < 0) c.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    });
  });

  /* ---------- process journey ---------- */
  const jWrap = $('#jSteps');
  if (jWrap) {
    const jSteps = $$('.jstep', jWrap);
    const real = jSteps.filter(s => s.dataset.step);
    const dial = $('#jDial');
    const dialSegs = dial ? $$('.dial-seg', dial) : [];
    const miniSegs = $$('.jm-segs i');
    const fill = $('.journey-line-fill', jWrap);
    const noEls = $$('.jn-no'), titleEls = $$('.jn-title');
    let cur = -1, ticking = false;
    const nodeY = s => { const r = $('.jstep-node', s).getBoundingClientRect(); return r.top + r.height / 2; };
    const update = () => {
      ticking = false;
      const line = innerHeight * 0.55;
      let n = 0;
      jSteps.forEach((s, i) => { if (nodeY(s) <= line) n = i + 1; });
      const first = nodeY(jSteps[0]), last = nodeY(jSteps[jSteps.length - 1]);
      const p = Math.min(1, Math.max(0, (line - first) / (last - first)));
      fill.style.setProperty('--fill', p.toFixed(4));
      if (n === cur) return;
      cur = n;
      const k = Math.min(n, real.length);
      jSteps.forEach((s, i) => {
        s.classList.toggle('is-active', i === n - 1);
        s.classList.toggle('is-passed', i < n - 1);
      });
      dialSegs.forEach((g, i) => g.classList.toggle('on', i < k));
      miniSegs.forEach((g, i) => g.classList.toggle('on', i < k));
      if (dial) {
        dial.style.setProperty('--p', (k / real.length).toFixed(3));
        dial.classList.toggle('done', n > real.length);
      }
      const shown = real[Math.max(0, k - 1)];
      noEls.forEach(e => { e.textContent = shown.dataset.step.padStart(2, '0'); });
      titleEls.forEach(e => { e.textContent = $('h3', shown).textContent; });
    };
    const onScrollJ = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScrollJ, { passive: true });
    window.addEventListener('resize', onScrollJ);
    update();
  }

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

  /* ---------- contact form -> WhatsApp message ---------- */
  const form = $('#contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cName'), phone = $('#cPhone'), msgEl = $('#cMsg');
    const phoneOk = /^[0-9+\s-]{9,15}$/.test(phone.value.trim());
    const fields = [[name, name.value.trim().length > 1], [phone, phoneOk], [msgEl, msgEl.value.trim().length > 1]];
    fields.forEach(([el, ok]) => el.classList.toggle('is-invalid', !ok));
    const note = $('#formNote');
    note.classList.toggle('is-ok', false);
    if (fields.some(([, ok]) => !ok)) {
      note.textContent = formMsgs.invalid;
      fields.find(([, ok]) => !ok)[0].focus();
      return;
    }
    // Demo send: plays the animation only. Nothing leaves the browser.
    note.textContent = '';
    const first = name.value.trim().split(/\s+/)[0];
    const sendText = $('.send-text', form);
    form.classList.add('is-sending');
    sendText.textContent = 'යවමින්...';
    setTimeout(() => {
      form.classList.remove('is-sending');
      form.classList.add('is-sent');
      $('#doneTitle').textContent = `ස්තූතියි, ${first}!`;
      $('#formDone').setAttribute('aria-hidden', 'false');
      note.textContent = 'ඔබගේ පණිවිඩය යවා ඇත.';
      form.reset();
      sendText.textContent = 'පණිවිඩය යවන්න';
      $('#doneAgain').focus({ preventScroll: true });
    }, reduceMotion ? 250 : 1650);
  });
  $('#doneAgain')?.addEventListener('click', () => {
    form.classList.remove('is-sent');
    $('#formDone').setAttribute('aria-hidden', 'true');
    $('#formNote').textContent = '';
    $('#cName').focus();
  });
  $$('.field input, .field textarea').forEach(i => i.addEventListener('input', () => i.classList.toggle('is-invalid', false)));

  /* ---------- reviews spotlight ---------- */
  const spot = $('#tSpot');
  if (spot) {
    const picks = $$('.t-pick', spot), slides = $$('.t-slide', spot), pickRow = $('.t-picks', spot);
    let cur = 0;
    spot.style.setProperty('--t-dur', '8s');
    const go = (i, focus) => {
      cur = (i + picks.length) % picks.length;
      picks.forEach((p, k) => {
        const on = k === cur;
        p.classList.toggle('is-active', on);
        p.setAttribute('aria-selected', String(on));
        p.tabIndex = on ? 0 : -1;
      });
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === cur);
        s.setAttribute('aria-hidden', String(k !== cur));
      });
      // restart the progress bar on the newly active pick
      const bar = $('.t-pick-bar', picks[cur]);
      bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      if (focus) picks[cur].focus();
      if (pickRow.scrollWidth > pickRow.clientWidth + 2) {
        pickRow.scrollTo({ left: picks[cur].offsetLeft - pickRow.offsetLeft - 20, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };
    picks.forEach((p, i) => {
      p.addEventListener('click', () => go(i));
      p.addEventListener('keydown', e => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        go(cur + d, true);
      });
      $('.t-pick-bar', p).addEventListener('animationend', () => { if (i === cur) go(cur + 1); });
    });
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== 0)));
    if (!reduceMotion && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => spot.classList.toggle('is-playing', en.isIntersecting), { threshold: 0.35 }).observe(spot);
      const pause = on => spot.classList.toggle('is-paused', on);
      spot.addEventListener('pointerenter', () => pause(true));
      spot.addEventListener('pointerleave', () => pause(spot.contains(document.activeElement)));
      spot.addEventListener('focusin', () => pause(true));
      spot.addEventListener('focusout', e => { if (!spot.contains(e.relatedTarget)) pause(false); });
    }
  }

  /* ---------- results graph ---------- */
  const resultsSec = $('#results');
  const plot = $('#rPlot');
  const SERIES = {
    lang: { name: 'Sinhala Language', data: [22, 60, 63, 77] },
    lit: { name: 'Sinhala Lit', data: [10, 52, 88, 129] }
  };
  const YEARS = [2022, 2023, 2024, 2025];
  let view; // defined below with the view panel
  let drawn = reduceMotion;
  const chart = plot && (() => {
    let geo = null;
    const tip = document.createElement('div');
    tip.className = 'r-tip';
    const render = () => {
      const W = plot.clientWidth, H = plot.clientHeight;
      if (!W || !H) return;
      const narrow = W < 560;
      const m = { t: 14, r: narrow ? 52 : 132, b: 34, l: 40 };
      const keys = Object.keys(SERIES).filter(k => view[k]);
      const max = Math.max(...keys.flatMap(k => SERIES[k].data));
      const step = max > 100 ? 25 : 20;
      const top = Math.ceil((max * 1.08) / step) * step;
      const x = i => m.l + (i * (W - m.l - m.r)) / (YEARS.length - 1);
      const y = v => m.t + (1 - v / top) * (H - m.t - m.b);
      let grid = '', axis = '';
      for (let v = 0; v <= top; v += step) {
        grid += `<line class="${v ? '' : 'base'}" x1="${m.l}" x2="${W - m.r + (narrow ? 0 : 8)}" y1="${y(v)}" y2="${y(v)}"/>`;
        axis += `<text x="${m.l - 10}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
      }
      YEARS.forEach((yr, i) => { axis += `<text class="yr" x="${x(i)}" y="${H - 8}" text-anchor="middle">${yr}</text>`; });
      // end labels, nudged apart if they would collide
      const ends = keys.map(k => ({ k, y: y(SERIES[k].data.at(-1)) })).sort((a, b) => a.y - b.y);
      if (ends.length === 2 && ends[1].y - ends[0].y < 34) {
        const mid = (ends[0].y + ends[1].y) / 2;
        ends[0].y = mid - 17; ends[1].y = mid + 17;
      }
      const lastX = x(YEARS.length - 1);
      let lines = '', dots = '', labels = '';
      keys.forEach(k => {
        const d = SERIES[k].data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
        lines += `<path class="r-line ${k}" d="${d}"/>`;
        SERIES[k].data.forEach((v, i) => { dots += `<circle class="r-dot ${k}" data-i="${i}" cx="${x(i)}" cy="${y(v)}" r="5"/>`; });
        const ly = ends.find(e => e.k === k).y;
        labels += narrow
          ? `<text class="v" x="${lastX + 12}" y="${ly + 5}">${SERIES[k].data.at(-1)}</text>`
          : `<text class="v" x="${lastX + 14}" y="${ly - 2}">A ${SERIES[k].data.at(-1)}</text><text x="${lastX + 14}" y="${ly + 14}">${SERIES[k].name}</text>`;
      });
      plot.innerHTML = `<svg aria-hidden="true" focusable="false">
        <g class="r-grid">${grid}</g><g class="r-axis">${axis}</g>
        <line class="r-cross" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}"/>
        <g>${lines}</g><g>${dots}</g><g class="r-end">${labels}</g></svg>`;
      plot.appendChild(tip);
      geo = { x, y, m, W, H, keys };
      if (!drawn) $$('.r-line', plot).forEach(p => {
        const L = p.getTotalLength();
        p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      });
    };
    const draw = () => {
      if (drawn) return;
      drawn = true;
      $$('.r-line', plot).forEach(p => {
        p.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.22,.8,.24,1)';
        p.style.strokeDashoffset = '0';
      });
    };
    const hover = e => {
      if (!geo) return;
      const r = plot.getBoundingClientRect();
      const px = e.clientX - r.left;
      const span = (geo.W - geo.m.l - geo.m.r) / (YEARS.length - 1);
      const i = Math.max(0, Math.min(YEARS.length - 1, Math.round((px - geo.m.l) / span)));
      const cx = geo.x(i);
      const cross = $('.r-cross', plot);
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx);
      $$('.r-dot', plot).forEach(d => d.classList.toggle('on', +d.dataset.i === i));
      tip.innerHTML = `<strong>${YEARS[i]} O/L</strong>` + geo.keys
        .map(k => ({ k, v: SERIES[k].data[i] })).sort((a, b) => b.v - a.v)
        .map(({ k, v }) => `<div class="row"><span class="r-swatch s-${k}"></span>${SERIES[k].name}<b>A ${v}</b></div>`).join('');
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      const topY = Math.min(...geo.keys.map(k => geo.y(SERIES[k].data[i])));
      let left = cx + 14;
      if (left + tw > geo.W) left = cx - tw - 14;
      let tY = topY - th - 14;
      if (tY < 0) tY = Math.max(...geo.keys.map(k => geo.y(SERIES[k].data[i]))) + 14;
      tip.style.transform = `translate(${Math.max(0, left)}px, ${Math.min(tY, geo.H - th)}px)`;
      plot.classList.add('is-hover');
    };
    plot.addEventListener('pointermove', hover);
    plot.addEventListener('pointerdown', hover);
    plot.addEventListener('pointerleave', () => {
      plot.classList.remove('is-hover');
      $$('.r-dot.on', plot).forEach(d => d.classList.remove('on'));
    });
    if ('ResizeObserver' in window) new ResizeObserver(() => render()).observe(plot);
    else window.addEventListener('resize', render);
    if (!drawn && 'IntersectionObserver' in window) {
      const dio = new IntersectionObserver(([en]) => { if (en.isIntersecting) { draw(); dio.disconnect(); } }, { threshold: 0.4 });
      dio.observe(plot);
    } else drawn = true;
    return { render };
  })();

  /* ---------- view-options panel ---------- */
  const STORE = 'kw-view';
  const DEFAULTS = { adv: 'v2', sheets: true, graph: true, lang: true, lit: true };
  view = { ...DEFAULTS };
  try { Object.assign(view, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (_) { /* private mode */ }
  const applyView = () => {
    $('#special')?.setAttribute('data-adv', view.adv);
    resultsSec?.classList.toggle('no-sheets', !view.sheets);
    resultsSec?.classList.toggle('no-graph', !view.graph);
    $$('[data-pv="adv"] [role="radio"]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.value === view.adv)));
    ['sheets', 'graph', 'lang', 'lit'].forEach(k => { const i = $(`input[data-pv="${k}"]`); if (i) i.checked = view[k]; });
    $$('input[data-pv="lang"], input[data-pv="lit"]').forEach(i => { i.disabled = !view.graph; });
    $$('.r-key').forEach(b => b.setAttribute('aria-pressed', String(view[b.dataset.series])));
    chart?.render();
    try { localStorage.setItem(STORE, JSON.stringify(view)); } catch (_) { /* ignore */ }
  };
  // a line can be hidden, but never both: switching off the last one brings the other back
  const setSeries = (k, on) => {
    view[k] = on;
    if (!view.lang && !view.lit) view[k === 'lang' ? 'lit' : 'lang'] = true;
    applyView();
  };
  $$('.r-key').forEach(b => b.addEventListener('click', () => setSeries(b.dataset.series, b.getAttribute('aria-pressed') !== 'true')));
  $$('[data-pv="adv"] [role="radio"]').forEach(b => b.addEventListener('click', () => { view.adv = b.dataset.value; applyView(); }));
  $$('input[data-pv]').forEach(i => i.addEventListener('change', () => {
    const k = i.dataset.pv;
    if (k === 'lang' || k === 'lit') setSeries(k, i.checked);
    else { view[k] = i.checked; applyView(); }
  }));
  const pv = $('#pv');
  if (pv) {
    const tab = $('.pv-tab', pv);
    const setPv = open => {
      pv.classList.toggle('is-open', open);
      tab.setAttribute('aria-expanded', String(open));
    };
    tab.addEventListener('click', () => setPv(!pv.classList.contains('is-open')));
    $('.pv-close', pv).addEventListener('click', () => { setPv(false); tab.focus(); });
    $('.pv-reset', pv).addEventListener('click', () => { view = { ...DEFAULTS }; applyView(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && pv.classList.contains('is-open')) { setPv(false); tab.focus(); } });
  }
  applyView();

  /* ---------- misc ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
