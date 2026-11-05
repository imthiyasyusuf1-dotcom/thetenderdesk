#!/usr/bin/env python3
"""Fire Door Hardware static site generator. Run: python3 build.py  (generates every page, data, assets)."""
import json, re, math, shutil, os, html
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'dorquip')
os.chdir(HERE)
ORDER_EMAIL = 'sales@dorquip.com'  # PLACEHOLDER: must be confirmed with Dorquip before launch (used by mailto in assets/app.js via window.IF.email)

# ---------- catalogue ----------
CATS = [
 ('seals', 'Fire and smoke seals', 'Intumescent strips and fire and smoke seals, 10, 15 and 20mm, in white, black and brown.'),
 ('hinges', 'Hinges', 'Ball bearing, rising and parliament hinges, plus intumescent hinge pads.'),
 ('closers', 'Door closers', 'Overhead and concealed closers for fire doors.'),
 ('exit', 'Fire exit hardware', 'Panic bolts, push pads, latches and outside access devices.'),
 ('locks', 'Locks, latches and bolts', 'Fire door latches, sash locks, cylinders, flush bolts and the intumescent to suit.'),
 ('handles', 'Handles', 'Lever handles on rose.'),
 ('signs', 'Signs', 'Fire door keep shut, keep locked, keep clear and fire exit signs.'),
 ('drop', 'Drop down seals and finger guards', 'Automatic acoustic drop down seals and finger protectors.'),
 ('blocks', 'Fire blocks and covers', 'Intumescent fire blocks and covers.'),
]
def clean(s):
    s = s.replace('Swing Free', 'Swing Clear')
    return s.replace('\u2013', '-').replace('\u2014', '-').replace('\u2019', "'").replace('\u2018', "'")
def categorise(x):
    n = x['n'].lower(); c = x['c']
    if c == 'Intumescent and Automatic Seals':
        if 'fire block' in n or 'covers' in n: return 'blocks'
        if 'hinge' in n: return 'hinges'
        if 'flush bolt' in n or 'lock jacket' in n: return 'locks'
        if 'finger protector' in n or 'drop down' in n: return 'drop'
        return 'seals'
    if c in ('From The Anvil', 'Washroom Fittings', 'Shelving Systems', 'Hygiene+'): return None
    if 'hinge' in n: return 'hinges'
    if 'closer' in n and 'floor' not in n: return 'closers'
    if re.search(r'panic|push pad|outside access', n): return 'exit'
    if 'flush bolt' in n: return 'locks'
    if re.search(r'fire door keep|fire exit', n) and 'sign' in n: return 'signs'
    if 'lever on rose' in n: return 'handles'
    if re.search(r'(din (latch|euro sash|euro dead) lock case|din latch case|tubular latch|euro sash lock case|euro dead lock case|euro profile (double cylinder|cylinder and turn|escutcheon))', n) and 'umk' not in n: return 'locks'
    if 'finger protector' in n or 'drop down' in n: return 'drop'
    return None
src = json.load(open(os.path.join(SRC, 'data', 'cat.json')))
items = []
for x in src:
    k = categorise(x)
    if not k: continue
    if re.search(r'antimicrobial|bathroom', x['n'].lower()): continue
    items.append({'id': x['id'].replace('swing-free','swing-clear'), 'n': clean(x['n']), 'sku': x['sku'], 'p': round(x['p']/1.2,2), 'c': k,
                  'i': x['i'], 'd': [clean(l) for l in x['d'] if not re.search(r'next.?day|\bfree\b|trustpilot|delivery|in stock', l, re.I)]})
for k in ('index',): pass
items.sort(key=lambda p: ([c[0] for c in CATS].index(p['c']), p['n']))
os.makedirs('data', exist_ok=True)
json.dump({'cats': [{'id': a, 'n': b, 'd': c} for a, b, c in CATS], 'items': items}, open('data/cat.json', 'w'), separators=(',', ':'))
os.makedirs('img/p', exist_ok=True)
for p in items:
    for key in p['i']:
        for suf in ('', '-s'):
            f = f'{key}{suf}.webp'
            s = os.path.join(SRC, 'img', 'p', f)
            if os.path.exists(s): shutil.copy(s, f'img/p/{f}')
bysku = {p['sku']: p for p in items}

# ---------- kit builder (rules live here, JS only renders kit.json) ----------
def kit(rating, doors, use):
    d = 2 if doors == 'double' else 1
    hinges = (4 if rating == 'FD60' else 3) * d
    pairs = math.ceil(hinges / 2)
    lines = [
     ('A1001.700', pairs, f'{hinges} hinges needed per {"pair of doors" if d==2 else "door"}, hinges are sold in pairs'),
     ('H3000.000', math.ceil(hinges / 6), 'Intumescent hinge pads, pack of 6'),
     ('D1011.900', d, 'Overhead door closer, one per leaf'),
     ('H1005.480', 3 + (2 if d == 2 else 0), 'Fire and smoke seal 2100mm: 2 jambs, 1 head' + (', 2 meeting edges' if d == 2 else '')),
     ('C1000.700', d, 'Lever handles on rose, one set per leaf'),
    ]
    if use == 'lock':
        lines += [
         ('B1005.700', 1, 'DIN euro sash lock, 55mm backset' + (', on the active leaf' if d == 2 else '')),
         ('B2004.950', 1, 'Euro cylinder, key outside and thumb turn inside'),
         ('C4000.700', 2, 'Euro escutcheons, one each side'),
         ('H2002.000', 1, 'Intumescent lock jacket to suit the DIN sash lock'),
        ]
    else:
        lines += [
         ('B1011.700', 1, 'DIN latch, 55mm backset' + (', on the active leaf' if d == 2 else '')),
         ('H2002.000', 1, 'Intumescent lock jacket to suit the DIN latch'),
        ]
    if d == 2:
        lines += [
         ('E2000.700', 2, 'Flush bolts for the inactive leaf, top and bottom'),
         ('H2004.000', 2, 'Intumescent to suit the flush bolts'),
        ]
    lines.append(('E4000.700', d, 'Fire door keep shut sign, one per leaf'))
    out = []
    for sku, q, note in lines:
        p = bysku[sku]
        out.append({'sku': sku, 'id': p['id'], 'q': q, 'note': note})
    return out
