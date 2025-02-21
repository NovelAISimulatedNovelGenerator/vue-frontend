<script setup lang="ts">
const props = defineProps<{
  show: boolean
  currentUrl?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', url: string): void
}>()

const imageApis = [
  { name: '柴郡猫猫', url: 'https://uapis.cn/api/imgapi/bq/maomao.php' },
  { name: '随机二次元1', url: 'https://moe.jitsu.top/api/?sort=setu' },
  { name: '随机二次元2', url: 'https://www.loliapi.com/acg' },
  { name: '奶龙表情', url: 'https://oiapi.net/API/FunBoxEmoji/?0=nailong' }
]

function getImageUrl(baseUrl: string) {
  return `${baseUrl}&t=${Date.now()}`
}

function handleSelect(url: string) {
  emit('select', url)
}

function refreshPreview(img: HTMLImageElement) {
  const baseUrl = img.dataset.url
  if (!baseUrl) return
  img.src = getImageUrl(baseUrl)
}

function handleOverlayClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
    emit('close')
  }
}
</script>

<template>
  <Transition name="dialog">
    <div v-if="show" class="dialog-overlay" @click="handleOverlayClick">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h2>选择图片源</h2>
          <button class="close-btn" @click="emit('close')">
            <span class="close-icon"></span>
          </button>
        </div>
        
        <div class="dialog-content">
          <div class="image-grid">
            <div 
              v-for="api in imageApis" 
              :key="api.url"
              class="image-card"
              :class="{ active: currentUrl?.startsWith(api.url) }"
              @click="handleSelect(api.url)"
            >
              <div class="image-container">
                <img 
                  :src="api.url"
                  :data-url="api.url"
                  :alt="api.name"
                  @error="(e) => refreshPreview(e.target)"
                >
              </div>
              <div class="image-name">{{ api.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.dialog {
  width: min(800px, 90vw);
  background: rgba(13, 15, 25, 0.95);
  border-radius: 8px;
  border: 1px solid rgba(87, 97, 242, 0.3);
  box-shadow: 0 0 20px rgba(87, 97, 242, 0.2),
              inset 0 0 20px rgba(87, 97, 242, 0.1);
  overflow: hidden;
  animation: neon-pulse 4s infinite;
}

.dialog-header {
  padding: 16px 20px;
  background: rgba(13, 15, 25, 0.98);
  border-bottom: 1px solid rgba(87, 97, 242, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(87, 97, 242, 0.5);
}

.close-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  position: relative;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.close-btn:hover {
  opacity: 1;
  transform: rotate(90deg);
}

.close-icon {
  position: absolute;
  inset: 8px;
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    background: #fff;
    box-shadow: 0 0 5px rgba(87, 97, 242, 0.8);
  }
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(-45deg);
  }
}

.dialog-content {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(87, 97, 242, 0.5) rgba(13, 15, 25, 0.2);
}

.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.dialog-content::-webkit-scrollbar-track {
  background: rgba(13, 15, 25, 0.2);
}

.dialog-content::-webkit-scrollbar-thumb {
  background: rgba(87, 97, 242, 0.5);
  border-radius: 4px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-card {
  position: relative;
  border-radius: 8px;
  background: rgba(20, 22, 35, 0.8);
  border: 1px solid rgba(87, 97, 242, 0.2);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-card:hover {
  transform: translateY(-4px);
  border-color: rgba(87, 97, 242, 0.6);
  box-shadow: 0 4px 20px rgba(87, 97, 242, 0.2);
}

.image-card.active {
  border-color: rgba(87, 97, 242, 1);
  box-shadow: 0 0 15px rgba(87, 97, 242, 0.4);
}

.image-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-name {
  padding: 12px;
  background: rgba(13, 15, 25, 0.95);
  color: #fff;
  font-size: 0.9em;
  text-align: center;
  text-shadow: 0 0 5px rgba(87, 97, 242, 0.5);
}

/* 动画效果 */
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes neon-pulse {
  0%, 100% {
    border-color: rgba(87, 97, 242, 0.3);
    box-shadow: 0 0 20px rgba(87, 97, 242, 0.2),
                inset 0 0 20px rgba(87, 97, 242, 0.1);
  }
  50% {
    border-color: rgba(87, 97, 242, 0.5);
    box-shadow: 0 0 25px rgba(87, 97, 242, 0.3),
                inset 0 0 25px rgba(87, 97, 242, 0.2);
  }
}
</style>
