#!/usr/bin/env python3
"""Generates the 7ei8ht6 Properties site (v4, investor edition) from shared templates.
Run: python3 build.py   (it refuses dashes; see HANDOVER.md)"""
import html, pathlib, re
OUT = pathlib.Path(__file__).parent
BASE = "https://thetenderdesk.co.uk/work/7ei8ht6-properties/"
PHONE, PHONE_T = "+971 4 443 9780", "+97144439780"
MOB, MOB_T = "+971 50 646 8786", "+971506468786"
WA = "https://wa.me/971506468786"
EMAIL = "info@7ei8ht6properties.com"
BAYUT = "https://www.bayut.com/companies/7ei8ht6-properties-8883/"
FB = "https://www.facebook.com/p/7ei8ht6-Properties-LLC-100063644737141/"
LI = "https://www.linkedin.com/company/13218590"
IG = "https://www.instagram.com/7ei8ht6properties/"
MAPS = "https://maps.google.com/?cid=16422721968951027580"

TEAM = [
("Fayyaz (Abu Mustafa) Sayani","Founder &amp; CEO","050 646 8786","fayyaz","fayyaz"),
("Zahir Alimahomed","Director","052 844 7229","zahir","zahir"),
("Iqbal Ahmed Abdullah","Associate Director","050 677 0131","info","iqbal"),
("Asha Nagarupillai","Office Manager","055 241 0447","asha","asha"),
("Aiswarya Rajeev","Executive Assistant","058 800 8311","aiswarya","aiswarya"),
("Avishna Ganesh","Administrative Assistant","050 862 5664","avishna","avishna"),
("Muhammad Ali Abdul Sattar","Associate Director","055 424 3200","info","alisattar"),
("Divya Prakash","Property Consultant","050 147 5717","divya","divya"),
("Khalid Awadh","Property Consultant","055 620 7707","khalid","khalid"),
("Yousaf Nouman","Property Consultant","055 916 8978","yousaf","yousaf"),
("Mohamed Rimnaz","Property Consultant","055 108 2177","rimnaz","rimnaz"),
("Shabnam Gulamzada","Property Consultant","054 478 6999","shabnam","shabnam"),
("Mohammed Abdul Arbaaz","Property Consultant","055 302 0319","arbaaz","arbaaz"),
("Rahmath Khan Mohammed","Property Consultant","056 494 6215","kashif","kashif"),
("Saoud Faisal Bayazeed","Property Consultant","052 129 8470","saoud","saoud"),
("Muhammad Zain Alimahomed","Property Consultant","055 787 9116","off-plan","zain"),
("Teresa Materum","Office Clerk","04 443 9780","teresa","teresa"),
("Jessa Abaya Lopez","Office Clerk","04 443 9780","jessa","jessa"),
("Rhea Ann Banares","Office Clerk","04 443 9780","rhea","rhea"),
("Mohammed Jeelani Gulam","Property Consultant","052 225 4623","jeelani","jeelani"),
("Muhammad Junaid Azhar","Property Consultant","052 200 1302","junaid","junaid"),
("Juned Rafik Ghanchi","Property Consultant","055 778 3567","ghanchi","ghanchi"),
("Abdul Rasheed","Property Consultant","050 753 4550","rasheed","rasheed"),
("Obaida Al-Jahmi","Property Consultant","055 541 1162","obaida","obaida"),
("Frederick Nkwenti","Property Consultant","058 653 0278","fred","fred"),
("Blaise Quinga","Executive Assistant","052 177 5862","blaise","blaise"),
("Samer Haj","Property Consultant","058 595 4461","samer","samer"),
("Muhammad Kamran","Property Consultant","058 580 0912","kamran","kamran"),
("Mushtaq Ahmed","Property Consultant","055 901 3477","mushtaq","mushtaq"),
("Nethin Cot","Property Consultant","056 439 3000","nethin","nethin"),
("Nabil Peerally","Property Consultant","052 631 0109","nabil","nabil"),
("Nikhil Ahmed","Property Consultant","058 564 9393","nikhil","nikhil"),
("Malik Muhammad Ishaq","Property Consultant","055 615 1049","malik","malik"),
("Mahboob Ali Khan Mir","Property Consultant","050 795 2799","mahboob","mahboob"),
("Faisal Murtaza","Property Consultant","052 899 8133","faisal","faisal"),
("Ashfaque Shaikh","Property Consultant","055 125 7523","ashfaque","ashfaque"),
("Balal Asad","Property Consultant","052 721 2439","balal","balal"),
("Hazel Heramil","Admin Assistant","04 443 9780","hazel","hazel"),
]
N = len(TEAM)
RERA = {'khalid': '30126', 'yousaf': '42532', 'rimnaz': '58866', 'jeelani': '76987', 'junaid': '77420', 'zain': '78273', 'ghanchi': '81619', 'rasheed': '69089', 'fred': '74748', 'samer': '59715', 'kamran': '66919', 'mushtaq': '58762', 'nethin': '51712', 'nabil': '63669', 'nikhil': '51797', 'malik': '51941', 'mahboob': '47150', 'faisal': '42478', 'ashfaque': '48782', 'balal': '51711', 'divya': '100215', 'fayyaz': '28370', 'zahir': '86228', 'arbaaz': '88888', 'saoud': '88889', 'kashif': '89787', 'obaida': '88957'}
def rera(k):
    return f'<p class="rera">RERA No. {RERA[k]}</p>' if k in RERA else ""

def img_for(k):
    for ext in ("webp", "jpg", "png"):
        if (OUT / "img" / f"t-{k}.{ext}").exists(): return f"img/t-{k}.{ext}"
def tel(n):
    d = re.sub(r"\D", "", n)
    return "+971" + d[1:] if d.startswith("0") else "+" + d
def intl(n):
    d = re.sub(r"\D", "", n)[1:]
    return f"+971 {d[:-7]} {d[-7:-4]} {d[-4:]}"

NAV = [("invest-in-dubai.html","Invest in Dubai"),("services.html","Services"),("areas.html","Areas"),
       ("meet-the-team.html","The Team"),("contact.html","Private Consultation")]

def bi(en, ar, tag="h2", cls=""):
    """Heading with an Arabic counterpart, swapped by the EN/AR toggle."""
    return (f'<{tag} class="bi {cls}"><span class="en">{en}</span>'
            f'<span class="ar" lang="ar" dir="rtl">{ar}</span></{tag}>')

