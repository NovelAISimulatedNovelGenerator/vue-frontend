<template>
  <div class="game-header" :class="{ compact: isCompact }">
    <!-- 背景 -->
    <div class="header-background">
      <div class="header-gradient"></div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="header-content">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <img 
            v-if="archive?.imageUrl" 
            :src="archive.imageUrl" 
            class="avatar-image"
            :alt="archive?.title"
          />
        </div>
      </div>

      <!-- 信息区域 -->
      <div class="info-section">
        <div class="title-row">
          <h1 class="title">{{ archive?.title }}</h1>
          <NButton
            quaternary
            size="tiny"
            class="toggle-all-btn"
            @click="toggleAllCategories"
          >
            <template #icon>
              <NIcon>
                <component :is="hasExpandedCategory ? ChevronUpIcon : ChevronDownIcon" />
              </NIcon>
            </template>
            {{ hasExpandedCategory ? '收起全部' : '展开全部' }}
          </NButton>
        </div>
        
        <!-- 属性分类区域 -->
        <div class="attributes-section">
          <div
            v-for="[category, attrs] in categorizedAttributes"
            :key="category"
            class="attribute-category"
          >
            <div
              class="category-header"
              :class="{ expanded: expandedCategories.has(category) }"
              @click="toggleCategory(category)"
            >
              <span class="category-name">{{ category }}</span>
              <NIcon size="16">
                <component :is="expandedCategories.has(category) ? ChevronUpIcon : ChevronDownIcon" />
              </NIcon>
            </div>
            <div 
              v-show="expandedCategories.has(category)" 
              class="category-content"
            >
              <div 
                v-for="(value, key) in attrs" 
                :key="key" 
                class="attribute-item"
              >
                <span class="attr-name">{{ key }}</span>
                <span class="attr-value">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon, NButton } from 'naive-ui'
import {
  ChevronDownOutline as ChevronDownIcon,
  ChevronUpOutline as ChevronUpIcon,
} from '@vicons/ionicons5'
import type { Archive } from '@/types'

const props = defineProps<{
  archive?: Archive
  headerHeight?: string
  scrollProgress?: number
}>()

// 展开的分类集合
const expandedCategories = ref(new Set<string>())

// 计算是否有展开的分类
const hasExpandedCategory = computed(() => expandedCategories.value.size > 0)

// 计算属性：是否使用紧凑模式
const isCompact = computed(() => {
  return props.scrollProgress && props.scrollProgress > 0
})

// 计算属性：按分类整理的属性
const categorizedAttributes = computed(() => {
  if (!props.archive?.attributes) return new Map()

  const categories = new Map<string, Record<string, any>>()
  
  for (const [key, value] of Object.entries(props.archive.attributes)) {
    const [category, ...nameParts] = key.split('_')
    if (!categories.has(category)) {
      categories.set(category, {})
    }
    categories.get(category)![nameParts.join('_')] = value
  }
  
  return categories
})

// 切换分类展开状态
const toggleCategory = (category: string) => {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category)
  } else {
    expandedCategories.value.add(category)
  }
}

// 切换所有分类
const toggleAllCategories = () => {
  if (hasExpandedCategory.value) {
    expandedCategories.value.clear()
  } else {
    categorizedAttributes.value.forEach((_, category) => {
      expandedCategories.value.add(category)
    })
  }
}
</script>

<style scoped lang="scss">
.game-header {
  position: relative;
  width: 100%;
  height: 170px;
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(24, 24, 28, 0.98);
  overflow: hidden;
  z-index: 0;
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(167, 139, 250, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(196, 181, 253, 0.1) 0%, transparent 50%);
  backdrop-filter: blur(10px);
}

.header-content {
  position: relative;
  display: flex;
  gap: 24px;
  padding: 24px;
  height: 100%;
  z-index: 1;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(124, 58, 237, 0.3),
    0 0 20px rgba(124, 58, 237, 0.15);
  background: rgba(124, 58, 237, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(124, 58, 237, 0.4),
      0 0 30px rgba(124, 58, 237, 0.2);
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.info-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 1.5em;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;
}

.toggle-all-btn {
  padding: 2px 12px !important;
  height: 28px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  background: rgba(124, 58, 237, 0.15) !important;
  border: 1px solid rgba(124, 58, 237, 0.3) !important;
  border-radius: 14px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(4px);

  &:hover {
    color: #fff !important;
    background: rgba(124, 58, 237, 0.25) !important;
    border-color: rgba(124, 58, 237, 0.4) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  :deep(.n-icon) {
    font-size: 1.1em !important;
  }
}

.attributes-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px;
}

.attribute-category {
  min-width: 200px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(124, 58, 237, 0.2);
    border-color: rgba(124, 58, 237, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &.expanded {
    background: rgba(124, 58, 237, 0.25);
    border-color: rgba(124, 58, 237, 0.5);
    border-radius: 8px 8px 0 0;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
  }
}

.category-name {
  font-size: 0.9em;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.5px;
}

.category-content {
  background: rgba(24, 24, 28, 0.95);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 8px;
  backdrop-filter: blur(8px);
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.attribute-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 8px;
  transition: all 0.2s ease;
  border-radius: 6px;

  &:hover {
    background: rgba(124, 58, 237, 0.1);
  }
}

.attr-name {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.attr-value {
  font-size: 0.85em;
  color: #fff;
  font-weight: 500;
  background: rgba(124, 58, 237, 0.15);
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(124, 58, 237, 0.3);
  min-width: 60px;
  text-align: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(124, 58, 237, 0.2);
    border-color: rgba(124, 58, 237, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(124, 58, 237, 0.15);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 紧凑模式 */
.compact {
  height: 80px;

  .header-content {
    padding: 12px 24px;
  }

  .avatar-container {
    width: 56px;
    height: 56px;
    border-radius: 8px;
  }

  .title {
    font-size: 1.2em;
  }

  .attributes-section {
    display: none;
  }
}
</style>
