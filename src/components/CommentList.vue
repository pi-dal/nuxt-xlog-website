<script setup lang="ts">
import { computed } from 'vue'
import type { XLogComment } from '~/types'
import { formatDate } from '~/logics'
import { useMarkdown } from '~/logics/markdown'

const props = defineProps<{
  comments: XLogComment[]
}>()

const { render: renderMarkdown } = useMarkdown()

const renderedComments = await Promise.all(
  props.comments.map(async (comment) => {
    return {
      ...comment,
      content: await renderMarkdown(comment.content),
    }
  })
)
</script>

<template>
  <div class="mt-12">
    <h2 class="text-2xl font-bold mb-6">Comments ({{ comments.length }})</h2>
    
    <div v-if="comments.length > 0" class="space-y-6">
      <div v-for="comment in renderedComments" :key="comment.id" class="flex gap-4 items-start">
        <img 
          v-if="comment.author.avatar"
          :src="comment.author.avatar" 
          :alt="comment.author.name" 
          class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 object-cover"
        />
        <div v-else class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span class="text-lg font-bold opacity-50">
            {{ comment.author.name.charAt(0) }}
          </span>
        </div>
        <div class="flex-1">
          <div class="flex items-baseline gap-2 mb-1">
            <span class="font-semibold">{{ comment.author.name }}</span>
            <span class="text-xs opacity-60">
              {{ formatDate(comment.date_published, false) }}
            </span>
          </div>
          <div 
            class="prose prose-sm dark:prose-invert max-w-none" 
            v-html="comment.content" 
          />
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-8 opacity-70">
      No comments yet. Be the first to comment!
    </div>
  </div>
</template> 