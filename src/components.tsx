import { Link } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { FaLinkedinIn, FaTelegramPlane, FaHandPaper, FaShieldAlt, FaHandsHelping, FaDove } from 'react-icons/fa'

const solidarityMessages = [
  { text: 'We stand with our friends and families in Palestine.', icon: null },
  { text: 'Stop genocide.', icon: FaHandPaper },
  { text: 'Protect civilians.', icon: FaShieldAlt },
  { text: 'Let humanitarian aid through.', icon: FaHandsHelping },
  { text: 'Freedom, dignity, and justice for Palestine.', icon: FaDove },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <header className={scrolled ? 'site-header is-scrolled' : 'site-header'}>
    <div className="palestine"><span className="sr-only">{solidarityMessages.map(message => message.text).join(' ')}</span><div className="palestine-marquee" aria-hidden="true"><div className="palestine-track">{Array.from({ length: 2 }, (_, repeat) => solidarityMessages.map(({ text, icon: Icon }, index) => <span className="palestine-phrase" key={`${repeat}-${index}`}>{Icon ? <Icon /> : <img src="/icons/palestine-flag.svg" alt="" />}{text}<b>•</b></span>))}</div></div></div>
    <div className="header-inner">
      <Link to="/" className="logo" onClick={() => setOpen(false)}><img src="/icons/logo.svg" alt="Islam Sayed home" /></Link>
      <button className="menu-button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      <nav className={open ? 'site-nav open' : 'site-nav'}>
        <Link to="/" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>Home</Link>
        <Link to="/about" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>About</Link>
        <Link to="/for-designers" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>For designers</Link>
      </nav>
      <div className="social-links"><a href="https://www.linkedin.com/in/islamsayedr" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn aria-hidden="true" /></a><a href="https://t.me/islamsayedr" target="_blank" rel="noreferrer" aria-label="Telegram"><FaTelegramPlane aria-hidden="true" /></a></div>
    </div>
  </header>
}

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-brand"><Link to="/"><img src="/icons/logo.svg" alt="Islam Sayed home" /></Link></div>
      <form className="newsletter-form" onSubmit={event => {
        event.preventDefault()
        const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
        window.location.href = `mailto:Islamsayedr@gmail.com?subject=${encodeURIComponent('Newsletter subscription request')}&body=${encodeURIComponent(`Please subscribe me to your newsletter.\nEmail: ${email}`)}`
      }}>
        <label className="sr-only" htmlFor="newsletter-email">Email address for newsletter</label>
        <div className="newsletter-fields"><input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="Enter your email for design updates" required /><button className="button primary" type="submit" title="Opens your email app to request a newsletter subscription">Subscribe</button></div>
      </form>
    </div>
    <small>© {new Date().getFullYear()} Islam Sayed. All rights reserved.</small>
  </footer>
}

export function Page({ children }: { children: ReactNode }) { return <><Header />{children}<Footer /></> }
export function SectionTitle({ children }: { children: ReactNode }) { return <div className="section-title"><h2>{children}</h2></div> }
