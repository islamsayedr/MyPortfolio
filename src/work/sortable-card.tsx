import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useLocale } from '../localization'
import { focusClass } from '../ui'
import { WorkActionsMenu } from './actions-menu'
import type { WorkListRow } from './types'

export function SortableWorkCard({ project, busy, sorting, onDelete }: { project: WorkListRow; busy: boolean; sorting: boolean; onDelete: () => Promise<void> }) {
  const { t, number } = useLocale()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id, disabled: busy, transition: { duration: 150, easing: 'ease' },
  })
  return <div role="listitem" ref={setNodeRef} className="relative flex min-w-0 items-start gap-2 motion-reduce:transition-none!" style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}>
    <button ref={setActivatorNodeRef} type="button" {...attributes} {...listeners} disabled={busy} aria-label={t('Drag to reorder {project}', { project: project.title })} aria-roledescription={t('Sortable project')} title={t('Drag to reorder {project}', { project: project.title })} className={`mt-2 grid size-8 shrink-0 touch-none cursor-grab place-items-center text-muted hover:bg-ink/5 hover:text-accent active:cursor-grabbing disabled:cursor-wait disabled:opacity-50 ${focusClass}`}>
      <svg width="16" height="20" viewBox="0 0 16 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="6" r="1.5" /><circle cx="11" cy="6" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="11" cy="12" r="1.5" /><circle cx="5" cy="18" r="1.5" /><circle cx="11" cy="18" r="1.5" /></svg>
    </button>
    <article className={`grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border bg-white p-3 md:gap-3 md:p-4 ${isDragging ? 'border-accent/40 shadow-lg' : 'border-ink/10'}`}>
      <img className="size-12 shrink-0 bg-paper object-cover md:size-16" src={project.image_url} alt={project.image_alt} loading="lazy" draggable={false} />
      <div className="min-w-0">
        <h3 className="break-words font-medium">{project.title}</h3>
        <div className="mt-2 flex min-w-0 flex-wrap gap-2 text-xs"><span className={project.published ? 'text-accent' : 'text-muted'}>{t(project.published ? 'Published' : 'Draft')}</span><span className="min-w-0 break-words text-muted">{t('Display order')}: {number(project.sort_order)}</span></div>
      </div>
      <WorkActionsMenu project={project} busy={busy || sorting} onDelete={onDelete} />
    </article>
  </div>
}
