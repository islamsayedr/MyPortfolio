import { createFileRoute } from '@tanstack/react-router'
import { Page, SectionTitle } from '../components'

export const Route = createFileRoute('/about')({ component: AboutPage, head: () => ({ meta: [{ title: 'About | Islam Sayed' }] }) })
const skills = ['Agile', 'Design Thinking', 'Competitive Analysis', 'Heuristic Evaluation', 'User Research', 'Usability Testing', 'Card Sorting', 'Wireframing', 'Design Systems', 'Visual Design', 'Prototyping', 'Mockups', 'User Flows', 'Sitemaps', 'Figma', 'Adobe XD', 'Photoshop', 'HTML', 'CSS', 'JavaScript']
function AboutPage() { return <Page><main className="inner-page container about-page"><img className="about-image" src="/imgs/aboutImg.jpg" alt="Islam Sayed" /><SectionTitle>Brief summary</SectionTitle><p className="lead">A UI/UX designer with a background in graphic design and the ability to write HTML, CSS, and JavaScript. Certified by the Information Technology Institute, with proven freelance experience in visual, user interface, and graphic design.</p><section><SectionTitle>What I've worked with</SectionTitle><div className="skill-list">{skills.map(skill => <span key={skill}>{skill}</span>)}</div></section></main></Page> }
