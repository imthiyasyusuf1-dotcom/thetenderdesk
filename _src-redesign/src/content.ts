export const WA_NUM = 'https://wa.me/447534458327?text='
export const wa = (msg: string) => WA_NUM + encodeURIComponent(msg)
export const MAIL = 'mailto:hello@thetenderdesk.co.uk'
export const B = import.meta.env.BASE_URL

export type Visual = 'site' | 'bid' | 'ads' | 'chat' | 'gbp' | 'seo' | 'care' | 'reel'

export type Service = {
  slug: string
  nav: string
  name: string
  eyebrow: string
  title: string
  lede: string
  price: { big?: string; label: string; note: string }
  visual: Visual
  listTitle: string
  list: [string, string][]
  extraTitle?: string
  extra?: string[]
  extraIntro?: string
  steps: [string, string][]
  stepsTitle: string
  faqs: [string, string][]
  cta: { title: string; text: string; label: string; msg: string }
  summary: string
}

export const services: Service[] = [
  {
    slug: 'websites', nav: 'Websites', name: 'Websites', eyebrow: 'Websites',
    title: 'Websites that win work.',
    lede: 'Custom websites for trades and local businesses. Designed from scratch, fast on a phone and built to turn a visit into a call, a booking or a quote request. We build a free mock-up first, so you see your site before you pay.',
    price: { big: '25', label: 'First 6 months, site and hosting', note: 'Then £75 a year. No contract.' },
    visual: 'site',
    listTitle: 'Everything a site needs to sell.',
    list: [
      ['Custom design', 'No templates. A look built around your business, your customers and what makes you the obvious choice.'],
      ['Mobile first', 'Most customers find you on a phone. We design for that first and make it fast on a weak signal.'],
      ['Copy that sells', 'We write the words with you: clear services, real proof and a reason to call today.'],
      ['SEO basics', 'Page titles, structure, speed, schema and Google Search Console set up properly from launch.'],
      ['Enquiry tracking', 'Calls, forms and bookings tracked so you can see what the site brings in.'],
      ['Yours to own', 'Your domain, your content. We hand over everything, no lock in.'],
    ],
    stepsTitle: 'From first message to live.',
    steps: [
      ['Tell us about your business', 'Send a message on WhatsApp or email. A few lines about what you do and some photos of your work is plenty.'],
      ['We build a free mock-up', 'You get a link to a working version of your new site. Look at it on your own phone, show it to whoever you like.'],
      ['Live in 48 hours', 'Happy with it? We make your changes, connect your domain and put it live within two working days.'],
      ['Looked after', 'Hosting, security and small text changes included, so the site stays fast and up to date.'],
    ],
    faqs: [
      ['Is the mock-up really free?', 'Yes. We build a working mock-up of your new site before you pay anything. If you do not like it, you walk away and owe nothing.'],
      ['What do I get for £25?', 'Your website, built and live, plus hosting for the first 6 months. After that it is £75 a year to keep it running.'],
      ['Do I need to send anything?', 'A few photos of your work and your contact details help. We can pull the rest from your Google profile, social pages or a quick chat.'],
      ['Can I use my own domain?', 'Yes. We connect a domain you already own, or help you buy one. The domain is yours, in your name.'],
      ['What if I want to leave?', 'No contract and no lock in. If you stop paying the yearly fee the site comes down, and we can hand over the files if you ask.'],
    ],
    cta: { title: 'See your new site before you pay.', text: 'Send us your business name and what you do. We will reply with a free mock-up, usually within a day.', label: 'Get my free mock-up', msg: "Hi, I'd like a free mock-up of a website for my business." },
    summary: 'Custom sites designed from scratch, fast on a phone and built to turn a visit into an enquiry.',
  },
  {
    slug: 'customers', nav: 'More customers', name: 'More customers', eyebrow: 'More customers',
    title: 'More people ringing you for work.',
    lede: 'When someone searches for your trade, we make sure your phone is the one that rings. We run the Google ads, the calls come straight to you, and you only pay us when you are getting jobs from it.',
    price: { label: 'Pay only when it works', note: 'You pay Google for the ads. Our fee only starts once the jobs are coming in.' },
    visual: 'ads',
    listTitle: 'How it works for you.',
    list: [
      ['We run your Google ads', 'We set up and look after the ads for your trade, so you show up when people search for what you do.'],
      ['Calls go to your phone', 'People tap your ad and ring you direct. No middleman, no forms, no waiting.'],
      ['You pay Google for the ads', 'The ad money goes to Google on your own card, and you set the budget.'],
      ['We only get paid when you do', 'Nothing to us until jobs are coming in. If the phone does not ring, you do not pay our fee.'],
      ['Your own page', 'Every ad sends people to a page with your name, your work and your number.'],
      ['Plain updates', 'You hear how many calls came in and what they cost, in normal words.'],
    ],
    extraTitle: 'Want to climb Google Maps first?',
    extraIntro: 'The firm at the top of the map gets the calls, and that is mostly down to reviews. Our door opener is Get more Google reviews, for a one off £49.',
    extra: [
      'We fix up your Google listing so it looks right and says what you do',
      'A QR card for the counter or the van that takes happy customers straight to your review page',
      'A short text you send to past customers asking for a review',
      'Real reviews from real customers only. Never fake or paid ones, Google bans them and it is against the law',
    ],
    stepsTitle: 'Simple from day one.',
    steps: [
      ['Chat', 'Tell us your trade and the jobs you want more of.'],
      ['Set up', 'We build the ads and your page. You approve it before anything goes live.'],
      ['Calls', 'People searching for your trade ring your phone.'],
      ['Pay', 'You pay Google for the ads. Our fee only starts when you are getting jobs.'],
    ],
    faqs: [
      ['What do I pay?', 'You pay Google for the ads on your own card, and you choose the budget. Our fee only starts once you are getting jobs from it.'],
      ['What if I get no calls?', 'Then you do not pay our fee. We would rather say so and fix it than take your money.'],
      ['Who owns the ads account?', 'You do. It is your account and your card, and you can see everything.'],
      ['Which trades is this for?', 'Driveways, roofing, kitchens, landscaping and other trades where one job is worth a lot.'],
      ['Are the reviews real?', 'Always. We help you ask your real customers. We never write or buy reviews.'],
    ],
    cta: { title: 'Get the phone ringing.', text: 'Tell us your trade and we will show you what it could look like.', label: 'Get more customers', msg: "Hi, I'd like more customers for my business." },
    summary: 'We run Google ads so people searching for your trade ring you. You pay Google for the ads, and our fee only starts when you are getting jobs.',
  },
  {
    slug: 'motion', nav: 'Reels', name: 'Motion, ads and reels', eyebrow: 'Motion design, video ads and reels',
    title: 'Ads that stop the scroll.',
    lede: 'Motion design videos, video ads and Instagram and TikTok reels made for your business. Clean, Apple style motion with sharp type and sound design, built to make people stop, watch and get in touch.',
    price: { label: 'Priced per project, ask us', note: 'A clear quote after a quick chat about what you need.' },
    visual: 'reel',
    listTitle: 'Motion that sells, not just moves.',
    list: [
      ['Instagram and TikTok reels', 'Short vertical videos made for the feed, with a hook in the first second and a clear ask at the end.'],
      ['Video ads', 'Ads for Instagram, Facebook, TikTok and YouTube, cut to the right length and shape for each one.'],
      ['Motion design', 'Animated type, product and app style screens, and logo reveals that make your business look as good as your work.'],
      ['Script and story', 'We write the idea and the words with you, so every second earns its place.'],
      ['Sound design', 'Sound effects and voiceover timed to every cut. Trending music can be added in the app when you post.'],
      ['Ready to post', 'Delivered in the right sizes for each platform, with a caption and cover frame to go with it.'],
    ],
    extraTitle: 'What we make.',
    extraIntro: 'One clip for a launch or a steady run of reels every month. Every video is made from scratch around your business, never a template.',
    extra: ['Reels', 'TikToks', 'Video ads', 'Motion graphics', 'Logo reveals', 'Launch films', 'Explainer videos', 'Story ads'],
    stepsTitle: 'From idea to posted.',
    steps: [
      ['Tell us the goal', 'More calls, more bookings, a launch or a sale. A few lines on WhatsApp or email is plenty.'],
      ['Script and look', 'We send the idea, the script and the style before anything is animated.'],
      ['We make it', 'Motion, type, sound and edit, done by us. You get a first cut to watch on your phone.'],
      ['Ready to post', 'Your changes made, then delivered in every size you need.'],
    ],
    faqs: [
      ['How much does a reel cost?', 'Every project is priced on its own, depending on length, style and how many videos you want. Ask us and you get a clear quote before anything starts.'],
      ['Do I need to film anything?', 'No. Most of our motion work is made from scratch. If you have photos or clips of your work we can use them too.'],
      ['Can you make a set of reels each month?', 'Yes. Many businesses want a steady run of posts. We plan them together and deliver in batches.'],
      ['Who owns the videos?', 'You do. Once paid for, the videos are yours to post wherever you like.'],
    ],
    cta: { title: 'Get your business moving.', text: 'Tell us what you sell and where you post. We will come back with an idea and a clear quote.', label: 'Ask about a reel', msg: "Hi, I'd like to ask about a reel or video ad for my business." },
    summary: 'Motion design videos, video ads and Instagram and TikTok reels made for your business, ready to post.',
  },
  {
    slug: 'tenders', nav: 'Tenders', name: 'Tenders', eyebrow: 'Tender writing',
    title: 'We write the bid. You win the work.',
    lede: 'Clear, compliant bids for small businesses. You do the work. We find the right contracts, read the spec properly and write answers that follow the scoring criteria.',
    price: { label: 'Every bid quoted individually', note: 'With a free, honest go or no go first.' },
    visual: 'bid',
    extraIntro: 'Councils, NHS trusts, housing associations and schools buy cleaning, repairs, care and transport every week. Plenty of small firms could deliver that work and never bid, because the paperwork looks like a second job. That paperwork is our job.',
    listTitle: 'Everything between the notice and submit.',
    list: [
      ['Finding opportunities', 'We watch the public portals for contracts that fit your size and sector, so you only see the ones worth a look.'],
      ['Go or no go', 'An honest read of the spec, the scoring and the pass or fail criteria before you spend a minute writing. If it is not winnable, we say so.'],
      ['Reading the spec', 'Every requirement, deadline and clarification pulled into one checklist so nothing gets missed.'],
      ['Method statements', 'How you will actually deliver the contract, written clearly from what you tell us about how you work.'],
      ['Quality answers', 'Each question answered against its marking scheme, inside the word limit, with your real evidence.'],
      ['Social value', 'Jobs, apprenticeships, suppliers and carbon commitments you can genuinely keep, written to the buyer\u2019s model.'],
      ['PQQ, SQ and frameworks', 'Selection questionnaires and framework applications completed and checked, so you reach the scored stage.'],
      ['Compliance checks', 'Every mandatory document, declaration, policy and format rule checked before you submit.'],
      ['Bid library', 'Your best answers, policies and case studies saved so every next bid is faster.'],
    ],
    extraTitle: 'Small firms who do good work.',
    extra: ['Cleaning', 'Facilities', 'Construction', 'Trades and M&E', 'Grounds', 'Care', 'Catering', 'Security', 'Transport'],
    stepsTitle: 'Four steps. One deadline.',
    steps: [
      ['Send the tender', 'Forward the notice or documents. No tender yet? We will find contracts that fit.'],
      ['Go or no go', 'A free, straight read of what it scores and whether it is worth bidding.'],
      ['Write', 'A short call to gather your experience, people and processes, then drafts of every answer.'],
      ['Check and submit', 'A full compliance check, final edits with you, and submission well before the deadline.'],
    ],
    faqs: [
      ['Who is it for?', 'SMEs bidding for council, NHS, housing association and education contracts, whether it is your first tender or your tenth.'],
      ['What does the go or no go cost?', 'Nothing. Forward the notice or the documents and we give you a free, straight read of whether it is worth bidding.'],
      ['Can you send me contracts that fit?', 'Yes. Tell us what you do. When a public contract comes up that suits a firm your size, we send it over with a one line view on whether it is worth a look. Free, and you can stop any time.'],
    ],
    cta: { title: 'Got a tender? Send the spec.', text: 'Forward the notice or the documents for a free go or no go read.', label: 'Send us a tender', msg: "Hi, I have a tender I'd like a go or no go read on." },
    summary: 'We find contracts that fit, give you an honest go or no go, then write the bid to the scoring criteria.',
  },
  {
    slug: 'google-ads', nav: 'Google Ads', name: 'Google Ads', eyebrow: 'Google Ads',
    title: 'They search. You\u2019re first.',
    lede: 'Google Ads campaigns built and managed for you. The right searches, a sharp landing page and every enquiry tracked, so you know what each pound brings in.',
    price: { label: 'Quoted after a quick chat', note: 'Starts with a free review. Ad spend goes straight to Google on your card.' },
    visual: 'ads',
    listTitle: 'Ads that pay for themselves.',
    list: [
      ['Keyword research', 'Built on what your buyers actually type.'],
      ['Campaigns by service', 'Search campaigns structured so each service gets its own budget and ads.'],
      ['Copy and landing pages', 'Ad copy and landing pages written to convert.'],
      ['Negative keywords', 'To stop wasted spend on searches that never buy.'],
      ['Conversion tracking', 'Calls and forms tracked back to the click.'],
      ['Monthly tuning', 'Monthly optimisation and a plain English report.'],
    ],
    stepsTitle: 'Launch in days, improve every month.',
    steps: [
      ['Review', 'A free look at your current account or your market if you are starting fresh.'],
      ['Build', 'Campaigns, ads, tracking and a landing page that matches the search.'],
      ['Launch', 'Live with a sensible budget you control. Your account, your card.'],
      ['Tune', 'We cut what does not work and push what does, every month.'],
    ],
    faqs: [
      ['How much should I spend?', 'It depends on your market. We will give you a realistic starting budget after the review, and you can change it any time.'],
      ['Who owns the account?', 'You do. Ad spend goes straight to Google on your card.'],
      ['Do I need a new website?', 'Not always. Often a single focused landing page does the job, and we can build it.'],
    ],
    cta: { title: 'Be the first they call.', text: 'Tell us what you sell and we will show you where the searches are.', label: 'Get a free review', msg: "Hi, I'd like a free Google Ads review." },
    summary: 'Campaigns built and managed for you. The right searches, a sharp landing page and every enquiry tracked.',
  },
  {
    slug: 'ai', nav: 'AI', name: 'AI assistant', eyebrow: 'AI assistant and automation',
    title: 'Answers at 3am. Books by breakfast.',
    lede: 'An AI assistant trained on your business that answers customers 24/7, qualifies the lead and books the job. Plus automations that take the admin off your plate.',
    price: { label: 'Quoted after a quick chat', note: 'Setup usually takes about a week, including testing.' },
    visual: 'chat',
    listTitle: 'Never miss an enquiry again.',
    list: [
      ['Trained on your business', 'Your services, prices and FAQs.'],
      ['Answers instantly', 'On your website and WhatsApp.'],
      ['Qualifies the lead', 'Asks the right questions before anything reaches you.'],
      ['Books the job', 'Books into your diary and sends you the details.'],
      ['Hands over', 'Passes to you whenever a human is needed.'],
    ],
    extraTitle: 'Hours back, every week.',
    extraIntro: 'Repetitive admin is where small businesses lose time. We connect the tools you already use so the busywork runs itself.',
    extra: ['Quote follow ups', 'Review requests', 'Lead routing', 'Appointment reminders', 'Weekly reports', 'Custom workflows'],
    stepsTitle: 'Live in about a week.',
    steps: [
      ['Show it', 'A short call where you see the assistant answer questions about your own business.'],
      ['Train', 'We load your services, prices and FAQs, and you approve what it can say.'],
      ['Test', 'Real questions from your customers, checked before it goes live.'],
      ['Live', 'On your website and WhatsApp, booking jobs while you work or sleep.'],
    ],
    faqs: [
      ['Will it say the wrong thing?', 'It only answers from information you approve, and passes anything it is unsure about to you.'],
      ['Do I need a new website?', 'No. The assistant can be added to most existing sites and to WhatsApp.'],
      ['How long does setup take?', 'Usually about a week, including testing with real questions from your customers.'],
    ],
    cta: { title: 'Let it answer for you.', text: 'Book a short call and see the assistant answer questions about your own business.', label: 'Book a call', msg: "Hi, I'd like to see the AI assistant for my business." },
    summary: 'An assistant trained on your business that answers, qualifies and books customers 24/7, plus automations that save hours.',
  },
  {
    slug: 'google-business', nav: 'Google Business', name: 'Google Business Profile', eyebrow: 'Google Business Profile',
    title: 'Show up on Maps and search.',
    lede: 'For many businesses the Google profile gets more views than the website. We set it up and optimise it properly, with reviews that count.',
    price: { label: 'Quoted after a quick chat', note: 'Often added alongside a new website.' },
    visual: 'gbp',
    listTitle: 'A profile that gets the call.',
    list: [
      ['Created or claimed', 'Your profile created or claimed, and verified.'],
      ['Set up right', 'Categories, services, photos and hours filled in properly.'],
      ['Reviews', 'A simple review request system for happy customers.'],
      ['Linked and tracked', 'Connected to your website, with calls and clicks tracked.'],
    ],
    stepsTitle: 'Sorted in four steps.',
    steps: [
      ['Check', 'We look at what customers see when they search for you now.'],
      ['Claim', 'Your profile created or claimed and verified in your name.'],
      ['Fill in', 'Categories, services, photos and hours set up right.'],
      ['Grow', 'Review requests going out, and the profile linked to your site.'],
    ],
    faqs: [
      ['Who owns the profile?', 'You do. It is set up in your name, and we work on it with your permission.'],
      ['Do I need a website too?', 'Not to start. It works best linked to a site, which we can build.'],
    ],
    cta: { title: 'Sort my Google profile.', text: 'Tell us your business name and we will look at your profile for you.', label: 'Sort my profile', msg: "Hi, I'd like help with my Google Business Profile." },
    summary: 'Your Google Business Profile set up and optimised, so you show up properly on Maps and search with reviews that count.',
  },
  {
    slug: 'seo', nav: 'SEO', name: 'SEO and AI search', eyebrow: 'SEO and AI search',
    title: 'Found on Google. Quoted by AI.',
    lede: 'People now ask ChatGPT, Gemini and Google\u2019s AI answers who to call. We structure your site so search engines and AI assistants understand exactly what you do, and recommend you.',
    price: { label: 'Quoted after a quick chat', note: 'SEO basics come with every website we build.' },
    visual: 'seo',
    listTitle: 'Built for how people search now.',
    list: [
      ['Structured data', 'Organization, LocalBusiness or ProfessionalService, Service and Review schema so search engines read your business correctly.'],
      ['FAQ markup', 'Real customer questions answered on the page and marked up with FAQPage schema.'],
      ['llms.txt', 'A plain summary file at your site root that tells AI assistants what you do and where to look.'],
      ['Search structure', 'One clear page per service, fast load times, clean titles and internal links.'],
      ['Search Console', 'Google Search Console and Bing Webmaster Tools set up, with your sitemap submitted.'],
      ['Monthly checks', 'Rankings, AI mentions and enquiries reviewed, then improved.'],
    ],
    stepsTitle: 'Measured, then improved.',
    steps: [
      ['Audit', 'How search engines and AI assistants read your site today.'],
      ['Structure', 'Schema, FAQ markup, llms.txt and one page per service.'],
      ['Submit', 'Search Console and Bing Webmaster Tools set up, sitemap in.'],
      ['Review', 'Rankings, AI mentions and enquiries checked every month.'],
    ],
    faqs: [
      ['What is llms.txt?', 'A plain summary file at your site root that tells AI assistants what you do and where to look.'],
      ['Does it work on my current site?', 'Usually, yes. If the site makes it hard, we will tell you straight before you spend on it.'],
    ],
    cta: { title: 'Get found.', text: 'Tell us what you do and we will show you how search and AI see you now.', label: 'Get found', msg: "Hi, I'd like help being found on Google and AI search." },
    summary: 'Found on Google and quoted by AI assistants: structured data, FAQ markup, llms.txt and pages built for how people search now.',
  },
  {
    slug: 'care', nav: 'Care plans', name: 'Care plans', eyebrow: 'Care plans',
    title: 'Hosting and care, handled.',
    lede: 'A website is never finished. Our care plan keeps it fast, secure and up to date, so you can get on with the work.',
    price: { label: 'Included with our websites', note: 'Part of the £75 a year once your first 6 months are up. Other sites quoted after a quick chat.' },
    visual: 'care',
    listTitle: 'Looked after every month.',
    list: [
      ['Fast hosting', 'Quick, secure hosting with SSL included.'],
      ['Updates and backups', 'Everything kept current and backed up, checked every month.'],
      ['Small changes', 'New prices, photos or a fresh page: just send it over.'],
      ['Monthly check', 'Speed, uptime and enquiries reviewed, with a short report.'],
    ],
    stepsTitle: 'What happens each month.',
    steps: [
      ['Back up', 'Your site copied and stored safely.'],
      ['Update', 'Everything kept current and secure.'],
      ['Check', 'Speed, uptime and enquiries reviewed.'],
      ['Report', 'A short note on what we did and what we found.'],
    ],
    faqs: [
      ['How do I ask for a change?', 'Just send it over on WhatsApp or email. New prices, photos or a fresh page.'],
      ['What if I want to leave?', 'No contract and no lock in. We can hand over the files if you ask.'],
    ],
    cta: { title: 'Keep it fast and safe.', text: 'Tell us about your site and we will tell you what it needs.', label: 'Ask about care', msg: "Hi, I'd like to ask about a care plan for my website." },
    summary: 'Hosting, updates, backups and small changes handled every month, so your site stays fast and secure.',
  },
]

