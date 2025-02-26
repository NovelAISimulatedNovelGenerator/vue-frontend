<script setup lang="ts">
import { NForm, NFormItem, NInput } from 'naive-ui'
import { ref, watch, onMounted } from 'vue'
import gsap from 'gsap'

const props = defineProps<{
  isLogin: boolean
  loading: boolean
  loginSuccess: boolean
  form: {
    username: string
    password: string
    confirmPassword: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:form', form: any): void
  (e: 'submit'): void
  (e: 'toggle'): void
}>()

const updateFormField = (field: string, value: string) => {
  emit('update:form', {
    ...props.form,
    [field]: value
  })
}

const formRef = ref(null)
const brandRef = ref(null)
const inputsRef = ref(null)
const buttonsRef = ref(null)
const isAnimating = ref(false)

// 保存当前表单状态
const currentForm = ref({
  mode: true, // true为登录，false为注册
  fields: {
    username: '',
    password: '',
    confirmPassword: ''
  }
})

// 同步外部表单到内部状态
watch(() => props.form, (newForm) => {
  if (!isAnimating.value) {
    currentForm.value.fields = { ...newForm }
  }
}, { deep: true })

// 动画控制
const switchForm = async (isLogin: boolean) => {
  if (isAnimating.value) return
  isAnimating.value = true
  
  // 第一步：隐藏当前表单内容
  await gsap.to([inputsRef.value, buttonsRef.value], {
    opacity: 0,
    y: isLogin ? -10 : 10, // 减小位移距离
    duration: 0.2,
    ease: 'power2.out'
  })

  // 第二步：品牌区域动画
  gsap.to(brandRef.value, {
    y: isLogin ? 0 : -brandRef.value.offsetHeight, // 使用实际高度
    duration: 0.3,
    ease: 'power2.inOut',
  })

  // 第三步：更新内部表单状态
  currentForm.value = {
    mode: isLogin,
    fields: { ...props.form }
  }

  // 第四步：调整内边距补偿空间
  await gsap.to(formRef.value, {
    paddingTop: isLogin ? '20px' : 0,
    duration: 0.3,
    ease: 'power2.inOut'
  })

  // 第五步：显示新的表单内容
  await gsap.fromTo([inputsRef.value, buttonsRef.value],
    {
      opacity: 0,
      y: isLogin ? 10 : -10 // 减小位移距离
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.25,
      stagger: 0.05,
      ease: 'power2.out'
    }
  )

  isAnimating.value = false
}

// 处理表单切换
const handleToggle = () => {
  if (isAnimating.value) return
  emit('toggle')
}

// 监听登录状态变化
watch(() => props.isLogin, (newVal) => {
  if (newVal !== currentForm.value.mode) {
    switchForm(newVal)
  }
})

// 初始化
onMounted(() => {
  currentForm.value = {
    mode: props.isLogin,
    fields: { ...props.form }
  }
  gsap.set([inputsRef.value, buttonsRef.value], { opacity: 1 })
})
</script>

<template>
  <div class="m-cyber-box" :class="{ 'fade-out': loginSuccess }">
    <!-- 品牌区域 -->
    <div ref="brandRef" class="m-brand-panel">
      <div class="m-brand-content">
        <h1 class="m-title">妄想模拟器</h1>
        <p class="m-subtitle">{{ currentForm.mode ? 'AI驱动的虚构世界' : '创建虚拟身份' }}</p>
      </div>
    </div>

    <!-- 表单区域 -->
    <div ref="formRef" class="m-form-panel">
      <div ref="inputsRef" class="m-form-content">
        <n-form class="m-form">
          <n-form-item 
            label="用户标识"
            :theme-overrides="{
              labelTextColor: '#fff',
              labelFontWeight: '500'
            }"
          >
            <n-input
              :value="currentForm.fields.username"
              @update:value="v => updateFormField('username', v)"
              :disabled="loading || isAnimating"
              placeholder="请输入用户标识"
              type="text"
              class="m-input"
              :theme-overrides="{
                textColor: '#fff',
                placeholderColor: 'rgba(0, 255, 249, 0.4)',
                borderFocus: '1px solid var(--cyber-blue)',
                boxShadowFocus: '0 0 10px rgba(0, 255, 249, 0.4)'
              }"
            />
          </n-form-item>

          <n-form-item 
            label="访问密钥"
            :theme-overrides="{
              labelTextColor: '#fff',
              labelFontWeight: '500'
            }"
          >
            <n-input
              :value="currentForm.fields.password"
              @update:value="v => updateFormField('password', v)"
              :disabled="loading || isAnimating"
              placeholder="请输入访问密钥"
              type="password"
              class="m-input"
              :theme-overrides="{
                textColor: '#fff',
                placeholderColor: 'rgba(0, 255, 249, 0.4)',
                borderFocus: '1px solid var(--cyber-blue)',
                boxShadowFocus: '0 0 10px rgba(0, 255, 249, 0.4)'
              }"
            />
          </n-form-item>

          <n-form-item 
            v-if="!currentForm.mode" 
            label="确认密钥"
            :theme-overrides="{
              labelTextColor: '#fff',
              labelFontWeight: '500'
            }"
          >
            <n-input
              :value="currentForm.fields.confirmPassword"
              @update:value="v => updateFormField('confirmPassword', v)"
              :disabled="loading || isAnimating"
              placeholder="请确认访问密钥"
              type="password"
              class="m-input"
              :theme-overrides="{
                textColor: '#fff',
                placeholderColor: 'rgba(0, 255, 249, 0.4)',
                borderFocus: '1px solid var(--cyber-blue)',
                boxShadowFocus: '0 0 10px rgba(0, 255, 249, 0.4)'
              }"
            />
          </n-form-item>
        </n-form>
      </div>

      <div ref="buttonsRef" class="m-button-group">
        <button 
          type="button"
          class="m-submit-btn" 
          @click="emit('submit')"
          :disabled="loading || isAnimating"
        >
          <div class="m-btn-wrapper">
            <span class="m-btn-bg"></span>
            <span class="m-btn-text">{{ loading ? '验证中...' : (currentForm.mode ? '接入系统' : '确认创建') }}</span>
          </div>
        </button>
        
        <button 
          type="button"
          class="m-toggle-btn" 
          @click="handleToggle"
          :disabled="isAnimating"
        >
          <span>{{ currentForm.mode ? '注册新身份' : '返回登录' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --cyber-blue: #00fff9;
  --cyber-pink: #ff2a6d;
  --cyber-blue-glow: rgba(0, 255, 249, 0.3);
  --cyber-pink-glow: rgba(255, 42, 109, 0.3);
  --cyber-bg: rgba(16, 10, 39, 0.85);
  --cyber-border: rgba(0, 255, 249, 0.3);
}

.m-cyber-box {
  width: min(92%, 420px);
  height: auto;
  min-height: min(85vh, 560px);
  background: var(--cyber-bg);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid var(--cyber-border);
  box-shadow: 0 0 20px rgba(0, 255, 249, 0.15), inset 0 0 3px rgba(255, 42, 109, 0.3);
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transform-origin: center center;
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.m-brand-panel {
  padding: 24px 20px;
  background: linear-gradient(135deg,
    rgba(0, 255, 249, 0.12),
    rgba(255, 42, 109, 0.12)
  );
  position: relative;
  z-index: 2;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  border-bottom: 1px solid rgba(0, 255, 249, 0.15);
}

.m-brand-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 5%,
    var(--cyber-blue) 50%,
    transparent 95%
  );
  opacity: 0.6;
  box-shadow: 0 0 10px var(--cyber-blue-glow);
}

