import { useRef, useState, type ReactNode } from 'react'
import { focusClass } from './ui'

export function Carousel({ label, className = '', items }: {
  label: string
  className?: string
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
    <div className={`relative flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden after:shrink-0 after:basis-[calc(8%_-_16px)] after:content-[''] md:gap-6 md:after:basis-[calc(8%_-_24px)] ${focusClass}`} ref={track} tabIndex={0} aria-label={`${label}. Use left and right arrow keys to browse.`} onKeyDown={event => {
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
      {items.map((item, index) => <div className="flex min-w-0 shrink-0 grow-0 basis-[92%] snap-start" key={item.label} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}: ${item.label}`}>{item.content}</div>)}
    </div>
    <div className="mt-6 flex items-center justify-center gap-4">
      <div className="flex items-center justify-center gap-2">{items.map((item, index) => <button key={item.label} aria-label={`Show ${item.label}`} aria-current={active === index ? 'true' : undefined} className={`h-[9px] cursor-pointer rounded-none border-0 p-0 ${focusClass} ${active === index ? 'w-[27px] bg-accent' : 'w-[9px] bg-[#c6c6c6]'}`} onClick={() => goTo(index)} />)}</div>
    </div>
  </div>
}
