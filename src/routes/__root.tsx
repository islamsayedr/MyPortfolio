import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { Outlet } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: 'The portfolio of Islam Sayed, a product designer based in Egypt.' },
      { property: 'og:title', content: 'Islam Sayed | Product Designer' },
      { property: 'og:type', content: 'website' },
    ],
    links: [{ rel: 'icon', href: '/icons/favicon.svg' }],
  }),
  shellComponent: RootDocument,
})

function RootDocument() {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body><Outlet /><Scripts /></body>
    </html>
  )
}
