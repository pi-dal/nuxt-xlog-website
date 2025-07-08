import { ref } from 'vue'
import { getSiteInfoDirect } from '~/logics/xlog-direct'
import type { XLogSite } from '~/types'

export const siteInfo = ref<XLogSite | null>()
export const loading = ref(false)

export async function fetchSiteInfo() {
  if (siteInfo.value || loading.value)
    return

  loading.value = true
  try {
    siteInfo.value = await getSiteInfoDirect()
  }
  finally {
    loading.value = false
  }
} 