// Writes one index.html per route (each URL loads directly with 200) with its own title, meta, canonical and OG.
// node pages.mjs          -> preview build in ../preview (noindex)
// node pages.mjs live     -> copies ../_live into the site root (index.html, service folders, assets/r, img, fonts)
import fs from 'node:fs'
const live = process.argv[2] === 'live'
const SITE = 'https://thetenderdesk.co.uk'
const src = new URL(live ? '../_live/' : '../preview/', import.meta.url)
const root = new URL('../', import.meta.url)
const html = fs.readFileSync(new URL('index.html', src), 'utf8')
const D = 'Websites, reels and video ads, tenders, Google Ads and AI for businesses that want more of the right work.'
const pages = {
  '': ['The Tender Desk | Websites, Reels, Tenders, Google Ads and AI', 'The Tender Desk builds websites, makes reels and video ads, writes tenders, runs Google Ads and sets up AI assistants for businesses that want more of the right work.'],
  customers: ['More Customers | The Tender Desk', 'We run Google ads for trades so people searching for your trade ring you. You pay Google for the ads, and our fee only starts when you are getting jobs.'],
  motion: ['Motion Design, Video Ads and Reels | The Tender Desk', 'Motion design videos, video ads and Instagram and TikTok reels made for your business. Clean, Apple style motion with sound design. Priced per project, ask us.'],
  websites: ['Websites | The Tender Desk', 'Custom websites, fast on a phone and built to win work. Free mock-up first. £25 for the first 6 months including hosting, then £75 a year.'],
  tenders: ['Tender Writing | The Tender Desk', 'Clear, compliant bids for small businesses. We find the right contracts and write answers that follow the scoring criteria. Free go or no go first.'],
  'google-ads': ['Google Ads | The Tender Desk', 'Google Ads campaigns built and managed for you, with every enquiry tracked so you know what each pound brings in.'],
  ai: ['AI Assistant and Automation | The Tender Desk', 'An AI assistant trained on your business that answers customers 24/7, qualifies the lead and books the job.'],
  'google-business': ['Google Business Profile | The Tender Desk', 'Your Google Business Profile set up and optimised properly, with reviews that count.'],
  seo: ['SEO and AI Search | The Tender Desk', 'Found on Google. Quoted by AI. Structured data, FAQ markup and llms.txt so search engines and AI assistants recommend you.'],
  care: ['Care Plans | The Tender Desk', 'Hosting, updates, backups and small changes handled every month, so your site stays fast and secure.'],
  about: ['About Us | The Tender Desk', 'About The Tender Desk: websites, reels, tenders, Google Ads and AI from one desk. Founded and run by Yusuf Imthiyas.'],
  partners: ['Referral Partners | The Tender Desk', 'Introduce a business to The Tender Desk and receive a thank you of 10% of what they pay in their first year.'],
}
const SVC = [
  ['customers', 'More customers', 'Google ads for trades. Calls go straight to your phone and our fee only starts when you are getting jobs.'],
  ['websites', 'Websites', 'Custom, mobile first websites with hosting.'],
  ['motion', 'Motion design, video ads and reels', 'Motion design videos, video ads and Instagram and TikTok reels, priced per project.'],
  ['tenders', 'Tender writing', 'Finding contracts, go or no go, method statements, quality and social value answers.'],
  ['google-ads', 'Google Ads', 'Google Ads campaigns built and managed, with every enquiry tracked.'],
  ['ai', 'AI assistant and automation', 'An AI assistant that answers customers and books jobs 24/7, plus admin automations.'],
  ['google-business', 'Google Business Profile setup', 'Google Business Profile set up and optimised.'],
  ['seo', 'SEO and AI search optimisation', 'Structured data, FAQ markup and llms.txt for search engines and AI assistants.'],
  ['care', 'Website care plans', 'Hosting, updates, backups and small changes every month.'],
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
