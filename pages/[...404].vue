<template>
  <div class="container mx-auto px-4 py-20 text-center">
    <h1 class="text-6xl font-bold mb-4">
      404
    </h1>
    <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
      Nice to meet you tho!
    </p>

    <!-- 底部导航 -->
    <div class="prose m-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
      <span class="font-mono opacity-50">> </span>
      <RouterLink
        to="/"
        class="font-mono opacity-50 hover:opacity-75"
      >
        cd /
      </RouterLink>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
