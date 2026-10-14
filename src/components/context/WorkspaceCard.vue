<script setup lang="ts">
import { computed } from "vue";
import { useClipboard } from "../../composables/useClipboard";
import { useHealth } from "../../composables/useHealth";
import { useSessionHistory } from "../../composables/useSessionHistory";
import { workspaceLabel } from "../../utils/session";
import IconButton from "../ui/IconButton.vue";

/** 当前项目卡片：工作区路径 + 复制按钮；工作目录跑偏时给一条回来的路。 */
const { health, workspace } = useHealth();
const { copyWorkspace } = useClipboard();
const { newSession, isSwitching } = useSessionHistory();

/**
 * 当前目录已经不是启动时那个了。
 *
 * 让后端算（isLaunchWorkspace），前端不自己比路径 —— 归一化规则（Windows
 * 盘符大小写）已经有 samePath 了，没必要在这边再实现一遍。
 * 字段缺失时（后端不可达、health 被清空）按「没跑偏」处理，不显示提示。
 */
const drifted = computed(() => health.value.isLaunchWorkspace === false);

const launchLabel = computed(() =>
  health.value.launchWorkspace
    ? workspaceLabel(health.value.launchWorkspace)
    : "启动工作区",
);
</script>

<template>
  <div class="workspace-card">
    <div class="workspace-main">
      <span class="folder-icon">
        <svg viewBox="0 0 24 24">
          <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
        </svg>
      </span>
      <div class="workspace-copy">
        <strong>Pi Workspace</strong>
        <span :title="workspace">{{ workspace }}</span>
      </div>
      <IconButton compact title="复制工作区路径" @click="copyWorkspace">
        <svg viewBox="0 0 24 24">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
        </svg>
      </IconButton>
    </div>

    <!--
      工作目录跟着历史会话跑到别的目录去了。
      不说明的话，用户只会看到路径悄悄变了、而且再也回不去 —— 启动工作区
      可能一条会话都不剩，树里没有可点的节点。
    -->
    <p v-if="drifted" class="workspace-drift">
      <span class="drift-dot" aria-hidden="true"></span>
      <span class="drift-text">当前目录来自历史会话，已不是启动工作区</span>
      <button
        type="button"
        class="drift-action"
        :disabled="isSwitching"
        @click="newSession"
      >
        回到 {{ launchLabel }}
      </button>
    </p>
  </div>
</template>

<style scoped>
.workspace-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 9px;
  border: 1px solid #eceef2;
  border-radius: 10px;
  background: #fff;
}

.workspace-main {
  display: flex;
  align-items: center;
  gap: 9px;
}

.folder-icon {
  display: flex;
  flex: 0 0 31px;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  border-radius: 9px;
  color: #6f87aa;
  background: #eef3fa;
}

.folder-icon svg {
  width: 17px;
  height: 17px;
}

.workspace-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.workspace-copy strong {
  color: #4c515b;
  font-size: 10px;
  font-weight: 600;
}

.workspace-copy span {
  display: block;
  overflow: hidden;
  color: #9ba0a9;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 跑偏提示：暖色，与「正常工作」的灰蓝拉开距离，但不至于像报错那么重。 */
.workspace-drift {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin: 0;
  padding: 6px 7px;
  border-radius: 7px;
  background: #fdf6e9;
  color: #a07c37;
  font-size: 9px;
  line-height: 1.55;
}

.drift-dot {
  flex: 0 0 5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d9a441;
}

.drift-text {
  flex: 1;
  min-width: 0;
}

.drift-action {
  flex: 0 0 auto;
  padding: 2px 7px;
  border: 1px solid #e8d4a8;
  border-radius: 5px;
  background: #fff;
  color: #8a6a2f;
  font-size: 9px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.drift-action:hover:not(:disabled) {
  border-color: #d9a441;
}

.drift-action:disabled {
  opacity: 0.55;
  cursor: default;
}
</style>
