<script setup lang="ts">
const isOpen = shallowRef(false)
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')
const panelRef = useTemplateRef<HTMLDivElement>('panel')

function closePanel() {
  isOpen.value = false
}

function togglePanel() {
  isOpen.value = !isOpen.value
}

useEventListener(document, 'click', (event) => {
  if (!isOpen.value)
    return

  const target = event.target as Node | null
  if (!target)
    return

  if (triggerRef.value?.contains(target) || panelRef.value?.contains(target))
    return

  closePanel()
})

onKeyStroke('Escape', () => {
  if (isOpen.value)
    closePanel()
})
</script>

<template>
  <div class="not-scannable">
    <div text-center op35 mt--2 italic text-sm>
      <button ref="trigger" type="button" class="not-scannable-trigger" @click="togglePanel">
        Not scannable?
      </button>
    </div>

    <Transition name="fade">
      <div
        v-if="isOpen"
        ref="panel"
        class="not-scannable-panel prose"
        role="dialog"
        aria-label="QR code scanner tips"
      >
        <p>
          It might not work on all scanners.
        </p>

        <p>
          On iPhone, it's recommanded to use the code scanner from Control Center instead of the Camera app.
        </p>
        <img src="/images/ios-qrcode-scanner.jpg" rounded-lg alt="qr-code-scanner" class="mt--3! mb-0! w-60!">

        <p>
          You can also try WeChat if you have it installed.
        </p>
        <p>
          Otherwise, please let me know if there any good QR code scanner you'd recommand for other platforms.
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.not-scannable {
  position: relative;
}

.not-scannable-trigger {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
}

.not-scannable-panel {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.75rem);
  z-index: 20;
  width: min(30rem, calc(100vw - 2rem));
  transform: translateX(-50%);
  border: 1px solid rgba(125, 125, 125, 0.25);
  border-radius: 1rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--c-bg) 90%, transparent);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.dark .not-scannable-panel {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.not-scannable-panel::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -0.45rem;
  width: 0.9rem;
  height: 0.9rem;
  transform: translateX(-50%) rotate(45deg);
  background: inherit;
  border-right: 1px solid rgba(125, 125, 125, 0.25);
  border-bottom: 1px solid rgba(125, 125, 125, 0.25);
}

.dark .not-scannable-panel::after {
  border-right-color: rgba(255, 255, 255, 0.12);
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

@media (max-width: 640px) {
  .not-scannable-panel {
    left: 0;
    right: 0;
    width: auto;
    transform: none;
  }

  .not-scannable-panel::after {
    left: 2rem;
    transform: rotate(45deg);
  }
}
</style>
