# PayMe 组件使用示例

PayMe 组件已经成功集成到你的网站中，可以通过 Creem 支付平台处理支付。以下是一些使用示例：

## 基本用法

```vue
<template>
  <div>
    <!-- 简单的支持按钮 -->
    <PayMe />
  </div>
</template>
```

## 自定义配置

```vue
<template>
  <div>
    <!-- 自定义支持按钮 -->
    <PayMe
      title="支持我的工作"
      description="感谢您的支持！"
      button-text="赞助我"
      :preset-amounts="[
        { value: 10, label: '☕ 咖啡' },
        { value: 30, label: '🍕 午餐' },
        { value: 50, label: '💝 礼物' },
      ]"
      :allow-custom-amount="true"
      :show-message="true"
    />
  </div>
</template>
```

## 指定产品ID（订阅支付）

```vue
<template>
  <div>
    <!-- 月度订阅 -->
    <PayMe
      title="月度支持"
      description="成为月度支持者！"
      button-text="月度支持"
      product-id="prod_monthly_support"
      :preset-amounts="[
        { value: 5, label: '基础' },
        { value: 15, label: '标准' },
        { value: 30, label: '高级' },
      ]"
    />
  </div>
</template>
```

## 完整配置示例

```vue
<template>
  <div>
    <PayMe
      title="支持开源项目"
      description="您的支持帮助我维护这个开源项目"
      button-text="支持项目"
      button-class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
      icon-class="i-ri-code-line"

      :preset-amounts="[
        { value: 20, label: '🌱 种子' },
        { value: 50, label: '🌿 成长' },
        { value: 100, label: '🌳 繁荣' },
      ]"

      :allow-custom-amount="true"
      :show-message="true"

      product-id="prod_opensource_support"
      success-url="https://your-site.com/thank-you"
      customer-email="supporter@example.com"

      :metadata="{
        project: 'awesome-project',
        source: 'website',
      }"
    />
  </div>
</template>
```

## 组件属性说明

### 基础配置

- `buttonText`: 按钮文字，默认为 "Support Me"
- `buttonClass`: 按钮样式类
- `iconClass`: 按钮图标类
- `title`: 模态框标题
- `description`: 模态框描述

### 支付配置

- `productId`: Creem 产品ID（用于订阅或固定产品）
- `presetAmounts`: 预设金额选项数组
- `allowCustomAmount`: 是否允许自定义金额
- `showAmountOptions`: 是否显示金额选项
- `showMessage`: 是否显示留言框

### 高级配置

- `successUrl`: 支付成功后的重定向URL
- `customerEmail`: 预填客户邮箱
- `metadata`: 自定义元数据

## 注意事项

1. **API密钥**: 确保在 `.env` 文件中配置了 `CREEM_API_KEY`
2. **CORS**: Creem API 支持跨域请求，无需额外配置
3. **安全性**: 所有支付信息都通过 Creem 安全处理，不会存储在你的网站上
4. **测试**: 可以使用测试API密钥进行测试

## 导航链接

已在导航栏中添加了"Support"链接，指向 `/support` 页面，用户可以通过此页面进行支付。

## 样式自定义

PayMe 组件包含了完整的响应式设计和暗色模式支持。你可以通过传递自定义的 `buttonClass` 来覆盖默认样式。

## 环境配置

确保在 `.env` 文件中配置了以下环境变量：

```env
CREEM_API_KEY=creem_4qM0a3tkUkZQpKkIb620YS
```

## 支持的支付方式

通过 Creem，PayMe 组件支持以下支付方式：

- 信用卡/借记卡
- Apple Pay
- Google Pay
- 各种地区性支付方式（如 Bancontact, Blik, IDEAL 等）

Creem 会根据用户的位置、设备和偏好自动优化支付体验。
