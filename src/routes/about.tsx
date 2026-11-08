import { createFileRoute } from '@tanstack/react-router'
import { ArrowRightLinear } from 'solar-icon-set'
import { Page } from '../components'
import { focusClass, innerPageClass, sectionHeadingClass } from '../ui'

export const Route = createFileRoute('/about')({ component: AboutPage, head: () => ({ meta: [{ title: 'About | Islam Sayed' }] }) })

const skills = ['Agile', 'Design Thinking', 'Competitive Analysis', 'Heuristic Evaluation', 'User Research', 'Usability Testing', 'Card Sorting', 'Wireframing', 'Design Systems', 'Visual Design', 'Prototyping', 'Mockups', 'User Flows', 'Sitemaps', 'Figma', 'Adobe XD', 'Photoshop', 'HTML', 'CSS', 'JavaScript']

// Transcribed from the LinkedIn Experience screenshot supplied by the owner.
// Keep date ranges rather than duration totals, which become stale.
const history = [
  {
    title: 'Design Engineer',
    company: 'Dreamy',
    employment: '',
    dates: 'Mar 2025 – Present',
    location: 'Al Khobar, Eastern, Saudi Arabia',
    current: true,
    skills: [],
  },
  {
    title: 'UI Designer',
    company: 'MD Soft',
    employment: 'Full-time',
    dates: 'Sep 2024 – Mar 2025',
    location: 'Egypt · Remote',
    current: false,
    skills: ['User Interface Prototyping', 'User Experience (UX)'],
  },
  {
    title: 'UI/UX Designer',
    company: 'Iraq Soft',
    employment: 'Full-time',
    dates: 'Apr 2023 – Sep 2024',
    location: 'Remote',
    current: false,
    skills: [],
  },
  {
    title: 'Freelance Product Designer',
    company: 'Self-employed',
    employment: '',
    dates: 'Mar 2023 – Apr 2023',
    location: '',
    current: false,
    skills: ['UX Research', 'User Interface Design'],
  },
  {
    title: 'UI/UX Design Intern',
    company: 'Information Technology Institute (ITI)',
    employment: 'Internship',
    dates: 'Nov 2022 – Mar 2023',
    location: 'Egypt · Hybrid',
    current: false,
    skills: [],
  },
  {
    title: 'Graphic Designer',
    company: 'Freelancer.com',
    employment: 'Freelance',
    dates: 'Jan 2017 – Jan 2019',
    location: 'Online',
    current: false,
    skills: ['Adobe Photoshop', 'Logo Design'],
  },
]

function AboutPage() {
  return <Page>
    <main className={innerPageClass}>
      <img className="mb-10 aspect-[16/7] w-full rounded-none object-cover md:mb-14 md:max-h-[430px]" src="/imgs/aboutImg.jpg" alt="Islam Sayed at his workspace" />
      <div className="grid items-start gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
        <aside className="min-w-0 border-ink/10 lg:border-e lg:pe-8" aria-label="About and skills">
          <section aria-labelledby="brief-heading">
            <h2 className="mb-5 font-display text-[26px] leading-tight font-bold" id="brief-heading">Brief summary</h2>
            <p className="text-sm leading-[1.9] text-muted">A product designer with a background in graphic design and the ability to write HTML, CSS, and JavaScript. Currently a Design Engineer at Dreamy in Al Khobar, Saudi Arabia, with UI/UX training at the Information Technology Institute and experience across freelance and full-time design roles.</p>
          </section>
          <section className="mt-9 border-t border-ink/10 pt-8" aria-labelledby="skills-heading">
            <h2 className="mb-5 font-display text-[26px] leading-tight font-bold" id="skills-heading">Skills & tools</h2>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">{skills.map(skill => <li className="border border-ink/10 bg-white px-2.5 py-1.5 text-xs text-muted" key={skill}>{skill}</li>)}</ul>
          </section>
        </aside>

        <section className="min-w-0" aria-labelledby="history-heading">
          <div className="mb-9 border-b border-ink/10 pb-7">
            <p className="mb-3 text-xs font-medium tracking-[1px] text-accent uppercase">Designing since 2017</p>
            <h1 className={sectionHeadingClass} id="history-heading">My history</h1>
          </div>
          <ol className="m-0 list-none p-0" aria-label="Design history">{history.map((item, index) => <li className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-4 pb-10 last:pb-0 md:gap-6 md:pb-12" key={item.title}>
            <div className="relative flex justify-center" aria-hidden="true">
              {index < history.length - 1 && <span className="absolute top-9 bottom-[-40px] w-px bg-accent/20 md:bottom-[-48px]" />}
              <span className="relative z-1 grid size-9 shrink-0 place-items-center border border-accent/25 bg-paper text-xs font-medium text-accent">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <article className="min-w-0 pt-1.5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-[28px] leading-tight font-bold">{item.title}</h2>
                {item.current && <span className="border border-accent/20 bg-accent/5 px-2 py-1 text-[11px] font-medium text-accent">Present</span>}
              </div>
              <p className="mb-3 text-sm font-medium">{item.company}{item.employment && <span className="font-normal text-muted"> · {item.employment}</span>}</p>
              <p className="text-sm leading-[1.8] text-muted">{item.dates}</p>
              {item.location && <p className="text-sm leading-[1.8] text-muted">{item.location}</p>}
              {item.skills.length > 0 && <ul className="mt-4 flex list-none flex-wrap gap-2 p-0" aria-label="Skills used">{item.skills.map(skill => <li className="border border-ink/10 bg-white px-2 py-1 text-xs text-muted" key={skill}>{skill}</li>)}</ul>}
            </article>
          </li>)}</ol>
          <a className={`mt-7 inline-flex items-center gap-2 py-2 text-sm font-medium text-accent ${focusClass}`} href="https://www.linkedin.com/in/islamsayedr" target="_blank" rel="noreferrer">View experience on LinkedIn <ArrowRightLinear size={18} aria-hidden="true" /></a>
        </section>
      </div>
    </main>
  </Page>
}
