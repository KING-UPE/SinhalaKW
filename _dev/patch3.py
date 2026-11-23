import os, re, shutil, time

ROOT = r"D:\SinhalaKW"
IDX = os.path.join(ROOT, "index.html")
CSS = os.path.join(ROOT, "css", "styles.css")
JS = os.path.join(ROOT, "js", "main.js")

bk = os.path.join(ROOT, "_dev", "backup_" + time.strftime("%Y%m%d_%H%M%S"))
os.makedirs(bk)
for f in (IDX, CSS, JS):
    shutil.copy2(f, bk)
print("backup ->", bk)

h = open(IDX, encoding="utf-8").read()
css = open(CSS, encoding="utf-8").read()
js = open(JS, encoding="utf-8").read()

def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:80])
    return s.replace(a, b)

# ======================= 1. ONLINE CLASS IMAGE =======================
os.makedirs(os.path.join(ROOT, "assets", "illustrations"), exist_ok=True)
shutil.copy2(os.path.join(ROOT, "_dev", "online_class.svg"), os.path.join(ROOT, "assets", "illustrations", "online_class.svg"))
h = rep(h, '<img src="assets/optimized/teacher/teacher_desk_16x9.webp" alt="Online පන්තිය" loading="lazy">',
        '<img src="assets/illustrations/online_class.svg" alt="Online පන්තිය: සජීවී පන්ති, පටිගත කළ පන්ති, නිබන්ධන නිවසටම සහ WhatsApp හරහා වැඩ පරීක්ෂාව" loading="lazy">')

# ======================= 2. CONTACT (no registration) =======================
h = rep(h, '<a href="#contact" class="btn btn-dark btn-sm hide-sm">Enroll Now</a>', '<a href="#contact" class="btn btn-dark btn-sm hide-sm">Contact Us</a>')
h = rep(h, '<a href="#contact">Contact &amp; Enroll</a>', '<a href="#contact">Contact Us</a>')
h = rep(h, '<span class="eyebrow reveal">ENROLL &amp; CONTACT</span>', '<span class="eyebrow reveal">CONTACT US</span>')
h = rep(h, '<p>පහත පෝරමය පුරවා WhatsApp හරහා එවන්න, නැතහොත් 074 362 4117 අංකයට අමතන්න. student.sinhalakw.lk ශිෂ්‍ය පද්ධතිය ළඟදීම විවෘත කෙරේ.</p>',
        '<p>පන්ති ලියාපදිංචිය ළඟදීම student.sinhalakw.lk ශිෂ්‍ය පද්ධතිය (Student LMS) හරහා සිදු කෙරේ. එතෙක් 074 362 4117 අංකයට අමතන්න, නැතහොත් පහත Contact Us පෝරමය හරහා WhatsApp පණිවිඩයක් එවන්න.</p>')

f0 = h.index('<form class="form reveal" id="regForm" novalidate>')
f1 = h.index('</form>', f0) + len('</form>')
h = h[:f0] + '''<form class="form reveal" id="contactForm" novalidate>
            <h3>Contact Us</h3>
            <p class="form-lead">ඔබගේ ප්‍රශ්නය හෝ පණිවිඩය මෙහි ලියා යවන්න. ඔබේ විස්තර සමඟ WhatsApp පණිවිඩයක් විවෘත වේ.</p>
            <div class="field-row">
              <label class="field">
                <span>ඔබගේ නම</span>
                <input type="text" id="cName" required autocomplete="name" placeholder="ඔබගේ නම ඇතුළත් කරන්න">
              </label>
              <label class="field">
                <span>දුරකථන අංකය</span>
                <input type="tel" id="cPhone" required placeholder="07X XXX XXXX" autocomplete="tel" inputmode="tel">
              </label>
            </div>
            <label class="field">
              <span>පණිවිඩය</span>
              <textarea id="cMsg" rows="4" required placeholder="ඔබගේ පණිවිඩය මෙහි ලියන්න"></textarea>
            </label>
            <button type="submit" class="btn btn-primary btn-block"><svg class="ic" aria-hidden="true"><use href="#i-wa"/></svg><span>WhatsApp හරහා යවන්න</span></button>
            <p class="form-note" id="formNote" role="status" aria-live="polite"></p>

            <div class="reg-soon">
              <span class="reg-soon-ic" aria-hidden="true"><svg class="ic"><use href="#i-lms"/></svg></span>
              <span class="reg-soon-txt"><strong>Student Registration</strong><span>පන්ති ලියාපදිංචිය ළඟදීම Student LMS හරහා සිදු කෙරේ.</span></span>
              <button type="button" class="reg-soon-btn" data-lms-trigger aria-haspopup="dialog">Coming Soon</button>
            </div>
          </form>''' + h[f1:]

