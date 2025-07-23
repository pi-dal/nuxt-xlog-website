import { useEventListener } from '@vueuse/core'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

export interface AnchorNavigationOptions {
  contentSelector: string
  offset?: number
}

export function useAnchorNavigation(options: AnchorNavigationOptions) {
  const { contentSelector, offset = 80 } = options
  const router = useRouter()

  function navigateToHash(): boolean {
    if (!location.hash)
      return false

    const targetId = decodeURIComponent(location.hash.substring(1))
    const el = document.getElementById(targetId)

    if (el) {
      const rect = el.getBoundingClientRect()
      const y = window.scrollY + rect.top - offset
      window.scrollTo({
        top: y,
        behavior: 'smooth',
      })
      return true
    }

    return false
  }

  function handleAnchorClick(event: MouseEvent) {
    const target = event.target as HTMLElement
    const link = target.closest('a')

    // 检查是否是有效的内部锚点链接
    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      try {
        const url = new URL(link.href)

        // 只处理同域名的链接
        if (url.origin !== window.location.origin)
          return

        event.preventDefault()

        const { pathname, hash } = url

        // 如果是同页面的锚点链接
        if (hash && (!pathname || pathname === location.pathname)) {
          window.history.replaceState({}, '', hash)
          navigateToHash()
        }
        else if (pathname) {
          // 使用Vue Router导航到其他页面
          router.push({ path: pathname, hash })
        }
      }
      catch (err) {
        // URL构造失败，忽略此次点击
        console.warn('Invalid URL in anchor link:', link.href, err)
      }
    }
  }

  function handleHashChange() {
    navigateToHash()
  }

  function setupNavigation() {
    const content = document.querySelector(contentSelector)
    if (!content) {
      console.warn(`Content selector "${contentSelector}" not found`)
      return
    }

    // 监听hash变化
    useEventListener(window, 'hashchange', handleHashChange)

    // 监听内容区域的点击事件
    useEventListener(content, 'click', handleAnchorClick, { passive: false })

    // 初始导航到hash（如果存在）
    setTimeout(() => {
      if (!navigateToHash()) {
        // 如果立即导航失败，可能是因为内容还在渲染，稍后重试
        setTimeout(navigateToHash, 1000)
      }
    }, 1)
  }

  onMounted(setupNavigation)

  return {
    navigateToHash,
    setupNavigation,
  }
}