kits = {f'{r}-{d}-{u}': kit(r, d, u) for r in ('FD30', 'FD60') for d in ('single', 'double') for u in ('latch', 'lock')}
json.dump(kits, open('data/kit.json', 'w'), separators=(',', ':'))

# ---------- layout ----------
BASE_CSS_FONT = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;800&display=swap'
NAV = [('shop/', 'Shop'), ('#kit', 'Kit a door'), ('trade/', 'Trade accounts'), ('delivery/', 'Delivery'), ('about/', 'About')]
def nav_href(h, root): return (root + 'index.html' + h) if h.startswith('#') else root + h
def page(path, title, desc, body, bodyclass=''):
    depth = path.count('/')
    root = '../' * depth
    nav = ''.join(f'<a href="{nav_href(h, root)}">{t}</a>' for h, t in NAV)
    return f'''<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{BASE_CSS_FONT}">
<link rel="stylesheet" href="{root}assets/style.css">
</head><body class="{bodyclass}" data-root="{root}">
<header class="hdr"><div class="wrap hdr-in">
<a class="logo" href="{root}index.html" aria-label="Fire Door Hardware home"><span class="mark"></span><span class="word">FIRE DOOR <span>HARDWARE</span></span></a>
<nav class="dnav" aria-label="Main">{nav}</nav>
<div class="hdr-r">
<div class="vat" role="group" aria-label="Show prices"><button type="button" data-vat="ex">Ex VAT</button><button type="button" data-vat="inc">Inc VAT</button></div>
<button class="bag" type="button" aria-label="Open basket" data-open-basket><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg><b>0</b></button>
<button class="burger" type="button" aria-label="Menu" aria-expanded="false" data-burger><i></i><i></i><i></i></button>
</div></div></header>
<div class="mmenu" id="mmenu" hidden><nav aria-label="Mobile">{nav}<div class="vat vat-m" role="group" aria-label="Show prices"><button type="button" data-vat="ex">Ex VAT</button><button type="button" data-vat="inc">Inc VAT</button></div></nav></div>
<main>
{body}
</main>
<footer class="ftr"><div class="wrap">
<div class="fcols">
<div><a class="logo" href="{root}index.html"><span class="mark"></span><span class="word">FIRE DOOR <span>HARDWARE</span></span></a><p>Fire door hardware, packed and sent by us.</p></div>
<div><h4>Shop</h4><a href="{root}shop/">All products</a><a href="{root}index.html#kit">Kit a fire door</a><a href="{root}trade/">Trade accounts</a></div>
<div><h4>Help</h4><a href="{root}delivery/">Delivery and returns</a><a href="{root}about/">About</a><a href="{root}checkout/">Checkout</a></div>
<div><h4>Contact</h4><a href="mailto:{ORDER_EMAIL}">{ORDER_EMAIL}</a><p class="sm">Ask us for the test certificate for any product.</p></div>
</div>
<div class="fbot"><span>Fire Door Hardware is a trading name of Dorquip Group Limited</span><span class="sm">Prices shown ex VAT unless you switch to inc VAT.</span><span class="sm">Site by <a href="https://thetenderdesk.co.uk" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">The Tender Desk</a></span></div>
</div></footer>
<div class="drawer-bg" data-close-basket hidden></div>
<aside class="drawer" id="drawer" aria-label="Basket" hidden><div class="dr-h"><h2>Basket</h2><button type="button" class="x" aria-label="Close basket" data-close-basket>&times;</button></div><div class="dr-b" id="dr-b"></div><div class="dr-f" id="dr-f"></div></aside>
<div class="toast" role="status" id="toast"></div>
<script>window.IF={{email:"{ORDER_EMAIL}"}};</script>
<script src="{root}assets/app.js"></script>
</body></html>
'''
def write(path, content):
    d = os.path.dirname(path)
    if d: os.makedirs(d, exist_ok=True)
    open(path, 'w').write(content)

# ---------- pages ----------
def _thumb(cat):
    for it in items:
        if it['c']==cat and it.get('i'): return it['i'][0]
    return ''
tiles = ''.join(f'<a class="tile" href="shop/?c={a}"><i><img src="img/p/{_thumb(a)}-s.webp" alt="" loading="lazy" width="160" height="160"></i><b>{html.escape(b)}</b><span>{html.escape(c)}</span><em data-count="{a}"></em></a>' for a, b, c in CATS)
def _sku_img(sku):
    for it in items:
        if it['sku']==sku and it.get('i'): return it['i'][0]
    return ''
