import { createFileRoute } from '@tanstack/react-router'
import { Page, SectionTitle } from '../components'
import { ArrowRightLinear } from 'solar-icon-set'

export const Route = createFileRoute('/blog')({ component: BlogPage, head: () => ({ meta: [{ title: 'Blog | Islam Sayed' }] }) })
function BlogPage() { return <Page><main className="inner-page container blog-page"><SectionTitle>From the blog</SectionTitle><article className="blog-card"><div><p className="eyebrow">UX research · 6 min read</p><h1>Less Common But Useful UX Research Methods</h1><p>After defining your objectives and planning your research framework, it is time to choose the research technique that best serves the project's goals and yields the right insights.</p><a className="button secondary" href="mailto:Islamsayedr@gmail.com?subject=UX research article">Read more <ArrowRightLinear size={18} aria-hidden="true" /></a></div><img src="/imgs/portfolio-item-1.jpg" alt="UX research notes" /></article></main></Page> }
