#!/usr/bin/env python3
"""Bundle the phone into single HTML files.

  dist/childe-phone.html  — Artifact page (no doctype/html/head/body: the Artifact host wraps it)
  dist/standalone.html         — full HTML document you can open directly in a browser
"""
import html
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from manifest import ROOT, manifest  # noqa: E402

FONTS = ('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900'
         '&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@500;700;900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..900;1,8..60,400..900&display=swap')

TITLE = "Childe's Phone"
DESCRIPTION = "An interactive iPhone story: you found Childe's phone on a Liyue Harbor pier. Everyone thinks you're him."
BOOT = 'Loading Childe’s phone…'
OUT = 'childe-phone.html'


def read(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()


def safe_js(src):
    return re.sub(r'</(script)', r'<\\/\1', src, flags=re.I)


def safe_css(src):
    return re.sub(r'</(style)', r'<\\/\1', src, flags=re.I)


def page_css():
    return read('css/page.css') if os.path.exists(os.path.join(ROOT, 'css/page.css')) else ''


def bundle():
    css, js = manifest()
    styles = '\n'.join(f'/* {f} */\n' + read(f) for f in css)
    scripts = '\n'.join(f'/* {f} */\n' + read(f) + '\n;' for f in js)
    head = (
        f'<title>{TITLE}</title>\n'
        '<meta name="claude:viewport-fit-sides" content="cover">\n'
        f'<meta name="description" content="{html.escape(DESCRIPTION)}">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        f'<link rel="stylesheet" href="{FONTS}">\n'
        f'<style>\n{safe_css(page_css())}\n{safe_css(styles)}\n</style>\n'
    )
    body = (
        f'<div id="stage"><div class="boot-msg">{BOOT}</div></div>\n'
        f'<script>\n{safe_js(scripts)}\nJC.boot();\n</script>\n'
    )
    return head, body


def main():
    head, body = bundle()
    os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    art = os.path.join(ROOT, 'dist', OUT)
    with open(art, 'w', encoding='utf-8') as f:
        f.write(head + body)
    std = os.path.join(ROOT, 'dist', 'standalone.html')
    with open(std, 'w', encoding='utf-8') as f:
        f.write('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                + head + '</head>\n<body>\n' + body + '</body>\n</html>\n')
    kb = os.path.getsize(art) / 1024
    print(f'built dist/{OUT} ({kb:.0f} KB) and dist/standalone.html')


if __name__ == '__main__':
    main()
