import MarkdownIt from 'markdown-it'
import { logger } from './logger'
import { applyMarkdownPipeline, convertIpfsUrls } from './markdown-pipeline'

let mdInstance: MarkdownIt | null = null

export async function createMarkdownRenderer(): Promise<MarkdownIt> {
  if (mdInstance) {
    return mdInstance
  }

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    quotes: '""\'\'',
  })

  await applyMarkdownPipeline(md)

  mdInstance = md
  return md
}

export async function renderMarkdown(content: string): Promise<string> {
  if (!content)
    return ''

  try {
    // 首先转换IPFS URL
    const convertedContent = convertIpfsUrls(content)

    const md = await createMarkdownRenderer()
    return md.render(convertedContent)
  }
  catch (error) {
    logger.error('Failed to render markdown:', { error, content: content.slice(0, 100) }, 'MARKDOWN')
    // 失败时返回原始内容，用简单的换行处理
    return content.replace(/\n/g, '<br>')
  }
}

// Composable for use in Vue components
export function useMarkdown() {
  const render = async (content: string) => {
    return await renderMarkdown(content)
  }

  return {
    render,
  }
}
