import { useState, type CSSProperties } from 'react'
import { focusClass } from './ui'
import { useLocale } from './localization'

export type Experience = {
  title: string
  company: string
  start: string
  end: string | null
  current: boolean
  skills: string[]
}


const baseMonthHeight = 24
const minimumCardHeight = 168

function monthIndex(value: string) {
  const [year, month] = value.split('-').map(Number)
  return year * 12 + month - 1
}

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  const { t, number, month: formatDate, now: renderTime } = useLocale()
  const [selected, setSelected] = useState(0)
  const now = new Date(renderTime)
  const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth()
  const firstMonth = Math.floor(Math.min(...items.map(item => monthIndex(item.start))) / 12) * 12
  const lastMonth = (Math.floor(Math.max(currentMonth, ...items.map(item => monthIndex(item.end ?? item.start))) / 12) + 1) * 12
  const ranges = items.map(item => ({
    start: monthIndex(item.start),
    end: Math.max(monthIndex(item.start) + 1, item.end ? monthIndex(item.end) : currentMonth),
  }))

  // Merge occupied ranges before finding internal gaps, so overlapping roles
  // never produce a false gap. Calendar padding above/below jobs stays empty.
  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start)
  const gaps: { start: number; end: number }[] = []
  let coveredUntil = sortedRanges[0]?.end ?? firstMonth
  for (const range of sortedRanges.slice(1)) {
    if (range.start > coveredUntil) gaps.push({ start: coveredUntil, end: range.start })
    coveredUntil = Math.max(coveredUntil, range.end)
  }
  const monthValue = (value: number) => `${Math.floor(value / 12)}-${String(value % 12 + 1).padStart(2, '0')}`
  const formatMonth = (value: number) => formatDate(monthValue(value))

  // Use the same calendar coordinates for ticks, bars, and cards. Expand dense
  // periods to accommodate short roles without clipping text or overlapping.
  const heights = Array.from({ length: lastMonth - firstMonth }, (_, offset) => {
    const month = firstMonth + offset
    return Math.max(baseMonthHeight, ...[...ranges, ...gaps]
      .filter(range => month >= range.start && month < range.end)
      .map(range => minimumCardHeight / (range.end - range.start)))
  })
  const positions = new Map<number, number>([[lastMonth, 0]])
  let height = 0
  for (let month = lastMonth - 1; month >= firstMonth; month--) {
    height += heights[month - firstMonth]
    positions.set(month, height)
  }

  return <div>
    <p className="mb-6 text-xs leading-relaxed text-muted">{t('Years mark the major intervals; months mark the smaller ticks. Cards and bars share the same start and end dates. Short periods are expanded for readability.')}</p>
    <div className="relative mt-3" style={{ height }} role="group" aria-label={t('Career timeline, newest dates first')}>
      <div className="pointer-events-none absolute inset-y-0 start-[50px] w-px bg-ink/20" aria-hidden="true" />
      {Array.from({ length: lastMonth - firstMonth + 1 }, (_, offset) => {
        const month = lastMonth - offset
        const year = Math.floor(month / 12)
        const monthOfYear = month % 12
        const major = monthOfYear === 0
        return <div className="pointer-events-none absolute inset-x-0 -translate-y-1/2" style={{ top: positions.get(month) }} key={month} aria-hidden="true">
          <span className={`absolute start-0 w-10 -translate-y-1/2 text-end ${major ? 'bg-paper text-xs font-medium text-ink' : 'text-[9px] text-muted/70'}`}>{major ? number(year, { useGrouping: false }) : formatDate(monthValue(month), { month: 'short' })}</span>
          <span className={`absolute start-[50px] h-px ${major ? 'w-[30px] bg-ink/20' : 'w-2 bg-ink/15'}`} />
        </div>
      })}
      {gaps.map(gap => {
        const top = positions.get(gap.end) ?? 0
        const gapHeight = (positions.get(gap.start) ?? 0) - top
        const dates = `${formatMonth(gap.start)} – ${formatMonth(gap.end)}`
        return <div className="absolute inset-x-0" style={{ top, height: gapHeight }} key={`gap-${gap.start}`} role="note" aria-label={t('No roles listed: {dates}', { dates })}>
          <span className="absolute inset-y-0 start-[65px] w-2 border-y border-ink/15 bg-ink/10" aria-hidden="true" />
          <div className="absolute inset-y-0 start-[73px] end-0 flex min-w-0 flex-col justify-center border border-dashed border-ink/15 bg-ink/3 px-3 py-3 md:px-6 md:py-4">
            <p className="mb-2 text-sm font-medium text-muted">{t('No roles listed')}</p>
            <p className="text-xs leading-relaxed text-muted">{dates}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted/75">{t('No experience entry provided for this period.')}</p>
          </div>
        </div>
      })}
      <ol className="m-0 list-none p-0" aria-label={t('Career experience')}>{items.map((item, index) => {
        const range = ranges[index]
        const dates = `${formatDate(item.start)} – ${item.end ? formatDate(item.end) : t('Present')}`
        const top = positions.get(range.end) ?? 0
        const rangeHeight = (positions.get(range.start) ?? 0) - top
        const position = { '--role-top': `${top}px`, '--role-height': `${rangeHeight}px` } as CSSProperties
        return <li className="absolute inset-x-0 top-(--role-top) h-(--role-height)" style={position} key={`${item.company}-${item.start}`}>
          <button className={`absolute inset-y-0 start-[65px] z-1 w-2 cursor-pointer border-y-2 border-accent p-0 transition-colors motion-reduce:transition-none ${focusClass} ${selected === index ? 'bg-accent' : 'bg-accent/25 hover:bg-accent/60'}`} type="button" aria-label={t('{role} at {company}: {dates}', { role: t(item.title), company: t(item.company), dates })} aria-pressed={selected === index} aria-controls={`experience-${index}`} title={`${t(item.title)} · ${t(item.company)}\n${dates}`} onClick={() => setSelected(index)} />
          <article id={`experience-${index}`} className={`absolute inset-y-0 start-[73px] end-0 flex min-w-0 flex-col justify-center overflow-y-auto border px-3 py-3 transition-colors motion-reduce:transition-none md:px-6 md:py-4 ${selected === index ? 'border-accent/30 bg-accent/5' : 'border-ink/10 bg-white'}`}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg leading-tight font-bold md:text-[28px]">{t(item.title)}</h2>
              {item.current && <span className="border border-accent/20 bg-paper px-2 py-1 text-[11px] font-medium text-accent">{t('Present')}</span>}
            </div>
            <p className="mb-2 text-sm font-medium">{t(item.company)}</p>
            <p className="text-xs leading-[1.8] text-muted md:text-sm">{dates}</p>
            {item.skills.length > 0 && rangeHeight >= 240 && <ul className="mt-4 flex list-none flex-wrap gap-2 p-0" aria-label={t('Skills used')}>{item.skills.map(skill => <li className="border border-ink/10 bg-white px-2 py-1 text-xs text-muted" key={skill}>{t(skill)}</li>)}</ul>}
          </article>
        </li>
      })}</ol>
    </div>
  </div>
}
