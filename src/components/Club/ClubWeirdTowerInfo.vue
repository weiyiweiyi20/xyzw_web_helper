<template>
  <div>
    <!-- Inline 模式：卡片渲染 -->
    <div v-if="inline" class="inline-wrapper">
      <div class="inline-header">
        <div class="inline-title">俱乐部怪异塔信息</div>
        <div class="header-actions">
          <n-button size="small" :disabled="loading" @click="handleRefresh">
            <template #icon>
              <n-icon>
                <Refresh />
              </n-icon>
            </template>
            刷新
          </n-button>
          <n-button type="primary" size="small" :disabled="!memberScores || loading" @click="handleExport">
            <template #icon>
              <n-icon>
                <Copy />
              </n-icon>
            </template>
            导出
          </n-button>
        </div>
      </div>

      <div class="weird-tower-content">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <n-spin size="large">
            <template #description>正在加载怪异塔数据...</template>
          </n-spin>
        </div>

        <!-- 爬塔列表 -->
        <div v-else-if="memberScores.length > 0" ref="exportDom" class="records-list">
          <div class="records-info">
            <n-tag type="success">总成员: {{ memberScores.length }}</n-tag>
          </div>

          <div v-for="(member, index) in memberScores" :key="member.roleId" class="member-card">
            <div class="member-header">
              <div class="member-info">
                <div class="ranking-number">{{ index + 1 }}</div>
                <img v-if="member.headImg" :src="member.headImg" :alt="member.name" class="member-avatar"
                  @error="handleImageError">
                <div v-else class="member-avatar-placeholder">{{ member.name?.charAt(0) || '?' }}</div>
                <span class="member-name">{{ member.name }}</span>
              </div>
              <div class="member-stats-inline">
                <span class="stat-inline tower-count">层数 {{ member.towerCountconvert || '0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 模式 -->
    <n-modal v-else v-model:show="showModal" preset="card" title="俱乐部怪异塔信息" style="width: 90%; max-width: 800px"
      @after-leave="handleClose">
      <template #header-extra>
        <div class="header-actions">
          <n-button size="small" :disabled="loading" @click="handleRefresh">
            <template #icon>
              <n-icon>
                <Refresh />
              </n-icon>
            </template>
            刷新
          </n-button>
          <n-button type="primary" size="small" :disabled="!memberScores || loading" @click="handleExport">
            <template #icon>
              <n-icon>
                <Copy />
              </n-icon>
            </template>
            导出
          </n-button>
        </div>
      </template>

      <div class="weird-tower-content">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <n-spin size="large">
            <template #description>正在加载怪异塔数据...</template>
          </n-spin>
        </div>

        <!-- 爬塔列表 -->
        <div v-else-if="memberScores.length > 0" ref="exportDom" class="records-list">
          <div class="records-info">
            <n-tag type="success">总成员: {{ memberScores.length }}</n-tag>
          </div>

          <div v-for="(member, index) in memberScores" :key="member.roleId" class="member-card">
            <div class="member-header">
              <div class="member-info">
                <div class="ranking-number">{{ index + 1 }}</div>
                <img v-if="member.headImg" :src="member.headImg" :alt="member.name" class="member-avatar"
                  @error="handleImageError">
                <div v-else class="member-avatar-placeholder">{{ member.name?.charAt(0) || '?' }}</div>
                <span class="member-name">{{ member.name }}</span>
              </div>
              <div class="member-stats-inline">
                <span class="stat-inline tower-count">层数 {{ member.towerCountconvert || '0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useTokenStore } from '@/stores/tokenStore'
import { exportToImageWithWeChatSupport, showExportImageModal } from '@/utils/weChatExport';
import html2canvas from 'html2canvas';
import {
  Trophy,
  Refresh,
  Copy,
  ChevronDown,
  ChevronUp,
  DocumentText
} from '@vicons/ionicons5'
import { gettoday } from '@/utils/clubWarrankUtils'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  }
})

const exportDom = ref(null)
const emit = defineEmits(['update:visible'])

const message = useMessage()
const tokenStore = useTokenStore()

const showModal = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const loading = ref(false)
const exportToImage = async () => {
  if (!exportDom.value) {
    message.error('未找到要导出的DOM元素');
    return;
  }

  try {
    const filename = '怪异塔数据导出';
    const result = await exportToImageWithWeChatSupport(exportDom.value, filename);
    if (result.isWeChat) {
      showExportImageModal(result.url, filename);
    }
    message.success(result.message);
  } catch (err) {
    console.error('导出失败：', err);
    message.error('导出图片失败，请重试');
  }
};
  try {
    exportToImage()
    message.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    message.error('导出失败，请重试')
  }
}

