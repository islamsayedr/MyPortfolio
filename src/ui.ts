// Shared Tailwind utility strings; all component styling lives in utility classes.
export const containerClass = 'mx-auto w-[calc(100%_-_48px)] max-w-[1200px]'
export const focusClass = 'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4'
export const buttonClass = 'inline-flex items-center justify-center gap-3 rounded-none px-6 py-3 text-sm font-medium uppercase tracking-[1px] cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4'
export const primaryButtonClass = `${buttonClass} bg-linear-[36deg,#8d0130,#bd0946] text-white`
export const sectionHeadingClass = 'm-0 font-display font-bold text-[clamp(26px,3vw,36px)] leading-[1.25] tracking-[-.4px] text-balance'
export const sectionHeaderClass = 'mb-7 flex items-center justify-between gap-3 md:mb-10 md:gap-5'
export const viewMoreClass = `inline-flex shrink-0 items-center gap-1.5 border border-accent/20 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/5 md:gap-2.5 md:px-4 md:py-2.5 md:text-sm ${focusClass}`
export const innerPageClass = `${containerClass} min-h-[75vh] pt-40 pb-[70px]`
export const pageHeadingClass = 'm-0 font-display font-bold text-[clamp(40px,5vw,64px)] leading-[1.15] tracking-[-1px]'
export const pageDescriptionClass = 'mt-[18px] max-w-[560px] text-muted leading-[1.8]'
export const backLinkClass = `mb-6 inline-flex items-center gap-2 py-2 text-sm text-muted hover:text-accent ${focusClass}`
export const animatedHeadingClass = "bg-ink bg-[url('/imgs/hero-text.gif')] bg-cover bg-clip-text text-transparent font-display font-bold motion-reduce:bg-none"