STAR = '<svg class="khatam" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 25 15 37 20 25 25 20 37 15 25 3 20 15 15Z M8 8 20 13 32 8 27 20 32 32 20 27 8 32 13 20Z"/></svg>'

def pic(name, alt, cls="", eager=False):
    return (f'<picture class="{cls}"><source media="(max-width:760px)" srcset="img/{name}-m.webp">'
            f'<img src="img/{name}.webp" alt="{alt}" {"fetchpriority=high" if eager else "loading=lazy"} decoding="async"></picture>')

def page(slug, title, desc, body, og="img/og.jpg"):
    nav = "".join(f'<a href="{h}"{" aria-current=page" if h==slug else ""}><span>{t}</span></a>' for h, t in NAV)
    full = (f"{title} | 7ei8ht6 Properties, Dubai" if slug != "index.html"
            else "7ei8ht6 Properties | Private Property Advisory in Dubai")
    url = BASE + ("" if slug == "index.html" else slug)
    return f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{full}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex">
<meta name="author" content="The Tender Desk">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="7ei8ht6 Properties LLC">
<meta property="og:title" content="{full}"><meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}{og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0c0b09">
<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="img/icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&amp;family=Manrope:wght@300;400;500;600&amp;family=Amiri&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=2818">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"RealEstateAgent","name":"7ei8ht6 Properties LLC","telephone":"{PHONE}","email":"{EMAIL}","url":"{BASE}","address":{{"@type":"PostalAddress","streetAddress":"Amaya Plaza, Office 14","addressLocality":"Nadd Al Hamar, Dubai","addressCountry":"AE"}},"hasMap":"{MAPS}","aggregateRating":{{"@type":"AggregateRating","ratingValue":"4.6","bestRating":"5"}},"sameAs":["{IG}","{FB}","{LI}","{BAYUT}"]}}</script>
</head><body class="p-{slug[:-5]}">
<a class="skip" href="#main">Skip to content</a>
<div class="veil" aria-hidden="true"><canvas class="veil-gl"></canvas><div class="veil-in"><i class="mark"></i></div></div>
<header class="hdr"><a class="brand" href="index.html" aria-label="7ei8ht6 Properties, home"><i class="mark" aria-hidden="true"></i></a>
<nav class="nav" id="nav" aria-label="Main">{nav}<a class="nav-x" href="{BAYUT}" target="_blank" rel="noopener"><span>View Properties</span></a></nav>
<div class="hdr-r"><button class="lang" type="button" aria-pressed="false" aria-label="Show key headings in Arabic"><span class="l-en">EN</span><span class="l-ar" lang="ar">عربي</span></button>
<button class="burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav"><i></i><i></i></button></div></header>
<main id="main">{body}</main>
<a class="wa-float" href="{WA}?text=Hello%207ei8ht6%20Properties%2C%20I%20would%20like%20to%20speak%20with%20an%20advisor." target="_blank" rel="noopener" aria-label="Message an advisor on WhatsApp"><svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.8.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.9 1 3.9.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.6-.4z"/></svg><span>WhatsApp</span></a>
<div class="mbar" aria-label="Quick contact"><a href="{WA}?text=Hello%207ei8ht6%20Properties%2C%20I%20would%20like%20to%20speak%20with%20an%20advisor." target="_blank" rel="noopener">WhatsApp</a><a href="contact.html#consult">Enquire</a></div>
<footer class="ftr">
<div class="ftr-top"><div class="ftr-sign"><p class="ftr-ar" lang="ar" dir="rtl">شخصي وحصري</p><p class="ftr-en">Personal <em>&amp;</em> Exclusive</p></div>
<a class="ftr-cta" href="contact.html"><span>Arrange a private consultation</span><i aria-hidden="true"></i></a></div>
<div class="ftr-grid">
<div><h3>Office</h3><p>Amaya Plaza, Office 14<br>Nadd Al Hamar, Dubai<br>United Arab Emirates</p><a class="tl" href="{MAPS}" target="_blank" rel="noopener">Directions</a></div>
<div><h3>Speak to us</h3><p><a href="tel:{PHONE_T}">{PHONE}</a><br><a href="tel:{MOB_T}">{MOB}</a><br><a href="mailto:{EMAIL}">{EMAIL}</a></p></div>
<div><h3>Explore</h3><p>{"<br>".join(f'<a href="{h}">{t}</a>' for h,t in NAV)}<br><a href="careers.html">Careers</a></p></div>
<div><h3>Regulated</h3><p>RERA registered broker<br>ORN 12322 (Dubai Land Department)</p><p><a href="{BAYUT}" target="_blank" rel="noopener">Bayut</a> <span class="dot">·</span> <a href="{WA}" target="_blank" rel="noopener">WhatsApp</a> <span class="dot">·</span> <a href="{MAPS}" target="_blank" rel="noopener">Google Maps</a> <span class="dot">·</span> <a href="{IG}" target="_blank" rel="noopener">Instagram</a> <span class="dot">·</span> <a href="{FB}" target="_blank" rel="noopener">Facebook</a> <span class="dot">·</span> <a href="{LI}" target="_blank" rel="noopener">LinkedIn</a></p></div></div>
<p class="credits">City photography via Wikimedia Commons: <a href="https://commons.wikimedia.org/wiki/File:Dubai_skyline_unsplash.jpg" target="_blank" rel="noopener">Robert Bock</a> (CC0); <a href="https://commons.wikimedia.org/wiki/File:View_of_Dubai_(Unsplash_Zf8fagTPYTo).jpg" target="_blank" rel="noopener">Robert Bock</a> (CC0); <a href="https://commons.wikimedia.org/wiki/File:Dubai_Marina_Skyline.jpg" target="_blank" rel="noopener">Norlando Pobre</a> (CC BY 2.0); <a href="https://commons.wikimedia.org/wiki/File:Vereinigte_Arabische_Emirate_-_Atlantis_on_Palm_Jumeirah_-_%D8%A3%D8%AA%D9%84%D8%A7%D9%86%D8%AA%D9%8A%D8%B3_%D9%81%D9%8A_%D9%86%D8%AE%D9%84%D8%A9_%D8%AC%D9%85%D9%8A%D8%B1%D8%A7_-_panoramio.jpg" target="_blank" rel="noopener">giggel</a> (CC BY 3.0); <a href="https://commons.wikimedia.org/wiki/File:Dubai_Water_Canal_Business_Bay.jpg" target="_blank" rel="noopener">Iwona Rege</a> (CC BY-SA 4.0); <a href="https://commons.wikimedia.org/wiki/File:Emirates_Hills_Montgomerie_Lakeside.jpg" target="_blank" rel="noopener">Sev6nWiki</a> (CC BY-SA 4.0); <a href="https://commons.wikimedia.org/wiki/File:Mushrif_park,_Dubai_city,_UAE.jpg" target="_blank" rel="noopener">Tashmetova808</a> (CC BY-SA 4.0); <a href="https://commons.wikimedia.org/wiki/File:Dubai_at_sunrise_(Unsplash).jpg" target="_blank" rel="noopener">Piotr Chrobot chrumo</a> (CC0); <a href="https://commons.wikimedia.org/wiki/File:Sunset_captured_on_Dubai_Dunes_(Wide_Angle).jpg" target="_blank" rel="noopener">iMahesh</a> (CC BY-SA 4.0); <a href="https://commons.wikimedia.org/wiki/File:Boat_on_the_Burj_Khalifa_Lake_at_night.jpg" target="_blank" rel="noopener">Aleksandar Pasaric</a> (CC0); <a href="https://commons.wikimedia.org/wiki/File:Dubai_Night_Time_(Pexels-804915).jpg" target="_blank" rel="noopener">Zaib Azhar</a> (CC0); <a href="https://commons.wikimedia.org/wiki/File:Dubai_creek_harbour_skyline.jpg" target="_blank" rel="noopener">Dubai Creek Harbour skyline</a> (CC BY-SA 4.0); <a href="https://commons.wikimedia.org/wiki/File:Port_Rashid_Mina_Rashid.jpg" target="_blank" rel="noopener">Port Rashid, Mina Rashid</a> (CC BY-SA 4.0); <a href="https://commons.wikimedia.org/wiki/File:Meydan_Bridge-_Dubai.jpg" target="_blank" rel="noopener">Meydan Bridge</a> (public domain); <a href="https://commons.wikimedia.org/wiki/File:The_ELT%27s_basecamp_(dji-20240605185119-ang).jpg" target="_blank" rel="noopener">ESO/G. Vecchia</a> (CC BY 4.0).</p>
<div class="ftr-base"><span>© <span id="yr">2026</span> 7ei8ht6 Properties LLC. RERA ORN 12322.</span><span class="credit">Designed &amp; built by <a href="https://thetenderdesk.co.uk" target="_blank" rel="noopener">The Tender Desk</a></span></div></footer>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="app.js?v=13" defer></script><script src="ar.js?v=3" defer></script>
</body></html>"""

def subhero(kicker, en, ar, lead, img, alt):
    return f"""<section class="sub-hero"><div class="sub-bg" data-speed="0.22">{pic(img, alt, eager=True)}</div><div class="sub-shade"></div>
