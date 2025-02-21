<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'
import { defineEmits, withDefaults } from 'vue'
import { useArchiveStore } from '../stores/archive'
import {
  NCard,
  NButton,
  NSpace,
  NTime,
  NProgress,
  NTooltip,
  NIcon,
  useMessage
} from 'naive-ui'
import {
  PencilOutline as EditIcon,
  TrashOutline as DeleteIcon,
  ImageOutline as ImageIcon,
  RefreshOutline as RefreshIcon,
  TimeOutline as TimeIcon,
  CalendarOutline as CalendarIcon,
  PlayOutline as PlayIcon
} from '@vicons/ionicons5'

const ImageSelectDialog = defineAsyncComponent(() => import('./ImageSelectDialog.vue'))

interface Props {
  id: string
  title: string
  imageUrl?: string
  actionText: string
  createdAt: string
  updatedAt: string
  lastPlayTime?: string
  progress?: number
  isSelected?: boolean
}

const props = withDefaults<Props>(defineProps<Props>(), {
  title: '默认存档名',
  imageUrl: 'https://t.2s.lol/?id=ba',
  actionText: '继续游戏',
  createdAt: '',
  updatedAt: '',
  lastPlayTime: '',
  progress: 0,
  isSelected: false
})

const message = useMessage()
const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'action', id: string): void
  (e: 'updateImage', id: string, url: string): void
  (e: 'select', id: string): void
  (e: 'animationComplete'): void
}>()

const archiveStore = useArchiveStore()
const showImageDialog = ref(false)
const isAnimating = ref(false)

const refreshImage = () => {
  if (props.imageUrl) {
    emit('updateImage', props.id, props.imageUrl)
    message.success('图片已刷新')
  }
}

const handleEdit = () => emit('edit', props.id)
const handleDelete = () => emit('delete', props.id)
const handleAction = () => emit('action', props.id)
const handleImageClick = (event: Event) => {
  event.stopPropagation()
  showImageDialog.value = true
}

const handleImageSelect = (url: string) => {
  emit('updateImage', props.id, url)
  showImageDialog.value = false
  message.success('图片已更新')
}

const handleSelect = () => {
  if (isAnimating.value) return
  isAnimating.value = true
  emit('select', props.id)
  
  const card = document.querySelector('.archive-card')
  card?.addEventListener('animationend', () => {
    emit('animationComplete')
  }, { once: true })
}

const handleClick = (e: Event) => {
  e.stopPropagation()
  const target = e.target as HTMLElement
  if (target.closest('.action-btn')) {
    emit('action', props.id)
  }
}
</script>

<template>
  <div class="archive-card-wrapper">
    <NCard
      class="archive-card"
      :class="{ 'is-selected': isSelected }"
      :bordered="false"
      @click="handleClick"
    >
      <div class="card-content">
        <div class="content-section">
          <div class="header-section">
            <div class="title-area">
              <div class="stripe-decoration"></div>
              <h3 class="title">{{ title }}</h3>
            </div>
            <NSpace>
              <NButton
                class="action-icon-btn"
                circle
                secondary
                @click="handleEdit"
              >
                <template #icon>
                  <NIcon><EditIcon /></NIcon>
                </template>
              </NButton>
              <NButton
                class="action-icon-btn delete"
                circle
                secondary
                @click="handleDelete"
              >
                <template #icon>
                  <NIcon><DeleteIcon /></NIcon>
                </template>
              </NButton>
            </NSpace>
          </div>

          <div 
            class="image-section"
            :class="{ 'has-image': imageUrl }"
            @click="handleImageClick"
          >
            <div class="stripe-pattern"></div>
            <img 
              v-if="imageUrl" 
              :src="imageUrl" 
              :alt="title"
            >
            <div v-else class="image-placeholder">
              <NIcon size="48">
                <ImageIcon />
              </NIcon>
            </div>
            
            <div class="image-overlay">
              <NSpace align="center">
                <NButton
                  class="overlay-btn"
                  circle
                  @click.stop="refreshImage"
                >
                  <template #icon>
                    <NIcon><RefreshIcon /></NIcon>
                  </template>
                </NButton>
              </NSpace>
            </div>
          </div>

          <div class="time-section">
            <div class="time-item">
              <NIcon size="14"><TimeIcon /></NIcon>
              <NTime
                :time="new Date(createdAt)"
                format="MM-dd HH:mm"
              />
            </div>
            <div class="time-separator"></div>
            <div class="time-item">
              <NIcon size="14"><CalendarIcon /></NIcon>
              <NTime
                :time="new Date(updatedAt)"
                format="MM-dd HH:mm"
              />
            </div>
          </div>

          <NButton
            class="play-btn"
            type="primary"
            @click="handleAction"
          >
            <template #icon>
              <NIcon><PlayIcon /></NIcon>
            </template>
            {{ actionText }}
          </NButton>
        </div>
      </div>
    </NCard>

    <ImageSelectDialog
      v-if="showImageDialog"
      :show="showImageDialog"
      :currentUrl="imageUrl"
      @close="showImageDialog = false"
      @select="handleImageSelect"
    />
  </div>
</template>

<style scoped>
.archive-card-wrapper {
  position: relative;
  width: 280px;
}

.archive-card {
  width: 100%;
  background: rgba(24, 24, 28, 0.95);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.archive-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(124, 58, 237, 0.03) 10px,
    rgba(124, 58, 237, 0.03) 20px
  );
  pointer-events: none;
}

.archive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.15);
}

.archive-card.is-selected {
  border-color: #7C3AED;
  box-shadow: 0 0 0 1px #7C3AED;
}

.card-content {
  margin: -16px;
}

.content-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.title-area {
  position: relative;
  padding-left: 12px;
  flex: 1;
}

.stripe-decoration {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 70%;
  background: linear-gradient(to bottom, #7C3AED, #C026D3);
}

.title {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-icon-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.2s ease !important;
}

.action-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  transform: scale(1.05);
}

.action-icon-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.2) !important;
  color: rgb(239, 68, 68) !important;
}

.image-section {
  position: relative;
  height: 140px;
  overflow: hidden;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stripe-pattern {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 5px,
    rgba(124, 58, 237, 0.05) 5px,
    rgba(124, 58, 237, 0.05) 10px
  );
  z-index: 1;
  pointer-events: none;
}

.image-section img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 2;
}

.image-section:hover img {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);
  z-index: 3;
}

.image-section:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.overlay-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05);
}

.time-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px;
  background: rgba(124, 58, 237, 0.05);
  border-radius: 6px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9em;
}

.time-separator {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
}

.play-btn {
  margin-top: 4px;
  height: 40px;
  background: linear-gradient(135deg, #7C3AED, #C026D3) !important;
  border: none !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease !important;
  position: relative;
  overflow: hidden;
}

.play-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.05) 10px,
    rgba(255, 255, 255, 0.05) 20px
  );
  pointer-events: none;
}

.play-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  opacity: 0.95;
}

:deep(.n-button__icon) {
  --n-icon-size: 16px;
}
</style>
