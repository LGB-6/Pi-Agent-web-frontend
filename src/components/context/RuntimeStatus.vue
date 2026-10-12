<script setup lang="ts">
import { useHealth } from "../../composables/useHealth";

/** 面板底部的运行时状态，全部来自 /api/health。 */
const { health } = useHealth();
</script>

<template>
  <footer class="context-footer">
    <div class="runtime-row">
      <span>后端连接</span>
      <strong>
        <i :class="{ online: health.success }"></i>
        {{ health.success ? "已连接" : "未连接" }}
      </strong>
    </div>
    <div class="runtime-row">
      <span>Pi 会话</span>
      <strong>{{ health.sessionInitialized ? "已初始化" : "未初始化" }}</strong>
    </div>
    <div class="runtime-row">
      <span>运行模式</span>
      <strong>本地开发</strong>
    </div>
  </footer>
</template>

<style scoped>
.context-footer {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 16px 17px 19px;
  border-top: 1px solid #eff0f3;
  background: #fafbfc;
}

.runtime-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #9a9fa8;
  font-size: 10px;
}

.runtime-row strong {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #717782;
  font-size: 10px;
  font-weight: 500;
}

.runtime-row i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c5c9d0;
}

.runtime-row i.online {
  background: #6fa685;
}
</style>
