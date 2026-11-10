import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { getAdminProject } from '../work/actions.functions'
import { workId } from '../work/validation'
import { WorkProjectError, WorkProjectNotFound } from '../work/admin-notices'

export const Route = createFileRoute('/dashboard/work/$projectid')({
  staticData: { breadcrumb: 'Project', breadcrumbProject: true },
  loader: async ({ context, params }) => {
    try { workId(params.projectid) } catch { throw notFound() }
    if (!context.dashboard.configured) return null
    const project = await getAdminProject({ data: params.projectid })
    if (!project) throw notFound()
    return project
  },
  component: Outlet,
  notFoundComponent: WorkProjectNotFound,
  errorComponent: WorkProjectError,
})
