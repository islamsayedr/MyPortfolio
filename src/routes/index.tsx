import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightLinear } from 'solar-icon-set'
import { Carousel } from '../carousel'
import { Page } from '../components'
import { projects, ProjectCard } from '../projects'
import { testimonials, ReviewCard } from '../reviews'
import { animatedHeadingClass, buttonClass, containerClass, primaryButtonClass, sectionHeaderClass, sectionHeadingClass, viewMoreClass } from '../ui'

export const Route = createFileRoute('/')({ component: HomePage, head: () => ({ meta: [{ title: 'Islam Sayed | Product Designer' }] }) })

const workflow = [
  { title: 'Discover', description: 'Understand your goals, your users, and the problem worth solving.' },
  { title: 'Define', description: 'Turn insights into clear priorities, user flows, and a shared direction.' },
  { title: 'Design', description: 'Explore ideas through wireframes, thoughtful interfaces, and interactive prototypes.' },
  { title: 'Refine & deliver', description: 'Test, iterate, and prepare clear design specs for a smooth development handoff.' },
]

function HomePage() {
  return <Page>
    <main>
      <section className="flex min-h-svh flex-col items-center justify-center bg-[#e1e2e4] bg-[radial-gradient(ellipse_at_15%_25%,#8d013009,transparent_55%),radial-gradient(ellipse_at_90%_60%,#ffffffa6,transparent_55%)] px-6 pt-[98px] text-center">
        <div className={`${containerClass} flex w-full flex-1 flex-col items-center justify-center py-7 md:w-[calc(100%_-_48px)] md:py-8`}>
          <h1 className={`${animatedHeadingClass} m-0 px-[.18em] py-[.12em] text-[clamp(42px,9vw,64px)] leading-[1.15] tracking-[-1px] text-balance md:text-[clamp(48px,6.5vw,88px)] md:tracking-[-2px]`}>Islam S.<br />Product Designer</h1>
          <p className="mt-6 mb-[30px] text-base leading-[1.65] text-balance text-muted md:text-lg">I turn complex ideas into thoughtful digital experiences.<br />Designing products that put people first.</p>
          <a className={`${primaryButtonClass} min-w-32 px-[18px] shadow-[0_6px_20px_#8d013021] transition-[background-color,box-shadow] duration-200 hover:shadow-[0_8px_28px_#8d013040] md:min-w-[148px] md:px-6`} href="#work">View my work</a>
        </div>
        <div className={`${containerClass} mt-auto flex w-full justify-center gap-2.5 border-t border-ink/10 py-5 md:w-[calc(100%_-_48px)] md:gap-[42px] md:pt-6 md:pb-7`}>
          <Stat number="2017" label="Designing" prefix="Since " />
          <Stat number="12 countries" label="served" />
          <Stat number="24 projects" label="delivered" />
        </div>
      </section>

      <section className={`${containerClass} scroll-mt-[114px] py-16 md:py-24`} id="work" aria-labelledby="work-heading">
        <div className={sectionHeaderClass}><h2 className={sectionHeadingClass} id="work-heading">Work samples</h2><Link className={viewMoreClass} to="/work">View more <ArrowRightLinear size={18} aria-hidden="true" /></Link></div>
        <WorkCarousel />
      </section>

      <section className="border-y border-ink/5 bg-linear-[180deg,#e3e3e366,#e3e3e333] py-16 md:py-24" aria-labelledby="workflow-heading">
        <div className={containerClass}>
          <div className="mb-7 text-start md:mb-10"><h2 className={sectionHeadingClass} id="workflow-heading">My workflow</h2></div>
          <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {workflow.map((step, index) => <li className="relative rounded-none border border-ink/5 bg-white/70 p-6 md:px-6 md:py-7" key={step.title}>
              <div className="flex items-start gap-3 md:gap-3.5">
                <span className="shrink-0 font-display text-4xl leading-none font-bold text-accent/35" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div className="flex min-w-0 flex-col gap-3"><h3 className="m-0 font-display text-[26px] leading-[1.2] font-bold">{step.title}</h3><p className="m-0 text-sm leading-[1.8] text-muted">{step.description}</p></div>
              </div>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#240d22] bg-[linear-gradient(#10071322,#10071355),url('/imgs/cta-background-mobile.svg')] bg-size-[100%_100%] bg-center bg-no-repeat py-[72px] text-center text-white md:bg-[linear-gradient(#10071322,#10071355),url('/imgs/cta-background.svg')] md:py-[104px]" aria-labelledby="contact-heading">
        <div className={containerClass}>
          <p className="m-0 mb-5 text-xs font-medium tracking-[1.5px] text-[#f5b7cd] uppercase">Have a project in mind?</p>
          <h2 className="m-0 font-display text-[clamp(36px,5vw,64px)] leading-[1.12] font-bold tracking-[-1px] text-balance" id="contact-heading">Let’s make something<br />worth using.</h2>
          <div className="mt-8 flex flex-col items-center gap-5"><a className={`${buttonClass} min-w-[180px] bg-white text-accent shadow-[0_6px_24px_#0003] hover:bg-[#f8e6ed] focus-visible:outline-white`} href="https://t.me/islamsayedr" target="_blank" rel="noreferrer">Let’s talk <ArrowRightLinear size={20} aria-hidden="true" /></a></div>
        </div>
      </section>

      <section className={`${containerClass} py-16 md:py-24`} aria-labelledby="feedback-heading">
        <div className={sectionHeaderClass}><h2 className={`${sectionHeadingClass} max-md:text-2xl`} id="feedback-heading">Kind words from clients</h2><Link className={viewMoreClass} to="/reviews">View more <ArrowRightLinear size={18} aria-hidden="true" /></Link></div>
        <ReviewCarousel />
      </section>
    </main>
  </Page>
}

function WorkCarousel() {
  return <Carousel label="Work samples" items={[...projects.map(project => ({
    label: project.title,
    content: <ProjectCard project={project} />,
  })), {
    label: 'Explore more work',
    content: <MoreCard />,
  }]} />
}

function MoreCard({ reviews = false }: { reviews?: boolean }) {
  return <article className={`flex w-full flex-col items-center justify-center rounded-none border border-accent/10 bg-[#e9e5e7] bg-[radial-gradient(ellipse_at_50%_80%,#8d01300d,transparent_70%)] px-4 py-6 text-center md:p-8 ${reviews ? 'min-h-[340px] self-stretch md:min-h-0' : 'aspect-square'}`}>
    <p className="m-0 mb-3 text-[10px] tracking-[1px] text-accent uppercase md:mb-5 md:text-xs">{reviews ? 'More client stories' : 'There’s more to explore'}</p>
    <h3 className={`m-0 mb-6 font-display text-[30px] leading-[1.15] font-bold md:mb-8 ${reviews ? 'md:text-[clamp(28px,3.5vw,44px)]' : 'md:text-[clamp(30px,4.5vw,60px)]'}`}>{reviews ? <>Good work.<br />Great relationships.</> : <>More ideas.<br />More possibilities.</>}</h3>
    <Link className={`${primaryButtonClass} px-4 py-2.5 text-xs md:px-6 md:py-3 md:text-sm`} to={reviews ? '/reviews' : '/work'}>{reviews ? 'View all reviews' : 'View more work'} <ArrowRightLinear size={20} aria-hidden="true" /></Link>
    {!reviews && <span className="mt-3.5 text-[11px] text-muted md:mt-5 md:text-xs">Explore all my work</span>}
  </article>
}

function ReviewCarousel() {
  return <Carousel label="Client reviews" items={[...testimonials.map(review => ({
    label: `Review by ${review[1]}`,
    content: <ReviewCard review={review} />,
  })), {
    label: 'Explore all client reviews',
    content: <MoreCard reviews />,
  }]} />
}

function Stat({ number, label, prefix = '+' }: { number: string; label: string; prefix?: string }) {
  return <div className="flex min-w-0 flex-1 flex-col gap-2 not-first:border-s not-first:border-ink/10"><span className="text-[9px] tracking-[.5px] text-muted uppercase md:text-xs">{label}</span><strong className="font-display text-[clamp(18px,4.4vw,25px)] leading-[1.15] font-bold md:text-[clamp(23px,2.7vw,36px)]">{prefix}{number}</strong></div>
}
