<script setup lang="ts">
import { useChatSession } from "../../composables/useChatSession";
import { useClipboard } from "../../composables/useClipboard";
import MessageItem from "./MessageItem.vue";
import TypingIndicator from "./TypingIndicator.vue";

/** 消息列表：负责遍历与转发「复制」动作。 */
const { messages, isStreaming } = useChatSession();
const { copyText } = useClipboard();
</script>

<template>
  <div class="messages-list">
    <MessageItem
      v-for="message in messages"
      :key="message.id"
      :message="message"
      :is-streaming="isStreaming"
      @copy="copyText"
    />

    <TypingIndicator v-if="isStreaming" />
  </div>
</template>

<style scoped>
.messages-list {
  width: min(790px, calc(100% - 48px));
  margin: 34px auto 45px;
}

@media (max-width: 760px) {
  .messages-list {
    width: calc(100% - 26px);
    margin-top: 22px;
  }
}
</style>
