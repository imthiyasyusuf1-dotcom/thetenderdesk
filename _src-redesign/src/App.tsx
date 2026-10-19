import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitText from './bits/SplitText'
import BlurText from './bits/BlurText'
import ShinyText from './bits/ShinyText'
import AnimatedContent from './bits/AnimatedContent'
import Magnet from './bits/Magnet'
import StarBorder from './bits/StarBorder'
import { Marquee, Ticker } from './bits/Details'
import { services, moves, whyUs, homeFaqs, wa, MAIL, B } from './content'
import type { Service } from './content'
import { ServiceVisual, ReelClip, HeroVisual, reduce } from './Visuals'

gsap.registerPlugin(ScrollTrigger)

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) =>
  reduce ? <>{children}</> : (
    <AnimatedContent distance={28} duration={0.9} ease="power3.out" initialOpacity={0} threshold={0.12} delay={delay}>
      {children}
    </AnimatedContent>
  )

const Display = ({ text }: { text: string }) => (
  <h1 className="display">
    {reduce ? text : (
      <SplitText text={text} tag="span" splitType="words" delay={70} duration={1.1} ease="power4.out"
        from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0} rootMargin="0px" textAlign="left" />
    )}
  </h1>
)

const Head = ({ n, text, id }: { n: string; text: string; id: string }) => (
  <>
    <div className="rule" />
    <div className="sechead">
      <p className="num">{n}</p>
      <h2 id={id} className="h2">{reduce ? text : <BlurText text={text.replace(/ (\S+)$/, '\u00a0$1')} animateBy="words" delay={90} direction="bottom" />}</h2>
    </div>
  </>
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
          <div className="ans" role="region"><div><p>{a}</p></div></div>
        </div>
      ))}
    </div>
  )
}

const Amount = ({ n }: { n: number }) => (
  <p className="amount"><span className="cur">£</span><Ticker value={String(n)} /></p>
)

function Contact({ n, title, text, msg }: { n: string; title: string; text: string; msg: string }) {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <span id="start" />
      <div className="wrap">
        <p className="num light">{n}</p>
        <h2 id="contact-h" className="display light">{title}</h2>
        <p className="lede light">{text}</p>
        <div className="ctas">
          <a className="btn cream shimmer" href={wa(msg)} target="_blank" rel="noopener">Message on WhatsApp</a>
          <StarBorder as="a" href={MAIL} className="btn outline" color="#f4f0e7" trailColor="rgba(244,239,232,.25)" backgroundColor="#1b1a17" textColor="#f4f0e7" borderColor="rgba(244,239,232,.22)" radius={999} duration={7} stars={1} glow={0} sparkle={false} clickPulse={false}>hello@thetenderdesk.co.uk</StarBorder>
        </div>
      </div>
    </section>
  )
}

