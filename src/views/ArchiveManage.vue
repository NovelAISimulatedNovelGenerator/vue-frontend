<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useArchiveStore } from '../stores/archive'
import type { Archive } from '../types'
import ArchiveCard from '../components/ArchiveCard.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import CreateArchiveDialog from '../components/CreateArchiveDialog.vue' // 添加导入

const router = useRouter()
const archiveStore = useArchiveStore()

// 监听存档列表变化
watch(() => archiveStore.archives, (newArchives) => {
  console.log('存档列表已更新:', newArchives)
}, { deep: true })

onMounted(async () => {
  await archiveStore.loadArchives()
})

const showEditDialog = ref(false)
const archiveToEdit = ref<Archive | null>(null)

// 处理编辑存档
const handleEdit = (id: string) => {
  const archive = archiveStore.archives.find(a => a.id === id)
  if (archive) {
    archiveToEdit.value = archive
    showEditDialog.value = true
  }
}

const handleEditConfirm = async (newTitle: string) => {
  if (archiveToEdit.value) {
    const result = await archiveStore.updateArchiveTitle(archiveToEdit.value.id, newTitle)
    if (result.success) {
      showEditDialog.value = false
      archiveToEdit.value = null
    } else {
      alert(result.error)
    }
  }
}

const showDeleteDialog = ref(false)
const archiveToDelete = ref<string | null>(null)

const handleDelete = (id: string) => {
  archiveToDelete.value = id
  showDeleteDialog.value = true
}

const handleDeleteConfirm = async () => {
  if (archiveToDelete.value) {
    await archiveStore.deleteArchive(archiveToDelete.value)
    showDeleteDialog.value = false
    archiveToDelete.value = null
  }
}

const handleEnterGame = (id: string) => {
  router.push(`/game/${id}`)
}

const handleUpdateImage = async (id: string, url: string) => {
  const result = await archiveStore.updateArchiveImage(id, url)
  if (!result.success) {
    alert(result.error)
  }
}
</script>

<template>
  <div class="archive-container">
    <div v-if="archiveStore.loading" class="loading">加载中...</div>
    <div v-else-if="archiveStore.error" class="error">{{ archiveStore.error }}</div>
    <div v-else class="archive-grid">
      <template v-if="archiveStore.archives.length > 0">
        <ArchiveCard
          v-for="archive in archiveStore.archives"
          :key="archive.id"
          :id="archive.id"
          :title="archive.title"
          :image-url="archive.imageUrl"
          :action-text="'继续游戏'"
          :created-at="archive.createdAt"
          :updated-at="archive.updatedAt"
          @edit="handleEdit"
          @delete="handleDelete"
          @action="handleEnterGame"
          @update-image="handleUpdateImage"
        />
      </template>
      <div v-else class="no-archives">
        还没有存档，点击侧边栏的"创建存档"按钮开始游戏
      </div>
    </div>
  </div>

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除存档"
    message="确定要删除这个存档吗？此操作无法撤销。"
    confirmText="删除"
    dangerous
    @confirm="handleDeleteConfirm"
    @cancel="showDeleteDialog = false"
  />

  <!-- 编辑对话框 -->
  <CreateArchiveDialog
    :show="showEditDialog"
    :initialTitle="archiveToEdit?.title"
    title="编辑存档名称"
    submitText="保存"
    @close="showEditDialog = false"
    @create="handleEditConfirm"
  />
</template>

<style scoped>
.archive-container {
  padding-top: 40px; /* 减少顶部间距，从140px改为40px */
  min-height: 100vh;  /* 移除 padding，由 MainLayout 管理 */
}

.archive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));  /* 匹配新的卡片宽度 */
  gap: 24px;  /* 减小网格间距 */
  justify-items: center;
  align-content: start; /* 添加这行，使内容从顶部开始排列 */
}

.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--discord-text);
  font-size: 1.2rem;
}

.error {
  color: var(--discord-danger);
}

.no-archives {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px;
  color: var(--discord-text-muted);
  font-size: 1.1rem;
}
</style>
