import { nextTick, ref, watchEffect } from 'vue';
export function useFocusTrap(options) {
    const { isOpen, containerSelector, onClose } = options;
    const firstFocusElement = ref();
    const lastFocusElement = ref();
    const isClient = typeof document !== 'undefined';
    function handleKeyDown(event) {
        if (!isClient)
            return;
        if (event.key === 'Escape' && isOpen.value) {
            event.stopPropagation();
            onClose();
            return;
        }
        // Focus trapping for Tab key
        if (event.key === 'Tab' && isOpen.value) {
            const modalContent = document.querySelector(containerSelector);
            if (!modalContent)
                return;
            const focusableElements = modalContent.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const focusableArray = Array.from(focusableElements);
            if (focusableArray.length === 0)
                return;
            const firstFocusable = focusableArray[0];
            const lastFocusable = focusableArray[focusableArray.length - 1];
            const activeElement = document.activeElement;
            if (event.shiftKey) {
                // Shift+Tab: if at first element, go to last
                if (activeElement === firstFocusable) {
                    event.preventDefault();
                    lastFocusable.focus();
                }
            }
            else {
                // Tab: if at last element, go to first
                if (activeElement === lastFocusable) {
                    event.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    }
    // Prevent background scroll and setup keyboard events when modal is open
    watchEffect((onInvalidate) => {
        if (!isClient)
            return;
        if (isOpen.value) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
        }
        onInvalidate(() => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        });
    });
    function focusFirstElement() {
        nextTick(() => {
            firstFocusElement.value?.focus();
        });
    }
    function focusLastElement() {
        nextTick(() => {
            lastFocusElement.value?.focus();
        });
    }
    return {
        firstFocusElement,
        lastFocusElement,
        focusFirstElement,
        focusLastElement,
    };
}
