// Small moving details, ported from Magic UI ideas (MIT, magicui.design) and restyled to the
// Tender Desk palette: Marquee, NumberTicker, BorderBeam, AnimatedList. Shimmer buttons are CSS only (.shimmer).
// Everything animates transform/opacity only and pauses when off screen.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// true while the element is on screen (used to pause loops off screen)
function useOnScreen<T extends HTMLElement>(margin = '80px') {
  const ref = useRef<T>(null)
  const [on, set] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { rootMargin: margin })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [margin])
  return [ref, on] as const
}

/* ---------- Marquee ---------- */
export function Marquee({ items, label }: { items: string[]; label: string }) {
  const [ref, on] = useOnScreen<HTMLDivElement>()
  const row = (hidden: boolean) => (
    <ul className="mq-row" aria-hidden={hidden || undefined}>
      {items.map(x => <li key={x}>{x}</li>)}
    </ul>
  )
  return (
    <div ref={ref} className={'mq' + (on && !reduce ? ' run' : '')} role="region" aria-label={label}>
      <div className="mq-track">{row(false)}{row(true)}</div>
    </div>
  )
}

/* ---------- NumberTicker: each digit rolls on its own column ---------- */
export function Ticker({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [go, set] = useState(reduce)
  useEffect(() => {
    if (reduce || !ref.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { set(true); io.disconnect() } }, { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  if (reduce) return <span className="tk">{value}</span>
  const chars = value.split('')
  const digits = chars.filter(c => /\d/.test(c)).length
  let k = 0
  return (
    <span ref={ref} className={'tk' + (go ? ' go' : '')} aria-label={value} role="text">
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i} aria-hidden="true">{c}</span>
        const n = Number(c), order = digits - 1 - k++
        return (
          <span key={i} className="tk-col" aria-hidden="true">
            <span className="tk-ghost">{c}</span>
            <span className="tk-strip" style={{ ['--to' as string]: 10 + n, transitionDelay: `${delay + order * 0.12}s` }}>
              {'01234567890123456789'.split('').map((d, j) => <span key={j}>{d}</span>)}
            </span>
          </span>
        )
      })}
    </span>
  )
}

/* ---------- BorderBeam: a soft light that travels round the card edge ---------- */
export function BorderBeam({ duration = 9 }: { duration?: number }) {
  const [ref, on] = useOnScreen<HTMLSpanElement>()
  if (reduce) return null
  return <span ref={ref} className={'beam' + (on ? ' run' : '')} style={{ ['--bd' as string]: duration + 's' }} aria-hidden="true" />
}

/* ---------- AnimatedList: new items drop in at the top, the rest make room ---------- */
// seed: how many items are already on screen before the first one drops in (so the list never starts empty)
export function AnimatedList<T extends { id: string }>({ pool, render, max = 4, every = 2200, seed = 0 }: { pool: T[]; render: (x: T, i: number) => React.ReactNode; max?: number; every?: number; seed?: number }) {
  const [ref, on] = useOnScreen<HTMLDivElement>('0px')
  const start = reduce ? max : Math.min(seed, max)
  const [shown, setShown] = useState<(T & { key: number })[]>(() => pool.slice(0, start).reverse().map((x, i) => ({ ...x, key: start - 1 - i })))
  const n = useRef(start)
  useEffect(() => {
    if (reduce || !on) return
    const add = () => { const x = pool[n.current % pool.length]; const key = n.current++; setShown(s => [{ ...x, key }, ...s].slice(0, max)) }
    if (n.current === start) add()
    const t = window.setInterval(add, every)
    return () => window.clearInterval(t)
  }, [on, pool, max, every, start])
  return (
    <div ref={ref} className="alist">
      <AnimatePresence initial={false} mode="popLayout">
        {shown.map((x, i) => (
          <motion.div key={x.key} layout className="alist-item"
            initial={{ opacity: 0, scale: 0.92, y: -14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}>
            {render(x, i)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
