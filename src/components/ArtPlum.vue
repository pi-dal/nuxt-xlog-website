<script setup lang='ts'>
import type { Fn } from '@vueuse/core'
import { usePreferredReducedMotion } from '@vueuse/core'

const r180 = Math.PI
const r90 = Math.PI / 2
const r15 = Math.PI / 12

const el = ref<HTMLCanvasElement | null>(null)
const { random } = Math
const size = reactive(useWindowSize())
const start = ref<Fn>(() => {})
const stopped = ref(false)
const startTime = ref(0)

// Props for mode-based control
const props = withDefaults(defineProps<{
  mode?: 'ambient' | 'subtle' | 'static'
  durationMs?: number
  seedCount?: number
  strokeOpacity?: number
  dotOpacity?: number
}>(), {
  mode: 'ambient',
  durationMs: 30000,
  seedCount: 4,
  strokeOpacity: 0.15,
  dotOpacity: 0.3,
})

const reducedMotion = usePreferredReducedMotion()
const isReduced = computed(() => reducedMotion.value === 'reduce')
const isStatic = computed(() => props.mode === 'static')

const color = computed(() => {
  const alpha = props.strokeOpacity
  const hex = Math.round(alpha * 255).toString(16).padStart(2, '0')
  return `#888888${hex}`
})

const dotColor = computed(() => {
  const alpha = props.dotOpacity
  const hex = Math.round(alpha * 255).toString(16).padStart(2, '0')
  return `#888888${hex}`
})

const MIN_BRANCH = 30
const len = ref(6)

function initCanvas(canvas: HTMLCanvasElement, width = 400, height = 400, _dpi?: number) {
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  // @ts-expect-error vendor
  const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1
  const dpi = _dpi || dpr / bsr

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  canvas.width = dpi * width
  canvas.height = dpi * height
  ctx.scale(dpi, dpi)

  return { ctx, dpi }
}

function polar2cart(x = 0, y = 0, r = 0, theta = 0) {
  const dx = r * Math.cos(theta)
  const dy = r * Math.sin(theta)
  return [x + dx, y + dy]
}

// Watch for resize — debounce, reinit + restart
const resizeTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
let controls: ReturnType<typeof useRafFn> | null = null
let ctxRef: CanvasRenderingContext2D | null = null
let canvasRef: HTMLCanvasElement | null = null

watch(
  () => [size.width, size.height],
  () => {
    if (resizeTimeout.value)
      clearTimeout(resizeTimeout.value)
    resizeTimeout.value = setTimeout(() => {
      if (canvasRef && !isReduced.value) {
        // Re-init with current dimensions — uses current size.width/height, not captured
        initAnimation(canvasRef, size.width, size.height)
        if (!isStatic.value)
          start.value()
      }
    }, 300)
  },
  { flush: 'post' },
)

const drawBackgroundDots = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.fillStyle = dotColor.value
  const spacing = 20
  const dotSize = 1
  for (let x = spacing; x < w; x += spacing) {
    for (let y = spacing; y < h; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, 2 * Math.PI)
      ctx.fill()
    }
  }
}

function initAnimation(canvas: HTMLCanvasElement, w: number, h: number) {
  // Stop any existing RAF before reinitializing
  controls?.pause()

  const { ctx } = initCanvas(canvas, w, h)
  ctxRef = ctx

  // Static mode: draw background dots only, no RAF, no branching
  if (isStatic.value) {
    drawBackgroundDots(ctx, w, h)
    return
  }

  let steps: Fn[] = []
  let prevSteps: Fn[] = []

  const step = (x: number, y: number, rad: number, counter: { value: number } = { value: 0 }) => {
    const length = random() * len.value
    counter.value += 1

    const [nx, ny] = polar2cart(x, y, length, rad)

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.stroke()

    const rad1 = rad + random() * r15
    const rad2 = rad - random() * r15

    if (nx < -100 || nx > w + 100 || ny < -100 || ny > h + 100)
      return

    const rate = counter.value <= MIN_BRANCH ? 0.8 : 0.5

    if (random() < rate)
      steps.push(() => step(nx, ny, rad1, counter))
    if (random() < rate)
      steps.push(() => step(nx, ny, rad2, counter))
  }

  let lastTime = performance.now()
  const interval = 1000 / 40

  const frame = () => {
    const currentTime = performance.now()
    const elapsed = currentTime - startTime.value

    if (elapsed >= props.durationMs) {
      controls?.pause()
      stopped.value = true
      return
    }

    if (currentTime - lastTime < interval)
      return

    prevSteps = steps
    steps = []
    lastTime = currentTime

    if (!prevSteps.length) {
      controls?.pause()
      stopped.value = true
      return
    }

    prevSteps.forEach((i) => {
      if (random() < 0.5)
        steps.push(i)
      else
        i()
    })
  }

  controls = useRafFn(frame, { immediate: false })

  const randomMiddle = () => random() * 0.6 + 0.2

  const fullStart = () => {
    controls?.pause()
    ctx.clearRect(0, 0, w, h)
    drawBackgroundDots(ctx, w, h)
    ctx.lineWidth = 1
    ctx.strokeStyle = color.value
    prevSteps = []
    steps = [
      () => step(randomMiddle() * w, -5, r90),
      () => step(randomMiddle() * w, h + 5, -r90),
      () => step(-5, randomMiddle() * h, 0),
      () => step(w + 5, randomMiddle() * h, r180),
    ]
    const effectiveSeeds = size.width < 768
      ? Math.min(props.seedCount, 2)
      : props.seedCount
    steps = steps.slice(0, effectiveSeeds)

    startTime.value = performance.now()
    lastTime = performance.now()
    controls?.resume()
    stopped.value = false
  }

  start.value = fullStart
}

onMounted(async () => {
  if (isReduced.value)
    return

  const canvas = el.value!
  canvasRef = canvas
  initAnimation(canvas, size.width, size.height)

  // Start animation after a short delay (only for non-static modes)
  setTimeout(() => {
    if (!isReduced.value && !isStatic.value)
      start.value()
  }, 300)
})

onUnmounted(() => {
  controls?.pause()
  controls = null
})

const mask = computed(() => 'radial-gradient(circle, transparent, black);')
</script>

<template>
  <div
    v-if="!isReduced"
    class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none print:hidden"
    style="z-index: -1"
    :style="`mask-image: ${mask};--webkit-mask-image: ${mask};`"
  >
    <canvas ref="el" width="400" height="400" />
  </div>
</template>
