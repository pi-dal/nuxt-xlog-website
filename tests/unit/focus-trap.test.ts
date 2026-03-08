import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useFocusTrap } from '~/composables/useFocusTrap'

describe('useFocusTrap', () => {
  it('does not access document during SSR setup', () => {
    expect(() => useFocusTrap({
      isOpen: ref(true),
      containerSelector: '.dialog',
      onClose: () => {},
    })).not.toThrow()
  })
})
