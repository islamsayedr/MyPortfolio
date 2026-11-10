import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'
import { useLocale } from '../localization'
import { focusClass } from '../ui'
import { ProjectContent } from '../work/project-content'
import { projectFromRow } from '../work/types'

const projectRoute = getRouteApi('/dashboard/work/$projectid')

export const Route = createFileRoute('/dashboard/work/$projectid/')({
  component: ProjectPreviewPage,
})

function ProjectPreviewPage() {
  const project = projectRoute.useLoaderData()
  const { t } = useLocale()
  if (!project) return null
  const actionClass = `inline-flex items-center justify-center border border-ink/20 bg-white px-3 py-2 text-sm hover:bg-paper ${focusClass}`
  return <section aria-label={t('Project preview')}>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <span className={`border border-ink/10 px-3 py-2 text-xs ${project.published ? 'text-accent' : 'text-muted'}`}>{t(project.published ? 'Published' : 'Draft')}</span>
      <div className="flex flex-wrap gap-2">
        <Link className={actionClass} to="/dashboard/work/$projectid/edit" params={{ projectid: project.id }}>{t('Edit project')}</Link>
        {project.published && <a className={actionClass} href={`/work/${project.slug}`} target="_blank" rel="noreferrer">{t('View public page')}</a>}
      </div>
    </div>
    {!project.published && <p className="mb-6 text-xs text-muted" role="note">{t('This is a private draft preview. It is not visible on the public website.')}</p>}
    <ProjectContent project={projectFromRow(project)} hideTitle />
  </section>
}
