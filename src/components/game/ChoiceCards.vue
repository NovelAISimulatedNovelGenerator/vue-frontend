<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { gameEvents } from '../../api/gameEvents'

const route = useRoute()
const containerRef = ref<HTMLElement | null>(null)
const selectedCard = ref<string | null>(null)
const isTransitioning = ref(false)
const currentRotation = ref(0)
const isRotating = ref(false)
const lastRotationTime = ref(0)
const ROTATION_COOLDOWN = 200 // 缩短冷却时间

const props = defineProps<{
  choices: Array<{
    event_id: string,
    name: string,
    description: string
  }>
  visible: boolean
  currentEventId: string
}>()

// 根据选项数量决定显示模式
const displayMode = computed(() => {
  return props.choices.length >= 4 ? '3d' : 'horizontal'
})

// 计算单个卡片的角度
const singleCardAngle = computed(() => 360 / props.choices.length)

// 处理按钮触发旋转
const handleRotate = (direction: 'left' | 'right') => {
  // 如果卡片不可见或在冷却时间内，直接返回
  const now = Date.now()
  if (!props.visible || isRotating.value || now - lastRotationTime.value < ROTATION_COOLDOWN) {
    return
  }
  
  isRotating.value = true
  
  // 计算旋转角度
  const rotationAmount = (360 / props.choices.length) * (direction === 'left' ? -1 : 1)
  const startRotation = currentRotation.value
  const targetRotation = startRotation + rotationAmount
  
  // 使用动画帧实现平滑旋转
  let startTime = null
  const duration = 200 // 加快动画速度

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    
    // 使用缓动函数使动画更自然
    const easeProgress = 1 - Math.pow(1 - progress, 2) // 改用更快的缓动函数
    currentRotation.value = startRotation + (rotationAmount * easeProgress)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isRotating.value = false
      lastRotationTime.value = Date.now()
    }
  }
  
  requestAnimationFrame(animate)
}

// 获取卡片当前的位置状态
const getCardPosition = (index: number) => {
  if (displayMode.value !== '3d') return 'center'
  
  const totalCards = props.choices.length
  const angle = (index * (360 / totalCards)) + currentRotation.value
  const normalizedAngle = ((angle % 360) + 360) % 360

  // 简单地将圆分为三个区域：前方、左侧和右侧
  if (normalizedAngle >= 330 || normalizedAngle <= 30) {
    return 'center'
  } else if (normalizedAngle > 30 && normalizedAngle < 180) {
    return 'left'
  } else {
    return 'right'
  }
}

const handleCardClick = (eventId: string, index: number) => {
  // 如果卡片不可见或正在旋转/过渡中，直接返回
  if (!props.visible || isRotating.value || isTransitioning.value) return
  
  const position = getCardPosition(index)
  
  switch (position) {
    case 'center':
      handleSelect(eventId)
      break
    case 'left':
      handleRotate('right')
      break
    case 'right':
      handleRotate('left')
      break
  }
}

