<script setup lang="ts">
import { NForm, NFormItem, NInput } from 'naive-ui'
import { ref, computed, onMounted } from 'vue'
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

const formVisible = ref(true)
const brandPanel = ref(null)
const formPanel = ref(null)
const formContent = ref(null)

const handleToggle = async () => {
  // 首先淡出表单内容
  await gsap.to(formContent.value, {
    opacity: 0,
    duration: 0.15
  })

  // 执行面板动画
  const timeline = gsap.timeline({
    defaults: {
      duration: 0.35,  // 加快整体动画速度
      ease: "back.out(1.4)"  // 使用弹性曲线
    }
  })
  
  if (!props.isLogin) {
    // 切换到登录
    timeline
      .set(brandPanel.value, {
        clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)'
      })
      .to(brandPanel.value, {
        x: '0%',
        rotateY: '0deg',
      })
      .to(formPanel.value, {
        x: '0%',
        marginLeft: '45%',
        marginRight: '0%',
        rotateY: '0deg',
      }, '<')
  } else {
    // 切换到注册
    timeline
      .set(brandPanel.value, {
        clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)'
      })
      .to(brandPanel.value, {
        x: '122.22%',
        rotateY: '-10deg',
      })
      .to(formPanel.value, {
        x: '0%',
        marginLeft: '0%',
        marginRight: '45%',
        rotateY: '10deg',
      }, '<')
  }

  // 触发状态更新
  emit('toggle')

  // 等待面板动画完成后显示新的表单内容
  await timeline
  gsap.to(formContent.value, {
    opacity: 1,
    duration: 0.2,
    delay: 0.05,
    ease: 'power2.out'
  })
}

// 初始化 GSAP 动画状态
onMounted(() => {
  gsap.set(formContent.value, { opacity: 1 })
  gsap.set(brandPanel.value, { 
    x: props.isLogin ? '0%' : '122.22%',
    rotateY: props.isLogin ? '0deg' : '-10deg',
    clipPath: props.isLogin 
      ? 'polygon(0 0, 100% 0, 90% 100%, 0 100%)'
      : 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)'
  })
  gsap.set(formPanel.value, {
    x: '0%',
    marginLeft: props.isLogin ? '45%' : '0%',
    marginRight: props.isLogin ? '0%' : '45%',
    rotateY: props.isLogin ? '0deg' : '10deg'
  })
})
</script>

<template>
  <div class="cyber-box" :class="{ 'fade-out': loginSuccess }">
    <div class="neon-border"></div>
    
    <div class="content-wrapper">
      <div 
        ref="brandPanel"
        class="brand-panel"
      >
        <h1 class="glitch-text">妄想模拟器</h1>
        <p class="cyber-text">{{ isLogin ? 'AI驱动的虚构世界' : '创建虚拟身份' }}</p>
      </div>

      <div 
        ref="formPanel"
        class="form-panel"
      >
        <div 
          ref="formContent"
          class="form-content"
        >
          <h2>{{ isLogin ? 'SYSTEM LOGIN' : 'IDENTITY CREATE' }}</h2>
          
          <div class="input-group" :style="contentStyle">
            <n-form class="cyber-form">
              <n-form-item 
                label="用户标识"
                :theme-overrides="{
                  labelTextColor: '#fff',
                  labelFontWeight: '600'
                }"
              >
                <n-input
                  :value="form.username"
                  @update:value="v => updateFormField('username', v)"
                  :disabled="loading"
                  placeholder="请输入用户标识"
                  type="text"
                  required
                  class="cyber-input"
                  :theme-overrides="{
                    textColor: '#fff',
                    placeholderColor: 'rgba(0, 255, 249, 0.4)',
                    colorFocus: 'var(--cyber-blue)',
                    borderFocus: '1px solid var(--cyber-blue)',
                    boxShadowFocus: '0 0 10px rgba(0, 255, 249, 0.4)'
                  }"
                />
              </n-form-item>

              <n-form-item 
                label="访问密钥"
                :theme-overrides="{
                  labelTextColor: '#fff',
                  labelFontWeight: '600'
                }"
              >
                <n-input
                  :value="form.password"
                  @update:value="v => updateFormField('password', v)"
                  :disabled="loading"
                  placeholder="请输入访问密钥"
                  type="password"
                  required
                  class="cyber-input"
                  :theme-overrides="{
                    textColor: '#fff',
                    placeholderColor: 'rgba(0, 255, 249, 0.4)',
                    colorFocus: 'var(--cyber-blue)',
                    borderFocus: '1px solid var(--cyber-blue)',
                    boxShadowFocus: '0 0 10px rgba(0, 255, 249, 0.4)'
                  }"
                />
              </n-form-item>

              <n-form-item 
                v-if="!isLogin" 
                label="确认密钥"
                :theme-overrides="{
                  labelTextColor: '#fff',
                  labelFontWeight: '600'
                }"
              >
                <n-input
                  :value="form.confirmPassword"
                  @update:value="v => updateFormField('confirmPassword', v)"
                  :disabled="loading"
                  placeholder="请确认访问密钥"
                  type="password"
                  required
                  class="cyber-input"
                  :theme-overrides="{
                    textColor: '#fff',
                    placeholderColor: 'rgba(0, 255, 249, 0.4)',
                    colorFocus: 'var(--cyber-blue)',
                    borderFocus: '1px solid var(--cyber-blue)',
                    boxShadowFocus: '0 0 10px rgba(0, 255, 249, 0.4)'
                  }"
                />
              </n-form-item>
            </n-form>
          </div>

          <div class="button-group" :style="contentStyle">
            <button 
              class="cyber-button" 
              @click="emit('submit')"
              :disabled="loading"
            >
              <span class="btn-text">{{ loading ? '验证中...' : (isLogin ? '接入系统' : '确认创建') }}</span>
              <span class="btn-glitch"></span>
            </button>
            
            <div class="cyber-link" @click="handleToggle">
              <span>{{ isLogin ? '注册新身份' : '返回登录' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 登录卡片 */
.cyber-box {
  width: 1000px;
  height: 600px;
  position: relative;
  background: rgba(16, 10, 39, 0.7);
  backdrop-filter: blur(10px);
  clip-path: polygon(
    0 20px, 
    20px 0, 
    calc(100% - 20px) 0, 
    100% 20px,
    100% calc(100% - 20px),
    calc(100% - 20px) 100%,
    20px 100%,
    0 calc(100% - 20px)
  );
  overflow: hidden;
  z-index: 1;
}

.fade-out {
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 霓虹边框 */
.neon-border {
  position: absolute;
  inset: 0;
  border: 1px solid var(--cyber-blue);
  clip-path: inherit;
  pointer-events: none;
}

.neon-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--cyber-blue);
  filter: blur(6px);
  opacity: 0.5;
}

/* 内容布局 */
.content-wrapper {
  display: flex;
  height: 100%;
  position: relative;
  perspective: 2000px;
  transform-style: preserve-3d;
}

/* 品牌展示区 */
.brand-panel {
  width: 45%;
  height: 100%;
  position: absolute;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    rgba(0, 255, 249, 0.1),
    rgba(255, 42, 109, 0.1)
  );
  clip-path: none;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 255, 249, 0.1);
  border: 1px solid rgba(0, 255, 249, 0.2);
}

