import { dirname, join, resolve as resolvePath } from 'node:path'
import fs from 'fs-extra'
import satori from 'satori'
import sharp from 'sharp'

type SatoriFont = NonNullable<Parameters<typeof satori>[1]['fonts']>[number]

interface OGImageOptions {
  title: string
  author?: string
  website?: string
}

function createFontOptions(fonts: Array<{ data: Buffer | null, weight: SatoriFont['weight'] }>): SatoriFont[] {
  return fonts.flatMap(font => font.data
    ? [{ name: 'Noto Sans SC', data: font.data, style: 'normal' as const, weight: font.weight }]
    : [])
}

const LOCAL_FONT_DIR = resolvePath(process.cwd(), 'public', 'assets', 'fonts')
const FONT_URLS = {
  regular: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400&display=swap',
  bold: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700&display=swap',
} as const
const ALLOW_REMOTE_FONT_FETCH = process.env.NO_WEBFONT_FETCH !== '1'
const SYSTEM_FONT_FALLBACKS = [
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  '/System/Library/Fonts/Hiragino Sans GB.ttc',
  '/System/Library/Fonts/STHeiti Light.ttc',
  '/System/Library/Fonts/STHeiti Medium.ttc',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
] as const

const localFontCache = new Map<string, Buffer | null>()
const remoteFontCache = new Map<string, Buffer>()

export function isSupportedFontData(buffer: Buffer): boolean {
  if (buffer.length < 4)
    return false

  const signature = buffer.subarray(0, 4).toString('ascii')
  return signature !== 'wOFF' && signature !== 'wOF2'
}

export async function readFirstCompatibleFont(paths: string[]): Promise<Buffer | null> {
  for (const fontPath of paths) {
    if (!await fs.pathExists(fontPath))
      continue

    const buffer = await fs.readFile(fontPath)
    if (isSupportedFontData(buffer))
      return buffer
  }

  return null
}

async function loadLocalFont(key: string, filenames: string[]): Promise<Buffer | null> {
  if (localFontCache.has(key))
    return localFontCache.get(key) ?? null

  const buffer = await readFirstCompatibleFont(filenames.map(filename => join(LOCAL_FONT_DIR, filename)))
  localFontCache.set(key, buffer)
  return buffer
}

async function loadSystemFontFallback(): Promise<Buffer | null> {
  if (localFontCache.has('system-fallback'))
    return localFontCache.get('system-fallback') ?? null

  const buffer = await readFirstCompatibleFont([...SYSTEM_FONT_FALLBACKS])
  localFontCache.set('system-fallback', buffer)
  return buffer
}

async function withTimeout<T>(runner: (signal: AbortSignal) => Promise<T>, ms = 8000): Promise<T> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), ms)
  try {
    return await runner(ac.signal)
  }
  finally {
    clearTimeout(timer)
  }
}

