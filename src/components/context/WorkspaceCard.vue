<script setup lang="ts">
import { useClipboard } from "../../composables/useClipboard";
import { useHealth } from "../../composables/useHealth";
import IconButton from "../ui/IconButton.vue";

/** 当前项目卡片：工作区路径 + 复制按钮。 */
const { workspace } = useHealth();
const { copyWorkspace } = useClipboard();
</script>

<template>
  <div class="workspace-card">
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
</template>

<style scoped>
.workspace-card {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 9px;
  border: 1px solid #eceef2;
  border-radius: 10px;
  background: #fff;
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
</style>
