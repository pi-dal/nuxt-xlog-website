import { describe, expect, it } from 'vitest'

import { generateOGImage } from '../../scripts/og'

describe('og generation', () => {
  it('exports generateOGImage function', () => {
    expect(typeof generateOGImage).toBe('function')
  })
})
