import type { XLogPost } from '~/types'
import { ref } from 'vue'
import { getPostBySlugDirect } from '~/logics/xlog-direct'

export interface PostError {
  type: '404' | '500' | 'network' | 'unknown'
  message: string
  details?: string
}

export function usePost(slug: string) {
  const post = ref<XLogPost | null>(null)
  const pending = ref(false)
  const error = ref<PostError | null>(null)

  function createError(err: unknown): PostError {
    if (err instanceof Error) {
      // Network or fetch errors
      if (err.message.includes('fetch')) {
        return {
          type: 'network',
          message: 'Network error occurred',
          details: err.message,
        }
      }

      // Other known errors
      return {
        type: 'unknown',
        message: err.message,
        details: err.stack,
      }
    }

    // String errors
    if (typeof err === 'string') {
      return {
        type: 'unknown',
        message: err,
      }
    }

    // Unknown error types
    return {
      type: 'unknown',
      message: 'An unexpected error occurred',
      details: String(err),
    }
  }

  async function fetchPost() {
    try {
      pending.value = true
      error.value = null

      const foundPost = await getPostBySlugDirect(slug)

      if (!foundPost) {
        error.value = {
          type: '404',
          message: 'Post not found',
          details: `No post found with slug: "${slug}"`,
        }
        post.value = null
      }
      else {
        post.value = foundPost
        error.value = null
      }
    }
    catch (err) {
      console.error('Failed to fetch xLog post:', err)
      error.value = createError(err)
      post.value = null
    }
    finally {
      pending.value = false
    }
  }

  function reset() {
    post.value = null
    pending.value = false
    error.value = null
  }

  return {
    post: readonly(post),
    pending: readonly(pending),
    error: readonly(error),
    fetchPost,
    reset,
  }
}