<div class="sub-in"><p class="kicker"><span>{kicker}</span></p>{bi(en, ar, "h1", "d1")}<p class="lead">{lead}</p></div></section>"""

def talk(kicker, en, ar, lead, ctas):
    return f'<section class="talk wrap">{STAR}<p class="kicker rv"><span>{kicker}</span></p>{bi(en, ar, "h2", "d1 rv")}<p class="lead rv">{lead}</p><div class="ctas rv">{ctas}</div></section>'

pages = {}
# ---------------------------------------------------------------- HOME
JOURNEY = [("I","Why Dubai","The tax position, residency and ownership rules, set out plainly with official sources.","invest-in-dubai.html#why"),
           ("II","How we work","One advisor, a private shortlist, viewings arranged around you, and registration at the Land Department.","invest-in-dubai.html#how"),
           ("III","Where to hold","Nine districts we know well, from the Burj Khalifa to the quiet villa streets near our office.","areas.html"),
           ("IV","Talk to an advisor","A short, confidential brief. We reply personally, usually the same working day.","contact.html")]
SERV = [("Acquisition advisory","Off-plan and ready. Shortlist, negotiation and transfer, with developer registration and escrow checked on off-plan.","x-lake-m","services.html#acquire"),
        ("Leasing &amp; yield management","Tenant search, Ejari, renewals and rent reviews, so the property earns without calls to you.","h2-m","services.html#lease"),
        ("Property management","Maintenance, inspections, service charges and owner statements, from people who answer the phone.","h3-m","services.html#manage"),
        ("Holiday homes","Short-term rental set-up and operation, for owners who prefer nightly income to an annual lease.","h4-m","services.html#holiday"),
        ("Commercial","Offices, showrooms, warehouses and land, for owner-occupiers and investors.","banner-m","services.html#commercial"),
        ("Labour camps","Staff and labour accommodation for contractors and companies, sourced, leased and managed.","s-camp-m","services.html#camps")]
AREAS = [("downtown","Downtown Dubai","وسط مدينة دبي","a-downtown","Evening over Downtown Dubai, the lake and the Burj Khalifa"),
         ("marina","Dubai Marina","دبي مارينا","a-marina","Towers of Dubai Marina along the water"),
         ("palm","Palm Jumeirah","نخلة جميرا","a-palm","The crescent of Palm Jumeirah seen from above"),
         ("business-bay","Business Bay","الخليج التجاري","a-bbay","Business Bay towers along the Dubai Water Canal at sunset"),
         ("dubai-hills","Dubai Hills","دبي هيلز","a-hills","Lakeside homes among palms and lawns in Dubai"),
         ("mirdif","Mirdif &amp; Nadd Al Hamar","مردف وند الحمر","a-mirdif","Mature trees and lawns in Mushrif Park, beside Mirdif"),
         ("creek-harbour","Dubai Creek Harbour","مرسى خور دبي","a-dch","Towers of Dubai Creek Harbour lit up over the marina at dusk"),
         ("mina-rashid","Mina Rashid","ميناء راشد","a-mina","Sunset over the harbour at Mina Rashid"),
         ("nad-al-sheba","Nad Al Sheba","ند الشبا","a-nas","The Meydan Bridge in Nad Al Sheba under a clear sky")]

home = f"""<section class="hero" id="hero">
<div class="hero-media">{pic("x-hero","Dubai skyline at night, the Burj Khalifa reflected in still water","hero-img",eager=True)}<canvas id="gl" aria-hidden="true"></canvas></div>
<div class="hero-shade"></div><div class="hero-sweep" aria-hidden="true"></div>
<div class="hero-copy"><p class="kicker"><span>Private property advisory</span><span>Dubai</span></p>
<h1 class="hero-t"><span class="ln"><span>Dubai property,</span></span><span class="ln"><span><em>held personally.</em></span></span></h1>
<p class="hero-ar" lang="ar" dir="rtl">شخصي وحصري</p>
<div class="hero-foot"><p class="lead">A {N}-person Dubai brokerage that works closely with a small number of clients at a time: buying, letting and looking after property for owners at home and abroad.</p>
<div class="ctas"><a class="btn" href="invest-in-dubai.html"><span>Invest in Dubai</span></a><a class="btn line light" href="contact.html"><span>Private consultation</span></a></div></div></div>
<div class="hero-meta" aria-hidden="true"><span>RERA ORN 12322</span><span>25.1886° N, 55.3850° E</span></div><div class="scroll-cue" aria-hidden="true"><i></i></div></section>

