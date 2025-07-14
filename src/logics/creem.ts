import { withErrorHandling } from './errors'
import { logger } from './logger'

// Creem API配置
function getApiBase() {
  if (import.meta.env.DEV) {
    return '/api/creem'
  }
  // Production: use Cloudflare function
  return '/functions'
}

// 获取API密钥
function getCreemApiKey(): string {
  // 首先尝试从环境变量获取
  if (typeof process !== 'undefined' && process.env?.CREEM_API_KEY) {
    return process.env.CREEM_API_KEY
  }

  // 如果在客户端，可以从localStorage获取（仅用于开发）
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('CREEM_API_KEY')
    if (storedKey) {
      return storedKey
    }
  }

  // 默认API密钥（你提供的）
  return 'creem_4qM0a3tkUkZQpKkIb620YS'
}

// Creem API响应类型
export interface CreemCheckoutResponse {
  id: string
  checkout_url: string
  status: string
  product_id?: string
  customer_email?: string
  amount?: number
  currency?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface CreemProduct {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  type: 'one_time' | 'subscription'
  status: 'active' | 'inactive'
}

// 创建checkout session的参数
export interface CreateCheckoutSessionParams {
  productId?: string
  amount?: number
  currency?: string
  customerEmail?: string
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, any>
  requestId?: string
  message?: string
  units?: number
  discountCode?: string
}

// 创建一个通用的产品ID来处理动态金额
export const DEFAULT_PRODUCT_ID = 'prod_2TwzDKCrT7EcwVOSj6BNWg'

// 创建checkout session
export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CreemCheckoutResponse> {
  return withErrorHandling(async () => {
    const apiKey = getCreemApiKey()

    if (!apiKey) {
      throw new Error('Creem API key not found')
    }

    logger.info('Creating Creem checkout session', {
      productId: params.productId,
      amount: params.amount,
      customerEmail: params.customerEmail,
    })

    // 构建请求体
    const requestBody: any = {}

    // 如果有产品ID，使用产品ID
    if (params.productId) {
      requestBody.product_id = params.productId

      // 如果指定了数量，添加units参数
      if (params.units && params.units > 0) {
        requestBody.units = params.units
      }
    }

    // 添加可选参数
    if (params.customerEmail) {
      requestBody.customer = { email: params.customerEmail }
    }

    if (params.successUrl) {
      requestBody.success_url = params.successUrl
    }

    if (params.cancelUrl) {
      requestBody.cancel_url = params.cancelUrl
    }

    if (params.requestId) {
      requestBody.request_id = params.requestId
    }

    if (params.discountCode) {
      requestBody.discount_code = params.discountCode
    }

    // 构建metadata
    const metadata = { ...params.metadata }
    if (params.message) {
      metadata.message = params.message
    }
    if (params.amount) {
      metadata.custom_amount = params.amount
    }

    if (Object.keys(metadata).length > 0) {
      requestBody.metadata = metadata
    }

    const apiBase = getApiBase()
    let url: string
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (import.meta.env.DEV) {
      // Development: use proxy
      url = `${apiBase}/checkouts`
    }
    else {
      // Production: use Cloudflare function
      url = `${apiBase}/creem-checkout`
    }

    // Only add API key if using dev proxy (proxy will strip it)
    if (import.meta.env.DEV) {
      // API key will be added by proxy
    }
    else {
      // Netlify function handles API key internally
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Creem API error', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })

      throw new Error(`Creem API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    logger.info('Creem checkout session created successfully', {
      checkoutId: data.id,
      checkoutUrl: data.checkout_url,
    })

    return data
  }, 'Failed to create Creem checkout session')
}

// 获取产品列表
export async function getProducts(): Promise<CreemProduct[]> {
  return withErrorHandling(async () => {
    const apiKey = getCreemApiKey()

    if (!apiKey) {
      throw new Error('Creem API key not found')
    }

    logger.info('Fetching Creem products')

    const apiBase = getApiBase()
    let url: string
    const headers: Record<string, string> = {}

    if (import.meta.env.DEV) {
      // Development: use proxy
      url = `${apiBase}/products`
    }
    else {
      // Production: would need a separate Netlify function for products
      // For now, fallback to direct API (might have CORS issues)
      url = 'https://api.creem.io/v1/products'
      headers['x-api-key'] = apiKey
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Creem API error', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })

      throw new Error(`Creem API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    logger.info('Creem products fetched successfully', {
      count: data.data?.length || 0,
    })

    return data.data || []
  }, 'Failed to fetch Creem products')
}

// 创建动态金额的checkout session
export async function createDonationCheckout(params: {
  amount: number
  currency?: string
  customerEmail?: string
  message?: string
  metadata?: Record<string, any>
}): Promise<CreemCheckoutResponse> {
  // 生成唯一的请求ID
  const requestId = `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return createCheckoutSession({
    productId: DEFAULT_PRODUCT_ID,
    amount: params.amount,
    currency: params.currency || 'USD',
    customerEmail: params.customerEmail,
    message: params.message,
    requestId,
    metadata: {
      type: 'donation',
      amount: params.amount,
      currency: params.currency || 'USD',
      ...params.metadata,
    },
  })
}

// 用于开发时设置API密钥
export function setCreemApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('CREEM_API_KEY', apiKey)
  }
}

// 清除API密钥
export function clearCreemApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('CREEM_API_KEY')
  }
}