j0 = js.index('  /* ---------- registration form -> WhatsApp message ---------- */')
j1 = js.index("$$('.field input').forEach(", j0)
j1 = js.index('\n', j1) + 1
js = js[:j0] + '''  /* ---------- contact form -> WhatsApp message ---------- */
  const form = $('#contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cName'), phone = $('#cPhone'), msgEl = $('#cMsg');
    const phoneOk = /^[0-9+\\s-]{9,15}$/.test(phone.value.trim());
    const fields = [[name, name.value.trim().length > 1], [phone, phoneOk], [msgEl, msgEl.value.trim().length > 1]];
    fields.forEach(([el, ok]) => el.classList.toggle('is-invalid', !ok));
    const note = $('#formNote');
    note.classList.toggle('is-ok', false);
    if (fields.some(([, ok]) => !ok)) {
      note.textContent = formMsgs.invalid;
      fields.find(([, ok]) => !ok)[0].focus();
      return;
    }
    const msg = [
      'ආයුබෝවන්! (සිංහල KW වෙබ් අඩවියෙන්)',
      '',
      `නම: ${name.value.trim()}`,
      `දුරකථන අංකය: ${phone.value.trim()}`,
      '',
      msgEl.value.trim()
    ].join('\\n');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    note.classList.toggle('is-ok', true);
    note.textContent = formMsgs.sent;
  });
  $$('.field input, .field textarea').forEach(i => i.addEventListener('input', () => i.classList.toggle('is-invalid', false)));
''' + js[j1:]
js = rep(js, "sent: 'WhatsApp විවෘත විය. පණිවිඩය යවා ලියාපදිංචිය සම්පූර්ණ කරන්න. WhatsApp විවෘත නොවුණේ නම් 074 362 4117 අංකයට අමතන්න.'",
         "sent: 'WhatsApp විවෘත විය. පණිවිඩය යවන්න. WhatsApp විවෘත නොවුණේ නම් 074 362 4117 අංකයට අමතන්න.'")

# ======================= 3. PROCESS · "Road to an A" =======================
p0 = h.index('<section class="section process" id="process">')
p1 = h.index('</section>', p0) + len('</section>')
old = h[p0:p1]
sub = re.search(r'<p class="sub reveal">(.*?)</p>', old, re.S).group(1)
steps = []
for b in old.split('<li class="step reveal">')[1:]:
    b = b[:b.rindex('</li>')]
    no = re.search(r'<span class="step-no">(.*?)</span>', b).group(1)
    t = re.search(r'<h3>(.*?)</h3>', b).group(1)
    p = re.search(r'<p>(.*?)</p>', b, re.S).group(1)
    tags = re.findall(r'<li>(.*?)</li>', re.search(r'<ul class="step-tags">(.*?)</ul>', b, re.S).group(1)) if 'step-tags' in b else []
    steps.append((no, t, p, tags))
assert len(steps) == 6, steps
icons = ["i-book", "i-clock", "i-rotate", "i-target", "i-mic", "i-video"]

C = 2 * 3.141592653589793 * 86
seg = C / 6
dash = seg - 7
segs = ""
for i in range(6):
    rot = -90 + i * 60 + (3.5 / C) * 360
    segs += (f'<circle class="dial-track" cx="100" cy="100" r="86" stroke-dasharray="{dash:.2f} {C - dash:.2f}" transform="rotate({rot:.2f} 100 100)"/>'
             f'<circle class="dial-seg" cx="100" cy="100" r="86" stroke-dasharray="{dash:.2f} {C - dash:.2f}" stroke-dashoffset="{dash:.2f}" style="--d:{dash:.2f}" transform="rotate({rot:.2f} 100 100)"/>')

