import { arabic, regional } from './messages'

export const locales = [
  { id: 'en-US', intl: 'en-US', flag: '/icons/flags/us.svg', label: 'English (US)', direction: 'ltr' },
  { id: 'en-UK', intl: 'en-GB', flag: '/icons/flags/gb.svg', label: 'English (UK)', direction: 'ltr' },
  { id: 'en-AU', intl: 'en-AU', flag: '/icons/flags/au.svg', label: 'English (AU)', direction: 'ltr' },
  { id: 'ar-EG', intl: 'ar-EG', flag: '/icons/flags/eg.svg', label: 'العربية (مصر)', direction: 'rtl' },
  { id: 'ar-KSA', intl: 'ar-SA', flag: '/icons/flags/sa.svg', label: 'العربية (السعودية)', direction: 'rtl' },
] as const

export type Locale = typeof locales[number]['id']
export type LocalizationState = { locale: Locale; now: string }
export const localeCookie = 'portfolio_locale'

export function normalizeLocale(value?: string): Locale | undefined {
  const lower = value?.toLowerCase()
  if (lower === 'en-gb') return 'en-UK'
  if (lower === 'ar-sa') return 'ar-KSA'
  return locales.find(item => item.id.toLowerCase() === lower)?.id
}

export function resolveLocale(cookie?: string, acceptLanguage = ''): Locale {
  const saved = normalizeLocale(cookie)
  if (saved) return saved
  const preferences = acceptLanguage.split(',').map((entry, index) => {
    const [language, ...parameters] = entry.trim().split(';')
    const weight = parameters.find(value => value.trim().startsWith('q='))?.trim().slice(2)
    return { language, quality: weight === undefined ? 1 : Number(weight), index }
  }).filter(item => Number.isFinite(item.quality) && item.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
  for (const { language } of preferences) {
    const exact = normalizeLocale(language)
    if (exact) return exact
    if (language === 'ar' || language.startsWith('ar-')) return 'ar-EG'
    if (language === 'en' || language.startsWith('en-')) return 'en-US'
  }
  return 'en-US'
}

export function localeInfo(locale: Locale) {
  return locales.find(item => item.id === locale)!
}

export function translate(locale: Locale, message: string, values: Record<string, string | number> = {}) {
  const template = regional[locale]?.[message] ?? (locale.startsWith('ar') ? arabic[message] : undefined) ?? message
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) => String(values[key] ?? placeholder))
}

export function localeFromMatches(matches: ReadonlyArray<{ loaderData?: unknown }>): Locale {
  for (const match of matches) {
    const data = match.loaderData
    if (data && typeof data === 'object' && 'locale' in data && typeof data.locale === 'string') {
      const locale = normalizeLocale(data.locale)
      if (locale) return locale
    }
  }
  return 'en-US'
}

export function localizedHead(locale: Locale = 'en-US', title = 'Product Designer', description = 'The portfolio of Islam Sayed, a product designer based in Egypt.') {
  return { meta: [
    { title: `${translate(locale, title)} | ${translate(locale, 'Islam Sayed')}` },
    { name: 'description', content: translate(locale, description) },
  ] }
}
