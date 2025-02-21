<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { NInput, NForm, NFormItem } from 'naive-ui'

// 状态管理
const router = useRouter()
const isLogin = ref(true)
const loading = ref(false)
const loginSuccess = ref(false)
const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// 切换表单
const handleToggle = () => {
  if (loading.value) return
  isLogin.value = !isLogin.value
  form.value = {
    username: '',
    password: '',
    confirmPassword: ''
  }
}

// 提交表单
const handleSubmit = async () => {
  if (loading.value) return
  loading.value = true

  try {
    if (isLogin.value) {
      const res = await api.http.login(form.value.username, form.value.password)
      localStorage.setItem('token', res.data.token)
      
      // 触发登录成功动画
      loginSuccess.value = true
      
      // 等待动画完成后跳转
      setTimeout(() => {
        router.push('/archive')
      }, 2000)
    } else {
      if (form.value.password !== form.value.confirmPassword) {
        alert('两次密码不一致')
        return
      }
      await api.http.register(form.value.username, form.value.password)
      handleToggle()
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : '操作失败')
  } finally {
    if (!loginSuccess.value) {
      loading.value = false
    }
  }
}

// 数字雨效果
onMounted(() => {
  const canvas = document.querySelector('canvas')
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()
  //ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃ0123456789
  const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃ0123456789'
  const columns = canvas.width / 20
  const drops: number[] = []
  let speed = 1
  let fontSize = 15
  let depth = 1

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * -100)
  }

  const draw = () => {
    ctx.fillStyle = `rgba(0, 0, 0, ${loginSuccess.value ? 0.1 : 0.05})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = loginSuccess.value ? '#0F0' : '#0F0'
    ctx.font = `${fontSize}px monospace`
    
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const x = i * 20
      const y = drops[i] * 20
      
      // 3D效果
      if (loginSuccess.value) {
        const scale = (y / canvas.height + 0.5) * depth
        fontSize = 15 * scale
        ctx.font = `${fontSize}px monospace`
        ctx.fillStyle = `rgba(0, 255, 0, ${scale})`
        
        // 透视效果
        const perspectiveX = (x - canvas.width / 2) * scale + canvas.width / 2
        ctx.fillText(char, perspectiveX, y)
      } else {
        ctx.fillText(char, x, y)
      }
      
      if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i] += speed
    }
    
    // 登录成功后加速
    if (loginSuccess.value) {
      speed = Math.min(speed + 0.1, 5)
      depth = Math.min(depth + 0.1, 3)
    }
    
    requestAnimationFrame(draw)
  }

  draw()
})
</script>

<template>
  <div class="login-container" :class="{ 'login-success': loginSuccess }">
    <!-- 数字雨背景 -->
    <canvas ref="matrixCanvas" class="matrix-bg" :class="{ 'matrix-zoom': loginSuccess }"></canvas>

    <!-- 登录卡片 -->
    <div class="cyber-box" :class="{ 'fade-out': loginSuccess }">
      <!-- 霓虹边框 -->
      <div class="neon-border"></div>
      
      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 品牌展示区 -->
        <div class="brand-panel" :class="{ 'switch': !isLogin }">
          <div class="cyber-circle">
            <div class="ring"></div>
            <div class="core"></div>
            <div class="scan-line"></div>
          </div>
          <h1 class="glitch-text">妄想模拟器</h1>
          <p class="cyber-text">{{ isLogin ? 'AI驱动的虚构世界' : '创建虚拟身份' }}</p>
        </div>

        <!-- 表单区域 -->
        <div class="form-panel" :class="{ 'register': !isLogin }">
          <div class="form-content">
            <h2>{{ isLogin ? 'SYSTEM LOGIN' : 'IDENTITY CREATE' }}</h2>
            
            <div class="input-group">
              <n-form class="cyber-form">
                <n-form-item 
                  label="用户标识"
                  :theme-overrides="{
                    labelTextColor: '#fff',
                    labelFontWeight: '600'
                  }"
                >
                  <n-input
                    v-model:value="form.username"
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
                    v-model:value="form.password"
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
                    v-model:value="form.confirmPassword"
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

            <div class="button-group">
              <button 
                class="cyber-button" 
                @click="handleSubmit"
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
  </div>
</template>

<style scoped>
/* 主题颜色 */
:root {
  --neon-cyan: #0ff;
  --neon-magenta: #f0f;
  --cyber-blue: #00fff9;
  --cyber-pink: #ff2a6d;
  --dark-bg: #080510;
  --panel-bg: rgba(16, 10, 39, 0.8);
}

/* 基础样式 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dark-bg);
  position: relative;
  overflow: hidden;
  padding: 20px;
  transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-container.login-success {
  background: black;
}

/* 数字雨背景 */
.matrix-bg {
  position: fixed;
  inset: 0;
  opacity: 0.3;
  transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
}

.matrix-zoom {
  transform: translateZ(1000px) scale(2);
}

/* 登录卡片 */
.cyber-box {
  width: 1000px;
  height: 600px;
  position: relative;
  background: var(--panel-bg);
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
}

.fade-out {
  opacity: 0;
  transform: scale(0.8) translateZ(-500px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
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
  clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 255, 249, 0.1);
  border: 1px solid rgba(0, 255, 249, 0.2);
}

.brand-panel.switch {
  transform: translateX(122.22%) rotateY(-10deg);
  clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
}

/* 赛博朋克圆环 */
.cyber-circle {
  width: 200px;
  height: 200px;
  position: relative;
  margin-bottom: 30px;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top: 2px solid var(--cyber-blue);
  border-right: 2px solid var(--cyber-pink);
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

.core {
  position: absolute;
  inset: 45%;
  background: radial-gradient(
    circle at center,
    var(--cyber-blue),
    var(--cyber-pink)
  );
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--cyber-blue),
    transparent
  );
  top: 50%;
  animation: scan 2s linear infinite;
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
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}

.form-panel.register {
  margin-left: 0;
  margin-right: 45%;
  transform: rotateY(10deg);
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

/* 动画关键帧 */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes scan {
  0% { transform: translateY(-50px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(50px); opacity: 0; }
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

/* 响应式设计 */
@media (max-width: 768px) {
  .cyber-box {
    width: 100%;
    max-width: 400px;
    height: auto;
    min-height: 600px;
  }

  .brand-panel {
    width: 100%;
    height: 100%;
    clip-path: none;
  }

  .brand-panel.switch {
    transform: translateY(-100%);
    clip-path: none;
  }

  .form-panel {
    margin: 0;
    padding: 20px;
  }

  .form-panel.register {
    margin: 0;
  }
}

/* 移动端适配 */
@media screen and (max-width: 1024px) {
  .login-box {
    width: min(90%, 450px);
    height: min(90vh, 700px);
    margin: 20px auto;
  }

  .content-wrapper {
    flex-direction: column;
    perspective: none;
    height: 100%;
    overflow: hidden;
  }

  .brand-panel {
    width: 100%;
    height: 35%;
    min-height: 200px;
    position: relative;
    clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%);
    padding: 20px;
    z-index: 1;
    
    &.switch {
      transform: translateY(-100%);
      clip-path: polygon(0 10%, 100% 0, 100% 100%, 0 100%);
    }
  }

  .cyber-circle {
    width: min(120px, 25vw);
    height: min(120px, 25vw);
    margin-bottom: 15px;
  }

  .glitch-text {
    font-size: clamp(1.5em, 5vw, 2em);
  }

  .form-panel {
    margin-left: 0;
    width: 100%;
    height: 65%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    
    &.register {
      margin-right: 0;
      transform: none;
    }

    h2 {
      font-size: clamp(1.2em, 4vw, 1.3em);
      margin-bottom: 15px;
      flex-shrink: 0;
    }

    /* 添加滚动条样式 */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--cyber-blue);
      border-radius: 2px;
    }
  }

  .input-group {
    padding: 0 10px;
    margin-bottom: 15px;
    flex-shrink: 0;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
    padding: 0 10px;
    margin-top: auto;
    flex-shrink: 0;
    
    .cyber-button {
      width: 100%;
      height: 40px;
      
      &:not(:last-child) {
        margin-right: 0;
      }
    }
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 480px) {
  .login-box {
    width: 95%;
    height: min(95vh, 600px);
    margin: 10px auto;
  }

  .brand-panel {
    height: 30%;
    min-height: 180px;
    padding: 15px;
  }

  .form-panel {
    height: 70%;
    padding: 15px;
  }

  .cyber-form {
    :deep(.n-form-item) {
      margin-bottom: 12px;
      
      .n-form-item-label {
        font-size: 14px;
        padding-bottom: 4px;
      }
    }

    :deep(.n-input) {
      .n-input__input-el {
        font-size: 14px;
        height: 36px;
      }
    }
  }
}

/* 横屏适配 */
@media screen and (max-width: 1024px) and (orientation: landscape) {
  .login-box {
    height: min(90vh, 450px);
  }

  .brand-panel {
    height: 40%;
    min-height: 150px;
    padding: 10px;
  }

  .form-panel {
    height: 60%;
    padding: 12px;

    h2 {
      margin-bottom: 10px;
    }
  }

  .cyber-circle {
    width: min(80px, 15vh);
    height: min(80px, 15vh);
    margin-bottom: 8px;
  }

  .glitch-text {
    font-size: clamp(1.2em, 4vh, 1.6em);
  }

  .cyber-text {
    font-size: 0.9em;
    margin-top: 5px;
  }

  .button-group {
    gap: 8px;
  }
}
</style>