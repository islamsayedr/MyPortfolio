import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components'
import { useLocale, localizedHead, localeFromMatches } from '../localization'
import { ExperienceTimeline, type Experience } from '../experience-timeline'
import { innerPageClass, sectionHeadingClass } from '../ui'

export const Route = createFileRoute('/about')({ component: AboutPage, head: ({ matches }) => localizedHead(localeFromMatches(matches), 'About') })

const skills = ['Agile', 'Design Thinking', 'Competitive Analysis', 'Heuristic Evaluation', 'User Research', 'Usability Testing', 'Card Sorting', 'Wireframing', 'Design Systems', 'Visual Design', 'Prototyping', 'Mockups', 'User Flows', 'Sitemaps', 'Figma', 'Adobe XD', 'Photoshop', 'HTML', 'CSS', 'JavaScript']

// Transcribed from the LinkedIn Experience screenshot supplied by the owner.
// Keep date ranges rather than duration totals, which become stale.
const history: Experience[] = [
  {
    title: 'Design Engineer',
    company: 'Dreamy',
    start: '2025-03',
    end: null,
    current: true,
    skills: [],
  },
  {
    title: 'UI Designer',
    company: 'MD Soft',
    start: '2024-09',
    end: '2025-03',
    current: false,
    skills: ['User Interface Prototyping', 'User Experience (UX)'],
  },
  {
    title: 'UI/UX Designer',
    company: 'Iraq Soft',
    start: '2023-04',
    end: '2024-09',
    current: false,
    skills: [],
  },
  {
    title: 'Freelance Product Designer',
    company: 'Self-employed',
    start: '2023-03',
    end: '2023-04',
    current: false,
    skills: ['UX Research', 'User Interface Design'],
  },
  {
    title: 'UI/UX Design Intern',
    company: 'Information Technology Institute (ITI)',
    start: '2022-11',
    end: '2023-03',
    current: false,
    skills: [],
  },
  {
    title: 'Graphic Designer',
    company: 'Freelancer.com',
    start: '2017-01',
    end: '2019-01',
    current: false,
    skills: ['Adobe Photoshop', 'Logo Design'],
  },
]

function AboutPage() {
  const { t, number } = useLocale()
  return <Page>
    <main className={innerPageClass}>
      <img className="mb-10 aspect-[16/7] w-full rounded-none object-cover md:mb-14 md:max-h-[430px]" src="/imgs/aboutImg.jpg" alt={t('Islam Sayed at his workspace')} />
      <div className="grid items-start gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
        <aside className="min-w-0 border-ink/10 lg:border-e lg:pe-8" aria-label={t('About and skills')}>
          <section aria-labelledby="brief-heading">
            <h2 className="mb-5 font-display text-[26px] leading-tight font-bold" id="brief-heading">{t('Brief summary')}</h2>
            <p className="text-sm leading-[1.9] text-muted">{t("A product designer with a background in graphic design and the ability to write HTML, CSS, and JavaScript. Currently a Design Engineer at Dreamy in Al Khobar, Saudi Arabia, with UI/UX training at the Information Technology Institute and experience across freelance and full-time design roles.")}</p>
          </section>
          <section className="mt-9 border-t border-ink/10 pt-8" aria-labelledby="skills-heading">
            <h2 className="mb-5 font-display text-[26px] leading-tight font-bold" id="skills-heading">{t('Skills & tools')}</h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">{skills.map(skill => <li className="border border-ink/10 bg-white px-2.5 py-1.5 text-xs text-muted" key={skill}>{t(skill)}</li>)}</ul>
          </section>
        </aside>

        <section className="min-w-0" aria-labelledby="history-heading">
          <div className="mb-9 border-b border-ink/10 pb-7">
            <p className="mb-3 text-xs font-medium tracking-[1px] text-accent uppercase">{t('Designing since {year}', { year: number(2017, { useGrouping: false }) })}</p>
            <h1 className={sectionHeadingClass} id="history-heading">{t('My history')}</h1>
          </div>
          <ExperienceTimeline items={history} />
        </section>
      </div>
    </main>
  </Page>
}
