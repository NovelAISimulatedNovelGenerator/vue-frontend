<script setup lang="ts">
import type { Archive } from '../types'
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isManageRoute = computed(() => route.name === 'ArchiveManage')
const isGameRoute = computed(() => route.name === 'Game')

const props = defineProps({
  username: {
    type: String,
    default: '未登录用户'
  },
  avatar: {
    type: String,
    default: 'https://t.2s.lol/?id=ba'
  },
  status: {
    type: String,
    default: '在线'
  },
  isExpanded: {
    type: Boolean,
    default: true
  },
  archives: {
    type: Array as () => Archive[],
    default: () => []
  },
  currentArchiveId: {
    type: String,
    default: undefined
  },
  showManageButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'createArchive'): void
  (e: 'toggleExpand'): void
  (e: 'selectArchive', id: string): void
  (e: 'navigateToManage'): void
}>()

const isCurrentArchive = (archiveId: string) => {
  return isGameRoute.value && route.params.archiveId === archiveId
}

// 计算当前活动按钮的位置
const activeButtonPosition = computed(() => {
  if (isManageRoute.value) {
    return 0 // 管理存档按钮的位置
  }
  if (props.currentArchiveId) {
    // 找到当前存档在列表中的位置
    const index = props.archives.findIndex(a => a.id === props.currentArchiveId)
    if (index !== -1) {
      return index + 1 // +1 是因为管理存档按钮
    }
  }
  return -1 // 没有选中项
})

const updateIndicatorPosition = () => {
  const position = activeButtonPosition.value
  if (position >= 0) {
    const offset = position * (44 + 4) // 按钮高度 + 间距
    document.documentElement.style.setProperty('--active-y', `${offset}px`)
    document.documentElement.style.setProperty('--indicator-opacity', '1')
  } else {
    document.documentElement.style.setProperty('--indicator-opacity', '0')
  }
}

// 监听活动按钮位置的变化
watch(activeButtonPosition, () => {
  setTimeout(updateIndicatorPosition, 0)
})

// 监听存档列表的变化
watch(() => props.archives, () => {
  setTimeout(updateIndicatorPosition, 0)
}, { deep: true })

// 监听路由变化
watch(() => route.name, () => {
  setTimeout(updateIndicatorPosition, 0)
})

onMounted(() => {
  updateIndicatorPosition()
})

const onMouseMove = (e: MouseEvent) => {
  const list = e.currentTarget as HTMLElement
  const listRect = list.getBoundingClientRect()
  const y = e.clientY - listRect.top
  const buttonHeight = 44 // 按钮高度

  // 找到最接近的按钮位置
  const index = Math.floor(y / buttonHeight)
  if (index >= 0 && index < props.archives.length + 1) { // +1 for manage button
    document.documentElement.style.setProperty('--hover-y', `${index * (buttonHeight + 4)}px`)
    document.documentElement.style.setProperty('--hover-opacity', '0.5')
  }
}

const onMouseLeave = () => {
  document.documentElement.style.setProperty('--hover-opacity', '0')
}
</script>

<template>
  <div class="sidebar" :class="{ active: isExpanded }">
    <!-- 头像区域 -->
    <div class="avatar-section" @click="$emit('toggleExpand')">
      <div class="avatar" :style="{ backgroundImage: `url(${avatar})` }">
        <span class="status-dot" :class="status?.toLowerCase()"></span>
      </div>
      <div class="user-info" v-show="isExpanded">
        <div class="username">{{ username }}</div>
        <div class="status">{{ status }}</div>
      </div>
      <div class="toggle-btn" v-show="isExpanded">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <!-- 导航区域 -->
    <div class="nav-container">
      <!-- 管理存档按钮 -->
      <button class="nav-btn" :class="{ 'active': isManageRoute }" @click="$emit('navigateToManage')">
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M3 12h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span v-show="isExpanded">管理存档</span>
      </button>

      <!-- 存档列表 -->
      <button
        v-for="archive in archives"
        :key="archive.id"
        class="nav-btn"
        :class="{ 'active': isCurrentArchive(archive.id) }"
        @click="$emit('selectArchive', archive.id)"
      >
        <div class="icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span v-show="isExpanded" class="archive-title">{{ archive.title }}</span>
      </button>
    </div>

    <!-- 分割线 -->
    <div class="divider"></div>

    <!-- 创建存档按钮 -->
    <button class="nav-btn create-btn" @click="$emit('createArchive')">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span v-show="isExpanded">创建存档</span>
    </button>

    <!-- 底部退出按钮 -->
    <button class="nav-btn logout-btn" @click="$emit('logout')">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <span v-show="isExpanded">退出登录</span>
    </button>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  width: 70px;
  height: 100vh;
  background: #0f0a24;
  border-right: 1px solid rgba(124, 58, 237, 0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 100;
}

.sidebar.active {
  width: 240px;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.avatar-section:hover {
  background: rgba(124, 58, 237, 0.1);
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  position: relative;
  border: 2px solid rgba(124, 58, 237, 0.3);
  flex-shrink: 0;
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #0f0a24;
}

.online {
  background: #10B981;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.username {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.toggle-btn {
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
}

.toggle-btn:hover {
  color: #fff;
}

/* 导航容器 */
.nav-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 4px;
  flex: 1;
}

/* 导航按钮基础样式 */
.nav-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  width: 100%;
  text-align: left;
  height: 44px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-btn:hover:not(.active) {
  background: rgba(124, 58, 237, 0.1);
}

.nav-btn.active {
  color: #fff;
  background: #1a103a;
  box-shadow: inset 0 0 20px rgba(124, 58, 237, 0.2);
}

.nav-btn.active::after {
  content: '';
  position: absolute;
  inset: -1px;
  background: linear-gradient(45deg, #7c3aed, #ec4899, #38bdf8);
  border-radius: 13px;
  z-index: -1;
  opacity: 0.5;
  animation: borderGlow 2s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

.nav-btn span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分割线 */
.divider {
  height: 1px;
  background: rgba(124, 58, 237, 0.15);
  margin: 8px 12px;
}

/* 创建按钮样式 */
.create-btn {
  color: #A78BFA;
}

.create-btn:hover:not(.active) {
  background: rgba(124, 58, 237, 0.15);
  color: #C4B5FD;
}

/* 退出按钮特殊样式 */
.logout-btn {
  margin-top: 8px;
  margin-bottom: 16px;
  color: #F472B6;
}

.logout-btn:hover {
  color: #FB7185;
}

/* 存档标题样式 */
.archive-title {
  flex: 1;
  min-width: 0;
}
</style>