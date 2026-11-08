import { createFileRoute, Link } from '@tanstack/react-router'
import { projects, ProjectCard } from '../projects'
import { testimonials, ReviewCard } from '../reviews'
import { Carousel } from '../carousel'
import { ArrowRightLinear } from 'solar-icon-set'
import { Page, SectionTitle } from '../components'

export const Route = createFileRoute('/')({ component: HomePage, head: () => ({ meta: [{ title: 'Islam Sayed | Product Designer' }] }) })

const workflow = [
  { title: 'Discover', description: 'Understand your goals, your users, and the problem worth solving.', detail: 'Research & alignment' },
  { title: 'Define', description: 'Turn insights into clear priorities, user flows, and a shared direction.', detail: 'Strategy & structure' },
  { title: 'Design', description: 'Explore ideas through wireframes, thoughtful interfaces, and interactive prototypes.', detail: 'Explore & prototype' },
  { title: 'Refine & deliver', description: 'Test, iterate, and prepare clear design specs for a smooth development handoff.', detail: 'Validate & hand off' },
]


function HomePage() {
  return <Page>
    <main>
      <section className="hero"><div className="container hero-content"><h1>Islam S.<br />Product Designer</h1><p>I turn complex ideas into thoughtful digital experiences.<br />Designing products that put people first.</p><a className="button primary" href="#work">View my work</a></div><div className="hero-stats container"><Stat number="2017" label="Designing" prefix="Since " /><Stat number="12 countries" label="served" /><Stat number="24 projects" label="delivered" /></div></section>
      <section className="container work" id="work" aria-labelledby="work-heading"><div className="work-section-header"><h2 id="work-heading">Work samples</h2><Link className="work-view-more" to="/work">View more <ArrowRightLinear size={18} aria-hidden="true" /></Link></div><WorkCarousel /></section>
      <section className="workflow-section" aria-labelledby="workflow-heading"><div className="container"><SectionTitle><span id="workflow-heading">My workflow</span></SectionTitle><ol className="workflow-grid">{workflow.map((step, index) => <li className="workflow-step" key={step.title}><div className="workflow-step-heading"><span className="workflow-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div className="workflow-step-copy"><h3>{step.title}</h3><p className="workflow-description">{step.description}</p></div></div></li>)}</ol></div></section>
      <section className="contact-cta" aria-labelledby="contact-heading"><div className="container"><p className="contact-eyebrow">Have a project in mind?</p><h2 id="contact-heading">Let’s make something<br />worth using.</h2><div className="contact-actions"><a className="button primary" href="https://t.me/islamsayedr" target="_blank" rel="noreferrer">Let’s talk <ArrowRightLinear size={20} aria-hidden="true" /></a></div></div></section>
      <section className="container feedback" aria-labelledby="feedback-heading"><div className="work-section-header"><h2 id="feedback-heading">Kind words from clients</h2><Link className="work-view-more" to="/reviews">View more <ArrowRightLinear size={18} aria-hidden="true" /></Link></div><ReviewCarousel /></section>
    </main>
  </Page>
}
function WorkCarousel() {
  return <Carousel label="Work samples" className="work-carousel" items={[...projects.map(project => ({
    label: project.title,
    content: <ProjectCard project={project} />,
  })), {
    label: 'Explore more work',
    content: <MoreWorkCard />,
  }]} />
}

function MoreWorkCard() {
  return <article className="more-work-card"><p>There’s more to explore</p><h3>More ideas.<br />More possibilities.</h3><Link className="button primary" to="/work">View more work <ArrowRightLinear size={20} aria-hidden="true" /></Link><span>Explore all my work</span></article>
}

function ReviewCarousel() {
  return <Carousel label="Client reviews" className="reviews-carousel" items={[...testimonials.map(review => ({
    label: `Review by ${review[1]}`,
    content: <ReviewCard review={review} />,
  })), {
    label: 'Explore all client reviews',
    content: <article className="more-work-card more-reviews-card"><p>More client stories</p><h3>Good work.<br />Great relationships.</h3><Link className="button primary" to="/reviews">View all reviews <ArrowRightLinear size={20} aria-hidden="true" /></Link></article>,
  }]} />
}

function Stat({ number, label, prefix = '+' }: { number: string; label: string; prefix?: string }) { return <div><span>{label}</span><strong>{prefix}{number}</strong></div> }
