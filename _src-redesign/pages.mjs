// Writes one index.html per route (each URL loads directly with 200) with its own title, meta, canonical and OG.
// node pages.mjs          -> preview build in ../preview (noindex)
// node pages.mjs live     -> copies ../_live into the site root (index.html, service folders, assets/r, img, fonts)
import fs from 'node:fs'
const live = process.argv[2] === 'live'
const SITE = 'https://thetenderdesk.co.uk'
const src = new URL(live ? '../_live/' : '../preview/', import.meta.url)
const root = new URL('../', import.meta.url)
const html = fs.readFileSync(new URL('index.html', src), 'utf8')
const D = 'More calls for local trades: Google ads, a proper website from £25 and a £49 Google listing fix. Clear prices, paid up front. Founded and run by Yusuf Imthiyas.'
const pages = {
  '': ['The Tender Desk | More calls for local trades', 'More calls from local customers for plumbers, builders, electricians, fitters and every local trade. Google ads, websites from £25 and a £49 Google listing fix. Clear prices, paid up front.'],
  customers: ['Get More Calls for Your Trade | The Tender Desk', 'We run Google ads for your trade so people nearby ring your phone. Calls come straight to you, never shared. A set monthly fee, paid up front.'],
  'google-business': ['Google Listing Fix for Trades | The Tender Desk', 'Your Google listing set up or fixed so you show up properly on Maps with your reviews, plus a review QR card. A one off £49.'],
  websites: ['Websites for Trades | The Tender Desk', 'A proper website that works on a phone and makes it easy to ring you. £25 up front for the first 6 months including hosting, then £75 a year.'],
  seo: ['Google SEO for Trades | The Tender Desk', 'Your website set up to climb Google for your trade and be recommended by AI apps. A fixed price after a quick look, paid up front.'],
  motion: ['Reels and Video Ads | The Tender Desk', 'Reels and video ads for Instagram and TikTok, made for your business. Priced per project, ask us.'],
  tenders: ['Tender Writing | The Tender Desk', 'Clear, compliant bids for small businesses. We find the right contracts and write answers that follow the scoring criteria. A fixed price per bid, paid up front.'],
  'google-ads': ['Google Ads | The Tender Desk', 'Already have a website? We set up and run your Google ads, with every call counted. A set monthly fee, paid up front.'],
  ai: ['AI Receptionist | The Tender Desk', 'An AI receptionist trained on your business that answers customers day and night, asks the right questions and books the job.'],
  care: ['Website Care | The Tender Desk', 'Hosting, updates, backups and small changes handled for you, so your site stays fast and secure.'],
  about: ['About Us | The Tender Desk', 'The Tender Desk helps small trades get more calls, a proper website and a Google listing that works. Founded and run by Yusuf Imthiyas.'],
  partners: ['Referral Partners | The Tender Desk', 'Introduce a trade to The Tender Desk and receive a thank you of 10% of what they pay in their first year.'],
}
const SVC = [
  ['customers', 'Get more calls', 'Google ads for trades with calls straight to your phone. A set monthly fee, paid up front.'],
  ['google-business', 'Google listing fix', 'Google listing set up or fixed, one off £49.'],
  ['websites', 'Websites', 'Websites for trades that work on a phone. £25 for the first 6 months, then £75 a year.'],
  ['seo', 'Google SEO', 'Websites set up to rank on Google and be recommended by AI answers.'],
  ['motion', 'Reels and video ads', 'Reels and video ads for Instagram and TikTok, priced per project.'],
  ['tenders', 'Tender writing', 'Finding contracts, go or no go, method statements, quality and social value answers.'],
  ['google-ads', 'Google Ads', 'Google Ads campaigns built and managed, with every enquiry tracked.'],
  ['ai', 'AI receptionist', 'An AI receptionist that answers customers and books jobs day and night.'],
  ['care', 'Website care', 'Hosting, updates, backups and small changes every month.'],
]
const catalog = { '@type': 'OfferCatalog', name: 'Services', itemListElement: SVC.map(([slug, name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description, url: `${SITE}/${slug}/`, provider: { '@id': SITE + '/#org' } } })) }
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
for (const [slug, [title, desc]] of Object.entries(pages)) {
  const path = slug ? `/${slug}/` : '/'
  const url = SITE + (live ? path : '/preview' + path)
  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    live ? `<link rel="canonical" href="${url}" />` : `<meta name="robots" content="noindex, nofollow" />`,
    `<meta property="og:type" content="website"><meta property="og:site_name" content="The Tender Desk"><meta property="og:locale" content="en_GB"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/assets/img/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${SITE}/assets/img/og.png">`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', '@id': SITE + '/#org', name: 'The Tender Desk', url: SITE + '/', email: 'hello@thetenderdesk.co.uk', description: D, logo: SITE + '/assets/img/icon-512.png', founder: { '@type': 'Person', name: 'Yusuf Imthiyas' }, knowsAbout: SVC.map(x => x[1]), hasOfferCatalog: catalog })}</script>`,
  ].join('\n    ')
  const out = html.replace('<!--HEAD-->', head)
  const dir = live ? new URL(slug ? slug + '/' : '', root) : new URL(slug ? slug + '/' : '', src)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(new URL('index.html', dir), out)
}
if (live) {
  for (const d of ['assets/r', 'img', 'fonts']) {
    fs.rmSync(new URL(d, root), { recursive: true, force: true })
    fs.cpSync(new URL(d, src), new URL(d, root), { recursive: true })
  }
  fs.rmSync(src, { recursive: true, force: true })
}
console.log(live ? 'live pages written to site root:' : 'preview pages:', Object.keys(pages).length)
