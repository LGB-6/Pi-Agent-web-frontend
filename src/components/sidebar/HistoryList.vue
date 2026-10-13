<script setup lang="ts">
import { useSessionHistory } from "../../composables/useSessionHistory";
import WorkspaceGroup from "./WorkspaceGroup.vue";

/**
 * 会话历史树的容器：加载态 / 树 / 空态。
 *
 * 数据由 App.vue 在挂载时拉（与 loadHealth 一致），这里只负责渲染。
 * 状态全在 useSessionHistory 里，通过模块级 ref 共享。
 */
const { groups, hasLoaded, isLoading, isEmpty } = useSessionHistory();
</script>

<template>
  <div class="history">
    <div class="history-heading">会话历史</div>

    <div v-if="!hasLoaded && isLoading" class="history-state">
      正在读取会话…
    </div>

    <div v-else-if="isEmpty" class="history-state">
      这个工作目录下还没有会话。
      <br />
      开始一段对话后，它会显示在这里。
    </div>

    <div v-else class="history-tree">
      <WorkspaceGroup
        v-for="group in groups"
        :key="group.cwd"
        :group="group"
      />
    </div>
  </div>
</template>

<style scoped>
.history {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.history-heading {
  margin: 29px 9px 10px;
  color: #999ea8;
  font-size: 11px;
  font-weight: 600;
}

.history-tree {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.history-state {
  padding: 9px 10px;
  color: #a0a5ae;
  font-size: 11px;
  line-height: 1.8;
}

/* 窄屏下整个侧栏收成图标条，历史树随之隐藏。 */
@media (max-width: 760px) {
  .history-heading,
  .history-tree,
  .history-state {
    display: none;
  }
}
</style>
