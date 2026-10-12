<script setup lang="ts">
/** 流式生成中的三点动画。 */
</script>

<template>
  <div class="typing-indicator">
    <span></span><span></span><span></span>
    <em>Pi Agent 正在思考…</em>
  </div>
</template>

<style scoped>
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: -7px 0 0 42px;
  color: #9da2ab;
  font-size: 11px;
}

.typing-indicator span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #9ba5b5;
  animation: bounce 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  margin-right: 5px;
  animation-delay: 0.3s;
}

.typing-indicator em {
  font-style: normal;
}

@keyframes bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }

  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}
</style>
