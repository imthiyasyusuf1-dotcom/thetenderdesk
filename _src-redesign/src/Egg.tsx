import { useEffect, useRef, useState } from 'react'
import { wa, B } from './content'

// Hidden fun: footer "Don't press this" button (or type "brew") opens a full screen clip.
export const CLIPS: { src: string; poster: string; line: string }[] = [
  { src: 'assets/fun/clip1.mp4', poster: 'assets/fun/clip1.jpg', line: 'This is what happens when the phone never stops ringing.' },
  { src: 'assets/fun/clip2.mp4', poster: 'assets/fun/clip2.jpg', line: 'Busy week? We can make it busier.' },
  { src: 'assets/fun/clip3.mp4', poster: 'assets/fun/clip3.jpg', line: 'You pressed it. Now you have to message us.' },
]

export function Egg() {
  const [open, setOpen] = useState(false)
  const [i, setI] = useState(0)
  const vid = useRef<HTMLVideoElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let typed = ''
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === 'Escape') { setOpen(false); return }
      const t = e.target as HTMLElement
      if (t && /INPUT|TEXTAREA/.test(t.tagName)) return
      typed = (typed + e.key.toLowerCase()).slice(-4)
      if (typed === 'brew') { setI(0); setOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    document.documentElement.classList.toggle('lock', open)
    if (open) { closeRef.current?.focus(); vid.current?.play().catch(() => {}) }
  }, [open, i])

  const c = CLIPS[i % CLIPS.length]
  return (
    <>
      <button className="eggbtn" onClick={() => { setI(Math.floor(Math.random() * CLIPS.length)); setOpen(true) }}>
        <span aria-hidden="true" className="eggdot" />Don't press this
      </button>
      {open && (
        <div className="egg" role="dialog" aria-modal="true" aria-label="You found the secret" onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <button ref={closeRef} className="eggx" aria-label="Close" onClick={() => setOpen(false)}><i /><i /></button>
          <div className="eggframe">
            <video key={c.src} ref={vid} src={B + c.src} poster={B + c.poster} autoPlay muted loop playsInline preload="auto" />
          </div>
          <p className="eggk">You found the secret</p>
          <p className="eggl">{c.line}</p>
          <div className="eggrow">
            <a className="btn wa" href={wa("Hi, I pressed the button. Now what?")} target="_blank" rel="noopener">Message us</a>
            <button className="eggagain" onClick={() => setI(i + 1)}>Press it again</button>
          </div>
        </div>
      )}
    </>
  )
}
