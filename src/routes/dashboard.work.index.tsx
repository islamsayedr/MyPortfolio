import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { deleteWork, getAdminWork } from '../work/actions.functions'
import { WorkSetupNotice } from '../work/admin-notices'
import { useLocale } from '../localization'
import { focusClass } from '../ui'

export const Route = createFileRoute('/dashboard/work/')({
  validateSearch: (search: { page?: unknown }) => {
    const page = Number(search.page ?? 0)
    return { page: Number.isInteger(page) && page >= 0 && page <= 10000 ? page : 0 }
  },
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ context, deps }) => context.dashboard.configured ? getAdminWork({ data: { page: deps.page } }) : null,
  component: WorkAdminPage,
})

const secondary = `inline-flex items-center justify-center border border-ink/20 bg-white px-3 py-2 text-sm hover:bg-paper disabled:cursor-wait disabled:opacity-50 ${focusClass}`

function WorkAdminPage() {
  const result = Route.useLoaderData()
  const { t, number } = useLocale()
  const router = useRouter()
  const [pending, setPending] = useState<'delete' | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  if (!result) return null
  return <section className="pb-24">
    <Link className={`fixed end-6 bottom-[calc(1.5rem_+_env(safe-area-inset-bottom,0px))] z-[5] grid size-14 place-items-center bg-accent text-white shadow-lg transition-colors hover:bg-accent/90 motion-reduce:transition-none ${focusClass}`} to="/dashboard/work/new" aria-label={t('New project')} title={t('New project')}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </Link>
    {result.failed ? <WorkSetupNotice setupRequired={result.setupRequired} /> : <>
      {error && <p className="mb-4 text-sm text-accent" role="alert">{t(error)}</p>}
      {status && <p className="mb-4 text-sm text-muted" role="status">{t(status)}</p>}
      <h1 className="sr-only">{t('Projects')}</h1>
      <div className="space-y-3">
        {result.projects.map(project => <article className="flex min-w-0 flex-wrap items-center gap-4 border border-ink/10 bg-white p-4" key={project.id}>
          <img className="size-16 shrink-0 bg-paper object-cover" src={project.image_url} alt={project.image_alt} loading="lazy" />
          <div className="min-w-0 flex-1 basis-32">
            <h3 className="break-words font-medium">{project.title}</h3>
            <p className="mt-1 break-all text-xs text-muted" dir="ltr">/work/{project.slug}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs"><span className={project.published ? 'text-accent' : 'text-muted'}>{t(project.published ? 'Published' : 'Draft')}</span><span className="text-muted">{t('Display order')}: {number(project.sort_order)}</span></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className={secondary} to="/dashboard/work/$projectid" params={{ projectid: project.id }} aria-label={t('Preview {project}', { project: project.title })}>{t('Preview')}</Link>
            <Link className={secondary} to="/dashboard/work/$projectid/edit" params={{ projectid: project.id }} aria-label={t('Edit {project}', { project: project.title })}>{t('Edit')}</Link>
            <button type="button" className={`${secondary} text-accent`} disabled={pending !== null} aria-label={t('Delete {project}', { project: project.title })} onClick={async () => {
              if (!window.confirm(t('Delete {project}? This cannot be undone.', { project: project.title }))) return
              setPending('delete'); setError(''); setStatus('')
              try {
                await deleteWork({ data: { id: project.id, updated_at: project.updated_at } })
                await router.invalidate(); setStatus('Project deleted.')
              } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to delete this project.') } finally { setPending(null) }
            }}>{t('Delete')}</button>
          </div>
        </article>)}
        {result.projects.length === 0 && <p className="text-sm text-muted">{t('No projects on this page.')}</p>}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex flex-wrap gap-3 text-muted">
          <span>{t('Projects')} ({number(result.total)})</span>
          <span>{t('Page {page}', { page: number(result.page + 1) })}</span>
        </div>
        <div className="flex gap-3">
          {result.page > 0 && <Link className={secondary} to="/dashboard/work" search={{ page: result.page - 1 }}>{t('Previous')}</Link>}
          {(result.page + 1) * result.pageSize < result.total && <Link className={secondary} to="/dashboard/work" search={{ page: result.page + 1 }}>{t('Next')}</Link>}
        </div>
      </div>
    </>}
  </section>
}