items = ""
for i, (no, t, p, tags) in enumerate(steps):
    tg = ('\n                <ul class="jstep-tags">' + "".join(f"<li>{x}</li>" for x in tags) + '</ul>') if tags else ""
    items += f'''            <li class="jstep reveal" data-step="{i + 1}">
              <span class="jstep-node" aria-hidden="true"><svg class="ic"><use href="#{icons[i]}"/></svg></span>
              <article class="jstep-card">
                <span class="jstep-no" aria-hidden="true">{no}</span>
                <span class="jstep-kicker">Step {no}</span>
                <h3>{t}</h3>
                <p>{p}</p>{tg}
              </article>
            </li>
'''
mini_segs = "".join('<i></i>' for _ in range(6))

new = f'''<section class="section process" id="process">
      <div class="process-bg" aria-hidden="true"></div>
      <div class="container">
        <div class="journey">
          <aside class="journey-aside">
            <div class="journey-sticky">
              <span class="eyebrow on-dark reveal">OUR PROCESS</span>
              <h2 class="h2 on-dark reveal">6 Steps From Syllabus to an&nbsp;'A'</h2>
              <p class="sub on-dark reveal">{sub}</p>
              <div class="journey-dial reveal" id="jDial" aria-hidden="true">
                <svg viewBox="0 0 200 200">{segs}</svg>
                <span class="dial-a">A</span>
                <span class="dial-spark"><svg class="ic"><use href="#i-spark"/></svg></span>
              </div>
              <p class="journey-now" aria-hidden="true"><span>Step <b class="jn-no">01</b> / 06</span><strong class="jn-title">{steps[0][1]}</strong></p>
            </div>
          </aside>

          <div class="journey-track">
            <div class="journey-mini" aria-hidden="true">
              <span class="jm-segs">{mini_segs}</span>
              <span class="jm-text">Step <b class="jn-no">01</b> / 06 · <span class="jn-title">{steps[0][1]}</span></span>
            </div>
            <div class="journey-steps-wrap" id="jSteps">
            <span class="journey-line" aria-hidden="true"><span class="journey-line-fill"></span></span>
            <ol class="journey-steps">
{items}            <li class="jstep jstep-finish reveal" aria-hidden="true">
              <span class="jstep-node"><b>A</b></span>
              <div class="jfinish"><strong>An 'A' at the O/L</strong><span>සාමාන්‍ය පෙළ විභාගය</span></div>
            </li>
            </ol>
            </div>
          </div>
        </div>
      </div>
    </section>'''
h = h[:p0] + new + h[p1:]

# extra icons
sym = '''    <symbol id="i-clock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6M12 2v3"/></g></symbol>
    <symbol id="i-target" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></g></symbol>
    <symbol id="i-mic" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></g></symbol>
'''
k = h.index('    <symbol id="i-spark"')
h = h[:k] + sym + h[k:]

