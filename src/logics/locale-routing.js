export const supportedLocales = ['zh', 'en', 'ja']

export function buildLocaleNavigation({ currentFullPath, labels, routeExists }) {
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

export function getLocaleFromPath(path) {
  const locale = path.split(/[?#]/, 1)[0].split('/').filter(Boolean)[0]
  return supportedLocales.includes(locale)
    ? locale
    : null
}

export function buildLocaleCookie(path) {
  const locale = getLocaleFromPath(path)
  return locale
    ? `locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`
    : null
}

export function hasConcreteRoute(resolution) {
  return resolution.matched.some(record => record.name !== '/[...404]')
}

export function getLocaleFromCookie(cookie) {
  const locale = cookie.match(/(?:^|;\s*)locale=([^;]+)/)?.[1]
  return locale && supportedLocales.includes(locale)
    ? locale
    : null
}

export function localizeBareEntryPath(path, locale) {
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : path
  const isCollectionPath = /^\/(?:posts|books)(?:\/|$)/.test(normalizedPath)
  const isEntryPath = ['/', '/projects', '/chat', '/about', '/friends'].includes(normalizedPath)

  if (!isCollectionPath && !isEntryPath)
    return null

  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`
}
