import os, re, shutil, time, html

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

ZWJ = "\u200d"
def sinfix(t):
    # yansaya / rakaransaya (C + hal + ZWJ + ය/ර) and repaya (ර + hal + ZWJ + C)
    t = re.sub(r"([\u0D9A-\u0DC6])\u0DCA(?=[\u0DBA\u0DBB])", lambda m: m.group(1) + "\u0DCA" + ZWJ, t)
    t = re.sub(r"\u0DBB\u0DCA(?=[\u0D9A-\u0DC6])", "\u0DBB\u0DCA" + ZWJ, t)
    return t

# Texts transcribed word-for-word from the screenshots (emojis removed, spelling kept as written).
# (name, year/batch, lang, [paragraphs])
FEATURE = ("මින්තුලි දුල්හාරා", "2025 O/L", "si", [
    "ගුරුතුමියනි, ඔබ අපට අකුරු පමණක් නොව, ඒ අකුරුවල අරුතත්, ජීවිතයේ අගයත් උගන්වා දුන්නා. කවියත්, කතාවත් අතරින් අපි සිතන්න, හැඟෙන්න, සහ හොඳ මනුෂ්යයන් වෙන්න ඉගෙනගත්තේ ඔබ නිසා. සිනහවෙන්, සෙනෙහසෙන්, ඉවසීමෙන් අපට මඟ පෙන්වූ ඔබ අපගේ ජීවිතයේ අමතක නොවන ගුරුතුමියක්.",
    "Thank you very much for your help Madam",
])