const cardStyles = computed(() => {
  if (displayMode.value === 'horizontal') {
    return props.choices.map((_, index) => {
      const offset = index - (props.choices.length - 1) / 2
      const translateX = offset * 380
      const isCenter = Math.abs(offset) < 0.1
      const isSelected = selectedCard.value === props.choices[index].event_id
      
      // 计算选中时的位置
      let transform = `translateX(${translateX}px)`
      if (selectedCard.value) {
        if (isSelected) {
          // 选中的卡片居中放大
          transform = 'translate(calc(-50% + 160px), calc(-50% + 240px)) scale(1.2)'
        } else {
          // 未选中的卡片向两侧移动并淡出
          const direction = offset > 0 ? 1 : -1
          transform = `translate(${direction * 100}vw, 0)`
        }
      }
      
      return {
        transform,
        zIndex: isSelected ? 10 : 1,
        opacity: selectedCard.value ? (isSelected ? 1 : 0) : 1,
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: '-160px',
        marginTop: '-240px',
        '--card-shine-opacity': isCenter ? '1' : '0.3',
        '--translate-x': `${translateX}px`,
        '--name-scale': isSelected ? '1.4' : '1'
      }
    })
  } else {
    const totalCards = props.choices.length
    const radius = 600
    const theta = (2 * Math.PI) / totalCards
    const visibleRange = Math.PI * 0.8
    
    return props.choices.map((_, index) => {
      const angle = (index * theta) + (currentRotation.value * Math.PI / 180)
      const x = radius * Math.sin(angle)
      const z = radius * Math.cos(angle)
      const scale = (z + radius) / (radius * 2)
      const isSelected = selectedCard.value === props.choices[index].event_id
      
      // 使用相同的函数来决定卡片状态
      const position = getCardPosition(index)
      const isCenter = position === 'center'
      
      let transform = `translate3d(${x}px, 0, ${z}px) rotateY(${angle * 180 / Math.PI}deg)`
      let opacity = scale > 0.3 ? (0.4 + (scale * 0.6)) : 0
      
      if (selectedCard.value) {
        if (isSelected) {
          transform = 'translate3d(0, 0, 400px) scale(1.2)'
          opacity = 1
        } else {
          transform = `translate3d(${x * 2}px, 0, ${z - radius}px) rotateY(${angle * 180 / Math.PI}deg)`
          opacity = 0
        }
      }
      
      return {
        transform,
        opacity,
        zIndex: Math.round(z + radius),
        pointerEvents: scale > 0.3 ? 'auto' : 'none',
        position: 'absolute',
        left: '-160px',
        top: '-240px',
        '--card-shine-opacity': scale > 0.8 ? '1' : '0.3',
        '--name-scale': isSelected ? '1.4' : '1',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isCenter ? 'pointer' : 'grab'
      }
    })
  }
})

// 添加计算属性控制按钮显示
const showControls = computed(() => !selectedCard.value && !isTransitioning.value)

const handleSelect = (choiceId: string) => {
  // 如果卡片不可见或正在过渡中，直接返回
  if (!props.visible || isTransitioning.value) return
  
  selectedCard.value = choiceId
  isTransitioning.value = true
  console.log(choiceId)
  gameEvents.executeChoice(
    route.params.archiveId as string,
    choiceId,
    props.currentEventId
  )

  // 先触发选择事件
  emit('select', choiceId, props.currentEventId)

  // 等待动画完成后再重置状态
  setTimeout(() => {
    isTransitioning.value = false
    selectedCard.value = null
  }, 900) // 增加延时确保动画完成
}

const closeCards = () => {
  emit('close')
}

const emit = defineEmits<{
  (e: 'select', eventId: string, fromEventId: string): void
  (e: 'close'): void
}>()
</script>

<template>
  <div 
    class="choice-cards-overlay" 
    :class="{ 
      visible: props.visible, 
      'is-selecting': selectedCard,
      'mode-3d': displayMode === '3d',
      'mode-horizontal': displayMode === 'horizontal'
    }"
    ref="containerRef"
  >
    <div class="choice-cards-background"></div>
    <div class="choices-wrapper">
      <div 
        class="cards-container" 
        :class="{ 'mode-3d': displayMode === '3d', 'mode-horizontal': displayMode === 'horizontal' }"
      >
        <!-- 添加旋转按钮 -->
        <div v-if="displayMode === '3d'" class="rotation-buttons" v-show="showControls">
          <button 
            class="rotate-btn left"
            @click="handleRotate('left')"
            :disabled="isRotating"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
            </svg>
          </button>
          <button 
            class="rotate-btn right"
            @click="handleRotate('right')"
            :disabled="isRotating"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        <div class="cards-container">
          <div 
            class="carousel-stage"
            :style="{
              transform: displayMode === '3d' ? `translateZ(${-400}px)` : 'none'
            }"
          >
            <button
              v-for="(choice, index) in props.choices"
              :key="choice.event_id"
              class="choice-card"
              :class="{ 
                'selected': selectedCard === choice.event_id,
                'not-selected': selectedCard && selectedCard !== choice.event_id,
                [getCardPosition(index)]: displayMode === '3d'
              }"
              :style="cardStyles[index]"
              @click="handleCardClick(choice.event_id, index)"
            >
              <div class="card-frame">
                <div class="metal-surface"></div>
                <div class="reflection-line"></div>
                <div class="dark-edge"></div>
                <div class="card-glow"></div>
                <div class="card-border-effect"></div>
                <div class="card-background"></div>
                <div class="card-content">
                  <div class="card-header">
                    <h3>{{ choice.name }}</h3>
                  </div>
                  <div class="description-container">
                    <p>{{ choice.description }}</p>
                  </div>
                  <div class="card-decoration">
                    <div class="card-corner top-left"></div>
                    <div class="card-corner top-right"></div>
                    <div class="card-corner bottom-left"></div>
                    <div class="card-corner bottom-right"></div>
                  </div>
                  <div class="card-shine-overlay"></div>
                  <div class="glitch-effect"></div>
                  <div class="cyber-divider"></div>
                  <div class="cyber-pattern"></div>
                  <div class="mirror-effect"></div>
                  <div class="shine-line"></div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div class="close-button-wrapper" v-show="showControls">
          <button class="close-btn" @click="closeCards" title="收起选项">
            <div class="close-btn-shape">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M7.41 15.41L14 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="currentColor"/>
              </svg>
              <span>收起选项</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.close-button-wrapper {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  transition: opacity 0.3s ease;
}

