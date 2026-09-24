"""Generates the static pages for thetenderdesk.co.uk (shared header/footer).
Output is plain HTML committed to the repo; the live site needs no build step."""
import json, pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://thetenderdesk.co.uk"
PHONE_H, PHONE_T = "07534 458327", "+447534458327"
EMAIL = "hello@thetenderdesk.co.uk"

MARK = ('<svg class="brand__mark" viewBox="0 0 34 34" aria-hidden="true" focusable="false">'
        '<rect width="34" height="34" rx="9" fill="#15171b"/>'
        '<path d="M9 12h16M17 12v12" stroke="#f4f0e7" stroke-width="3" stroke-linecap="round" fill="none"/>'
        '<circle cx="25" cy="24" r="3" fill="#ff5b2e"/></svg>')

SITES = [
    dict(slug="crumble-and-co", name="Crumble &amp; Co", sector="Dessert parlour", label="Concept for a real Aldershot dessert shop",
         desc="A concept built for a real dessert shop on Union Street. Real menu and hours, a build-your-own dessert with a live price, and every order button pointing at the shop's existing ordering system."),
    dict(slug="fadehouse", name="Fade House Barbers", sector="Barber", label="Demo build",
         desc="A bold, dark site for a fictional barber. Services and prices up front, and a booking flow that takes about thirty seconds on a phone."),
    dict(slug="flowright", name="FlowRight Plumbing &amp; Heating", sector="Plumbing and heating", label="Demo build",
         desc="A fictional local plumber. Fixed prices, a clear emergency call button, and the areas covered spelled out so people know straight away."),
    dict(slug="ironcore", name="IronCore Fitness", sector="Gym", label="Demo build",
         desc="A fictional strength gym. Class timetable, membership options and a free trial sign up, built to feel as loud as the gym floor."),
    dict(slug="sourdough", name="Rise &amp; Crust Bakery", sector="Bakery", label="Demo build",
         desc="A fictional sourdough bakery with a full menu and order-for-collection, warm and simple like the shop itself."),
]

NAV = [("/#services", "Services", "home"), ("/#tenders", "Tenders", "home"), ("/work/", "Our work", "work"),
       ("/pricing/", "Pricing", "pricing"), ("/#faq", "FAQ", "home")]


def head(title, desc, path, extra=""):
    url = SITE + path
    return f"""<!doctype html>
<html lang="en-GB" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#f4f0e7">
<meta property="og:type" content="website">
<meta property="og:site_name" content="The Tender Desk">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The Tender Desk: tenders, websites and AI automation for local businesses">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/img/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/bricolage-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css">
<script type="module" src="/assets/js/main.js"></script>
{extra}</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
"""


def header(active):
    cur = ' aria-current="page"'
    items = "".join(
        f'<li><a class="nav__link" href="{h}"{cur if (k == active and k != "home") else ""}>{t}</a></li>'
        for h, t, k in NAV)
    return f"""<header class="site-header">
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="The Tender Desk, home">{MARK}<span>The Tender Desk</span></a>
    <nav class="nav" aria-label="Main">
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-panel"><span class="nav__toggle-bars" aria-hidden="true"></span>Menu</button>
      <div class="nav__panel" id="nav-panel">
        <ul class="nav__list">{items}</ul>
        <a class="btn btn--small" href="/#contact">Get in touch</a>
      </div>
    </nav>
  </div>
</header>
"""


