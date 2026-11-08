import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftLinear } from 'solar-icon-set'
import { Page } from '../components'
import { testimonials, ReviewCard } from '../reviews'

export const Route = createFileRoute('/reviews')({
  component: ReviewsPage,
  head: () => ({ meta: [
    { title: 'Client Reviews | Islam Sayed' },
    { name: 'description', content: 'Read what clients say about working with Islam Sayed on UI/UX and product design projects.' },
  ] }),
})

function ReviewsPage() {
  return <Page><main className="container inner-page reviews-page"><header className="work-page-heading"><Link className="page-back" to="/"><ArrowLeftLinear size={18} aria-hidden="true" />Back to home</Link><h1>Client reviews</h1><p>Kind words from the people I’ve worked with.</p></header><div className="reviews-grid">{testimonials.map(review => <ReviewCard key={review[1]} review={review} />)}</div></main></Page>
}
