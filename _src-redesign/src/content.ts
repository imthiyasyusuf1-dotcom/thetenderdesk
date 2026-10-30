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
  price: { big?: string; label: string; note: string; headline?: string; short?: string; text?: string; title?: string }
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
    slug: 'customers', nav: 'More calls', name: 'Get more calls', eyebrow: 'Get more calls',
    title: 'More people ringing you for work.',
    lede: 'When someone nearby searches for your trade, we make sure your phone is the one that rings. We set up and run the Google ads, and the calls come straight to you.',
    price: { headline: 'Monthly', label: 'Our fee', note: 'A set monthly fee, agreed before we start. Paid up front each month.', text: 'You pay our fee at the start of each month, before the work. The ad money is separate: it goes to Google on your own card, and you choose the budget.' },
    visual: 'ads',
    listTitle: 'What you get',
    list: [
      ['Google ads for your trade', 'We set up and look after the ads, so you show up when people nearby search for what you do.'],
      ['Calls straight to you', 'People tap your ad and ring your phone. No middleman and no shared leads.'],
      ['Your own page', 'Every ad sends people to a page with your name, your work and your number.'],
      ['You set the budget', 'The ad money goes to Google on your own card. Spend more when it is quiet, less when you are booked up.'],
      ['Plain updates', 'You hear how many calls came in and what they cost, in normal words.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Message us', 'Tell us your trade and the jobs you want more of.'],
      ['Agree the price', 'We agree the monthly fee and your ad budget. You pay the first month up front.'],
      ['We set it up', 'We build the ads and your page. You see it all before it goes live.'],
      ['Your phone rings', 'People searching for your trade ring you direct.'],
    ],
    faqs: [
      ['How do I pay?', 'Our fee is a set monthly amount, agreed before we start and paid up front each month. The ad money goes to Google on your own card, separately.'],
      ['Are the calls shared with other firms?', 'No. The ads are yours and the calls come straight to your phone. We never sell the same enquiry to anyone else.'],
      ['Who owns the ads account?', 'You do. It is your account and your card, and you can see everything.'],
      ['Can I stop?', 'Yes. There is no contract. Just do not renew for the next month.'],
    ],
    cta: { title: 'Get the phone ringing.', text: 'Tell us your trade and the jobs you want more of. We reply the same working day.', label: 'Get more calls', msg: "Hi, I'd like more calls for my business." },
    summary: 'Google ads for your trade, with calls straight to your phone.',
  },
  {
    slug: 'google-business', nav: 'Google listing', name: 'Google listing fix', eyebrow: 'Google listing fix',
    title: 'Show up properly on Google Maps.',
    lede: 'For most trades the Google listing gets more views than the website. When someone looks you up, it should look right, say what you do and show your reviews. We set it up or fix it for a one off £49.',
    price: { big: '49', label: 'One off', note: 'Paid up front. No monthly fee.', text: 'For £49 we set up or fix your Google listing, give you a QR card that takes happy customers to your review page, and a short text you can send to past customers asking for a review.' },
    visual: 'gbp',
    listTitle: 'What you get',
    list: [
      ['Set up or claimed', 'Your listing created or claimed and verified in your name.'],
      ['Filled in properly', 'Your services, photos, hours and contact details set up right.'],
      ['Review QR card', 'A card for the van or the counter that takes happy customers straight to your review page.'],
      ['Review text', 'A short message to send past customers asking for a review.'],
      ['Linked to your website', 'So people can see the rest of your work.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Message us', 'Send us your business name.'],
      ['Pay up front', 'You pay the £49, then we get to work.'],
      ['We sort it', 'Listing set up or fixed, usually within a few days.'],
      ['Reviews come in', 'Hand out the QR card and send the review text to past customers.'],
    ],
    faqs: [
      ['How do I pay?', 'A one off £49, paid up front before we start. No monthly fee.'],
      ['Who owns the listing?', 'You do. It is set up in your name.'],
      ['Will you write reviews for me?', 'Never. Fake reviews are banned by Google and against the law. We help you ask your real customers.'],
      ['Do I need a website too?', 'No, but it works best linked to one, and we can build it.'],
    ],
    cta: { title: 'Sort my Google listing.', text: 'Send us your business name. We reply the same working day.', label: 'Sort my listing', msg: "Hi, I'd like my Google listing sorted." },
    summary: 'Your Google listing set up or fixed so you show up properly on Maps.',
  },
  {
    slug: 'websites', nav: 'Websites', name: 'Websites', eyebrow: 'Websites',
    title: 'A proper website for your trade.',
    lede: 'A clean website that works on a phone, shows off your work and makes it easy to ring you. Built for you from scratch, not a template.',
    price: { big: '25', label: 'First 6 months, site and hosting', note: 'Paid up front. Then £75 a year.', text: 'Your website built and live, with hosting for the first 6 months. After that it is £75 a year to keep it running. No contract.' },
    visual: 'site',
    listTitle: 'What you get',
    list: [
      ['Made for you', 'A look built around your business, not a template.'],
      ['Works on a phone', 'Most customers find you on a phone, so we build for that first.'],
      ['Easy to call you', 'Your number and a WhatsApp button on every page.'],
      ['Set up for Google', 'Titles, speed and Google Search Console sorted from day one.'],
      ['Hosting included', 'Fast, secure hosting and small text changes looked after.'],
      ['Yours to own', 'Your domain and your content. No lock in.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Message us', 'A few lines about what you do and some photos of your work is plenty.'],
      ['Pay up front', 'You pay the £25, then we start building.'],
      ['Check it on your phone', 'We send you a link. Tell us any changes.'],
      ['Live', 'We connect your domain and put it live, usually within two working days of your OK.'],
    ],
    faqs: [
      ['How do I pay?', '£25 up front, which covers the site and hosting for the first 6 months. Then £75 a year, paid up front each year.'],
      ['Do I need to send anything?', 'A few photos of your work and your contact details. We can pull the rest from your Google listing or a quick chat.'],
      ['Can I use my own domain?', 'Yes. We connect one you already own, or help you buy one in your name.'],
      ['What if I want to leave?', 'No contract. If you stop paying the yearly fee the site comes down, and we can hand over the files if you ask.'],
    ],
    cta: { title: 'Get a proper website.', text: 'Send us your business name and what you do. We reply the same working day.', label: 'Get a website', msg: "Hi, I'd like a website for my business." },
    summary: 'A proper website for your trade that works on a phone.',
  },
  {
    slug: 'seo', nav: 'Google SEO', name: 'Google SEO', eyebrow: 'Google SEO',
    title: 'Higher up Google for your trade.',
    lede: 'When someone searches for your trade, your website should be on the first page. We set your site up so Google, and AI apps like ChatGPT, understand exactly what you do and recommend you.',
    price: { headline: 'Ask us', label: 'Priced to your site', note: 'A fixed price agreed before we start. Paid up front.', text: 'Every site is different, so we take a quick look first and give you a clear price. Basic Google setup is already included with every website we build.' },
    visual: 'seo',
    listTitle: 'What you get',
    list: [
      ['A check of your site', 'We see how Google reads your site today and what is holding it back.'],
      ['One page per job', 'A clear page for each service you offer, so you show up for each one.'],
      ['Behind the scenes fixes', 'Speed, titles and the hidden details Google reads, all sorted.'],
      ['Found by AI apps', 'Set up so ChatGPT and Gemini can recommend you too.'],
      ['Google Search Console', 'Set up and your site sent to Google properly.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Message us', 'Send us your website.'],
      ['Agree the price', 'We take a quick look and give you a clear price. You pay up front.'],
      ['We fix it', 'Pages, speed and the behind the scenes setup sorted.'],
      ['You climb', 'Google takes a few months, and we tell you how it is going.'],
    ],
    faqs: [
      ['How do I pay?', 'We give you a fixed price after a quick look at your site, paid up front before we start.'],
      ['How long does it take?', 'Google takes time. Expect movement over a few months, not days. If you need calls this week, our Google ads are the faster route.'],
      ['Does it work on my current site?', 'Usually, yes. If your site makes it hard, we tell you straight before you spend anything.'],
    ],
    cta: { title: 'Get found on Google.', text: 'Send us your website. We reply the same working day.', label: 'Get found', msg: "Hi, I'd like help showing up on Google." },
    summary: 'Your website set up to climb Google and be recommended by AI apps.',
  },
  {
    slug: 'motion', nav: 'Reels', name: 'Reels and video ads', eyebrow: 'Reels and video ads',
    title: 'Videos that stop the scroll.',
    lede: 'Short videos and video ads for Instagram, Facebook and TikTok, made for your business. No filming needed from you.',
    price: { headline: 'Ask us', label: 'Priced per video', note: 'A fixed price agreed before we start. Paid up front.' },
    visual: 'reel',
    listTitle: 'What you get',
    list: [
      ['Reels and TikToks', 'Short videos made for the feed, with a clear ask at the end.'],
      ['Video ads', 'Cut to the right size for Instagram, Facebook, TikTok and YouTube.'],
      ['We write it', 'The idea and the words, done with you.'],
      ['Ready to post', 'Delivered in every size you need, with a caption.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Message us', 'Tell us what you want more of: calls, bookings or a launch.'],
      ['Agree the price', 'We send the idea and a fixed price. You pay up front.'],
      ['We make it', 'You get a first cut to watch on your phone.'],
      ['Ready to post', 'Your changes made, then sent over in every size.'],
    ],
    faqs: [
      ['How do I pay?', 'A fixed price per video or per batch, agreed before we start and paid up front.'],
      ['Do I need to film anything?', 'No. If you have photos or clips of your work we can use them too.'],
      ['Who owns the videos?', 'You do. Post them wherever you like.'],
    ],
    cta: { title: 'Get a video made.', text: 'Tell us what you do and where you post. We reply the same working day.', label: 'Ask about a video', msg: "Hi, I'd like to ask about a video for my business." },
    summary: 'Reels and video ads for Instagram, Facebook and TikTok.',
  },
  {
    slug: 'tenders', nav: 'Tenders', name: 'Tender writing', eyebrow: 'Tender writing',
    title: 'We write the bid. You win the work.',
    lede: 'Councils, housing associations, schools and the NHS hire trades every week. Plenty of small firms could do the work but never bid, because the paperwork looks like a second job. We do the paperwork.',
    price: { headline: 'Ask us', label: 'Priced per bid', note: 'A fixed price agreed before we start. Paid up front.' },
    visual: 'bid',
    listTitle: 'What you get',
    list: [
      ['Contracts that fit', 'We look out for public contracts that suit a firm your size.'],
      ['A straight answer first', 'We read it and tell you honestly if it is worth bidding before you spend anything.'],
      ['The whole bid written', 'Every question answered from what you tell us about how you work.'],
      ['Everything checked', 'Every form and document checked before it goes in.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Send the tender', 'Forward the notice. No tender yet? Tell us what you do.'],
      ['Agree the price', 'We tell you if it is worth bidding and give you a fixed price. You pay up front.'],
      ['We write it', 'A short call with you, then every answer drafted.'],
      ['Submitted', 'Checked with you and sent in before the deadline.'],
    ],
    faqs: [
      ['How do I pay?', 'A fixed price per bid, agreed before we start and paid up front.'],
      ['Who is it for?', 'Small firms bidding for council, housing, school and NHS work, first tender or tenth.'],
      ['What if it is not worth bidding?', 'We tell you straight, before you pay for anything.'],
    ],
    cta: { title: 'Got a tender? Send it over.', text: 'Forward the notice and we tell you straight if it is worth bidding.', label: 'Send us a tender', msg: "Hi, I have a tender I'd like help with." },
    summary: 'We find contracts that fit and write the bid for you.',
  },
  {
    slug: 'google-ads', nav: 'Google Ads', name: 'Google Ads only', eyebrow: 'Google Ads only',
    title: 'Already have a website? We run the ads.',
    lede: 'If your website is fine and you just need the calls, we set up and run your Google ads and send people straight to it.',
    price: { headline: 'Monthly', label: 'Our fee', note: 'A set monthly fee, agreed before we start. Paid up front each month.', text: 'The ad money is separate: it goes to Google on your own card, and you choose the budget.' },
    visual: 'ads',
    listTitle: 'What you get',
    list: [
      ['The right searches', 'Ads that show for what your customers actually type.'],
      ['No wasted money', 'We stop your ads showing for searches that never turn into work.'],
      ['Every call counted', 'You see which calls came from the ads.'],
      ['Looked after monthly', 'We cut what does not work and push what does.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Message us', 'Send us your website and your trade.'],
      ['Agree the price', 'We agree the monthly fee and your ad budget. You pay the first month up front.'],
      ['We set it up', 'Ads built and checked with you before they go live.'],
      ['Your phone rings', 'People searching for your trade ring you direct.'],
    ],
    faqs: [
      ['How do I pay?', 'Our fee is a set monthly amount, paid up front each month. The ad money goes to Google on your own card, separately.'],
      ['How much should I spend on ads?', 'It depends on your trade. We suggest a sensible starting budget and you can change it any time.'],
      ['Who owns the account?', 'You do. Your account, your card.'],
    ],
    cta: { title: 'Get the phone ringing.', text: 'Send us your website and your trade. We reply the same working day.', label: 'Ask about ads', msg: "Hi, I'd like you to run Google ads for my business." },
    summary: 'Google ads run for you, sending people to the website you already have.',
  },
  {
    slug: 'ai', nav: 'AI', name: 'AI receptionist', eyebrow: 'AI receptionist',
    title: 'Never miss a customer again.',
    lede: 'When you are on a job or asleep, an AI receptionist answers your customers on WhatsApp and your website, asks the right questions and books the job in.',
    price: { headline: 'Monthly', label: 'Our fee', note: 'A set monthly fee, agreed before we start. Paid up front each month.' },
    visual: 'chat',
    listTitle: 'What you get',
    list: [
      ['Knows your business', 'Your services, prices and common questions.'],
      ['Answers straight away', 'On WhatsApp and your website, day and night.'],
      ['Asks the right questions', 'So you only get the jobs worth having.'],
      ['Books the job', 'Puts it in your diary and sends you the details.'],
      ['Hands over to you', 'Passes anything it is not sure about to you.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Message us', 'Tell us your trade and how customers usually contact you.'],
      ['Agree the price', 'We agree the monthly fee. You pay the first month up front.'],
      ['We set it up', 'Loaded with your services and prices, and tested with you.'],
      ['Live', 'Answering customers while you work or sleep.'],
    ],
    faqs: [
      ['How do I pay?', 'A set monthly fee, agreed before we start and paid up front each month.'],
      ['Will it say the wrong thing?', 'It only answers from what you approve, and passes anything else to you.'],
      ['How long does setup take?', 'Usually about a week, including testing.'],
    ],
    cta: { title: 'Let it answer for you.', text: 'Tell us your trade. We reply the same working day.', label: 'Ask about it', msg: "Hi, I'd like to ask about the AI receptionist." },
    summary: 'Answers your customers and books jobs, day and night.',
  },
  {
    slug: 'care', nav: 'Website care', name: 'Website care', eyebrow: 'Website care',
    title: 'Your website looked after.',
    lede: 'Hosting, updates, backups and small changes handled for you, so your site stays fast and safe while you get on with the work.',
    price: { headline: '£75', label: 'A year, for websites we build', note: 'Paid up front once your first 6 months are up. Other sites priced after a quick look.' },
    visual: 'care',
    listTitle: 'What you get',
    list: [
      ['Fast hosting', 'Quick, secure hosting included.'],
      ['Updates and backups', 'Everything kept up to date and backed up.'],
      ['Small changes', 'New prices or photos: just send them over.'],
      ['Monthly check', 'We make sure it is up, fast and working.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Pay yearly', '£75 a year, paid up front.'],
      ['Send changes', 'WhatsApp us whatever you want updating.'],
      ['We check it', 'Speed and uptime checked every month.'],
      ['Backed up', 'Your site copied and stored safely.'],
    ],
    faqs: [
      ['How do I pay?', '£75 a year, paid up front, for websites we build. Other sites are priced after a quick look.'],
      ['How do I ask for a change?', 'Just send it over on WhatsApp or email.'],
      ['What if I want to leave?', 'No contract. We can hand over the files if you ask.'],
    ],
    cta: { title: 'Keep your site looked after.', text: 'Tell us about your site. We reply the same working day.', label: 'Ask about care', msg: "Hi, I'd like to ask about website care." },
    summary: 'Hosting, updates and small changes handled every month.',
  },
]

export const homeFaqs: [string, string][] = [
  ['How do I pay?', 'Everything is paid up front, before we start. A website is £25 for the first 6 months, then £75 a year. A Google listing fix is a one off £49. Getting more calls is a set monthly fee, agreed with you first and paid at the start of each month.'],
  ['Do I have to sign a contract?', 'No. Pay for what you want, when you want it. Stop any time.'],
  ['Are the calls shared with other firms?', 'No. The ads are yours and the calls come straight to your phone. We never sell the same enquiry to anyone else.'],
  ['I am not good with computers. Is that a problem?', 'Not at all. We do all of it and keep you posted on WhatsApp in plain words.'],
  ['How quickly can you start?', 'Usually within a few days of you paying.'],
]