function Work({ n }: { n: string }) {
  return (
    <section className="work wrap" id="work" aria-labelledby="work-h">
      <Head n={n} text="Recent work" id="work-h" />
      <div className="case">
        <Reveal>
          <a className="frame" href="https://7ei8ht6properties.com/" target="_blank" rel="noopener">
            <img className="shot" src={B + 'img/786-home-1520.webp'} srcSet={`${B}img/786-home-800.webp 800w, ${B}img/786-home-1520.webp 1520w`} sizes="(max-width: 900px) 92vw, 760px" width={1520} height={950} alt="Homepage of the 7ei8ht6 Properties website" loading="lazy" decoding="async" />
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="casetext">
            <p className="small">Client</p>
            <h3>7ei8ht6 Properties</h3>
            <p>A bilingual English and Arabic site for a property brokerage, with a profile for every member of the team and direct contact details, and the whole site loads fast on a phone.</p>
            <a className="textlink" href="https://7ei8ht6properties.com/" target="_blank" rel="noopener">Visit the live site <span aria-hidden="true">↗</span></a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const reels: [string, string, string][] = [
  ['morph', 'From scribble to site', 'Shape morph and type, 10 seconds'],
  ['type', 'Your website has one second', 'Kinetic type and sound, 10 seconds'],
  ['apple', 'They search on their phone', 'App style motion, 20 seconds'],
]

function Reels({ n, more = true }: { n: string; more?: boolean }) {
  return (
    <section className="wrap block" id="reels" aria-labelledby="reels-h">
      <Head n={n} text="Reels that stop the scroll" id="reels-h" />
      <div className="indent"><Reveal><p className="lede">Motion design, video ads and reels for Instagram and TikTok. These are a few we made for The Tender Desk's own feed. Yours would be made from scratch around your business.</p></Reveal></div>
      <ul className="reelrow">
        {reels.map(([name, t, d], i) => (
          <li key={name}><Reveal delay={i * 0.08}>
            <div className="reelphone"><ReelClip name={name} label={t} /></div>
            <h3>{t}</h3><p>{d}</p>
          </Reveal></li>
        ))}
      </ul>
      <div className="indent">
        {more ? <a className="textlink" href={`${B}motion/`}>Motion, ads and reels <span aria-hidden="true">→</span></a>
          : <a className="textlink" href="https://www.instagram.com/thetenderdesk.co.uk/" target="_blank" rel="noopener">More on our Instagram <span aria-hidden="true">↗</span></a>}
      </div>
    </section>
  )
}

function PriceBlock({ s }: { s: Service }) {
  return (
    <div className="price">
      <p className="small">{s.price.label}</p>
      {s.price.big ? <Amount n={Number(s.price.big)} /> : <p className="quoted">Quoted</p>}
      <p className="then">{s.price.note}</p>
    </div>
  )
}

const whatWeDo = ['Websites', 'Motion design', 'Reels', 'Video ads', 'Tender writing', 'Google Ads', 'AI assistants', 'Google Business Profile', 'SEO and AI search', 'Care plans']

/* ---------------- pages ---------------- */

function Home() {
  const web = services[0]
  return (
    <>
      <section className="hero wrap homehero" id="top">
        <div className="herotext">
          <p className="eyebrow"><ShinyText text={'Websites, reels, tenders, Google\u00a0Ads\u00a0and\u00a0AI'} color="#6b6459" shineColor="#1b1a17" speed={4} delay={3} disabled={reduce} /></p>
          <Display text="Built to win you work." />
          <div className="herogrid">
            <Reveal delay={0.5}><p className="lede">Websites, reels and video ads, tenders, Google Ads and AI for businesses that want more of the right work. One desk, so nothing gets lost between agencies.</p></Reveal>
            <Reveal delay={0.65}>
              <div className="ctas">
                <Magnet padding={40} magnetStrength={6} disabled={reduce}><a className="btn primary shimmer" href="#contact">Start a project</a></Magnet>
                <a className="btn ghost" href="#services">See the services</a>
              </div>
            </Reveal>
          </div>
        </div>
        <HeroVisual />
      </section>

      <Marquee label="What we do" items={whatWeDo} />

      <section className="wrap block" id="services" aria-labelledby="svc-h">
        <Head n="01" text="Everything that brings work in" id="svc-h" />
        <ul className="svclist">
          {services.map((s, i) => (
            <li key={s.slug}>
              <Reveal delay={(i % 2) * 0.06}>
                <a href={`${B}${s.slug}/`} className="svc">
                  <span className="stepn">{String(i + 1).padStart(2, '0')}</span>
                  <span className="svcname">{s.name}</span>
                  <span className="svcsum">{s.summary}</span>
                  <span className="svcprice">{s.price.big ? `£${s.price.big} first 6 months` : s.price.label}</span>
                  <span className="arrow" aria-hidden="true">→</span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="pricing" id="price" aria-labelledby="price-h">
        <div className="wrap">
          <div className="sechead"><p className="num">02</p><h2 id="price-h" className="h2">{reduce ? 'A website for £25' : <BlurText text="A website for £25" animateBy="words" delay={90} direction="bottom" />}</h2></div>
          <div className="pricegrid">
            <div className="homeprice">
              <PriceBlock s={web} />
              <Reveal>
                <ul className="incl">{['Your website, designed and built', 'Hosting for the first 6 months', 'Works properly on phones', 'Set up for Google search', 'Your own domain connected', 'Free mock-up before you pay'].map(x => <li key={x}>{x}</li>)}</ul>
                <a className="textlink" href={`${B}websites/`}>How websites work <span aria-hidden="true">→</span></a>
              </Reveal>
            </div>
            <ServiceVisual kind="site" />
          </div>
        </div>
      </section>

      <section className="wrap block" aria-labelledby="moves-h">
        <Head n="03" text="Four moves" id="moves-h" />
        <ol className="moves">
          {moves.map(([t, d], i) => (
            <li key={t}><Reveal delay={i * 0.08}><span className="moveword">{t}.</span><p>{d}</p></Reveal></li>
          ))}
        </ol>
      </section>

      <section className="wrap block" aria-labelledby="ai-h">
        <Head n="04" text="03:07. You're asleep." id="ai-h" />
        <div className="split">
          <Reveal><p className="lede">A customer asks for a quote. The assistant answers, asks the right questions and books the visit into your diary. You wake up to the details.</p><a className="textlink" href={`${B}ai/`}>Meet the AI assistant <span aria-hidden="true">→</span></a></Reveal>
          <ServiceVisual kind="chat" />
        </div>
      </section>

      <Reels n="05" />

      <Work n="06" />

      <section className="wrap block" aria-labelledby="why-h">
        <Head n="07" text="Why us" id="why-h" />
        <ol className="grid4">{whyUs.map(([t, d], i) => <li key={t}><Reveal delay={i * 0.06}><h3>{t}</h3><p>{d}</p></Reveal></li>)}</ol>
      </section>

      <PartnerTeaser n="08" />

      <section className="faqsec wrap" aria-labelledby="faq-h">
        <Head n="09" text="Questions" id="faq-h" />
        <Faq items={homeFaqs} />
      </section>

      <Contact n="10" title="Your next customer is searching now." text="Tell us what you need. We reply the same working day." msg="Hi, I'd like to talk about my business." />
    </>
  )
}

function PartnerTeaser({ n }: { n: string }) {
  return (
    <section className="pricing" aria-labelledby="ref-h">
      <div className="wrap">
        <div className="sechead"><p className="num">{n}</p><h2 id="ref-h" className="h2">{reduce ? 'Know a business that needs more work?' : <BlurText text="Know a business that needs more work?" animateBy="words" delay={70} direction="bottom" />}</h2></div>
        <div className="pricegrid">
          <div className="price"><p className="small">Referral thank you</p><p className="amount"><Ticker value="10" /><span className="cur pct">%</span></p><p className="then">of what they pay in their first year.</p></div>
          <Reveal><div><p className="lede">Introduce them to The Tender Desk. If they become a client, you receive your thank you once they have paid. Nothing to sign up to, and no targets.</p><a className="textlink" href={`${B}partners/`}>Become a partner <span aria-hidden="true">→</span></a></div></Reveal>
        </div>
      </div>
    </section>
  )
}

function ServicePage({ s }: { s: Service }) {
  const others = services.filter(o => o.slug !== s.slug)
  return (
    <>
      <section className="hero wrap" id="top">
        <p className="eyebrow"><ShinyText text={s.eyebrow} color="#6b6459" shineColor="#1b1a17" speed={4} delay={3} disabled={reduce} /></p>
        <Display text={s.title} />
        <div className="herogrid">
          <Reveal delay={0.5}><p className="lede">{s.lede}</p></Reveal>
          <Reveal delay={0.65}>
            <div className="ctas">
              <Magnet padding={40} magnetStrength={6} disabled={reduce}><a className="btn primary shimmer" href="#contact">{s.cta.label}</a></Magnet>
              <a className="btn ghost" href="#price">See the price</a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="wrap block" aria-labelledby="what-h">
        <Head n="01" text={s.listTitle} id="what-h" />
        <div className="split">
          <ol className="feat">{s.list.map(([t, d], i) => <li key={t}><Reveal delay={(i % 3) * 0.05}><h3>{t}</h3><p>{d}</p></Reveal></li>)}</ol>
          <div className="sticky"><ServiceVisual kind={s.visual} /></div>
        </div>
      </section>

      {s.extra && (
        <section className="wrap block" aria-labelledby="extra-h">
          <Head n="02" text={s.extraTitle!} id="extra-h" />
          <div className="indent">
            {s.extraIntro && <Reveal><p className="lede">{s.extraIntro}</p></Reveal>}
            <ul className="chips">{s.extra.map(x => <li key={x}>{x}</li>)}</ul>
          </div>
        </section>
      )}
      {!s.extra && s.extraIntro && (
        <section className="wrap block"><div className="indent"><Reveal><p className="lede">{s.extraIntro}</p></Reveal></div></section>
      )}

      <section className="wrap block" aria-labelledby="how-h">
        <Head n={s.extra ? '03' : '02'} text={s.stepsTitle} id="how-h" />
        <ol className="steps four">{s.steps.map(([t, d], i) => <li key={t}><Reveal delay={i * 0.08}><span className="stepn">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></Reveal></li>)}</ol>
      </section>

      <section className="pricing" id="price" aria-labelledby="price-h">
        <div className="wrap">
          <div className="sechead"><p className="num">Price</p><h2 id="price-h" className="h2">{s.price.big ? 'One simple price' : 'A clear quote first'}</h2></div>
          <div className="pricegrid">
            <PriceBlock s={s} />
            <Reveal><p className="lede">{s.price.big ? 'Your website, built and live, with hosting for the first 6 months. After that it is £75 a year to keep it running. No contract and no lock in.' : 'Every job is quoted individually after a quick chat about what you need. You get a clear quote before anything starts.'}</p></Reveal>
          </div>
        </div>
      </section>

      {s.slug === 'websites' && <Work n="Work" />}
      {s.slug === 'motion' && <Reels n="Work" more={false} />}

      <section className="faqsec wrap" aria-labelledby="faq-h">
        <Head n="FAQ" text="Good to know" id="faq-h" />
        <Faq items={s.faqs} />
      </section>

      <section className="wrap block" aria-labelledby="more-h">
        <Head n="More" text="Also from the desk" id="more-h" />
        <ul className="morelist">{others.map(o => <li key={o.slug}><a href={`${B}${o.slug}/`}><span>{o.name}</span><span aria-hidden="true">→</span></a></li>)}</ul>
      </section>

      <Contact n="Next step" title={s.cta.title} text={s.cta.text} msg={s.cta.msg} />
    </>
  )
}

function About() {
  const principles: [string, string][] = [
    ['No handoffs', 'No account managers or juniors in between. The people who plan it build it.'],
    ['Straight answers', 'If something will not earn its keep, we say so before you spend on it.'],
    ['Measured, not guessed', 'Decisions come from numbers you can see, not opinions.'],
    ['Work anywhere', 'We work remotely with businesses wherever they are, on your time zone.'],
  ]
  const method: [string, string][] = [['Find', 'Where your next customers and contracts are.'], ['Write', 'Pages, bids, ads and reels made to what gets scored, watched and clicked.'], ['Win', 'Every enquiry and booking tracked and measured.'], ['Build', 'Sites and systems that keep working after handover.']]
  return (
    <>
      <section className="hero wrap" id="top">
        <p className="eyebrow"><ShinyText text="About" color="#6b6459" shineColor="#1b1a17" speed={4} delay={3} disabled={reduce} /></p>
        <Display text="One desk. Every way to win work." />
        <div className="herogrid">
          <Reveal delay={0.5}><p className="lede">The Tender Desk exists because good businesses keep losing work they should win: great reviews and a dated website, capable of public contracts and never bidding. We fix both, and the bits in between.</p></Reveal>
          <Reveal delay={0.65}><div className="ctas"><Magnet padding={40} magnetStrength={6} disabled={reduce}><a className="btn primary shimmer" href="#contact">Start a project</a></Magnet><a className="btn ghost" href={`${B}#services`}>Our services</a></div></Reveal>
        </div>
      </section>
      <section className="wrap block" aria-labelledby="who-h">
        <Head n="01" text="Founded and run by Yusuf Imthiyas." id="who-h" />
        <div className="indent prose">
          <Reveal><p className="lede">Founded and run by Yusuf Imthiyas, a final year BEng Chemical Engineering student who previously worked in a lab at Element Materials Technology running SAR testing. Precise work, where a missed detail means a wrong result.</p></Reveal>
          <Reveal delay={0.1}><p className="lede">That same care goes into every page and every bid. You deal with the person who plans your project and builds it, from first message to launch.</p></Reveal>
        </div>
      </section>
      <section className="wrap block" aria-labelledby="m-h">
        <Head n="02" text="The Desk Method" id="m-h" />
        <ol className="moves">{method.map(([t, d], i) => <li key={t}><Reveal delay={i * 0.08}><span className="moveword">{t}.</span><p>{d}</p></Reveal></li>)}</ol>
      </section>
      <section className="wrap block" aria-labelledby="p-h">
        <Head n="03" text="What you can count on" id="p-h" />
        <ol className="grid4">{principles.map(([t, d], i) => <li key={t}><Reveal delay={i * 0.06}><h3>{t}</h3><p>{d}</p></Reveal></li>)}</ol>
      </section>
      <Contact n="Next step" title="Let's talk about your business." text="Tell us what you need. We reply the same working day." msg="Hi, I'd like to talk about my business." />
    </>
  )
}

function Partners() {
  const who = ['Accountants and bookkeepers', 'Business coaches', 'Sign makers and printers', 'Insurance brokers', 'Business bank managers', 'Co working spaces', 'Shopfitters', 'IT support', 'Anyone with good clients']
  const steps: [string, string][] = [['Introduce', 'Send us their name and number, or copy us into an email. Ask them first, of course.'], ['We take it from there', 'A straight conversation about what would actually help. No hard sell, and we keep you posted.'], ['You get thanked', 'If they become a client, you receive your thank you once they have paid.']]
  return (
    <>
      <section className="hero wrap" id="top">
        <p className="eyebrow"><ShinyText text="Referral partners" color="#6b6459" shineColor="#1b1a17" speed={4} delay={3} disabled={reduce} /></p>
        <Display text="Know a business that needs more work?" />
        <div className="herogrid">
          <Reveal delay={0.5}><p className="lede">Introduce them to The Tender Desk. We look after their website, reels, ads, enquiries and tenders. You get a thank you of 10% of their first year.</p></Reveal>
          <Reveal delay={0.65}><div className="ctas"><Magnet padding={40} magnetStrength={6} disabled={reduce}><a className="btn primary shimmer" href="#contact">Become a partner</a></Magnet></div></Reveal>
        </div>
      </section>
      <section className="wrap block" aria-labelledby="w-h">
        <Head n="01" text="People who meet new businesses" id="w-h" />
        <div className="indent"><Reveal><p className="lede">If business owners ask you who can sort their website or help them win more work, this is for you.</p></Reveal><ul className="chips">{who.map(x => <li key={x}>{x}</li>)}</ul></div>
      </section>
      <section className="wrap block" aria-labelledby="h-h">
        <Head n="02" text="Three steps. No paperwork." id="h-h" />
        <ol className="steps">{steps.map(([t, d], i) => <li key={t}><Reveal delay={i * 0.08}><span className="stepn">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></Reveal></li>)}</ol>
      </section>
      <section className="pricing" aria-labelledby="t-h">
        <div className="wrap">
          <div className="sechead"><p className="num">03</p><h2 id="t-h" className="h2">The thank you</h2></div>
          <div className="pricegrid">
            <div className="price"><p className="small">Per client introduced</p><p className="amount"><Ticker value="10" /><span className="cur pct">%</span></p><p className="then">of what they pay in their first year.</p></div>
            <Reveal><p className="lede">Paid once they have paid. Nothing to sign up to, and no targets. You put your reputation on the line with an introduction. We treat it that way.</p></Reveal>
          </div>
        </div>
      </section>
      <Contact n="04" title="Let's work together." text="Tell us a little about you. We reply the same working day." msg="Hi, I'd like to become a referral partner." />
    </>
  )
}

/* ---------------- shell ---------------- */

const navItems: [string, string][] = [['websites', 'Websites'], ['motion', 'Reels'], ['tenders', 'Tenders'], ['google-ads', 'Google Ads'], ['ai', 'AI'], ['about', 'About'], ['partners', 'Partners']]
const menuItems: [string, string, string][] = [['websites', 'Websites', `${B}websites/`], ['motion', 'Reels and video ads', `${B}motion/`], ['tenders', 'Tenders', `${B}tenders/`], ['google-ads', 'Google Ads', `${B}google-ads/`], ['ai', 'AI', `${B}ai/`], ['work', 'Our work', '/work/'], ['about', 'About', `${B}about/`], ['partners', 'Partners', `${B}partners/`]]

function route() {
  const seg = window.location.pathname.slice(B.length).split('/')[0]
  return seg
}

export default function App() {
  const r = route()
  const s = services.find(x => x.slug === r)
  const [menu, setMenu] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('menu-on', menu)
    if (menu) lenisRef.current?.stop(); else lenisRef.current?.start()
    if (!menu) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); burgerRef.current?.focus() } }
    const onResize = () => { if (window.innerWidth > 900) setMenu(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize) }
  }, [menu])

  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a =>
      a.addEventListener('click', e => { const id = a.getAttribute('href')!; if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); setMenu(false); lenis.start(); lenis.scrollTo(id, { offset: -16, force: true }) } }))
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.shot').forEach(el => gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }))
      gsap.utils.toArray<HTMLElement>('.rule').forEach(el =>
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: 'power2.out', duration: 1.2, scrollTrigger: { trigger: el, start: 'top 90%' } }))
    })
    return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy(); lenisRef.current = null }
  }, [])

  useEffect(() => {
    const h = window.location.hash
    if (h.length < 2) return
    const t = window.setTimeout(() => {
      let el: Element | null = null
      try { el = document.querySelector(h) } catch { return }
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY - 16
      if (lenisRef.current) lenisRef.current.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y)
      ScrollTrigger.refresh()
    }, 150)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav wrap">
        <a href={B} className="brand" aria-label="The Tender Desk, home">The Tender Desk</a>
        <nav aria-label="Main" className="dnav">
          {navItems.map(([slug, label]) => <a key={slug} href={`${B}${slug}/`} aria-current={r === slug ? 'page' : undefined}>{label}</a>)}
        </nav>
        <div className="navr">
          <a className="navcta" href="#contact">Start a project</a>
          <button ref={burgerRef} className="burger" aria-expanded={menu} aria-controls="menu" aria-label={menu ? 'Close menu' : 'Open menu'} onClick={() => setMenu(!menu)}><i /><i /></button>
        </div>
      </header>
      <div id="menu" className={'menu' + (menu ? ' on' : '')} aria-hidden={!menu} inert={!menu}>
        <div className="menubar wrap">
          <a href={B} className="brand" aria-label="The Tender Desk, home" onClick={() => setMenu(false)}>The Tender Desk</a>
          <button className="burger" aria-expanded="true" aria-label="Close menu" onClick={() => { setMenu(false); burgerRef.current?.focus() }}><i /><i /></button>
        </div>
        <nav aria-label="Menu" className="menulinks wrap">
          {menuItems.map(([slug, label, href], i) => (
            <a key={slug} href={href} style={{ '--i': i } as React.CSSProperties} aria-current={r === slug ? 'page' : undefined} onClick={() => setMenu(false)}>
              <span className="mi">{String(i + 1).padStart(2, '0')}</span><span className="ml">{label}</span>
            </a>
          ))}
        </nav>
        <div className="menufoot wrap">
          <a className="btn primary" href="#contact" onClick={() => setMenu(false)}>Start a project</a>
          <a className="menumail" href={MAIL}>hello@thetenderdesk.co.uk</a>
        </div>
      </div>

      <main id="main">
        {s ? <ServicePage s={s} /> : r === 'about' ? <About /> : r === 'partners' ? <Partners /> : <Home />}
      </main>

      <footer className="foot wrap">
        <div className="fcols">
          <div><p className="brand">The Tender Desk</p><p>Websites, reels, tenders, Google Ads and AI for businesses that want more of the right work.</p><p>Founded and run by Yusuf Imthiyas.</p></div>
          <div><p className="small">Services</p>{services.map(x => <a key={x.slug} href={`${B}${x.slug}/`}>{x.name}</a>)}</div>
          <div><p className="small">Company</p><a href={`${B}about/`}>About</a><a href="/work/">Our work</a><a href={`${B}partners/`}>Referral partners</a><a href={MAIL}>hello@thetenderdesk.co.uk</a></div>
        </div>
        <div className="fbase"><p>The Desk Method: Find. Write. Win. Build.</p><p>© {new Date().getFullYear()} The Tender Desk</p></div>
      </footer>
    </>
  )
}
