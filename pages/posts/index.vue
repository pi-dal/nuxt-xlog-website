<script setup lang="ts">
import ListPage from '~/components/ListPage.vue'
import { formatDate } from '~/logics'
import { getAllPostsDirect } from '~/logics/xlog-direct'
</script>

<template>
  <ListPage
    :fetch-data-function="getAllPostsDirect"
    title="Blog Posts"
    description="My thoughts, experiences, and learnings"
    content-type="Post"
    base-path="/posts"
  >
    <template #default="{ items }">
      <div class="space-y-8">
        <article
          v-for="post in items"
          :key="post.id"
          class="group border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0"
        >
          <RouterLink
            :to="`/posts/${post.slug}`"
            class="block transition-colors"
          >
            <!-- 文章信息 -->
            <div>
              <h2 class="text-2xl font-bold mb-2 transition-colors group-hover:text-slate-500 dark:group-hover:text-slate-300 group-hover:underline group-hover:decoration-slate-400/70 group-hover:decoration-2">
                {{ post.title }}
              </h2>

              <p v-if="post.excerpt || post.summary" class="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                {{ post.excerpt || post.summary }}
              </p>

              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <time :datetime="post.date_published">
                  {{ formatDate(post.date_published, false) }}
                </time>
                <span v-if="post.author" class="ml-4">
                  by {{ post.author.name }}
                </span>
              </div>
            </div>
          </RouterLink>
        </article>
      </div>
    </template>
  </ListPage>
</template>
