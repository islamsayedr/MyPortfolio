import { createServerFn } from '@tanstack/react-start'
import { getCookie, getRequestHeader, setResponseHeader } from '@tanstack/react-start/server'
import { localeCookie, resolveLocale } from './locale'

export const getLocalization = createServerFn({ method: 'GET' }).handler(() => {
  // HTML depends on a preference cookie/header: never share a cached locale
  // between visitors at the CDN.
  setResponseHeader('Cache-Control', 'private, no-store')
  setResponseHeader('Vary', 'Cookie, Accept-Language')
  return {
    locale: resolveLocale(getCookie(localeCookie), getRequestHeader('accept-language')),
    now: new Date().toISOString(),
  }
})
