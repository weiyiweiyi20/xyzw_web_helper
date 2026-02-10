# 移动端优化指南

## 📱 已实施的优化

### 1. 核心基础设施改进

#### HTML 元标签增强
- ✅ `viewport-fit=cover` - 支持刘海屏安全区域
- ✅ `user-scalable=no` - 禁用用户缩放，防止意外放大
- ✅ `shrink-to-fit=no` - Safari 浏览器优化
- ✅ iOS Web App 支持
- ✅ 主题颜色配置
- ✅ 安全区域 (Safe Area) 支持

#### 样式系统优化
- ✅ `overflow-y: auto` - 自适应滚动
- ✅ `-webkit-overflow-scrolling: touch` - iOS 平滑滚动动画
- ✅ 固定定位的 body - 防止键盘弹出时页面跳动
- ✅ `-webkit-tap-highlight-color: transparent` - 移除点击高亮

### 2. 响应式设计 (mobile-optimization.scss)

#### 断点定义
- **xs**: 0px - 480px (超小手机)
- **sm**: 480px - 640px (小手机)  
- **md**: 640px - 768px (大手机)
- **lg**: 768px - 1024px (平板)
- **xl**: 1024px - 1280px
- **2xl**: 1280px+

#### 关键优化

##### 字体和文本
- 手机端字体自动缩放 (14px 基础)
- 标题自适应大小 (使用 line-height 防止截断)
- 文本自动换行 (`word-break`, `overflow-wrap`)
- 长单词 URL 防止破坏布局

##### 间距和布局
- 移动端自动减少边距
- 卡片自适应 padding
- 按钮组自动变为单列或双列

##### 栅格系统
- 平板显示 2 列或转为单列
- 手机全部转为单列
- 支持 Flex 布局自动调整

##### 表格优化
- 移动端表格转为卡片式显示
- 自定义标签显示 (data-label)
- 横向滚动支持

##### 模态框
- 自动适配屏幕宽度 (95vw 最大)
- 最大高度限制 (90vh)
- 安全区域感知

##### 输入框
- 最小高度 44px (触摸友好)
- 字体大小 16px (防止 iOS 放大)
- 移除系统默认样式
- 支持标准 HTML5 input types

##### 按钮
- 最小点击区域 44×44 pixels
- 移除悬停效果 (仅在桌面保留)
- 活跃状态反馈（opacity: 0.7）

### 3. 性能优化

#### 动画优化
- 超小屏幕禁用复杂动画
- 使用 `translate3d` 进行 GPU 加速
- 减少 transition duration (0.15s 对超小屏)

#### 触摸优化  
- `touch-action: manipulation` - 移除点击延迟
- `-webkit-user-select: none` - 禁用文本选择菜单
- 移动设备悬停禁用，保留活跃效果

### 4. 安全区域处理

```scss
@supports (padding: max(0px)) {
  body {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
```

支持 iPhone 刘海屏、Android notch 等设备的安全区域。

### 5. 工具类

#### 显示隐藏
```html
<div class="hide-mobile">PC only</div>
<div class="show-mobile">Mobile only</div>
<div class="hide-tablet">Tablet hidden</div>
```

#### 文本截断
```html
<!-- 单行省略 -->
<div class="truncate">Long text...</div>

<!-- 两行省略 -->
<div class="truncate-line-2">Long text...</div>

<!-- 三行省略 -->
<div class="truncate-line-3">Long text...</div>
```

#### 溢出处理
```html
<div class="overflow-auto">Scrollable content</div>
<div class="safe-area">安全区域内容</div>
```

## 🛠️ 开发最佳实践

### 1. 使用响应式单位

```scss
// ✅ 良好
.container {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  
  @media (max-width: 640px) {
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}

// ❌ 避免
.container {
  padding: 20px;
  font-size: 16px;
}
```

### 2. 移动优先设计

```scss
// ✅ 移动优先
.flex-container {
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
}

// ❌ 桌面优先
.flex-container {
  flex-direction: row;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}
```

### 3. 触摸友好的交互

```vue
<template>
  <!-- ✅ 最小 44×44px -->
  <button class="px-4 py-2">确定</button>
  
  <!-- ✅ 足够的间距 -->
  <div class="flex gap-3">
    <button>按钮1</button>
    <button>按钮2</button>
  </div>
</template>

<style scoped>
button {
  min-height: 44px;
  min-width: 44px;
}
</style>
```

### 4. 避免的做法

```vue
// ❌ 不要固定宽度
.container { width: 1200px; }

// ❌ 不要使用过小的触摸目标
button { width: 20px; height: 20px; }

// ❌ 不要禁用缩放
<meta name="viewport" content="user-scalable=no">

// ❌ 不要假设屏幕尺寸
.sidebar { width: 300px; } /* 在手机上太大 */
```

### 5. 测试清单

- [ ] 在真实设备上测试 (不仅仅是浏览器模拟)
- [ ] 测试所有断点 (480px, 640px, 768px)
- [ ] 检查键盘弹出时的布局
- [ ] 测试横屏/竖屏切换
- [ ] 验证触摸目标大小 >= 44×44px
- [ ] 检查文本可读性
- [ ] 测试长文本截断
- [ ] 验证图片响应式加载
- [ ] 测试离线功能（如适用）
- [ ] 检查电池消耗（禁用不必要的动画）

### 6. iOS 特定注意事项

```scss
// 防止 iPhone 键盘问题
input {
  font-size: 16px; // 防止自动缩放
  -webkit-appearance: none; // 移除系统样式
  border-radius: 0; // 避免 BUG
}

// iOS 平滑滚动
.scrollable {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

// 支持刘海屏
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### 7. Android 特定注意事项

```scss
// 禁用文本选择菜单长按
-webkit-user-select: none;

// 移除点击高亮
-webkit-tap-highlight-color: transparent;

// 输入框优化
input {
  font-size: 16px; // 防止缩放
  -webkit-appearance: none;
}
```

## 📊 性能指标

### Lighthouse Mobile 最佳实践
- ✅ 可点击元素间距 >= 48px (或 44px)
- ✅ 充分的颜色对比度 (AA 或更高)
- ✅ 视口已配置
- ✅ 文本可读性
- ✅ 字体优化加载

### 核心网络指标 (Core Web Vitals)
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms  
- **CLS** (Cumulative Layout Shift): < 0.1

## 🚀 部署建议

### 1. 测试
```bash
# 构建和测试
npm run build
npm run preview

# 使用 Lighthouse
# Chrome DevTools > Lighthouse > Mobile
```

### 2. 监控
- 启用 Google Analytics 追踪移动端用户行为
- 使用 Web Vitals 监控性能
- 设置错误报告 (Sentry等)

### 3. CDN 优化
- 启用 Gzip 压缩
- 配置缓存头
- 使用响应式图片格式

## 📚 参考资源

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev: Mobile Optimization](https://web.dev/mobile/)
- [iOS Safari CSS Reference](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/OtherHTMLAttributes.html)
- [Android Browser Issue Tracker](https://bugs.chromium.org/p/chromium/issues/list)

## 🔍 常见问题排查

### 问题：页面在 iOS 上缩放错误
**解决方案**：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 问题：键盘弹出时页面跳动
**解决方案**：
```scss
body {
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
}
```

### 问题：Input 获得焦点时自动放大 (iOS)
**解决方案**：
```scss
input {
  font-size: 16px; // 必须 >= 16px
}
```

### 问题：触摸元素响应延迟
**解决方案**：
```scss
button {
  touch-action: manipulation;
}
```

---

**最后更新**: 2024年
**维护者**: 开发团队
