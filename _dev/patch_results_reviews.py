import os, re, shutil, time
from PIL import Image

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

SIN = ("Sinhala Language &amp; Literature", "සිංහල භාෂාව හා සාහිත්‍යය")
APP = ("Sinhala Literature Appreciation", "සිංහල සාහිත්‍ය රසාස්වාදය")


def stat(g, n, subj, extra=None):
    cls = ' class="b"' if g == "B" else ""
    si = subj[1] + (" · " + extra if extra else "")
    return (f'            <div class="stat">\n'
            f'              <div class="stat-num"><em{cls}>{g}</em><span class="count" data-to="{n}">{n}</span></div>\n'
            f'              <div class="stat-label">{subj[0]}<span>{si}</span></div>\n'
            f'            </div>\n')


def sheet(year, src, thumb, tag, cap, alt, visible=True, more=0):
    group = f"results-{year}"
    if visible:
        m = f'\n              <span class="sheet-more">+{more} more</span>' if more else ""
        return (f'            <button class="sheet reveal" type="button" data-lightbox="{group}" data-src="{src}" data-caption="{cap}">\n'
                f'              <img src="{thumb}" alt="{alt}" loading="lazy">\n'
                f'              <span class="sheet-tag">{tag}</span>{m}\n'
                f'            </button>\n')
    return (f'            <button class="sheet sheet-extra" type="button" tabindex="-1" aria-hidden="true" data-lightbox="{group}" data-src="{src}" data-caption="{cap}">'
            f'<img src="{thumb}" alt="{alt}" loading="lazy"></button>\n')


def nsheet(year, name, tag, cap, alt, visible=True, more=0):
    base = f"assets/optimized/results/{year}/{name}"
    assert os.path.exists(os.path.join(ROOT, base.replace("/", os.sep) + ".webp")), base
    return sheet(year, base + ".webp", base + "_thumb.webp", tag, f"{year} O/L · {cap}", f"{year} සාමාන්‍ය පෙළ ප්‍රතිඵල ලේඛනය, {alt}", visible, more)


S, A = SIN[1], APP[1]
years = {}

# ---------------- 2025 ----------------
years["2025"] = dict(
    stats=[stat("A", 77, SIN), stat("B", 43, SIN), stat("A", 129, APP), stat("B", 2, APP)],
    note=None,
    pills=[f"{S}: A 77 · B 43 · C 11 · <b>100% සමත්</b>",
           f"{A}: A 129 · B 2 · C 0 · S 0 · W 0 · <b>100% සමත්</b>"],
    sheets=[
        nsheet("2025", "sinhala_summary", "Sinhala · A 77 · B 43", f"{S} · A 77, B 43, C 11 · 100% සමත්", f"{S} A 77, B 43, C 11"),
        nsheet("2025", "appreciation_summary", "Appreciation · A 129 · B 2", f"{A} · A 129, B 2 · 100% සමත්", f"{A} A 129, B 2"),
        nsheet("2025", "sinhala_online_a", "Sinhala · Online · A", f"{S} · Online පන්තිය · A සාමාර්ථ", f"{S} Online පන්තිය A සාමාර්ථ"),
        nsheet("2025", "sinhala_physical_a", "Sinhala · Physical · A", f"{S} · Physical පන්තිය (Layara | Zinergy) · A සාමාර්ථ", f"{S} Physical පන්තිය A සාමාර්ථ", more=6),
        nsheet("2025", "sinhala_online_b", "", f"{S} · Online පන්තිය · B සාමාර්ථ", f"{S} Online පන්තිය B සාමාර්ථ", False),
        nsheet("2025", "sinhala_physical_b", "", f"{S} · Physical පන්තිය (Layara | Zinergy) · B සාමාර්ථ", f"{S} Physical පන්තිය B සාමාර්ථ", False),
        nsheet("2025", "appreciation_a_1", "", f"{A} · A සාමාර්ථ", f"{A} A සාමාර්ථ", False),
        nsheet("2025", "appreciation_a_2", "", f"{A} · A සාමාර්ථ", f"{A} A සාමාර්ථ", False),
        nsheet("2025", "appreciation_a_3", "", f"{A} · A සහ B සාමාර්ථ", f"{A} A සහ B සාමාර්ථ", False),
        nsheet("2025", "appreciation_a_4", "", f"{A} · A සාමාර්ථ", f"{A} A සාමාර්ථ", False),
    ])

