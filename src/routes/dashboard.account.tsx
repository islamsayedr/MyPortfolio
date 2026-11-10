import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { updateProfile } from '../auth/actions.functions'
import { fieldClass } from '../dashboard/components'
import { useLocale } from '../localization'
import { primaryButtonClass } from '../ui'

export const Route = createFileRoute('/dashboard/account')({
  staticData: { breadcrumb: 'My account' }, component: AccountPage })

function AccountPage() {
  const { dashboard } = Route.useRouteContext()
  const { t } = useLocale()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const user = dashboard.user
  if (!user) return null
  return <section>
    <h1 className="sr-only">{t('My account')}</h1>
    <form className="max-w-xl space-y-6 border border-ink/10 bg-white p-6 md:p-8" onSubmit={async event => {
      event.preventDefault()
      const displayName = String(new FormData(event.currentTarget).get('displayName') ?? '')
      setPending(true); setStatus(''); setError('')
      try { await updateProfile({ data: { displayName } }); await router.invalidate(); setStatus('Profile saved.') } catch { setError('Unable to save your profile.') } finally { setPending(false) }
    }}>
      <label className="block text-sm font-medium">{t('Display name')}<input key={user.displayName} className={`${fieldClass} mt-2`} name="displayName" autoComplete="name" defaultValue={user.displayName} maxLength={120} required disabled={pending} /></label>
      <div><p className="mb-2 text-sm font-medium">{t('Email')}</p><p className="break-all text-sm text-muted" dir="ltr">{user.email}</p></div>
      <div><p className="mb-2 text-sm font-medium">{t('Account role')}</p><p className="text-sm text-muted">{t(user.role === 'admin' ? 'Administrator' : 'Member')}</p></div>
      {error && <p className="text-sm text-accent" role="alert">{t(error)}</p>}
      {status && <p className="text-sm text-muted" role="status">{t(status)}</p>}
      <button className={`${primaryButtonClass} disabled:opacity-50`} type="submit" disabled={pending}>{t(pending ? 'Saving…' : 'Save changes')}</button>
    </form>
  </section>
}
