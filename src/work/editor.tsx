import { useId, useRef, useState, type FormEvent } from 'react'
import { PRESENTATION_MAX_LENGTH, type WorkFields, type WorkRow } from './types'
import { Presentation } from './presentation'
import { CoverFields } from './cover-fields'
import { workInput } from './validation'
import { fieldClass } from '../dashboard/components'
import { useLocale } from '../localization'
import { focusClass, primaryButtonClass } from '../ui'

const empty: WorkFields = { title: '', description: '', presentation: '', image_url: '', image_alt: '', tags: [], published: false, sort_order: 0 }
const tabs = [{ id: 'info', label: 'Project info' }, { id: 'presentation', label: 'Presentation' }] as const
type EditorTab = typeof tabs[number]['id']

export function WorkEditor({ initial, busy, onSave }: { initial: WorkRow | null; busy: boolean; onSave: (value: unknown) => Promise<void> }) {
  const { t, direction } = useLocale()
  const tabbed = initial !== null
  const tabId = useId()
  const tabRefs = useRef<Record<EditorTab, HTMLButtonElement | null>>({ info: null, presentation: null })
  const [activeTab, setActiveTab] = useState<EditorTab>('info')
  const [fields, setFields] = useState<WorkFields>(initial ? {
    title: initial.title, description: initial.description, presentation: initial.presentation ?? '',
    image_url: initial.image_url, image_alt: initial.image_alt, tags: initial.tags,
    published: initial.published, sort_order: initial.sort_order,
  } : { ...empty })
  const [showPresentationPreview, setShowPresentationPreview] = useState(false)
  const [categories, setCategories] = useState(initial?.tags.join(', ') ?? '')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const blocked = busy || uploading
  const update = <K extends keyof WorkFields>(key: K, value: WorkFields[K]) => setFields(current => ({ ...current, [key]: value }))
  const coverFields = <CoverFields url={fields.image_url} description={fields.image_alt} disabled={blocked} uploading={uploading} onUrlChange={value => update('image_url', value)} onDescriptionChange={value => update('image_alt', value)} onUploadingChange={setUploading} />
  const revealField = (field: HTMLElement) => {
    const panel = field.closest<HTMLElement>('[data-editor-panel]')?.dataset.editorPanel
    if (tabbed && (panel === 'info' || panel === 'presentation')) setActiveTab(panel)
    requestAnimationFrame(() => field.focus())
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    if (blocked) return
    // Browser validation cannot focus an invalid control in a hidden tab.
    // Reveal the first invalid field before reporting the native error.
    const invalid = event.currentTarget.querySelector<HTMLInputElement | HTMLTextAreaElement>('input:invalid, textarea:invalid')
    if (invalid) {
      revealField(invalid)
      requestAnimationFrame(() => invalid.reportValidity())
      return
    }
    const value = { ...fields, tags: categories.split(',').map(tag => tag.trim()).filter(Boolean), ...(initial ? { id: initial.id, updated_at: initial.updated_at } : {}) }
    try { workInput(value) } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to save this project.'
      if (tabbed) setActiveTab(message.startsWith('Invalid presentation.') ? 'presentation' : 'info')
      setError(message)
      return
    }
    try { await onSave(value) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save this project.') }
  }
  return <form className={initial ? 'scroll-mt-8' : 'scroll-mt-8 border border-ink/10 bg-white p-5 md:p-6'} id="work-editor" aria-label={t(initial ? 'Edit project' : 'New project')} onSubmit={submit} noValidate>
    {error && <p className="mb-4 text-sm text-accent" role="alert">{t(error)}</p>}
    <fieldset disabled={blocked} className="min-w-0 space-y-5 disabled:opacity-60">
      {tabbed && coverFields}
      {tabbed && <div role="tablist" aria-label={t('Project editor')} aria-orientation="horizontal" className="grid grid-cols-2 border-b border-ink/10">
        {tabs.map((tab, index) => <button key={tab.id} ref={element => { tabRefs.current[tab.id] = element }} type="button" role="tab" id={`${tabId}-${tab.id}-tab`} aria-controls={`${tabId}-${tab.id}-panel`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} className={`min-h-10 min-w-0 cursor-pointer border-b-2 px-3 py-2 text-sm ${activeTab === tab.id ? 'border-accent font-medium text-accent' : 'border-transparent text-muted hover:bg-paper hover:text-ink'} ${focusClass}`} onClick={() => setActiveTab(tab.id)} onKeyDown={event => {
          let next: number
          if (event.key === 'Home') next = 0
          else if (event.key === 'End') next = tabs.length - 1
          else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const forward = (event.key === 'ArrowRight') === (direction === 'ltr')
            next = (index + (forward ? 1 : -1) + tabs.length) % tabs.length
          } else return
          event.preventDefault(); setActiveTab(tabs[next].id); tabRefs.current[tabs[next].id]?.focus()
        }}>{t(tab.label)}</button>)}
      </div>}
      <div role={tabbed ? 'tabpanel' : undefined} id={`${tabId}-info-panel`} aria-labelledby={tabbed ? `${tabId}-info-tab` : undefined} data-editor-panel="info" hidden={tabbed && activeTab !== 'info'} className="space-y-5">
        <label className="block text-sm" htmlFor="work-title"><span className="mb-2 block">{t('Project title')}</span><input id="work-title" className={fieldClass} value={fields.title} onChange={event => update('title', event.target.value)} maxLength={120} required /></label>
        {!tabbed && coverFields}
        <label className="block text-sm" htmlFor="work-description"><span className="mb-2 block">{t('Project description')}</span><textarea id="work-description" className={`${fieldClass} min-h-32`} value={fields.description} onChange={event => update('description', event.target.value)} maxLength={10000} rows={5} /></label>
        <label className="block text-sm" htmlFor="work-categories"><span className="mb-2 block">{t('Categories (comma separated)')}</span><input id="work-categories" className={fieldClass} value={categories} onChange={event => setCategories(event.target.value)} maxLength={1240} /></label>
      </div>
      <div role={tabbed ? 'tabpanel' : undefined} id={`${tabId}-presentation-panel`} aria-labelledby={tabbed ? `${tabId}-presentation-tab` : undefined} data-editor-panel="presentation" hidden={tabbed && activeTab !== 'presentation'} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm" htmlFor="work-presentation">{t('Presentation (Markdown)')}</label>
          <button type="button" className={`border border-ink/20 px-3 py-2 text-xs text-muted hover:bg-paper ${focusClass}`} aria-expanded={showPresentationPreview} aria-controls="work-presentation-preview" onClick={() => setShowPresentationPreview(value => !value)}>{t(showPresentationPreview ? 'Hide preview' : 'Show preview')}</button>
        </div>
        <textarea id="work-presentation" className={`${fieldClass} min-h-64 font-mono`} value={fields.presentation} onChange={event => update('presentation', event.target.value)} maxLength={PRESENTATION_MAX_LENGTH} rows={14} dir="auto" aria-describedby="work-presentation-help" spellCheck={false} />
        <p className="text-xs leading-relaxed text-muted" id="work-presentation-help">{t('Supports Markdown headings, lists, links, images, tables, and code blocks. Raw HTML is displayed as text.')}</p>
        {showPresentationPreview && <div id="work-presentation-preview" role="region" aria-label={t('Presentation preview')} className="min-w-0 border border-ink/10 bg-paper p-4 md:p-6">
          {fields.presentation.trim() ? <Presentation content={fields.presentation} /> : <p className="text-sm text-muted">{t('Nothing to preview yet.')}</p>}
        </div>}
      </div>
      <button type="submit" className={`${primaryButtonClass} disabled:cursor-wait disabled:opacity-50`} aria-busy={blocked}>{t(busy ? 'Saving…' : 'Save project')}</button>
    </fieldset>
  </form>
}
