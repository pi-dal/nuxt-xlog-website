export interface CopyTextOptions {
  text?: string
  fallbackText?: string
  slice?: [number, number]
}

export interface ParsedGitHubRepo {
  owner: string
  name: string
  repo: string
}

export function isExternalLink(to: string): boolean {
  return /^https?:\/\//.test(to)
}

export function buildYouTubeEmbedSrc(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`
}

export function buildBilibiliEmbedSrc(bvid: string, page = 1): string {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${safePage}`
}

export function getCopyText(options: CopyTextOptions): string {
  const source = (options.text ?? options.fallbackText ?? '').trim()
  if (!source)
    return ''
  return options.slice ? source.slice(...options.slice) : source
}

export function parseGitHubRepo(repo: string): ParsedGitHubRepo {
  const normalized = repo.trim().replace(/^\/+|\/+$/g, '')
  const matched = normalized.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (!matched)
    throw new Error('GitHub repo must be in "owner/repo" format')

  const [, owner, name] = matched
  return {
    owner,
    name,
    repo: `${owner}/${name}`,
  }
}

export function buildGitHubRepoHref(repo: string): string {
  return `https://github.com/${parseGitHubRepo(repo).repo}`
}