FOOTER = f"""<footer class="site-footer on-ink">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__col">
        <a class="brand" href="/">{MARK}<span>The Tender Desk</span></a>
        <p class="mt-s muted">Tenders, websites and AI automation for local businesses. A trading name of Yusuf Imthiyas, sole trader. Aldershot, Hampshire.</p>
      </div>
      <div class="footer__col">
        <h2>Services</h2>
        <ul><li><a href="/#tenders">Tenders and bid writing</a></li><li><a href="/#websites">Websites</a></li><li><a href="/#automation">AI automation</a></li><li><a href="/pricing/">Pricing</a></li></ul>
      </div>
      <div class="footer__col">
        <h2>See</h2>
        <ul><li><a href="/work/">Example sites</a></li><li><a href="/#how">How it works</a></li><li><a href="/#faq">Questions</a></li></ul>
      </div>
      <div class="footer__col">
        <h2>Contact</h2>
        <ul><li><a href="tel:{PHONE_T}">{PHONE_H}</a></li><li><a href="mailto:{EMAIL}">{EMAIL}</a></li><li>Monday to Friday, 9am to 5pm</li></ul>
      </div>
    </div>
    <p class="footer__big" aria-hidden="true">More work in. <span class="serif">Less admin.</span></p>
    <div class="footer__sources" id="sources">
      <p>Figures on this site: <sup>1</sup> British Chambers of Commerce and Tussell SME Procurement Tracker, May 2026 (£45.2bn, six year high). <sup>2</sup> Notice counts taken from the government's <a href="https://www.find-tender.service.gov.uk/" rel="noopener">Find a Tender</a> service for the week to 14 September 2026. Bid consultancy prices from published UK rate cards, 2026.</p>
      <p>&copy; <span data-year>2026</span> The Tender Desk. Example sites on this website are demo builds, not client work.</p>
    </div>
  </div>
</footer>
</body>
</html>
"""


def cta_band(title="Tell us what you need.", text="A free first conversation, no obligation and no card needed."):
    return f"""<section class="section section--tight">
  <div class="container">
    <div class="cta-band on-dark reveal">
      <div class="stack"><h2 class="h2">{title}</h2><p class="lede">{text}</p></div>
      <div class="btn-row"><a class="btn btn--signal" href="/#contact">Get in touch <span class="btn__arrow" aria-hidden="true">→</span></a><a class="btn btn--ghost" href="tel:{PHONE_T}">Call {PHONE_H}</a></div>
    </div>
  </div>
</section>
"""


def price(name, amount, unit, then, items, cta, need, hot=False, badge=""):
    lis = "".join(f"<li>{i}</li>" for i in items)
    b = f'<span class="tag tag--signal price__badge">{badge}</span>' if badge else ""
    return f"""<article class="price{' price--hot' if hot else ''}">{b}
  <h4 class="price__name">{name}</h4>
  <p class="price__amount">{amount} <small>{unit}</small></p>
  <p class="price__then">{then}</p>
  <ul class="ticks">{lis}</ul>
  <a class="btn{'' if hot else ' btn--ghost'}" href="/#contact" data-need="{need}">{cta}</a>
</article>"""


PRICING = f"""<div class="price-group reveal">
  <div class="price-group__title"><h3>Websites and AI automation</h3><p class="muted">Fixed setup fee, then a simple monthly price. Cancel any month.</p></div>
  <div class="prices">
    {price("Website", "£99", "setup", "Then £25 a month. Hosting, updates and support included.", ["Fast, mobile-friendly site", "Contact form and Google Maps", "Domain and hosting sorted", "Small updates each month"], "Get a website", "website")}
    {price("Website + AI", "£199", "setup", "Then £45 a month. Everything in Website, plus:", ["Chat assistant for enquiries and FAQs", "Online booking", "Instant replies to new enquiries", "Automatic Google review requests"], "Get the full setup", "several", hot=True, badge="Most complete")}
    {price("AI add-on", "£99", "setup", "Then £29 a month. For a site you already have.", ["Chat assistant on your current site", "Instant enquiry replies", "Review requests", "Up to 500 chats a month included"], "Add AI to my site", "automation")}
  </div>
</div>
<div class="price-group reveal">
  <div class="price-group__title"><h3>Tenders</h3><p class="muted">No contract, no notice period, no percentage of the contract value.</p></div>
  <div class="prices">
    {price("Tender Desk", "£249", "/ month", "Rolling monthly. Cancel any time.", ["Daily monitoring of every relevant portal", "Weekly shortlist with plain summaries", "Deadline reminders", "Bid writing from £750 per bid"], "Start this month", "tenders", hot=True)}
    {price("Bid Build", "£750", "/ bid", "£1,500 for a full tender response.", ["Every question answered from your evidence", "Method statements and social value written", "You review before anything is sent", "Half on start, half on submission"], "Ask about a bid", "bid")}
    {price("Tender Ready Pack", "£350", "one off", "Written once, reused in every bid.", ["The policies every buyer asks for", "Insurance and accreditation summary", "Standard method statements", "Social value statement"], "Get tender ready", "tenders")}
  </div>
</div>"""

