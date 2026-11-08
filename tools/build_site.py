"""Build the standalone website (GitHub Pages, /docs) from the Artifact source.

The Artifact file starts at <title> because claude.ai adds the document skeleton when it publishes.
This wraps it in a full page, marks it data-standalone="1" (so it saves to the browser's
localStorage instead of claude.ai storage), and adds the home-screen app manifest and offline cache.

    python3 tools/build_site.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / 'steady-pots.html').read_text()

head = '''<!doctype html>
<html lang="en" data-standalone="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Split your pay into pots: Savings, Shanghai trip and Misc to spend.">
<meta name="theme-color" content="#f2f5f3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0e1311" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Pots">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
'''
tail = '''
<script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>
</body>
</html>
'''
out = ROOT / 'docs' / 'index.html'
out.write_text(head + src + tail)
print(f'wrote {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)')
