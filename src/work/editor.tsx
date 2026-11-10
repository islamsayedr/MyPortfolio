import { useState, type FormEvent } from 'react'
import type { WorkFields, WorkRow } from './types'
import { workInput } from './validation'
import { fieldClass } from '../dashboard/components'
import { useLocale } from '../localization'
import { focusClass, primaryButtonClass } from '../ui'

const empty: WorkFields = { slug: '', title: '', description: '', image_url: '', image_alt: '', tags: [], published: false, sort_order: 0 }

export function WorkEditor({ initial, busy, onSave }: { initial: WorkRow | null; busy: boolean; onSave: (value: unknown) => Promise<void> }) {
  const { t } = useLocale()
  const [fields, setFields] = useState<WorkFields>(initial ?? { ...empty })
  const [categories, setCategories] = useState(initial?.tags.join(', ') ?? '')
  const [error, setError] = useState('')
  const update = <K extends keyof WorkFields>(key: K, value: WorkFields[K]) => setFields(current => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    const value = { ...fields, tags: categories.split(',').map(tag => tag.trim()).filter(Boolean), ...(initial ? { id: initial.id, updated_at: initial.updated_at } : {}) }
    try { workInput(value); await onSave(value) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save this project.') }
  }
  return <form className="scroll-mt-8 border border-ink/10 bg-white p-5 md:p-6" id="work-editor" aria-label={t(initial ? 'Edit project' : 'New project')} onSubmit={submit}>
    {error && <p className="mb-4 text-sm text-accent" role="alert">{t(error)}</p>}
    <fieldset disabled={busy} className="min-w-0 space-y-5 disabled:opacity-60">
      <div className="grid gap-5 lg:grid-cols-2">
        {([['title', 'Project title', 120], ['slug', 'URL slug', 100], ['image_url', 'Cover image URL or path', 2048], ['image_alt', 'Image description', 240]] as const).map(([key, label, max]) => <label className="block min-w-0 text-sm" htmlFor={`work-${key}`} key={key}>
          <span className="mb-2 block">{t(label)}</span>
          <input className={fieldClass} id={`work-${key}`} value={fields[key]} onChange={event => update(key, event.target.value)} maxLength={max} required dir={key === 'slug' || key === 'image_url' ? 'ltr' : undefined} pattern={key === 'slug' ? '[a-z0-9]+(-[a-z0-9]+)*' : undefined} />
        </label>)}
      </div>
      <p className="text-xs text-muted">{t('Use an existing /imgs/ path or an HTTPS image URL. File uploads are not included.')}</p>
      <label className="block text-sm" htmlFor="work-description"><span className="mb-2 block">{t('Project description')}</span><textarea id="work-description" className={`${fieldClass} min-h-32`} value={fields.description} onChange={event => update('description', event.target.value)} maxLength={10000} rows={5} /></label>
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block text-sm" htmlFor="work-categories"><span className="mb-2 block">{t('Categories (comma separated)')}</span><input id="work-categories" className={fieldClass} value={categories} onChange={event => setCategories(event.target.value)} maxLength={1240} /></label>
        <label className="block text-sm" htmlFor="work-order"><span className="mb-2 block">{t('Display order')}</span><input id="work-order" className={fieldClass} type="number" min={0} max={100000} step={1} required value={Number.isFinite(fields.sort_order) ? fields.sort_order : ''} onChange={event => update('sort_order', event.target.value === '' ? NaN : Number(event.target.value))} /></label>
      </div>
      <p className="text-xs text-muted">{t('Lower display-order values appear first. Changing a slug changes the public project URL.')}</p>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" className={`size-4 accent-accent ${focusClass}`} checked={fields.published} onChange={event => update('published', event.target.checked)} />{t('Published — visible on the public website')}</label>
      <button type="submit" className={`${primaryButtonClass} disabled:cursor-wait disabled:opacity-50`} aria-busy={busy}>{t(busy ? 'Saving…' : 'Save project')}</button>
    </fieldset>
  </form>
}
