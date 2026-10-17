import { useEffect, useRef, useState } from 'react'
import type { Visual } from './content'

export const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// adds .in once the element is on screen; transform/opacity-only animations live in CSS
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, set] = useState(reduce)
  useEffect(() => {
    if (reduce || !ref.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { set(true); io.disconnect() } }, { threshold: 0.25 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, inView] as const
}

function Site() {
  return (
    <div className="v-site" aria-hidden="true">
      <div className="phone">
        <span className="bar w40" /><span className="hero-b" /><span className="bar w80" /><span className="bar w60" />
        <span className="pill">Call now</span>
        <div className="tiles"><span /><span /><span /></div>
      </div>
      <div className="vcap"><b>£25</b> first 6 months</div>
    </div>
  )
}

function Bid() {
  const rows: [string, string, number][] = [['Selection questionnaire', 'Passed', 100], ['Method statement', '40%', 40], ['Quality answers', '30%', 30], ['Social value', '10%', 10], ['Compliance check', 'Done', 100]]
  return (
    <div className="v-card v-bid" aria-hidden="true">
      <p className="vk">Invitation to tender</p>
      {rows.map(([l, v, w], i) => (
        <div className="brow" key={l} style={{ ['--i' as string]: i }}>
          <span>{l}</span><em>{v === 'Passed' || v === 'Done' ? '\u2713 ' + v : v}</em>
          <i><b style={{ transform: `scaleX(${w / 100})` }} /></i>
        </div>
      ))}
    </div>
  )
}

function Ads() {
  return (
    <div className="v-card v-ads" aria-hidden="true">
      <div className="search"><span className="glass" /><span className="typed">emergency electrician near me</span></div>
      <div className="ad">
        <p className="spons">Sponsored <span>yourbusiness.co.uk</span></p>
        <p className="adh">Your Business. Booked Today.</p>
        <p className="adp">Fully certified. Upfront quotes. Five star reviews. Call now or book online in 30 seconds.</p>
      </div>
      <div className="tracked"><div><span>Calls this month</span><b>tracked</b></div><div><span>Form enquiries</span><b>tracked</b></div></div>
    </div>
  )
}

function Chat() {
  return (
    <div className="v-card v-chat" aria-hidden="true">
      <p className="vk">03:07 · Website chat</p>
      <p className="msg them" style={{ ['--i' as string]: 0 }}>Hi, are you free this week? Need a quote for a new bathroom.</p>
      <p className="msg us" style={{ ['--i' as string]: 1 }}>Hi Sam. We can visit Thursday at 10:00 or Friday at 14:00. Which suits you?</p>
      <p className="msg them" style={{ ['--i' as string]: 2 }}>Thursday please</p>
      <p className="msg us" style={{ ['--i' as string]: 3 }}>Booked: Thursday, 10:00, site visit and quote. You will get a reminder the day before.</p>
      <p className="booked" style={{ ['--i' as string]: 4 }}>{'\u2713'} Added to your diary while you slept</p>
    </div>
  )
}

function Gbp() {
  return (
    <div className="v-card v-gbp" aria-hidden="true">
      <div className="map"><span className="pin" /></div>
      <p className="gname">Your Business</p>
      <p className="stars"><span className="s">{'\u2605\u2605\u2605\u2605\u2605'}</span><span className="s fill">{'\u2605\u2605\u2605\u2605\u2605'}</span></p>
      <p className="gmeta">Open today · Book online</p>
      <div className="gbtn"><span>Call</span><span>Website</span><span>Directions</span></div>
    </div>
  )
}

function Seo() {
  const lines = ['# llms.txt', '> What we do, in plain words.', '', '## Services', '- /services/repairs', '- /services/installs', '', '"@type": "Service"', '"@type": "FAQPage"']
  return (
    <div className="v-card v-seo" aria-hidden="true">
      <pre>{lines.map((l, i) => <span key={i} style={{ ['--i' as string]: i }}>{l || '\u00a0'}{'\n'}</span>)}</pre>
    </div>
  )
}

function Care() {
  const items = ['Backed up', 'Updated', 'Speed checked', 'Uptime checked', 'Report sent']
  return (
    <div className="v-card v-care" aria-hidden="true">
      <p className="vk">This month</p>
      <ul>{items.map((x, i) => <li key={x} style={{ ['--i' as string]: i }}><span className="tick">{'\u2713'}</span>{x}</li>)}</ul>
      <svg viewBox="0 0 300 60" className="pulse"><path d="M0 40 H90 L100 40 L110 22 L120 50 L130 40 H300" /></svg>
    </div>
  )
}

// muted looping clip that only loads and plays while on screen (kind to phones)
export function ReelClip({ name, label }: { name: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v || reduce) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { v.play().catch(() => {}) } else v.pause() }, { threshold: 0.35 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  const base = import.meta.env.BASE_URL + 'img/reels/' + name
  return (
    <video ref={ref} className="reelvid" src={base + '.mp4'} poster={base + '.webp'} muted loop playsInline preload="none" width={540} height={960} aria-label={label} />
  )
}

function Reel() {
  return (
    <div className="v-reel">
      <div className="reelphone"><ReelClip name="morph" label="Motion design reel made by The Tender Desk" /></div>
      <div className="vcap">Made by us, for our own feed</div>
    </div>
  )
}

const map: Record<Visual, () => React.ReactElement> = { site: Site, bid: Bid, ads: Ads, chat: Chat, gbp: Gbp, seo: Seo, care: Care, reel: Reel }

export function ServiceVisual({ kind }: { kind: Visual }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const V = map[kind]
  return <div ref={ref} className={'visual' + (inView ? ' in' : '')}><V /></div>
}
