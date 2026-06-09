import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(rel: string) {
  return readFileSync(join(process.cwd(), rel), 'utf8')
}

describe('content regressions', () => {
  it('keeps STR scattering display math blocks separated from surrounding prose', () => {
    const source = read('src/content/chunked-posts/STR-Four-Vector-Basic-Transformation/05-applications-scattering.md')

    expect(source).not.toContain('$$即是')
    expect(source).toContain('$$P_1 \\circ P_3 + P_2 \\circ P_3 = P_3 \\circ P_3 + P_4 \\circ P_3 = P_1 \\circ P_2$$')
    expect(source).toContain('若 $v$ 接近于 $c$，会有')
  })

  it('does not leave raw spaces in local article asset image urls', () => {
    const source = read('pages/posts/ArozOS-RPI-Tutorial.md')

    expect(source).not.toMatch(/!\[[^\]]*\]\(\/article-assets\/ArozOS-RPI-Tutorial\/[^\n )]* [^\n)]*\)/)
    expect(source).not.toMatch(/src="\/article-assets\/ArozOS-RPI-Tutorial\/[^\n "]* [^\n"]*"/)
    expect(source).toContain('/article-assets/ArozOS-RPI-Tutorial/Untitled%206.png')
  })
})
