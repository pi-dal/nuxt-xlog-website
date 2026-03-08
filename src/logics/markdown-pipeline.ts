import MarkdownItShiki from '@shikijs/markdown-it'
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash'
import MarkdownItKatex from '@traptitech/markdown-it-katex'
import anchor from 'markdown-it-anchor'
// @ts-expect-error missing types
import GitHubAlerts from 'markdown-it-github-alerts'
import LinkAttributes from 'markdown-it-link-attributes'
import MarkdownItMagicLink from 'markdown-it-magic-link'
// @ts-expect-error missing types
import TOC from 'markdown-it-table-of-contents'
import { slugify } from '../../scripts/slugify'

export interface MarkdownPipelineOptions {
  enableTwoslash?: boolean
}

interface MarkdownPipelineTarget {
  use: (plugin: any, ...args: any[]) => unknown
}

export function convertIpfsUrls(content: string): string {
  if (!content)
    return content

  let convertedContent = content

  convertedContent = convertedContent.replace(/ipfs:\/\/([\w-]+)/g, 'https://ipfs.crossbell.io/ipfs/$1')

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

export function buildMarkdownPipelineConfig(options: MarkdownPipelineOptions = {}) {
  const transformers = [
    ...(options.enableTwoslash
      ? [transformerTwoslash({
          explicitTrigger: true,
          renderer: rendererRich(),
        })]
      : []),
    transformerNotationDiff(),
    transformerNotationHighlight(),
    transformerNotationWordHighlight(),
  ]

  return {
    anchor: {
      permalink: anchor.permalink.linkInsideHeader({
        symbol: '#',
        renderAttrs: () => ({ 'aria-hidden': 'true' }),
      }),
      slugify,
    },
    katex: {
      displayMode: false,
      errorColor: '#cc0000',
      fleqn: false,
      leqno: false,
      macros: {
        '\\CC': '\\mathbb{C}',
        '\\NN': '\\mathbb{N}',
        '\\QQ': '\\mathbb{Q}',
        '\\RR': '\\mathbb{R}',
        '\\ZZ': '\\mathbb{Z}',
        '\\text': '\\textrm',
      },
      output: 'html' as const,
      strict: 'ignore' as const,
      throwOnError: false,
      trust: (context: { command: string }) => context.command !== '\\url',
    },
    linkAttributes: {
      attrs: {
        rel: 'noopener',
        target: '_blank',
      },
      matcher: (link: string) => /^https?:\/\//.test(link),
    },
    magicLink: {
      imageOverrides: [
        ['https://github.com/vuejs/core', 'https://vuejs.org/logo.svg'],
        ['https://github.com/nuxt/nuxt', 'https://nuxt.com/assets/design-kit/icon-green.svg'],
        ['https://github.com/vitejs/vite', 'https://vitejs.dev/logo.svg'],
        ['https://nuxtlabs.com', 'https://github.com/nuxtlabs.png'],
        [/opencollective\.com\/vite/, 'https://github.com/vitejs.png'],
        [/opencollective\.com\/elk/, 'https://github.com/elk-zone.png'],
      ],
      linksMap: {
        'Folo': 'https://github.com/RSSNext/Folo',
        'NaturalSelectionLabs': 'https://github.com/NaturalSelectionLabs',
        'Node': 'https://github.com/RSS3-Network/Node',
        'RSS3': 'https://rss3.io',
        'RSS3-Network': 'https://github.com/RSS3-Network',
        'RSSHub': 'https://github.com/DIYgod/RSSHub',
        'RSSNext': 'https://github.com/RSSNext',
        'Web3Insights': 'https://github.com/Web3Insights/Web3Insights',
        'WebisOpen': 'https://github.com/WebisOpen',
      },
    },
    markdownItOptions: {
      quotes: '""\'\'',
    },
    shiki: {
      cssVariablePrefix: '--s-',
      defaultColor: false as const,
      themes: {
        dark: 'vitesse-dark',
        light: 'vitesse-light',
      },
      transformers,
    },
    toc: {
      containerHeaderHtml: '<div class="table-of-contents-anchor"><div class="i-ri-menu-2-fill" /></div>',
      includeLevel: [1, 2, 3, 4],
      slugify,
    },
  }
}

export async function applyMarkdownPipeline(md: MarkdownPipelineTarget, options: MarkdownPipelineOptions = {}) {
  const config = buildMarkdownPipelineConfig(options)

  md.use(MarkdownItKatex, config.katex)
  md.use(await MarkdownItShiki(config.shiki))
  md.use(anchor, config.anchor)
  md.use(LinkAttributes, config.linkAttributes)
  md.use(TOC, config.toc)
  md.use(MarkdownItMagicLink, config.magicLink)
  md.use(GitHubAlerts)
}