<section class="overture wrap">{STAR}
<p class="kicker rv"><span>The house view</span></p>
<p class="statement" data-words>We built this firm on two precepts. <em>Personal:</em> you deal with one advisor who knows your affairs. <em>Exclusive:</em> we only show you what fits the brief.</p>
<div class="ledger rv"><div><b>6,480</b><span>Properties rented by our team</span></div><div><b>4.6</b><span><a href="{MAPS}" target="_blank" rel="noopener">Rated on Google</a></span></div><div><b>12322</b><span>RERA office registration (ORN)</span></div></div></section>

<section class="journey"><div class="wrap"><div class="j-head"><p class="kicker rv"><span>The investor journey</span></p>{bi("From first question<br>to title deed.","من السؤال الأول<br>إلى سند الملكية","h2","d2 rv")}</div>
<ol class="j-list">{"".join(f'<li class="rv"><a href="{u}"><span class="j-n">{n}</span><span class="j-t">{t}</span><span class="j-d">{d}</span><i class="arr" aria-hidden="true"></i></a></li>' for n,t,d,u in JOURNEY)}</ol></div></section>

<section class="why-dubai">
<div class="wd-img" data-reveal><div class="px" data-speed="0.12">{pic("x-sunrise","Dubai at first light, towers rising through the morning haze")}</div></div>
<div class="wd-copy"><p class="kicker rv"><span>Why Dubai</span></p>{bi("Four facts that matter<br>to an international buyer.","أربع حقائق تهم<br>المستثمر الدولي","h2","d2 rv")}
<dl class="facts">
<div class="rv"><dt>0%</dt><dd>Personal income tax. The UAE does not levy income tax on individuals.</dd></div>
<div class="rv"><dt>AED 2M</dt><dd>The property investment from which an owner may be eligible for the UAE Golden Visa.</dd></div>
<div class="rv"><dt>Freehold</dt><dd>Foreign buyers may own outright in Dubai's designated freehold areas, with title issued by the Land Department.</dd></div>
<div class="rv"><dt>RERA</dt><dd>Brokers, developers and off-plan escrow accounts are regulated by the Real Estate Regulatory Agency.</dd></div></dl>
<a class="tl rv" href="invest-in-dubai.html">Read the investor brief, with sources</a></div></section>

<section class="services-list wrap"><div class="sl-head"><p class="kicker rv"><span>What we do</span></p>{bi("Six disciplines,<br>one relationship.","ستة تخصصات<br>وعلاقة واحدة","h2","d2 rv")}</div>
<ul class="sl">{"".join(f'<li class="rv"><a href="{u}" data-img="img/{im}.webp"><span class="sl-n">0{i+1}</span><span class="sl-t">{t}</span><span class="sl-d">{d}</span></a></li>' for i,(t,d,im,u) in enumerate(SERV))}</ul>
<div class="sl-float" aria-hidden="true"><img alt="" src="img/x-lake-m.webp"></div></section>

<section class="areas-mosaic"><div class="wrap am-head"><p class="kicker rv"><span>Where to hold</span></p>{bi("Nine districts we<br>know street by street.","تسع مناطق<br>نعرفها جيدًا","h2","d2 rv")}<a class="tl rv" href="areas.html">The area guide</a></div>
<div class="am wrap">{"".join(f'<a class="am-i am-{i+1}" href="areas.html#{k}" data-reveal>{pic(img, alt)}<span class="am-c"><span class="am-ar" lang="ar" dir="rtl">{ar}</span><span class="am-t">{t}</span></span></a>' for i,(k,t,ar,img,alt) in enumerate(AREAS))}</div></section>

<section class="team-band"><div class="wrap tb">
<div class="tb-copy"><p class="kicker rv"><span>The people</span></p>{bi(f"{N} people.<br>One advisor for you.",f"فريق من {N} شخصًا<br>ومستشار واحد لك","h2","d2 rv")}
<p class="body rv">Led by our founder, Fayyaz (Abu Mustafa) Sayani, and director Zahir Alimahomed. Every client is given one named advisor, reachable directly by phone, email and WhatsApp.</p><a class="tl rv" href="meet-the-team.html">Meet the team</a></div>
<div class="tb-faces" aria-hidden="true">{"".join(f'<img src="{img_for(k)}" alt="" loading="lazy" decoding="async">' for *_,k in TEAM[:9] if img_for(k))}</div></div></section>

