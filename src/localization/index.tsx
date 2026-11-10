import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { focusClass } from '../ui'
import { localeCookie, localeInfo, locales, normalizeLocale, translate, type LocalizationState } from './locale'

function createLocalization(state: LocalizationState) {
  const info = localeInfo(state.locale)
  return {
    ...state,
    ...info,
    t: (message: string, values?: Record<string, string | number>) => translate(state.locale, message, values),
    number: (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(info.intl, options).format(value),
    month: (value: string, options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' }) => {
      const [year, month] = value.split('-').map(Number)
      return new Intl.DateTimeFormat(info.intl, { ...options, calendar: 'gregory', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)))
    },
  }
}

const LocalizationContext = createContext<ReturnType<typeof createLocalization> | null>(null)

export function LocalizationProvider({ state, children }: { state: LocalizationState; children: ReactNode }) {
  const value = useMemo(() => createLocalization(state), [state.locale, state.now])
  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
}

export function useLocale() {
  const value = useContext(LocalizationContext)
  if (!value) throw new Error('useLocale must be used inside LocalizationProvider')
  return value
}

export function LocaleSwitcher({ placement = 'bottom-end', labelClassName, className = '' }: { placement?: 'bottom-end' | 'top-start'; labelClassName?: string; className?: string }) {
  const { locale, flag, label, intl, direction, t } = useLocale()
  const labelled = labelClassName !== undefined
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
    const onOutsideClick = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onOutsideClick)
    return () => document.removeEventListener('pointerdown', onOutsideClick)
  }, [open])

  function chooseLocale(value: string) {
    const next = normalizeLocale(value)
    setOpen(false)
    trigger.current?.focus()
    if (!next || next === locale) return
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${localeCookie}=${encodeURIComponent(next)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
    window.location.reload()
  }

  return <div className={`relative inline-flex ${labelled ? 'w-full' : ''}`} ref={root} onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      trigger.current?.focus()
    }
  }}>
    <button className={`${labelled ? 'flex min-h-11 w-full items-center gap-2.5 px-2.5 py-2 text-[13px] hover:bg-paper hover:text-accent md:min-h-10' : 'grid size-8 place-items-center bg-paper text-[17px] hover:bg-accent hover:text-paper'} cursor-pointer border-0 text-muted ${className} ${focusClass}`} type="button" ref={trigger} aria-label={`${t('Language and region')}: ${label}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} title={label} onClick={() => setOpen(value => !value)} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setOpen(true)
      }
    }}>
      <img className="h-[18px] w-6 shrink-0 object-cover" src={flag} alt="" aria-hidden="true" />
      {labelled && <span className={`min-w-0 flex-1 truncate text-start ${labelClassName}`} lang={intl} dir={direction}>{label}</span>}
    </button>
    {open && <div className={`absolute z-30 w-[228px] border border-ink/10 bg-white p-1 shadow-lg ${placement === 'top-start' ? 'start-0 bottom-full mb-2' : 'end-0 top-full mt-2'}`} ref={menu} id={menuId} role="menu" aria-label={t('Language and region')} onKeyDown={event => {
      const options = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])
      const index = options.indexOf(document.activeElement as HTMLButtonElement)
      let next: number
      if (event.key === 'ArrowDown') next = (index + 1) % options.length
      else if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = options.length - 1
      else if (event.key === 'Tab') { setOpen(false); return }
      else return
      event.preventDefault()
      options[next]?.focus()
    }}>
      {locales.map(option => <button className={`flex min-h-11 w-full cursor-pointer items-center gap-3 px-3 py-2 text-start text-sm hover:bg-paper focus-visible:bg-paper focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2 ${locale === option.id ? 'bg-accent/5 font-medium text-accent' : 'text-ink'}`} type="button" role="menuitemradio" aria-checked={locale === option.id} key={option.id} onClick={() => chooseLocale(option.id)}>
        <img className="h-[18px] w-6 shrink-0 object-cover" src={option.flag} alt="" aria-hidden="true" />
        <span className="flex-1" lang={option.intl} dir={option.direction}>{option.label}</span>
        {locale === option.id && <span aria-hidden="true">✓</span>}
      </button>)}
    </div>}
  </div>
}

export { localizedHead, localeFromMatches } from './locale'
