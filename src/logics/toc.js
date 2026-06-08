export function extractTocItems(headings) {
    const items = [];
    for (const heading of Array.from(headings)) {
        const text = (heading.textContent || '').replace(/#\s*$/, '').trim();
        const level = Number.parseInt(heading.tagName.replace(/^H/i, ''), 10);
        if (!heading.id || !text || Number.isNaN(level))
            continue;
        items.push({
            id: heading.id,
            text,
            level,
        });
    }
    return items;
}
