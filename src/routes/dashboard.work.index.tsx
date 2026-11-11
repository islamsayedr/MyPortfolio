import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type Modifier } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { deleteWork, getAdminWork, reorderWork } from '../work/actions.functions'
import { WorkSetupNotice } from '../work/admin-notices'
import { SortableWorkCard } from '../work/sortable-card'
import type { WorkListRow } from '../work/types'
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
const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 })

function WorkAdminPage() {
  const result = Route.useLoaderData()
  const { t, number } = useLocale()
  const router = useRouter()
  const [pending, setPending] = useState<'delete' | 'reorder' | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [optimistic, setOptimistic] = useState<{ page: number; projects: WorkListRow[] } | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  useEffect(() => {
    if (!optimistic || pending !== null || !result) return
    // Keep the optimistic order until the router's fresh loader data commits;
    // clearing immediately after invalidate can briefly render the old order.
    if (result.page !== optimistic.page || result.projects.map(project => project.id).join(',') === optimistic.projects.map(project => project.id).join(',')) setOptimistic(null)
  }, [result, optimistic, pending])
  if (!result) return null
  const projects = optimistic?.page === result.page ? optimistic.projects : result.projects
  const busy = pending !== null
  const locked = busy || activeId !== null
  const title = (id: string | number) => projects.find(project => project.id === id)?.title ?? t('Project')
  const position = (id: string | number) => number(result.page * result.pageSize + projects.findIndex(project => project.id === id) + 1)

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over || active.id === over.id || busy) return
    const from = projects.findIndex(project => project.id === active.id)
    const to = projects.findIndex(project => project.id === over.id)
    if (from < 0 || to < 0) return
    const ordered = arrayMove(projects, from, to)
    setOptimistic({ page: result.page, projects: ordered.map((project, index) => ({ ...project, sort_order: result.page * result.pageSize + index })) })
    setPending('reorder'); setError(''); setStatus('Saving project order…')
    try {
      await reorderWork({ data: { page: result.page, projects: ordered.map(({ id, updated_at }) => ({ id, updated_at })) } })
      await router.invalidate()
      setStatus('Project order saved.')
    } catch (cause) {
      setStatus('')
      setError(cause instanceof Error ? cause.message : 'Unable to save project order. Apply the reorder migration and try again.')
      setOptimistic(null)
    } finally { setPending(null) }
  }

  return <section className="pb-24">
    <Link className={`fixed end-6 bottom-[calc(1.5rem_+_env(safe-area-inset-bottom,0px))] z-[5] grid size-14 place-items-center bg-accent text-white shadow-lg transition-colors hover:bg-accent/90 disabled:opacity-50 motion-reduce:transition-none ${focusClass}`} to="/dashboard/work/new" disabled={locked} aria-label={t('New project')} title={t('New project')}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </Link>
    {result.failed ? <WorkSetupNotice setupRequired={result.setupRequired} /> : <>
      {error && <p className="mb-4 text-sm text-accent" role="alert">{t(error)}</p>}
      {status && <p className="mb-4 text-sm text-muted" role="status">{t(status)}</p>}
      <h1 className="sr-only">{t('Projects')}</h1>
      <DndContext id="work-projects" sensors={sensors} collisionDetection={closestCenter} modifiers={[verticalOnly]} onDragStart={({ active }) => { setActiveId(String(active.id)); setError(''); setStatus('') }} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)} accessibility={{
        screenReaderInstructions: { draggable: t('Press Space to pick up a project. Use Up and Down to move it, Space to drop, or Escape to cancel.') },
        announcements: {
          onDragStart: ({ active }) => t('Picked up {project}.', { project: title(active.id) }),
          onDragOver: ({ active, over }) => over ? t('Moving {project} to position {position}.', { project: title(active.id), position: position(over.id) }) : undefined,
          onDragEnd: ({ active, over }) => over ? t('Dropped {project} at position {position}.', { project: title(active.id), position: position(over.id) }) : t('Reordering cancelled.'),
          onDragCancel: () => t('Reordering cancelled.'),
        },
      }}>
        <SortableContext items={projects.map(project => project.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3" role="list" aria-label={t('Projects')} aria-busy={busy}>
            {projects.map(project => <SortableWorkCard project={project} key={project.id} busy={busy} sorting={activeId !== null} onDelete={async () => {
              if (!window.confirm(t('Delete {project}? This cannot be undone.', { project: project.title }))) return
              setPending('delete'); setError(''); setStatus('')
              try {
                await deleteWork({ data: { id: project.id, updated_at: project.updated_at } })
                await router.invalidate(); setStatus('Project deleted.')
              } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to delete this project.') } finally { setPending(null) }
            }} />)}
          </div>
        </SortableContext>
      </DndContext>
      {projects.length === 0 && <p className="text-sm text-muted">{t('No projects on this page.')}</p>}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex flex-wrap gap-3 text-muted">
          <span>{t('Projects')} ({number(result.total)})</span>
          <span>{t('Page {page}', { page: number(result.page + 1) })}</span>
        </div>
        <div className="flex gap-3">
          {result.page > 0 && <Link className={secondary} to="/dashboard/work" search={{ page: result.page - 1 }} disabled={locked}>{t('Previous')}</Link>}
          {(result.page + 1) * result.pageSize < result.total && <Link className={secondary} to="/dashboard/work" search={{ page: result.page + 1 }} disabled={locked}>{t('Next')}</Link>}
        </div>
      </div>
    </>}
  </section>
}