.close-btn {
  background: rgba(20, 20, 30, 0.8);
  border: 2px solid rgba(0, 255, 242, 0.3);
  border-radius: 20px;
  padding: 8px 24px;
  color: #fff;
  font-family: 'Chakra Petch', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(8px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 242, 0.1);
}

.close-btn:hover {
  background: rgba(30, 30, 40, 0.9);
  border-color: rgba(0, 255, 242, 0.5);
  transform: translateY(-2px);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 255, 242, 0.2);
}

.close-btn:active {
  transform: translateY(0);
}

.close-btn-shape {
  display: flex;
  align-items: center;
  gap: 4px;
}

.close-btn svg {
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.close-btn:hover svg {
  transform: translateY(-2px);
}

.close-btn span {
  font-size: 14px;
  letter-spacing: 1px;
  text-shadow: 0 0 8px rgba(0, 255, 242, 0.5);
}

.choice-cards-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
  user-select: none;
}

.choice-cards-overlay.visible {
  pointer-events: all;
}

.choice-cards-background {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.choice-cards-overlay.visible .choice-cards-background {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.choices-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.choice-cards-overlay.visible .choices-wrapper {
  opacity: 1;
}

.cards-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}

.mode-3d .cards-container {
  perspective: 2000px;
  perspective-origin: 50% 50%;
}

.carousel-stage {
  position: relative;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.mode-horizontal .carousel-stage {
  width: 100%;
  height: 100%;
}

.choice-card {
  position: absolute;
  width: 300px;
  height: 480px;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  transform-style: preserve-3d;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  user-select: none;
  cursor: pointer;
  perspective: 1000px;
  transform-origin: center center;
  pointer-events: auto;
  --neon-pink: #ff2d55;
  --cyber-blue: #00fff2;
  --deep-purple: #4A42AE;
  --card-border: 2px;
  --clip-path: polygon(
    0% 20px,
    20px 0,
    calc(100% - 20px) 0,
    100% 20px,
    100% calc(100% - 20px),
    calc(100% - 20px) 100%,
    20px 100%,
    0 calc(100% - 20px)
  );
}

.card-frame {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    rgba(12, 12, 20, 0.98) 0%,
    rgba(20, 20, 28, 0.99) 50%,
    rgba(12, 12, 20, 0.98) 100%
  );
  border: var(--card-border) solid transparent;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  clip-path: var(--clip-path);
  overflow: hidden;
}

.metal-surface {
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(
      45deg,
      rgba(40, 40, 50, 0.4) 0%,
      rgba(20, 20, 30, 0.7) 45%,
      rgba(30, 30, 40, 0.5) 50%,
      rgba(20, 20, 30, 0.7) 55%,
      rgba(40, 40, 50, 0.4) 100%
    );
  clip-path: var(--clip-path);
}

.reflection-line {
  position: absolute;
  inset: 0;
  background: 
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 0, 0, 0.8) 35%,
      rgba(106, 175, 242, 0.15) 50%,
      rgba(0, 0, 0, 0.8) 65%,
      transparent 100%
    );
  transform: translateX(-100%) skewX(-15deg);
  animation: reflectionMove 4s ease-in-out infinite;
  opacity: 0.3;
}

