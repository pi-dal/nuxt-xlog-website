import type { TocItem } from '~/components/Toc.vue'
import { ref } from 'vue'
import { useMarkdown } from '~/logics/markdown'

export function useMarkdownRenderer() {
  const renderedContent = ref('')
  const tocItems = ref<TocItem[]>([])
  const isRendering = ref(false)
  const renderError = ref<string | null>(null)

  const { render } = useMarkdown()

  function parseTocFromHtml(html: string): TocItem[] {
    const contentEl = document.createElement('div')
    contentEl.innerHTML = html

    const headings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const items: TocItem[] = []

    headings.forEach((heading) => {
      // 移除从 markdown-it-anchor 插件来的末尾的 '#'
      const text = (heading.textContent || '').replace(/#\s*$/, '').trim()
      if (text && heading.id) {
        items.push({
          id: heading.id,
          text,
          level: Number.parseInt(heading.tagName.substring(1)),
        })
      }
    })

    return items
  }

  async function renderContent(content: string) {
    if (!content.trim()) {
      renderedContent.value = ''
      tocItems.value = []
      renderError.value = null
      return
    }

    try {
      isRendering.value = true
      renderError.value = null

      const html = await render(content)
      renderedContent.value = html

      // 解析TOC
      tocItems.value = parseTocFromHtml(html)
    }
    catch (err) {
      console.error('Failed to render markdown:', err)
      renderError.value = err instanceof Error ? err.message : String(err)

      // 降级方案：使用简单的换行转换
      renderedContent.value = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')

      // 清空TOC，因为降级方案无法生成有效的TOC
      tocItems.value = []
    }
    finally {
      isRendering.value = false
    }
  }

  function reset() {
    renderedContent.value = ''
    tocItems.value = []
    isRendering.value = false
    renderError.value = null
  }

  return {
    renderedContent: readonly(renderedContent),
    tocItems: readonly(tocItems),
    isRendering: readonly(isRendering),
    renderError: readonly(renderError),
    renderContent,
    reset,
  }
}
