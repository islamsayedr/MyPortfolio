import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components'
import { animatedHeadingClass, primaryButtonClass } from '../ui'

export const Route = createFileRoute('/for-designers')({ component: DesignersPage, head: () => ({ meta: [{ title: 'For Designers | Islam Sayed' }] }) })

function DesignersPage() {
  return <Page>
    <main className="flex min-h-svh flex-col items-center justify-center px-6 pt-[130px] pb-8 text-center">
      <p className="my-3 text-xs tracking-[1px] text-accent uppercase">A new resource is in progress</p>
      <h1 className={`${animatedHeadingClass} m-0 text-[50px] leading-[1.15] md:text-[72px]`}>Coming soon<span className="text-accent">.</span></h1>
      <p className="mt-[18px] mb-7 text-muted">I am preparing practical resources and notes for designers. Check back soon.</p>
      <a className={primaryButtonClass} href="mailto:Islamsayedr@gmail.com">Get notified</a>
    </main>
  </Page>
}
