<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useArchiveStore } from '../stores/archive'
import { useUserStore } from '../stores/user'
import UserCard from '../components/UserCard.vue'
import CreateArchiveDialog from '../components/CreateArchiveDialog.vue'

const router = useRouter()
const route = useRoute()
const archiveStore = useArchiveStore()
const userStore = useUserStore()
const isExpanded = ref(true)
const showCreateDialog = ref(false)
const timeDisplay = ref('')
const timeCounter = ref(0)

let timeInterval: NodeJS.Timer

onMounted(() => {
  timeInterval = setInterval(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    const ms = now.getMilliseconds().toString().padStart(3, '0')
    timeCounter.value = (timeCounter.value + 1) % 1000
    const counter = timeCounter.value.toString().padStart(3, '0')
    
    timeDisplay.value = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}.${ms}${counter}`
  }, 16) // 约60fps的更新频率
})

onUnmounted(() => {
  clearInterval(timeInterval)
})

// 监听路由参数
watch(() => route.query.showCreateDialog, (newVal) => {
  showCreateDialog.value = newVal === 'true'
})

const handleCreateArchive = () => {
  if (route.name === 'ArchiveManage') {
    showCreateDialog.value = true
  } else {
    router.push({ 
      name: 'ArchiveManage',
      query: { showCreateDialog: 'true' } 
    })
  }
}

const handleCreateConfirm = async (title: string) => {
  const result = await archiveStore.createArchive(title)
  if (result.success) {
    showCreateDialog.value = false
    // 清除查询参数
    if (route.query.showCreateDialog) {
      router.replace({ query: {} })
    }
  } else {
    alert(result.error)
  }
}

const handleNavigation = (path: string) => {
  router.push(path)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handleSelectArchive = (id: string) => {
  archiveStore.setCurrentArchive(id)
  router.push(`/game/${id}`)
}

// 向上传递创建存档事件
const emit = defineEmits<{
  (e: 'createArchive'): void
}>()
</script>

<template>
  <div class="layout" :class="{ 'game-mode': route.name === 'Game' }">
    <aside class="sidebar" :class="{ 'collapsed': !isExpanded }">
      <UserCard
        :username="userStore.userInfo?.username || '测试用户'"
        :status="userStore.userInfo?.status || 'online'"
        :avatar="userStore.userInfo?.avatar || 'http://moe.jitsu.top/api/?sort=setu'"
        :isCollapsed="!isExpanded"
        :archives="archiveStore.archives"
        :currentArchiveId="archiveStore.currentArchiveId"
        :showManageButton="route.name !== 'ArchiveManage'"
        @logout="handleLogout"
        @createArchive="handleCreateArchive"
        @toggle="isExpanded = !isExpanded"
        @selectArchive="handleSelectArchive"
        @navigateToManage="() => handleNavigation('/archive')"
      />
    </aside>
    <main class="main-content" :class="{ 'expanded': isExpanded, 'game-mode': route.name === 'Game' }">
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </div>
    </main>

    <CreateArchiveDialog
      :show="showCreateDialog"
      @close="() => {
        showCreateDialog = false;
        if (route.query.showCreateDialog) {
          router.replace({ query: {} })
        }
      }"
      @create="handleCreateConfirm"
    />
  </div>
</template>

<style scoped lang="scss">
@use "sass:math";

.layout {
  min-height: 100vh;
  display: flex;
  position: relative;
  background: rgb(35, 32, 55);
  background: linear-gradient(
    135deg,
    rgb(35, 32, 55) 0%,
    rgb(50, 45, 75) 50%,
    rgb(35, 32, 55) 100%
  );
  overflow: hidden;
  transition: background 0.3s ease;

  &.game-mode {
    background: #000;
    .background-effects {
      opacity: 0;
      visibility: hidden;
    }
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 0, 102, 0.25) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.25) 0%, transparent 50%);
    pointer-events: none;
  }
}

.background-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  perspective: 2000px;
  transform-style: preserve-3d;
  overflow: hidden;
}

// 侧边栏样式
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 240px;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);

  
  &.collapsed {
    width: 0px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(64, 190, 255, 0.5),
      transparent
    );
    animation: borderGlow 4s ease-in-out infinite;
  }
}

.main-content {
  position: relative;
  flex: 1;
  margin-left: 0px;
  min-height: 100vh;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: calc(100% - 72px);
  position: relative;
  overflow: hidden;
}

.main-content.expanded {
  margin-left: 240px;
  width: calc(100% - 240px);
}

.main-content.game-mode {
  padding: 0; /* 游戏模式下移除内边距 */
}

.main-content.game-mode .content-container {
  max-width: none; /* 游戏模式下取消最大宽度限制 */
  padding: 0; /* 游戏模式下移除内边距 */
  height: 100vh; /* 确保游戏视图占满高度 */
}

.content-container {
  padding: 24px;
  height: 100%;
  max-width: 1920px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Mobile styles */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
  }

  .sidebar.collapsed {
    width: 100%;
  }

  .main-content {
    margin-left: 0;
    margin-top: 60px;
    width: 100%;
  }

  .main-content.expanded {
    margin-left: 0;
    width: 100%;
  }

  .content-container {
    padding: 16px;
  }
}

@keyframes borderGlow {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
