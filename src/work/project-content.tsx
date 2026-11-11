import { useLocale } from '../localization'
import { pageHeadingClass } from '../ui'
import type { Project } from './types'
import { Presentation } from './presentation'

// The dashboard preview and public detail page render the same saved content.
export function ProjectContent({ project, hideTitle = false }: { project: Project; hideTitle?: boolean }) {
  const { t } = useLocale()
  return <>
    <header className="mb-8 md:mb-12">
      <h1 className={hideTitle ? 'sr-only' : pageHeadingClass}>{project.title}</h1>
      <ul className={`flex list-none flex-wrap gap-2 p-0 ${hideTitle ? '' : 'mt-5'}`} aria-label={t('Project categories')}>{project.tags.map(tag => <li className="border border-ink/10 bg-white px-3 py-1.5 text-xs text-muted" key={tag}>{t(tag)}</li>)}</ul>
    </header>
    {project.description && <p className="mb-8 max-w-3xl whitespace-pre-wrap break-words text-muted">{project.description}</p>}
    <img className="max-h-[85svh] w-full bg-[#e3e3e3] object-contain" src={project.image} alt={t(project.alt)} />
    {project.presentation && <Presentation content={project.presentation} className="mt-10 md:mt-12" />}
  </>
}