.dark-edge {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    145deg,
    transparent 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  clip-path: var(--clip-path);
}

.card-frame::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(90deg,
    var(--neon-pink),
    var(--cyber-blue),
    var(--neon-pink)
  );
  background-size: 200% 100%;
  clip-path: var(--clip-path);
  animation: borderGlow 3s linear infinite;
  opacity: 0.6;
}

.card-content {
  position: relative;
  height: 100%;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  text-align: left;
  z-index: 1;
  background: linear-gradient(
    165deg,
    rgba(20, 20, 30, 0.85),
    rgba(30, 30, 40, 0.75)
  );
}

.shine-line {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0) 45%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0) 55%,
    transparent
  );
  transform: translateX(-100%);
  animation: shineSweep 3s ease-in-out infinite;
  pointer-events: none;
}

.card-header {
  position: relative;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(15, 15, 25, 0.9);
  border-left: 3px solid var(--cyber-blue);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.card-header h3 {
  margin: 0;
  font-size: 1.8em;
  font-weight: 600;
  color: #ffffff;
  font-family: 'Chakra Petch', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 
    0 0 10px rgba(0, 255, 242, 0.5),
    2px 2px 0px rgba(0, 0, 0, 0.8);
}

.description-container {
  margin-top: 20px;
  padding: 15px;
  font-size: 1.1em;
  line-height: 1.6;
  color: #e8e8e8;
  font-family: 'Chakra Petch', sans-serif;
  background: rgba(15, 15, 25, 0.85);
  border-left: 3px solid var(--neon-pink);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.cyber-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(45deg, rgba(0, 255, 242, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 255, 242, 0.05) 25%, transparent 25%);
  background-size: 4px 4px;
  pointer-events: none;
}

.cyber-divider {
  position: relative;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    var(--cyber-blue) 20%,
    var(--neon-pink) 80%,
    transparent
  );
  margin: 20px 0;
  opacity: 0.7;
}

@keyframes shineSweep {
  0% {
    transform: translateX(-100%) skewX(-20deg);
  }
  50% {
    transform: translateX(100%) skewX(-20deg);
  }
  100% {
    transform: translateX(100%) skewX(-20deg);
  }
}

.choice-card.center:hover .shine-line {
  animation: shineSweep 2s ease-in-out infinite;
}

.choice-card.selected .shine-line {
  animation: shineSweep 1.5s ease-in-out infinite;
  opacity: 0.5;
  background: 
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 0, 0, 0.8) 35%,
      rgba(255, 45, 85, 0.2) 50%,
      rgba(0, 0, 0, 0.8) 65%,
      transparent 100%
    );
}

.choice-card.center:hover .card-frame::before {
  animation: borderGlow 1.5s linear infinite;
  opacity: 1;
}

.choice-card.selected .card-frame::before {
  animation: borderGlow 1s linear infinite;
  opacity: 1;
}

.choice-card.selected .card-header {
  border-left-color: var(--neon-pink);
}

.choice-card.selected .card-header h3 {
  color: var(--neon-pink);
  text-shadow: 
    0 0 10px var(--neon-pink),
    2px 2px 0px rgba(0, 0, 0, 0.8);
}

.choice-card.not-selected {
  opacity: 0.5;
  transform: scale(0.95) translateZ(-20px) !important;
  filter: brightness(0.7);
}

.rotation-buttons {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1150px; /* 增加宽度，让按钮位于卡片外侧 */
  z-index: 5;
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
  transition: opacity 0.3s ease;
}

@media (max-width: 1400px) {
  .rotation-buttons {
    width: 1000px;
  }
}

@media (max-width: 1200px) {
  .rotation-buttons {
    width: 800px;
  }
}

