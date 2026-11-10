import { useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { saveWork } from './actions.functions'
import { WorkEditor } from './editor'
import type { WorkRow } from './types'
import { useLocale } from '../localization'

export function WorkEditorPage({ initial }: { initial: WorkRow | null }) {
  const { t } = useLocale()
  const navigate = useNavigate()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return <section>
    <h1 className="sr-only">{t(initial ? 'Edit project' : 'New project')}</h1>
    <WorkEditor initial={initial} busy={busy} onSave={async value => {
      setBusy(true)
      try {
        const project = await saveWork({ data: value })
        await router.invalidate()
        await navigate({ to: '/dashboard/work/$projectid', params: { projectid: project.id } })
      } finally { setBusy(false) }
    }} />
  </section>
}
