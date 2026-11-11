import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router'
import { ArrowLeftLinear } from 'solar-icon-set'
import { Page } from '../components'
import { useLocale, localizedHead, localeFromMatches } from '../localization'
import { getLegacyProjectId, getPublishedProject } from '../work/public.functions'
import { legacyProjectKey, workId } from '../work/validation'
import { ProjectContent } from '../work/project-content'
import { backLinkClass, innerPageClass, pageHeadingClass, primaryButtonClass } from '../ui'

export const Route = createFileRoute('/work/$projectid')({
  loader: async ({ params }) => {
    let id: string | null = null
    try { id = workId(params.projectid) } catch { /* Check read-only legacy aliases below. */ }
    if (id) {
      const result = await getPublishedProject({ data: id })
      if (result.project && result.project.id !== params.projectid) throw redirect({ to: '/work/$projectid', params: { projectid: result.project.id }, statusCode: 301 })
      if (result.project || result.unavailable) return result
    }
    try { legacyProjectKey(params.projectid) } catch { throw notFound() }
    const legacy = await getLegacyProjectId({ data: params.projectid })
    if (legacy.unavailable) return { project: null, unavailable: true }
    if (legacy.id && legacy.id !== params.projectid) throw redirect({ to: '/work/$projectid', params: { projectid: legacy.id }, statusCode: 301 })
    throw notFound()
  },
  head: ({ loaderData, matches }) => localizedHead(localeFromMatches(matches), loaderData?.project?.title ?? 'Project not found', loaderData?.project?.description.replace(/\s+/g, ' ').trim().slice(0, 160) || undefined),
  component: ProjectPage,
  notFoundComponent: ProjectNotFound,
})

function ProjectPage() {
  const { project } = Route.useLoaderData()
  const { t } = useLocale()
  if (!project) return <Page><main className={innerPageClass}><h1 className={pageHeadingClass}>{t('Work')}</h1><p className="mt-6 text-muted">{t('Work is temporarily unavailable. Please try again later.')}</p><Link className={backLinkClass} to="/work">{t('Back to all work')}</Link></main></Page>
  return <Page>
    <main className={innerPageClass}>
      <Link className={backLinkClass} to="/work"><ArrowLeftLinear className="rtl:rotate-180" size={18} aria-hidden="true" />{t('Back to all work')}</Link>
      <ProjectContent project={project} />
    </main>
  </Page>
}

function ProjectNotFound() {
  const { t } = useLocale()
  return <Page><main className={`${innerPageClass} flex flex-col items-start justify-center gap-6`}><h1 className={pageHeadingClass}>{t('Project not found')}</h1><p className="text-muted">{t('This project does not exist or is no longer available.')}</p><Link className={primaryButtonClass} to="/work">{t('Back to all work')}</Link></main></Page>
}
