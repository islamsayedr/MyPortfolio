import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftLinear } from 'solar-icon-set'
import { Page } from '../components'
import { projects, ProjectCard } from '../projects'
import { backLinkClass, innerPageClass, pageDescriptionClass, pageHeadingClass } from '../ui'

export const Route = createFileRoute('/work')({
  component: WorkPage,
  head: () => ({ meta: [
    { title: 'Work | Islam Sayed' },
    { name: 'description', content: 'Explore Islam Sayed’s UI/UX and product design projects for mobile apps and websites.' },
  ] }),
})

function WorkPage() {
  return <Page>
    <main className={innerPageClass}>
      <header className="mb-8 md:mb-12">
        <Link className={backLinkClass} to="/"><ArrowLeftLinear size={18} aria-hidden="true" />Back to home</Link>
        <h1 className={pageHeadingClass}>All work</h1>
        <p className={pageDescriptionClass}>A collection of mobile apps, websites, and thoughtful digital experiences.</p>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">{projects.map(project => <ProjectCard key={project.title} project={project} />)}</div>
    </main>
  </Page>
}