# ---------------- 2024 ----------------
years["2024"] = dict(
    stats=[stat("A", 63, SIN), stat("B", 39, SIN), stat("A", 88, APP), stat("B", 3, APP)],
    note="අපගේ තුන්වන කණ්ඩායමේ ප්‍රතිඵල",
    pills=[f"{S}: A 63 · B 39 · C 9 · S 0 · W 0",
           f"{A}: A 88 · B 3 · C 0 · S 0 · W 0"],
    sheets=[
        nsheet("2024", "sinhala_summary", "Sinhala · A 63 · B 39", f"{S} · A 63, B 39, C 9, S 0, W 0", f"{S} A 63, B 39, C 9"),
        nsheet("2024", "appreciation_summary", "Appreciation · A 88 · B 3", f"{A} · A 88, B 3, C 0, S 0, W 0", f"{A} A 88, B 3"),
        nsheet("2024", "sinhala_online_a", "Sinhala · Online · A", f"{S} · Online පන්තිය · A සාමාර්ථ", f"{S} Online පන්තිය A සාමාර්ථ"),
        nsheet("2024", "sinhala_physical_a", "Sinhala · Physical · A", f"{S} · Physical පන්තිය (Layara | Zinergy) · A සාමාර්ථ", f"{S} Physical පන්තිය A සාමාර්ථ", more=5),
        nsheet("2024", "sinhala_online_b", "", f"{S} · Online පන්තිය · B සාමාර්ථ", f"{S} Online පන්තිය B සාමාර්ථ", False),
        nsheet("2024", "sinhala_physical_b", "", f"{S} · Physical පන්තිය (Layara | Zinergy) · B සාමාර්ථ", f"{S} Physical පන්තිය B සාමාර්ථ", False),
        nsheet("2024", "appreciation_online_a_1", "", f"{A} · Online පන්තිය · A සාමාර්ථ", f"{A} Online පන්තිය A සාමාර්ථ", False),
        nsheet("2024", "appreciation_online_a_2", "", f"{A} · Online පන්තිය · A සාමාර්ථ", f"{A} Online පන්තිය A සාමාර්ථ", False),
        nsheet("2024", "appreciation_online_ab_3", "", f"{A} · Online පන්තිය · A සහ B සාමාර්ථ", f"{A} Online පන්තිය A සහ B සාමාර්ථ", False),
    ])

# ---------------- 2023 ----------------
years["2023"] = dict(
    stats=[stat("A", 30, SIN, "Online"), stat("A", 30, SIN, "ZINERGY මතුගම"), stat("B", 15, SIN, "ZINERGY මතුගම"),
           stat("A", 52, APP, "Online"), stat("B", 4, APP, "Online")],
    stats_cls="stats stats-5",
    note=None, pills=[],
    sheets=[
        nsheet("2023", "sinhala_online_p1", "Sinhala · Online · A 30", f"{S} · Online · A 30 · පිටුව 1", f"{S} Online A 30"),
        nsheet("2023", "sinhala_zinergy_p1", "Sinhala · Zinergy · A 30", f"{S} · ZINERGY මතුගම · A 30, B 15 · පිටුව 1", f"{S} ZINERGY මතුගම A 30"),
        nsheet("2023", "appreciation_online_p1", "Appreciation · A 52 · B 4", f"{A} · Online · A 52, B 4 · පිටුව 1", f"{A} Online A 52, B 4"),
        nsheet("2023", "sinhala_zinergy_p3", "Sinhala · Zinergy · B 15", f"{S} · ZINERGY මතුගම · A 30, B 15 · පිටුව 3", f"{S} ZINERGY මතුගම B 15", more=5),
        nsheet("2023", "sinhala_online_p2", "", f"{S} · Online · A 30 · පිටුව 2", f"{S} Online A 30", False),
        nsheet("2023", "sinhala_zinergy_p2", "", f"{S} · ZINERGY මතුගම · A 30, B 15 · පිටුව 2", f"{S} ZINERGY මතුගම A 30", False),
        nsheet("2023", "appreciation_online_p2", "", f"{A} · Online · A 52, B 4 · පිටුව 2", f"{A} Online A 52, B 4", False),
        nsheet("2023", "appreciation_online_p3", "", f"{A} · Online · A 52, B 4 · පිටුව 3", f"{A} Online A 52, B 4", False),
        nsheet("2023", "appreciation_online_p4", "", f"{A} · Online · A 52, B 4 · පිටුව 4", f"{A} Online A 52, B 4", False),
    ])

