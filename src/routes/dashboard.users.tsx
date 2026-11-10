import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { changeUserRole, getUsers } from '../auth/actions.functions'
import { useLocale } from '../localization'
import { focusClass } from '../ui'

export const Route = createFileRoute('/dashboard/users')({
  staticData: { breadcrumb: 'Users' },
  validateSearch: (search: { page?: unknown }) => {
    const page = Number(search.page ?? 0)
    return { page: Number.isInteger(page) && page >= 0 && page <= 10000 ? page : 0 }
  },
  beforeLoad: ({ context }) => {
    if (context.dashboard.configured && context.dashboard.user?.role !== 'admin') throw redirect({ to: '/dashboard' })
  },
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ context, deps }) => context.dashboard.configured ? getUsers({ data: { page: deps.page } }) : null,
  component: UsersPage,
})

function UsersPage() {
  const result = Route.useLoaderData()
  const { dashboard } = Route.useRouteContext()
  const { t, number, intl } = useLocale()
  const router = useRouter()
  const [pendingUser, setPendingUser] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  if (!result) return null
  const date = new Intl.DateTimeFormat(intl, { dateStyle: 'medium', calendar: 'gregory', timeZone: 'UTC' })
  return <section>
    <h1 className="sr-only">{t('Users')}</h1>
    {error && <p className="mb-4 text-sm text-accent" role="alert">{t(error)}</p>}
    {status && <p className="mb-4 text-sm text-muted" role="status">{t(status)}</p>}
    <div className="overflow-x-auto border border-ink/10 bg-white">
      <table className="w-full min-w-[560px] text-start text-sm">
        <caption className="sr-only">{t('Registered users and access roles')}</caption>
        <thead className="border-b border-ink/10 bg-paper"><tr>{['Name', 'Email', 'Joined', 'Account role'].map(label => <th scope="col" className="px-4 py-4 text-start font-medium" key={label}>{t(label)}</th>)}</tr></thead>
        <tbody>{result.users.map(user => <tr className="border-b border-ink/5 last:border-0" key={user.id}>
          <td className="px-4 py-4">{user.displayName || t('Unnamed member')}{user.id === dashboard.user?.id && <span className="ms-2 text-xs text-muted">{t('(you)')}</span>}</td>
          <td className="px-4 py-4"><bdi>{user.email}</bdi></td>
          <td className="px-4 py-4 whitespace-nowrap text-muted">{date.format(new Date(user.createdAt))}</td>
          <td className="px-4 py-4"><select className={`border border-ink/20 bg-white px-2 py-2 disabled:opacity-50 ${focusClass}`} value={user.role} disabled={pendingUser !== null || user.id === dashboard.user?.id} aria-label={t('Access role for {email}', { email: user.email })} onChange={async event => {
            const role = event.target.value
            if (!window.confirm(t('Change access for {email}?', { email: user.email }))) return
            setPendingUser(user.id); setError(''); setStatus('')
            try { await changeUserRole({ data: { userId: user.id, role } }); await router.invalidate(); setStatus('Access role updated.') } catch { setError('Unable to change this role. The last administrator must be retained.') } finally { setPendingUser(null) }
          }}><option value="user">{t('Member')}</option><option value="admin">{t('Administrator')}</option></select></td>
        </tr>)}</tbody>
      </table>
      {result.users.length === 0 && <p className="p-6 text-sm text-muted">{t('No users on this page.')}</p>}
    </div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
      <div className="flex flex-wrap gap-3 text-muted">
        <span>{t('{count} registered accounts', { count: number(result.total) })}</span>
        <span>{t('Page {page}', { page: number(result.page + 1) })}</span>
      </div>
      <div className="flex gap-3">
        {result.page > 0 && <Link className={`border border-ink/15 px-3 py-2 ${focusClass}`} to="/dashboard/users" search={{ page: result.page - 1 }}>{t('Previous')}</Link>}
        {(result.page + 1) * result.pageSize < result.total && <Link className={`border border-ink/15 px-3 py-2 ${focusClass}`} to="/dashboard/users" search={{ page: result.page + 1 }}>{t('Next')}</Link>}
      </div>
    </div>
  </section>
}