CARDS = [
    ("ආකාෂ් තිනුල", "2025 O/L", "en", [
        "Dear Teacher,",
        "Today may have been the last day of our Sinhala Literature class, but the stories, poems, and lessons you shared with us will stay in our hearts forever.",
        "You didn’t just teach us literature — you taught us how to feel words, how to understand emotions hidden between lines, and how beautiful our language truly is. Every poem became alive because of you, and every lesson became a memory we’ll cherish.",
        "Thank you for your patience, your guidance, and the passion you showed in every class. If literature is an art, then you are truly an artist who painted it beautifully for us.",
        "We are grateful beyond words.",
    ]),
    ("අදීෂා අමන්දි", "2025 O/L", "si", [
        "මම මිස්ගේ online පන්තියට ආවේ දහය වසර ඉඳලා එතකොට මට lit වලට s සාමාර්ථයක් තමයි තිබුණේ මිස් කියල දීපු දේවල් හොඳින් අවධානයෙන් අහන් හිටියා online පන්තියක්උනාට කිසිම කම්මැලිකමක් දැනුනේ නෑ. මිස්ගෙ පන්තියට සම්බන්ධවෙලා ටික කාලයක් යනකොට මට A සාමාර්ථකට යන්න පුළුවන් වුණා. ඒ මිස්ගේ කැපවීම සහ අපිව උනන්දු කරපු හින්දා. විචාරයක් වගේම රස වින්දනයක් ලියනකොටත් මුල ඉඳන්ම අපිට තේරෙන විදියට හරිම සරල විදිහට කියලා දුන්නා . මම හිතන්නෑ වෙන ඔන්ලයින් පන්තියක වගේම physical පන්තියක උනත් මේ විදිහට කියලා දෙයි කියලා. පාඩම විතරක් නෙමේ එතනින් එහාට ජීවිතේම මිස් අපිට කියලා දුන්න. කොහොමහරි o/l වලට සිංහල රසාස්වාදයට A ගන්නවමයි . මිස්ගේ ඉදිරි වැඩ කටයුතු සාර්ථකව කරගන්න කියලා මම ප්රාර්ථනා කරනවා",
    ]),
    ("සඳනි නිහාරා", "2025 O/L", "si", [
        "ටීච මාරම දුකයි ටීචව දාලා යන්න. ටීච කරපු වැඩ කන්දරාවට මන් නම් ටීච කියලා දුන්න subject ලියන්න බයක් එන්නෙවත් නෑ .ඒ තරම් ටිච අපිට වැඩ කෙරෙවුවා.මන් ටීචගේ literature clz ආවේ grade 10 වලදී මට එත්කොට තිබ්බේ C එකක් අද මට A එකක් තියෙන්වා මාරම සතුටුයි ටීච .සිංහල ක්ල්ස් ආවේ grade 11 වලදී එතකොට මට B එකක් දැන් මට A එකක් .ඉතින් ටීච කියන්න වචන නෑ. ටීච අපිට ලස්සනට පාඩම් කියලා දීලා උපරිමයෙන් ම කරනවා.ඉදිරියටත් ටිචට ලස්සනට ටීච කියනවා ශෝයිවට වැඩ ටික කරගන්න සුබ පතනවා ආදරෙයි ටීච.සිංහල නම් කෞශල්යා මිස් තමා ඉතින් .අනිවාර්යයෙන් A ඇරන් එනෝ",
    ]),
    (None, None, "si", [
        "සිංහලවලට A එකක් තියෙනවා මිස්..මම මිස්ගෙ Final shot වලට join වුණා..මට ව්යාකරණ කිසිම දෙයක් කලින් තේරුණේ නෑ..මිස්ගෙ seminar වලට join වුණාට පස්සෙ මම ව්යාකරණ ටික ගොඩ දාගත්තා..පාන්දර 2-3 වෙනකම් මිස්ගෙ seminar වල ඉඳියා..කිසිම කම්මැලිකමක් දැනුනෙ නෑ..ආසාවෙන් හිටියා..රසාස්වාදෙ seminar එකටත් මම ඉඳියා..මට රසාස්වාදෙටත් A එකක් තියෙනවා..Thank you Miss..ඕනම කෙනෙක්ට බය නැතුව මිස්ගෙ class වලට join වෙන්න කියන්න පුලුවන්...",
    ]),
    ("චමුදි අකීෂා", "2025 O/L", "en", [
        "Ane mage miss harima aadarei missta apita me wishaya me tharam lssata igennuwata adarei teacher , harima dukai misswa daalayanna ilagata miss lagata igenaganna ena hema nangi kenektama malli kenektama sure me wishayata A ekak ganna puluwan e tharam lassnata me wishaya miss ugannanawa miss apita liyawapu tharam wichara rasawindana adarei miss ,hemdamath hadawathe innawa ape miss",
    ]),
    ("සිහෙලි නුලංගා", "2026 O/L", "en", [
        "Teacher exam eka marama lesiii. Teacher kiyapuva ehem pitinma ava . Okkoma ava. Pepar eka athata gaththama misge katahada aheno aheno vage thereno. Vakya riithi karanakota ehema . Okkoma mathak venawa .",
        "Thank you so much teacher",
        "Mn teacherge class ave 11 vasare first term ekedi . Ethakota sinhala kiyanne mata epama karapu vishaya. Second term ekedi mn lakunu 62 k thibuna . Me para A+ekak sure",
        "Lit class ekath ehemai .mulinma thibune lakunu 49i giya para exam ekata 89k tibuna dan asama subject deka . Mis hinda thama .",
    ]),
    ("දිනාදි සහන්සා", "2025 O/L", "en", [
        "KW miss,",
        "Miss ada pepar eka liwuwa. Ane miss marama lesiiiiiii. Ane thank you miss. Miss hinda thama ithin mama rasaswadayak , wicharayak liyanna igena gaththe. Miss api wenuwen kochchara dewal kalada? E karapu dewal walata thank you very much miss. A ekak thiyenawama thama ithin. Final shot kala , night saminer thibba. Marama shok e dawas nam. Miss api wenuwen mahansi unata thank you so much. Love you so much miss.",
    ]),
    (None, None, "en", [
        "Teacher karana dewal kawadawath weradi kiyanna be teacher mokada api teacher gena hodata dannawa. e wagema api wenuwe mahansi wechchi vidiha thama apita mathak wenawa.Teacherge mn class awe 10 anthima ware e enakotath mata vichararayak hriyata liyanna therenne ne.teacherge class ewilla 11 palaweni waredi mage wedima lakunu thibbe sinhala walata (85%). Sinhala mata be kiyala idala anthima mage asama vishaya sinhala una.teacher api wenuwen karapu siyallama poddakwath ahaka giye ne.MCQ walatai , wiyakrana paper ekatai, vichara paper ekatai lakunu ganna vidiha hodatama kiyala dunna.teacher dunna hema paper ekakma,hema seminar ekakkatama awa.poddakwath kammeli hithenne nethi wennam mis kiyala dunna.den inna nangila mallilatath apita wagema hodata ugannanawa kiyala api danno.. e hinda misge class ena mis kiyana weda tika hariyatama karana kenekta kawadawathma A ekak beri wenne ne.",
    ]),
    ("මන්තුලි · මහනුවර", "2023 O/L", "si", [
        "අ යන්නෙන් පටන් ගෙන ජීවිතයම දිනන්න පා පෙන්නු ගුරුමෑණියනි......",
        "මේ සටහන ඔබට උපහාරයක්ම වේවා",
        "අපි වගේම දරුවන් ඉදිරියේදි දැයට දායාද කරන්නට සුබ පැතුම් !!",
    ]),
]

YT = '<svg class="ic" aria-hidden="true"><use href="#i-yt"/></svg>'
E = lambda s: html.escape(sinfix(s), quote=False)

