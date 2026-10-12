<script setup lang="ts">
import type { ChatMessage } from "../../types/chat";
import BrandMark from "../ui/BrandMark.vue";

/** 单条消息。纯展示组件：不碰全局状态，只收 props / 抛事件。 */
defineProps<{ message: ChatMessage; isStreaming: boolean }>();

const emit = defineEmits<{ copy: [content: string] }>();
</script>

<template>
  <article class="message-row" :class="`message-row--${message.role}`">
    <div v-if="message.role === 'assistant'" class="assistant-avatar">
      <BrandMark size="small" />
    </div>

    <div class="message-body">
      <div class="message-author">
        {{ message.role === "user" ? "你" : "Pi Agent" }}
      </div>
      <div class="message-text">
        {{ message.content || (isStreaming ? "正在生成回复…" : "") }}
      </div>
      <button
        v-if="message.role === 'assistant' && message.content"
        class="copy-button"
        @click="emit('copy', message.content)"
      >
        复制
      </button>
    </div>
  </article>
</template>

<style scoped>
.message-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 27px;
}

.message-row--user {
  justify-content: flex-end;
}

.assistant-avatar {
  display: flex;
  flex: 0 0 30px;
  padding-top: 21px;
}

.message-body {
  min-width: 0;
  max-width: min(100%, 690px);
}

.message-row--user .message-body {
  max-width: min(88%, 650px);
}

.message-author {
  margin-bottom: 8px;
  color: #7f8590;
  font-size: 11px;
  font-weight: 600;
}

.message-row--user .message-author {
  text-align: right;
}

.message-text {
  color: #353a43;
  font-size: 13px;
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.message-row--user .message-text {
  padding: 11px 15px;
  border: 1px solid #edf0f4;
  border-radius: 15px 15px 4px 15px;
  background: #f4f6f8;
}

.copy-button {
  margin-top: 8px;
  padding: 4px 7px;
  border: 0;
  border-radius: 5px;
  color: #9297a0;
  background: transparent;
  font-size: 10px;
}

.copy-button:hover {
  color: #4b515c;
  background: #f3f4f6;
}

@media (max-width: 760px) {
  .message-row {
    gap: 8px;
  }

  .message-row--user .message-body {
    max-width: 91%;
  }
}
</style>
