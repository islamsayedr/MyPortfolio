import { createFileRoute } from '@tanstack/react-router'
import { getWorkSetup } from '../work/actions.functions'
import { WorkEditorPage } from '../work/editor-page'
import { WorkSetupNotice } from '../work/admin-notices'

export const Route = createFileRoute('/dashboard/work/new')({
  staticData: { breadcrumb: 'New project' },
  loader: ({ context }) => context.dashboard.configured ? getWorkSetup() : null,
  component: NewProjectPage,
})

function NewProjectPage() {
  const setup = Route.useLoaderData()
  if (!setup) return null
  return setup.failed ? <WorkSetupNotice setupRequired={setup.setupRequired} /> : <WorkEditorPage initial={null} />
}
