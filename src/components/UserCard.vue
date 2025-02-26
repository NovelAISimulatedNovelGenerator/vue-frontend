<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { defineProps, defineEmits, withDefaults } from 'vue'
import type { Archive } from '../types'
import { useRouter } from 'vue-router'
import {
  NButton,
  NIcon,
  NSpace,
  NTooltip,
  NDivider
} from 'naive-ui'
import {
  ChevronBackOutline as CollapseIcon,
  AddOutline as CreateIcon,
  LogOutOutline as LogoutIcon,
  GridOutline as ManageIcon,
  EllipseOutline as StatusIcon
} from '@vicons/ionicons5'

interface Props {
  username: string
  avatar?: string
  status?: string
  isCollapsed?: boolean
  archives?: Archive[]
  currentArchiveId?: string
  showManageButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  username: '未登录用户',
  avatar: 'https://t.2s.lol/?id=ba',
  status: '在线',
  isCollapsed: false,
  archives: () => [],
  currentArchiveId: undefined,
  showManageButton: true
})

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'createArchive'): void
  (e: 'toggle'): void
  (e: 'selectArchive', id: string): void
  (e: 'navigateToManage'): void
}>()

const localCollapsed = ref(props.isCollapsed)

watch(() => props.isCollapsed, (newValue) => {
  localCollapsed.value = newValue
})

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const handleCreateArchive = () => {
  console.log('创建新存档')
  emit('createArchive')
}

const toggleSidebar = () => {
  emit('toggle')
}

const handleSelectArchive = (id: string) => {
  emit('selectArchive', id)
}

const cachedAvatarStyle = computed(() => ({
  backgroundImage: `url(${props.avatar})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}))
</script>

<template>
  <div class="user-sidebar" :class="{ 'collapsed': isCollapsed }">
    <NTooltip placement="right" v-if="isCollapsed">
      <template #trigger>
        <div class="floating-avatar" @click="toggleSidebar">
          <div class="avatar" :style="cachedAvatarStyle">
            <span class="status-dot" :class="status?.toLowerCase()"></span>
          </div>
        </div>
      </template>
      展开侧边栏
    </NTooltip>
    
    <div class="content-wrapper" v-show="!isCollapsed">
      <div class="user-info">
        <div class="info-content">
          <div class="avatar-wrapper">
            <div class="avatar" :style="cachedAvatarStyle">
              <span class="status-dot" :class="status?.toLowerCase()"></span>
            </div>
          </div>
          <div class="user-details">
            <h3>{{ username }}</h3>
            <div class="status-text">
              <NIcon size="14" class="status-icon">
                <StatusIcon />
              </NIcon>
              {{ status }}
            </div>
          </div>
        </div>
        <NButton
          class="collapse-btn"
          circle
          secondary
          @click="toggleSidebar"
        >
          <template #icon>
            <NIcon><CollapseIcon /></NIcon>
          </template>
        </NButton>
      </div>

      <NDivider />

      <div class="archives-section">
        <div class="section-header">
          <h4>存档列表</h4>
          <NButton
            class="manage-btn"
            :class="{ 'active': !showManageButton }"
            text
            @click="$emit('navigateToManage')"
          >
            <template #icon>
              <NIcon><ManageIcon /></NIcon>
            </template>
            管理存档
          </NButton>
        </div>

        <div class="archives-list">
          <NButton
            v-for="archive in archives"
            :key="archive.id"
            class="archive-item"
            :class="{ 'active': showManageButton && archive.id === currentArchiveId }"
            text
            @click="handleSelectArchive(archive.id)"
          >
            {{ archive.title }}
          </NButton>
        </div>
      </div>

      <div class="actions">
        <NSpace vertical>
          <NButton
            class="action-btn"
            block
            @click="handleCreateArchive"
          >
            <template #icon>
              <NIcon><CreateIcon /></NIcon>
            </template>
            创建存档
          </NButton>
          
          <NButton
            class="action-btn logout"
            block
            @click="handleLogout"
          >
            <template #icon>
              <NIcon><LogoutIcon /></NIcon>
            </template>
            退出登录
          </NButton>
        </NSpace>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  padding-left: 10px;
  height: 100vh;
  background: rgba(24, 24, 28, 0.65);
  width: 240px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.user-sidebar::before {
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
    rgba(124, 58, 237, 0.02) 10px,
    rgba(124, 58, 237, 0.02) 20px
  );
  pointer-events: none;
}

.collapsed {
  width: 0;
  padding: 0;
  background: transparent;
  border: none;
}

.floating-avatar {
  position: fixed;
  left: 16px;
  top: 16px;
  width: 48px;
  height: 48px;
  background: rgba(24, 24, 28, 0.95);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.floating-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 2px 12px rgba(124, 58, 237, 0.2);
}

.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
}

.info-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  position: relative;
  border: 2px solid rgba(124, 58, 237, 0.3);
  transition: all 0.3s ease;
}

.avatar:hover {
  border-color: rgba(124, 58, 237, 0.5);
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(24, 24, 28, 0.95);
  z-index: 1;
}

.status-dot.在线 {
  background: #10B981;
}

.status-dot.离线 {
  background: #6B7280;
}

.status-dot.忙碌 {
  background: #EF4444;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-details h3 {
  margin: 0;
  font-size: 1em;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9em;
}

.status-icon {
  color: #10B981;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.archives-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h4 {
  margin: 0;
  font-size: 0.9em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.manage-btn {
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 0.9em;
  border-radius: 6px !important;
  padding: 0px 9px !important;
}

.manage-btn:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}

.manage-btn.active {
  background: rgba(124, 58, 237, 0.1) !important;
  color: #fff !important;
}

.archives-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 8px;
}

.archives-list::-webkit-scrollbar {
  width: 4px;
}

.archives-list::-webkit-scrollbar-track {
  background: transparent;
}

.archives-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.archives-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.archive-item {
  text-align: left !important;
  padding: 8px 12px !important;
  color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  position: relative !important;
  overflow: hidden !important;
}

.archive-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(124, 58, 237, 0.03) 5px,
    rgba(124, 58, 237, 0.03) 10px
  );
  opacity: 0;
  transition: opacity 0.2s ease;
}

.archive-item:hover::before,
.archive-item.active::before {
  opacity: 1;
}

.archive-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #fff !important;
}

.archive-item.active {
  background: rgba(124, 58, 237, 0.1) !important;
  color: #fff !important;
}

.actions {
  margin-top: auto;
  margin-bottom: 32px;
  padding-top: 16px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  height: 40px !important;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.action-btn.logout {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.2) !important;
  color: rgb(239, 68, 68) !important;
}

.action-btn.logout:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
}
@media screen and (max-width: 768px) {
  .user-sidebar::before {
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
    rgba(124, 58, 237, 0.02) 10px,
    rgba(124, 58, 237, 0.02) 20px
  );
  pointer-events: none;
}
}
</style>