heroimgs = ''.join(f'<i><img src="img/p/{_sku_img(k)}.webp" alt="" width="400" height="400"></i>' for k in ('H1005.480','A1001.700','D1011.900'))
home = f'''
<section class="hero"><div class="wrap">
<h1>Fire door hardware, in stock and sent fast.</h1>
<p class="lead">Intumescent seals, hinges, closers and fire exit hardware, packed in our own warehouse.</p>
<div class="row"><a class="btn" href="shop/">Shop fire door hardware</a><a class="tl" href="trade/">Apply for a trade account</a></div>
<ul class="trust"><li>Packed in our own warehouse</li><li>Fast moving items held in stock</li><li>Trade accounts for better prices</li></ul>
<div class="heroimgs">{heroimgs}</div>
</div></section>
<section class="brands"><div class="wrap"><span class="lab">Brands we stock</span><b>Astroflame</b><b>Eclipse</b></div></section>
<section class="sec"><div class="wrap"><h2>Shop by category</h2><div class="tiles">{tiles}</div></div></section>
<section class="sec grey" id="kit"><div class="wrap">
<h2>Kit a fire door</h2><p class="lead">Pick your door and we list everything to fit it: hinges, closer, seals, lever handles, latch or lock and the intumescent to suit. One button adds the lot to your basket.</p>
<div class="kitbox">
<div class="kitsel">
<fieldset><legend>Fire rating</legend><label><input type="radio" name="kr" value="FD30" checked> FD30 (30 minutes)</label><label><input type="radio" name="kr" value="FD60"> FD60 (60 minutes)</label></fieldset>
<fieldset><legend>Door set</legend><label><input type="radio" name="kd" value="single" checked> Single door</label><label><input type="radio" name="kd" value="double"> Double door</label></fieldset>
<fieldset><legend>Latch or lock</legend><label><input type="radio" name="ku" value="latch" checked> Latch only</label><label><input type="radio" name="ku" value="lock"> Lockable (sash lock)</label></fieldset>
</div>
<div class="kitlist" id="kitlist" aria-live="polite"></div>
</div>
<p class="sm">Quantities are a guide for a standard door. Check your door and frame specification and ask us if you are unsure.</p>
</div></section>
<section class="sec"><div class="wrap"><h2>Why Fire Door Hardware</h2><div class="three">
<div><h3>Packed in our own warehouse</h3><p>Every order is picked and packed by our team, not a third party.</p></div>
<div><h3>Most fast moving items in stock</h3><p>Seals, hinges, closers and signs are the lines we hold.</p></div>
<div><h3>Trade accounts for better prices</h3><p>Set prices for everyone. Apply for a trade account for better pricing.</p></div>
</div></div></section>
<section class="sec grey"><div class="wrap"><div class="sec-h"><h2>Popular products</h2><a class="tl" href="shop/">View all</a></div><div class="grid" id="popular"></div></div></section>
<section class="sec" id="faq"><div class="wrap"><h2>Questions</h2><div class="faq">
<details><summary>How is my order delivered?</summary><p>Orders are packed in our warehouse and sent by courier. Delivery cost and times are confirmed with your order.</p></details>
<details><summary>Are prices inc VAT?</summary><p>Prices are shown ex VAT by default. Use the Ex VAT / Inc VAT switch at the top of any page to see prices with 20% VAT added.</p></details>
<details><summary>How do trade accounts work?</summary><p>Prices are set for everyone. If you buy regularly, apply for a trade account and we will come back to you about better pricing.</p></details>
<details><summary>Can I get test certificates?</summary><p>Yes. Ask us for the test certificate for any product and we will send what we hold.</p></details>
<details><summary>What about returns?</summary><p>See our delivery and returns page. Contact us before sending anything back.</p></details>
</div></div></section>
<section class="sec grey"><div class="wrap"><h2>Contact</h2><p>Questions about a fire door job? Email <a class="tl" href="mailto:{ORDER_EMAIL}">{ORDER_EMAIL}</a> and tell us what you are fitting.</p></div></section>
'''
write('index.html', page('index.html', 'Fire Door Hardware | Fire door hardware kits and components', 'Fire door hardware, packed and sent by us. Part of Dorquip Group.', home, 'home'))

write('shop/index.html', page('shop/index.html', 'Shop | Fire Door Hardware', 'All fire door hardware.', '''
<section class="sec"><div class="wrap"><h1 class="h1s">Shop</h1>
<div class="tools"><label class="sr" for="q">Search</label><input id="q" type="search" placeholder="Search name or SKU" autocomplete="off">
<label class="sr" for="cat">Category</label><select id="cat"></select>
<label class="sr" for="sort">Sort</label><select id="sort"><option value="">Sort: default</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option></select></div>
<p class="sm" id="count"></p><div class="grid" id="grid"></div><p class="more"><button class="btn" id="more" type="button" hidden>Show more</button></p></div></section>''', 'shop'))

write('product/index.html', page('product/index.html', 'Product | Fire Door Hardware', 'Fire door hardware product.', '''
<section class="sec"><div class="wrap"><p class="crumb"><a href="../shop/">Shop</a></p><div id="pd" class="pd"><p>Loading</p></div>
<h2 class="rel-h" id="rel-h" hidden>Related items</h2><div class="grid" id="rel"></div></div></section>''', 'product'))

write('checkout/index.html', page('checkout/index.html', 'Checkout | Fire Door Hardware', 'Send your order.', '''
<section class="sec"><div class="wrap"><h1 class="h1s">Checkout</h1><div id="ck"></div></div></section>''', 'checkout'))

write('trade/index.html', page('trade/index.html', 'Trade accounts | Fire Door Hardware', 'Apply for a trade account.', '''
<section class="sec"><div class="wrap narrow"><h1 class="h1s">Trade accounts</h1>
<p class="lead">Our prices are set for everyone. Apply for a trade account for better pricing.</p>
<form id="tf" class="form" novalidate>
<label>Company<input name="company" required autocomplete="organization"></label>
<label>Contact name<input name="name" required autocomplete="name"></label>
<label>Email<input name="email" type="email" required autocomplete="email"></label>
<label>Phone<input name="phone" type="tel" required autocomplete="tel"></label>
<label>Trade type<select name="type" required><option value="">Choose</option><option>Joiner or door fitter</option><option>Fire door installer</option><option>Builder or contractor</option><option>Facilities or maintenance</option><option>Merchant or reseller</option><option>Other</option></select></label>
<label>Expected monthly spend<select name="spend" required><option value="">Choose</option><option>Under 250 pounds</option><option>250 to 1,000 pounds</option><option>1,000 to 5,000 pounds</option><option>Over 5,000 pounds</option></select></label>
<label>Message<textarea name="msg" rows="4"></textarea></label>
<p class="err" id="te" role="alert"></p>
<button class="btn" type="submit">Send application</button>
<p class="sm">This opens your email app with the application ready to send.</p>
</form>
<div id="tdone" class="done" hidden><h2>Application ready</h2><p>If your email app did not open, email <a class="tl" href="mailto:%s">%s</a> with your company details.</p></div>
</div></section>''' % (ORDER_EMAIL, ORDER_EMAIL), 'trade'))

