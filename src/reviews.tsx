export const testimonials = [
  ['Islam created a professional, tailor-made design. His creativity and communication are excellent. I really recommend working with him.', 'Matt G.', '/icons/pl.svg', 'Poland'],
  ['I really enjoyed working with Islam. He addressed my requirements carefully and was very attentive to my requests.', 'Mehrdad D.', '/icons/australia-flag-icon.svg', 'Australia'],
  ['He was super helpful, professional, and delivered beautiful, elegant designs right on target.', 'Cameron F.', '/icons/mexico-flag-icon.svg', 'Mexico'],
]

export function ReviewCard({ review, compact = false }: { review: typeof testimonials[number]; compact?: boolean }) {
  const [quote, name, flag, country] = review
  return <article className={`relative m-0 flex min-h-[340px] w-full min-w-0 flex-col rounded-none border border-accent/8 bg-linear-[135deg,#fff,#faf7f8] md:min-h-[360px] ${compact ? 'px-6 py-7 md:p-8' : 'px-6 py-8 md:px-16 md:py-12'}`}>
    <span className="pointer-events-none absolute top-3 right-5 font-display text-[100px] leading-none font-bold text-accent/5 md:right-9 md:text-[140px]" aria-hidden="true">“</span>
    <div className="relative mb-[26px] flex items-center gap-3 text-xs text-muted" aria-label="Rated 5 out of 5"><span className="text-lg tracking-[3px] text-accent" aria-hidden="true">★★★★★</span><span>5.0 / 5</span></div>
    <blockquote className={`relative m-0 min-h-0 flex-1 font-display leading-[1.55] font-bold text-pretty ${compact ? 'text-2xl' : 'text-[23px] md:text-[clamp(22px,2.6vw,32px)]'}`}><p className="m-0">{quote}</p></blockquote>
    <div className="mt-8 flex items-center gap-3.5 border-t border-ink/5 pt-6">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent/5 font-display text-2xl font-bold text-accent" aria-hidden="true">{name.charAt(0)}</span>
      <div><strong className="block font-medium">{name}</strong><span className="mt-1 flex items-center gap-[7px] text-xs text-muted"><img className="h-[13px] w-[18px] rounded-[2px] object-cover" src={flag} alt="" />{country}</span></div>
    </div>
  </article>
}