/* 品牌文字 */
.glitch-text {
  font-size: 2.5em;
  font-weight: 700;
  color: #fff;
  text-shadow: 
    0 0 10px var(--cyber-blue),
    0 0 20px var(--cyber-pink);
  animation: glitch-text 5s infinite;
}

.cyber-text {
  font-size: 1.2em;
  color: var(--cyber-blue);
  margin-top: 10px;
  text-shadow: 0 0 10px var(--cyber-blue);
}

/* 表单区域 */
.form-panel {
  flex: 1;
  margin-left: 45%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform-origin: left center;
}

.form-panel h2 {
  color: var(--cyber-blue);
  font-size: 1.5em;
  margin-bottom: 40px;
  text-align: center;
  text-shadow: 0 0 10px var(--cyber-blue);
}

/* 输入框样式 */
.input-group {
  width: 100%;
  margin-bottom: 40px;
  padding: 0 20px;
}

.cyber-form {
  :deep(.n-form-item) {
    margin-bottom: 25px;
    
    .n-form-item-label {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      padding-bottom: 8px;
      text-shadow: 
        0 0 10px var(--cyber-blue),
        0 0 20px var(--cyber-pink);
      letter-spacing: 1px;
      
      &::before {
        content: ">";
        margin-right: 8px;
        color: var(--cyber-pink);
        text-shadow: 0 0 10px var(--cyber-pink);
      }
    }
  }

  :deep(.n-input) {
    background: transparent;
    border: 1px solid rgba(0, 255, 249, 0.2);
    border-radius: 4px;
    transition: all 0.3s;

    &:hover, &:focus {
      border-color: var(--cyber-blue);
      box-shadow: 0 0 10px rgba(0, 255, 249, 0.2);
    }

    .n-input__input-el {
      color: #fff;
      font-size: 16px;
      
      &::placeholder {
        color: rgba(0, 255, 249, 0.4);
      }
    }
  }
}

/* 按钮样式 */
.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.cyber-button {
  width: 100%;
  height: 44px;
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
}

.btn-text {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  line-height: 44px;
  background: linear-gradient(45deg,
    var(--cyber-blue),
    var(--cyber-pink)
  );
  color: #fff;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px var(--cyber-blue);
  clip-path: polygon(5% 0, 95% 0, 100% 50%, 95% 100%, 5% 100%, 0 50%);
  transition: all 0.3s;
}

.btn-glitch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--cyber-blue);
  filter: blur(20px);
  opacity: 0;
  transition: opacity 0.3s;
}

.cyber-button:hover .btn-text {
  transform: scale(1.05);
  filter: brightness(1.2);
}

.cyber-button:hover .btn-glitch {
  opacity: 0.5;
}

.cyber-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.cyber-link {
  color: var(--cyber-blue);
  cursor: pointer;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.cyber-link:hover {
  color: var(--cyber-pink);
  text-shadow: 0 0 10px var(--cyber-pink);
}

@keyframes glitch-text {
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
</style>