write('about/index.html', page('about/index.html', 'About | Fire Door Hardware', 'About Fire Door Hardware.', f'''
<section class="sec"><div class="wrap narrow"><h1 class="h1s">About Fire Door Hardware</h1>
<p class="lead">Fire Door Hardware is a trading name of Dorquip Group Limited. We supply fire door hardware to joiners, installers, contractors and facilities teams.</p>
<p>We hold the fast moving lines, seals, hinges, closers, signs and fire exit hardware, and every order is packed in our own warehouse. We are adding more ranges, including Astroflame and Eclipse.</p>
<p>Prices are set for everyone. If you buy regularly, <a class="tl" href="../trade/">apply for a trade account</a>.</p>
<p>Contact: <a class="tl" href="mailto:{ORDER_EMAIL}">{ORDER_EMAIL}</a></p></div></section>''', 'about'))

write('delivery/index.html', page('delivery/index.html', 'Delivery and returns | Fire Door Hardware', 'Delivery and returns.', f'''
<section class="sec"><div class="wrap narrow"><h1 class="h1s">Delivery and returns</h1>
<h2>Delivery</h2><p>Orders are packed in our warehouse and sent by courier. Delivery cost and times are shown at checkout or confirmed with your order.</p>
<h2>Payment</h2><p>When you place an order we confirm it and send payment details.</p>
<h2>Returns</h2><p>If something is not right, contact us before sending anything back so we can arrange it. Items should be unused and in their original packaging.</p>
<h2>Certificates</h2><p>Ask us for the test certificate for any product.</p>
<p>Contact: <a class="tl" href="mailto:{ORDER_EMAIL}">{ORDER_EMAIL}</a></p></div></section>''', 'delivery'))