const exportToImage = async () => {
  // 校验：确保DOM已正确绑定
  if (!exportDom.value) {
    alert('未找到要导出的DOM元素');
    return;
  }

  try {
    // 保存原始样式
    const originalStyles = [];
    
    // 递归函数：清除所有子元素的高度和溢出限制
    const clearHeightRestrictions = (element) => {
      if (!element) return;
      
      // 记录原始样式
      originalStyles.push({
        element,
        height: element.style.height,
        maxHeight: element.style.maxHeight,
        overflow: element.style.overflow,
        overflowY: element.style.overflowY,
        overflowX: element.style.overflowX
      });
      
      // 清除当前元素的高度和溢出限制
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';
      element.style.overflowY = 'visible';
      element.style.overflowX = 'visible';
      
      // 递归处理所有子元素
      const children = element.children;
      for (let i = 0; i < children.length; i++) {
        clearHeightRestrictions(children[i]);
      }
    };
    
    // 清除所有高度限制
    clearHeightRestrictions(exportDom.value);
    
    // 等待DOM更新和重排
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 获取导出元素的实际尺寸（包含所有内容）
    const scrollHeight = exportDom.value.scrollHeight;
    const scrollWidth = exportDom.value.scrollWidth;
    const clientHeight = exportDom.value.clientHeight;
    const clientWidth = exportDom.value.clientWidth;
    
    // 使用实际的滚动高度和宽度（取更大值以确保完整）
    const actualHeight = Math.max(scrollHeight, clientHeight);
    const actualWidth = Math.max(scrollWidth, clientWidth);
    
    console.log(`导出尺寸 - 宽: ${actualWidth}px, 高: ${actualHeight}px`);
    
    // 5. 用html2canvas渲染DOM为Canvas
    const canvas = await html2canvas(exportDom.value, {
      scale: 2, // 放大2倍，解决图片模糊问题
      useCORS: true, // 允许跨域图片（若DOM内有远程图片，需开启）
      backgroundColor: '#ffffff', // 避免透明背景（默认透明）
      logging: false, // 关闭控制台日志
      height: actualHeight, // 使用实际的内容高度
      width: actualWidth, // 使用实际的内容宽度
      windowWidth: actualWidth, // 设置窗口宽度
      windowHeight: actualHeight, // 设置窗口高度
      allowTaint: true, // 允许跨域图片污染画布
      proxy: null, // 禁用代理以避免跨域问题
      // 克隆后处理回调
      onclone: (cloned) => {
        const clonedElement = cloned.querySelector('[class*="tower"]') || 
                             cloned.querySelector('div');
        if (clonedElement) {
          const clearClonedStyles = (el) => {
            if (!el) return;
            el.style.height = 'auto';
            el.style.maxHeight = 'none';
            el.style.overflow = 'visible';
            el.style.overflowY = 'visible';
            el.style.overflowX = 'visible';
            for (let i = 0; i < el.children.length; i++) {
              clearClonedStyles(el.children[i]);
            }
          };
          clearClonedStyles(clonedElement);
        }
      }
    });

    // 恢复原始样式
    originalStyles.forEach(({ element, height, maxHeight, overflow, overflowY, overflowX }) => {
      element.style.height = height;
      element.style.maxHeight = maxHeight;
      element.style.overflow = overflow;
      element.style.overflowY = overflowY;
      element.style.overflowX = overflowX;
    });

    // 6. Canvas转图片链接（支持PNG/JPG）
    const imgUrl = canvas.toDataURL('image/png'); // 若要JPG，改为'image/jpeg'

    // 7. 创建下载链接，触发浏览器下载
    const link = document.createElement('a');
    link.href = imgUrl;
    const queryDate = ref(gettoday())
    link.download = queryDate.value.replace("/",'年').replace("/",'月')+'日俱乐部怪异塔数据.png'; // 下载文件名
    document.body.appendChild(link);
    link.click(); // 触发点击下载
    document.body.removeChild(link); // 下载后清理DOM
    
    message.success('图片导出成功');
  } catch (err) {
    console.error('DOM转图片失败：', err);
    message.error('导出图片失败，请重试');
  }
};

// 关闭弹窗
const handleClose = () => {
  // 可以在这里清理资源
}

// 暴露方法给父组件
defineExpose({
  fetchWeirdTowerInfo
})

// Inline 模式：挂载后自动拉取
onMounted(() => {
  if (props.inline) {
    fetchWeirdTowerInfo()
  }
})
</script>

<style scoped lang="scss">
.inline-wrapper {
  background: var(--bg-primary);
  border-radius: var(--border-radius-medium);
  border: 1px solid var(--border-light);
  padding: var(--spacing-md);
}

.inline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  flex-wrap: wrap;
}

.inline-title {
  font-weight: var(--font-weight-semibold);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.weird-tower-content {
  min-height: 200px;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.records-info {
  display: flex;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  align-items: center;
}

.member-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-medium);
  padding: var(--spacing-sm);
  transition: all var(--transition-fast);

  &:hover {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  &+& {
    margin-top: var(--spacing-sm);
  }
}

.member-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.member-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 200px;
  max-width: 200px;
  flex-shrink: 0;
}

.ranking-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.member-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.member-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.member-stats-inline {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  flex: 1;
}

.stat-inline {
  padding: 4px 8px;
  border-radius: var(--border-radius-small);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tower-count {
  background: rgba(32, 192, 80, 0.1);
  color: var(--color-success);
}
</style>