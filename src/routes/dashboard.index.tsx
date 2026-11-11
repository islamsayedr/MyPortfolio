import { createFileRoute, Link } from '@tanstack/react-router'
import { getUserCount } from '../auth/actions.functions'
import { useLocale } from '../localization'
import { focusClass } from '../ui'

export const Route = createFileRoute('/dashboard/')({
  staticData: { breadcrumb: 'Overview' },
  loader: ({ context }) => context.dashboard.configured && context.dashboard.user?.role === 'admin' ? getUserCount() : null,
  component: OverviewPage,
})

function OverviewPage() {
  const { dashboard } = Route.useRouteContext()
  const count = Route.useLoaderData()
  const { t, number } = useLocale()
  if (!dashboard.user) return null
  return <section>
    <h1 className="sr-only">{t('Overview')}</h1>
    {dashboard.user.role === 'admin' && <Link to="/dashboard/users" search={{ page: 0 }} className={`block max-w-md border border-ink/10 bg-white p-6 hover:border-accent/40 ${focusClass}`}>
      <h2 className="mb-3 font-display text-2xl font-bold">{t('Users')}</h2>
      {count !== null
        ? <p className="mb-3 text-3xl font-medium text-accent" aria-label={t('{count} registered accounts', { count: number(count) })}>{number(count)}</p>
        : <p className="mb-3 text-sm text-muted" role="status">{t('Unable to load user count.')}</p>}
      <p className="text-sm text-muted">{t('Manage member and administrator access.')}</p>
    </Link>}
  </section>
}