export const moves: [string, string][] = [
  ['Find', 'We find where your next customers and contracts are: the searches, the tenders, the gaps your competitors leave.'],
  ['Write', 'Words that sell. Pages, bids and ads written to what buyers and customers actually score and click.'],
  ['Win', 'Every enquiry, call and booking tracked, so you know exactly what is bringing work in.'],
  ['Build', 'Fast sites, AI assistants and automations that keep working after we hand them over.'],
]

export const whyUs: [string, string][] = [
  ['One team, every channel', 'Your site, reels, ads, bids and AI from one desk, so nothing gets lost between agencies.'],
  ['Honest from the start', 'If something will not earn its keep, we say so before you spend on it.'],
  ['Yours to own', 'Your domain, your content, your accounts. No lock in.'],
  ['Tracked from day one', 'Calls, forms and bookings measured, so decisions come from numbers.'],
]

export const homeFaqs: [string, string][] = [
  ['How much does it cost?', 'A website is £25 for the first 6 months, site and hosting, then £75 a year after that. Reels, tenders, Google Ads, AI and the rest are priced per project after a quick chat, with a clear quote before anything starts.'],
  ['How fast can you start?', 'Usually within a week. A website mock-up usually reaches you within a day.'],
  ['Do I need every service?', 'No. Most clients start with one, often a website or a single tender, and add more when it pays.'],
  ['Will I own my website?', 'Yes. The domain, content and accounts are yours.'],
]