.m-brand-panel.hide {
  transform: translateY(-100%);
  margin-bottom: -100%;
}

.m-brand-content {
  text-align: center;
  backface-visibility: hidden;
  perspective: 1000px;
}

.m-title {
  font-size: clamp(1.6em, 6vw, 2em);
  margin-bottom: 6px;
  color: #fff;
  text-align: center;
  text-shadow: 0 0 10px var(--cyber-blue), 0 0 15px var(--cyber-pink);
  letter-spacing: 1px;
  animation: titlePulse 3s infinite alternate;
}

.m-subtitle {
  font-size: clamp(0.9em, 3.5vw, 1em);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 8px var(--cyber-blue-glow);
  transition: all 0.3s ease;
}

.m-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  position: relative;
  z-index: 1;
  will-change: padding;
}

.m-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 15px 0 10px;
  will-change: transform, opacity;
}

.m-form :deep(.n-form-item) {
  margin-bottom: 16px;
}

.m-form :deep(.n-form-item-label) {
  padding-bottom: 6px;
}

.m-form :deep(.n-input) {
  --n-border: 1px solid rgba(0, 255, 249, 0.2);
  --n-border-hover: 1px solid var(--cyber-blue);
  --n-border-focus: 1px solid var(--cyber-blue);
  --n-box-shadow-focus: 0 0 12px rgba(0, 255, 249, 0.3);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.m-button-group {
  margin-top: auto;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 10;
  will-change: transform, opacity;
}

.m-submit-btn {
  width: 100%;
  height: 48px;
  position: relative;
  border: none;
  padding: 0;
  border-radius: 24px;
  background: transparent;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.m-btn-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.m-btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg,
    var(--cyber-blue),
    var(--cyber-pink)
  );
  border-radius: inherit;
  transition: filter 0.3s ease;
}

