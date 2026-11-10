import { createFileRoute, Link } from '@tanstack/react-router'
import { useLocale } from '../localization'
import { focusClass } from '../ui'

export const Route = createFileRoute('/dashboard/')({
  staticData: { breadcrumb: 'Overview' }, component: OverviewPage })

function OverviewPage() {
  const { dashboard } = Route.useRouteContext()
  const { t, intl } = useLocale()
  const user = dashboard.user
  if (!user) return null
  return <section>
    <h1 className="sr-only">{t('Overview')}</h1>
    <dl className="mb-8 grid gap-4 sm:grid-cols-2">
      <div className="border border-ink/10 bg-white p-6"><dt className="text-xs text-muted">{t('Account role')}</dt><dd className="mt-2 text-lg font-medium">{t(user.role === 'admin' ? 'Administrator' : 'Member')}</dd></div>
      <div className="border border-ink/10 bg-white p-6"><dt className="text-xs text-muted">{t('Member since')}</dt><dd className="mt-2 text-lg font-medium">{new Intl.DateTimeFormat(intl, { dateStyle: 'medium', calendar: 'gregory', timeZone: 'UTC' }).format(new Date(user.createdAt))}</dd></div>
    </dl>
    <div className="grid gap-4 sm:grid-cols-2">
      <Link to="/dashboard/account" className={`block border border-ink/10 bg-white p-6 hover:border-accent/40 ${focusClass}`}><h2 className="mb-2 font-display text-2xl font-bold">{t('My account')}</h2><p className="text-sm text-muted">{t('View your account details and update your name.')}</p></Link>
      {user.role === 'admin' && <Link to="/dashboard/users" search={{ page: 0 }} className={`block border border-ink/10 bg-white p-6 hover:border-accent/40 ${focusClass}`}><h2 className="mb-2 font-display text-2xl font-bold">{t('Users')}</h2><p className="text-sm text-muted">{t('Manage member and administrator access.')}</p></Link>}
    </div>
  </section>
}
