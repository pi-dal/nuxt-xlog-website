import MarkdownItShiki from '@shikijs/markdown-it'
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
import MarkdownItKatex from '@traptitech/markdown-it-katex'
import MarkdownIt from 'markdown-it'
// import { rendererRich, transformerTwoslash } from '@shikijs/twoslash' // Temporarily disabled due to client-side loading issues
import anchor from 'markdown-it-anchor'
// @ts-expect-error missing types
import GitHubAlerts from 'markdown-it-github-alerts'
import LinkAttributes from 'markdown-it-link-attributes'
import MarkdownItMagicLink from 'markdown-it-magic-link'
// @ts-expect-error missing types
import TOC from 'markdown-it-table-of-contents'
import { slugify } from '../../scripts/slugify'
import { logger } from './logger'

let mdInstance: MarkdownIt | null = null

/**
 * 转换IPFS URL为HTTP URL
 * ipfs://QmXXX -> https://ipfs.crossbell.io/ipfs/QmXXX
 * ipfs://bafyXXX -> https://ipfs.crossbell.io/ipfs/bafyXXX
 * https://ipfs.io/ipfs/QmXXX -> https://ipfs.crossbell.io/ipfs/QmXXX
 */
function convertIpfsUrls(content: string): string {
  if (!content)
    return content

  let convertedContent = content

  // 转换IPFS协议链接为HTTP链接
  // 支持各种IPFS CID格式：Qm开头的v0格式和bafy/bafk等开头的v1格式
  convertedContent = convertedContent.replace(/ipfs:\/\/([\w-]+)/g, 'https://ipfs.crossbell.io/ipfs/$1')

  // 转换其他IPFS网关为crossbell网关
  // 支持常见的IPFS网关
  const ipfsGateways = [
    'https://ipfs.io/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://cf-ipfs.com/ipfs/',
  ]

  for (const gateway of ipfsGateways) {
    const regex = new RegExp(`${gateway.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([a-zA-Z0-9_-]+)`, 'g')
    convertedContent = convertedContent.replace(regex, 'https://ipfs.crossbell.io/ipfs/$1')
  }

  return convertedContent
}

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

  // 首先添加 LaTeX 数学公式支持 (必须在其他插件之前)
  md.use(MarkdownItKatex, {
    throwOnError: false,
    errorColor: '#cc0000',
    strict: 'ignore',
    trust: (context: any) => context.command !== '\\url',
    displayMode: false,
    fleqn: false,
    leqno: false,
    output: 'html',
    macros: {
      '\\text': '\\textrm',
      '\\RR': '\\mathbb{R}',
      '\\NN': '\\mathbb{N}',
      '\\ZZ': '\\mathbb{Z}',
      '\\QQ': '\\mathbb{Q}',
      '\\CC': '\\mathbb{C}',
    },
  })

  // 添加Shiki代码高亮
  md.use(await MarkdownItShiki({
    themes: {
      dark: 'vitesse-dark',
      light: 'vitesse-light',
    },
    defaultColor: false,
    cssVariablePrefix: '--s-',
    transformers: [
      // transformerTwoslash({ // Temporarily disabled
      //   explicitTrigger: true,
      //   renderer: rendererRich(),
      // }),
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationWordHighlight(),
    ],
  }))

  // 添加锚点链接
  md.use(anchor, {
    slugify,
    permalink: anchor.permalink.linkInsideHeader({
      symbol: '#',
      renderAttrs: () => ({ 'aria-hidden': 'true' }),
    }),
  })

  // 添加外部链接属性
  md.use(LinkAttributes, {
    matcher: (link: string) => /^https?:\/\//.test(link),
    attrs: {
      target: '_blank',
      rel: 'noopener',
    },
  })

  // 添加目录
  md.use(TOC, {
    includeLevel: [1, 2, 3, 4],
    slugify,
    containerHeaderHtml: '<div class="table-of-contents-anchor"><div class="i-ri-menu-2-fill" /></div>',
  })

  // 添加魔法链接
  md.use(MarkdownItMagicLink, {
    linksMap: {
      'RSS3': 'https://rss3.io',
      'NaturalSelectionLabs': 'https://github.com/NaturalSelectionLabs',
      'RSS3-Network': 'https://github.com/RSS3-Network',
      'RSSNext': 'https://github.com/RSSNext',
      'WebisOpen': 'https://github.com/WebisOpen',
      'Web3Insights': 'https://github.com/Web3Insights/Web3Insights',
      'RSSHub': 'https://github.com/DIYgod/RSSHub',
      'Folo': 'https://github.com/RSSNext/Folo',
      'Node': 'https://github.com/RSS3-Network/Node',
    },
    imageOverrides: [
      ['https://github.com/vuejs/core', 'https://vuejs.org/logo.svg'],
      ['https://github.com/nuxt/nuxt', 'https://nuxt.com/assets/design-kit/icon-green.svg'],
      ['https://github.com/vitejs/vite', 'https://vitejs.dev/logo.svg'],
      ['https://nuxtlabs.com', 'https://github.com/nuxtlabs.png'],
      [/opencollective\.com\/vite/, 'https://github.com/vitejs.png'],
      [/opencollective\.com\/elk/, 'https://github.com/elk-zone.png'],
    ],
  })

  // 添加GitHub风格的警告框
  md.use(GitHubAlerts)

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
