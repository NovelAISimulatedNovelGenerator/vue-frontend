<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArchiveStore } from '../stores/archive'
import { gameEvents } from '../api/gameEvents'
import GameHeader from '../components/game/GameHeader.vue'
import GameContent from '../components/game/GameContent.vue'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const archiveStore = useArchiveStore()

// 使用 storeToRefs 来保持响应性
const { archives, loading } = storeToRefs(archiveStore)

// 响应式获取当前存档
const currentArchive = computed(() => 
  archives.value.find(a => a.id === route.params.archiveId)
)

// 确保存档加载
const initArchive = async () => {
  await archiveStore.loadArchives()
  if (!currentArchive.value) {
    router.replace('/archive')
    return
  }
  archiveStore.setCurrentArchive(route.params.archiveId as string)
}

// 在组件挂载时加载存档
onMounted(initArchive)

// 监听 WebSocket 事件
onMounted(() => {
  // 初始化时切换到当前存档
  if (route.params.archiveId) {
    gameEvents.switchArchive(route.params.archiveId)
  }

  // 使用新的事件订阅方法
  const unsubscribeEvent = gameEvents.subscribeEvent((event) => {
    if (currentArchive.value) {
      archiveStore.updateCurrentEvent(currentArchive.value.id, event)
    }
  })

  const unsubscribeAttributes = gameEvents.subscribeAttributes((data) => {
    if (currentArchive.value) {
      const newAttributes = { ...currentArchive.value.attributes }
      newAttributes[data.attributeId] = data.value
      archiveStore.updateArchive({
        ...currentArchive.value,
        attributes: newAttributes
      })
    }
  })

  // 清理订阅
  onUnmounted(() => {
    unsubscribeEvent()
    unsubscribeAttributes()
  })
})

// 监听路由变化，确保切换存档时正确更新
watch(() => route.params.archiveId, (newId) => {
  if (newId && archives.value.length > 0) {
    const archive = archives.value.find(a => a.id === newId)
    if (!archive) {
      router.replace('/archive')
      return
    }
    archiveStore.setCurrentArchive(newId as string)
  }
})

// 监听路由变化，切换存档
watch(() => route.params.archiveId, (newId) => {
  if (newId) {
    gameEvents.switchArchive(newId)
  }
})



</script>

<template>
  <div v-if="loading" class="loading-overlay">
    加载中...
  </div>
  
  <div v-else-if="!currentArchive" class="error-overlay">
    存档不存在
  </div>

  <div v-else class="game-view">
    <GameHeader
      :archive="currentArchive"
    />

    <GameContent 
      v-if="currentArchive.currentEvent"
      :event="currentArchive.currentEvent"
    />
    <div v-else class="error-overlay">
      当前没有进行中的事件
    </div>
  </div>
</template>

<style scoped>
.game-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #1a1b1e;
}

.debug-info {
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-family: monospace;
  white-space: pre-wrap;
  color: #a8a8a8;
}

.loading-overlay,
.error-overlay {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dcddde;
  font-size: 1.2rem;
  background: #1a1b1e;
}

.error-overlay {
  color: #ed4245;
}
</style>
