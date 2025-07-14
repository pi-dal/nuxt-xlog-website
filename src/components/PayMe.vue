<script setup lang="ts">
import { ref } from 'vue'

// 状态管理
const loading = ref(false)
const error = ref<string | null>(null)

// 创建支付会话
async function createPayment() {
  if (loading.value)
    return

  loading.value = true
  error.value = null

  try {
    // 动态导入Creem逻辑
    const { createCheckoutSession } = await import('~/logics/creem')

    const checkoutData = await createCheckoutSession({
      productId: 'prod_2TwzDKCrT7EcwVOSj6BNWg',
      metadata: {
        source: 'chat_page',
        type: 'support',
      },
    })

    if (checkoutData.checkout_url) {
      // 在新窗口打开Creem支付页面
      window.open(checkoutData.checkout_url, '_blank')
    }
    else {
      throw new Error('No checkout URL received')
    }
  }
  catch (err) {
    console.error('Payment error:', err)
    error.value = err instanceof Error ? err.message : 'Payment failed'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="pay-me-container">
    <!-- 简洁的支持按钮 -->
    <button
      class="pay-me-button"
      :disabled="loading"
      @click="createPayment"
    >
      <div class="flex items-center gap-2">
        <div
          class="icon"
          :class="loading ? 'i-ri-loader-line animate-spin' : 'i-ri-heart-line'"
        />
        <span>{{ loading ? 'Processing...' : 'Support' }}</span>
      </div>
    </button>

    <!-- 简洁的说明文字 -->
    <p class="pay-me-description">
      Pay with creem (Thank you for your support)
    </p>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="createPayment">
        Retry
      </button>
    </div>
  </div>
</template>

<style scoped>
.pay-me-container {
  text-align: center;
  margin: 2rem 0;
}

.pay-me-button {
  background: transparent;
  border: 1px solid #8884;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.pay-me-button:hover {
  border-color: #888;
  background: #8881;
}

.pay-me-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pay-me-button:disabled:hover {
  border-color: #8884;
  background: transparent;
}

.icon {
  font-size: 1rem;
  opacity: 0.8;
}

.pay-me-description {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.6;
  color: inherit;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #e74c3c;
  opacity: 0.8;
}

.retry-button {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.5rem;
  font-size: inherit;
}

.retry-button:hover {
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .pay-me-button {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
