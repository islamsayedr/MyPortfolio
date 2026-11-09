import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeftLinear } from 'solar-icon-set'
import { Page } from '../components'
import { useLocale, localizedHead, localeFromMatches } from '../localization'
import { testimonials, ReviewCard } from '../reviews'
import { backLinkClass, innerPageClass, pageDescriptionClass, pageHeadingClass } from '../ui'

export const Route = createFileRoute('/reviews')({
  component: ReviewsPage,
  head: ({ matches }) => localizedHead(localeFromMatches(matches), 'Client Reviews', 'Read what clients say about working with Islam Sayed on UI/UX and product design projects.'),
})

function ReviewsPage() {
  const { t } = useLocale()
  return <Page>
    <main className={innerPageClass}>
      <header className="mb-8 md:mb-12">
        <Link className={backLinkClass} to="/"><ArrowLeftLinear className="rtl:rotate-180" size={18} aria-hidden="true" />{t('Back to home')}</Link>
        <h1 className={pageHeadingClass}>{t('Client reviews')}</h1>
        <p className={pageDescriptionClass}>{t('Kind words from the people I’ve worked with.')}</p>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{testimonials.map(review => <ReviewCard key={review[1]} review={review} compact />)}</div>
    </main>
  </Page>
}
