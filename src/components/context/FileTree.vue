<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useFileTree } from "../../composables/useFileTree";
import { useHealth } from "../../composables/useHealth";
import FileNodeItem from "./FileNode.vue";

/**
 * 工作区文件树。
 *
 * 展示的是**当前工作目录**，也就是上面「当前项目」卡片那个路径 —— 它跟着
 * 会话走，所以切换会话之后这棵树要跟着换。
 */
const { health } = useHealth();
const {
  rootNodes,
  hasLoaded,
  isLoading,
  truncated,
  hiddenCount,
  errorText,
  loadedCwd,
  loadTree,
} = useFileTree();

// 面板是 v-if 挂载的（关掉就整个卸载），关掉再打开会重新 mount。
// 靠 loadedCwd 判断要不要重拉，避免每次开面板都白跑一趟请求。
//
// 首次 mount 时 App.vue 的 onMounted 还没跑（父组件的 onMounted 在子组件之后），
// health.workspace 通常还是空的 —— 那种情况直接不发请求，交给下面的 watcher。
onMounted(() => {
  if (health.value.workspace && loadedCwd.value !== health.value.workspace) {
    void loadTree();
  }
});

// watcher 写在组件里而不是 composable 里：组件卸载时它会跟着销毁。
// 放进工厂函数体更糟 —— FileNode 每递归一层都会调一次 useFileTree()，
// 于是每层各注册一个 watcher，一次切会话触发 N 次重载。
watch(
  () => health.value.workspace,
  (next) => {
    // health 拿不到后端时会被清空成 {}，next 是 undefined；
    // 另外切到同一目录下的另一个会话不该重拉整棵树。
    if (!next || next === loadedCwd.value) {
      return;
    }

    void loadTree();
  },
);
</script>

<template>
  <div class="file-tree">
    <div v-if="!hasLoaded && isLoading" class="file-state">正在读取文件…</div>

    <div v-else-if="errorText" class="file-state">{{ errorText }}</div>

    <div v-else-if="rootNodes.length === 0" class="file-state">
      这个目录下没有可显示的文件。
    </div>

    <div v-else class="file-tree-body">
      <FileNodeItem v-for="node in rootNodes" :key="node.path" :node="node" />
    </div>

    <p v-if="truncated" class="file-note">目录太大，后面还有内容未显示。</p>
    <p v-if="hiddenCount > 0" class="file-note">
      已隐藏 node_modules、.git 等 {{ hiddenCount }} 项
    </p>
  </div>
</template>

<style scoped>
/*
 * 自己滚，不跟着整个右栏滚。
 * 同面板下面还有「Agent 活动」，一棵几百行的树会把活动列表顶到很远的地方去。
 */
.file-tree {
  max-height: 260px;
  overflow-y: auto;
}

.file-state {
  padding: 9px 10px;
  color: #a0a5ae;
  font-size: 11px;
  line-height: 1.8;
}

.file-tree-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.file-note {
  margin: 8px 0 0;
  color: #b0b4bc;
  font-size: 9px;
  line-height: 1.6;
}
</style>
