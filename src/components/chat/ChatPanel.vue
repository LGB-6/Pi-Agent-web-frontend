<script setup lang="ts">
import { useAutoScroll } from "../../composables/useAutoScroll";
import { useChatSession } from "../../composables/useChatSession";
import ChatComposer from "./ChatComposer.vue";
import ChatTopbar from "./ChatTopbar.vue";
import MessageList from "./MessageList.vue";
import WelcomeScreen from "./WelcomeScreen.vue";

/**
 * 中间栏。
 * 滚动容器就落在这里：useAutoScroll 的 container 由本组件绑定，
 * 会话逻辑直接调用 scrollToBottom()，不需要把 DOM ref 传出去。
 */
const { messages } = useChatSession();
const { registerContainer } = useAutoScroll();
</script>

<template>
  <main class="main-panel">
    <ChatTopbar />

    <section :ref="registerContainer" class="chat-area">
      <WelcomeScreen v-if="messages.length === 0" />
      <MessageList v-else />
    </section>

    <ChatComposer />
  </main>
</template>

<style scoped>
.main-panel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background: #fff;
}

.chat-area {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #dce0e6 transparent;
}
</style>
