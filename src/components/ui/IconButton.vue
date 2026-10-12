<script setup lang="ts">
/**
 * 方形图标按钮。
 * title / aria-label / @click 等属性会自动落到根元素 button 上，无需显式声明。
 */
defineProps<{ compact?: boolean }>();
</script>

<template>
  <button
    type="button"
    class="icon-button"
    :class="{ 'compact-icon': compact }"
  >
    <slot />
  </button>
</template>

<style scoped>
.icon-button {
  display: inline-flex;
  /*
   * 用 flex: none（= 0 0 auto）而不是 flex: 0 0 32px：
   * 后者是简写，会重置 flex-basis，一旦父组件的响应式规则在层叠里
   * 落到前面就会被覆盖回去。让基准尺寸只由 width/height 决定，
   * 父组件调整宽度时无论层叠顺序如何都能生效。
   */
  flex: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #777d87;
  background: transparent;
}

.icon-button:hover {
  color: #343943;
  background: #eceef2;
}

.compact-icon {
  flex-basis: 26px;
  width: 26px;
  height: 26px;
}

/*
 * 图标是调用方通过默认插槽传进来的，属于父组件的样式作用域，
 * 因此必须用 :deep() 才能命中插槽内容里的 <svg>。
 */
.compact-icon :deep(svg) {
  width: 15px;
  height: 15px;
}
</style>
