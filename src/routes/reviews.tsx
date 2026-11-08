import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftLinear } from 'solar-icon-set'
import { Page } from '../components'
import { testimonials, ReviewCard } from '../reviews'
import { backLinkClass, innerPageClass, pageDescriptionClass, pageHeadingClass } from '../ui'

export const Route = createFileRoute('/reviews')({
  component: ReviewsPage,
  head: () => ({ meta: [
    { title: 'Client Reviews | Islam Sayed' },
    { name: 'description', content: 'Read what clients say about working with Islam Sayed on UI/UX and product design projects.' },
  ] }),
})

function ReviewsPage() {
  return <Page>
    <main className={innerPageClass}>
      <header className="mb-8 md:mb-12">
        <Link className={backLinkClass} to="/"><ArrowLeftLinear size={18} aria-hidden="true" />Back to home</Link>
        <h1 className={pageHeadingClass}>Client reviews</h1>
        <p className={pageDescriptionClass}>Kind words from the people I’ve worked with.</p>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{testimonials.map(review => <ReviewCard key={review[1]} review={review} compact />)}</div>
    </main>
  </Page>
}
