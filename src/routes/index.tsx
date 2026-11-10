import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightLinear } from 'solar-icon-set'
import { FaLinkedinIn, FaTelegramPlane } from 'react-icons/fa'
import { Carousel } from '../carousel'
import { useLocale, localizedHead, localeFromMatches } from '../localization'
import { Page } from '../components'
import { ProjectCard } from '../projects'
import { getPublishedWork } from '../work/public.functions'
import type { Project } from '../work/types'
import { testimonials, ReviewCard } from '../reviews'
import { animatedHeadingClass, containerClass, focusClass, primaryButtonClass, sectionHeaderClass, sectionHeadingClass, viewMoreClass } from '../ui'

export const Route = createFileRoute('/')({ loader: () => getPublishedWork(), component: HomePage, head: ({ matches }) => localizedHead(localeFromMatches(matches)) })

const workflow = [
  { title: 'Discover', description: 'Understand your goals, your users, and the problem worth solving.' },
  { title: 'Define', description: 'Turn insights into clear priorities, user flows, and a shared direction.' },
  { title: 'Design', description: 'Explore ideas through wireframes, thoughtful interfaces, and interactive prototypes.' },
  { title: 'Refine & deliver', description: 'Test, iterate, and prepare clear design specs for a smooth development handoff.' },
]

