<script setup lang="ts">
/** 输入框上方的错误提示条，内容由 useNotification 驱动。 */
defineProps<{ message: string }>();

const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
  <div class="error-banner">
    <span>{{ message }}</span>
    <button aria-label="关闭提示" @click="emit('dismiss')">×</button>
  </div>
</template>

<style scoped>
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(790px, 100%);
  margin: 0 auto 9px;
  padding: 9px 11px;
  border: 1px solid #f1d9d6;
  border-radius: 9px;
  color: #9d5048;
  background: #fff8f7;
  font-size: 11px;
  line-height: 1.5;
}

.error-banner span {
  flex: 1;
}

.error-banner button {
  border: 0;
  color: inherit;
  background: transparent;
  font-size: 18px;
}
</style>
