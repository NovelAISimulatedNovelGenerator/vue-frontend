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
.m-cyber-box {
  width: min(92%, 450px);
  height: min(70vh, 580px); /* 固定高度 */
  background: rgba(16, 10, 39, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 14px; /* 稍微减小圆角 */
  border: 1px solid rgba(0, 255, 249, 0.3);
  box-shadow: 0 0 20px rgba(0, 255, 249, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transform-origin: center center;
}

.m-brand-panel {
  margin: -20px -20px 0;
  padding: 20px;
  background: linear-gradient(135deg,
    rgba(0, 255, 249, 0.1),
    rgba(255, 42, 109, 0.1)
  );
  position: relative;
  z-index: 2;
  will-change: transform;
  transform: translate3d(0, 0, 0); /* 启用硬件加速 */
}

.m-brand-panel.hide {
  transform: translateY(-100%);
  margin-bottom: -100%;
}

.m-brand-panel.switching {
  transition-delay: 0.05s;
}

.m-brand-content {
  text-align: center;
  backface-visibility: hidden; /* 防止3D转换时的闪烁 */
  perspective: 1000px;
}

.m-title {
  font-size: clamp(1.6em, 6vw, 2em); /* 减小字体 */
  margin-bottom: 6px; /* 减小间距 */
  color: #fff;
  text-align: center;
  text-shadow: 0 0 10px var(--cyber-blue);
}

.m-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: relative;
  z-index: 1;
  will-change: padding;
}

.m-form-panel.register-mode {
  padding-top: 0;
}

.m-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 修改为顶部对齐 */
  padding: 10px 0;
  will-change: transform, opacity;
}

.m-form-title {
  font-size: 1.2em;
  color: #fff;
  text-align: center;
  margin-bottom: 20px; /* 减小标题下边距 */
  text-shadow: 0 0 10px var(--cyber-blue);
}

.expand .m-form-title {
  transform: scale(1.1);
  margin-bottom: 30px;
}

.m-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 修改为顶部对齐 */
  margin-bottom: 15px; /* 减小底部间距 */
}

.expand .m-input-group {
  justify-content: center; /* 注册时居中显示 */
}

.m-form :deep(.n-form-item) {
  margin-bottom: 12px; /* 减小表单项间距 */
}

.m-form :deep(.n-form-item-label) {
  padding-bottom: 8px;
}

.m-form :deep(.n-input) {
  --n-border: 1px solid rgba(0, 255, 249, 0.2);
  --n-border-hover: 1px solid var(--cyber-blue);
  --n-border-focus: 1px solid var(--cyber-blue);
  --n-box-shadow-focus: 0 0 8px rgba(0, 255, 249, 0.3);
  background: transparent;
}

.m-button-group {
  margin-top: 0; /* 移除顶部边距 */
  padding-bottom: 8px; /* 减小底部内边距 */
  display: flex;
  flex-direction: column;
  gap: 10px; /* 减小按钮间距 */
  position: relative;
  z-index: 10; /* 确保按钮组在最上层 */
  will-change: transform, opacity;
}

.m-submit-btn {
  width: 100%;
  height: 44px; /* 减小按钮高度 */
  position: relative;
  border: none;
  padding: 0;
  border-radius: 25px;
  background: transparent;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  touch-action: manipulation;
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
}

.m-btn-text {
  position: relative;
  z-index: 2; /* 确保文字在背景之上 */
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(0, 255, 249, 0.5);
  pointer-events: none; /* 防止文字影响点击 */
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
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

.m-toggle-btn span {
  position: relative;
  z-index: 2;
  pointer-events: none;
  user-select: none;
}

.m-toggle-btn:active {
  color: var(--cyber-pink);
  text-shadow: 0 0 10px var(--cyber-pink);
  transform: scale(0.98);
}

.m-submit-btn:disabled,
.m-toggle-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.fade-out {
  opacity: 0;
  transform: translateY(10px); /* 只使用小幅度的位移 */
}

.form-visible {
  opacity: 1;
  transform: translateY(0);
}

.expand .form-visible {
  transition-delay: 0.2s; /* 添加延迟，让移动完成后再显示 */
}

@keyframes titleGlitch {
  0%, 100% { 
    text-shadow: 
      0 0 10px var(--cyber-blue),
      0 0 20px var(--cyber-pink);
  }
  33% {
    text-shadow:
      2px 0 10px var(--cyber-pink),
      -2px 0 20px var(--cyber-blue);
  }
  66% {
    text-shadow:
      -2px 0 10px var(--cyber-blue),
      2px 0 20px var(--cyber-pink);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加移动端高度适配 */
@media screen and (max-height: 600px) {
  .m-cyber-box {
    height: auto; /* 在超小屏幕上允许自适应 */
    min-height: 500px; /* 设置最小高度 */
    margin: 10px 0;
  }
  
  .m-brand-panel {
    padding: 15px;
  }
  
  .m-title {
    font-size: clamp(1.4em, 5vw, 1.6em);
  }
  
  .m-subtitle {
    font-size: clamp(0.8em, 3vw, 0.9em);
  }
  
  .m-form-panel {
    gap: 8px;
  }
  
  .m-input-group {
    margin-bottom: 10px;
  }
  
  .m-form :deep(.n-form-item) {
    margin-bottom: 12px;
  }
  
  .m-button-group {
    padding-bottom: 5px;
  }
  
  .m-submit-btn {
    height: 40px;
  }
  
  .m-btn-text {
    font-size: 14px;
  }
}

@media screen and (max-height: 700px) {
  .m-cyber-box {
    min-height: auto;
    max-height: none;
  }
  
  .m-brand-panel {
    padding: 20px;
  }
  
  .m-title {
    font-size: clamp(1.5em, 5vw, 1.8em);
  }
  
  .m-subtitle {
    font-size: clamp(0.8em, 3vw, 1em);
  }
  
  .m-form-panel {
    gap: 10px;
  }
  
  .m-form-title {
    margin-bottom: 15px;
  }
  
  .m-input-group {
    margin-bottom: 15px;
  }
  
  .m-form :deep(.n-form-item) {
    margin-bottom: 12px;
  }
}

</style>
