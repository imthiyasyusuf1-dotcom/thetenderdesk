import { useEffect, useRef, useState } from 'react'
import { services, homeFaqs, wa, MAIL, B } from './content'
import type { Service } from './content'

// Plain, calm site for small trades: no smooth scroll, no text effects, no scroll animation.

const HELLO = "Hi, I'd like more calls for my business."

const WaIcon = () => (
  <svg className="waicon" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" /></svg>
)

const WaBtn = ({ msg = HELLO, label = 'Message us on WhatsApp', big = false }: { msg?: string; label?: string; big?: boolean }) => (
  <a className={'btn wa' + (big ? ' big' : '')} href={wa(msg)} target="_blank" rel="noopener"><WaIcon />{label}</a>
)

function Faq({ items }: { items: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="faq">
      {items.map(([q, a], i) => (
        <div className={'qa' + (open === i ? ' on' : '')} key={q}>
          <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            <span>{q}</span><i aria-hidden="true" />
          </button>
          {open === i && <p className="ans">{a}</p>}
        </div>
      ))}
    </div>
  )
}

function Contact({ title, text, msg }: { title: string; text: string; msg: string }) {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <div className="wrap">
        <div className="contactbox">
          <h2 id="contact-h">{title}</h2>
          <p>{text}</p>
          <div className="ctas">
            <WaBtn msg={msg} big />
            <a className="btn plain" href={MAIL}>Or email hello@thetenderdesk.co.uk</a>
          </div>
        </div>
      </div>
    </section>
  )
}

const Founder = () => (
  <section className="wrap sec" aria-labelledby="who-h">
    <div className="founder">
      <h2 id="who-h">Who you deal with</h2>
      <p>Founded and run by Yusuf Imthiyas. You talk to the person doing the work, on WhatsApp, in plain words. No call centre, no account managers, no jargon.</p>
      <a className="textlink" href={`${B}about/`}><u>About us</u> <span aria-hidden="true">→</span></a>
    </div>
  </section>
)

// ---------- home ----------

const three: { slug: string; title: string; text: string; price: string; sub: string }[] = [
  { slug: 'customers', title: 'Get more calls', text: 'We run Google ads for your trade, so people nearby searching for what you do ring your phone. The calls come straight to you and are never shared.', price: 'First month free', sub: 'Then a set monthly fee, agreed up front.' },
  { slug: 'google-business', title: 'Get found on Google', text: 'We sort your Google listing so you show up on Maps with your reviews, and set your website up to climb the search results.', price: '£49', sub: 'One off Google listing fix.' },
  { slug: 'websites', title: 'A proper website', text: 'A clean site that works on a phone and makes it easy to ring you. We build you a free mock‑up first, so you see it before you pay.', price: '£25', sub: 'For the first 6 months, then £75 a year.' },
]

const steps: [string, string][] = [
  ['Message us', 'Send a WhatsApp. Tell us your trade and the jobs you want more of.'],
  ['We set it up', 'We do all of it. You see everything and say yes before it goes live.'],
  ['Your phone rings', 'Customers call you direct. You get on with the work.'],
]

const prices: [string, string, string][] = [
  ['More calls (Google ads)', 'First month free', 'Then a set monthly fee, agreed with you before anything starts. The ad money goes to Google on your own card, and you choose the budget.'],
  ['Google listing fix', '£49', 'One off. Your listing set up or fixed, plus a review QR card.'],
  ['Website', '£25', 'Site and hosting for the first 6 months, then £75 a year. No contract.'],
  ['Google SEO', 'Ask us', 'Priced to your site after a quick look.'],
]

const alsoDo: [string, string, string][] = [
  ['motion', 'Reels and video ads', 'Short videos for Instagram and TikTok.'],
  ['tenders', 'Tender writing', 'Bids for council and public contracts.'],
  ['ai', 'AI receptionist', 'Answers customers and books jobs when you cannot.'],
  ['google-ads', 'Google Ads only', 'Already have a site? We just run the ads.'],
  ['care', 'Website care', 'Changes, updates and hosting looked after.'],
]

