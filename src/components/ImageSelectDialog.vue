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
  { name: '奶龙表情', url: 'https://oiapi.net/API/FunBoxEmoji/?0=nailong' },
  { name: '柴郡猫猫', url: 'https://uapis.cn/api/imgapi/bq/maomao.php' },
  { name: '随机二次元', url: 'https://www.dmoe.cc/random.php' },
  { name: '随机setu', url: 'https://moe.jitsu.top/api/?sort=setu' },
  { name: '赛马娘', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E8%B5%9B%E9%A9%AC%E5%A8%98%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971' },
  { name: 'fate', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=Fate%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971' },
  { name: '为美好世界献上祝福', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E4%B8%BA%E7%BE%8E%E5%A5%BD%E4%B8%96%E7%95%8C%E7%8C%AE%E4%B8%8A%E7%A5%9D%E7%A6%8F%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971' },
  { name: '某科学的超电磁炮', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E6%9F%90%E7%A7%91%E5%AD%A6%E7%9A%84%E8%B6%85%E7%94%B5%E7%A3%81%E7%82%AE%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971' },
  { name: '原', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E5%8E%9F%E7%A5%9E%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971' },
  { name: '从零开始的异世界生活', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84%E5%BC%82%E4%B8%96%E7%95%8C%E7%94%9F%E6%B4%BB%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971' },
  { name: '东方project', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E4%B8%9C%E6%96%B9project1' },
  { name: '猫娘', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E7%8C%AB%E5%A8%981' },
  { name: '少女前线', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E5%B0%91%E5%A5%B3%E5%89%8D%E7%BA%BF1' },
  { name: '明日方舟1', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E6%98%8E%E6%97%A5%E6%96%B9%E8%88%9F1' },
  { name: '明日方舟2', url: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E6%98%8E%E6%97%A5%E6%96%B9%E8%88%9F2' }
]


function handleSelect(url: string) {
  console.log(url)
  emit('select', url)
}

function refreshPreview(img: HTMLImageElement) {
  const baseUrl = img.dataset.url
  if (!baseUrl || img.dataset.retried) return // 避免重复刷新
  img.dataset.retried = 'true' // 标记已重试
  img.src = baseUrl
}

function handleOverlayClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="show" class="dialog-overlay" @click="handleOverlayClick">
        <div class="dialog" @click.stop>
          <div class="dialog-header">
            <h2>选择图片源</h2>
            <button class="close-btn" @click="emit('close')">&times;</button>
          </div>
          
          <div class="dialog-content">
            <div class="image-list">
              <div 
                v-for="api in imageApis" 
                :key="api.url"
                class="image-option"
                :class="{ active: currentUrl?.startsWith(api.url) }"
                @click="handleSelect(api.url)"
              >
                <img 
                  :src="api.url"
                  :data-url="api.url"
                  :alt="api.name"
                  @error="(e) => refreshPreview(e.target)"
                >
                <div class="image-name">{{ api.name }}</div>
              </div>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="cancel-btn" @click="emit('close')">取消</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  width: min(800px, 90vw);
  max-height: min(80vh, 600px);
  background: rgba(24, 24, 28, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h2 {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.dialog-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.image-option {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: rgba(0, 0, 0, 0.2);
}

.image-option:hover {
  transform: translateY(-2px);
}

.image-option.active {
  border-color: #7C3AED;
}

.image-option img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  display: block;
}

.image-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.9em;
  text-align: center;
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 动画效果 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .dialog {
  animation: dialog-in 0.3s ease-out;
}

.dialog-leave-active .dialog {
  animation: dialog-in 0.3s ease-in reverse;
}

@keyframes dialog-in {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
