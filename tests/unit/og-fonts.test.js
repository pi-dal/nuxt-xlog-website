import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { buildOgManifestSignature, generateOGImage } from '../../scripts/og'

describe('og generation', () => {
  it('exports generateOGImage function', () => {
    expect(typeof generateOGImage).toBe('function')
  })
  it('keeps the OG text stack centered on the canvas', async () => {
    const template = await readFile(new URL('../../scripts/og-template.svg', import.meta.url), 'utf8')
    const authorText = template.match(/<text[^>]*font-size="34"[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*text-anchor="([^"]+)"[^>]*>\{\{author\}\}<\/text>/)
    const titleLine1 = template.match(/<text[^>]*font-size="52"[^>]*x="([^"]+)"[^>]*text-anchor="([^"]+)"[^>]*>\{\{title1\}\}<\/text>/)
    const titleLine2 = template.match(/<text[^>]*font-size="52"[^>]*x="([^"]+)"[^>]*text-anchor="([^"]+)"[^>]*>\{\{title2\}\}<\/text>/)
    const tagPill = template.match(/<rect[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*width="([^"]+)"[^>]*height="44"[^>]*rx="22"/)
    const tagText = template.match(/<text[^>]*font-size="20"[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*text-anchor="([^"]+)"[^>]*>Ideas &#xB7; Code &#xB7; Photos<\/text>/)
    expect(authorText).not.toBeNull()
    expect(titleLine1).not.toBeNull()
    expect(titleLine2).not.toBeNull()
    expect(tagPill).not.toBeNull()
    expect(tagText).not.toBeNull()
    expect(Number(authorText[1])).toBe(600)
    expect(authorText[3]).toBe('middle')
    expect(Number(titleLine1[1])).toBe(600)
    expect(titleLine1[2]).toBe('middle')
    expect(Number(titleLine2[1])).toBe(600)
    expect(titleLine2[2]).toBe('middle')
    const pillX = Number(tagPill[1])
    const pillY = Number(tagPill[2])
    const pillWidth = Number(tagPill[3])
    expect(pillX + pillWidth / 2).toBe(600)
    expect(pillY).toBeLessThan(480)
    expect(Number(tagText[1])).toBe(600)
    expect(tagText[3]).toBe('middle')
  })
  it('changes manifest signatures when the OG template changes', () => {
    const base = {
      content: '# Knowledge Flow',
      date: '2026-06-20',
      slug: 'knowledge-flow',
      title: 'Knowledge Flow',
    }
    const signatureA = buildOgManifestSignature({
      ...base,
      templateSignature: 'template-a',
    })
    const signatureB = buildOgManifestSignature({
      ...base,
      templateSignature: 'template-b',
    })
    expect(signatureA).not.toBe(signatureB)
  })
})
