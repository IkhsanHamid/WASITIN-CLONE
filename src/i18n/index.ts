import { AsyncLocalStorage } from 'async_hooks'
import idMessages from './id'
import enMessages from './en'

const catalogs: Record<string, Record<string, string>> = {
  id: idMessages,
  en: enMessages
}

const availableLocales = Object.keys(catalogs)
const defaultLocale = 'id'

const localeStore = new AsyncLocalStorage<string>()

export function getLocale (): string {
  return localeStore.getStore() ?? defaultLocale
}

export function setLocaleForRequest (locale: string): void {
  // called by middleware — don't need to return anything
}

export function runWithLocale (locale: string, fn: () => void): void {
  localeStore.run(locale, fn)
}

export function resolveLocale (raw?: string): string {
  if (!raw) return defaultLocale
  const lang = raw.split('-')[0].toLowerCase()
  return availableLocales.includes(lang) ? lang : defaultLocale
}

type Params = Record<string, string | number>

export function t (key: string, params?: Params, localeOverride?: string): string {
  const locale = localeOverride ?? getLocale()
  const catalog = catalogs[locale] ?? catalogs[defaultLocale]
  let message = catalog[key]

  if (!message) {
    // fallback: try default locale
    message = catalogs[defaultLocale][key]
  }

  if (!message) {
    return key
  }

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      message = message.split(`{${k}}`).join(String(v))
    }
  }

  return message
}

export const supportedLocales = availableLocales
