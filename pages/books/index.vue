<script setup lang="ts">
import ListPage from '~/components/ListPage.vue'
import { formatDate } from '~/logics'
import { getBooksDirect } from '~/logics/xlog-direct'

const getPostUrl = (post: any) => `/books/${post.slug}`
</script>

<template>
  <ListPage
    :fetch-data-function="getBooksDirect"
    title="Reading Notes"
    description="Books I've read and my thoughts on them."
    content-type="Book"
    base-path="/books"
    :use-pagination="true"
    :items-per-page="4"
  >
    <template #default="{ items }">
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <article
          v-for="book in items"
          :key="book.id"
          class="py-6 first:pt-0 last:pb-0"
        >
          <div class="flex flex-col space-y-3">
            <!-- Book Title and Link -->
            <h2 class="text-xl font-semibold">
              <RouterLink
                :to="getPostUrl(book)"
                class="text-gray-900 dark:text-gray-100 transition-colors hover:text-slate-500 dark:hover:text-slate-300 hover:underline hover:decoration-slate-400/70 hover:decoration-2"
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
    </template>
  </ListPage>
</template>
