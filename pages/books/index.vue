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
  >
    <template #default="{ items }">
      <div class="space-y-8">
        <article
          v-for="book in items"
          :key="book.id"
          class="group border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0"
        >
          <RouterLink
            :to="getPostUrl(book)"
            class="block transition-colors"
          >
            <div>
              <h2 class="text-2xl font-bold mb-2 transition-colors group-hover:text-slate-500 dark:group-hover:text-slate-300 group-hover:underline group-hover:decoration-slate-400/70 group-hover:decoration-2">
                {{ book.title }}
              </h2>

              <p v-if="book.excerpt || book.summary" class="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                {{ book.excerpt || book.summary }}
              </p>

              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <time :datetime="book.date_published">
                  {{ formatDate(book.date_published, false) }}
                </time>
              </div>
            </div>
          </RouterLink>
        </article>
      </div>
    </template>
  </ListPage>
</template>
