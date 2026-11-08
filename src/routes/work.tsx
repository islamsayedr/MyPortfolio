import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftLinear } from 'solar-icon-set'
import { Page } from '../components'
import { projects, ProjectCard } from '../projects'

export const Route = createFileRoute('/work')({
  component: WorkPage,
  head: () => ({ meta: [
    { title: 'Work | Islam Sayed' },
    { name: 'description', content: 'Explore Islam Sayed’s UI/UX and product design projects for mobile apps and websites.' },
  ] }),
})

function WorkPage() {
  return <Page><main className="container inner-page work-gallery"><header className="work-page-heading"><Link className="page-back" to="/"><ArrowLeftLinear size={18} aria-hidden="true" />Back to home</Link><h1>All work</h1><p>A collection of mobile apps, websites, and thoughtful digital experiences.</p></header><div className="work-grid work-carousel">{projects.map(project => <ProjectCard key={project.title} project={project} />)}</div></main></Page>
}