function HomePage() {
  const work = Route.useLoaderData()
  const { t, number } = useLocale()
  const socialClass = `grid size-11 shrink-0 place-items-center bg-paper text-[17px] text-muted hover:bg-accent hover:text-paper ${focusClass}`
  const contactSocialClass = 'grid size-12 place-items-center bg-white text-xl text-accent shadow-[0_6px_24px_#0003] hover:bg-[#f8e6ed] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4'
  return <Page>
    <main>
      <section className="relative isolate flex min-h-[calc(100svh_-_64px_-_env(safe-area-inset-bottom,0px))] flex-col md:min-h-svh items-center justify-center bg-[#e1e2e4] bg-[radial-gradient(ellipse_at_15%_25%,#8d013009,transparent_55%),radial-gradient(ellipse_at_90%_60%,#ffffffa6,transparent_55%)] px-6 pt-[98px] text-center">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -inset-12 bg-[url('/imgs/hero-text.gif')] bg-cover bg-center opacity-[0.08] blur-[40px] motion-reduce:hidden" />
        </div>
        <div className={`${containerClass} relative z-1 flex w-full flex-1 flex-col items-center justify-center py-7 md:w-[calc(100%_-_48px)] md:py-8`}>
          <h1 className={`${animatedHeadingClass} m-0 px-[.18em] py-[.12em] text-[clamp(42px,9vw,64px)] leading-[1.15] tracking-[-1px] text-balance md:text-[clamp(48px,6.5vw,88px)] md:tracking-[-2px]`}>{t('Islam S.')}<br />{t('Product Designer')}</h1>
          <p className="mt-6 mb-[30px] text-base leading-[1.65] text-balance text-muted md:text-lg">{t('I turn complex ideas into thoughtful digital experiences.')}<br />{t('Designing products that put people first.')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a className={`${primaryButtonClass} min-w-32 px-[18px] shadow-[0_6px_20px_#8d013021] transition-[background-color,box-shadow] duration-200 hover:shadow-[0_8px_28px_#8d013040] md:min-w-[148px] md:px-6`} href="#work">{t('View my work')}</a>
            <a className={socialClass} href="https://www.linkedin.com/in/islamsayedr" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn aria-hidden="true" /></a>
            <a className={socialClass} href="https://t.me/islamsayedr" target="_blank" rel="noreferrer" aria-label="Telegram"><FaTelegramPlane aria-hidden="true" /></a>
          </div>
        </div>
        <div className={`${containerClass} relative z-1 mt-auto flex w-full justify-center gap-2.5 border-t border-ink/10 py-5 md:w-[calc(100%_-_48px)] md:gap-[42px] md:pt-6 md:pb-7`}>
          <Stat label={t('Designing')} value={t('Since {year}', { year: number(2017, { useGrouping: false }) })} />
          <Stat label={t('served')} value={t('{count} countries', { count: number(12, { signDisplay: 'always' }) })} />
          <Stat label={t('delivered')} value={t('{count} projects', { count: number(24, { signDisplay: 'always' }) })} />
        </div>
      </section>

      <section className={`${containerClass} scroll-mt-[114px] py-16 md:py-24`} id="work" aria-labelledby="work-heading">
        <div className={sectionHeaderClass}><h2 className={sectionHeadingClass} id="work-heading">{t('Work samples')}</h2><Link className={viewMoreClass} to="/work">{t('View more')} <ArrowRightLinear className="rtl:rotate-180" size={18} aria-hidden="true" /></Link></div>
        {work.unavailable ? <p className="text-sm text-muted">{t('Work is temporarily unavailable. Please try again later.')}</p> : <WorkCarousel projects={work.projects} />}
      </section>

      <section className="border-y border-ink/5 bg-linear-[180deg,#e3e3e366,#e3e3e333] py-16 md:py-24" aria-labelledby="workflow-heading">
        <div className={containerClass}>
          <div className="mb-7 text-start md:mb-10"><h2 className={sectionHeadingClass} id="workflow-heading">{t('My workflow')}</h2></div>
          <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {workflow.map((step, index) => <li className="relative rounded-none border border-ink/5 bg-white/70 p-6 md:px-6 md:py-7" key={step.title}>
              <div className="flex items-start gap-3 md:gap-3.5">
                <span className="shrink-0 font-display text-4xl leading-none font-bold text-accent/35" aria-hidden="true">{number(index + 1, { minimumIntegerDigits: 2 })}</span>
                <div className="flex min-w-0 flex-col gap-3"><h3 className="m-0 font-display text-[26px] leading-[1.2] font-bold">{t(step.title)}</h3><p className="m-0 text-sm leading-[1.8] text-muted">{t(step.description)}</p></div>
              </div>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#240d22] bg-[linear-gradient(#10071322,#10071355),url('/imgs/cta-background-mobile.svg')] bg-size-[100%_100%] bg-center bg-no-repeat py-[72px] text-center text-white md:bg-[linear-gradient(#10071322,#10071355),url('/imgs/cta-background.svg')] md:py-[104px]" aria-labelledby="contact-heading">
        <div className={containerClass}>
          <p className="m-0 mb-5 text-xs font-medium tracking-[1.5px] text-[#f5b7cd] uppercase">{t('Have a project in mind?')}</p>
          <h2 className="m-0 font-display text-[clamp(36px,5vw,64px)] leading-[1.12] font-bold tracking-[-1px] text-balance" id="contact-heading">{t('Let’s make something')}<br />{t('worth using.')}</h2>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a className={contactSocialClass} href="https://www.linkedin.com/in/islamsayedr" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn aria-hidden="true" /></a>
            <a className={contactSocialClass} href="https://t.me/islamsayedr" target="_blank" rel="noreferrer" aria-label="Telegram"><FaTelegramPlane aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section className={`${containerClass} py-16 md:py-24`} aria-labelledby="feedback-heading">
        <div className={sectionHeaderClass}><h2 className={`${sectionHeadingClass} max-md:text-2xl`} id="feedback-heading">{t('Kind words from clients')}</h2><Link className={viewMoreClass} to="/reviews">{t('View more')} <ArrowRightLinear className="rtl:rotate-180" size={18} aria-hidden="true" /></Link></div>
        <ReviewCarousel />
      </section>
    </main>
  </Page>
}

function WorkCarousel({ projects }: { projects: Project[] }) {
  const { t } = useLocale()
  return <Carousel label={t('Work samples')} items={[...projects.map(project => ({
    label: project.title,
    content: <ProjectCard project={project} />,
  })), {
    label: t('Explore more work'),
    content: <MoreCard />,
  }]} />
}

function MoreCard({ reviews = false }: { reviews?: boolean }) {
  const { t } = useLocale()
  return <article className={`flex w-full flex-col items-center justify-center rounded-none border border-accent/10 bg-[#e9e5e7] bg-[radial-gradient(ellipse_at_50%_80%,#8d01300d,transparent_70%)] px-4 py-6 text-center md:p-8 ${reviews ? 'min-h-[340px] self-stretch md:min-h-0' : 'aspect-square'}`}>
    <p className="m-0 mb-3 text-[10px] tracking-[1px] text-accent uppercase md:mb-5 md:text-xs">{t(reviews ? 'More client stories' : 'There’s more to explore')}</p>
    <h3 className={`m-0 mb-6 font-display text-[30px] leading-[1.15] font-bold md:mb-8 ${reviews ? 'md:text-[clamp(28px,3.5vw,44px)]' : 'md:text-[clamp(30px,4.5vw,60px)]'}`}>{reviews ? <>{t('Good work.')}<br />{t('Great relationships.')}</> : <>{t('More ideas.')}<br />{t('More possibilities.')}</>}</h3>
    <Link className={`${primaryButtonClass} px-4 py-2.5 text-xs md:px-6 md:py-3 md:text-sm`} to={reviews ? '/reviews' : '/work'}>{t(reviews ? 'View all reviews' : 'View more work')} <ArrowRightLinear className="rtl:rotate-180" size={20} aria-hidden="true" /></Link>
    {!reviews && <span className="mt-3.5 text-[11px] text-muted md:mt-5 md:text-xs">{t('Explore all my work')}</span>}
  </article>
}

function ReviewCarousel() {
  const { t } = useLocale()
  return <Carousel label={t('Client reviews')} items={[...testimonials.map(review => ({
    label: t('Review by {name}', { name: review[1] }),
    content: <ReviewCard review={review} />,
  })), {
    label: t('Explore all client reviews'),
    content: <MoreCard reviews />,
  }]} />
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="flex min-w-0 flex-1 flex-col gap-2 not-first:border-s not-first:border-ink/10"><span className="text-[9px] tracking-[.5px] text-muted uppercase md:text-xs">{label}</span><strong className="font-display text-[clamp(18px,4.4vw,25px)] leading-[1.15] font-bold md:text-[clamp(23px,2.7vw,36px)]"><bdi>{value}</bdi></strong></div>
}
