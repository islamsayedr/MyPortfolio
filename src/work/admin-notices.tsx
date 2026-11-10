import { Link, useRouter } from '@tanstack/react-router'
import { useLocale } from '../localization'
import { backLinkClass, pageHeadingClass, primaryButtonClass } from '../ui'

export function WorkSetupNotice({ setupRequired }: { setupRequired: boolean }) {
  const { t } = useLocale()
  return <div className="border border-accent/20 bg-white p-6" role="alert">
    <p>{t(setupRequired ? 'Apply the work migration to enable project management.' : 'Unable to load projects. Please try again.')}</p>
    {setupRequired && <code className="mt-3 block break-all text-xs" dir="ltr">supabase/migrations/202611100002_work_projects.sql</code>}
  </div>
}

export function WorkProjectNotFound() {
  const { t } = useLocale()
  return <section>
    <h1 className={pageHeadingClass}>{t('Project not found')}</h1>
    <p className="mt-4 text-muted">{t('This project does not exist or is no longer available.')}</p>
    <Link className={backLinkClass} to="/dashboard/work" search={{ page: 0 }}>{t('Back to projects')}</Link>
  </section>
}

export function WorkProjectError() {
  const { t } = useLocale()
  const router = useRouter()
  return <section>
    <h1 className={pageHeadingClass}>{t('Project unavailable')}</h1>
    <p className="my-6 text-muted">{t('Unable to load projects. Please try again.')}</p>
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" className={primaryButtonClass} onClick={() => router.invalidate()}>{t('Try again')}</button>
      <Link className={backLinkClass} to="/dashboard/work" search={{ page: 0 }}>{t('Back to projects')}</Link>
    </div>
  </section>
}
