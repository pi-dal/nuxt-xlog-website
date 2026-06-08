export function isContentType(value) {
    return ['book', 'chat', 'page', 'post', 'project'].includes((value || '').toLowerCase());
}
export function normalizeContentType(value) {
    const normalized = value?.trim().toLowerCase();
    if (!normalized || !isContentType(normalized))
        throw new Error(`Unsupported content type: ${value || '<empty>'}`);
    return normalized;
}
