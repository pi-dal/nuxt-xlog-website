import { logger } from './logger';
// Creem API配置
function getApiBase() {
    if (import.meta.env.DEV) {
        return '/api/creem';
    }
    // Production: use Cloudflare function
    return '/functions';
}
// 获取API密钥
function getCreemApiKey() {
    if (typeof process !== 'undefined' && process.env?.CREEM_API_KEY) {
        return process.env.CREEM_API_KEY;
    }
    // 如果在客户端，可以从localStorage获取（仅用于开发）
    if (typeof window !== 'undefined') {
        const storedKey = localStorage.getItem('CREEM_API_KEY');
        if (storedKey) {
            return storedKey;
        }
    }
    return undefined;
}
// 创建一个通用的产品ID来处理动态金额
export const DEFAULT_PRODUCT_ID = 'prod_2TwzDKCrT7EcwVOSj6BNWg';
// 创建checkout session
export async function createCheckoutSession(params) {
    logger.info('Creating Creem checkout session', {
        amount: params.amount,
        customerEmail: params.customerEmail,
        productId: params.productId,
    });
    const requestBody = {};
    if (params.productId) {
        requestBody.product_id = params.productId;
        if (params.units && params.units > 0)
            requestBody.units = params.units;
    }
    if (params.customerEmail)
        requestBody.customer = { email: params.customerEmail };
    if (params.successUrl)
        requestBody.success_url = params.successUrl;
    if (params.cancelUrl)
        requestBody.cancel_url = params.cancelUrl;
    if (params.requestId)
        requestBody.request_id = params.requestId;
    if (params.discountCode)
        requestBody.discount_code = params.discountCode;
    const metadata = { ...params.metadata };
    if (params.message)
        metadata.message = params.message;
    if (params.amount)
        metadata.custom_amount = params.amount;
    if (Object.keys(metadata).length > 0)
        requestBody.metadata = metadata;
    const url = import.meta.env.DEV
        ? `${getApiBase()}/checkouts`
        : `${getApiBase()}/creem-checkout`;
    const response = await fetch(url, {
        body: JSON.stringify(requestBody),
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
    });
    if (!response.ok) {
        const errorText = await response.text();
        logger.error('Creem API error', {
            error: errorText,
            status: response.status,
            statusText: response.statusText,
        });
        throw new Error(`Creem API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    logger.info('Creem checkout session created successfully', {
        checkoutId: data.id,
        checkoutUrl: data.checkout_url,
    });
    return data;
}
// 获取产品列表
export async function getProducts() {
    const apiKey = getCreemApiKey();
    logger.info('Fetching Creem products');
    let url;
    const headers = {};
    if (import.meta.env.DEV) {
        url = `${getApiBase()}/products`;
    }
    else {
        if (!apiKey)
            throw new Error('Creem API key not found');
        url = 'https://api.creem.io/v1/products';
        headers['x-api-key'] = apiKey;
    }
    const response = await fetch(url, {
        headers,
        method: 'GET',
    });
    if (!response.ok) {
        const errorText = await response.text();
        logger.error('Creem API error', {
            error: errorText,
            status: response.status,
            statusText: response.statusText,
        });
        throw new Error(`Creem API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    logger.info('Creem products fetched successfully', {
        count: data.data?.length || 0,
    });
    return data.data || [];
}
// 创建动态金额的checkout session
export async function createDonationCheckout(params) {
    // 生成唯一的请求ID
    const requestId = `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    });
}
// 用于开发时设置API密钥
export function setCreemApiKey(apiKey) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('CREEM_API_KEY', apiKey);
    }
}
// 清除API密钥
export function clearCreemApiKey() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('CREEM_API_KEY');
    }
}
