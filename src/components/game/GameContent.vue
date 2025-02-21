<script setup lang="ts">
import { defineProps, ref, onUnmounted, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ChoiceCards from './ChoiceCards.vue'

const route = useRoute()

defineEmits<{
  (e: 'scroll', event: Event): void
}>()

const props = defineProps<{
  event: {
    event_id: string,
    type: string,
    name: string,
    description: string,
    forks: Array<{
      event_id: string,
      name: string,
      description: string
    }>
  }
}>()


// 根据标点符号和字数分段，同时过滤掉反斜杠
const splitDescription = (description: string) => {
  // 1. 去除多余的反斜杠
  const cleanText = description.replace(/\\\\/g, '\\')
                             .replace(/\\"/g, '"')
  
  // 2. 按照双换行符分段
  const parts = cleanText.split('\n\n').filter(part => part.trim())
  
  // 3. 处理每段中的特殊字符
  return parts.map(part => 
    part.trim()
      .replace(/\\n/g, '\n') // 保留单个换行
      .replace(/\\/g, '')    // 移除剩余的反斜杠
  )
}

const descriptionParts = splitDescription(props.event.description)
const currentPartIndex = ref(0)
const currentCharIndex = ref(0) // 改为从0开始
const autoPlay = ref(false)
        
const autoPlayInterval = ref<number | null>(null)
const isAutoPlaying = ref(false)

const textRevealSpeed = 50 // 文字显示速度
let revealInterval: number | null = null

const revealText = () => {
  if (revealInterval) {
    // 如果正在显示，则立即显示完当前段落
    clearInterval(revealInterval)
    revealInterval = null
    currentCharIndex.value = descriptionParts[currentPartIndex.value].length
    if (currentPartIndex.value < descriptionParts.length - 1) {
      currentPartIndex.value++
      currentCharIndex.value = 0
      startRevealAnimation()
    }
  } else if (currentPartIndex.value < descriptionParts.length - 1 || 
             currentCharIndex.value < descriptionParts[currentPartIndex.value].length) {
    startRevealAnimation()
  }
}

const startRevealAnimation = () => {
  if (revealInterval) return // 防止重复启动动画
  
  revealInterval = setInterval(() => {
    if (currentCharIndex.value < descriptionParts[currentPartIndex.value].length) {
      currentCharIndex.value++
    } else {
      clearInterval(revealInterval)
      revealInterval = null
      if (currentPartIndex.value < descriptionParts.length - 1) {
        currentPartIndex.value++
        currentCharIndex.value = 0
      }
    }
  }, textRevealSpeed)
}

// 在组件挂载时自动开始第一行的动画
onMounted(() => {
  startRevealAnimation() // 组件挂载后自动开始第一行动画
})

// 修改handleTextClick为单一入口点
const handleTextClick = () => {
  revealText()
}

// 添加选择按钮动画控制
const visibleForks = ref<string[]>([])
const showForks = () => {
  props.event.forks.forEach((fork, index) => {
    setTimeout(() => {
      visibleForks.value.push(fork.event_id)
    }, index * 300) // 每个按钮间隔300ms出现
  })
}

// 监听文本是否完全显示，显示完毕后触发选择按钮动画
watch([currentPartIndex, currentCharIndex], ([partIndex, charIndex]) => {
  if (partIndex === descriptionParts.length - 1 && 
      charIndex === descriptionParts[partIndex].length) {
    visibleForks.value = []
    setTimeout(showForks, 500) // 等待500ms后开始显示按钮
  }
})

const showChoices = ref(false)

// 修改监听逻辑，确保文本显示完成后显示选项
watch([currentPartIndex, currentCharIndex], ([partIndex, charIndex]) => {
  if (partIndex === descriptionParts.length - 1 && 
      charIndex === descriptionParts[partIndex].length) {
    setTimeout(() => {
      showChoices.value = true
    }, 500)
  }
})


onUnmounted(() => {
  if (revealInterval) clearInterval(revealInterval)
  if (autoPlayInterval.value) clearInterval(autoPlayInterval.value)
})

const isTextExpanded = ref(false)

const toggleText = () => {
  if (!isTextExpanded.value) {
    isTextExpanded.value = true
    revealText()
  }
}

const toggleChoices = () => {
  showChoices.value = !showChoices.value
}

// 修改自动播放逻辑，使用相同的显示函数
const toggleAutoPlay = () => {
  if (isAutoPlaying.value) {
    if (autoPlayInterval.value) {
      clearInterval(autoPlayInterval.value)
      autoPlayInterval.value = null
    }
    isAutoPlaying.value = false
    return
  }

  isAutoPlaying.value = true
  const autoInterval = setInterval(() => {
    if (currentPartIndex.value === descriptionParts.length - 1 && 
        currentCharIndex.value >= descriptionParts[currentPartIndex.value].length) {
      clearInterval(autoInterval)
      isAutoPlaying.value = false
      return
    }
    revealText()
  }, 2000) // 每段之间的间隔时间
  autoPlayInterval.value = autoInterval
}

// 将文本重置和动画重启的逻辑提取成函数
const resetTextAnimation = () => {
  // 重置所有状态
  currentPartIndex.value = 0
  currentCharIndex.value = 0
  isAutoPlaying.value = false
  showChoices.value = false
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
    autoPlayInterval.value = null
  }
  if (revealInterval) {
    clearInterval(revealInterval)
    revealInterval = null
  }
  
  // 重新计算文本分段
  const newParts = splitDescription(props.event.description)
  descriptionParts.length = 0 // 清空数组
  descriptionParts.push(...newParts) // 添加新内容
  
  // 自动开始新事件的文本显示
  nextTick(() => {
    startRevealAnimation()
  })
}

// 同时监听事件ID和存档ID的变化
watch(
  () => ({
    eventId: props.event.event_id,
    archiveId: route.params.archiveId
  }),
  (newVal, oldVal) => {
    if (newVal.eventId !== oldVal?.eventId || newVal.archiveId !== oldVal?.archiveId) {
      console.log('Event or archive changed:', newVal)
      resetTextAnimation()
    }
  },
  { immediate: true, deep: true }
)

// 动画状态
const animationFrame = ref(0);

// 每200ms更新一次动画帧
const startAnimation = () => {
  setInterval(() => {
    animationFrame.value = (animationFrame.value + 1) % 6;
  }, 200);
};

onMounted(() => {
  startAnimation();
});
</script>

<template>
  <div class="all-content" >
    <div class="game-content">
      <div class="content-container" :key="event.event_id">
        <div class="header-container">
          <h2>{{ event.name }}</h2>
          <div class="controls-container">
            <button 
              class="control-btn" 
              :class="{ active: isAutoPlaying }"
              @click="toggleAutoPlay"
            >
              <div class="btn-content">
                <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                  <path 
                    :d="isAutoPlaying 
                      ? 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' 
                      : 'M8 5v14l11-7z'" 
                    fill="currentColor"
                  />
                </svg>
                <span>{{ isAutoPlaying ? '暂停' : '自动' }}</span>
              </div>
            </button>

            <button 
              class="control-btn" 
              :class="{ active: showChoices }"
              @click="toggleChoices"
            >
              <div class="btn-content">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z" fill="currentColor"/>
                </svg>
                <span>选项</span>
              </div>
            </button>
          </div>
        </div>
        
        <div class="text-section">
          <div 
            class="text-content scrollable-text" 
            @click.stop="handleTextClick"
            @wheel.stop
          >
            <div v-for="(part, index) in descriptionParts" :key="index" class="paragraph">
              <p>
                <span v-for="(char, charIndex) in part" :key="charIndex" 
                      :class="{ blurred: index > currentPartIndex || 
                              (index === currentPartIndex && 
                               charIndex >= currentCharIndex) }">
                  {{ char }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ChoiceCards 
        v-if="showChoices"
        :choices="event.forks"
        :visible="true"
        :current-event-id="event.event_id"
        @close="showChoices = false"
      />
  </div>
</template>

<style scoped>
.all-content {
  flex: 1;
  background: linear-gradient(135deg, #1a1b1e, #2a2b2e);
  overflow-y: hidden;
  padding: 10px;
  margin: 0 10px;
  display: flex;
  justify-content: center;
}

.game-content {
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 0.8rem;
  background: var(--n-color);
  border-radius: var(--n-border-radius);
  transition: all 0.3s var(--n-bezier);
}

.content-wrapper {
  
  margin: 0 auto;
  font-size: 1rem;
  line-height: 1.6;
  letter-spacing: 0.02em;
}

.paragraph {
  margin-bottom: 1em;
  text-align: justify;
  overflow-wrap: break-word;
  text-indent: 2em;
  padding: 0 0.5em;
}

.text-content {
  padding: 12px 16px;
  font-size: 0.95rem;
  line-height: 1.7;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.95);
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

.text-content p {
  margin: 0.8em 0;
  text-indent: 2em;
}

span {
  display: inline;
  transition: filter 0.3s ease, opacity 0.3s ease;
  font-family: inherit;
  line-height: inherit;
  letter-spacing: inherit;
}

.blurred {
  filter: blur(4px);
  opacity: 0.3;
}

.game-content {
  background: var(--n-color, rgba(24, 24, 28, 0.95));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 100%;
  
  height: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--n-border-color, rgba(255, 255, 255, 0.09));
  color: var(--n-text-color, #fff);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s var(--n-bezier);
}

.content-container {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px 8px;
  border-bottom: 1px solid var(--n-divider-color, rgba(255, 255, 255, 0.09));
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 10;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, var(--n-text-color, #fff) 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-section {
  position: relative;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--n-card-color, rgba(0, 0, 0, 0.2));
  border-radius: 16px;
  border: 1px solid var(--n-border-color, rgba(255, 255, 255, 0.06));
}

.text-content {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  font-family: v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.8;
  font-size: 17px;
  color: var(--n-text-color, rgba(255, 255, 255, 0.9));
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: all .3s var(--n-bezier);
  position: relative;
  overflow: hidden;
}

.scrollable-text {
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  scroll-behavior: smooth;
  height: 100%;
  padding-right: 20px;
  -ms-overflow-style: none;
  scrollbar-width: none;
  position: relative;
}

.scrollable-text::-webkit-scrollbar {
  display: none;
}

.paragraph {
  margin-bottom: 1.2em;
  animation: fadeIn 0.3s cubic-bezier(.4, 0, .2, 1);
  opacity: 0.95;
  transition: opacity 0.3s var(--n-bezier);
  position: relative;
}

.paragraph:hover {
  opacity: 1;
}

.paragraph p {
  margin: 0;
  text-indent: 2em;
  transition: color .3s var(--n-bezier);
}

.paragraph p::selection,
.paragraph p *::selection {
  background: var(--n-primary-color-hover, rgba(18, 184, 134, 0.2));
}

span {
  display: inline;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

.blurred {
  filter: blur(4px);
  opacity: 0.3;
}

.text-content {
  cursor: pointer;
}

.game-content {
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  background: var(--n-color);
  border-radius: var(--n-border-radius);
  transition: all 0.3s var(--n-bezier);
}

.content-wrapper {
 
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.8;
  letter-spacing: 0.05em;
}

.paragraph {
  margin-bottom: 1.5em;
  text-align: justify;
  overflow-wrap: break-word;
}

.button-area, .choice-btn, .choice-content, .choice-title, .choice-description {
  display: none;
}

.controls-container {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 10;
  padding: 0 32px;
}

.control-btn {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-content span {
  font-size: 0.9rem;
  font-weight: 500;
}

.control-btn:hover {
  background: rgba(74, 144, 226, 0.15);
  border-color: rgba(74, 144, 226, 0.3);
  transform: translateY(-2px);
}

.control-btn.active {
  background: rgba(74, 144, 226, 0.2);
  border-color: rgba(74, 144, 226, 0.4);
  color: #4a90e2;
}

.text-section {
  position: relative;
  margin: 20px 0;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.text-content {
  cursor: pointer;
}

.text-content.collapsed {
  max-height: 100px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.text-expand-hint {
  display: none;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}
</style>
