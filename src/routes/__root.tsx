import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { LocalizationProvider } from '../localization'
import { localeInfo, translate } from '../localization/locale'
import { getLocalization } from '../localization/request.functions'
import '../styles.css'

export const Route = createRootRoute({
  loader: () => getLocalization(),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en-US'
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: translate(locale, 'The portfolio of Islam Sayed, a product designer based in Egypt.') },
        { property: 'og:title', content: `${translate(locale, 'Islam Sayed')} | ${translate(locale, 'Product Designer')}` },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: localeInfo(locale).intl.replace('-', '_') },
      ],
      links: [{ rel: 'icon', href: '/icons/favicon.svg' }],
    }
  },
  shellComponent: RootDocument,
})

function RootDocument() {
  const state = Route.useLoaderData()
  const info = localeInfo(state.locale)
  return <LocalizationProvider state={state}>
    <html lang={info.intl} dir={info.direction} className="scroll-smooth motion-reduce:scroll-auto">
      <head><HeadContent /></head>
      <body className="m-0 bg-paper font-sans text-base leading-normal text-ink rtl:font-arabic rtl:[&_:is(h1,h2,h3,blockquote,strong)]:font-arabic rtl:[&_:is(h1,h2,h3)]:tracking-normal"><Outlet /><Scripts /></body>
    </html>
  </LocalizationProvider>
}