<section class="viewing"><div class="v-bg" data-speed="0.18">{pic("x-lake","A lone abra on the lake beneath the Dubai Fountain at night")}</div><div class="v-shade"></div>
<div class="v-in wrap"><p class="kicker"><span>Concierge</span></p>{bi("Book a private viewing.","احجز معاينة خاصة","h2","d1")}
<p class="lead">Tell us what you are looking for and when you are in Dubai. We prepare a shortlist and a car between viewings, or a live video walkthrough if you are abroad.</p>
<div class="ctas"><a class="btn" href="contact.html#consult"><span>Begin your brief</span></a><a class="btn line light" href="{WA}?text=Hello%2C%20I%20would%20like%20to%20book%20a%20private%20viewing." target="_blank" rel="noopener"><span>WhatsApp an advisor</span></a></div></div></section>"""
pages["index.html"] = page("index.html","Home",
 "7ei8ht6 Properties: private property advisory in Dubai for international investors. Acquisition, leasing, management and holiday homes. RERA 12322.", home)

# ---------------------------------------------------------------- INVEST IN DUBAI
FACTS = [
 ("0%","No personal income tax","The UAE does not levy income tax on individuals. VAT at 5% applies to goods and services, and corporate tax applies to businesses, so structure matters if you buy through a company.","UAE Government portal, Taxation","https://u.ae/en/information-and-services/finance-and-investment/taxation","why"),
 ("AED 2M","Golden Visa through property","Real estate investors with a minimum capital of AED 2 million are eligible for a 5 year, renewable Golden Visa, which needs no sponsor and allows family members to be sponsored.","UAE Government portal, Golden visa","https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa",""),
 ("Freehold","Outright ownership in designated areas","In Dubai, foreign ownership is permitted in areas designated as freehold, whether or not the buyer lives in the UAE. Title deeds are issued by the Dubai Land Department.","UAE Government portal, Buying property in Dubai","https://u.ae/en/information-and-services/moving-to-the-uae/expatriates-buying-a-property-in-the-uae",""),
 ("4%","Dubai Land Department transfer fee","A transfer fee of 4% of the price is payable to the Dubai Land Department on registration, the rate set in 2013. Budget for it alongside agency and trustee fees.","Economy of Dubai, citing the DLD fee change","https://en.wikipedia.org/wiki/Economy_of_Dubai","costs"),
 ("RERA","Regulation and escrow","The Real Estate Regulatory Agency, part of the Dubai Land Department, licenses brokers, regulates developers and manages developers' trust accounts: the escrow that holds off-plan payments.","Real Estate Regulatory Agency","https://en.wikipedia.org/wiki/Dubai_Real_Estate_Regulatory_Agency",""),
]
HOW = [("The brief","A private conversation about what the property should do: income, residence, a family base, or all three. Budget, timing and how you will hold it."),
       ("The shortlist","A small, considered selection, ready and off-plan, drawn from the market and our own portfolio. Every option comes with our view, not only the brochure."),
       ("Private viewings","In person with a car between appointments, or by live video if you are abroad. We tell you what we see, including the reasons not to buy."),
       ("Diligence &amp; transfer","We check the developer and project registration, service charges and paperwork, then take you through registration and transfer at the Land Department."),
       ("Holding","Letting, management or holiday home operation, with statements you can read at a glance. The same advisor stays with you after the keys.")]
inv = subhero("Invest in Dubai","Invest in Dubai.","استثمر في دبي",
 "A plain account of why international buyers hold property in Dubai, what it costs, and how we take you from a first conversation to the title deed.","x-sunrise","Dubai at first light") + f"""
<nav class="toc wrap" aria-label="On this page"><a href="#why">Why Dubai</a><a href="#costs">What it costs</a><a href="#how">How we work</a><a href="#visa">Golden Visa</a><a href="#talk">Talk to an advisor</a></nav>
<section class="brief wrap"><div class="brief-side"><p class="kicker rv"><span>Why Dubai</span></p>{bi("The fundamentals,<br>with sources.","الأساسيات<br>مع المصادر","h2","d2 rv")}
<p class="body rv">We only state what can be checked. Each point links to its public source. Rules change, so we confirm the current position with you before any decision.</p></div>
<ol class="fact-list">{"".join(f'<li class="rv"{f" id={a}" if a else ""}><span class="fl-k">{n}</span><div><h3>{h}</h3><p>{d}</p><a class="src" href="{u}" target="_blank" rel="noopener">Source: {s}</a></div></li>' for n,h,d,s,u,a in FACTS)}</ol></section>

<section class="quote-band"><div class="wrap"><p class="statement" data-words>Dubai rewards <em>local knowledge</em> and punishes haste. Our role is to supply the first and prevent the second.</p></div></section>

<section class="how wrap" id="how"><div class="how-head"><p class="kicker rv"><span>How we work</span></p>{bi("Five stages.<br>One advisor throughout.","خمس مراحل<br>ومستشار واحد","h2","d2 rv")}</div>
<ol class="how-list">{"".join(f'<li class="rv"><span class="hn">{i+1:02d}</span><h3>{t}</h3><p>{d}</p></li>' for i,(t,d) in enumerate(HOW))}</ol></section>

<section class="visa" id="visa"><div class="visa-img" data-reveal><div class="px" data-speed="0.12">{pic("x-dunes","Sun setting over the dunes outside Dubai")}</div></div>
<div class="visa-copy"><p class="kicker rv"><span>Residency</span></p>{bi("The Golden Visa,<br>considered early.","الإقامة الذهبية","h2","d2 rv")}
<p class="body rv">If residence is part of the plan, it shapes what you buy. The UAE Golden Visa for real estate investors requires a minimum investment of AED 2 million and is issued for 5 years, renewable. We flag which options meet the threshold at the shortlist stage and introduce you to the right specialists for the application.</p>
<p class="small rv">Eligibility is decided by the UAE authorities. Nothing on this page is legal or tax advice.</p></div></section>
<div id="talk"></div>{talk("Next step","Talk to an advisor.","تحدث إلى مستشار","A confidential conversation with no obligation: at Amaya Plaza, by phone, or on a video call from wherever you are.",
 f'<a class="btn" href="contact.html#consult"><span>Begin your brief</span></a><a class="btn line" href="{WA}?text=Hello%2C%20I%20am%20interested%20in%20investing%20in%20Dubai." target="_blank" rel="noopener"><span>WhatsApp</span></a>')}"""
pages["invest-in-dubai.html"] = page("invest-in-dubai.html","Invest in Dubai",
 "Why international investors buy property in Dubai: 0% personal income tax, the Golden Visa from AED 2M, freehold ownership and RERA regulated escrow. With sources.", inv)

# ---------------------------------------------------------------- SERVICES
SV = [("acquire","Acquisition advisory","Off-plan and ready","x-lake",
  ["We search the whole market, not only our own listings, and narrow it to a shortlist you can decide from.",
   "For off-plan, we check that the developer and project are registered with RERA and that payments go to the project escrow account.",
   "We negotiate, prepare the paperwork and accompany you to registration and transfer at the Dubai Land Department."],
  "A lone abra on the lake beneath the Dubai Fountain"),
 ("lease","Leasing &amp; yield management","For owners who want the income, not the admin","h2",
  ["Tenant search, referencing and viewings, with Ejari registration of the tenancy contract.",
   "Renewals and rent reviews handled on time, with the market evidence in front of you.",
   "Straight advice on furnishing, pricing and presentation, so the property lets well and stays let."],
  "A contemporary villa with a pool"),
 ("manage","Property management","Looked after as if it were ours","h3",
  ["Maintenance through vetted contractors, periodic inspections, and move-in and move-out reports.",
   "Service charges, utilities and paperwork kept in order while you are abroad.",
   "Clear owner statements, and one person to call."],
  "A modern family home in Dubai"),
 ("holiday","Holiday homes","Short-term rental","h4",
  ["Setting up a holiday home: permits, furnishing advice, photography and listing.",
   "Guest communication, cleaning and turnover coordinated for you.",
   "A plain comparison with an annual lease before you commit, so the choice is made on numbers."],
  "An architect-designed home with a pool"),
 ("commercial","Commercial","Offices, showrooms, warehouses and land","banner",
  ["Sales and leasing of offices, showrooms, commercial villas, warehouses and land.",
   "For owner-occupiers, a search built around operations: access, parking, power and fit-out.",
   "For investors, the tenant and the lease terms read as carefully as the building."],
  "A feature property marketed by 7ei8ht6 Properties"),
 ("camps","Labour camps","Staff and labour accommodation","s-camp",
  ["Labour camps and staff accommodation for sale and lease, for contractors, facilities firms and growing companies.",
   "Matched to headcount, location and budget, with access to sites, transport links and the permits in order.",
   "For owners, tenants placed on clear contracts, with rent collection and maintenance handled."],
  "Aerial view of a staff accommodation camp in the desert")]
def simg(im, alt):
    return pic(im, alt) if im.startswith("x-") else pic(im, alt)
svc = subhero("Services","Six disciplines, one relationship.","خدماتنا",
 "Buying, letting, managing and operating property in Dubai, for owners who would rather have one trusted advisor than six suppliers.","x-night","Downtown Dubai at night") + f"""
