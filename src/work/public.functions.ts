import { createServerFn } from '@tanstack/react-start'
import { legacyProjectKey, workId } from './validation'

export const getPublishedWork = createServerFn({ method: 'GET' }).handler(async () => {
  const { readPublishedWork } = await import('./public.server')
  return readPublishedWork()
})
export const getPublishedProject = createServerFn({ method: 'GET' }).validator(workId).handler(async ({ data }) => {
  const { readPublishedWork } = await import('./public.server')
  const result = await readPublishedWork(data)
  return { project: result.projects[0] ?? null, unavailable: result.unavailable }
})

export const getLegacyProjectId = createServerFn({ method: 'GET' }).validator(legacyProjectKey).handler(async ({ data }) => {
  const { readLegacyProjectId } = await import('./public.server')
  return readLegacyProjectId(data)
})
