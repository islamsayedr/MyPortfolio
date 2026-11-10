import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/work')({
  beforeLoad: ({ context }) => {
    if (context.dashboard.configured && context.dashboard.user?.role !== 'admin') throw redirect({ to: '/dashboard' })
  },
  staticData: { breadcrumb: 'Work' },
  component: Outlet,
})