css += '''

/* =========================================================
   PROCESS · Road to an 'A'
   ========================================================= */
.process {
  background: radial-gradient(70% 55% at 85% 10%, #1A4A69, var(--navy-deep) 65%);
  color: #fff; overflow: clip;
}
.process-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, .08) 1.2px, transparent 1.4px);
  background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 70%);
          mask-image: linear-gradient(180deg, #000, transparent 70%);
}
.process .container { position: relative; }
.journey { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(40px, 6vw, 96px); align-items: start; }
.journey-sticky { position: sticky; top: calc(var(--header-h) + 36px); }
.journey-sticky .sub { margin-top: 14px; max-width: 42ch; }

.journey-dial { position: relative; width: clamp(190px, 17vw, 230px); aspect-ratio: 1; margin: clamp(28px, 4vw, 44px) 0 18px; --p: 0; }
.journey-dial > svg { width: 100%; height: 100%; overflow: visible; }
.dial-track, .dial-seg { fill: none; stroke-width: 11; stroke-linecap: round; }
.dial-track { stroke: rgba(255, 255, 255, .1); }
.dial-seg { stroke: var(--yellow); transition: stroke-dashoffset .7s var(--ease); filter: drop-shadow(0 0 6px rgba(255, 194, 14, .45)); }
.dial-seg.on { stroke-dashoffset: 0 !important; }
.dial-a {
  position: absolute; inset: 0; display: grid; place-items: center;
  font-size: clamp(84px, 8vw, 108px); font-weight: 800; line-height: 1; letter-spacing: -.04em;
  background: linear-gradient(160deg, #FFE48A 10%, var(--yellow) 45%, #E0A100 90%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  opacity: calc(.28 + var(--p) * .72);
  transform: scale(calc(.82 + var(--p) * .18));
  transition: opacity .7s var(--ease), transform .7s var(--ease), filter .7s;
}
.journey-dial.done .dial-a { filter: drop-shadow(0 0 22px rgba(255, 194, 14, .55)); }
.dial-spark { position: absolute; right: 12%; top: 12%; width: 22px; height: 22px; color: var(--yellow); opacity: 0; transform: scale(.3) rotate(-30deg); transition: opacity .5s, transform .7s var(--ease); }
.dial-spark .ic { width: 100%; height: 100%; }
.journey-dial.done .dial-spark { opacity: 1; transform: none; animation: sparkPulse 2.4s ease-in-out infinite; }
@keyframes sparkPulse { 50% { transform: scale(.75) rotate(20deg); } }

.journey-now { display: flex; flex-direction: column; gap: 4px; min-height: 58px; }
.journey-now span { font-size: 12.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(255, 255, 255, .55); }
.journey-now b { color: var(--yellow); }
.journey-now strong { font-size: 22px; font-weight: 800; color: #fff; }

.journey-mini { display: none; }

.journey-steps-wrap { position: relative; }
.journey-steps { list-style: none; margin: 0; padding: 0; }
.journey-line { position: absolute; left: 31px; top: 34px; bottom: 34px; width: 2px; background: rgba(255, 255, 255, .1); border-radius: 2px; }
.journey-line-fill {
  position: absolute; left: 0; top: 0; width: 100%; height: calc(var(--fill, 0) * 100%);
  background: linear-gradient(180deg, #FFE48A, var(--yellow));
  box-shadow: 0 0 12px rgba(255, 194, 14, .6); border-radius: 2px;
}
.jstep { position: relative; display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: clamp(16px, 2.4vw, 28px); align-items: start; }
.jstep + .jstep { margin-top: clamp(18px, 2.4vw, 26px); }
.jstep-node {
  position: relative; z-index: 1;
  width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center;
  background: #12364F; border: 1px solid rgba(255, 255, 255, .14);
  color: rgba(255, 255, 255, .6);
  transition: background .5s var(--ease), color .5s, box-shadow .5s, border-color .5s;
}
.jstep-node .ic { width: 26px; height: 26px; }
.jstep.is-passed .jstep-node, .jstep.is-active .jstep-node { background: var(--yellow); color: var(--ink); border-color: var(--yellow); }
.jstep.is-active .jstep-node { box-shadow: 0 0 0 8px rgba(255, 194, 14, .14), 0 0 30px rgba(255, 194, 14, .45); }

.jstep-card {
  position: relative; overflow: hidden;
  padding: clamp(22px, 2.6vw, 30px) clamp(22px, 2.8vw, 32px);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, .035);
  border: 1px solid rgba(255, 255, 255, .09);
  transition: background .5s var(--ease), border-color .5s, transform .6s var(--ease), box-shadow .6s var(--ease);
}
.jstep.is-active .jstep-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, .09), rgba(255, 255, 255, .03));
  border-color: rgba(255, 194, 14, .45);
  transform: translateX(6px);
  box-shadow: 0 30px 60px -30px rgba(0, 0, 0, .6);
}
.jstep-no {
  position: absolute; right: 18px; top: 6px;
  font-size: clamp(64px, 6vw, 92px); font-weight: 800; line-height: 1; letter-spacing: -.04em;
  color: transparent; -webkit-text-stroke: 1.5px rgba(255, 255, 255, .1);
  transition: -webkit-text-stroke-color .5s;
  pointer-events: none;
}
.jstep.is-active .jstep-no { -webkit-text-stroke-color: rgba(255, 194, 14, .55); }
.jstep-kicker { display: block; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--yellow); margin-bottom: 8px; }
.jstep-card h3 { font-size: clamp(19px, 1.7vw, 23px); font-weight: 800; line-height: 1.3; margin-bottom: 10px; color: #fff; padding-right: 70px; }
.jstep-card p { font-size: 15px; line-height: 1.85; color: rgba(255, 255, 255, .72); }
.jstep-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.jstep-tags li {
  font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 999px;
  background: rgba(255, 194, 14, .12); color: var(--yellow); border: 1px solid rgba(255, 194, 14, .25);
}

.jstep-finish { align-items: center; }
.jstep-finish .jstep-node { background: transparent; border: 2px dashed rgba(255, 194, 14, .5); color: var(--yellow); }
.jstep-finish .jstep-node b { font-size: 30px; font-weight: 800; line-height: 1; }
.jstep-finish.is-passed .jstep-node, .jstep-finish.is-active .jstep-node {
  background: linear-gradient(160deg, #FFE48A, var(--yellow) 50%, #E0A100); border: 0; color: var(--ink);
  box-shadow: 0 0 0 8px rgba(255, 194, 14, .14), 0 0 40px rgba(255, 194, 14, .6);
}
.jfinish { display: flex; flex-direction: column; gap: 2px; }
.jfinish strong { font-size: 20px; font-weight: 800; color: #fff; }
.jfinish span { font-size: 13.5px; color: rgba(255, 255, 255, .6); }

@media (max-width: 1080px) {
  .journey { grid-template-columns: minmax(0, 1fr); gap: 34px; }
  .journey-sticky { position: static; }
  .journey-dial, .journey-now { display: none; }
  .journey-mini {
    display: flex; flex-direction: column; gap: 8px;
    position: sticky; top: calc(var(--header-h) + 10px); z-index: 5;
    margin-bottom: 18px; padding: 12px 16px;
    border-radius: 16px; background: rgba(14, 46, 67, .88);
    border: 1px solid rgba(255, 255, 255, .12);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  }
  .jm-segs { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
  .jm-segs i { height: 4px; border-radius: 4px; background: rgba(255, 255, 255, .14); transition: background .4s; }
  .jm-segs i.on { background: var(--yellow); }
  .jm-text { font-size: 13px; font-weight: 700; color: rgba(255, 255, 255, .7); }
  .jm-text b, .jm-text .jn-title { color: var(--yellow); }
}
@media (max-width: 640px) {
  .jstep { grid-template-columns: 48px minmax(0, 1fr); gap: 14px; }
  .jstep-node { width: 48px; height: 48px; }
  .jstep-node .ic { width: 21px; height: 21px; }
  .journey-line { left: 23px; top: 26px; bottom: 26px; }
  .jstep.is-active .jstep-card { transform: none; }
  .jstep-card h3 { padding-right: 52px; }
  .jstep-finish .jstep-node b { font-size: 24px; }
}

/* contact form extras */
.field textarea {
  width: 100%; min-height: 120px; padding: 14px 16px; resize: vertical;
  border-radius: 14px; border: 1.5px solid var(--line); background: var(--bg);
  font: inherit; font-size: 15px; line-height: 1.6; color: var(--ink);
  transition: border-color .25s, box-shadow .25s, background .25s;
}
.field textarea:focus { outline: none; border-color: var(--yellow); background: #fff; box-shadow: 0 0 0 4px rgba(255, 194, 14, .2); }
.field textarea.is-invalid { border-color: #E5484D; }
.reg-soon {
  display: flex; align-items: center; gap: 12px;
  margin-top: 18px; padding: 14px 16px;
  border-radius: 16px; background: var(--bg); border: 1.5px dashed #E3D7AE;
}
.reg-soon-ic { flex: none; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: var(--ink); color: var(--yellow); }
.reg-soon-ic .ic { width: 20px; height: 20px; }
.reg-soon-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; font-size: 13px; line-height: 1.5; color: var(--muted); }
.reg-soon-txt strong { font-size: 14px; color: var(--ink); }
.reg-soon-btn {
  flex: none; margin-left: auto; height: 32px; padding: 0 12px; border-radius: 999px;
  font-size: 11.5px; font-weight: 800; letter-spacing: .02em;
  background: var(--yellow); color: var(--ink);
  transition: transform .3s var(--ease);
}
.reg-soon-btn:hover { transform: translateY(-2px); }
@media (max-width: 420px) {
  .reg-soon { flex-wrap: wrap; }
  .reg-soon-btn { margin-left: 52px; }
}
'''

anchor = "  /* ---------- lightbox ---------- */"
js = rep(js, anchor, '''  /* ---------- process journey ---------- */
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

''' + anchor)

open(IDX, "w", encoding="utf-8", newline="").write(h)
open(CSS, "w", encoding="utf-8", newline="").write(css)
open(JS, "w", encoding="utf-8", newline="").write(js)
print("ok; steps:", [s[1] for s in steps])
