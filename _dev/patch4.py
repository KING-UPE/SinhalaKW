import re, shutil, os, time
R = r'D:\SinhalaKW'
bk = os.path.join(R, '_dev', 'backup_' + time.strftime('%Y%m%d_%H%M%S'))
os.makedirs(bk)
for f in ('index.html', r'css\styles.css', r'js\main.js'):
    shutil.copy2(os.path.join(R, f), os.path.join(bk, os.path.basename(f)))
print('backup', bk)

def rd(p): return open(os.path.join(R, p), encoding='utf-8', newline='').read()
def wr(p, s): open(os.path.join(R, p), 'w', encoding='utf-8', newline='').write(s)
def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, (a[:60], c); return s.replace(a, b)

h = rd('index.html')

# --- about: stamp A3 -> A129, remove facts list
h = rep(h, '<span class="stamp-big">A3</span>\n            <span class="stamp-small">A/L Arts Stream</span>',
           '<span class="stamp-big">A129</span>\n            <span class="stamp-small">2025 O/L<br>Appreciation</span>')
h, n = re.subn(r'\n          <ul class="facts reveal">.*?</ul>\n', '\n', h, flags=re.S); assert n == 1

# --- about copy back to Content wording
h = rep(h, 'එකම ගුරුවරියක ලෙස මඟපෙන්වීමට ඇය සමත්ව ඇත', 'එක් ගුරුවරියක ලෙස මඟපෙන්වීමට සමත්ව ඇත')
h = rep(h, 'ත්වය පිළිබඳව පැහැදිලි', 'ත්ව පිළිබඳව පැහැදිලි')

# --- process steps back to Content wording
h = rep(h, 'සජීවී විභාග පැවැත්වීම, පිළිතුරු ', 'සජීවී විභාග පැවැත්වීම. ')
h = rep(h, 'අවධානය යොමු කරයි.', 'අවධානය යොමු කිරීම.')

# --- KW advantage card 03
h, n = re.subn(r'(නරඹන සිසුන්ගේ ද විචාර ඇතුළු වැඩ පරී[^<\s]{1,6}) කෙරේ\.', r'\1 කිරීම.', h); assert n == 1, n
h = rep(h, 'Every Answer Checked by the Teacher', 'Student Work Checked by the Teacher')

# --- results: year tabs + panels in ascending order (2022 -> 2025), 2025 stays selected
m = re.search(r'(<div class="year-tabs reveal"[^>]*>\n)(.*?)(\n        </div>)', h, re.S)
tabs = m.group(2).split('\n'); assert len(tabs) == 4
h = h[:m.start(2)] + '\n'.join(reversed(tabs)) + h[m.end(2):]
starts = [h.index(f'<div class="year-panel{c}" id="yp-{y}"') for y, c in (('2025', ''), ('2024', ' is-hidden'), ('2023', ' is-hidden'), ('2022', ' is-hidden'))]
end = h.index('\n        <p class="sheets-hint')
indent = '        '
blocks = []
for i, s in enumerate(starts):
    e = starts[i + 1] if i + 1 < 4 else end
    blocks.append(h[s:e].rstrip() + '\n\n' + indent)
first = starts[0]
h = h[:first] + ''.join(reversed(blocks)).rstrip() + '\n' + h[end:]
wr('index.html', h)

c = rd(r'css\styles.css')
c = rep(c, '  object-fit: cover; object-position: 50% 15%;\n  border-radius: var(--radius-lg);',
           '  object-fit: cover; object-position: 50% 15%;\n  transform: scaleX(-1); /* teacher faces the copy */\n  border-radius: var(--radius-lg);')
c += '\n/* about: facts row removed */\n.about-copy .yt-link { margin-top: 30px; }\n.stamp-big { letter-spacing: -.02em; }\n'
wr(r'css\styles.css', c)
print('ok')