# ---------------- 2022 (existing markup, reused) ----------------
s0 = h.index('<section class="section results" id="results">')
s1 = h.index('</section>', s0) + len('</section>')
old = h[s0:s1]
st = re.search(r'<div class="stats reveal">\n(.*?)\n        </div>\n\n        <div class="sheets">', old, re.S)
sh = re.search(r'<div class="sheets">\n(.*?)\n        </div>\n        <p class="sheets-hint', old, re.S)
assert st and sh
stats22 = "\n".join("  " + l if l.strip() else l for l in st.group(1).split("\n")) + "\n"
sheets22 = "\n".join("  " + l if l.strip() else l for l in sh.group(1).split("\n")).replace('data-lightbox="results"', 'data-lightbox="results-2022"') + "\n"
assert sheets22.count('results-2022') == 4

order = ["2025", "2024", "2023", "2022"]
tabs = "".join(
    f'          <button class="year-tab{" is-active" if y == order[0] else ""}" type="button" role="tab" id="yt-{y}" aria-controls="yp-{y}" aria-selected="{"true" if y == order[0] else "false"}"{"" if y == order[0] else " tabindex=\"-1\""}>{y}</button>\n'
    for y in order)

panels = ""
for y in order:
    hidden = "" if y == order[0] else " is-hidden"
    panels += f'\n        <div class="year-panel{hidden}" id="yp-{y}" role="tabpanel" aria-labelledby="yt-{y}">\n'
    if y == "2022":
        panels += '          <div class="stats reveal">\n' + stats22 + '          </div>\n'
        panels += '          <div class="sheets">\n' + sheets22 + '          </div>\n'
    else:
        d = years[y]
        if d["note"] or d["pills"]:
            panels += '          <div class="year-meta">\n'
            if d["note"]:
                panels += f'            <p class="year-note">{d["note"]}</p>\n'
            for p in d["pills"]:
                panels += f'            <span class="year-pill">{p}</span>\n'
            panels += '          </div>\n'
        panels += f'          <div class="{d.get("stats_cls", "stats")} reveal">\n' + "".join("  " + l for l in "".join(d["stats"]).splitlines(True)) + '          </div>\n'
        panels += '          <div class="sheets">\n' + "".join(d["sheets"]) + '          </div>\n'
    panels += '        </div>\n'

new = f'''<section class="section results" id="results">
      <div class="results-bg" aria-hidden="true"></div>
      <div class="container">
        <div class="section-head center">
          <span class="eyebrow on-dark reveal">G.C.E. O/L RESULTS</span>
          <h2 class="h2 on-dark reveal">Proven Results That Speak for Themselves</h2>
          <p class="sub on-dark reveal">2022 සිට 2025 දක්වා අ.පො.ස. සාමාන්‍ය පෙළ විභාගයේදී අපගේ සිසුන් ලබාගත් ප්‍රතිඵල.</p>
        </div>

        <div class="year-tabs reveal" role="tablist" aria-label="Results by year">
{tabs}        </div>
{panels}
        <p class="sheets-hint on-dark">Tap a result sheet to view it full size</p>
      </div>
    </section>'''
h = h[:s0] + new + h[s1:]

