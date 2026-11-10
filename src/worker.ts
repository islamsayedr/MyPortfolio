import startServer from '@tanstack/react-start/server-entry'
import { env } from 'cloudflare:workers'
import { hostResponse, isDashboardPath } from './server/hosts'

// Serve TanStack Start's SSR handler in the Cloudflare Workers runtime.
// The Cloudflare Vite plugin bundles this entry and the public/client assets.
export default {
  async fetch(...args: Parameters<typeof startServer.fetch>) {
    const routing = hostResponse(args[0], env)
    if (routing) return routing
    const response = await startServer.fetch(...args)
    if (!isDashboardPath(new URL(args[0].url).pathname)) return response
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'private, no-store')
    headers.set('X-Robots-Tag', 'noindex, nofollow')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('Content-Security-Policy', "frame-ancestors 'none'; base-uri 'self'")
    headers.set('Referrer-Policy', 'no-referrer')
    headers.set('X-Content-Type-Options', 'nosniff')
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
  }
}
