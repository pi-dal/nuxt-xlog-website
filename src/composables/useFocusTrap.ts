import type { Ref } from 'vue'
import { nextTick, ref, watchEffect } from 'vue'

interface FocusTrapOptions {
  isOpen: Ref<boolean>
  containerSelector: string
  onClose: () => void
}

export function useFocusTrap(options: FocusTrapOptions) {
  const { isOpen, containerSelector, onClose } = options
  const firstFocusElement = ref<HTMLElement>()
  const lastFocusElement = ref<HTMLElement>()

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen.value) {
      event.stopPropagation()
      onClose()
      return
    }

    // Focus trapping for Tab key
    if (event.key === 'Tab' && isOpen.value) {
      const modalContent = document.querySelector(containerSelector)
      if (!modalContent)
        return

      const focusableElements = modalContent.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const focusableArray = Array.from(focusableElements) as HTMLElement[]

      if (focusableArray.length === 0)
        return

      const firstFocusable = focusableArray[0]
      const lastFocusable = focusableArray[focusableArray.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey) {
        // Shift+Tab: if at first element, go to last
        if (activeElement === firstFocusable) {
          event.preventDefault()
          lastFocusable.focus()
        }
      }
      else {
        // Tab: if at last element, go to first
        if (activeElement === lastFocusable) {
          event.preventDefault()
          firstFocusable.focus()
        }
      }
    }
  }

  // Prevent background scroll and setup keyboard events when modal is open
  watchEffect((onInvalidate) => {
    if (isOpen.value) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    }

    onInvalidate(() => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    })
  })

  function focusFirstElement() {
    nextTick(() => {
      firstFocusElement.value?.focus()
    })
  }

  function focusLastElement() {
    nextTick(() => {
      lastFocusElement.value?.focus()
    })
  }

  return {
    firstFocusElement,
    lastFocusElement,
    focusFirstElement,
    focusLastElement,
  }
}
