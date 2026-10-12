<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import ChatPanel from "./components/chat/ChatPanel.vue";
import ContextPanel from "./components/context/ContextPanel.vue";
import SidebarPanel from "./components/sidebar/SidebarPanel.vue";
import { useChatSession } from "./composables/useChatSession";
import { useGlobalShortcut } from "./composables/useGlobalShortcut";
import { useHealth } from "./composables/useHealth";
import { useLayoutPanels } from "./composables/useLayoutPanels";

/**
 * 应用外壳：只负责三栏布局与生命周期装配。
 * 具体状态都在 composables 里（模块级单例），各组件按需 import。
 */
const { rightPanelOpen } = useLayoutPanels();
const { loadHealth } = useHealth();
const { dispose } = useChatSession();

useGlobalShortcut();

onMounted(() => {
  void loadHealth();
});

// 卸载时中断可能还在进行的流式请求。
onBeforeUnmount(dispose);
</script>

<template>
  <div class="app-shell">
    <SidebarPanel />
    <ChatPanel />
    <ContextPanel v-if="rightPanelOpen" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 520px;
  overflow: hidden;
  background: #fff;
}
</style>
