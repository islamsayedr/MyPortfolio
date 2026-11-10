import { createServerFn } from '@tanstack/react-start'
import { workId, workIdentity, workInput, workPage } from './validation'

export const getAdminWork = createServerFn({ method: 'GET' }).validator(workPage).handler(async ({ data }) => {
  const { requireAdmin } = await import('../auth/session.server')
  const { client } = await requireAdmin()
  const pageSize = 20
  const { data: projects, count, error } = await client.from('work_projects').select('*', { count: 'exact' })
    .order('sort_order').order('created_at').order('id').range(data.page * pageSize, (data.page + 1) * pageSize - 1)
  if (error) return { projects: [], total: 0, page: data.page, pageSize, setupRequired: error.code === 'PGRST205' || error.code === '42P01', failed: true }
  return { projects: projects ?? [], total: count ?? 0, page: data.page, pageSize, setupRequired: false, failed: false }
})

export const getAdminProject = createServerFn({ method: 'GET' }).validator(workId).handler(async ({ data }) => {
  const { requireAdmin } = await import('../auth/session.server')
  const { client } = await requireAdmin()
  const { data: project, error } = await client.from('work_projects').select('*').eq('id', data).maybeSingle()
  if (error) throw new Error('Unable to load projects. Please try again.')
  return project
})

export const getWorkSetup = createServerFn({ method: 'GET' }).handler(async () => {
  const { requireAdmin } = await import('../auth/session.server')
  const { client } = await requireAdmin()
  const { error } = await client.from('work_projects').select('id').limit(1)
  return { failed: Boolean(error), setupRequired: error?.code === 'PGRST205' || error?.code === '42P01' }
})

export const saveWork = createServerFn({ method: 'POST' }).validator(workInput).handler(async ({ data }) => {
  const { requireAdmin } = await import('../auth/session.server')
  const { client } = await requireAdmin()
  const query = data.identity
    ? client.from('work_projects').update(data.fields).eq('id', data.identity.id).eq('updated_at', data.identity.updated_at)
    : client.from('work_projects').insert(data.fields)
  const { data: project, error } = await query.select('*').maybeSingle()
  if (error?.code === '23505') throw new Error('A project with this slug already exists.')
  if (error) throw new Error('Unable to save this project.')
  if (!project) throw new Error('This project changed or was deleted. Reload before editing.')
  return project
})

export const deleteWork = createServerFn({ method: 'POST' }).validator(workIdentity).handler(async ({ data }) => {
  const { requireAdmin } = await import('../auth/session.server')
  const { client } = await requireAdmin()
  const { data: project, error } = await client.from('work_projects').delete().eq('id', data.id).eq('updated_at', data.updated_at).select('id').maybeSingle()
  if (error) throw new Error('Unable to delete this project.')
  if (!project) throw new Error('This project changed or was deleted. Reload before editing.')
  return { success: true }
})
