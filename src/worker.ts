import startServer from '@tanstack/react-start/server-entry'

// Serve TanStack Start's SSR handler in the Cloudflare Workers runtime.
// The Cloudflare Vite plugin bundles this entry and the public/client assets.
export default {
  fetch: startServer.fetch,
}
