import { useRef, useState } from 'react'
import { fieldClass } from '../dashboard/components'
import { useLocale } from '../localization'
import { focusClass } from '../ui'
import { COVER_ACCEPT, validateCoverFile } from './cover-file'
import { uploadWorkCover } from './cover.functions'

function previewable(value: string): boolean {
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return true
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password } catch { return false }
}

export function CoverFields({ url, description, disabled, uploading, onUrlChange, onDescriptionChange, onUploadingChange }: {
  url: string; description: string; disabled: boolean; uploading: boolean
  onUrlChange: (value: string) => void; onDescriptionChange: (value: string) => void; onUploadingChange: (value: boolean) => void
}) {
  const { t } = useLocale()
  const picker = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [failedPreview, setFailedPreview] = useState<string | null>(null)
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={`border border-ink/20 bg-white px-3 py-2 text-sm text-muted hover:bg-paper disabled:cursor-wait disabled:opacity-50 ${focusClass}`} disabled={disabled} aria-busy={uploading} onClick={() => picker.current?.click()}>{t(uploading ? 'Uploading…' : 'Upload cover image')}</button>
      <input ref={picker} type="file" accept={COVER_ACCEPT} className="sr-only" tabIndex={-1} aria-label={t('Choose cover file')} disabled={disabled} onChange={async event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file || disabled) return
        setError(''); setStatus(''); onUploadingChange(true)
        try {
          await validateCoverFile(file)
          const data = new FormData(); data.set('file', file)
          const result = await uploadWorkCover({ data })
          onUrlChange(result.url); setFailedPreview(null)
          setStatus('Cover uploaded. Save the project to apply it.')
        } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to upload the cover. Check the Storage migration and try again.') }
        finally { onUploadingChange(false) }
      }} />
      <p className="text-xs text-muted">{t('JPEG, PNG, or WebP. Maximum 5 MB.')}</p>
    </div>
    <p className="text-xs text-muted">{t('Uploaded covers are public, even for draft projects.')}</p>
    {error && <p className="text-sm text-accent" role="alert">{t(error)}</p>}
    {status && <p className="text-sm text-muted" role="status">{t(status)}</p>}
    <div className="grid gap-5 lg:grid-cols-2">
      <label className="block min-w-0 text-sm" htmlFor="work-image_url"><span className="mb-2 block">{t('Cover image URL or path')}</span><input id="work-image_url" className={fieldClass} value={url} onChange={event => { onUrlChange(event.target.value); setError(''); setStatus('') }} maxLength={2048} required dir="ltr" /></label>
      <label className="block min-w-0 text-sm" htmlFor="work-image_alt"><span className="mb-2 block">{t('Image description')}</span><input id="work-image_alt" className={fieldClass} value={description} onChange={event => onDescriptionChange(event.target.value)} maxLength={240} required /></label>
    </div>
    <p className="text-xs text-muted">{t('Upload an image, or use an existing /imgs/ path or HTTPS image URL.')}</p>
    {previewable(url) && (failedPreview === url ? <p className="text-xs text-muted">{t('Cover preview is unavailable.')}</p> : <img className="max-h-56 w-full border border-ink/10 bg-white object-contain" src={url} alt={description || t('Cover preview')} onError={() => setFailedPreview(url)} />)}
  </div>
}
