import { Link, useLoaderData } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { FaHandPaper, FaShieldAlt, FaHandsHelping, FaDove } from 'react-icons/fa'
import { Home2Linear, UserRoundedLinear, PaletteLinear } from 'solar-icon-set'
import { containerClass, focusClass, sectionHeadingClass } from './ui'
import { LocaleSwitcher, useLocale } from './localization'

const solidarityMessages = [
  { text: 'We stand with our friends and families in Palestine.', icon: null },
  { text: 'Stop genocide.', icon: FaHandPaper },
  { text: 'Protect civilians.', icon: FaShieldAlt },
  { text: 'Let humanitarian aid through.', icon: FaHandsHelping },
  { text: 'Freedom, dignity, and justice for Palestine.', icon: FaDove },
]

const navigationItems = [
  { to: '/', label: 'Home', icon: Home2Linear },
  { to: '/about', label: 'About', icon: UserRoundedLinear },
  { to: '/for-designers', label: 'For designers', icon: PaletteLinear },
] as const

export function Header() {
  const { t, direction } = useLocale()
  const { headerAccount } = useLoaderData({ from: '__root__' })
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navClass = `text-sm uppercase tracking-[1px] text-muted hover:text-accent ${focusClass}`

  return <header className="fixed inset-x-0 top-0 z-10 border-b border-[#bbb] bg-white/85 backdrop-blur-[18px]">
    <div className={`flex items-center gap-2.5 overflow-hidden bg-[#c6c6c6] px-5 text-center text-[13px] text-ink transition-[max-height,padding,opacity] duration-250 motion-reduce:transition-none ${scrolled ? 'invisible max-h-0 py-0 opacity-0' : 'max-h-[30px] py-[5px] opacity-100'}`}>
      <span className="sr-only">{solidarityMessages.map(message => t(message.text)).join(' ')}</span>
      <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap mask-[linear-gradient(to_right,transparent,#000_32px,#000_calc(100%_-_32px),transparent)]" dir="ltr" aria-hidden="true">
        <div className={`flex w-max min-w-[200%] animate-solidarity motion-reduce:animate-none ${direction === 'rtl' ? '[animation-direction:reverse]' : ''}`}>
          {Array.from({ length: 2 }, (_, repeat) => <div className="flex shrink-0 flex-1 items-center justify-around" dir={direction} key={repeat}>
            {solidarityMessages.map(({ text, icon: Icon }, index) => <span className="inline-flex shrink-0 items-center gap-2.5 pe-8" key={index}>
              {Icon ? <Icon className="size-4 shrink-0 text-accent" /> : <img className="h-[15px] w-[23px] shrink-0 rounded-[3px] object-cover" src="/icons/palestine-flag.svg" alt="" />}
              {t(text)}<b className="ps-8 text-accent">•</b>
            </span>)}
          </div>)}
        </div>
      </div>
    </div>
    <div className={`${containerClass} flex min-h-[68px] items-center justify-between gap-7 py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:py-0`}>
      <Link to="/" className={`justify-self-start ${focusClass}`}><img className="size-[42px]" src="/icons/logo.svg" alt={t('Islam Sayed home')} /></Link>
      <nav className="hidden items-center justify-center gap-[26px] md:flex" aria-label={t('Primary navigation')}>
        {navigationItems.map(item => <Link key={item.to} to={item.to} className={navClass} activeProps={{ className: '!text-accent font-medium' }} activeOptions={{ exact: item.to === '/' }}>{t(item.label)}</Link>)}
      </nav>
      <div className="flex items-center justify-self-end gap-3 md:gap-3.5">
        <a className={`inline-flex h-8 shrink-0 items-center justify-center border border-accent/20 px-3 text-xs font-medium text-accent hover:bg-accent/5 ${focusClass}`} href={headerAccount.href}>{t(headerAccount.signedIn ? 'Dashboard' : 'Login')}</a>
        <LocaleSwitcher />
      </div>
    </div>
  </header>
}

export function Footer() {
  const { t, number, now } = useLocale()
  return <footer className="mt-[30px] border-t border-[#bbb] bg-white/85 text-center backdrop-blur-[18px]">
    <div className={`${containerClass} flex flex-col items-stretch justify-between gap-8 py-8 md:flex-row md:items-center md:gap-6`}>
      <Link className={`self-start ${focusClass}`} to="/"><img className="size-[42px]" src="/icons/logo.svg" alt={t('Islam Sayed home')} /></Link>
      <form className="w-full text-start md:max-w-[460px]" onSubmit={event => {
        event.preventDefault()
        const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
        window.location.href = `mailto:Islamsayedr@gmail.com?subject=${encodeURIComponent(t('Newsletter subscription request'))}&body=${encodeURIComponent(`${t('Please subscribe me to your newsletter.')}\n${t('Email')}: ${email}`)}`
      }}>
        <label className="sr-only" htmlFor="newsletter-email">{t('Email address for newsletter')}</label>
        <div className="relative">
          <input className={`h-[42px] w-full min-w-0 rounded-none border border-ink/15 bg-white py-2 pe-32 ps-4 text-ink ${focusClass}`} id="newsletter-email" name="email" type="email" autoComplete="email" placeholder={t('Enter your email for design updates')} required />
          <button className={`absolute inset-y-0 end-0 inline-flex cursor-pointer items-center justify-center rounded-none border-0 bg-linear-[36deg,#8d0130,#bd0946] px-4 py-2 text-xs font-medium text-white ${focusClass}`} type="submit" title={t('Opens your email app to request a newsletter subscription')}>{t('Subscribe')}</button>
        </div>
      </form>
    </div>
    <small className="block border-t border-[#bbb] p-2.5 text-xs text-muted">© {number(new Date(now).getUTCFullYear(), { useGrouping: false })} {t('Islam Sayed')}. {t('All rights reserved.')}</small>
  </footer>
}

function MobileNavigation() {
  const { t } = useLocale()
  return <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/15 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_#06010508] backdrop-blur-[18px] md:hidden" aria-label={t('Mobile navigation')}>
    <div className="mx-auto flex max-w-[600px]">
      {navigationItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={`flex h-[63px] min-w-0 flex-1 flex-col items-center justify-center gap-1 border-t-2 border-transparent px-2 text-muted hover:bg-paper hover:text-accent focus-visible:-outline-offset-4 ${focusClass}`} activeProps={{ className: '!border-accent bg-accent/5 !text-accent' }} activeOptions={{ exact: to === '/' }}>
        <Icon size={22} aria-hidden="true" />
        <span className="text-center text-[11px] leading-tight font-medium">{t(label)}</span>
      </Link>)}
    </div>
  </nav>
}

export function Page({ children }: { children: ReactNode }) {
  return <><div className="pb-[calc(64px_+_env(safe-area-inset-bottom,0px))] md:pb-0"><Header />{children}<Footer /></div><MobileNavigation /></>
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="mb-7 text-center md:mb-10"><h2 className={sectionHeadingClass}>{children}</h2></div>
}
