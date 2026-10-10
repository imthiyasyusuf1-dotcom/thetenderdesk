import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitText from './bits/SplitText'
import BlurText from './bits/BlurText'
import ShinyText from './bits/ShinyText'
import CountUp from './bits/CountUp'
import AnimatedContent from './bits/AnimatedContent'
import Magnet from './bits/Magnet'
import StarBorder from './bits/StarBorder'

gsap.registerPlugin(ScrollTrigger)

const WA = 'https://wa.me/447534458327?text=' + encodeURIComponent("Hi, I'd like a free mock-up of a website for my business.")
const MAIL = 'mailto:hello@thetenderdesk.co.uk'
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) =>
  reduce ? <>{children}</> : (
    <AnimatedContent distance={28} duration={0.9} ease="power3.out" initialOpacity={0} threshold={0.12} delay={delay}>
      {children}
    </AnimatedContent>
  )

const faqs = [
  ['Is the mock-up really free?', 'Yes. We build a working mock-up of your new site before you pay anything. If you do not like it, you walk away and owe nothing.'],
  ['What do I get for £50?', 'Your website, built and live, plus hosting, security and small text changes for the first twelve months. After that it is £75 a year to keep it running.'],
  ['How can you go live in 48 hours?', 'Most trade sites need the same core things done well: what you do, where you work, proof, and an easy way to get in touch. Once you approve the mock-up, we finish it and put it live within two working days.'],
  ['Do I need to send anything?', 'A few photos of your work and your contact details help. We can pull the rest from your Google profile, social pages or a quick chat.'],
  ['Can I use my own domain?', 'Yes. We connect a domain you already own, or help you buy one. The domain is yours, in your name.'],
  ['What if I want to leave?', 'No contract and no lock in. If you stop paying the yearly fee the site comes down, and we can hand over the files if you ask.'],
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="faq">
      {faqs.map(([q, a], i) => (
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

export default function App() {
  const shot = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a =>
      a.addEventListener('click', e => { const id = a.getAttribute('href')!; if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { offset: -16 }) } }))
    const ctx = gsap.context(() => {
      if (shot.current) gsap.fromTo(shot.current, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.frame', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.utils.toArray<HTMLElement>('.rule').forEach(el =>
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: 'power2.out', duration: 1.2, scrollTrigger: { trigger: el, start: 'top 90%' } }))
    })
    return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy() }
  }, [])

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav wrap">
        <a href="#top" className="brand" aria-label="The Tender Desk, back to top">The Tender Desk</a>
        <nav aria-label="Main">
          <a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#work">Work</a><a href="#faq">FAQ</a>
        </nav>
        <a className="navcta" href="#contact">Get a free mock-up</a>
      </header>

      <main id="main">
        <section className="hero wrap" id="top">
          <p className="eyebrow"><ShinyText text="Websites for trades" color="#6b6459" shineColor="#1b1a17" speed={4} delay={3} disabled={reduce} /></p>
          <h1 className="display">
            {reduce ? 'Sites for trades that win work.' : (
              <SplitText text="Sites for trades that win work." tag="span" splitType="words" delay={70} duration={1.1} ease="power4.out"
                from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0} rootMargin="0px" textAlign="left" />
            )}
          </h1>
          <div className="herogrid">
            <Reveal delay={0.5}>
              <p className="lede">A clear, fast website that shows your work, answers the questions customers ask, and makes it easy to call you. We build a free mock-up first. If you like it, it goes live in 48 hours.</p>
            </Reveal>
            <Reveal delay={0.65}>
              <div className="ctas">
                <Magnet padding={40} magnetStrength={6} disabled={reduce}>
                  <a className="btn primary" href="#contact">Get my free mock-up</a>
                </Magnet>
                <a className="btn ghost" href="#pricing">See the price</a>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="how wrap" id="how" aria-labelledby="how-h">
          <div className="rule" />
          <div className="sechead">
            <p className="num">01</p>
            <h2 id="how-h" className="h2"><BlurText text="How it works" animateBy="words" delay={90} direction="bottom" /></h2>
          </div>
          <ol className="steps">
            {[
              ['Tell us about your business', 'Send a message on WhatsApp or email. A few lines about what you do and some photos of your work is plenty.'],
              ['We build a free mock-up', 'You get a link to a working version of your new site. Look at it on your phone, show it to whoever you like.'],
              ['Live in 48 hours', 'Happy with it? We make your changes, connect your domain and put it live within two working days.'],
            ].map(([t, d], i) => (
              <li key={t}><Reveal delay={i * 0.08}><span className="stepn">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></Reveal></li>
            ))}
          </ol>
        </section>

        <section className="pricing" id="pricing" aria-labelledby="price-h">
          <div className="wrap">
            <div className="sechead">
              <p className="num">02</p>
              <h2 id="price-h" className="h2"><BlurText text="One simple price" animateBy="words" delay={90} direction="bottom" /></h2>
            </div>
            <div className="pricegrid">
              <div className="price">
                <p className="small">First year, everything included</p>
                <p className="amount"><span className="cur">£</span>{reduce ? '50' : <CountUp from={0} to={50} duration={1.4} />}</p>
                <p className="then">Then £75 a year. No contract.</p>
              </div>
              <Reveal>
                <ul className="incl">
                  {['Your website, designed and built', 'Hosting and security', 'Works properly on phones', 'Set up for Google search', 'Small text changes when you need them', 'Your own domain connected'].map(x => <li key={x}>{x}</li>)}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="work wrap" id="work" aria-labelledby="work-h">
          <div className="rule" />
          <div className="sechead">
            <p className="num">03</p>
            <h2 id="work-h" className="h2"><BlurText text="Recent work" animateBy="words" delay={90} direction="bottom" /></h2>
          </div>
          <div className="case">
            <Reveal>
              <a className="frame" href="https://7ei8ht6properties.com/" target="_blank" rel="noopener">
                <img ref={shot} src="/preview/img/786-1440.webp" srcSet="/preview/img/786-800.webp 800w, /preview/img/786-1440.webp 1440w" sizes="(max-width: 900px) 92vw, 760px" width={1440} height={900} alt="Homepage of the 7ei8ht6 Properties website" loading="lazy" decoding="async" />
              </a>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="casetext">
                <p className="small">Client</p>
                <h3>7ei8ht6 Properties</h3>
                <p>A bilingual English and Arabic site for a 38 person property brokerage. Every one of the team has their own profile with direct contact details, and the whole site loads fast on a phone.</p>
                <a className="textlink" href="https://7ei8ht6properties.com/" target="_blank" rel="noopener">Visit the live site <span aria-hidden="true">↗</span></a>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="faqsec wrap" id="faq" aria-labelledby="faq-h">
          <div className="rule" />
          <div className="sechead">
            <p className="num">04</p>
            <h2 id="faq-h" className="h2"><BlurText text="Questions" animateBy="words" delay={90} direction="bottom" /></h2>
          </div>
          <Faq />
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-h">
          <div className="wrap">
            <p className="num light">05</p>
            <h2 id="contact-h" className="display light">See your new site before you pay.</h2>
            <p className="lede light">Send us your business name and what you do. We will reply with a free mock-up, usually within a day.</p>
            <div className="ctas">
              <a className="btn cream" href={WA} target="_blank" rel="noopener">Message on WhatsApp</a>
              <StarBorder as="a" href={MAIL} className="btn outline" color="#f4f0e7" trailColor="rgba(244,239,232,.25)" backgroundColor="#1b1a17" textColor="#f4f0e7" borderColor="rgba(244,239,232,.22)" radius={999} duration={7} stars={1} glow={0} sparkle={false} clickPulse={false}>hello@thetenderdesk.co.uk</StarBorder>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot wrap">
        <p>Founded and run by Yusuf Imthiyas.</p>
        <p>© {new Date().getFullYear()} The Tender Desk</p>
      </footer>
    </>
  )
}