<section class="svc wrap">{"".join(f'''<article class="svc-i {"flip" if i%2 else ""}" id="{k}"><div class="svc-img" data-reveal>{simg(im,alt)}</div>
<div class="svc-copy"><span class="svc-n rv">0{i+1}</span><p class="kicker rv"><span>{sub}</span></p><h2 class="d2 rv">{t}</h2><ul class="svc-pts">{"".join(f'<li class="rv">{p}</li>' for p in pts)}</ul>
<a class="tl rv" href="contact.html#consult">Speak to an advisor</a></div></article>''' for i,(k,t,sub,im,pts,alt) in enumerate(SV))}</section>
{talk("Portfolio","See what is available now.","العقارات المتاحة","Our current listings are published on Bayut. For anything not listed, ask your advisor.",
 f'<a class="btn" href="{BAYUT}" target="_blank" rel="noopener"><span>View Properties</span></a><a class="btn line" href="contact.html#consult"><span>Private consultation</span></a>')}"""
pages["services.html"] = page("services.html","Services",
 "Acquisition advisory (off-plan and ready), leasing and yield management, property management, holiday homes, commercial property and labour camps in Dubai.", svc)

# ---------------------------------------------------------------- AREAS
AREA_COPY = {
"downtown":("Home to the Burj Khalifa, the world's tallest building, with The Dubai Mall and the Dubai Fountain at its foot. Largely apartments, from compact units to penthouses, in a walkable centre developed by Emaar.","Buyers who want Dubai's most recognisable address, and the visitor demand that comes with it."),
"marina":("A waterfront district built around a man-made canal, lined with residential towers and the Marina Walk promenade, a short walk from the beach at JBR and served by tram and metro.","Apartment investors, and residents who want the water and the beach close by."),
"palm":("The palm-shaped island off Jumeirah: villas on the fronds with their own beach frontage, apartments along the trunk, and resort hotels on the crescent, Atlantis among them.","Family villas, trophy homes and beachfront apartments."),
"business-bay":("The business district beside Downtown, set along the Dubai Water Canal. Offices, hotels and apartment towers share the waterfront, with Downtown across the bridge.","Investors after central apartments, and companies looking for offices near the centre."),
"dubai-hills":("A master-planned community by Emaar and Meraas between Downtown and the Marina, laid out around an 18-hole championship golf course, with Dubai Hills Park and Dubai Hills Mall.","Families looking for villas and townhouses with green space, and buyers of new apartments."),
"creek-harbour":("A waterfront city by Emaar on Dubai Creek, beside the Ras Al Khor Wildlife Sanctuary, with apartment towers along the marina and promenade and Downtown ten minutes away.","Off-plan and new-apartment buyers who want water views and a growing community close to the centre."),
"mina-rashid":("The historic port beside Bur Dubai, reborn as a waterfront community by Emaar and P&amp;O Marinas, with a marina, apartment towers and the Queen Elizabeth 2 moored as a hotel.","Buyers who want marina living and sea views close to old Dubai and the city's core."),
"nad-al-sheba":("Low-rise villa communities around Meydan and its racecourse, with the Dubai Water Canal close by and quick routes to Downtown and Business Bay.","Families after new villas and townhouses with space, ten minutes from the centre."),
"mirdif":("Established, low-rise neighbourhoods near Dubai International Airport: villas and townhouses, Mirdif City Centre, and the wide lawns of Mushrif Park. Our office is here, at Amaya Plaza.","Families who want space and quiet streets, and landlords who want steady long-term tenants."),
}
areas = subhero("Area guide","Dubai, district by district.","مناطق دبي",
 "Nine districts we know well. Each has a different buyer, a different tenant and a different reason to hold.","x-hero","Dubai skyline at night") + f"""
