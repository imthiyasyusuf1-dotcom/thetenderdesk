# Feature research: what makes local-business demo sites feel "Instagram ad" good

Written September 2026 for The Tender Desk demo builds. Goal: features that wow a prospect in a 10 second scroll AND help the real business win enquiries.

## What the showcase galleries reward

- Awwwards category tags that recur on winning sites: Microinteractions, Scrolling, Storytelling, Transitions, Typography, Gestures / Interaction, Forms and Input, Parallax. Technology tags most used: GSAP, Lenis, Barba.js, Canvas API, WebGL. Source: https://www.awwwards.com/websites/local-business/ and https://www.awwwards.com/websites/microinteractions/
- Godly (https://godly.website) and Siteinspire (https://www.siteinspire.com) front pages are dominated by oversized typography, split-text line reveals, smooth scroll, infinite marquees and cursor-reactive elements.
- Lenis has become the default smooth scroll layer on award sites: under 5kb, native scroll kept (accessibility intact), keeps scroll-linked animation in sync. Source: https://lenis.darkroom.engineering/
- Native CSS scroll-driven animations (`animation-timeline: view()` / `scroll()`) now ship in Chrome 115+ and Safari 26, so scroll-scrubbed reveals no longer need a heavy library. Source: https://developer.chrome.com/docs/css-ui/scroll-driven-animations

## The recurring "reel" features (web designer Instagram / TikTok ads)

Observed patterns in designer reels and the galleries above:

1. Scroll-scrubbed hero: image sequence or product that builds/rotates as you scroll (Apple style). Wow factor very high; costs weight, so use SVG/CSS layers or few images for local sites.
2. Split-text headline reveals: words slide up from a mask as the section enters.
3. Magnetic buttons and custom cursors: the CTA leans toward the pointer. Desktop only, useless on touch.
4. Infinite marquees: reviews, services or brand words ticking past.
5. Interactive configurators: pick options, watch a visual and price update live (quote builders, product builders).
6. Before/after drag sliders (trades, barbers, cleaners, dentists).
7. Live status: "Open now", "next free slot", countdown to an order cut-off. Creates urgency honestly.
8. Animated counters for proof numbers.
9. Sticky bottom action bar on mobile (Call / Book / WhatsApp).
10. Theming (dark/light), 3D tilt cards, grain overlays.

## What actually converts for local businesses

- Motion should explain a change or draw attention to the next action; the effect must begin within 0.1s of the user action; avoid repeated peripheral motion that competes with reading. Source: https://www.nngroup.com/articles/animation-usability/
- Price transparency and instant estimates reduce the "call to find out" barrier for trades (quote calculators are the most common lead magnet on high-performing trade sites).
- Booking with visible real slots beats "contact us" for appointment businesses (barbers, gyms).
- Mobile sticky call/book bars keep the primary action one thumb away.
- Only animate transform and opacity to stay on the compositor and hit 60fps. Source: https://web.dev/articles/animations-guide

## Rules adopted for the demos

- Every feature must end in an action (book, call, order, enquire) or clarify price/availability.
- transform/opacity only, rAF for pointer effects, passive listeners, IntersectionObserver for reveals, `prefers-reduced-motion` disables motion, magnetic effects only on `(hover:hover) and (pointer:fine)`.
- No frameworks; each demo gets one small `fx.js` + `fx.css` (a few kb).
- Fictional businesses stay fictional: sample content labelled, no real names.

## Per demo picks

| Demo | Business | Features |
|---|---|---|
| Fade House | Barber | Fade height builder (live SVG + price, books that cut), live "open now / next chair" pill, magnetic CTAs, mobile sticky book bar, split-text headings |
| FlowRight | Plumber | Instant quote calculator (job, property, urgency, time), live "engineers on call" status, mobile sticky emergency call bar, magnetic CTAs, split-text |
| Crumble & Co | Dessert parlour | Scroll-driven sundae build (layers drop in as you scroll), live open status, magnetic CTAs, split-text |
| IronCore | Gym | Plan finder (answers → recommended plan + monthly cost), live "next class" countdown, mobile sticky free-trial bar, magnetic CTAs |
| Rise & Crust (sourdough) | Bakery | Order cut-off countdown ("order in Xh Ym for tomorrow"), "fresh out the oven" bake board by time of day, magnetic CTAs, split-text |
| BLVD Frames | Eyewear | Left as is: already has photoreal scroll hero, magnetic cursor, Lenis, GSAP; its source of truth is a separate repo that overwrites this mirror |