FAQS = [
    ("Are these contracts really open to a firm my size?", "Yes. Buyers mark many notices as suitable for small and medium firms, and the government has a published plan to send more work their way. Small and medium firms took £45.2 billion of public spend in 2025. The contracts we send you are filtered by value so you only see work you could deliver with the staff you have."),
    ("Why would I pay when the portals are free?", "They are free, and unusable at volume. There were 456 live tender notices in one week. Sorting those to the handful that fit your trade, your area and your size takes a few hours every week, and then you still have the questionnaire to answer. That is the job you are paying for."),
    ("How much of my time does this take?", "Around ten minutes a week to read the shortlist, and one short call a month. When you decide to bid, expect an hour of your time to pull together evidence and to check the draft before it goes."),
    ("What if I have never bid for public work before?", "That is the normal starting point. The first job is getting you registered and tender ready, which is a one off. After that you are eligible for everything your trade covers."),
    ("Do you use AI?", "Yes, for reading the notices and for first drafts. Every line is checked by a person against your own documents before anything reaches you or a buyer. That is how the price stays where it is."),
    ("Can I use just a website or just automation, without tenders?", "Yes. Each service stands on its own. Plenty of businesses only need a better website or faster replies to enquiries."),
    ("Are the sites on your work page real clients?", "No. They are example sites we built as demos so you can see the quality before deciding anything. Crumble &amp; Co is a concept we made for a real Aldershot dessert shop; the others are fictional businesses."),
    ("Will an AI assistant say the wrong thing to my customers?", "It is set up to answer from information you give it and to pass anything it is unsure of to you. You see and approve what it says before it goes live."),
    ("How do I pay, and can I stop?", "Card or direct debit, monthly. Stop whenever you like, with no notice period and no exit fee. Bids are quoted as a fixed fee, half up front."),
]


def faq_html():
    return "".join(f"<details><summary>{q}</summary><div><p>{a}</p></div></details>" for q, a in FAQS)


def faq_jsonld():
    import re
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q.replace("&amp;", "&"), "acceptedAnswer": {"@type": "Answer", "text": a.replace("&amp;", "&")}} for q, a in FAQS]}


BUSINESS = {
    "@context": "https://schema.org", "@type": "ProfessionalService", "@id": SITE + "/#business",
    "name": "The Tender Desk", "url": SITE + "/", "email": EMAIL, "telephone": PHONE_T,
    "image": SITE + "/assets/img/og.png", "logo": SITE + "/assets/img/apple-touch-icon.png",
    "description": "Tenders, bid writing, websites and AI automation for local businesses.",
    "founder": {"@type": "Person", "name": "Yusuf Imthiyas"},
    "address": {"@type": "PostalAddress", "addressLocality": "Aldershot", "addressRegion": "Hampshire", "addressCountry": "GB"},
    "areaServed": ["Aldershot", "Hampshire", "Surrey", "United Kingdom"],
    "openingHoursSpecification": [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "17:00"}],
    "priceRange": "££",
    "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Services", "itemListElement": [
        {"@type": "Offer", "name": n, "price": p, "priceCurrency": "GBP", "description": d} for n, p, d in [
            ("Website", "99", "£99 setup, then £25 a month"), ("Website + AI", "199", "£199 setup, then £45 a month"),
            ("AI add-on", "99", "£99 setup, then £29 a month"), ("Tender Desk", "249", "£249 a month, rolling"),
            ("Bid Build", "750", "£750 per bid, £1,500 for a full tender response"), ("Tender Ready Pack", "350", "£350 one off")]]},
}


def ld(obj):
    return f'<script type="application/ld+json">{json.dumps(obj, ensure_ascii=False)}</script>\n'


def thumb(slug, sizes, eager=False):
    load = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<img src="/work/thumbs/{slug}.webp" srcset="/work/thumbs/{slug}-640.webp 640w, /work/thumbs/{slug}.webp 1200w" '
            f'sizes="{sizes}" width="1200" height="825" {load} decoding="async" alt="">')