def author(name, yr, i, dark=False):
    if name:
        initial = sinfix(name)[0]
        av = f'<span class="t-avatar c{i % 4}" aria-hidden="true">{initial}</span>'
        nm = f'<span class="t-name">{E(name)}</span>'
        meta = f'<span class="t-meta"><span class="t-year">{yr}</span><span class="t-src">{YT}YouTube</span></span>'
    else:
        av = f'<span class="t-avatar t-avatar-yt" aria-hidden="true">{YT}</span>'
        nm = '<span class="t-name">YouTube අදහසක්</span>'
        meta = f'<span class="t-meta"><span class="t-src">{YT}YouTube</span></span>'
    return f'<figcaption class="t-author">{av}<span class="t-who">{nm}{meta}</span></figcaption>'

fname, fyr, flang, fps = FEATURE
feature = (f'        <figure class="t-feature reveal">\n'
           f'          <span class="t-mark" aria-hidden="true">“</span>\n'
           f'          <div class="t-feature-body">\n'
           f'            <blockquote lang="{flang}">' + "".join(f'<p>{E(p)}</p>' for p in fps) + '</blockquote>\n'
           f'            {author(fname, fyr, 0, True)}\n'
           f'          </div>\n'
           f'        </figure>\n')

cards = ""
for i, (name, yr, lang, ps) in enumerate(CARDS):
    cards += (f'          <figure class="t-card reveal">\n'
              f'            <blockquote class="t-body" lang="{lang}">' + "".join(f'<p>{E(p)}</p>' for p in ps) + '</blockquote>\n'
              f'            <button class="t-more" type="button" aria-expanded="false"><span>Read more</span></button>\n'
              f'            {author(name, yr, i + 1)}\n'
              f'          </figure>\n')

section = f'''<!-- ============ REVIEWS ============ -->
    <section class="section reviews" id="reviews">
      <div class="container">
        <div class="section-head split">
          <div>
            <span class="eyebrow reveal">STUDENT REVIEWS</span>
            <h2 class="h2 reveal">What Our Students Say</h2>
          </div>
          <p class="sub reveal">අපගේ සිසුන් YouTube හරහා ගුරුතුමියට ලියූ අදහස් කිහිපයක්.</p>
        </div>

{feature}
        <div class="t-grid">
{cards}        </div>
      </div>
    </section>'''

a = h.index('<!-- ============ REVIEWS ============ -->')
b = h.index('</section>', a) + len('</section>')
h = h[:a] + section + h[b:]

