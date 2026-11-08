import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { ArrowRightLinear } from 'solar-icon-set'
import { Page, SectionTitle } from '../components'

export const Route = createFileRoute('/')({ component: HomePage, head: () => ({ meta: [{ title: 'Islam Sayed | Product Designer' }] }) })

const projects = [
  { title: 'Couponz Souq', image: '/imgs/sc.jpg', alt: 'Couponz Souq mobile app', tags: ['UI Design', 'Mobile App'] },
  { title: 'Tracker 3arbya', image: '/imgs/t3.jpg', alt: 'Tracker 3arbya mobile app', tags: ['Case Study', 'UX Design', 'UI Design', 'Mobile App'] },
  { title: 'Tia Jewelry', image: '/imgs/tia.jpg', alt: 'Tia Jewelry website', tags: ['UX Design', 'UI Design', 'Website'] },
  { title: 'Dal', image: '/imgs/dal.jpg', alt: 'Dal mobile app', tags: ['Case Study', 'UX Design', 'UI Design'] },
  { title: 'Shipin', image: '/imgs/shipin.jpg', alt: 'Shipin mobile app', tags: ['Case Study', 'UX Design', 'Mobile App'] },
]
const workflow = [
  { title: 'Discover', description: 'Understand your goals, your users, and the problem worth solving.', detail: 'Research & alignment' },
  { title: 'Define', description: 'Turn insights into clear priorities, user flows, and a shared direction.', detail: 'Strategy & structure' },
  { title: 'Design', description: 'Explore ideas through wireframes, thoughtful interfaces, and interactive prototypes.', detail: 'Explore & prototype' },
  { title: 'Refine & deliver', description: 'Test, iterate, and prepare clear design specs for a smooth development handoff.', detail: 'Validate & hand off' },
]

const testimonials = [
  ['Islam created a professional, tailor-made design. His creativity and communication are excellent. I really recommend working with him.', 'Matt G.', '/icons/pl.svg', 'Poland'],
  ['I really enjoyed working with Islam. He addressed my requirements carefully and was very attentive to my requests.', 'Mehrdad D.', '/icons/australia-flag-icon.svg', 'Australia'],
  ['He was super helpful, professional, and delivered beautiful, elegant designs right on target.', 'Cameron F.', '/icons/mexico-flag-icon.svg', 'Mexico'],
]

function HomePage() {
  const [testimonial, setTestimonial] = useState(0)
  return <Page>
    <main>
      <section className="hero"><div className="container hero-content"><h1>Islam S.<br />Product Designer</h1><p>I turn complex ideas into thoughtful digital experiences.<br />Designing products that put people first.</p><a className="scroll-cue" href="#work" aria-label="Scroll to work samples"><span className="scroll-mouse" aria-hidden="true"><span /></span></a></div><div className="hero-stats container"><Stat number="2017" label="Designing" prefix="Since " /><Stat number="12 countries" label="served" /><Stat number="24 projects" label="delivered" /></div></section>
      <section className="container work" id="work"><SectionTitle>Work samples</SectionTitle><WorkCarousel /></section>
      <section className="workflow-section" aria-labelledby="workflow-heading"><div className="container"><SectionTitle><span id="workflow-heading">My workflow</span></SectionTitle><p className="workflow-intro">A collaborative process, from understanding the problem to shaping the right solution.</p><ol className="workflow-grid">{workflow.map((step, index) => <li className="workflow-step" key={step.title}><span className="workflow-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p className="workflow-detail">{step.detail}</p><h3>{step.title}</h3><p className="workflow-description">{step.description}</p></li>)}</ol><p className="workflow-note">Not a straight line—feedback and iteration are part of every step.</p></div></section>
      <section className="contact-cta" aria-labelledby="contact-heading"><div className="container"><p className="contact-eyebrow">Have a project in mind?</p><h2 id="contact-heading">Let’s make something<br />worth using.</h2><div className="contact-actions"><a className="button primary" href="https://t.me/islamsayedr" target="_blank" rel="noreferrer">Let’s talk <ArrowRightLinear size={20} aria-hidden="true" /></a></div></div></section>
      <section className="container feedback" aria-labelledby="feedback-heading"><SectionTitle><span id="feedback-heading">Kind words from clients</span></SectionTitle><p className="feedback-intro">Good design starts with a great working relationship.</p><div className="testimonial-card"><span className="testimonial-mark" aria-hidden="true">“</span><div className="testimonial-rating" aria-label="Rated 5 out of 5"><span aria-hidden="true">★★★★★</span><span>5.0 / 5</span></div><div id="client-review" aria-live="polite" aria-atomic="true"><blockquote className="testimonial-quote"><p>{testimonials[testimonial][0]}</p></blockquote><div className="testimonial-author"><span className="client-avatar" aria-hidden="true">{testimonials[testimonial][1].charAt(0)}</span><div><strong>{testimonials[testimonial][1]}</strong><span className="client-country"><img src={testimonials[testimonial][2]} alt="" />{testimonials[testimonial][3]}</span></div></div></div></div><div className="testimonial-selectors" role="group" aria-label="Choose a client review">{testimonials.map((review, index) => <button key={review[1]} aria-pressed={index === testimonial} aria-controls="client-review" className={index === testimonial ? 'selected' : ''} onClick={() => setTestimonial(index)}><span className="review-indicator" aria-hidden="true" /><span>{review[1]}</span></button>)}</div></section>
    </main>
  </Page>
}
function WorkCarousel() {
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

  return <div className="work-carousel" role="region" aria-roledescription="carousel" aria-label="Work samples">
    <div className="project-list" ref={track} tabIndex={0} aria-label="Projects. Use left and right arrow keys to browse." onKeyDown={event => {
      if (event.target !== event.currentTarget) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(Math.max(0, Math.min(projects.length - 1, active + (event.key === 'ArrowRight' ? 1 : -1))))
      }
    }} onScroll={() => {
      const element = track.current
      if (!element) return
      const first = element.children[0] as HTMLElement
      let nearest = 0
      let distance = Infinity
      Array.from(element.children).forEach((child, index) => {
        const delta = Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - element.scrollLeft)
        if (delta < distance) { distance = delta; nearest = index }
      })
      setActive(nearest)
    }}>
      {projects.map((project, index) => <article className="project" key={project.title} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${projects.length}: ${project.title}`}><img src={project.image} alt={project.alt} loading="lazy" /><div className="project-copy"><h3>{project.title}</h3><p>Product design work focused on creating clear, useful digital experiences.</p><a className="project-link" href="https://www.behance.net/geosid40" target="_blank" rel="noreferrer" aria-label={`View ${project.title} on Behance`}><ArrowRightLinear size={20} aria-hidden="true" /></a></div></article>)}
    </div>
    <div className="carousel-controls"><div className="dots">{projects.map((project, index) => <button key={project.title} aria-label={`Show ${project.title}`} aria-current={active === index ? 'true' : undefined} className={active === index ? 'selected' : ''} onClick={() => goTo(index)} />)}</div></div>
  </div>
}

function Stat({ number, label, prefix = '+' }: { number: string; label: string; prefix?: string }) { return <div><span>{label}</span><strong>{prefix}{number}</strong></div> }
