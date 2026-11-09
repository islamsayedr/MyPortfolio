import { ArrowRightLinear } from 'solar-icon-set'
import { focusClass } from './ui'
import { useLocale } from './localization'

export const projects = [
  { title: 'Couponz Souq', image: '/imgs/sc.jpg', alt: 'Couponz Souq mobile app', tags: ['UI Design', 'Mobile App'] },
  { title: 'Tracker 3arbya', image: '/imgs/t3.jpg', alt: 'Tracker 3arbya mobile app', tags: ['Case Study', 'UX Design', 'UI Design', 'Mobile App'] },
  { title: 'Tia Jewelry', image: '/imgs/tia.jpg', alt: 'Tia Jewelry website', tags: ['UX Design', 'UI Design', 'Website'] },
  { title: 'Dal', image: '/imgs/dal.jpg', alt: 'Dal mobile app', tags: ['Case Study', 'UX Design', 'UI Design'] },
  { title: 'Shipin', image: '/imgs/shipin.jpg', alt: 'Shipin mobile app', tags: ['Case Study', 'UX Design', 'Mobile App'] },
]

export function ProjectCard({ project }: { project: typeof projects[number] }) {
  const { t } = useLocale()
  return <article className="relative flex w-full min-w-0 flex-col items-stretch overflow-hidden rounded-none bg-white">
    <img className="aspect-square h-auto w-full bg-[#e3e3e3] object-contain" src={project.image} alt={t(project.alt)} loading="lazy" />
    <div className="absolute inset-x-0 bottom-0 grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-none border border-white/60 bg-linear-[135deg,#ffffff80,#ffffff40] py-1.5 pe-3 ps-6 shadow-[0_8px_28px_#0601051f,inset_0_1px_0_#ffffffb3] backdrop-blur-[24px] backdrop-saturate-150 md:gap-x-6 md:gap-y-3 md:py-2.5 md:pe-4 md:ps-7">
      <h3 className="m-0 min-w-0 truncate font-display text-[22px] leading-[1.1] font-bold md:text-[26px]">{project.title}</h3>
      <a className={`col-start-2 row-start-1 inline-flex size-11 items-center justify-center gap-1.5 whitespace-nowrap text-accent ${focusClass}`} href="https://www.behance.net/geosid40" target="_blank" rel="noreferrer" aria-label={t('View {project} on Behance', { project: project.title })}><ArrowRightLinear className="rtl:rotate-180" size={20} aria-hidden="true" /></a>
    </div>
  </article>
}
