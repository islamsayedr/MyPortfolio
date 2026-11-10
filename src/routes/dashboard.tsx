import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getDashboardSession } from '../auth/actions.functions'
import { DashboardError, DashboardShell } from '../dashboard/components'
import { localizedHead, localeFromMatches } from '../localization'

export const Route = createFileRoute('/dashboard')({
  staticData: { breadcrumb: 'Dashboard' },
  beforeLoad: async () => {
    const dashboard = await getDashboardSession()
    if (dashboard.configured && !dashboard.user) throw redirect({ to: '/login', search: { error: undefined } })
    return { dashboard }
  },
  head: ({ matches }) => localizedHead(localeFromMatches(matches), 'Dashboard'),
  component: DashboardLayout,
  errorComponent: DashboardError,
})

function DashboardLayout() {
  const { dashboard } = Route.useRouteContext()
  return <DashboardShell session={dashboard}><Outlet /></DashboardShell>
}