# ---------------- REVIEWS section ----------------
reviews = [
    ("akash_2025", "ආකාෂ් තිනුල", "2025 O/L"),
    ("adeesha_2025", "අදීෂා අමන්දි", "2025 O/L"),
    ("minthuli_2025", "මින්තුලි දුල්හාරා", "2025 O/L"),
    ("sandani_2025", "සඳනි නිහාරා", "2025 O/L"),
    ("chamudi_2025", "චමුදි අකීෂා", "2025 O/L"),
    ("youtube_2", None, None),
    ("siheli_2026", "සිහෙලි නුලංගා", "2026 O/L"),
    ("dinadi_2025", "දිනාදි සහන්සා", "2025 O/L"),
    ("youtube_3", None, None),
    ("youtube_1", None, None),
    ("youtube_4", None, None),
]
yt_icon = '<svg class="ic" aria-hidden="true"><use href="#i-youtube"/></svg>' if 'id="i-youtube"' in h else ""
cards = ""
for f, name, yr in reviews:
    p = os.path.join(ROOT, "assets", "optimized", "testimonials", f + ".webp")
    w, hh = Image.open(p).size
    src = f"assets/optimized/testimonials/{f}.webp"
    long_ = " is-long" if hh / w > 1.25 else ""
    if name:
        cap, alt = f"{name} · {yr}", f"{name} ({yr}) ලියූ අදහස"
        foot = f'<span class="review-name">{name}</span><span class="review-year">{yr}</span>'
    else:
        cap, alt = "YouTube අදහස", "YouTube හරහා ලැබුණු අදහසක්"
        foot = f'<span class="review-name review-yt">{yt_icon}YouTube</span>'
    cards += (f'          <figure class="review reveal{long_}">\n'
              f'            <button type="button" data-lightbox="reviews" data-src="{src}" data-caption="{cap}"><img src="{src}" alt="{alt}" width="{w}" height="{hh}" loading="lazy"></button>\n'
              f'            <figcaption>{foot}</figcaption>\n'
              f'          </figure>\n')

rev = f'''

    <!-- ============ REVIEWS ============ -->
    <section class="section reviews" id="reviews">
      <div class="container">
        <div class="section-head split">
          <div>
            <span class="eyebrow reveal">STUDENT REVIEWS</span>
            <h2 class="h2 reveal">What Our Students Say</h2>
          </div>
          <p class="sub reveal">YouTube හරහා අපට ලැබුණු අදහස් කිහිපයක්. සම්පූර්ණයෙන් කියවීමට අදහසක් මත තට්ටු කරන්න.</p>
        </div>

        <div class="reviews-grid">
{cards}        </div>
      </div>
    </section>'''
i = h.index('</section>', h.index('id="results"')) + len('</section>')
h = h[:i] + rev + h[i:]

# nav links
for a, b in [('\n        <a href="#results">Results</a>\n', '\n        <a href="#results">Results</a>\n        <a href="#reviews">Reviews</a>\n'),
             ('\n      <a href="#results">Results</a>\n', '\n      <a href="#results">Results</a>\n      <a href="#reviews">Reviews</a>\n')]:
    assert h.count(a) >= 1, a
    print("nav replace", h.count(a))
    h = h.replace(a, b)

