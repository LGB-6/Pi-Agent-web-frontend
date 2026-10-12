<script setup lang="ts">
import { computed } from "vue";
import { useChatSession } from "../../composables/useChatSession";
import { useHealth } from "../../composables/useHealth";
import { useLayoutPanels } from "../../composables/useLayoutPanels";
import IconButton from "../ui/IconButton.vue";

/** 中间栏顶栏：面包屑 + 连接状态 + 右侧面板开关。 */
const { isStreaming } = useChatSession();
const { health } = useHealth();
const { toggleRightPanel } = useLayoutPanels();

// 连接状态是纯展示派生值，只有这里用得到，就不放进 composable 了。
const connectionStatus = computed(() => {
  if (isStreaming.value) return "正在思考";
  if (health.value.success) return "已连接";
  return "等待连接";
});
</script>

<template>
  <header class="topbar">
    <div class="breadcrumb">
      <span class="breadcrumb-main">工作台</span>
      <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
      <span>对话</span>
    </div>

    <div class="topbar-right">
      <span
        class="status-dot"
        :class="{
          'status-dot--busy': isStreaming,
          'status-dot--offline': !health.success,
        }"
      ></span>
      <span class="status-text">{{ connectionStatus }}</span>
      <IconButton title="显示或隐藏工作区面板" @click="toggleRightPanel">
        <svg viewBox="0 0 24 24">
          <rect x="3.5" y="4" width="17" height="16" rx="2" />
          <path d="M15 4v16" />
        </svg>
      </IconButton>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  flex: 0 0 58px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 0 24px;
  border-bottom: 1px solid #f0f1f3;
}

.breadcrumb,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.breadcrumb {
  color: #888e98;
  font-size: 12px;
}

.breadcrumb-main {
  color: #3b4049;
  font-weight: 600;
}

.breadcrumb svg {
  width: 13px;
  height: 13px;
  color: #b3b7bf;
}

.topbar-right {
  gap: 9px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6fa685;
  box-shadow: 0 0 0 3px #eaf4ed;
}

.status-dot--busy {
  background: #c59a53;
  box-shadow: 0 0 0 3px #f8f0e2;
  animation: pulse 1.4s infinite;
}

.status-dot--offline {
  background: #c4c8cf;
  box-shadow: 0 0 0 3px #f0f1f3;
}

.status-text {
  color: #9297a0;
  font-size: 11px;
}

@keyframes pulse {
  50% {
    box-shadow: 0 0 0 5px #f8f0e280;
  }
}

@media (max-width: 980px) {
  .topbar {
    padding-inline: 16px;
  }
}

@media (max-width: 760px) {
  .topbar {
    flex-basis: 52px;
    padding-inline: 12px;
  }

  .status-text {
    display: none;
  }
}

@media (max-width: 420px) {
  .topbar {
    padding-inline: 9px;
  }
}
</style>
