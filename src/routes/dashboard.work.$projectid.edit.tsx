import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { WorkEditorPage } from '../work/editor-page'

const projectRoute = getRouteApi('/dashboard/work/$projectid')

export const Route = createFileRoute('/dashboard/work/$projectid/edit')({
  staticData: { breadcrumb: 'Edit project' },
  component: EditProjectPage,
})

function EditProjectPage() {
  const project = projectRoute.useLoaderData()
  return project ? <WorkEditorPage key={project.id + project.updated_at} initial={project} /> : null
}