# ---------------- CSS: replace old image-review rules ----------------
c0 = css.index('/* =========================================================\n   REVIEWS')
css = css[:c0] + '''/* =========================================================
   REVIEWS (text testimonials)
   ========================================================= */
.reviews { background: var(--bg); }

.t-feature {
  position: relative; overflow: hidden;
  display: grid; grid-template-columns: auto 1fr; gap: clamp(8px, 3vw, 40px);
  padding: clamp(30px, 5vw, 64px) clamp(26px, 5vw, 72px);
  margin: 0 0 clamp(20px, 3vw, 28px);
  border-radius: var(--radius-lg);
  background: radial-gradient(90% 140% at 0% 0%, #1A4A69, var(--navy-deep) 70%);
  color: #fff; box-shadow: var(--shadow-lg);
}
.t-feature::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, .08) 1.2px, transparent 1.4px);
  background-size: 22px 22px;
  -webkit-mask-image: radial-gradient(60% 90% at 100% 100%, #000, transparent);
          mask-image: radial-gradient(60% 90% at 100% 100%, #000, transparent);
}
.t-mark {
  font-family: Georgia, 'Times New Roman', serif; font-weight: 700;
  font-size: clamp(96px, 13vw, 180px); line-height: .78; color: var(--yellow);
  margin-top: -.04em;
}
.t-feature-body { position: relative; z-index: 1; }
.t-feature blockquote p { font-size: clamp(18px, 2.1vw, 25px); line-height: 1.75; font-weight: 500; color: #fff; max-width: 60ch; }
.t-feature blockquote p + p { margin-top: .7em; font-size: clamp(15px, 1.4vw, 17px); font-weight: 700; color: var(--yellow); }
.t-feature .t-author { border-top-color: rgba(255, 255, 255, .14); margin-top: clamp(22px, 3vw, 32px); }
.t-feature .t-name { color: #fff; font-size: 16px; }
.t-feature .t-meta { color: rgba(255, 255, 255, .65); }
.t-feature .t-year { background: var(--yellow); color: var(--ink); }

.t-grid { columns: 3; column-gap: 20px; }
.t-card {
  position: relative; break-inside: avoid;
  margin: 0 0 20px; padding: 28px 26px 22px;
  background: #fff; border: 1px solid var(--line); border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform .5s var(--ease), box-shadow .5s var(--ease), border-color .5s;
}
.t-card::before {
  content: '“'; position: absolute; right: 22px; top: 10px;
  font-family: Georgia, 'Times New Roman', serif; font-weight: 700;
  font-size: 76px; line-height: 1; color: var(--yellow); opacity: .45;
  pointer-events: none;
}
.t-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: #dde5ea; }
.t-body {
  position: relative; overflow: hidden;
  max-height: calc(1.85em * 8);
  font-size: 15px; line-height: 1.85; color: #2A3A46;
  padding-right: 18px;
}
.t-body p + p { margin-top: .75em; }
.t-card.is-clamped .t-body::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 3.6em;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff);
}
.t-card.is-open .t-body { max-height: none; }
.t-more {
  display: none; margin-top: 8px; padding: 0;
  font-size: 13px; font-weight: 800; color: var(--navy);
  align-items: center; gap: 6px;
}
.t-more::after { content: ''; width: 7px; height: 7px; border: solid currentColor; border-width: 0 2px 2px 0; transform: rotate(45deg) translateY(-2px); transition: transform .3s; }
.t-card.is-open .t-more::after { transform: rotate(-135deg) translate(-2px, 0); }
.t-card.is-clamped .t-more, .t-card.is-open .t-more { display: inline-flex; }
.t-more:hover { color: var(--ink); }
.t-more:focus-visible { outline: 2px solid var(--yellow); outline-offset: 3px; border-radius: 4px; }

.t-author { display: flex; align-items: center; gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1px dashed var(--line); }
.t-avatar {
  flex: none; width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 19px; font-weight: 800; color: var(--ink);
}
.t-avatar.c0 { background: var(--yellow); }
.t-avatar.c1 { background: #FFE9A8; }
.t-avatar.c2 { background: #D7E9F5; color: var(--navy-2); }
.t-avatar.c3 { background: #FDE2C8; }
.t-avatar-yt { background: #FFE5E5; }
.t-avatar-yt .ic { width: 20px; height: 20px; color: #FF0000; }
.t-who { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.t-name { font-size: 15px; font-weight: 700; color: var(--ink); line-height: 1.3; }
.t-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; font-size: 12.5px; color: var(--muted); }
.t-year { font-size: 11.5px; font-weight: 800; color: var(--navy-2); background: var(--yellow-soft); padding: 2px 9px; border-radius: 999px; }
.t-src { display: inline-flex; align-items: center; gap: 5px; }
.t-src .ic { width: 15px; height: 15px; color: #FF0000; }

@media (max-width: 1080px) {
  .t-grid { columns: 2; }
}
@media (max-width: 860px) {
  .stats.stats-5 { grid-template-columns: repeat(2, 1fr); }
  .stats-5 .stat:nth-child(5) { grid-column: 1 / -1; border-left: 0; }
  .stats-5 .stat-num { font-size: clamp(44px, 11vw, 64px); }
}
@media (max-width: 640px) {
  .year-tab { height: 40px; padding: 0 16px; font-size: 14px; }
  .year-pill { font-size: 12px; padding: 7px 12px; }
  .t-feature { grid-template-columns: 1fr; gap: 0; }
  .t-mark { font-size: 96px; height: .55em; }
  .t-grid {
    columns: auto; display: flex; gap: 12px; align-items: flex-start;
    overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
    margin: 0 calc(-1 * clamp(20px, 4vw, 40px)); padding: 4px clamp(20px, 4vw, 40px) 18px;
  }
  .t-grid::-webkit-scrollbar { display: none; }
  .t-card { flex: 0 0 86%; margin: 0; scroll-snap-align: center; }
  .t-card:hover { transform: none; }
}
'''

# ---------------- JS: read more ----------------
anchor = "  /* ---------- lightbox ---------- */"
assert js.count(anchor) == 1 and "t-card" not in js
js = js.replace(anchor, '''  /* ---------- testimonials · read more ---------- */
  const tCards = $$('.t-card');
  const measureT = () => tCards.forEach(c => {
    if (c.classList.contains('is-open')) return;
    const b = $('.t-body', c);
    c.classList.toggle('is-clamped', b.scrollHeight > b.clientHeight + 4);
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

''' + anchor)

open(IDX, "w", encoding="utf-8", newline="").write(h)
open(CSS, "w", encoding="utf-8", newline="").write(css)
open(JS, "w", encoding="utf-8", newline="").write(js)

# old screenshot assets no longer used
td = os.path.join(ROOT, "assets", "optimized", "testimonials")
assert "assets/optimized/testimonials" not in h
shutil.rmtree(td)
print("ok; removed", td, "| cards", len(CARDS) + 1)
for w in ["මනුෂ්\u200dයයන්", "කෞශල්\u200dයා", "ව්\u200dයාකරණ", "ප්\u200dරාර්\u200dථනා", "සාමාර්\u200dථයක්", "අනිවාර්\u200dයයෙන්"]:
    print(w.encode("unicode_escape").decode(), w in h)
