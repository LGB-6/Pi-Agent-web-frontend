<script setup lang="ts">
import { computed } from "vue";
import { useSessionHistory } from "../../composables/useSessionHistory";
import type { WorkspaceGroup } from "../../types/session";
import { workspaceLabel, workspaceStatusText } from "../../utils/session";
import SessionItem from "./SessionItem.vue";

/**
 * 会话树一级：一个工作目录。
 *
 * 分组头只做展开折叠，不带任何操作按钮（设计 8.1）。
 * 不可用的目录同样可以展开 —— 得能看见里面有哪些会话，才知道自己丢的是什么。
 */
const props = defineProps<{ group: WorkspaceGroup }>();

const { isExpanded, toggleWorkspace } = useSessionHistory();

const expanded = computed(() => isExpanded(props.group.cwd));
const label = computed(() => workspaceLabel(props.group.cwd));
const statusText = computed(() => workspaceStatusText(props.group.cwdStatus));
const blocked = computed(() => props.group.cwdStatus !== "ok");
</script>

<template>
  <section class="ws-group">
    <button
      class="ws-head"
      :class="{ 'ws-head--blocked': blocked }"
      :aria-expanded="expanded"
      :title="group.cwd || '这个会话没有记录工作目录'"
      @click="toggleWorkspace(group.cwd)"
    >
      <svg
        class="ws-caret"
        :class="{ 'ws-caret--open': expanded }"
        viewBox="0 0 24 24"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>

      <span class="ws-name">{{ label }}</span>

      <span v-if="statusText" class="ws-status">{{ statusText }}</span>
      <span v-else class="ws-count">{{ group.sessions.length }}</span>
    </button>

    <div v-if="expanded" class="ws-sessions">
      <SessionItem
        v-for="session in group.sessions"
        :key="session.id"
        :session="session"
        :blocked="blocked"
      />
    </div>
  </section>
</template>

<style scoped>
.ws-group + .ws-group {
  margin-top: 3px;
}

.ws-head {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 7px 9px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #8b909a;
  text-align: left;
}

.ws-head:hover {
  background: #f0f2f6;
}

.ws-head--blocked {
  color: #b3b7c0;
}

.ws-caret {
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.15s ease;
}

.ws-caret--open {
  transform: rotate(90deg);
}

.ws-name {
  flex: 1;
  overflow: hidden;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ws-count,
.ws-status {
  flex: 0 0 auto;
  font-size: 10px;
}

.ws-count {
  color: #b0b4bc;
}

.ws-status {
  color: #c2a06a;
}

/* 二级节点整体缩进，靠左侧一条细线把层级关系画出来。 */
.ws-sessions {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 1px 0 4px 15px;
  padding-left: 6px;
  border-left: 1px solid #e9ebef;
}
</style>
