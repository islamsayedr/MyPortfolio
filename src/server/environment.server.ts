import { env } from 'cloudflare:workers'
import { getRequest, setResponseHeader } from '@tanstack/react-start/server'
import { getSites, isDashboardOrigin, type SiteBindings } from './hosts'

export type AppBindings = SiteBindings & {
  SUPABASE_URL?: string
  SUPABASE_PUBLISHABLE_KEY?: string
}

export function getBindings(): AppBindings {
  return env as AppBindings
}

export function dashboardRequest() {
  setResponseHeader('Cache-Control', 'private, no-store')
  setResponseHeader('Vary', 'Cookie')
  const sites = getSites(getBindings(), getRequest().url)
  if (!isDashboardOrigin(getRequest().url, sites)) throw new Error('Account requests must use the primary site origin.')
  return sites
}
