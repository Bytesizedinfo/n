"""Build the standalone websites (GitHub Pages, /docs) from the Artifact sources.

Each Artifact file starts at <title> because claude.ai adds the document skeleton when it publishes.
This wraps each one in a full page marked data-standalone="1" (so it saves to the browser's
localStorage instead of claude.ai storage) and links its home-screen manifest and offline cache,
which live as static files next to each index.html.

    python3 tools/build_site.py
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APPS = [
    dict(src='steady-pots.html', out='docs', short='Pots', theme='#1f6f5c',
         desc='Split your pay into pots: Savings, Shanghai trip and Misc to spend.'),
    dict(src='spend-save.html', out='docs/spend-save', short='Spend & Save', theme='#4a50b8',
         desc='One spending amount each month; savings sorted into subcategories.'),
]

HEAD = '''<!doctype html>
<html lang="en" data-standalone="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{desc}">
<meta name="theme-color" content="#f2f5f3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0e1311" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="{short}">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0;font:14px system-ui,sans-serif}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
'''
TAIL = '''
<script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>
</body>
</html>
'''

for app in APPS:
    src = (ROOT / app['src']).read_text()
    out = ROOT / app['out'] / 'index.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(HEAD.format(desc=escape(app['desc']), short=escape(app['short'])) + src + TAIL)
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")
