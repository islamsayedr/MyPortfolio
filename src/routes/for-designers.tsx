import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components'
import { useLocale, localizedHead, localeFromMatches } from '../localization'
import { animatedHeadingClass, primaryButtonClass } from '../ui'

export const Route = createFileRoute('/for-designers')({ component: DesignersPage, head: ({ matches }) => localizedHead(localeFromMatches(matches), 'For designers') })

function DesignersPage() {
  const { t } = useLocale()
  return <Page>
    <main className="flex min-h-svh flex-col items-center justify-center px-6 pt-[130px] pb-8 text-center">
      <p className="my-3 text-xs tracking-[1px] text-accent uppercase">{t('A new resource is in progress')}</p>
      <h1 className={`${animatedHeadingClass} m-0 text-[50px] leading-[1.15] md:text-[72px]`}>{t('Coming soon')}<span className="text-accent">.</span></h1>
      <p className="mt-[18px] mb-7 text-muted">{t('I am preparing practical resources and notes for designers. Check back soon.')}</p>
      <a className={primaryButtonClass} href="mailto:Islamsayedr@gmail.com">{t('Get notified')}</a>
    </main>
  </Page>
}
