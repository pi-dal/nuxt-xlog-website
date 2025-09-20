<script setup lang="ts">
import { useRoute } from 'vue-router'
import ArtPlum from '~/components/ArtPlum.vue'
import { useSiteInfo } from '~/logics/useSiteInfo'

const route = useRoute()

// 使用localStorage存储xLog handle
const xlogHandle = useLocalStorage('xlog-handle', 'pi-dal')
const isConfigured = computed(() => !!xlogHandle.value)
const { clearCache } = useSiteInfo()

// 测试连接状态
const testingConnection = ref(false)
const connectionResult = ref<{ success: boolean, message: string } | null>(null)

async function testConnection() {
  if (!xlogHandle.value.trim()) {
    connectionResult.value = { success: false, message: 'Please enter a valid xLog handle' }
    return
  }

  testingConnection.value = true
  connectionResult.value = null

  try {
    // 使用直接API测试连接
    const { getSiteInfoDirect } = await import('~/logics/xlog-direct')

    // 临时设置handle进行测试
    const originalHandle = localStorage.getItem('xlog-handle')
    localStorage.setItem('xlog-handle', xlogHandle.value.trim())

    const siteInfo = await getSiteInfoDirect()

    // 恢复原始handle
    if (originalHandle) {
      localStorage.setItem('xlog-handle', originalHandle)
    }

    if (!siteInfo) {
      throw new Error('Site not found')
    }

    connectionResult.value = {
      success: true,
      message: 'Connection successful! Your xLog site is accessible.',
    }
  }
  catch (error) {
    connectionResult.value = {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
  finally {
    testingConnection.value = false
  }
}

function saveConfig() {
  xlogHandle.value = xlogHandle.value.trim()
  if (xlogHandle.value) {
    // 清除缓存，强制重新获取数据
    clearCache()
    // 重新加载页面数据
    location.reload()
  }
}

// 页面元数据
useHead({
  title: 'Configuration - xLog Website',
  meta: [
    { name: 'description', content: 'Configure your xLog website settings' },
  ],
})
</script>

<template>
  <div>
    <!-- 树枝动画效果 -->
    <ClientOnly>
      <ArtPlum />
    </ClientOnly>

    <div class="max-w-2xl mx-auto py-8">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-2">
          Configuration
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Configure your xLog website settings to start displaying your blog posts.
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="mb-6">
          <label for="xlog-handle" class="block text-sm font-medium mb-2">
            xLog Handle
          </label>
          <input
            id="xlog-handle"
            v-model="xlogHandle"
            type="text"
            placeholder="your-xlog-handle"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your xLog subdomain. For example, if your xLog URL is
            <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">https://your-handle.xlog.app</code>,
            enter <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">your-handle</code>
          </p>
        </div>

        <div class="flex gap-3 mb-4">
          <button
            :disabled="testingConnection || !xlogHandle.trim()"
            class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500
                 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                 flex items-center gap-2"
            @click="testConnection"
          >
            <div
              v-if="testingConnection"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            {{ testingConnection ? 'Testing...' : 'Test Connection' }}
          </button>

          <button
            :disabled="!xlogHandle.trim()"
            class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500
                 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            @click="saveConfig"
          >
            Save Configuration
          </button>
        </div>

        <!-- 连接测试结果 -->
        <div v-if="connectionResult" class="mb-4">
          <div
            class="p-3 rounded-md text-sm" :class="[
              connectionResult.success
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700',
            ]"
          >
            {{ connectionResult.message }}
          </div>
        </div>

        <!-- 当前配置状态 -->
        <div class="border-t pt-4">
          <h3 class="font-medium mb-2">
            Current Status
          </h3>
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full" :class="[
                isConfigured ? 'bg-green-500' : 'bg-red-500',
              ]"
            />
            <span class="text-sm">
              {{ isConfigured ? `Configured with handle: ${xlogHandle}` : 'Not configured' }}
            </span>
          </div>
        </div>

        <!-- 帮助信息 -->
        <div class="mt-6 p-4 bg-slate-100 dark:bg-slate-800/40 rounded-md">
          <h3 class="font-medium text-slate-700 dark:text-slate-200 mb-2">
            How to find your xLog handle?
          </h3>
          <ol class="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside">
            <li>Visit <a href="https://xlog.app" target="_blank" class="underline">xLog.app</a></li>
            <li>Find your blog URL (e.g., https://your-handle.xlog.app)</li>
            <li>Extract the subdomain part (your-handle)</li>
            <li>Enter it in the field above</li>
          </ol>
        </div>

        <!-- 功能说明 -->
        <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h3 class="font-medium mb-2">
            What this enables:
          </h3>
          <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
            <li>Display your xLog blog posts on this website</li>
            <li>Automatic synchronization with your xLog content</li>
            <li>SEO-optimized static site generation</li>
            <li>Custom styling and layout for your posts</li>
          </ul>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="mt-6 flex gap-4">
        <RouterLink
          to="/posts"
          class="text-slate-500 hover:text-slate-400 hover:underline hover:decoration-slate-400/70 transition-colors"
        >
          View Posts
        </RouterLink>
        <RouterLink
          to="/"
          class="text-slate-500 hover:text-slate-400 hover:underline hover:decoration-slate-400/70 transition-colors"
        >
          Back to Home
        </RouterLink>
      </div>

      <!-- 底部导航 -->
      <div class="max-w-2xl mx-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
        <span class="font-mono opacity-50">> </span>
        <RouterLink
          :to="route.path.split('/').slice(0, -1).join('/') || '/'"
          class="font-mono opacity-50 hover:opacity-75"
        >
          cd ..
        </RouterLink>
      </div>
    </div>
  </div>
</template>
