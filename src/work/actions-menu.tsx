import { Link } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'
import { MenuDotsBold } from 'solar-icon-set'
import { useLocale } from '../localization'
import { focusClass } from '../ui'
import type { WorkRow } from './types'

export function WorkActionsMenu({ project, busy, onDelete }: { project: Pick<WorkRow, 'id' | 'title'>; busy: boolean; onDelete: () => Promise<void> }) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [above, setAbove] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const initialFocus = useRef<'first' | 'last'>('first')
  const menuId = useId()
  const label = t('Actions for {project}', { project: project.title })
  const itemClass = 'flex min-h-11 w-full items-center px-3 py-2 text-start text-sm text-ink hover:bg-paper focus-visible:bg-paper focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2'

  const showMenu = (focus: 'first' | 'last' = 'first') => {
    const bounds = trigger.current?.getBoundingClientRect()
    setAbove(Boolean(bounds && window.innerHeight - bounds.bottom < 148 && bounds.top >= 148))
    initialFocus.current = focus
    setOpen(true)
  }
  const closeMenu = (restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) trigger.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!open) return
    const items = menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)')
    const item = initialFocus.current === 'last' ? items?.[items.length - 1] : items?.[0]
    item?.focus({ preventScroll: true })
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  return <div className="relative shrink-0 self-start" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }} onKeyDown={event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); closeMenu(true) }
    else if (event.key === 'Tab' && open) setOpen(false)
  }}>
    <button ref={trigger} type="button" className={`grid size-8 cursor-pointer place-items-center border border-ink/15 text-muted hover:bg-paper hover:text-accent disabled:cursor-wait disabled:opacity-50 ${focusClass}`} aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} disabled={busy} onClick={() => open ? closeMenu() : showMenu()} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); showMenu(event.key === 'ArrowUp' ? 'last' : 'first') }
    }}><MenuDotsBold size={18} aria-hidden="true" /></button>
    {open && <div ref={menu} id={menuId} role="menu" aria-label={label} className={`absolute end-0 z-20 w-44 border border-ink/10 bg-white p-1 shadow-lg ${above ? 'bottom-full mb-1' : 'top-full mt-1'}`} onKeyDown={event => {
      const items = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? [])
      const index = items.indexOf(document.activeElement as HTMLElement)
      let next: number
      if (event.key === 'ArrowDown') next = (index + 1) % items.length
      else if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = items.length - 1
      else return
      event.preventDefault(); items[next]?.focus({ preventScroll: true })
    }}>
      <Link className={itemClass} role="menuitem" tabIndex={-1} to="/dashboard/work/$projectid" params={{ projectid: project.id }} onClick={() => closeMenu()}>{t('Preview')}</Link>
      <Link className={itemClass} role="menuitem" tabIndex={-1} to="/dashboard/work/$projectid/edit" params={{ projectid: project.id }} onClick={() => closeMenu()}>{t('Edit')}</Link>
      <button className={`${itemClass} cursor-pointer !text-accent disabled:opacity-50`} type="button" role="menuitem" tabIndex={-1} disabled={busy} onClick={async () => { closeMenu(true); await onDelete() }}>{t('Delete')}</button>
    </div>}
  </div>
}
