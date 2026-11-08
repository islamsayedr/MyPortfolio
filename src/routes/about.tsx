import { createFileRoute } from '@tanstack/react-router'
import { Page, SectionTitle } from '../components'
import { innerPageClass } from '../ui'

export const Route = createFileRoute('/about')({ component: AboutPage, head: () => ({ meta: [{ title: 'About | Islam Sayed' }] }) })
const skills = ['Agile', 'Design Thinking', 'Competitive Analysis', 'Heuristic Evaluation', 'User Research', 'Usability Testing', 'Card Sorting', 'Wireframing', 'Design Systems', 'Visual Design', 'Prototyping', 'Mockups', 'User Flows', 'Sitemaps', 'Figma', 'Adobe XD', 'Photoshop', 'HTML', 'CSS', 'JavaScript']

function AboutPage() {
  return <Page>
    <main className={innerPageClass}>
      <img className="mb-[60px] max-h-[430px] w-full rounded-none object-cover" src="/imgs/aboutImg.jpg" alt="Islam Sayed" />
      <SectionTitle>Brief summary</SectionTitle>
      <p className="mx-auto mb-[70px] max-w-[850px] text-center text-[19px] leading-[1.8] text-muted">A UI/UX designer with a background in graphic design and the ability to write HTML, CSS, and JavaScript. Certified by the Information Technology Institute, with proven freelance experience in visual, user interface, and graphic design.</p>
      <section>
        <SectionTitle>What I've worked with</SectionTitle>
        <div className="flex flex-wrap justify-center gap-2">{skills.map(skill => <span className="rounded-none border border-transparent bg-white px-2.5 py-[5px] text-[13px] text-muted hover:border-accent" key={skill}>{skill}</span>)}</div>
      </section>
    </main>
  </Page>
}
