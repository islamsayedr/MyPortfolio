import { createFileRoute } from '@tanstack/react-router'
import { Page } from '../components'

export const Route = createFileRoute('/for-designers')({ component: DesignersPage, head: () => ({ meta: [{ title: 'For Designers | Islam Sayed' }] }) })
function DesignersPage() { return <Page><main className="coming-page"><p className="eyebrow">A new resource is in progress</p><h1>Coming soon<span>.</span></h1><p>I am preparing practical resources and notes for designers. Check back soon.</p><a className="button primary" href="mailto:Islamsayedr@gmail.com">Get notified</a></main></Page> }