def work_card(s, feature=False, h="h2"):
    return f"""<article class="work-card{' work-card--feature' if feature else ''} reveal">
  <div class="work-card__media">{thumb(s['slug'], '(min-width: 900px) 60vw, 100vw' if feature else '(min-width: 1100px) 380px, (min-width: 760px) 50vw, 100vw')}</div>
  <div class="work-card__body">
    <div class="work-card__meta"><span class="tag">{s['sector']}</span><span class="tag {'tag--signal' if s['slug']=='crumble-and-co' else 'tag--mint'}">{s['label']}</span></div>
    <{h}>{s['name']}</{h}>
    <p>{s['desc']}</p>
    <a class="work-card__link" href="/work/{s['slug']}/">View the {'concept' if s['slug']=='crumble-and-co' else 'demo'}<span class="visually-hidden">: {s['name']}</span> <span aria-hidden="true">→</span></a>
  </div>
</article>"""


# ---------------------------------------------------------------- Home page
def home():
    services = [
        ("Tenders", "We watch every public contract portal daily, send you only the contracts worth your time, and write the bid with you from your own evidence.", "#tenders", "How tenders work"),
        ("Websites", "Fast, modern websites that work properly on a phone, tell people clearly what you do, and make it easy to call or enquire.", "#websites", "About websites"),
        ("AI automation", "A chat assistant on your site for enquiries and bookings, automatic replies so nobody waits, review requests after each job, and less time on routine admin.", "#automation", "About automation"),
    ]
    svc = "".join(f"""<a class="service reveal" href="{h}"><span class="service__num" aria-hidden="true">0{i+1}</span><h3 class="h3">{t}</h3><p class="muted">{d}</p><span class="service__link">{l} <span aria-hidden="true">→</span></span></a>""" for i, (t, d, h, l) in enumerate(services))
    mosaic = "".join(f'<a href="/work/{s["slug"]}/"><img src="/work/thumbs/{s["slug"]}-640.webp" width="640" height="440" loading="lazy" decoding="async" alt="Screenshot of the {s["name"]} {"concept" if s["slug"]=="crumble-and-co" else "demo"} site"></a>' for s in SITES[:4])
    body = f"""{header('home')}
<main id="main">
<section class="hero" aria-labelledby="hero-title">
  <div class="hero__bg" aria-hidden="true"></div>
  <div class="container hero__grid">
    <div>
      <p class="eyebrow">For local businesses with 1 to 30 staff</p>
      <h1 id="hero-title" class="display hero__title mt-m">More work&nbsp;in.<br> <span class="serif">Less admin.</span></h1>
      <p class="lede hero__lede">We find public contracts you can win and write the bid with you. We build fast, modern websites. And we set up simple AI tools that answer enquiries and take care of routine admin.</p>
      <div class="btn-row hero__cta"><a class="btn btn--signal" href="#contact">Talk to us <span class="btn__arrow" aria-hidden="true">→</span></a><a class="btn btn--ghost" href="#services">See what we do</a></div>
      <p class="hero__note small muted">Free first conversation. No obligation, no card needed.</p>
    </div>
    <aside class="feed" aria-label="Examples of contracts published this month">
      <div class="feed__head"><span>Published this month</span><span class="feed__live">From Find a Tender</span></div>
      <ul class="feed__list">
        <li class="ticket"><p class="ticket__title">Communal cleaning, three lots <span class="tag tag--mint">SME suitable</span></p><p class="ticket__meta">Southdown Housing Association, Sussex · £800,000 · scored 60% on quality</p></li>
        <li class="ticket"><p class="ticket__title">Grass cutting and pitch maintenance</p><p class="ticket__meta">Lancing Parish Council · £30,000 over five years · tender by email</p></li>
        <li class="ticket"><p class="ticket__title">Community centre refurbishment</p><p class="ticket__meta">Hedge End Town Council, Hampshire · £144,000 · closes 19 October</p></li>
      </ul>
      <p class="feed__foot">Three of 172 contracts published in one week in these trades. Most never reach the firms they were meant for.</p>
    </aside>
  </div>
</section>

<section class="section section--rule" id="services" aria-labelledby="services-title">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">What we do</p><h2 id="services-title" class="h2">Three services, <span class="serif">one desk.</span></h2><p class="lede">Use one, or use all three. Each is priced on its own and you can stop at any time.</p></div>
    <div class="grid grid--3 services">{svc}</div>
  </div>
</section>

<section class="section section--tight" id="how" aria-labelledby="how-title">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">How it works</p><h2 id="how-title" class="h2">Simple from the <span class="serif">first call.</span></h2></div>
    <ol class="flow reveal">
      <li><span class="flow__n">1</span><h3>A short call</h3><p>Free and with no obligation. You tell us what you need, we tell you honestly whether we can help.</p></li>
      <li><span class="flow__n">2</span><h3>A fixed price</h3><p>You get the price from the list below before anything starts. No surprises and no contract.</p></li>
      <li><span class="flow__n">3</span><h3>We do the work</h3><p>Registration, the site build or the automation setup. You approve everything before it goes live or goes to a buyer.</p></li>
      <li><span class="flow__n">4</span><h3>We keep it running</h3><p>Weekly shortlists, site updates and support, month to month. Stop whenever you like.</p></li>
    </ol>
  </div>
</section>

<section class="section on-dark" id="tenders" aria-labelledby="tenders-title">
  <div class="container">
    <div class="stats reveal">
      <div class="stat"><p class="stat__num">£45.2bn<sup><a href="#sources" aria-label="Source 1">1</a></sup></p><p>spent with small and medium firms by the UK public sector in 2025, a six year high</p></div>
      <div class="stat"><p class="stat__num">172<sup><a href="#sources" aria-label="Source 2">2</a></sup></p><p>live contracts in cleaning, grounds, maintenance, catering, care, security and waste in a single week</p></div>
      <div class="stat"><p class="stat__num">60%</p><p>of the marks on a typical contract go to written answers, not to the lowest price</p></div>
    </div>
    <div class="section-head mt-xl reveal"><p class="eyebrow">Tenders: the problem</p><h2 id="tenders-title" class="h2">It is not the quality of your work.</h2><p class="lede">You lose these contracts before anyone reads a word about you. Here is where it actually goes wrong.</p></div>
    <ol class="steps reveal">
      <li class="step"><h3>You never see them</h3><p>Since February 2025 buyers publish on the government's Central Digital Platform. If nobody checks it daily for your trade and your patch, the contract is awarded before you knew it existed.</p></li>
      <li class="step"><h3>The forms stop you</h3><p>Selection questionnaires, method statements, social value, policies, insurance evidence. None of it is hard once it is written down properly. It just never gets written down.</p></li>
      <li class="step"><h3>Help is priced for someone else</h3><p>Bid consultancies charge £450 to £750 a day and £2,000 to £8,000 a tender. That works for a firm with a hundred staff. It does not work for you.</p></li>
    </ol>
    <div class="section-head mt-xl reveal"><p class="eyebrow">Tenders: how it works</p><h2 class="h2">One call to set up. <span class="serif">A short email every week.</span></h2><p class="lede">You stay on the tools. We do the watching, the reading and the writing.</p></div>
    <ol class="steps reveal">
      <li class="step"><h3>We register you properly</h3><p>Central Digital Platform account, supplier profile, share code. Done once, done right, so you are eligible to bid from day one.</p></li>
      <li class="step"><h3>We watch every portal daily</h3><p>Find a Tender, Contracts Finder and your regional portal, filtered to your trade, your area and the contract sizes you can actually deliver.</p></li>
      <li class="step"><h3>You get one page a week</h3><p>Only the contracts worth your time, each with a plain summary, the deadline, and our honest view of your chances. Nothing else.</p></li>
      <li class="step"><h3>We write the bid with you</h3><p>Every answer drafted from your own evidence, checked line by line, formatted and submitted before the deadline. You approve it first.</p></li>
    </ol>
    <div class="mt-xl reveal">
      <h3 class="h3">Who tenders suit</h3>
      <p class="muted mt-s">Trading at least a year, public liability insurance in place, and two customers who would give a reference.</p>
      <ul class="chips mt-m" aria-label="Trades we work with">
        <li>Commercial cleaning</li><li>Grounds maintenance</li><li>Building maintenance</li><li>Small works and refurbishment</li><li>Catering</li><li>Domiciliary care</li><li>Training providers</li><li>Security</li><li>Waste and recycling</li><li>Electrical and plumbing</li>
      </ul>
      <div class="btn-row mt-l"><a class="btn btn--signal" href="#contact" data-need="tenders">Send me live contracts <span class="btn__arrow" aria-hidden="true">→</span></a><a class="btn btn--ghost" href="/pricing/">Tender pricing</a></div>
    </div>
  </div>
</section>

<section class="section" id="websites" aria-labelledby="websites-title">
  <div class="container split split--even">
    <div class="stack reveal">
      <p class="eyebrow">Websites</p>
      <h2 id="websites-title" class="h2">A website that <span class="serif">does its job.</span></h2>
      <p class="lede">Most people will find you on their phone. If the site is slow, out of date or hard to read, they call someone else. We build clean, quick sites for local businesses and keep them simple to run.</p>
      <ul class="ticks mt-m">
        <li>Designed for phones first, and fast to load</li>
        <li>Clear about what you do, where you work and how to reach you</li>
        <li>Click to call, enquiry form and map built in</li>
        <li>Basic search set up so local customers can find you</li>
        <li>Your domain and your content stay yours</li>
        <li>Changes after launch handled for you if you want</li>
      </ul>
      <div class="btn-row mt-l"><a class="btn" href="/work/">See example sites <span class="btn__arrow" aria-hidden="true">→</span></a><a class="btn btn--ghost" href="#contact" data-need="website">Get a website</a></div>
    </div>
    <div class="mosaic reveal" aria-label="Example sites">{mosaic}</div>
  </div>
</section>

<section class="section on-ink" id="automation" aria-labelledby="automation-title">
  <div class="container split split--even">
    <div class="stack reveal">
      <p class="eyebrow">AI automation</p>
      <h2 id="automation-title" class="h2">Answer every enquiry, <span class="serif">even on a job.</span></h2>
      <p class="lede">Missed calls and slow replies lose work. We set up small, practical tools that reply to customers straight away, collect the details you need and take routine admin off your plate. You decide what the tools can and cannot say. Anything unusual comes to you.</p>
      <ul class="ticks mt-m">
        <li>Chat assistant on your website that answers common questions and takes enquiries or bookings</li>
        <li>Automatic replies to enquiries by email or web form, so nobody waits</li>
        <li>Review requests sent to customers after each job</li>
        <li>Admin automations such as reminders, follow ups and moving details between the tools you already use</li>
      </ul>
      <div class="btn-row mt-l"><a class="btn btn--signal" href="#contact" data-need="automation">Add AI to my business <span class="btn__arrow" aria-hidden="true">→</span></a></div>
    </div>
    <div class="reveal">
      <section class="chat" data-chat aria-label="Demo chat assistant">
        <div class="chat__head"><span class="chat__avatar" aria-hidden="true">N</span><div><p class="chat__name">Northside Cleaning</p><p class="chat__status">Assistant · replies instantly</p></div><span class="tag tag--signal">Demo</span></div>
        <ol class="chat__log" data-chat-log aria-live="polite"></ol>
        <div class="chat__options" data-chat-options></div>
        <p class="chat__note">A scripted demo for a made-up business. Try the buttons.</p>
      </section>
    </div>
  </div>
</section>

<section class="section" id="work" aria-labelledby="work-title">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Our work</p><h2 id="work-title" class="h2">Example sites, <span class="serif">built to be clicked.</span></h2><p class="lede">Demo builds for different kinds of local business, so you can see the quality before you decide anything. Open any of them on your phone.</p></div>
    <div class="work-grid">{"".join(work_card(s, h="h3") for s in SITES[:3])}</div>
    <div class="btn-row mt-l"><a class="btn" href="/work/">See all example sites <span class="btn__arrow" aria-hidden="true">→</span></a></div>
  </div>
</section>

<section class="section section--rule" id="pricing" aria-labelledby="pricing-title">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Pricing</p><h2 id="pricing-title" class="h2">Plain prices. <span class="serif">No long contracts.</span></h2></div>
    {PRICING}
  </div>
</section>

<section class="section on-dark" aria-labelledby="promise-title">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Straight answers</p><h2 id="promise-title" class="h2">What we will and will not promise.</h2><p class="lede">We are new, we are small, and we would rather tell you that than invent a track record. What follows is the whole of it.</p></div>
    <ul class="promises reveal">
      <li>We do not guarantee any bid is won. Nobody honest can.</li>
      <li>We will tell you plainly when a contract is not worth your time.</li>
      <li>Nothing goes in a bid that your firm cannot evidence.</li>
      <li>Drafting is AI assisted and checked by a person before it is sent.</li>
      <li>No contract, no notice period, no percentage of the contract value.</li>
      <li>If a month is quiet, the email still comes, and it says why.</li>
      <li>Automated replies only say what you have approved.</li>
      <li>Your website, domain and data stay in your name.</li>
    </ul>
  </div>
</section>

<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="container split">
    <div class="section-head reveal"><p class="eyebrow">Questions</p><h2 id="faq-title" class="h2">The things people ask on <span class="serif">the first call.</span></h2></div>
    <div class="faq reveal">{faq_html()}</div>
  </div>
</section>

<section class="section on-dark" id="contact" aria-labelledby="contact-title">
  <div class="container split">
    <div class="reveal">
      <p class="eyebrow">No obligation</p>
      <h2 id="contact-title" class="h2 mt-s">Tell us what <span class="serif">you need.</span></h2>
      <p class="lede mt-m">Tenders, a website, automation, or a mix. For tenders, tell us your trade and where you work and we will send you the live contracts we found, free. If there is nothing worth your time, we will say that instead.</p>
      <div class="contact__direct"><a href="tel:{PHONE_T}">{PHONE_H}</a><a href="mailto:{EMAIL}">{EMAIL}</a></div>
      <p class="muted mt-s">Monday to Friday, 9am to 5pm. We reply the same working day.</p>
    </div>
    <div class="contact__card reveal">
      <form class="form" data-contact-form novalidate>
        <div class="field field--half"><label for="f-name">Your name</label><input id="f-name" name="name" autocomplete="name" required></div>
        <div class="field field--half"><label for="f-company">Company <span class="muted">(optional)</span></label><input id="f-company" name="company" autocomplete="organization"></div>
        <div class="field"><label for="f-need">What do you need?</label>
          <select id="f-need" name="need" required>
            <option value="tenders">Tenders</option><option value="bid">Help with a bid</option><option value="website">A website</option><option value="automation">AI automation</option><option value="several">More than one</option><option value="unsure" selected>Not sure yet</option>
          </select></div>
        <div class="field field--half" data-trade-field><label for="f-trade">Trade</label>
          <select id="f-trade" name="trade"><option value="">Choose a trade</option><option>Commercial cleaning</option><option>Grounds maintenance</option><option>Building maintenance</option><option>Small works and refurbishment</option><option>Catering</option><option>Domiciliary care</option><option>Training</option><option>Security</option><option>Waste and recycling</option><option>Other</option></select></div>
        <div class="field field--half"><label for="f-area">Area you cover</label><input id="f-area" name="area" autocomplete="address-level2"></div>
        <div class="field"><label for="f-phone">Best number to call <span class="muted">(optional)</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="f-msg">Anything else</label><textarea id="f-msg" name="message"></textarea></div>
        <div class="form__actions"><button class="btn btn--signal" type="submit">Send enquiry <span class="btn__arrow" aria-hidden="true">→</span></button><p class="form__status" data-form-status aria-live="polite">Opens your email app. Nothing is stored on this site.</p></div>
      </form>
    </div>
  </div>
</section>
</main>
"""
    t = "The Tender Desk | Tenders, websites and AI automation for local businesses"
    d = "We find public contracts local businesses can win and write the bid with you, build fast websites, and set up AI tools that answer enquiries. Aldershot, Hampshire."
    return head(t, d, "/", ld(BUSINESS) + ld(faq_jsonld())) + body + FOOTER