function Home() {
  return (
    <>
      <section className="hero homehero wrap" id="top">
        <h1>More calls from local customers.</h1>
        <p className="lede">Your first month is free. You only carry on if the phone is ringing.</p>
        <WaBtn big />
      </section>

      <section className="wrap sec" id="services" aria-labelledby="svc-h">
        <h2 id="svc-h">What we do for trades</h2>
        <p className="secsub">For plumbers, builders, electricians, roofers and every other local trade.</p>
        <ul className="boxes">
          {three.map(x => (
            <li key={x.slug} className="box">
              <h3>{x.title}</h3>
              <p>{x.text}</p>
              <p className="boxprice"><strong>{x.price}</strong> <span>{x.sub}</span></p>
              <p className="boxlinks">
                <a className="textlink" href={`${B}${x.slug}/`}><u>Find out more</u> <span aria-hidden="true">→</span></a>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap sec" id="how" aria-labelledby="how-h">
        <h2 id="how-h">How it works</h2>
        <ol className="steps">
          {steps.map(([t, d], i) => <li key={t}><span className="stepn">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}
        </ol>
      </section>

      <section className="wrap sec" id="prices" aria-labelledby="prices-h">
        <h2 id="prices-h">Prices</h2>
        <p className="secsub">Real prices, up front. You see a free mock‑up of your website before you pay a penny.</p>
        <ul className="pricelist">
          {prices.map(([n, p, d]) => <li key={n}><span className="pn">{n}</span><span className="pp">{p}</span><span className="pd">{d}</span></li>)}
        </ul>
      </section>

      <section className="wrap sec" aria-labelledby="faq-h">
        <h2 id="faq-h">Questions</h2>
        <Faq items={homeFaqs} />
      </section>

      <Founder />

      <section className="wrap sec" id="also" aria-labelledby="also-h">
        <h2 id="also-h">We also do</h2>
        <ul className="also">
          {alsoDo.map(([slug, n, d]) => <li key={slug}><a href={`${B}${slug}/`}><span className="an">{n}</span><span className="ad">{d}</span><span aria-hidden="true" className="arrow">→</span></a></li>)}
        </ul>
      </section>

      <Contact title="Want more calls?" text="Send us a WhatsApp with your trade. We reply the same working day." msg={HELLO} />
    </>
  )
}

// ---------- reels and example sites (own pages only) ----------

// muted looping clip that only loads and plays while on screen
function ReelClip({ name }: { name: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.35 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  const base = B + 'img/reels/' + name
  return <video ref={ref} className="reelvid" src={base + '.mp4'} poster={base + '.webp'} muted loop playsInline preload="none" width={540} height={960} aria-hidden="true" />
}

const reels: [string, string][] = [
  ['r-nevercloses', 'It is 2am. You are asleep.'],
  ['r-roof', 'Storm last night'],
  ['r-tender', '£184,000 from one tender'],
  ['r-plumberweek', 'AI ran a plumber for a week'],
  ['r-services', 'Built for small businesses'],
  ['r-receptionist', 'You are under a sink'],
  ['r-onedesk', 'Fourteen tabs. One desk.'],
  ['r-premium', 'Finally feels premium'],
]

function ReelPlayer({ name, label, onClose }: { name: string; label: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.documentElement.classList.add('lock')
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.classList.remove('lock'); prev?.focus() }
  }, [onClose])
  const base = B + 'img/reels/' + name
  return (
    <div className="reelbox" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <video className="reelbig" src={base + '.mp4'} poster={base + '.webp'} autoPlay muted loop playsInline onClick={e => e.stopPropagation()} width={720} height={1280} />
      <button ref={closeRef} className="reelx" aria-label="Close reel" onClick={onClose}><i /><i /></button>
      <p className="reelcap">{label}</p>
    </div>
  )
}

function Reels() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="wrap sec" id="reels" aria-labelledby="reels-h">
      <h2 id="reels-h">Reels we have made</h2>
      <p className="secsub">From The Tender Desk feed, shown without their songs. Tap one to watch it.</p>
      <ul className="reelrow">
        {reels.map(([name, t], i) => (
          <li key={name}>
            <button className="reeltap" onClick={() => setOpen(i)} aria-label={`Play reel: ${t}`}>
              <div className="reelphone"><ReelClip name={name} /><span className="reelplay" aria-hidden="true" /></div>
            </button>
            <p>{t}</p>
          </li>
        ))}
      </ul>
      <a className="textlink" href="https://www.instagram.com/thetenderdesk.co.uk/" target="_blank" rel="noopener"><u>More on our Instagram</u> <span aria-hidden="true">↗</span></a>
      {open !== null && <ReelPlayer name={reels[open][0]} label={reels[open][1]} onClose={() => setOpen(null)} />}
    </section>
  )
}

const work: [string, string, string, string][] = [
  ['hartley', 'Hartley Plumbing and Heating', 'Plumbing and heating', '/studio/hartley/'],
  ['builder', 'Ferrow and Kell', 'Builders', '/s/builder/'],
  ['oakfield', 'Oakfield Barber Co.', 'Barbers', '/studio/oakfield/'],
  ['ironclad', 'Ironclad Detailing', 'Car detailing', '/studio/ironclad/'],
]

function Sites() {
  return (
    <section className="wrap sec" id="work" aria-labelledby="work-h">
      <h2 id="work-h">Sites we have built</h2>
      <ul className="exgrid">
        {work.map(([img, name, trade, href]) => (
          <li key={img}>
            <a className="excard" href={href} target="_blank" rel="noopener">
              <span className="exshot"><img src={`${B}img/sites/${img}.webp`} width={540} height={1004} alt={`${name} website on a phone`} loading="lazy" decoding="async" /></span>
              <span className="extrade">{trade}</span>
              <span className="exname">{name}</span>
            </a>
          </li>
        ))}
      </ul>
      <a className="textlink" href="/work/"><u>See all our work</u> <span aria-hidden="true">→</span></a>
    </section>
  )
}

// ---------- service pages ----------

function PriceBox({ s }: { s: Service }) {
  const big = s.price.big ? '£' + s.price.big : s.price.headline ?? 'Ask us'
  return (
    <div className="pricebox" id="price">
      <p className="plabel">{s.price.label}</p>
      <p className="pbig">{big}</p>
      <p className="pnote">{s.price.note}</p>
      {s.price.text && <p className="ptext">{s.price.text}</p>}
    </div>
  )
}

function ServicePage({ s }: { s: Service }) {
  const others = services.filter(o => o.slug !== s.slug)
  return (
    <>
      <section className="hero wrap" id="top">
        <p className="eyebrow">{s.eyebrow}</p>
        <h1>{s.title}</h1>
        <p className="lede">{s.lede}</p>
        <WaBtn msg={s.cta.msg} label={s.cta.label} big />
      </section>

      <section className="wrap sec" aria-label="Price"><PriceBox s={s} /></section>

      <section className="wrap sec" aria-labelledby="what-h">
        <h2 id="what-h">What you get</h2>
        <ul className="checks">{s.list.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}</ul>
      </section>

      <section className="wrap sec" aria-labelledby="how-h">
        <h2 id="how-h">How it works</h2>
        <ol className="steps">{s.steps.map(([t, d], i) => <li key={t}><span className="stepn">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}</ol>
      </section>

      {(s.extra || s.extraIntro) && (
        <section className="wrap sec" aria-labelledby="extra-h">
          {s.extraTitle && <h2 id="extra-h">{s.extraTitle}</h2>}
          {s.extraIntro && <p className="secsub wide">{s.extraIntro}</p>}
          {s.extra && <ul className="chips">{s.extra.map(x => <li key={x}>{x}</li>)}</ul>}
        </section>
      )}

      {s.slug === 'websites' && <Sites />}
      {s.slug === 'motion' && <Reels />}

      <section className="wrap sec" aria-labelledby="faq-h">
        <h2 id="faq-h">Questions</h2>
        <Faq items={s.faqs} />
      </section>

      <section className="wrap sec" aria-labelledby="more-h">
        <h2 id="more-h">Other things we do</h2>
        <ul className="morelist">{others.map(o => <li key={o.slug}><a href={`${B}${o.slug}/`}><span>{o.name}</span><span aria-hidden="true">→</span></a></li>)}</ul>
      </section>

      <Contact title={s.cta.title} text={s.cta.text} msg={s.cta.msg} />
    </>
  )
}

function About() {
  return (
    <>
      <section className="hero wrap" id="top">
        <p className="eyebrow">About</p>
        <h1>Founded and run by Yusuf Imthiyas.</h1>
        <p className="lede">The Tender Desk helps small trades get more work: more calls from Google, a proper website and a Google listing that shows up. One person, plain words, real prices.</p>
        <WaBtn msg="Hi, I'd like to talk about my business." label="Say hello on WhatsApp" big />
      </section>
      <section className="wrap sec" aria-labelledby="story-h">
        <h2 id="story-h">Why it exists</h2>
        <div className="prose">
          <p>Plenty of good trades lose work they should win. Great reviews, a phone that should be ringing, and a website or Google listing that lets them down. That is the bit we fix.</p>
          <p>Yusuf is a final year Chemical Engineering student who worked in a testing lab, where a missed detail means a wrong result. The same care goes into every site and every ad. You deal with him from the first message to the day it goes live.</p>
        </div>
      </section>
      <section className="wrap sec" aria-labelledby="count-h">
        <h2 id="count-h">What you can count on</h2>
        <ul className="checks">
          {([['Straight answers', 'If something will not bring you work, we say so before you spend a penny on it.'], ['Yours to own', 'Your website, your domain, your Google listing, your ads account.'], ['No contract', 'No long tie in. If it is not working for you, you stop.'], ['Real reviews only', 'We never write fake reviews or claim clients we do not have.']] as [string, string][]).map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
        </ul>
      </section>
      <Contact title="Let's talk about your business." text="Send a WhatsApp. We reply the same working day." msg="Hi, I'd like to talk about my business." />
    </>
  )
}

function Partners() {
  const steps: [string, string][] = [['Introduce', 'Send us their name and number, or copy us into an email. Ask them first, of course.'], ['We take it from there', 'A straight conversation about what would actually help. No hard sell, and we keep you posted.'], ['You get thanked', 'If they become a client, you get 10% of what they pay in their first year, once they have paid.']]
  return (
    <>
      <section className="hero wrap" id="top">
        <p className="eyebrow">Referral partners</p>
        <h1>Know a trade that needs more work?</h1>
        <p className="lede">Introduce them to us. If they become a client, you get a thank you of 10% of what they pay in their first year. Nothing to sign up to, no targets.</p>
        <WaBtn msg="Hi, I'd like to become a referral partner." label="Become a partner" big />
      </section>
      <section className="wrap sec" aria-labelledby="h-h">
        <h2 id="h-h">How it works</h2>
        <ol className="steps">{steps.map(([t, d], i) => <li key={t}><span className="stepn">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}</ol>
      </section>
      <Contact title="Let's work together." text="Tell us a little about you. We reply the same working day." msg="Hi, I'd like to become a referral partner." />
    </>
  )
}

// ---------- shell ----------

const navItems: [string, string, string][] = [['customers', 'More calls', `${B}customers/`], ['google-business', 'Google listing', `${B}google-business/`], ['websites', 'Websites', `${B}websites/`], ['prices', 'Prices', `${B}#prices`], ['about', 'About', `${B}about/`]]
const menuItems: [string, string, string][] = [
  ['customers', 'Get more calls', `${B}customers/`], ['google-business', 'Google listing fix', `${B}google-business/`], ['seo', 'Google SEO', `${B}seo/`], ['websites', 'Websites', `${B}websites/`], ['prices', 'Prices', `${B}#prices`],
  ['motion', 'Reels and video ads', `${B}motion/`], ['tenders', 'Tender writing', `${B}tenders/`], ['ai', 'AI receptionist', `${B}ai/`], ['work', 'Our work', '/work/'], ['about', 'About', `${B}about/`], ['partners', 'Referral partners', `${B}partners/`],
]

const route = () => window.location.pathname.slice(B.length).split('/')[0]

export default function App() {
  const r = route()
  const s = services.find(x => x.slug === r)
  const [menu, setMenu] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('lock', menu)
    if (!menu) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); burgerRef.current?.focus() } }
    const onResize = () => { if (window.innerWidth > 900) setMenu(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize) }
  }, [menu])

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav wrap">
        <a href={B} className="brand" aria-label="The Tender Desk, home">The Tender Desk</a>
        <nav aria-label="Main" className="dnav">
          {navItems.map(([slug, label, href]) => <a key={slug} href={href} aria-current={r === slug ? 'page' : undefined}>{label}</a>)}
        </nav>
        <div className="navr">
          <a className="navcta" href={wa(HELLO)} target="_blank" rel="noopener"><WaIcon />WhatsApp us</a>
          <button ref={burgerRef} className="burger" aria-expanded={menu} aria-controls="menu" aria-label={menu ? 'Close menu' : 'Open menu'} onClick={() => setMenu(!menu)}><i /><i /><i /></button>
        </div>
      </header>
      <div id="menu" className={'menu' + (menu ? ' on' : '')} aria-hidden={!menu} inert={!menu}>
        <div className="menubar wrap">
          <a href={B} className="brand" aria-label="The Tender Desk, home" onClick={() => setMenu(false)}>The Tender Desk</a>
          <button className="burger x" aria-label="Close menu" onClick={() => { setMenu(false); burgerRef.current?.focus() }}><i /><i /></button>
        </div>
        <nav aria-label="Menu" className="menulinks wrap">
          {menuItems.map(([slug, label, href]) => (
            <a key={slug} href={href} aria-current={r === slug ? 'page' : undefined} onClick={() => setMenu(false)}>{label}</a>
          ))}
        </nav>
        <div className="menufoot wrap">
          <WaBtn big />
          <a className="menumail" href={MAIL}>hello@thetenderdesk.co.uk</a>
        </div>
      </div>

      <main id="main">
        {s ? <ServicePage s={s} /> : r === 'about' ? <About /> : r === 'partners' ? <Partners /> : <Home />}
      </main>

      <footer className="foot wrap">
        <div className="fcols">
          <div><p className="brand">The Tender Desk</p><p>More calls, a proper website and a Google listing that works, for small trades.</p><p>Founded and run by Yusuf Imthiyas.</p></div>
          <div><p className="fh">Services</p>{services.slice(0, 4).map(x => <a key={x.slug} href={`${B}${x.slug}/`}>{x.name}</a>)}<a href={`${B}#also`}>Everything else</a></div>
          <div><p className="fh">Company</p><a href={`${B}about/`}>About</a><a href="/work/">Our work</a><a href={`${B}partners/`}>Referral partners</a><a href={MAIL}>hello@thetenderdesk.co.uk</a></div>
        </div>
        <p className="fbase">© {new Date().getFullYear()} The Tender Desk</p>
      </footer>
    </>
  )
}
