import { createServerFn } from '@tanstack/react-start'
import { workSlug } from './validation'

export const getPublishedWork = createServerFn({ method: 'GET' }).handler(async () => {
  const { readPublishedWork } = await import('./public.server')
  return readPublishedWork()
})
export const getPublishedProject = createServerFn({ method: 'GET' }).validator(workSlug).handler(async ({ data }) => {
  const { readPublishedWork } = await import('./public.server')
  const result = await readPublishedWork(data)
  return { project: result.projects[0] ?? null, unavailable: result.unavailable }
})
