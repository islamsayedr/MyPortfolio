import { Link, useRouter } from '@tanstack/react-router'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Home2Linear, Home2Bold, UserRoundedLinear, UserRoundedBold, UsersGroupRoundedLinear, UsersGroupRoundedBold, Logout3Linear, ArrowRightLinear, FolderLinear, FolderBold } from 'solar-icon-set'
import { LocaleSwitcher, useLocale } from '../localization'
import { signOut } from '../auth/actions.functions'
import type { DashboardSession } from '../auth/types'
import { focusClass, primaryButtonClass } from '../ui'
import { DashboardBreadcrumbs } from './breadcrumbs'
import { clampSidebarDragWidth, resolveSidebarWidth, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_DEFAULT_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_WIDTH_KEY } from './sidebar-size'

export const fieldClass = `w-full min-w-0 border border-ink/20 bg-white px-3 py-2.5 text-sm ${focusClass}`

export function SetupNotice() {
  const { t } = useLocale()
  return <section className="border border-accent/20 bg-white p-6 md:p-8"><h1 className="mb-4 font-display text-3xl font-bold">{t('Dashboard setup required')}</h1><p className="mb-4 text-sm leading-relaxed text-muted">{t('Connect Supabase and apply the account migration to enable sign-in and dashboard features.')}</p><ul className="list-inside list-disc space-y-2 text-xs text-muted" dir="ltr"><li>SUPABASE_URL</li><li>SUPABASE_PUBLISHABLE_KEY</li><li>PUBLIC_SITE_URL</li></ul><p className="mt-5 text-xs text-muted">{t('Setup instructions are in docs/dashboard.md.')}</p></section>
}

export function DashboardError() {
  const { t } = useLocale()
  const router = useRouter()
  return <div className="mx-auto max-w-2xl px-6 py-20"><h1 className="mb-4 font-display text-3xl font-bold">{t('Dashboard unavailable')}</h1><p className="mb-6 text-muted">{t('Check the backend configuration and try again.')}</p><button type="button" className={primaryButtonClass} onClick={() => router.invalidate()}>{t('Try again')}</button></div>
}

