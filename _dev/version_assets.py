"""Cache-busting: stamp css/js links in index.html with a short hash of each file's contents.

The live site sits behind Cloudflare, which caches css/js for up to 30 days. A new ?v= value
whenever a file changes makes browsers and the CDN fetch the new file right away.
Run before committing a release:  python _dev/version_assets.py
"""
import hashlib, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
html_path = root / 'index.html'
html = html_path.read_text(encoding='utf-8')
for rel in ('css/styles.css', 'js/main.js'):
    digest = hashlib.md5((root / rel).read_bytes()).hexdigest()[:10]
    html, n = re.subn(rf'(["\']){re.escape(rel)}(\?v=[0-9a-f]+)?(["\'])', rf'\g<1>{rel}?v={digest}\g<3>', html)
    print(f'{rel}: v={digest} ({n} link{"s" if n != 1 else ""})')
html_path.write_text(html, encoding='utf-8', newline='\n')
