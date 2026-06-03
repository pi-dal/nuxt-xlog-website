import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(rel: string) {
  return readFileSync(join(process.cwd(), rel), 'utf8')
}

describe('locale content surfaces', () => {
  it('ships zh/about as a real locale page', () => {
    expect(existsSync(join(process.cwd(), 'pages/zh/about.md'))).toBe(true)
  })

  it('ships zh/books as a real locale collection page', () => {
    expect(existsSync(join(process.cwd(), 'pages/zh/books/index.md'))).toBe(true)
  })

  it('does not keep legacy zh redirects that bounce locale pages back to bare paths', () => {
    const redirects = read('_redirects')

    expect(redirects).not.toContain('/zh/about /about 301')
    expect(redirects).not.toContain('/zh/about/ /about 301')
    expect(redirects).not.toContain('/zh/links /friends 301')
    expect(redirects).not.toContain('/zh/links/ /friends 301')
  })

  it('does not leave obvious English navigation labels hardcoded in NavBar', () => {
    const source = read('src/components/NavBar.vue')

    expect(source).not.toContain('>Blog<')
    expect(source).not.toContain('>Projects<')
    expect(source).not.toContain(`>Let's Chat<`)
    expect(source).not.toContain('title="Books"')
  })

  it('keeps zh home entry links and labels in Chinese', () => {
    const source = read('pages/zh/index.md')

    expect(source).not.toContain('[Photography]')
    expect(source).not.toContain('[posts](')
    expect(source).not.toContain('[books](')
    expect(source).not.toContain('[projects](')
    expect(source).not.toContain('[chat](')
  })

  it('localizes ja chat support call-to-action copy', () => {
    const source = read('pages/ja/chat.md')

    expect(source).not.toContain('<PayMe />')
    expect(source).not.toContain('Support me')
    expect(source).not.toContain('Pay with PayPal')
  })
})
