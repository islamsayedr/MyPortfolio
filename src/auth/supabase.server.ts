import { createServerClient } from '@supabase/ssr'
import { getCookies, getRequest, setCookie, setResponseHeader } from '@tanstack/react-start/server'
import { getBindings } from '../server/environment.server'
import type { Database } from './database'

export function isSupabaseConfigured() {
  const bindings = getBindings()
  return Boolean(bindings.SUPABASE_URL && bindings.SUPABASE_PUBLISHABLE_KEY)
}

export function supabaseForRequest() {
  const { SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key } = getBindings()
  if (!url || !key) throw new Error('Authentication is not configured.')
  const secure = new URL(getRequest().url).protocol === 'https:'
  setResponseHeader('Cache-Control', 'private, no-store')
  return createServerClient<Database>(url, key, {
    cookieOptions: { path: '/', sameSite: 'lax', secure, httpOnly: true },
    cookies: {
      getAll: () => Object.entries(getCookies()).map(([name, value]) => ({ name, value })),
      setAll: (cookies, headers) => {
        cookies.forEach(({ name, value, options }) => {
          // Sessions are host-only on the main site; never set a wildcard domain.
          setCookie(name, value, { ...options, domain: undefined, path: '/', sameSite: 'lax', httpOnly: true, secure })
        })
        Object.entries(headers ?? {}).forEach(([name, value]) => setResponseHeader(name, value))
        setResponseHeader('Cache-Control', 'private, no-store')
      },
    },
  })
}
