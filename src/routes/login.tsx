import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { getDashboardSession, signIn, signUp } from '../auth/actions.functions'
import { DashboardError, fieldClass, SetupNotice } from '../dashboard/components'
import { LocaleSwitcher, useLocale, localizedHead, localeFromMatches } from '../localization'
import { focusClass, primaryButtonClass } from '../ui'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({ error: search.error === 'confirmation' ? 'confirmation' : undefined }),
  beforeLoad: async () => {
    const session = await getDashboardSession()
    if (session.user) throw redirect({ to: '/dashboard' })
    return { session }
  },
  head: ({ matches }) => localizedHead(localeFromMatches(matches), 'Sign in'),
  component: LoginPage,
  errorComponent: DashboardError,
})

function LoginPage() {
  const { session } = Route.useRouteContext()
  const search = Route.useSearch()
  const { t } = useLocale()
  const [register, setRegister] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  return <main className="flex min-h-svh flex-col bg-paper">
    <header className="flex items-center justify-between gap-4 px-6 py-5"><a className={`text-sm text-muted ${focusClass}`} href={session.publicUrl}>{t('Back to website')}</a><LocaleSwitcher /></header>
    <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center px-6 py-10">
      {!session.configured ? <SetupNotice /> : <section className="border border-ink/10 bg-white p-6 md:p-8">
        <img className="mb-8 size-12" src="/icons/logo.svg" alt={t('Islam Sayed')} />
        <h1 className="mb-3 font-display text-3xl font-bold">{t(register ? 'Create your account' : 'Welcome back')}</h1>
        <p className="mb-7 text-sm leading-relaxed text-muted">{t(register ? 'Join your personal dashboard.' : 'Sign in to access your dashboard.')}</p>
        {search.error && <p className="mb-4 text-sm text-accent" role="alert">{t('The confirmation link is invalid or expired. Please try signing in or request a new confirmation email.')}</p>}
        {error && <p className="mb-4 text-sm text-accent" role="alert">{t(error)}</p>}
        {message && <p className="mb-4 border border-ink/10 bg-paper p-3 text-sm leading-relaxed" role="status">{t(message)}</p>}
        <form className="space-y-5" onSubmit={async event => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          setPending(true); setError(''); setMessage('')
          try {
            const email = String(form.get('email') ?? '')
            const password = String(form.get('password') ?? '')
            if (register) {
              const result = await signUp({ data: { email, password, displayName: String(form.get('displayName') ?? '') } })
              if (!result.signedIn) { setMessage('Check your email to confirm your account, then sign in. Open the confirmation link in this browser.'); setPending(false); return }
            } else await signIn({ data: { email, password } })
            window.location.assign('/dashboard')
          } catch { setError(register ? 'Unable to create your account. Please try again.' : 'Invalid email or password.'); setPending(false) }
        }}>
          {register && <label className="block text-sm font-medium">{t('Display name')}<input className={`${fieldClass} mt-2`} name="displayName" autoComplete="name" maxLength={120} required disabled={pending} /></label>}
          <label className="block text-sm font-medium">{t('Email')}<input className={`${fieldClass} mt-2`} name="email" type="email" dir="ltr" autoComplete="email" maxLength={254} required disabled={pending} /></label>
          <label className="block text-sm font-medium">{t('Password')}<input className={`${fieldClass} mt-2`} name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 8 : 1} maxLength={256} required disabled={pending} /></label>
          {register && <p className="text-xs text-muted">{t('Use a password with at least 8 characters.')}</p>}
          <button className={`${primaryButtonClass} w-full disabled:cursor-wait disabled:opacity-50`} type="submit" disabled={pending}>{t(pending ? 'Please wait…' : register ? 'Create account' : 'Sign in')}</button>
        </form>
        <button className={`mt-6 cursor-pointer text-sm text-accent disabled:opacity-50 ${focusClass}`} type="button" disabled={pending} onClick={() => { setRegister(!register); setError(''); setMessage('') }}>{t(register ? 'Already have an account? Sign in' : 'New here? Create an account')}</button>
      </section>}
    </div>
  </main>
}
