import { useLocale } from '../localization'
import { renderPresentation } from './markdown'

export function Presentation({ content, className = '' }: { content: string; className?: string }) {
  const { t } = useLocale()
  if (!content.trim()) return null
  return <section aria-label={t('Project presentation')} className={`min-w-0 max-w-full break-words leading-relaxed text-muted
    [&>:first-child]:mt-0 [&>:last-child]:mb-0
    [&_:is(h2,h3,h4,h5,h6)]:mt-8 [&_:is(h2,h3,h4,h5,h6)]:mb-4 [&_:is(h2,h3,h4,h5,h6)]:font-display [&_:is(h2,h3,h4,h5,h6)]:font-bold [&_:is(h2,h3,h4,h5,h6)]:text-ink rtl:[&_:is(h2,h3,h4,h5,h6)]:font-heading-arabic
    [&_h2]:text-3xl [&_h3]:text-2xl [&_:is(h4,h5,h6)]:text-xl
    [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_li]:my-1
    [&_blockquote]:my-6 [&_blockquote]:border-s-2 [&_blockquote]:border-accent/30 [&_blockquote]:ps-4 [&_blockquote]:italic
    [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-accent [&_a]:focus-visible:outline-offset-2
    [&_strong]:font-medium [&_strong]:text-ink [&_code]:font-mono [&_code]:text-sm
    [&_pre]:my-6 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-start [&_pre]:text-paper [&_pre]:[direction:ltr]
    [&_pre_code]:whitespace-pre [&_pre_code]:break-normal
    [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_hr]:my-8 [&_hr]:border-ink/15
    [&_.presentation-table]:my-6 [&_.presentation-table]:max-w-full [&_.presentation-table]:overflow-x-auto
    [&_table]:w-full [&_table]:border-collapse [&_:is(th,td)]:border [&_:is(th,td)]:border-ink/15 [&_:is(th,td)]:px-3 [&_:is(th,td)]:py-2 [&_:is(th,td)]:text-start [&_th]:bg-ink/5 [&_th]:font-medium [&_th]:text-ink
    ${className}`} dangerouslySetInnerHTML={{ __html: renderPresentation(content) }} />
}
