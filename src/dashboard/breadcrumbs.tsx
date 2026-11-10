import { Link, useMatches } from '@tanstack/react-router'
import { AltArrowRightLinear } from 'solar-icon-set'
import { useLocale } from '../localization'
import { focusClass } from '../ui'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    breadcrumb?: string
    breadcrumbProject?: boolean
  }
}

export function DashboardBreadcrumbs() {
  const matches = useMatches()
  const { t } = useLocale()
  const items = matches.flatMap(match => {
    if (!match.staticData.breadcrumb) return []
    const data = match.loaderData as { title?: unknown } | null | undefined
    const title = match.staticData.breadcrumbProject && typeof data?.title === 'string' ? data.title : null
    return [{ pathname: match.pathname, label: title ?? t(match.staticData.breadcrumb) }]
  })
  const currentPath = items.at(-1)?.pathname.replace(/\/+$/, '')
  return <nav className="min-w-0 border-b border-ink/10 bg-[#e3e3e3] pt-[env(safe-area-inset-top,0px)]" aria-label={t('Breadcrumb')}>
    <div className="mx-auto flex min-h-10 max-w-[1440px] items-center px-4 py-2 md:px-6">
    <ol className="flex min-w-0 list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0 text-xs text-muted">
      {items.map((item, index) => <li className="flex min-w-0 max-w-full items-center gap-1.5" key={`${item.pathname}-${index}`}>
        {index > 0 && <AltArrowRightLinear size={12} className="shrink-0 rtl:rotate-180" aria-hidden="true" />}
        {index === items.length - 1
          ? <span className="max-w-48 truncate font-medium text-ink md:max-w-80" aria-current="page" title={item.label}>{item.label}</span>
          : item.pathname.replace(/\/+$/, '') === currentPath
            ? <span className="max-w-48 truncate md:max-w-80" title={item.label}>{item.label}</span>
            : <Link className={`max-w-48 truncate hover:text-accent md:max-w-80 ${focusClass}`} to={item.pathname} activeOptions={{ exact: true }} title={item.label}>{item.label}</Link>}
      </li>)}
    </ol>
    </div>
  </nav>
}
