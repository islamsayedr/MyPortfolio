export type SiteBindings = {
  PUBLIC_SITE_URL?: string
}

export type Sites = { publicUrl: URL; dashboardUrl: URL; local: boolean }
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]'])

function configuredOrigin(value: string): URL {
  const url = new URL(value)
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Site URLs must be origins without paths or credentials.')
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && localHosts.has(url.hostname))) throw new Error('Production site URLs must use HTTPS.')
  return url
}

export function getSites(bindings: SiteBindings, requestUrl: string): Sites {
  const request = new URL(requestUrl)
  const publicUrl = configuredOrigin(bindings.PUBLIC_SITE_URL || request.origin)
  return {
    publicUrl,
    dashboardUrl: new URL('/dashboard', publicUrl),
    local: localHosts.has(request.hostname),
  }
}

export function isDashboardPath(path: string) {
  const normalized = path.replace(/\/+$/, '').toLowerCase()
  return normalized === '/dashboard' || normalized.startsWith('/dashboard/') || normalized === '/login' || normalized === '/auth/callback'
}

export function isDashboardOrigin(requestUrl: string, sites: Sites) {
  return new URL(requestUrl).origin === sites.publicUrl.origin
}

export function hostResponse(request: Request, bindings: SiteBindings): Response | null {
  const url = new URL(request.url)
  let sites: Sites
  try { sites = getSites(bindings, request.url) } catch {
    return new Response('Invalid site configuration.', { status: 503 })
  }
  // Without an explicit canonical origin, serve public and protected routes on
  // the current host (including localhost and Workers preview deployments).
  if (!bindings.PUBLIC_SITE_URL) return null

  const publicHost = sites.publicUrl.hostname.replace(/^www\./, '')
  const allowedOrigins = new Set([
    sites.publicUrl.origin,
    `${sites.publicUrl.protocol}//${publicHost}${sites.publicUrl.port ? ':' + sites.publicUrl.port : ''}`,
  ])
  if (!sites.local) allowedOrigins.add(`${sites.publicUrl.protocol}//www.${publicHost}${sites.publicUrl.port ? ':' + sites.publicUrl.port : ''}`)
  const headers = { 'Cache-Control': 'private, no-store' }
  if (!allowedOrigins.has(url.origin)) return new Response('Unknown host.', { status: 421, headers })

  // Keep authentication on the canonical main origin so host-only cookies and
  // PKCE verification are consistent whether visitors arrive via apex or www.
  if (isDashboardPath(url.pathname) && !isDashboardOrigin(request.url, sites)) {
    return new Response(null, { status: 302, headers: { ...headers, Location: new URL(url.pathname + url.search, sites.publicUrl).href } })
  }
  return null
}