export function DashboardShell({ session, children }: { session: DashboardSession; children: ReactNode }) {
  const { t, direction, number } = useLocale()
  const [pending, setPending] = useState(false)
  const [expanded, setExpanded] = useState<boolean | null>(null)
  const [wideScreen, setWideScreen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH)
  const [resizing, setResizing] = useState(false)
  const [dragWidth, setDragWidth] = useState<number | null>(null)
  const dragWidthRef = useRef<number | null>(null)
  const widthRef = useRef(SIDEBAR_DEFAULT_WIDTH)
  const sidebar = useRef<HTMLElement>(null)
  const resizePointer = useRef<number | null>(null)

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(SIDEBAR_WIDTH_KEY))
      if (Number.isInteger(saved) && saved > SIDEBAR_MIN_WIDTH && saved <= SIDEBAR_MAX_WIDTH) {
        widthRef.current = saved
        setSidebarWidth(saved)
      }
    } catch { /* Storage may be unavailable; keep the default width. */ }
    const media = window.matchMedia('(min-width: 768px)')
    const update = () => {
      setWideScreen(media.matches)
      if (!media.matches) setExpanded(null)
    }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const isExpanded = expanded ?? wideScreen
  const labelClass = expanded === null ? 'hidden md:block' : expanded ? 'block' : 'hidden'
  const alignment = expanded === null ? 'justify-center md:justify-start' : expanded ? 'justify-start' : 'justify-center'
  const closeSidebar = () => { setExpanded(false); toggle.current?.focus() }
  const resizeSidebar = (requested: number) => {
    const next = resolveSidebarWidth(requested)
    if (next === null) { setExpanded(false); return }
    widthRef.current = next
    setSidebarWidth(next)
    setExpanded(true)
  }
  const rememberWidth = () => {
    try { window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(widthRef.current)) } catch { /* Optional preference. */ }
  }
  const finishResize = (handle: HTMLDivElement, pointerId: number) => {
    if (dragWidthRef.current !== null) resizeSidebar(dragWidthRef.current)
    dragWidthRef.current = null
    setDragWidth(null)
    resizePointer.current = null
    setResizing(false)
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId)
    rememberWidth()
  }
  const visibleWidth = dragWidth ?? (isExpanded ? sidebarWidth : SIDEBAR_COLLAPSED_WIDTH)
  const sidebarStyle = { '--sidebar-width': `min(${dragWidth ?? sidebarWidth}px, calc(100vw - 4rem))` } as CSSProperties
  const [error, setError] = useState('')
  const navigation = [
    { to: '/dashboard', label: 'Overview', icon: Home2Linear, activeIcon: Home2Bold },
    ...(session.user?.role === 'admin' ? [
      { to: '/dashboard/work', label: 'Work', icon: FolderLinear, activeIcon: FolderBold },
      { to: '/dashboard/users', label: 'Users', icon: UsersGroupRoundedLinear, activeIcon: UsersGroupRoundedBold },
    ] : []),
  ] as const
  const actionClass = `flex min-h-11 w-full items-center gap-2.5 px-2.5 py-2 text-[13px] md:min-h-10 text-muted hover:bg-paper hover:text-accent ${alignment} ${focusClass}`

  return <div style={sidebarStyle} className={`min-h-svh bg-paper ${resizing ? 'select-none cursor-col-resize [&_*]:cursor-col-resize' : 'transition-[padding] duration-200 motion-reduce:transition-none'} ${dragWidth !== null ? 'ps-[var(--sidebar-width)]' : expanded === false ? 'ps-16' : 'ps-16 md:ps-[var(--sidebar-width)]'}`}>
    {isExpanded && !wideScreen && <button type="button" className="fixed inset-0 z-[9] cursor-default bg-ink/20 md:hidden" aria-label={t('Close sidebar')} onClick={closeSidebar} />}
    <aside id="dashboard-sidebar" ref={sidebar} className={`fixed inset-y-0 start-0 z-10 flex flex-col border-e border-ink/10 bg-white pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] ${resizing ? '' : 'transition-[width] duration-200 motion-reduce:transition-none'} ${dragWidth !== null ? 'w-[var(--sidebar-width)]' : expanded === null ? 'w-16 md:w-[var(--sidebar-width)]' : expanded ? 'w-[var(--sidebar-width)]' : 'w-16'}`} aria-label={t('Dashboard')} onKeyDown={event => {
      if (event.key === 'Escape' && !event.defaultPrevented && !wideScreen && isExpanded) { event.preventDefault(); closeSidebar() }
    }}>
      <div className="group/sidebar-header flex shrink-0 items-center gap-2 border-b border-ink/10 px-3 py-3">
        <Link to="/dashboard" className={`min-w-0 items-center gap-2 ${expanded === null ? 'hidden md:flex' : expanded ? 'flex' : 'hidden'} ${focusClass}`} aria-label={t('Dashboard')}>
          <img src="/icons/logo.svg" className="size-7 shrink-0" alt="" />
          <span className="whitespace-nowrap text-[13px] font-medium">{t('Dashboard')}</span>
        </Link>
        <button ref={toggle} type="button" className={`group/sidebar-toggle grid size-8 shrink-0 cursor-pointer place-items-center border text-muted hover:bg-paper hover:text-accent ${expanded === null ? 'mx-auto border-transparent md:ms-auto md:me-0 md:border-ink/15' : expanded ? 'ms-auto border-ink/15' : 'mx-auto border-transparent'} ${focusClass}`} aria-label={t(isExpanded ? 'Collapse sidebar' : 'Expand sidebar')} aria-expanded={isExpanded} aria-controls="dashboard-sidebar-navigation" title={t(isExpanded ? 'Collapse sidebar' : 'Expand sidebar')} onClick={() => setExpanded(!isExpanded)}>
          <img src="/icons/logo.svg" alt="" aria-hidden="true" className={`col-start-1 row-start-1 size-7 transition-opacity duration-150 group-hover/sidebar-header:opacity-0 group-focus-visible/sidebar-toggle:opacity-0 motion-reduce:transition-none ${expanded === null ? 'md:hidden' : expanded ? 'hidden' : ''}`} />
          <ArrowRightLinear size={18} aria-hidden="true" className={`col-start-1 row-start-1 transition-opacity duration-150 motion-reduce:transition-none ${expanded === null ? 'opacity-0 group-hover/sidebar-header:opacity-100 group-focus-visible/sidebar-toggle:opacity-100 md:rotate-180 md:opacity-100 rtl:rotate-180 md:rtl:rotate-0' : expanded ? 'rotate-180 rtl:rotate-0' : 'opacity-0 group-hover/sidebar-header:opacity-100 group-focus-visible/sidebar-toggle:opacity-100 rtl:rotate-180'}`} />
        </button>
      </div>

      <nav id="dashboard-sidebar-navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label={t('Dashboard navigation')}>
        {navigation.map(({ to, label, icon: Icon, activeIcon: ActiveIcon }) => <Link key={to} to={to} className={`flex min-h-11 items-center gap-2.5 border-s-2 border-transparent px-2.5 py-2 text-[13px] text-muted hover:bg-paper md:min-h-10 ${alignment} ${focusClass}`} activeProps={{ className: '!border-accent bg-accent/5 !text-accent font-medium' }} activeOptions={{ exact: to === '/dashboard' }} aria-label={t(label)} title={t(label)} onClick={() => { if (!wideScreen) setExpanded(false) }}>
          {({ isActive }) => {
            const ItemIcon = isActive ? ActiveIcon : Icon
            return <><ItemIcon size={20} aria-hidden="true" data-icon-variant={isActive ? 'solid' : 'outline'} /><span className={labelClass}>{t(label)}</span></>
          }}
        </Link>)}
      </nav>

      <div className="shrink-0 space-y-0.5 border-t border-ink/10">
        <Link to="/dashboard/account" className={actionClass} activeProps={{ className: 'bg-accent/5 !text-accent font-medium' }} aria-label={t('My account')} title={t('My account')} onClick={() => { if (!wideScreen) setExpanded(false) }}>
          {({ isActive }) => {
            const AccountIcon = isActive ? UserRoundedBold : UserRoundedLinear
            return <><AccountIcon size={20} aria-hidden="true" data-icon-variant={isActive ? 'solid' : 'outline'} /><span className={labelClass}>{t('My account')}</span></>
          }}
        </Link>
        <LocaleSwitcher placement="top-start" labelClassName={labelClass} className={alignment} />
        {session.user && <button className={`${actionClass} cursor-pointer disabled:cursor-wait disabled:opacity-50`} type="button" disabled={pending} aria-busy={pending} aria-label={t(pending ? 'Signing out…' : 'Sign out')} title={t('Sign out')} onClick={async () => {
          setPending(true); setError('')
          try { await signOut(); window.location.assign('/login') } catch { setError('Unable to sign out. Please try again.'); setPending(false) }
        }}>
          <Logout3Linear size={20} aria-hidden="true" /><span className={labelClass}>{t(pending ? 'Signing out…' : 'Sign out')}</span>
        </button>}
      </div>
      <div role="separator" tabIndex={0} aria-label={t('Resize sidebar')} aria-description={t('Drag to resize. At the minimum width, the sidebar collapses. Use arrow keys to resize, Home to collapse, and End for maximum width.')} aria-orientation="vertical" aria-controls="dashboard-sidebar" aria-valuemin={SIDEBAR_COLLAPSED_WIDTH} aria-valuemax={SIDEBAR_MAX_WIDTH} aria-valuenow={visibleWidth} aria-valuetext={visibleWidth === SIDEBAR_COLLAPSED_WIDTH ? t('Collapsed') : t('{width} pixels', { width: number(visibleWidth) })} title={t('Resize sidebar')} className="absolute inset-y-0 -end-1 z-20 hidden w-2 cursor-col-resize touch-none select-none hover:bg-accent/15 focus-visible:bg-accent/20 focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2 md:block" onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return
        event.preventDefault()
        event.currentTarget.focus({ preventScroll: true })
        resizePointer.current = event.pointerId
        const width = clampSidebarDragWidth(sidebar.current?.getBoundingClientRect().width ?? SIDEBAR_COLLAPSED_WIDTH)
        dragWidthRef.current = width
        setDragWidth(width)
        event.currentTarget.setPointerCapture(event.pointerId)
        setResizing(true)
      }} onPointerMove={event => {
        if (resizePointer.current !== event.pointerId) return
        const bounds = sidebar.current?.getBoundingClientRect()
        if (bounds) {
          const width = clampSidebarDragWidth(direction === 'rtl' ? bounds.right - event.clientX : event.clientX - bounds.left)
          dragWidthRef.current = width
          setDragWidth(width)
          setExpanded(width > SIDEBAR_MIN_WIDTH)
        }
      }} onPointerUp={event => {
        if (resizePointer.current === event.pointerId) finishResize(event.currentTarget, event.pointerId)
      }} onPointerCancel={event => {
        if (resizePointer.current === event.pointerId) finishResize(event.currentTarget, event.pointerId)
      }} onLostPointerCapture={event => {
        if (resizePointer.current === event.pointerId) finishResize(event.currentTarget, event.pointerId)
      }} onDoubleClick={() => { resizeSidebar(SIDEBAR_DEFAULT_WIDTH); rememberWidth() }} onKeyDown={event => {
        if (resizePointer.current !== null) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          const grow = (event.key === 'ArrowRight') === (direction === 'ltr')
          resizeSidebar((isExpanded ? widthRef.current : SIDEBAR_MIN_WIDTH) + (grow ? 1 : -1) * (event.shiftKey ? 32 : 16))
          rememberWidth()
        } else if (event.key === 'Home') {
          event.preventDefault(); setExpanded(false)
        } else if (event.key === 'End') {
          event.preventDefault(); resizeSidebar(SIDEBAR_MAX_WIDTH); rememberWidth()
        } else if (event.key === 'Enter') {
          event.preventDefault(); setExpanded(!isExpanded)
        }
      }} />
    </aside>

    <DashboardBreadcrumbs />
    <main className="mx-auto min-w-0 max-w-[1440px] px-4 py-6 [&_h1]:break-words md:px-10 md:py-8">
      {error && <p className="mb-6 text-sm text-accent" role="alert">{t(error)}</p>}
      {session.configured ? children : <SetupNotice />}
    </main>
  </div>
}
