import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { dashboardRequest } = await import('../server/environment.server')
        const { supabaseForRequest } = await import('../auth/supabase.server')
        const sites = dashboardRequest()
        const code = new URL(request.url).searchParams.get('code')
        let success = false
        if (code) {
          try {
            const { error } = await supabaseForRequest().auth.exchangeCodeForSession(code)
            success = !error
          } catch { /* Do not log callback codes or authentication tokens. */ }
        }
        return new Response(null, {
          status: 302,
          headers: {
            Location: new URL(success ? '/dashboard' : '/login?error=confirmation', sites.dashboardUrl).href,
            'Cache-Control': 'private, no-store',
            'Referrer-Policy': 'no-referrer',
          },
        })
      },
    },
  },
})
