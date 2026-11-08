import { useRef, useState, type ReactNode } from 'react'

export function Carousel({ label, className, items }: {
  label: string
  className: string
  items: { label: string; content: ReactNode }[]
}) {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  function goTo(index: number) {
    const element = track.current
    if (!element) return
    const card = element.children[index] as HTMLElement | undefined
    if (!card) return
    element.scrollTo({
      left: card.offsetLeft - (element.children[0] as HTMLElement).offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  return <div className={className} role="region" aria-roledescription="carousel" aria-label={label}>
    <div className="project-list" ref={track} tabIndex={0} aria-label={`${label}. Use left and right arrow keys to browse.`} onKeyDown={event => {
      if (event.target !== event.currentTarget) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(Math.max(0, Math.min(items.length - 1, active + (event.key === 'ArrowRight' ? 1 : -1))))
      }
    }} onScroll={() => {
      const element = track.current
      if (!element) return
      const first = element.children[0] as HTMLElement | undefined
      if (!first) return
      let nearest = 0
      let distance = Infinity
      Array.from(element.children).forEach((child, index) => {
        const delta = Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - element.scrollLeft)
        if (delta < distance) { distance = delta; nearest = index }
      })
      setActive(nearest)
    }}>
      {items.map((item, index) => <div className="carousel-slide" key={item.label} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}: ${item.label}`}>{item.content}</div>)}
    </div>
    <div className="carousel-controls"><div className="dots">{items.map((item, index) => <button key={item.label} aria-label={`Show ${item.label}`} aria-current={active === index ? 'true' : undefined} className={active === index ? 'selected' : ''} onClick={() => goTo(index)} />)}</div></div>
  </div>
}
