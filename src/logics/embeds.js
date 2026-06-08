export function isExternalLink(to) {
    return /^https?:\/\//.test(to);
}
export function buildYouTubeEmbedSrc(id) {
    return `https://www.youtube-nocookie.com/embed/${id}`;
}
export function buildBilibiliEmbedSrc(bvid, page = 1) {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${safePage}`;
}
export function getCopyText(options) {
    const source = (options.text ?? options.fallbackText ?? '').trim();
    if (!source)
        return '';
    return options.slice ? source.slice(...options.slice) : source;
}
export function parseGitHubRepo(repo) {
    const normalized = repo.trim().replace(/^\/+|\/+$/g, '');
    const matched = normalized.match(/^([^/\s]+)\/([^/\s]+)$/);
    if (!matched)
        throw new Error('GitHub repo must be in "owner/repo" format');
    const [, owner, name] = matched;
    return {
        owner,
        name,
        repo: `${owner}/${name}`,
    };
}
export function buildGitHubRepoHref(repo) {
    return `https://github.com/${parseGitHubRepo(repo).repo}`;
}