async function fetchFontFromGoogle(fontUrl: string): Promise<Buffer> {
  if (remoteFontCache.has(fontUrl))
    return remoteFontCache.get(fontUrl)!

  const cssResponse = await withTimeout(signal => fetch(fontUrl, { signal }))
  const css = await cssResponse.text()
  const woff2Match = css.match(/url\(([^)]+\.woff2)\)/)
  const anyUrlMatch = css.match(/url\(([^)]+)\)/)
  const fontFileUrl = (woff2Match?.[1] || anyUrlMatch?.[1])?.replace(/^["']|["']$/g, '')

  if (!fontFileUrl)
    throw new Error('Unable to resolve font file URL from Google Fonts CSS')

  const fontResponse = await withTimeout(signal => fetch(fontFileUrl, { signal }))
  const buf = Buffer.from(await fontResponse.arrayBuffer())
  if (!isSupportedFontData(buf))
    throw new Error(`Unsupported remote font format for ${fontUrl}`)
  remoteFontCache.set(fontUrl, buf)
  return buf
}

export async function generateOGImage(options: OGImageOptions, outputPath: string) {
  const { title, author = 'pi-dal' } = options
  // Prefer local fonts first to avoid network dependency; fall back to remote or generic
  let notoSansRegular: Buffer | null = await loadLocalFont('noto-regular', [
    'NotoSansSC-Regular.woff2',
    'NotoSansSC-Regular.ttf',
    'NotoSansSC-Regular.otf',
  ])
  let notoSansBold: Buffer | null = await loadLocalFont('noto-bold', [
    'NotoSansSC-Bold.woff2',
    'NotoSansSC-Bold.ttf',
    'NotoSansSC-Bold.otf',
  ])

  const missingVariants: Array<{ variant: keyof typeof FONT_URLS, assign: (buf: Buffer) => void }> = []
  if (!notoSansRegular) {
    missingVariants.push({
      variant: 'regular',
      assign(buf) {
        notoSansRegular = buf
        localFontCache.set('noto-regular', buf)
      },
    })
  }
  if (!notoSansBold) {
    missingVariants.push({
      variant: 'bold',
      assign(buf) {
        notoSansBold = buf
        localFontCache.set('noto-bold', buf)
      },
    })
  }

  if (missingVariants.length && ALLOW_REMOTE_FONT_FETCH) {
    const fetchResults = await Promise.allSettled(
      missingVariants.map(({ variant }) => fetchFontFromGoogle(FONT_URLS[variant])),
    )

    fetchResults.forEach((result, index) => {
      if (result.status === 'fulfilled')
        missingVariants[index].assign(result.value)
    })

    const rejected = fetchResults.filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    if (rejected.length) {
      const lastError = rejected[rejected.length - 1]?.reason
      const systemFallback = await loadSystemFontFallback()
      if (systemFallback) {
        if (!notoSansRegular) {
          notoSansRegular = systemFallback
          localFontCache.set('noto-regular', systemFallback)
        }
        if (!notoSansBold) {
          notoSansBold = systemFallback
          localFontCache.set('noto-bold', systemFallback)
        }
        console.warn('[og] Falling back to a compatible system font; Noto Sans SC unavailable', lastError)
      }
      else {
        notoSansRegular = null
        notoSansBold = null
        console.warn('[og] Proceeding without embedded fonts due to fetch failure', lastError)
      }
    }
  }
  else if (missingVariants.length) {
    const systemFallback = await loadSystemFontFallback()
    if (systemFallback) {
      if (!notoSansRegular) {
        notoSansRegular = systemFallback
        localFontCache.set('noto-regular', systemFallback)
      }
      if (!notoSansBold) {
        notoSansBold = systemFallback
        localFontCache.set('noto-bold', systemFallback)
      }
      console.warn('[og] Using a compatible system font because remote font fetch is disabled')
    }
    else {
      console.warn('[og] Proceeding without embedded fonts because remote font fetch is disabled and no compatible local fallback was found')
    }
  }

  // Create SVG using Satori
  const render = async () => satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#0f1115',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Simple decorative corner blocks (avoid unsupported filters)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                width: '420px',
                height: '420px',
                borderRadius: '50%',
                background: '#1b2030',
                top: '-120px',
                right: '-80px',
                opacity: 0.35,
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                width: '520px',
                height: '520px',
                borderRadius: '50%',
                background: '#251a1a',
                bottom: '-180px',
                left: '-120px',
                opacity: 0.3,
              },
            },
          },
          // Content container
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
                padding: '80px',
                zIndex: '10',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'Noto Sans SC, Inter, system-ui, sans-serif',
                            fontSize: '36px',
                            color: '#9aa4af',
                            marginBottom: '5px',
                          },
                          children: author,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'Noto Sans SC, Inter, system-ui, sans-serif',
                            fontSize: '56px',
                            color: '#ffffff',
                            lineHeight: 1.2,
                            maxWidth: '900px',
                          },
                          children: title,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '60px',
                right: '80px',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '40px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontFamily: 'Noto Sans SC, Inter, system-ui, sans-serif',
                fontSize: '22px',
                color: '#ffffff',
                letterSpacing: '0.3px',
              },
              children: 'Ideas • Code • Photos',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: createFontOptions([
        { data: notoSansRegular, weight: 400 },
        { data: notoSansBold, weight: 700 },
      ]),
    },
  )

  let svg: string
  try {
    svg = await render()
  }
  catch (error) {
    // Fallback to a minimal layout if Satori rejects some styles
    console.warn('[og] Satori failed with complex layout; retrying with minimal layout:', error)
    svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#0f1115',
            padding: '80px',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'Noto Sans SC, Inter, system-ui, sans-serif',
                  fontSize: '36px',
                  color: '#9aa4af',
                  marginBottom: '12px',
                },
                children: author,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'Noto Sans SC, Inter, system-ui, sans-serif',
                  fontSize: '56px',
                  color: '#ffffff',
                  lineHeight: 1.2,
                  maxWidth: '900px',
                },
                children: title,
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: createFontOptions([
          { data: notoSansRegular, weight: 400 },
          { data: notoSansBold, weight: 700 },
        ]),
      },
    )
  }

  // Ensure output directory exists
  await fs.ensureDir(dirname(outputPath))

  // Convert SVG to PNG using Sharp
  const png = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  // Write to file
  await fs.writeFile(outputPath, png)
}
