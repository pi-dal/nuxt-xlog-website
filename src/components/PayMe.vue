<script setup lang="ts">
interface Props {
  buttonText?: string
  descriptionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Support me',
  descriptionText: 'Pay with PayPal (Thank you for your support)',
})

function createPayment() {
  window.open('https://www.paypal.com/paypalme/pidal200', '_blank')
}
</script>

<template>
  <div class="pay-me-container">
    <button
      class="pay-me-button"
      @click="createPayment"
    >
      <div class="flex items-center gap-2">
        <div class="icon i-ri-heart-line" />
        <span>{{ props.buttonText }}</span>
      </div>
    </button>

    <p class="pay-me-description">
      {{ props.descriptionText }}
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

@media (max-width: 640px) {
  .pay-me-button {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>
