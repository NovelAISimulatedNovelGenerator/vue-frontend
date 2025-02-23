<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { NButton, NTooltip } from 'naive-ui'
import CyberLoginCard from '../components/CyberLoginCard.vue'
import MobileCyberLoginCard from '../components/MobileCyberLoginCard.vue'

// 将WaterBackground改为异步组件
const WaterBackground = defineAsyncComponent(() => 
  import('../components/WaterBackground.vue')
)

// 检测移动端
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
})

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

// 优化显示状态控制逻辑
const showLoginContainer = ref(true) // 默认不加载3D背景

// 切换显示状态并保存到localStorage
const toggleLoginContainer = () => {
  showLoginContainer.value = !showLoginContainer.value
  localStorage.setItem('showLoginContainer', String(showLoginContainer.value))
  
  // 如果关闭3D背景，手动触发垃圾回收
  if (!showLoginContainer.value) {
    setTimeout(() => {
      window.gc?.()
    }, 100)
  }
}

// 初始化时从localStorage读取状态
onMounted(() => {
  const saved = localStorage.getItem('showLoginContainer')
  // 仅当明确设置为 'true' 时才加载3D背景
  if (saved === 'true') {
    showLoginContainer.value = true
  }
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
      
      // 延长等待时间以匹配新的动画效果
      setTimeout(() => {
        router.push('/archive')
      }, 2300) // 增加到2秒，让动画完整播放
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
</script>

<template>
  <!-- 切换按钮部分保持不变 -->
  <div class="toggle-container">
    <n-tooltip trigger="hover" placement="left">
      <template #trigger>
        <n-button 
          quaternary 
          circle 
          class="toggle-button"
          :type="showLoginContainer ? 'info' : 'warning'"
          @click="toggleLoginContainer"
        >
          <template #icon>
            <div class="icon" :class="{ active: showLoginContainer }">
              {{ showLoginContainer ? '⚡' : '💤' }}
            </div>
          </template>
        </n-button>
      </template>
      {{ showLoginContainer ? '点击关闭动态背景' : '点击开启动态背景' }}
    </n-tooltip>
  </div>

  <!-- 登录容器 -->
  <div v-if="showLoginContainer" class="login-container" :class="{ 'login-success': loginSuccess }">
    <WaterBackground :login-success="loginSuccess" />
    
    <component 
      :is="isMobile ? MobileCyberLoginCard : CyberLoginCard"
      v-model:form="form"
      :is-login="isLogin"
      :loading="loading"
      :login-success="loginSuccess"
      @submit="handleSubmit"
      @toggle="handleToggle"
    />
  </div>

  <!-- 静态背景容器 -->
  <div v-else class="static-container">
    <component 
      :is="isMobile ? MobileCyberLoginCard : CyberLoginCard"
      v-model:form="form"
      :is-login="isLogin"
      :loading="loading"
      :login-success="loginSuccess"
      @submit="handleSubmit"
      @toggle="handleToggle"
    />
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

/* 基础容器样式 */
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
  transition: all 2s ease-out;
}

/* 切换按钮样式 */
.toggle-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.toggle-button {
  background: rgba(16, 10, 39, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--cyber-blue) !important;
  box-shadow: 0 0 10px rgba(0, 255, 249, 0.2);
  transition: all 0.3s ease;
}

.toggle-button:hover {
  border-color: var(--cyber-pink) !important;
  box-shadow: 0 0 15px rgba(255, 42, 109, 0.3);
  transform: scale(1.05);
}

.icon {
  font-size: 18px;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.icon.active {
  animation: pulse 2s infinite;
}

/* 静态背景 */
.static-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/image/hq.jpg') center/cover no-repeat fixed;
  padding: 20px;
  position: relative;
}

.static-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

@keyframes pulse {
  0% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.8; transform: scale(1); }
}
</style>