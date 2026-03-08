import { basename, resolve } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import fs from 'fs-extra'
import matter from 'gray-matter'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Exclude from 'vite-plugin-optimize-exclude'
import SVG from 'vite-svg-loader'
import { generateOGImage } from './scripts/og'
import { resolveRoutePathOverride } from './src/logics/content-route-path'
import { applyMarkdownPipeline } from './src/logics/markdown-pipeline'
import { resolveMarkdownWrapperClasses, resolveMarkdownWrapperComponent } from './src/logics/markdown-wrapper'

const promises: Promise<any>[] = []
const SITE_URL = (process.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'https://pi-dal.com').replace(/\/+$/, '')

export default defineConfig({
  assetsInclude: ['**/*.heic', '**/*.HEIC'],
  resolve: {
    alias: [
      { find: '~/', replacement: `${resolve(__dirname, 'src')}/` },
    ],
  },
  server: {
    proxy: {
      '/api/creem': {
        target: 'https://api.creem.io/v1',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/creem/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            const apiKey = process.env.CREEM_API_KEY
            if (!apiKey)
              return
            proxyReq.setHeader('x-api-key', apiKey)
          })
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      'dayjs',
      'dayjs/plugin/localizedFormat',
    ],
    exclude: [
    ],
  },
  define: {
    global: 'globalThis',
  },
  plugins: [
    UnoCSS(),

    VueRouter({
      extensions: ['.vue', '.md'],
      routesFolder: 'pages',
      // logs: true,
      extendRoute(route) {
        const path = route.components.get('default')
        if (!path)
          return

        if (!path.includes('projects.md') && path.endsWith('.md')) {
          const { data } = matter(fs.readFileSync(path, 'utf-8'))
          const routePathOverride = resolveRoutePathOverride({
            filePath: path,
            frontmatter: data,
            rootDir: __dirname,
          })
          if (routePathOverride)
            route.path = routePathOverride
          route.addToMeta({
            frontmatter: data,
          })
        }
      },
    }),

    Vue({
      include: [/\.vue$/, /\.md$/],
    }),

    Markdown({
      wrapperComponent: resolveMarkdownWrapperComponent,
      wrapperClasses: resolveMarkdownWrapperClasses,
      headEnabled: true,
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      markdownItOptions: {
        quotes: '""\'\'',
      },
      async markdownItSetup(md) {
        await applyMarkdownPipeline(md, { enableTwoslash: true })
      },
      frontmatterPreprocess(frontmatter, options, id, defaults) {
        (() => {
          if (!id.endsWith('.md'))
            return
          const route = basename(id, '.md')
          const slug = typeof frontmatter.slug === 'string' && frontmatter.slug.trim()
            ? frontmatter.slug.trim()
            : route
          if (!slug || frontmatter.image || !frontmatter.title)
            return
          const path = `og/${slug}.png`
          const task = fs.existsSync(`${id.slice(0, -3)}.png`)
            ? fs.copy(`${id.slice(0, -3)}.png`, `public/${path}`)
            : generateOg(frontmatter.title!.trim(), `public/${path}`)
          // Ensure OG generation failures don't break the entire build
          promises.push(task.catch((err) => {
            console.warn(`[og] Failed to generate ${path}:`, err)
          }))
          frontmatter.image = `${SITE_URL}/${path}`
        })()
        const head = defaults(frontmatter, options)
        return { head, frontmatter }
      },
    }),

    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        '@vueuse/core',
      ],
    }),

    Components({
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
    }),

    Inspect(),

    Icons({
      defaultClass: 'inline',
      defaultStyle: 'vertical-align: sub;',
    }),

    SVG({
      svgo: false,
      defaultImport: 'url',
    }),

    Exclude(),

    {
      name: 'await',
      async closeBundle() {
        await Promise.all(promises)
      },
    },
  ],

  build: {
    rollupOptions: {
      onwarn(warning, next) {
        if (warning.code !== 'UNUSED_EXTERNAL_IMPORT')
          next(warning)
      },
    },
  },

  ssgOptions: {
    formatting: 'minify',
  },
})

async function generateOg(title: string, output: string) {
  if (fs.existsSync(output))
    return

  await generateOGImage({ title }, output)
}
