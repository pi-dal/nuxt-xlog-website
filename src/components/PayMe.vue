<script setup lang="ts">
// 跳转到PayPal
function createPayment() {
  // 直接跳转到PayPal.me页面
  window.open('https://www.paypal.com/paypalme/pidal200', '_blank')
}
</script>

<template>
  <div class="pay-me-container">
    <!-- 简洁的支持按钮 -->
    <button
      class="pay-me-button"
      @click="createPayment"
    >
      <div class="flex items-center gap-2">
        <div class="icon i-ri-heart-line" />
        <span>Support me</span>
      </div>
    </button>

    <!-- 简洁的说明文字 -->
    <p class="pay-me-description">
      Pay with PayPal (Thank you for your support)
    </p>
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

/* 响应式设计 */
@media (max-width: 640px) {
  .pay-me-button {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