.m-btn-bg::before {
  content: '';
  position: absolute;
  inset: 1px;
  background: linear-gradient(45deg,
    rgba(0, 255, 249, 0.15),
    rgba(255, 42, 109, 0.15)
  );
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.m-submit-btn:hover .m-btn-bg::before {
  opacity: 1;
}

.m-btn-text {
  position: relative;
  z-index: 2;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(0, 255, 249, 0.5);
  pointer-events: none;
  user-select: none;
}

.m-submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.m-submit-btn:not(:disabled):active .m-btn-bg {
  filter: brightness(1.2);
}

.m-submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.m-submit-btn:disabled .m-btn-wrapper {
  opacity: 0.7;
  filter: grayscale(0.5);
}

.m-toggle-btn {
  background: transparent;
  border: none;
  color: var(--cyber-blue);
  font-size: 15px;
  padding: 12px;
  width: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: color 0.2s ease, text-shadow 0.2s ease;
  position: relative;
}

.m-toggle-btn::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 1px;
  background: var(--cyber-blue);
  transition: width 0.2s ease, background 0.2s ease;
  opacity: 0.7;
}

.m-toggle-btn:hover::after {
  width: 70%;
}

.m-toggle-btn:active::after {
  background: var(--cyber-pink);
  width: 80%;
}

.m-toggle-btn span {
  position: relative;
  z-index: 2;
  pointer-events: none;
  user-select: none;
}

.m-toggle-btn:hover {
  color: var(--cyber-blue);
  text-shadow: 0 0 8px var(--cyber-blue-glow);
}

.m-toggle-btn:active {
  color: var(--cyber-pink);
  text-shadow: 0 0 10px var(--cyber-pink-glow);
  transform: scale(0.98);
}

.m-toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-out {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes titlePulse {
  0% { 
    text-shadow: 
      0 0 10px var(--cyber-blue),
      0 0 20px var(--cyber-pink);
  }
  50% {
    text-shadow:
      0 0 15px var(--cyber-blue),
      0 0 25px var(--cyber-pink);
  }
  100% {
    text-shadow:
      0 0 8px var(--cyber-blue),
      0 0 18px var(--cyber-pink);
  }
}

/* 屏幕高度适配 */
@media screen and (max-height: 600px) {
  .m-cyber-box {
    height: auto;
    min-height: 480px;
    margin: 10px 0;
  }
  
  .m-brand-panel {
    padding: 16px;
  }
  
  .m-title {
    font-size: clamp(1.4em, 5vw, 1.6em);
    margin-bottom: 4px;
  }
  
  .m-subtitle {
    font-size: clamp(0.8em, 3vw, 0.9em);
  }
  
  .m-form-panel {
    padding: 15px 20px;
  }
  
  .m-form-content {
    padding-top: 10px;
  }
  
  .m-form :deep(.n-form-item) {
    margin-bottom: 12px;
  }
  
  .m-button-group {
    padding-bottom: 5px;
    gap: 8px;
  }
  
  .m-submit-btn {
    height: 42px;
  }
  
  .m-btn-text {
    font-size: 14px;
  }
  
  .m-toggle-btn {
    padding: 8px;
  }
}

/* 中小屏幕高度适配 */
@media screen and (min-height: 601px) and (max-height: 700px) {
  .m-cyber-box {
    min-height: 520px;
  }
  
  .m-brand-panel {
    padding: 18px;
  }
}

/* 特小屏幕适配 */
@media screen and (max-width: 320px) {
  .m-cyber-box {
    width: 95%;
    min-height: 460px;
  }
  
  .m-brand-panel {
    padding: 14px;
  }
  
  .m-title {
    font-size: 1.4em;
  }
  
  .m-form-panel {
    padding: 14px 18px;
  }
  
  .m-submit-btn {
    height: 40px;
  }
}

/* 横屏适配 */
@media screen and (max-height: 450px) and (orientation: landscape) {
  .m-cyber-box {
    min-height: 400px;
    height: auto;
  }
  
  .m-brand-panel {
    padding: 12px;
  }
  
  .m-title {
    font-size: 1.3em;
    margin-bottom: 2px;
  }
  
  .m-subtitle {
    font-size: 0.8em;
  }
  
  .m-form-panel {
    padding: 12px 18px;
  }
  
  .m-form :deep(.n-form-item) {
    margin-bottom: 8px;
  }
  
  .m-button-group {
    padding-top: 5px;
  }
}
</style>