# ---------- CSS ----------
CSS = r'''
:root{--red:#C8261E;--ink:#111;--mute:#555;--line:#e3e3e0;--grey:#f4f4f2}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font-family:Archivo,Inter,system-ui,sans-serif;font-size:16px;line-height:1.5}
img{max-width:100%;display:block}a{color:inherit}
h1,h2,h3,h4{font-weight:800;line-height:1.1;margin:0 0 .6em;letter-spacing:-.01em}
h1{font-size:clamp(2.2rem,7vw,4.6rem)}h2{font-size:clamp(1.6rem,4vw,2.4rem)}h3{font-size:1.15rem}
.h1s{font-size:clamp(2rem,5vw,3rem)}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}.narrow{max-width:760px}
.sm{font-size:.85rem;color:var(--mute)}.lead{font-size:1.15rem;color:var(--mute);max-width:640px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 24px;background:var(--red);color:#fff;border:0;border-radius:2px;font:700 1rem Archivo,sans-serif;text-decoration:none;cursor:pointer}
.btn:hover{background:#a81e17}.btn:disabled{background:#999;cursor:not-allowed}
.tl{display:inline-flex;align-items:center;min-height:44px;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.hdr{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid var(--line)}
.hdr-in{display:flex;align-items:center;justify-content:space-between;height:64px;gap:12px}
.logo{display:inline-flex;align-items:center;gap:8px;text-decoration:none;height:36px}.logo .word{white-space:nowrap}.logo .word span{color:var(--red)}@media(max-width:560px){.logo .word{font-size:1.02rem;letter-spacing:.03em}.logo{min-width:0}}@media(max-width:360px){.logo .word{font-size:.9rem}}
.mark{width:22px;height:30px;background:var(--red);display:inline-block}
.word{font-weight:800;font-size:1.35rem;letter-spacing:.06em}.sub{font-weight:500;font-size:.8rem;letter-spacing:.2em;color:var(--mute);align-self:flex-end;margin-bottom:5px}
.dnav{display:none;gap:22px}.dnav a{text-decoration:none;font-weight:600;min-height:44px;display:inline-flex;align-items:center}.dnav a:hover{color:var(--red)}
.hdr-r{display:flex;align-items:center;gap:8px}
.vat{display:inline-flex;border:1px solid var(--line);border-radius:2px}
.vat button{min-height:36px;padding:0 10px;background:#fff;border:0;font:600 .78rem Archivo,sans-serif;cursor:pointer;color:var(--mute)}
.vat button.on{background:var(--ink);color:#fff}
.bag,.burger{position:relative;width:44px;height:44px;background:none;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:var(--ink)}
.bag b{position:absolute;top:3px;right:1px;min-width:18px;height:18px;border-radius:9px;background:var(--red);color:#fff;font-size:.7rem;display:flex;align-items:center;justify-content:center;padding:0 4px}
.burger{flex-direction:column;gap:5px}.burger i{display:block;width:22px;height:2px;background:var(--ink)}
.mmenu{position:fixed;top:64px;left:0;right:0;bottom:0;background:#fff;z-index:49;overflow:auto;border-top:1px solid var(--line)}
.mmenu[hidden]{display:none}
.mmenu nav{display:flex;flex-direction:column;padding:0 20px}
.mmenu nav>a{display:flex;align-items:center;min-height:56px;font-size:1.2rem;font-weight:700;text-decoration:none;border-bottom:1px solid var(--line)}
.vat-m{margin:20px 0;align-self:flex-start}
@media(min-width:900px){.dnav{display:flex}.burger{display:none}.mmenu{display:none!important}}
@media(max-width:520px){.sub{display:none}.hdr .vat:not(.vat-m),header .vat:not(.vat-m){display:none}}.bag b:empty,.bag b[data-z]{display:none}
.hero{padding:44px 0 40px}.trust{list-style:none;padding:0;margin:24px 0 0;display:grid;gap:8px}.trust li{position:relative;padding-left:22px;font-weight:600;font-size:.95rem}.trust li::before{content:"";position:absolute;left:0;top:.45em;width:10px;height:10px;background:var(--red)}.heroimgs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:32px}.heroimgs i{display:block;aspect-ratio:1;background:var(--grey);border:1px solid var(--line)}.heroimgs img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;padding:10%}@media(min-width:900px){.hero .wrap{display:grid;grid-template-columns:1.2fr 1fr;column-gap:48px}.hero .wrap>*{grid-column:1}.heroimgs{grid-column:2;grid-row:1/span 4;align-self:center;margin:0}}.hero h1{max-width:900px}.hero .lead{margin:0 0 28px}
.row{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
.brands{border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.brands .wrap{display:flex;gap:20px;align-items:center;flex-wrap:wrap;min-height:64px;padding-top:10px;padding-bottom:10px}
.brands .lab{font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:var(--mute)}.brands b{font-size:1.2rem;letter-spacing:.04em}.brands .note{color:var(--mute);font-size:.9rem}
.sec{padding:56px 0}.grey{background:var(--grey)}
.sec-h{display:flex;justify-content:space-between;align-items:baseline}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.tile i{display:block;width:64px;height:64px;background:#fff;border:1px solid var(--line);margin-bottom:6px}.tile i img{width:100%;height:100%;object-fit:contain;padding:6px;mix-blend-mode:multiply}.tile{display:flex;flex-direction:column;gap:6px;padding:20px;background:var(--grey);text-decoration:none;min-height:120px;border-top:3px solid transparent}
.tile:hover{border-top-color:var(--red)}.tile b{font-size:1.1rem}.tile span{color:var(--mute);font-size:.9rem}.tile em{font-style:normal;font-size:.8rem;font-weight:700;margin-top:auto}
.kitbox{background:#fff;border:1px solid var(--line);padding:20px;display:grid;gap:24px;margin:20px 0 12px}
@media(min-width:800px){.kitbox{grid-template-columns:260px 1fr}}
fieldset{border:0;padding:0;margin:0 0 16px}legend{font-weight:800;margin-bottom:6px}
.kitsel label{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer}
input[type=radio]{accent-color:var(--red);width:20px;height:20px}
.kl-row{display:grid;grid-template-columns:48px 1fr auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
.kl-row img{width:48px;height:48px;object-fit:contain}.kl-row small{display:block;color:var(--mute)}
.kl-tot{display:flex;justify-content:space-between;align-items:center;padding:14px 0;flex-wrap:wrap;gap:12px;font-weight:800}
.three{display:grid;gap:24px}@media(min-width:800px){.three{grid-template-columns:repeat(3,1fr)}}
.three div{border-top:3px solid var(--red);padding-top:14px}.three p{color:var(--mute);margin:0}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:760px){.grid{grid-template-columns:repeat(3,1fr)}}@media(min-width:1000px){.grid{grid-template-columns:repeat(4,1fr)}}
.card{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);text-decoration:none;min-width:0}
.grey .card{border-color:transparent}
.card .im{background:#fff;aspect-ratio:1;display:flex;align-items:center;justify-content:center;padding:10px}
.card .im img{max-height:100%;object-fit:contain}
.card .tx{padding:12px;display:flex;flex-direction:column;gap:4px;flex:1;background:var(--grey)}
.card .nm{font-weight:700;font-size:.92rem;line-height:1.25;overflow-wrap:anywhere}.card .sk{font-size:.75rem;color:var(--mute)}
.card .pr{font-weight:800;margin-top:auto}.card .pr small{font-weight:500;color:var(--mute)}
.tools{display:grid;gap:10px;margin:16px 0}@media(min-width:760px){.tools{grid-template-columns:2fr 1.2fr 1fr}}
input,select,textarea{font:inherit;min-height:44px;padding:8px 12px;border:1px solid #bbb;border-radius:2px;background:#fff;width:100%}
.more{text-align:center;margin-top:24px}
.faq details{border-bottom:1px solid var(--line)}.faq summary{cursor:pointer;min-height:56px;display:flex;align-items:center;font-weight:700;list-style:none}
.faq summary::-webkit-details-marker{display:none}.faq summary::after{content:"+";margin-left:auto;font-size:1.4rem;color:var(--red)}.faq details[open] summary::after{content:"-"}
.faq p{margin:0 0 16px;color:var(--mute)}
.crumb{font-size:.9rem}.pd{display:grid;gap:28px;margin:12px 0 40px}@media(min-width:800px){.pd{grid-template-columns:1fr 1fr}}
.pd .pim{background:#fff;border:1px solid var(--line);padding:16px;aspect-ratio:1;display:flex;align-items:center;justify-content:center}.pd .pim img{max-height:100%;object-fit:contain}
.pd .big{font-size:1.8rem;font-weight:800;margin:8px 0}.pd .big small{font-size:.9rem;font-weight:500;color:var(--mute)}
.qty{display:inline-flex;border:1px solid #bbb}.qty button{width:44px;height:44px;background:#fff;border:0;font-size:1.3rem;cursor:pointer}.qty span{min-width:44px;display:flex;align-items:center;justify-content:center;font-weight:700}
.pd ul{padding-left:20px}.cert{background:var(--grey);padding:12px 16px;margin:16px 0}
.rel-h{margin-top:24px}
.drawer-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:90}
.drawer{position:fixed;top:0;right:0;bottom:0;width:min(420px,100%);background:#fff;z-index:100;display:flex;flex-direction:column}
.drawer[hidden],.drawer-bg[hidden]{display:none}
.dr-h{display:flex;justify-content:space-between;align-items:center;padding:8px 20px;border-bottom:1px solid var(--line)}.dr-h h2{margin:0;font-size:1.3rem}
.x{width:44px;height:44px;border:0;background:none;font-size:2rem;cursor:pointer}
.dr-b{flex:1;overflow:auto;padding:0 20px}.dr-f{padding:16px 20px;border-top:1px solid var(--line)}
.dl{display:grid;grid-template-columns:56px 1fr;gap:12px;padding:14px 0;border-bottom:1px solid var(--line)}.dl img{width:56px;height:56px;object-fit:contain}
.dl .nm{font-weight:700;font-size:.9rem}.dl .ctl{display:flex;align-items:center;gap:10px;margin-top:6px;flex-wrap:wrap}
.dl .qty button{width:44px;height:44px}.rm{background:none;border:0;text-decoration:underline;cursor:pointer;min-height:44px;font:inherit;color:var(--mute)}
.sumr{display:flex;justify-content:space-between;padding:3px 0}.sumr.t{font-weight:800;font-size:1.1rem;border-top:1px solid var(--line);margin-top:6px;padding-top:8px}
.dr-f .btn{width:100%;margin-top:12px}
.form{display:grid;gap:14px;margin-top:20px}.form label{display:grid;gap:4px;font-weight:700;font-size:.9rem}.err{color:var(--red);font-weight:700;margin:0;min-height:1em}
.ckg{display:grid;gap:32px}@media(min-width:900px){.ckg{grid-template-columns:1.3fr 1fr}}
.sumbox{background:var(--grey);padding:20px;align-self:start}
.done{padding:20px 0}
.ftr{background:#111;color:#fff;padding:48px 0 24px;margin-top:0}
.ftr .logo{color:#fff}.ftr .sub{color:#bbb}
.fcols{display:grid;gap:28px;grid-template-columns:1fr}@media(min-width:760px){.fcols{grid-template-columns:2fr 1fr 1fr 1.4fr}}
.ftr h4{font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:#bbb}.ftr a{display:block;text-decoration:none;min-height:36px;padding:6px 0}.ftr p{color:#ccc;margin:.5em 0}
.ftr .sm{color:#bbb}.fbot{display:flex;gap:8px 24px;flex-wrap:wrap;border-top:1px solid #333;margin-top:28px;padding-top:16px;font-size:.85rem}.fbot a{display:inline;min-height:0;padding:0}
.toast{position:fixed;left:50%;bottom:20px;transform:translate(-50%,80px);background:#111;color:#fff;padding:12px 18px;z-index:120;opacity:0;transition:.25s;pointer-events:none;max-width:90vw}
.toast.on{transform:translate(-50%,0);opacity:1}
:focus-visible{outline:3px solid var(--red);outline-offset:2px}
'''
write('assets/style.css', CSS)