@media (max-width: 900px) {
  .rotation-buttons {
    width: 600px;
  }
}

.rotate-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: rgba(20, 20, 30, 0.8);
  backdrop-filter: blur(8px);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  pointer-events: auto;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 242, 0.1);
  border: 2px solid rgba(0, 255, 242, 0.3);
  transform: scale(1);
}

.rotate-btn:hover {
  background: rgba(30, 30, 40, 0.9);
  border-color: rgba(0, 255, 242, 0.5);
  transform: scale(1.05);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 255, 242, 0.2);
}

.rotate-btn:active {
  transform: scale(0.95);
}

.rotate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: scale(1);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.rotate-btn svg {
  width: 28px;
  height: 28px;
  opacity: 0.9;
  transition: all 0.2s ease;
}

.rotate-btn:hover svg {
  opacity: 1;
  filter: drop-shadow(0 0 8px rgba(0, 255, 242, 0.5));
}

.mode-3d .choice-card.selected {
  --card-background: linear-gradient(165deg, 
    rgba(64, 156, 255, 0.3),
    rgba(64, 156, 255, 0.2) 30%,
    rgba(64, 156, 255, 0.1) 60%
  );
}

.mode-3d .choice-card.selected .card-frame {
  background: var(--card-background);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(64, 156, 255, 0.2);
  backdrop-filter: blur(12px);
}

.mode-3d .choice-card:hover {
  transform: scale(1.02);
}

@media (max-width: 1200px) {
  .choice-card {
    width: 280px;
    height: 420px;
  }
  
  .mode-3d .choice-card {
    left: -140px;
    top: -210px;
  }
  
  .mode-horizontal .choice-card {
    margin-left: -140px;
    margin-top: -210px;
  }
}

@media (max-width: 768px) {
  .choice-card {
    width: 240px;
    height: 360px;
  }
  
  .mode-3d .choice-card {
    left: -120px;
    top: -180px;
  }
  
  .mode-horizontal .choice-card {
    margin-left: -120px;
    margin-top: -180px;
  }

  .card-content {
    padding: 24px;
  }

  .card-header {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .card-header h3 {
    font-size: 1.3em;
  }

  .description-container {
    font-size: 1em;
    padding: 0 16px 32px;
  }
}

.choice-card.selected {
  transform: scale(1.02);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.choice-card.selected .card-frame::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: 
    linear-gradient(90deg,
      var(--cyber-blue),
      var(--neon-pink),
      var(--cyber-blue)
    );
  background-size: 200% 100%;
  clip-path: var(--clip-path);
  animation: selectedBorderGlow 1.5s linear infinite;
  opacity: 0.8;
  filter: blur(1px);
}

.choice-card.selected .metal-surface {
  background: 
    linear-gradient(
      45deg,
      rgba(40, 40, 50, 0.6) 0%,
      rgba(20, 20, 30, 0.8) 45%,
      rgba(106, 175, 242, 0.2) 50%,
      rgba(20, 20, 30, 0.8) 55%,
      rgba(40, 40, 50, 0.6) 100%
    );
  animation: metalPulse 2s ease-in-out infinite;
}

.choice-card.selected .shine-line {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0) 45%,
    rgba(0, 255, 242, 0.2) 50%,
    rgba(255, 255, 255, 0) 55%,
    transparent
  );
  animation: selectedShineSweep 2s ease-in-out infinite;
}

.choice-card.selected .cyber-pattern {
  animation: patternPulse 2s ease-in-out infinite;
}

@keyframes selectedBorderGlow {
  0% {
    background-position: 0% center;
    filter: blur(1px);
  }
  50% {
    filter: blur(2px);
  }
  100% {
    background-position: 200% center;
    filter: blur(1px);
  }
}

@keyframes selectedShineSweep {
  0% {
    transform: translateX(-100%) skewX(-20deg);
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(100%) skewX(-20deg);
    opacity: 0.3;
  }
}

@keyframes metalPulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

@keyframes patternPulse {
  0% {
    opacity: 0.05;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    opacity: 0.05;
  }
}
</style>
