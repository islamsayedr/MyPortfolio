import { ArrowRightLinear } from 'solar-icon-set'

export const projects = [
  { title: 'Couponz Souq', image: '/imgs/sc.jpg', alt: 'Couponz Souq mobile app', tags: ['UI Design', 'Mobile App'] },
  { title: 'Tracker 3arbya', image: '/imgs/t3.jpg', alt: 'Tracker 3arbya mobile app', tags: ['Case Study', 'UX Design', 'UI Design', 'Mobile App'] },
  { title: 'Tia Jewelry', image: '/imgs/tia.jpg', alt: 'Tia Jewelry website', tags: ['UX Design', 'UI Design', 'Website'] },
  { title: 'Dal', image: '/imgs/dal.jpg', alt: 'Dal mobile app', tags: ['Case Study', 'UX Design', 'UI Design'] },
  { title: 'Shipin', image: '/imgs/shipin.jpg', alt: 'Shipin mobile app', tags: ['Case Study', 'UX Design', 'Mobile App'] },
]

export function ProjectCard({ project }: { project: typeof projects[number] }) {
  return <article className="project"><img src={project.image} alt={project.alt} loading="lazy" /><div className="project-copy"><h3>{project.title}</h3><a className="project-link" href="https://www.behance.net/geosid40" target="_blank" rel="noreferrer" aria-label={`View ${project.title} on Behance`}><ArrowRightLinear size={20} aria-hidden="true" /></a></div></article>
}
