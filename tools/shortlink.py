#!/usr/bin/env python3
"""Short, say-it-on-the-phone links for lead mock-ups.

thetenderdesk.co.uk/<word>  ->  thetenderdesk.co.uk/p/<slug>/

usage:
  tools/shortlink.py <slug> [word]   make one (word defaults to first word of slug)
  tools/shortlink.py --list          show all short links
Words are lowercase letters only (easy to spell out loud). Never overwrites a
real site folder. Registry: tools/shortlinks.json
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = os.path.join(ROOT, 'tools', 'shortlinks.json')
RESERVED = {'p', 's', 'about', 'ai', 'assets', 'care', 'examples', 'fonts', 'img', 'motion',
            'partners', 'preview', 'pricing', 'rebuild', 'seo', 'studio', 'tenders', 'tools',
            'websites', 'work', 'v2', 'google', 'contact', 'blog', 'admin'}

PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your new homepage</title>
<meta http-equiv="refresh" content="0;url=/p/{slug}/">
<link rel="canonical" href="https://thetenderdesk.co.uk/p/{slug}/">
<script>location.replace('/p/{slug}/'+location.search)</script>
</head><body style="font-family:system-ui;background:#0b0b0c;color:#eee;display:grid;place-items:center;height:100vh;margin:0">
<a href="/p/{slug}/" style="color:#eee">Open your new homepage</a></body></html>
"""


def load():
    return json.load(open(REG)) if os.path.exists(REG) else {}


def make(slug, word=None):
    if not os.path.isdir(os.path.join(ROOT, 'p', slug)):
        sys.exit(f'no mock-up at p/{slug}/')
    reg = load()
    for w, s in reg.items():
        if s == slug:
            return w
    base = re.sub(r'[^a-z]', '', (word or slug.split('-')[0]).lower()) or 'site'
    w, n = base, 2
    while w in RESERVED or w in reg or os.path.exists(os.path.join(ROOT, w)):
        w = f'{base}{n}'; n += 1
    os.makedirs(os.path.join(ROOT, w))
    open(os.path.join(ROOT, w, 'index.html'), 'w').write(PAGE.format(slug=slug))
    reg[w] = slug
    json.dump(dict(sorted(reg.items())), open(REG, 'w'), indent=1)
    return w


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == '--list':
        for w, s in load().items():
            print(f'thetenderdesk.co.uk/{w}  ->  /p/{s}/')
    else:
        print('thetenderdesk.co.uk/' + make(a[0], a[1] if len(a) > 1 else None))