<nav class="toc wrap" aria-label="Districts">{"".join(f'<a href="#{k}">{t}</a>' for k,t,*_ in AREAS)}</nav>
<section class="area-chapters wrap">{"".join(f'''<article class="ach {"flip" if i%2 else ""}" id="{k}"><div class="ach-img" data-reveal><div class="px" data-speed="0.1">{pic(img,alt)}</div></div>
<div class="ach-copy"><span class="ach-n rv">{i+1:02d} / {len(AREAS):02d}</span><p class="ach-ar rv" lang="ar" dir="rtl">{ar}</p><h2 class="d2 rv">{t}</h2><p class="body rv">{AREA_COPY[k][0]}</p>
<p class="ach-fit rv"><span>Suited to</span>{AREA_COPY[k][1]}</p><a class="tl rv" href="contact.html#consult">Ask about {t}</a></div></article>''' for i,(k,t,ar,img,alt) in enumerate(AREAS))}</section>
{talk("Not sure where to start?","We will tell you where we would buy.","أين نشتري نحن","Tell us your budget and what the property should do for you. We will give you a straight view on districts, including the ones to avoid.",
 '<a class="btn" href="contact.html#consult"><span>Begin your brief</span></a>')}"""
pages["areas.html"] = page("areas.html","Area Guide",
 "A guide to Downtown Dubai, Dubai Marina, Palm Jumeirah, Business Bay, Dubai Hills and Mirdif, from a RERA registered Dubai brokerage.", areas)

# ---------------------------------------------------------------- TEAM
RERA_UNTIL = "saoud"
def rera_upto(k):
    keys = [t[4] for t in TEAM]
    if k == "shabnam" or keys.index(k) > keys.index(RERA_UNTIL):
        return ""
    return rera(k)

WA_OVERRIDE = {"rimnaz": "056 372 7202"}
LANDLINE_FROM = "zain"
def contact_line(n, p, k):
    keys = [t[4] for t in TEAM]
    if keys.index(k) >= keys.index(LANDLINE_FROM):
        return f'<a href="tel:{tel("04 443 9780")}">{intl("04 443 9780")}</a>'
    wa = WA_OVERRIDE.get(k, p)
    return f'<a href="tel:{tel(p)}">{intl(p)}</a>{wa_link(wa,n)}'

def wa_link(p, n):
    d = re.sub(r"\D", "", p)
    return f'<a href="https://wa.me/971{d[1:]}" target="_blank" rel="noopener" aria-label="WhatsApp {n}">WhatsApp</a>' if d.startswith("05") else ""
lead_, rest = TEAM[:1], TEAM[1:]
leaders = "".join(f"""<article class="leader rv"><div class="ph"><img src="{img_for(k)}" alt="Portrait of {n}" loading="lazy" decoding="async"></div>
<div class="ld-c"><p class="kicker"><span>{r}</span></p><h2 class="d2">{n}</h2>{rera(k)}<p class="mc"><a href="tel:{tel(p)}">{intl(p)}</a><a href="mailto:{e}@7ei8ht6properties.com">{e}@7ei8ht6properties.com</a>{wa_link(p,n)}</p></div></article>""" for n,r,p,e,k in lead_)
cards = "".join(f"""<article class="member" data-role="{html.escape(r)}" data-name="{n.lower()}"><div class="ph"><img src="{img_for(k) or 'img/logo.png'}" alt="Portrait of {n}" loading="lazy" decoding="async"></div>
<div class="mi"><h3>{n}</h3><p class="role">{r}</p>{rera_upto(k)}<p class="mc">{contact_line(n,p,k)}</p></div></article>""" for n,r,p,e,k in rest)
roles = sorted({r for _,r,*_ in rest}, key=lambda r: [x[1] for x in rest].index(r))
team = subhero("The team",f"{N} people.<br>One advisor for you.","فريقنا",
 "Every client is given one named advisor. You can reach any of us directly: the numbers below are our own.","x-night","Downtown Dubai at night") + f"""
<section class="leaders solo wrap">{leaders}</section>
<section class="team wrap"><div class="filters" role="group" aria-label="Filter the team">
<button class="chip on" data-f="all">Everyone ({len(rest)})</button>{''.join(f'<button class="chip" data-f="{html.escape(r)}">{r}</button>' for r in roles)}
<label class="search"><span class="sr">Search the team</span><input type="search" id="tsearch" placeholder="Search by name"></label></div>
<div class="grid">{cards}</div><p class="empty" hidden>No one matches that search.</p></section>
{talk("Where to begin","Not sure who to call?","لا تعرف بمن تتصل؟","Start a brief and we will match you with the right advisor.",'<a class="btn" href="contact.html#consult"><span>Begin your brief</span></a>')}"""
pages["meet-the-team.html"] = page("meet-the-team.html","The Team",
 f"Meet the {N} people of 7ei8ht6 Properties in Dubai, led by founder Fayyaz (Abu Mustafa) Sayani. Direct numbers for every advisor.", team)

# ---------------------------------------------------------------- CONSULTATION
def radios(name, opts, req=True):
    return "".join(f'<label class="opt"><input type="radio" name="{name}" value="{html.escape(o)}"{" required" if req and i==0 else ""}><span>{o}</span></label>' for i,o in enumerate(opts))
BUDGET = ["Up to AED 1M","AED 1M to 2M","AED 2M to 5M","AED 5M to 10M","AED 10M to 25M","Above AED 25M"]
steps = [
 ("Intent","What is the property for?", '<div class="opts">'+radios("Intent",["To invest","To live in","Both"])+'</div>'
   +'<p class="q2">Ready or off-plan?</p><div class="opts">'+radios("Stage",["Ready","Off-plan","Open to both"],False)+'</div>'),
 ("Budget","Your budget, in AED.", '<div class="opts two">'+radios("Budget",BUDGET)+'</div>'),
 ("Timing","When would you like to act?", '<div class="opts two">'+radios("Timeline",["Within 3 months","3 to 6 months","6 to 12 months","Exploring for now"])+'</div>'
   +'<p class="q2">Districts of interest</p><div class="opts two chk">'+"".join(f'<label class="opt"><input type="checkbox" name="Areas" value="{t}"><span>{t}</span></label>' for _,t,*_ in AREAS)+'<label class="opt"><input type="checkbox" name="Areas" value="Open to advice"><span>Open to advice</span></label></div>'),
 ("Residency","Nationality and residency.", '<div class="fg"><label class="f"><span>Nationality</span><input type="text" name="Nationality" autocomplete="off"></label>'
   +'<label class="f"><span>Country of residence</span><input type="text" name="Residence" autocomplete="country-name"></label></div>'
   +'<p class="q2">Is the UAE Golden Visa part of your plan?</p><div class="opts">'+radios("Golden Visa",["Yes","Possibly, tell me more","No"],False)+'</div>'),
 ("Details","How should we reach you?", '<div class="fg"><label class="f"><span>Full name *</span><input type="text" name="Name" required autocomplete="name"></label>'
   +'<label class="f"><span>Email *</span><input type="email" name="Email" required autocomplete="email"></label>'
   +'<label class="f"><span>Phone, with country code</span><input type="tel" name="Phone" autocomplete="tel" placeholder="+971"></label></div>'
   +'<p class="q2">Preferred contact</p><div class="opts">'+radios("Contact by",["WhatsApp","Phone call","Email"],False)+'</div>'
   +'<label class="opt wide"><input type="checkbox" name="Private viewing" value="Yes, please arrange a private viewing"><span>Please arrange a private viewing when I am in Dubai</span></label>'
   +'<label class="f wide"><span>Anything else we should know</span><textarea name="Notes" rows="3"></textarea></label>'),
]
form = f"""<form class="consult" id="consult-form" data-subject="Private consultation request" novalidate>
<div class="c-prog" aria-hidden="true"><div class="c-bar"><i></i></div><span class="c-count"><b>01</b> / 0{len(steps)}</span><span class="c-lab">{steps[0][0]}</span></div>
<div class="c-steps">{"".join(f'<fieldset class="c-step{" on" if i==0 else ""}" data-i="{i}" data-t="{t}"><legend class="d3">{q}</legend>{body}</fieldset>' for i,(t,q,body) in enumerate(steps))}</div>
<p class="ferr" role="alert"></p>
<div class="c-nav"><button type="button" class="btn line c-back" hidden><span>Back</span></button><button type="button" class="btn c-next"><span>Continue</span></button>
<button type="submit" class="btn c-send" hidden><span>Send my brief</span></button><a class="btn line c-wa" hidden href="{WA}" target="_blank" rel="noopener"><span>Send by WhatsApp</span></a></div>
<p class="fnote">Sending opens your email app with your brief addressed to {EMAIL}. Your details are used only to reply to you.</p>
<div class="c-done" hidden><p class="kicker"><span>Thank you</span></p><h3 class="d2">Your brief is ready to send.</h3><p class="body">If your email app did not open, write to <a href="mailto:{EMAIL}">{EMAIL}</a> or message us on WhatsApp. An advisor will reply personally.</p></div></form>"""
con = subhero("Private consultation","A private consultation.","استشارة خاصة",
 "Five short questions, in confidence. We reply personally, usually the same working day.","x-lake","The lake beneath the Dubai Fountain at night") + f"""
