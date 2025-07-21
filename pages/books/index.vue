<script setup lang="ts">
import type { XLogPost } from '~/types'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import ArtPlum from '~/components/ArtPlum.vue'
import { formatDate } from '~/logics'
import { getBooksDirect } from '~/logics/xlog-direct'

const route = useRoute()

const allBooks = ref<XLogPost[]>([])
const books = ref<XLogPost[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Pagination
const currentPage = ref(1)
const booksPerPage = 4

onMounted(async () => {
  try {
    loading.value = true
    allBooks.value = await getBooksDirect()
    updateDisplayedBooks()
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load books'
  }
  finally {
    loading.value = false
  }
})

function updateDisplayedBooks() {
  const startIndex = (currentPage.value - 1) * booksPerPage
  const endIndex = startIndex + booksPerPage
  books.value = allBooks.value.slice(startIndex, endIndex)
}

const totalPages = computed(() => {
  return Math.ceil(allBooks.value.length / booksPerPage)
})

function goToPage(page: number) {
  currentPage.value = page
  updateDisplayedBooks()
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getPostUrl = (post: XLogPost) => `/books/${post.slug}`
</script>

<template>
  <div>
    <!-- 树枝动画效果 -->
    <ClientOnly>
      <ArtPlum />
    </ClientOnly>

    <div class="prose dark:prose-invert max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="!mb-2">
          Reading Notes
        </h1>
        <p class="!mt-0 opacity-75">
          Books I've read and my thoughts on them.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-8 text-center">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
        </div>
        <p class="mt-2 text-sm opacity-75">
          Loading books...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-8 text-center text-red-500">
        <div class="mb-2">
          Failed to load books
        </div>
        <div class="text-sm opacity-75">
          {{ error }}
        </div>
        <button
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          @click="onMounted"
        >
          Retry
        </button>
      </div>

      <!-- Books List -->
      <div v-else-if="books.length > 0" class="not-prose">
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <article
            v-for="book in books"
            :key="book.id"
            class="py-6 first:pt-0 last:pb-0"
          >
            <div class="flex flex-col space-y-3">
              <!-- Book Title and Link -->
              <h2 class="text-xl font-semibold">
                <RouterLink
                  :to="getPostUrl(book)"
                  class="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {{ book.title }}
                </RouterLink>
              </h2>

              <!-- Book Summary -->
              <p v-if="book.excerpt || book.summary" class="text-gray-600 dark:text-gray-400 line-clamp-3">
                {{ book.excerpt || book.summary }}
              </p>

              <!-- Book Meta -->
              <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <time :datetime="book.date_published">
                  {{ formatDate(book.date_published) }}
                </time>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <nav class="flex items-center space-x-2">
            <!-- Previous Page -->
            <button
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                currentPage === 1
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ]"
              @click="goToPage(currentPage - 1)"
            >
              Previous
            </button>

            <!-- Page Numbers -->
            <template v-for="page in Math.min(totalPages, 7)" :key="page">
              <!-- If total pages <= 7, show all pages -->
              <button
                v-if="totalPages <= 7"
                class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <!-- If total pages > 7, show smart pagination -->
              <template v-else>
                <!-- First page -->
                <button
                  v-if="page === 1"
                  class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                    1 === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                  ]"
                  @click="goToPage(1)"
                >
                  1
                </button>
                <!-- Ellipsis -->
                <span v-if="page === 2 && currentPage > 4" class="px-3 py-2 text-gray-400 dark:text-gray-600">...</span>
                <!-- Current page and surrounding pages -->
                <button
                  v-if="page >= Math.max(2, currentPage - 1) && page <= Math.min(totalPages - 1, currentPage + 1)"
                  class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                  ]"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <!-- Ellipsis -->
                <span v-if="page === 6 && currentPage < totalPages - 3" class="px-3 py-2 text-gray-400 dark:text-gray-600">...</span>
                <!-- Last page -->
                <button
                  v-if="page === 7 && totalPages > 1"
                  class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                    totalPages === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                  ]"
                  @click="goToPage(totalPages)"
                >
                  {{ totalPages }}
                </button>
              </template>
            </template>

            <!-- Next Page -->
            <button
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors" :class="[
                currentPage === totalPages
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              ]"
              @click="goToPage(currentPage + 1)"
            >
              Next
            </button>
          </nav>
        </div>

        <!-- Pagination Info -->
        <div v-if="allBooks.length > 0" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {{ ((currentPage - 1) * booksPerPage) + 1 }} to {{ Math.min(currentPage * booksPerPage, allBooks.length) }} of {{ allBooks.length }} books
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-12 text-center">
        <div class="max-w-sm mx-auto">
          <p class="text-gray-600 dark:text-gray-300 mb-2">
            No reading notes yet.
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Reading notes will show articles tagged with "微信读书" in your xLog.
          </p>
        </div>
      </div>

      <!-- 底部导航 -->
      <div class="prose dark:prose-invert max-w-3xl mx-auto mt-8 mb-8 slide-enter animate-delay-500 print:hidden">
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