# ---------- JS ----------
JS = r'''
(function(){
'use strict';
var ROOT=document.body.getAttribute('data-root')||'';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var KEY='if_cart',VK='if_vat',DATA=null,BY={};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
var vat=ls(VK)==='inc'?'inc':'ex';
function gbp(n){return '\u00a3'+(Math.round(n*100)/100).toFixed(2)}
function px(p){return vat==='inc'?p*1.2:p}
function label(){return vat==='inc'?'inc VAT':'ex VAT'}
var cart={get:function(){try{return JSON.parse(ls(KEY))||[]}catch(e){return[]}},set:function(c){ls(KEY,JSON.stringify(c));refresh()},
add:function(id,q){var c=this.get(),l=c.filter(function(x){return x.id===id})[0];if(l)l.q+=q;else c.push({id:id,q:q});this.set(c)},
setq:function(id,q){var c=this.get().map(function(x){return x.id===id?{id:id,q:q}:x}).filter(function(x){return x.q>0});this.set(c)},
clear:function(){ls(KEY,null);refresh()},count:function(){return this.get().reduce(function(a,x){return a+x.q},0)}};
function lines(){return cart.get().map(function(l){return {id:l.id,q:l.q,p:BY[l.id]}}).filter(function(l){return l.p})}
function totals(L){var ex=0;L.forEach(function(l){ex+=l.p.p*l.q});ex=Math.round(ex*100)/100;var v=Math.round(ex*0.2*100)/100;return {ex:ex,vat:v,inc:Math.round((ex+v)*100)/100}}
function img(p,s){var k=p.i&&p.i[0];return k?ROOT+'img/p/'+k+(s?'-s':'')+'.webp':''}
function purl(p){return ROOT+'product/?id='+encodeURIComponent(p.id)}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('on')},2200)}
function load(){if(DATA)return Promise.resolve(DATA);return fetch(ROOT+'data/cat.json').then(function(r){return r.json()}).then(function(d){DATA=d;d.items.forEach(function(p){BY[p.id]=p});return d})}
function card(p){return '<a class="card" href="'+purl(p)+'"><div class="im"><img src="'+img(p,true)+'" alt="" loading="lazy" width="200" height="200"></div><div class="tx"><span class="nm">'+esc(p.n)+'</span><span class="sk">'+esc(p.sku)+'</span><span class="pr">'+gbp(px(p.p))+' <small>'+label()+'</small></span></div></a>'}
function renderBag(){var L=lines(),b=$('#dr-b'),f=$('#dr-f');if(!b)return;
if(!L.length){b.innerHTML='<p style="padding:20px 0">Your basket is empty.</p>';f.innerHTML='<a class="btn" href="'+ROOT+'shop/">Browse the shop</a>';return}
b.innerHTML=L.map(function(l){return '<div class="dl"><img src="'+img(l.p,true)+'" alt=""><div><div class="nm">'+esc(l.p.n)+'</div><div class="sk sm">'+esc(l.p.sku)+' &middot; '+gbp(px(l.p.p))+' '+label()+'</div><div class="ctl"><div class="qty"><button type="button" data-q="-1" data-id="'+esc(l.id)+'" aria-label="Less">-</button><span>'+l.q+'</span><button type="button" data-q="1" data-id="'+esc(l.id)+'" aria-label="More">+</button></div><button class="rm" type="button" data-rm="'+esc(l.id)+'">Remove</button></div></div></div>'}).join('');
var t=totals(L);f.innerHTML='<div class="sumr"><span>Subtotal ex VAT</span><span>'+gbp(t.ex)+'</span></div><div class="sumr"><span>VAT 20%</span><span>'+gbp(t.vat)+'</span></div><div class="sumr t"><span>Total inc VAT</span><span>'+gbp(t.inc)+'</span></div><p class="sm" style="margin:6px 0 0">Delivery confirmed with your order.</p><a class="btn" href="'+ROOT+'checkout/">Checkout</a>'}
function refresh(){$$('.bag b').forEach(function(b){b.textContent=cart.count()||''});if(DATA)renderBag()}
function openBag(){load().then(function(){renderBag();$('#drawer').hidden=false;$('.drawer-bg').hidden=false;document.body.style.overflow='hidden'})}
function closeBag(){$('#drawer').hidden=true;$('.drawer-bg').hidden=true;document.body.style.overflow=''}
function setVat(v){vat=v;ls(VK,v);$$('[data-vat]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-vat')===v)});if(window.__rerender)window.__rerender();if(DATA)renderBag()}
document.addEventListener('click',function(e){var t=e.target.closest('[data-open-basket],[data-close-basket],[data-vat],[data-burger],[data-q],[data-rm],[data-add]');if(!t)return;
if(t.hasAttribute('data-open-basket'))openBag();
else if(t.hasAttribute('data-close-basket'))closeBag();
else if(t.hasAttribute('data-vat'))setVat(t.getAttribute('data-vat'));
else if(t.hasAttribute('data-burger')){var m=$('#mmenu'),o=m.hidden;m.hidden=!o;t.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''}
else if(t.hasAttribute('data-q')){var id=t.getAttribute('data-id'),l=cart.get().filter(function(x){return x.id===id})[0];if(l)cart.setq(id,l.q+parseInt(t.getAttribute('data-q'),10))}
else if(t.hasAttribute('data-rm'))cart.setq(t.getAttribute('data-rm'),0);
else if(t.hasAttribute('data-add')){e.preventDefault();cart.add(t.getAttribute('data-add'),1);toast('Added to basket')}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeBag()});

function home(){var pop=['D1011.900','H1005.480','A1001.700','F2000.960','H2002.000','E4000.700','H3000.000','H1003.480'];
Promise.all([load(),fetch(ROOT+'data/kit.json').then(function(r){return r.json()})]).then(function(r){var d=r[0],K=r[1];
var bySku={};d.items.forEach(function(p){bySku[p.sku]=p});
$$('[data-count]').forEach(function(el){var n=d.items.filter(function(p){return p.c===el.getAttribute('data-count')}).length;el.textContent=n+' products'});
function drawPop(){$('#popular').innerHTML=pop.map(function(s){return bySku[s]}).filter(Boolean).map(function(p){return card(p).replace('<a class="card"','<a class="card"')}).join('')}
function drawKit(){var rt=$('input[name=kr]:checked').value,ds=$('input[name=kd]:checked').value,ku=$('input[name=ku]:checked').value,L=K[rt+'-'+ds+'-'+ku],tot=0;
var h=L.map(function(k){var p=BY[k.id];tot+=p.p*k.q;return '<div class="kl-row"><img src="'+img(p,true)+'" alt=""><div><a href="'+purl(p)+'"><b>'+k.q+' x '+esc(p.n)+'</b></a><small>'+esc(p.sku)+' - '+esc(k.note)+'</small></div><b>'+gbp(px(p.p*k.q))+'</b></div>'}).join('');
h+='<div class="kl-tot"><span>Kit total '+label()+': '+gbp(px(tot))+'</span><button class="btn" type="button" id="kitadd">Add whole kit to basket</button></div>';
$('#kitlist').innerHTML=h;$('#kitadd').onclick=function(){L.forEach(function(k){cart.add(k.id,k.q)});toast('Kit added to basket');openBag()}}
$$('input[name=kr],input[name=kd],input[name=ku]').forEach(function(i){i.addEventListener('change',drawKit)});
window.__rerender=function(){drawPop();drawKit()};window.__rerender()})}

function shop(){load().then(function(d){var q=$('#q'),c=$('#cat'),s=$('#sort'),g=$('#grid'),more=$('#more'),n=36;
c.innerHTML='<option value="">All categories</option>'+d.cats.map(function(x){return '<option value="'+x.id+'">'+esc(x.n)+'</option>'}).join('');
var u=new URLSearchParams(location.search);c.value=u.get('c')||'';q.value=u.get('q')||'';s.value=u.get('o')||'';
function list(){var t=q.value.trim().toLowerCase(),L=d.items.filter(function(p){return (!c.value||p.c===c.value)&&(!t||(p.n+' '+p.sku).toLowerCase().indexOf(t)>-1)});
if(s.value==='asc')L=L.slice().sort(function(a,b){return a.p-b.p});if(s.value==='desc')L=L.slice().sort(function(a,b){return b.p-a.p});return L}
function draw(reset){if(reset)n=36;var L=list();$('#count').textContent=L.length+' product'+(L.length===1?'':'s')+' ('+label()+')';
g.innerHTML=L.slice(0,n).map(card).join('')||'<p>No products match. Try another search.</p>';more.hidden=L.length<=n;
var p=new URLSearchParams();if(c.value)p.set('c',c.value);if(q.value)p.set('q',q.value);if(s.value)p.set('o',s.value);history.replaceState(null,'',location.pathname+(p.toString()?'?'+p:''))}
[q,c,s].forEach(function(e){e.addEventListener('input',function(){draw(true)})});more.onclick=function(){n+=36;draw()};
window.__rerender=function(){draw()};draw(true)})}

function product(){load().then(function(d){var id=new URLSearchParams(location.search).get('id'),p=BY[id],m=$('#pd');
if(!p){m.innerHTML='<div><h1 class="h1s">Product not found</h1><p><a class="tl" href="'+ROOT+'shop/">Back to the shop</a></p></div>';return}
document.title=p.n+' | Fire Door Hardware';var qty=1;
function dh(){var h='',ul=0;p.d.forEach(function(l){if(/^\u2022/.test(l)){if(!ul){h+='<ul>';ul=1}h+='<li>'+esc(l.replace(/^\u2022\s*/,''))+'</li>'}else{if(ul){h+='</ul>';ul=0}h+='<p>'+esc(l)+'</p>'}});if(ul)h+='</ul>';return h}
function draw(){m.innerHTML='<div class="pim"><img src="'+img(p)+'" alt="'+esc(p.n)+'"></div><div><h1 class="h1s">'+esc(p.n)+'</h1><p class="sm">SKU '+esc(p.sku)+'</p><p class="big">'+gbp(px(p.p))+' <small>'+label()+'</small></p><div class="row"><div class="qty"><button type="button" id="qm" aria-label="Less">-</button><span id="qv">'+qty+'</span><button type="button" id="qp" aria-label="More">+</button></div><button class="btn" type="button" id="add">Add to basket</button></div><div class="cert">Need the fire test certificate? <a class="tl" href="mailto:'+window.IF.email+'?subject='+encodeURIComponent('Test certificate: '+p.sku)+'">Ask us</a></div>'+dh()+'</div>';
$('#qm').onclick=function(){qty=Math.max(1,qty-1);$('#qv').textContent=qty};$('#qp').onclick=function(){qty++;$('#qv').textContent=qty};
$('#add').onclick=function(){cart.add(p.id,qty);toast('Added to basket');openBag()}}
window.__rerender=function(){var qv=qty;draw();qty=qv};draw();
var rel=d.items.filter(function(x){return x.c===p.c&&x.id!==p.id}).slice(0,4);if(rel.length){$('#rel-h').hidden=false;$('#rel').innerHTML=rel.map(card).join('')}})}

function checkout(){load().then(function(){var m=$('#ck');
function draw(){var L=lines();if(!L.length){m.innerHTML='<p>Your basket is empty.</p><a class="btn" href="'+ROOT+'shop/">Browse the shop</a>';return}
var t=totals(L),sv={};try{sv=JSON.parse(ls('if_details'))||{}}catch(e){}
function v(k){return esc(sv[k]||'')}
m.innerHTML='<div class="ckg"><form id="cf" class="form" novalidate style="margin-top:0"><label>Name<input name="name" required autocomplete="name" value="'+v('name')+'"></label><label>Company<input name="company" autocomplete="organization" value="'+v('company')+'"></label><label>Email<input name="email" type="email" required autocomplete="email" value="'+v('email')+'"></label><label>Phone<input name="phone" type="tel" required autocomplete="tel" value="'+v('phone')+'"></label><label>Delivery address<textarea name="address" rows="4" required autocomplete="street-address">'+v('address')+'</textarea></label><label>Notes<textarea name="notes" rows="3">'+v('notes')+'</textarea></label><p class="err" id="ce" role="alert"></p><button class="btn" type="submit">Send order</button><p class="sm">We will confirm your order and send payment details. No payment is taken on this page.</p></form><div class="sumbox"><h2 style="font-size:1.3rem">Your order</h2>'+L.map(function(l){return '<div class="sumr"><span>'+l.q+' x '+esc(l.p.n)+'</span><span>'+gbp(px(l.p.p*l.q))+'</span></div>'}).join('')+'<hr><div class="sumr"><span>Subtotal ex VAT</span><span>'+gbp(t.ex)+'</span></div><div class="sumr"><span>Delivery</span><span>Confirmed with order</span></div><div class="sumr"><span>VAT 20%</span><span>'+gbp(t.vat)+'</span></div><div class="sumr t"><span>Total inc VAT</span><span>'+gbp(t.inc)+'</span></div></div></div>';
$('#cf').onsubmit=function(e){e.preventDefault();var f=e.target,o={};new FormData(f).forEach(function(val,k){o[k]=String(val).trim()});
if(!o.name||!o.email||!o.phone||!o.address||o.email.indexOf('@')<1){$('#ce').textContent='Please fill in name, a valid email, phone and delivery address.';return}
ls('if_details',JSON.stringify(o));
var body='New order from the Fire Door Hardware site\n\n'+L.map(function(l){return l.q+' x '+l.p.n+' ('+l.p.sku+') '+gbp(l.p.p)+' ex VAT each'}).join('\n')+'\n\nSubtotal ex VAT: '+gbp(t.ex)+'\nVAT 20%: '+gbp(t.vat)+'\nTotal inc VAT: '+gbp(t.inc)+'\nDelivery: to be confirmed\n\nName: '+o.name+'\nCompany: '+o.company+'\nEmail: '+o.email+'\nPhone: '+o.phone+'\nDelivery address:\n'+o.address+'\n\nNotes: '+o.notes;
cart.clear();
m.innerHTML='<div class="done"><h2>Order received</h2><p>Thank you, '+esc(o.name)+'. We will confirm your order and send payment details to '+esc(o.email)+'.</p><p class="sm">If your email app did not open, email your basket to <a class="tl" href="mailto:'+window.IF.email+'">'+window.IF.email+'</a>.</p><a class="btn" href="'+ROOT+'shop/">Back to the shop</a></div>';
window.location.href='mailto:'+window.IF.email+'?subject='+encodeURIComponent('Order from Fire Door Hardware: '+o.name)+'&body='+encodeURIComponent(body)}}
window.__rerender=draw;draw()})}

function trade(){var f=$('#tf');f.onsubmit=function(e){e.preventDefault();var o={};new FormData(f).forEach(function(v,k){o[k]=String(v).trim()});
if(!o.company||!o.name||!o.email||o.email.indexOf('@')<1||!o.phone||!o.type||!o.spend){$('#te').textContent='Please fill in every field except the message.';return}
var body='Trade account application\n\nCompany: '+o.company+'\nContact: '+o.name+'\nEmail: '+o.email+'\nPhone: '+o.phone+'\nTrade type: '+o.type+'\nExpected monthly spend: '+o.spend+'\n\nMessage: '+o.msg;
$('#te').textContent='';f.hidden=true;$('#tdone').hidden=false;
window.location.href='mailto:'+window.IF.email+'?subject='+encodeURIComponent('Trade account application: '+o.company)+'&body='+encodeURIComponent(body)}}

var pg=document.body.className;
$$('[data-vat]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-vat')===vat)});
refresh();
load().then(refresh);
if(pg==='home')home();else if(pg==='shop')shop();else if(pg==='product')product();else if(pg==='checkout')checkout();else if(pg==='trade')trade();
})();
'''
write('assets/app.js', JS)
print('built', len(items), 'items')
