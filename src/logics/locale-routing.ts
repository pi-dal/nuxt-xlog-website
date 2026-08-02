export const supportedLocales = ['zh', 'en', 'ja'] as const

export type SupportedLocale = typeof supportedLocales[number]

interface BuildLocaleNavigationOptions<T extends string> {
  currentFullPath: string
  labels: Record<SupportedLocale, T>
  routeExists: (path: string) => boolean
}

interface RouteResolution {
  matched: Array<{ name?: unknown }>
}

export function buildLocaleNavigation<T extends string>({
  currentFullPath,
  labels,
  routeExists,
}: BuildLocaleNavigationOptions<T>) {
  const suffixIndex = currentFullPath.search(/[?#]/)
  const path = suffixIndex === -1 ? currentFullPath : currentFullPath.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? '' : currentFullPath.slice(suffixIndex)
  const currentLocale = getLocaleFromPath(path) ?? 'zh'
  const localePrefix = /^\/(?:zh|en|ja)(?=\/|$)/

  return supportedLocales
    .map((locale) => {
      const localizedPath = localePrefix.test(path)
        ? path.replace(localePrefix, `/${locale}`)
        : `/${locale}${path === '/' ? '' : path}`

      return {
        active: locale === currentLocale,
        label: labels[locale],
        locale,
        path: localizedPath,
        to: `${localizedPath}${suffix}`,
      }
    })
    .filter(item => routeExists(item.path))
    .map(({ path: _path, ...item }) => item)
}

export function getLocaleFromPath(path: string): SupportedLocale | null {
  const locale = path.split(/[?#]/, 1)[0].split('/').filter(Boolean)[0]
  return supportedLocales.includes(locale as SupportedLocale)
    ? locale as SupportedLocale
    : null
}

export function buildLocaleCookie(path: string): string | null {
  const locale = getLocaleFromPath(path)
  return locale
    ? `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
    : null
}

export function hasConcreteRoute(resolution: RouteResolution): boolean {
  return resolution.matched.some(record => record.name !== '/[...404]')
}

export function getLocaleFromCookie(cookie: string): SupportedLocale | null {
  const locale = cookie.match(/(?:^|;\s*)locale=([^;]+)/)?.[1]
  return locale && supportedLocales.includes(locale as SupportedLocale)
    ? locale as SupportedLocale
    : null
}

export function localizeBareEntryPath(path: string, locale: SupportedLocale): string | null {
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : path
  const isCollectionPath = /^\/(?:posts|books)(?:\/|$)/.test(normalizedPath)
  const isEntryPath = ['/', '/projects', '/chat', '/about', '/friends'].includes(normalizedPath)

  if (!isCollectionPath && !isEntryPath)
    return null

  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`
}