def work():
    body = f"""{header('work')}
<main id="main">
<section class="page-intro">
  <div class="container">
    <p class="eyebrow">Our work</p>
    <h1 class="display mt-m">Example sites, <span class="serif">live and clickable.</span></h1>
    <p class="lede">Demo builds for different kinds of local business. They are working sites, not mock-ups: open them on your phone, press the buttons, try the booking and ordering flows. None of them are client work. Crumble &amp; Co is a concept we built for a real Aldershot dessert shop; the others are fictional businesses.</p>
  </div>
</section>
<section class="section section--tight" aria-label="Example sites">
  <div class="container work-grid">{work_card(SITES[0], feature=True)}{"".join(work_card(s) for s in SITES[1:])}</div>
</section>
{cta_band("Want one like these for your business?", "Website from £99 setup and £25 a month. Add an AI assistant for enquiries and bookings from £199 setup.")}
</main>
"""
    items = {"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "url": f"{SITE}/work/{s['slug']}/", "name": s["name"].replace("&amp;", "&")} for i, s in enumerate(SITES)]}
    return head("Example sites | The Tender Desk", "Live demo websites built by The Tender Desk for local businesses: a barber, plumber, gym, bakery and a concept for a real Aldershot dessert shop.", "/work/", ld(items)) + body + FOOTER


def pricing():
    body = f"""{header('pricing')}
<main id="main">
<section class="page-intro">
  <div class="container">
    <p class="eyebrow">Pricing</p>
    <h1 class="display mt-m">Plain prices. <span class="serif">No long contracts.</span></h1>
    <p class="lede">A fixed setup fee, then a simple monthly price. Cancel any month. Every service stands on its own, so you only pay for what you use.</p>
  </div>
</section>
<section class="section section--tight"><div class="container">{PRICING}</div></section>
<section class="section section--rule" aria-labelledby="pq">
  <div class="container split">
    <div class="section-head"><h2 id="pq" class="h2">About paying</h2></div>
    <div class="faq">{faq_html()}</div>
  </div>
</section>
{cta_band()}
</main>
"""
    return head("Pricing | The Tender Desk", "Website £99 setup + £25/month. Website + AI £199 + £45/month. AI add-on £99 + £29/month. Tender Desk £249/month. Bid Build £750. Tender Ready Pack £350.", "/pricing/", ld(BUSINESS)) + body + FOOTER


def notfound():
    body = f"""{header('none')}
<main id="main">
<section class="page-intro section">
  <div class="container">
    <p class="eyebrow">Error 404</p>
    <h1 class="display mt-m">This page is <span class="serif">not on the desk.</span></h1>
    <p class="lede">The link may be old or mistyped. These will get you back on track.</p>
    <div class="btn-row mt-l"><a class="btn btn--signal" href="/">Home <span class="btn__arrow" aria-hidden="true">→</span></a><a class="btn btn--ghost" href="/work/">Example sites</a><a class="btn btn--ghost" href="/pricing/">Pricing</a><a class="btn btn--ghost" href="/#contact">Contact</a></div>
  </div>
</section>
</main>
"""
    return head("Page not found | The Tender Desk", "This page could not be found.", "/404.html", '<meta name="robots" content="noindex">\n') + body + FOOTER


(OUT / "index.html").write_text(home())
(OUT / "work").mkdir(exist_ok=True)
(OUT / "work/index.html").write_text(work())
(OUT / "pricing").mkdir(exist_ok=True)
(OUT / "pricing/index.html").write_text(pricing())
(OUT / "404.html").write_text(notfound())
(OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
urls = ["/", "/work/", "/pricing/"] + [f"/work/{s['slug']}/" for s in SITES]
(OUT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"  <url><loc>{SITE}{u}</loc><lastmod>2026-09-24</lastmod></url>\n" for u in urls) + "</urlset>\n")
(OUT / "site.webmanifest").write_text(json.dumps({"name": "The Tender Desk", "short_name": "Tender Desk", "icons": [
    {"src": "/assets/img/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "/assets/img/icon-512.png", "sizes": "512x512", "type": "image/png"}],
    "theme_color": "#f4f0e7", "background_color": "#f4f0e7", "display": "standalone", "start_url": "/"}, indent=2))
(OUT / ".nojekyll").write_text("")
print("built")