# ---------------- CSS ----------------
css += '''

/* =========================================================
   RESULTS · year tabs
   ========================================================= */
.year-tabs {
  display: flex; gap: 4px; width: max-content; max-width: 100%;
  margin: 0 auto clamp(28px, 4vw, 40px); padding: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .12);
}
.year-tab {
  height: 44px; padding: 0 26px; border-radius: 999px;
  font-size: 15px; font-weight: 800; letter-spacing: .01em; font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, .72);
  transition: background .35s var(--ease), color .35s var(--ease);
}
.year-tab:hover { color: #fff; }
.year-tab.is-active { background: var(--yellow); color: var(--ink); }
.year-tab:focus-visible { outline: 2px solid var(--yellow); outline-offset: 3px; }
.year-panel { animation: yearIn .6s var(--ease); }
.year-panel.is-hidden { display: none; }
@keyframes yearIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

.year-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 0 auto 28px; max-width: 900px; }
.year-note { flex-basis: 100%; text-align: center; font-size: 14px; font-weight: 600; color: var(--yellow); margin: 0 0 2px; }
.year-pill {
  font-size: 13px; line-height: 1.4; padding: 8px 16px; border-radius: 999px;
  background: rgba(255, 255, 255, .07); border: 1px solid rgba(255, 255, 255, .12);
  color: rgba(255, 255, 255, .85);
}
.year-pill b { color: var(--yellow); font-weight: 800; }

.stats.stats-5 { grid-template-columns: repeat(5, 1fr); }
.stats-5 .stat-num { font-size: clamp(40px, 5vw, 68px); }

.sheet-extra { display: none !important; }
.sheet-more {
  position: absolute; right: 18px; top: 18px;
  font-size: 12px; font-weight: 800; color: #fff;
  background: rgba(14, 28, 39, .82); padding: 5px 12px; border-radius: 999px;
  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
}

/* =========================================================
   REVIEWS
   ========================================================= */
.reviews { background: var(--bg); }
.reviews-grid { columns: 3; column-gap: 18px; }
.review {
  break-inside: avoid; margin: 0 0 18px;
  border-radius: 20px; overflow: hidden;
  background: #0F0F0F;
  box-shadow: var(--shadow);
  border: 1px solid var(--line);
  transition: transform .5s var(--ease), box-shadow .5s var(--ease);
}
.review:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.review button { display: block; width: 100%; position: relative; }
.review img { display: block; width: 100%; height: auto; }
.review.is-long img { max-height: 560px; object-fit: cover; object-position: top; }
.review.is-long button::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 90px;
  background: linear-gradient(to bottom, rgba(15, 15, 15, 0), #0F0F0F);
  pointer-events: none;
}
.review button:focus-visible { outline: 3px solid var(--yellow); outline-offset: -3px; }
.review figcaption {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 12px 16px; background: #fff;
}
.review-name { font-size: 14px; font-weight: 700; color: var(--ink); display: inline-flex; align-items: center; gap: 8px; }
.review-yt { color: var(--muted); font-weight: 600; }
.review-yt .ic { width: 18px; height: 18px; color: #FF0000; }
.review-year {
  font-size: 12px; font-weight: 800; color: var(--navy-2);
  background: var(--yellow-soft); padding: 4px 10px; border-radius: 999px; white-space: nowrap;
}

@media (max-width: 1080px) {
  .reviews-grid { columns: 2; }
}
@media (max-width: 860px) {
  .stats.stats-5 { grid-template-columns: repeat(2, 1fr); }
  .stats-5 .stat:nth-child(5) { grid-column: 1 / -1; border-left: 0; }
  .stats-5 .stat-num { font-size: clamp(44px, 11vw, 64px); }
}
@media (max-width: 640px) {
  .year-tab { height: 40px; padding: 0 16px; font-size: 14px; }
  .year-pill { font-size: 12px; padding: 7px 12px; }
  .reviews-grid {
    columns: auto; display: flex; gap: 12px; align-items: flex-start;
    overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
    margin: 0 calc(-1 * clamp(20px, 4vw, 40px)); padding: 4px clamp(20px, 4vw, 40px) 18px;
  }
  .reviews-grid::-webkit-scrollbar { display: none; }
  .review { flex: 0 0 84%; margin: 0; scroll-snap-align: center; }
  .review img { max-height: 440px; object-fit: cover; object-position: top; }
  .review:hover { transform: none; }
}
'''

# ---------------- JS ----------------
anchor = "  /* ---------- lightbox ---------- */"
assert js.count(anchor) == 1
js = js.replace(anchor, '''  /* ---------- results year tabs ---------- */
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

''' + anchor)

open(IDX, "w", encoding="utf-8", newline="").write(h)
open(CSS, "w", encoding="utf-8", newline="").write(css)
open(JS, "w", encoding="utf-8", newline="").write(js)
print("ok; youtube icon:", bool(yt_icon), "| index", len(h), "css", len(css), "js", len(js))