<section class="consultation wrap" id="consult"><div class="c-side">
<p class="kicker rv"><span>Your brief</span></p><p class="body rv">The more we know, the shorter the shortlist. Nothing here commits you to anything.</p>
<div class="c-direct rv"><p class="kicker"><span>Or speak now</span></p><a href="{WA}?text=Hello%207ei8ht6%20Properties%2C%20I%20would%20like%20a%20private%20consultation." target="_blank" rel="noopener">WhatsApp {MOB}</a><a href="tel:{PHONE_T}">Office {PHONE}</a><a href="mailto:{EMAIL}">{EMAIL}</a></div></div>
<div class="c-main">{form}</div></section>
<section class="visit"><div class="wrap visit-in"><div class="visit-copy"><p class="kicker rv"><span>Visit</span></p>{bi("Amaya Plaza,<br>Nadd Al Hamar.","أمايا بلازا<br>ند الحمر","h2","d2 rv")}
<p class="body rv">Office 14, Amaya Plaza, Nadd Al Hamar, Dubai. Appointments are best, though you are welcome to call in.</p>
<dl class="kv rv"><div><dt>RERA</dt><dd>Registered broker, ORN 12322</dd></div><div><dt>Phone</dt><dd><a href="tel:{PHONE_T}">{PHONE}</a></dd></div><div><dt>Email</dt><dd><a href="mailto:{EMAIL}">{EMAIL}</a></dd></div></dl>
<a class="tl rv" href="{MAPS}" target="_blank" rel="noopener">Directions in Google Maps</a></div>
<div class="map rv"><iframe title="Map showing Amaya Plaza, Nadd Al Hamar, Dubai" src="https://maps.google.com/maps?q=7EI8HT6%20PROPERTIES%20LLC%2C%20Amaya%20Plaza%2C%20Nadd%20Al%20Hamar%2C%20Dubai&amp;z=16&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></section>"""
pages["contact.html"] = page("contact.html","Private Consultation",
 "Arrange a private consultation or viewing with 7ei8ht6 Properties, Amaya Plaza, Nadd Al Hamar, Dubai. Call +971 4 443 9780 or WhatsApp +971 50 646 8786.", con)

# ---------------------------------------------------------------- CAREERS
car = subhero("Careers","Join the house.","انضم إلينا",
 "7ei8ht6 Properties is growing every year. We look for consultants who take pride in the work and want to keep learning.","x-sunrise","Dubai at first light") + f"""
<section class="brief wrap"><div class="brief-side"><p class="kicker rv"><span>Who we look for</span></p><h2 class="d2 rv">People from diverse backgrounds, serious about the work.</h2></div>
<div class="body-col"><p class="body rv">Our team consists of talented and experienced property consultants who take pride and passion with them to each viewing. We look for individuals who show a desire to keep learning, to develop and to be proactive.</p>
<p class="body rv">If you are looking for a role within the UAE real estate sector and are serious about your career, send us your CV.</p>
<div class="ctas rv"><a class="btn" href="mailto:{EMAIL}?subject=CV%20submission%3A%20Careers&amp;body=Hello%207ei8ht6%20Properties%2C%0A%0APlease%20find%20my%20CV%20attached.%0A%0AName%3A%0APhone%3A%0ARole%20of%20interest%3A%0A"><span>Email your CV</span></a></div>
<p class="fnote rv">Opens your email app addressed to {EMAIL}. Attach your CV before sending.</p></div></section>"""
pages["careers.html"] = page("careers.html","Careers","Careers at 7ei8ht6 Properties LLC: join our team of property consultants in Dubai.", car)

pages["404.html"] = page("404.html","Page not found","This page has moved. Find your way back to 7ei8ht6 Properties.",
 f'<section class="nf wrap">{STAR}<p class="kicker"><span>404</span></p><h1 class="d1">This address is not on the map.</h1><p class="lead">The page may have moved when our new site launched.</p><div class="ctas"><a class="btn" href="index.html"><span>Return home</span></a><a class="btn line" href="contact.html"><span>Private consultation</span></a></div></section>')

REDIR = {"why-choose-us.html":"index.html","tenants.html":"services.html#lease","landlords.html":"services.html#manage"}
bad = []
for k, v in pages.items():
    if re.search("[\u2013\u2014]", v): bad.append(k)
    (OUT / k).write_text(v)
for k, t in REDIR.items():
    (OUT / k).write_text(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Moved | 7ei8ht6 Properties</title><link rel="canonical" href="{BASE}{t.split("#")[0]}"><meta http-equiv="refresh" content="0; url={t}"><link rel="icon" href="favicon.svg"></head><body><p><a href="{t}">This page has moved.</a></p></body></html>')
urls = "".join(f"<url><loc>{BASE}{'' if k=='index.html' else k}</loc></url>" for k in pages if k != "404.html")
(OUT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>')
if bad: raise SystemExit(f"DASHES FOUND IN {bad}")
print("built", list(pages))
