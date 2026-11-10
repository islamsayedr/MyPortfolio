import { createServerFn } from '@tanstack/react-start'

// Public-header state contains only a verified boolean and a safe destination;
// profiles and admin roles are never queried or exposed here.
export const getHeaderAccount = createServerFn({ method: 'GET' })
  .validator((data: { checkSession: boolean }) => {
    if (!data || typeof data.checkSession !== 'boolean') throw new Error('Invalid request.')
    return { checkSession: data.checkSession }
  })
  .handler(async ({ data }) => {
    const { getRequest, setResponseHeader } = await import('@tanstack/react-start/server')
    const { getBindings } = await import('../server/environment.server')
    const { getSites, isDashboardOrigin } = await import('../server/hosts')
    const { isSupabaseConfigured, supabaseForRequest } = await import('./supabase.server')
    setResponseHeader('Cache-Control', 'private, no-store')
    const sites = getSites(getBindings(), getRequest().url)
    let signedIn = false
    // Dashboard/login loaders verify their own sessions. Avoid concurrent
    // refreshes for pages which do not render the public header.
    if (data.checkSession && isDashboardOrigin(getRequest().url, sites) && isSupabaseConfigured()) {
      try {
        const { data: identity, error } = await supabaseForRequest().auth.getUser()
        signedIn = !error && Boolean(identity.user)
      } catch {
        // A backend outage must not make the public portfolio unavailable.
      }
    }
    return { signedIn, href: new URL(signedIn ? '/dashboard' : '/login', sites.publicUrl).href }
  })
