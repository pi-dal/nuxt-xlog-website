// Note: preset-web-fonts/local may fetch fonts at build time.
// To avoid network timeouts in CI/SSG builds, we allow disabling via NO_WEBFONT_FETCH=1
// and rely on locally bundled fonts + system fallbacks.
// import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
} from 'unocss'

const enableWebFonts = process.env.NO_WEBFONT_FETCH !== '1'
const webFontPresets = enableWebFonts
  ? [
      presetWebFonts({
        fonts: {
          sans: 'Inter',
          mono: 'DM Mono',
          condensed: 'Roboto Condensed',
          wisper: 'Bad Script',
        },
        // processors: createLocalFontProcessor(),
      }),
    ]
  : []

export default defineConfig({
  theme: {
    fontFamily: {
      // Keep class mappings consistent even if webfonts preset is disabled
      sans: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji',
      mono: 'DM Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
      condensed: 'Roboto Condensed, Inter, system-ui, sans-serif',
      wisper: 'Bad Script, Inter, system-ui, sans-serif',
    },
  },
  shortcuts: [
    {
      'bg-base': 'bg-white dark:bg-black',
      'color-base': 'text-black dark:text-white',
      'border-base': 'border-[#8884]',
    },
    [/^btn-(\w+)$/, ([_, color]) => `op50 px2.5 py1 transition-all duration-200 ease-out no-underline! hover:(op100 text-${color} bg-${color}/10) border border-base! rounded`],
  ],
  rules: [
    [/^slide-enter-(\d+)$/, ([_, n]) => ({
      '--enter-stage': n,
    })],
  ],
  presets: [
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetAttributify(),
    presetWind3(),
    ...webFontPresets,
  ],
  transformers: [
    transformerDirectives(),
  ],
  safelist: [
    'i-ri-menu-2-fill',
  ],
})
