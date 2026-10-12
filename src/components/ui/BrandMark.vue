<script setup lang="ts">
/**
 * 品牌标记：三根高低不同的白色竖条。
 * 原文在侧栏、欢迎页、助手头像三处各写了一遍，这里收敛成一个带尺寸变体的组件。
 */
withDefaults(defineProps<{ size?: "md" | "large" | "small" }>(), {
  size: "md",
});
</script>

<template>
  <span
    class="brand-mark"
    :class="size === 'md' ? null : `brand-mark--${size}`"
  ><i></i><i></i><i></i></span>
</template>

<style scoped>
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 27px;
  height: 27px;
  border-radius: 9px;
  background: #303641;
}

.brand-mark i {
  width: 3px;
  border-radius: 3px;
  background: #fff;
}

.brand-mark i:nth-child(1) {
  height: 8px;
}

.brand-mark i:nth-child(2) {
  height: 15px;
}

.brand-mark i:nth-child(3) {
  height: 10px;
}

.brand-mark--large {
  width: 49px;
  height: 49px;
  gap: 5px;
  border-radius: 15px;
}

.brand-mark--large i {
  width: 5px;
}

.brand-mark--large i:nth-child(1) {
  height: 17px;
}

.brand-mark--large i:nth-child(2) {
  height: 27px;
}

.brand-mark--large i:nth-child(3) {
  height: 21px;
}

.brand-mark--small {
  width: 29px;
  height: 29px;
  border-radius: 9px;
}
</style>
