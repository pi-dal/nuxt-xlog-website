import { createGenerator } from 'unocss'
import { describe, expect, it } from 'vitest'
import unoConfig from '../../unocss.config'

describe('unocss extractor guards', () => {
  it('does not emit invalid arbitrary-property CSS from phonetic bracket tokens in markdown', async () => {
    const uno = await createGenerator(unoConfig)

    const result = await uno.generate('> 📌 carpet [5kB:pit] n. 地毯 Ford [fR:d] cloakroom [klEJkru:m] [color:red]', {
      preflights: false,
    })

    expect(result.css).toContain('.\\[color\\:red\\]')
    expect(result.css).not.toContain('.\\[5kB\\:pit\\]')
    expect(result.css).not.toContain('.\\[fR\\:d\\]')
    expect(result.css).not.toContain('.\\[klEJkru\\:m\\]')
  })
})
