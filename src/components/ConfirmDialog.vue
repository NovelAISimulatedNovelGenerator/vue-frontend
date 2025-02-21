<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  dangerous?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div v-if="show" class="dialog-overlay" @click="emit('cancel')">
    <div class="dialog" @click.stop>
      <h2>{{ title }}</h2>
      <p class="message">{{ message }}</p>
      <div class="dialog-actions">
        <button class="cancel-btn" @click="emit('cancel')">
          {{ cancelText || '取消' }}
        </button>
        <button 
          class="confirm-btn" 
          :class="{ 'dangerous': dangerous }"
          @click="emit('confirm')"
        >
          {{ confirmText || '确认' }}
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
  margin: 0 0 16px;
  color: #fff;
  font-size: 1.2rem;
}

.message {
  color: var(--discord-text);
  margin: 0 0 24px;
  line-height: 1.5;
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
  background: var(--discord-primary);
  border: none;
  color: white;
}

.confirm-btn:hover {
  background: var(--discord-primary-hover);
}

.confirm-btn.dangerous {
  background: var(--discord-danger);
}

.confirm-btn.dangerous:hover {
  background: var(--discord-danger-hover);
}
</style>
