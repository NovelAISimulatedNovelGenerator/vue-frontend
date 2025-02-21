<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  title?: string // 对话框标题
  submitText?: string // 提交按钮文字
  initialTitle?: string // 初始存档名
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', title: string): void
}>()

const inputTitle = ref('')

// 处理提交
const handleSubmit = () => {
  if (inputTitle.value.trim()) {
    emit('create', inputTitle.value.trim())
    inputTitle.value = props.initialTitle || '' // 重置为初始值或空
  }
}

// 处理关闭
const handleClose = () => {
  inputTitle.value = props.initialTitle || '' // 重置为初始值或空
  emit('close')
}

// 监听初始值
watch(() => props.initialTitle, (newVal) => {
  if (newVal) {
    inputTitle.value = newVal
  }
}, { immediate: true })

// 重置表单
watch(() => props.show, (newVal) => {
  if (!newVal) {
    inputTitle.value = props.initialTitle || ''
  }
})

// 监听显示状态，自动聚焦输入框
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 等待 DOM 更新后聚焦
    setTimeout(() => {
      const input = document.querySelector('.archive-title-input') as HTMLInputElement
      if (input) input.focus()
    }, 100)
  }
})
</script>

<template>
  <div v-if="show" class="dialog-overlay" @click="handleClose">
    <div class="dialog" @click.stop>
      <h2>{{ title || '创建新存档' }}</h2>
      <input
        v-model="inputTitle"
        class="archive-title-input"
        type="text"
        placeholder="输入存档名称"
        @keyup.enter="handleSubmit"
        ref="inputRef"
      />
      <div class="dialog-actions">
        <button class="cancel-btn" @click="handleClose">取消</button>
        <button 
          class="confirm-btn" 
          @click="handleSubmit" 
          :disabled="!inputTitle.trim()"
        >
          {{ submitText || '创建' }}
        </button>
      </div>
    </div>
  </div>
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
  background: #36393f;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dialog h2 {
  margin: 0 0 20px;
  color: #fff;
  font-size: 1.2rem;
}

input {
  width: 100%;
  padding: 12px;
  background: #40444b;
  border: none;
  border-radius: 4px;
  color: #dcddde;
  font-size: 1rem;
  margin-bottom: 20px;
  box-sizing: border-box;
}

input:focus {
  outline: 2px solid #5865f2;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

button {
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: transparent;
  border: none;
  color: #dcddde;
}

.cancel-btn:hover {
  text-decoration: underline;
}

.confirm-btn {
  background: #5865f2;
  border: none;
  color: white;
}

.confirm-btn:hover {
  background: #4752c4;
}

.confirm-btn:disabled {
  background: #454950;
  cursor: not-allowed;
}
</style>
