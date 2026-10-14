<script setup lang="ts">
import { computed } from "vue";
import { useFileTree } from "../../composables/useFileTree";
import type { FileNode as FileNodeModel } from "../../types/files";

/**
 * 文件树里的一个节点，自己渲染自己。
 *
 * 递归靠**文件名自引用**：模板里的 `<FileNode>` 会被编译器解析成组件自身，
 * 不需要 `defineOptions({ name })`，也不要再 import 一次自己。
 * 副作用是文件名即契约 —— 改名的时候模板里的标签要一起改。
 *
 * 没有 depth prop：层级靠嵌套的 `.node-children` 那根竖线表达，
 * 和左栏会话树（WorkspaceGroup / SessionItem）是同一个做法。
 */
const props = defineProps<{ node: FileNodeModel }>();

const { isExpanded, isLoadingPath, hasFailed, childrenOf, toggleDir } =
  useFileTree();

const isDir = computed(() => props.node.type === "directory");
const expanded = computed(() => isExpanded(props.node.path));
const pending = computed(() => isLoadingPath(props.node.path));
const failed = computed(() => hasFailed(props.node.path));
const children = computed(() => childrenOf(props.node.path));

/** 目录行是 button，文件行是 div（见模板），所以这里只处理目录。 */
function onClick() {
  if (isDir.value) {
    void toggleDir(props.node);
  }
}
</script>

<template>
  <div class="node">
    <!--
      目录用 <button>（它真的能点），文件 / 软链接用 <div>。
      纯浏览下文件行点了什么都不会发生，做成 button 只是给键盘和读屏用户
      制造一个「能按但没反应」的假控件 —— 不可点应该是结构性的，不是靠约定。
    -->
    <component
      :is="isDir ? 'button' : 'div'"
      class="node-row"
      :class="{ 'node-row--leaf': !isDir }"
      :type="isDir ? 'button' : undefined"
      :aria-expanded="isDir ? expanded : undefined"
      :title="node.type === 'symlink' ? `${node.path}（符号链接，不展开）` : node.path"
      @click="onClick"
    >
      <svg
        v-if="isDir"
        class="node-caret"
        :class="{ 'node-caret--open': expanded }"
        viewBox="0 0 24 24"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
      <span v-else class="node-caret-gap"></span>

      <span class="node-icon">
        <svg v-if="isDir" viewBox="0 0 24 24">
          <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
        </svg>
        <svg v-else-if="node.type === 'symlink'" viewBox="0 0 24 24">
          <path d="M10.5 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <path d="M5 3h9l5 5v13H5z" />
          <path d="M14 3v5h5" />
        </svg>
      </span>

      <span class="node-name">{{ node.name }}</span>
    </component>

    <div v-if="isDir && expanded" class="node-children">
      <div v-if="pending" class="node-state">正在读取…</div>
      <div v-else-if="failed" class="node-state">无法读取这个目录</div>
      <div v-else-if="children.length === 0" class="node-state">（空目录）</div>
      <FileNode
        v-for="child in children"
        :key="child.path"
        :node="child"
      />
    </div>
  </div>
</template>

<style scoped>
.node-row {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  min-width: 0;
  padding: 5px 7px;
  border: 0;
  border-radius: 6px;
  color: #626874;
  background: transparent;
  text-align: left;
}

.node-row:hover {
  background: #eff1f5;
}

/* 文件行不可点，鼠标不该给出可点的暗示。 */
.node-row--leaf {
  cursor: default;
}

.node-caret {
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  color: #a8adb6;
  fill: none;
  stroke: currentcolor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.15s ease;
}

.node-caret--open {
  transform: rotate(90deg);
}

/* 占住箭头的位置，让文件和同级目录的名字对齐。 */
.node-caret-gap {
  flex: 0 0 12px;
  width: 12px;
}

.node-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  color: #9aa2ad;
}

.node-icon svg {
  width: 13px;
  height: 13px;
}

.node-name {
  flex: 1;
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 二级整体缩进，靠左侧一条细线把层级关系画出来（与会话树同款）。 */
.node-children {
  margin: 1px 0 2px 11px;
  padding-left: 6px;
  border-left: 1px solid #e9ebef;
}

.node-state {
  padding: 5px 7px;
  color: #b0b4bc;
  font-size: 10px;
}
</style>
