<script setup lang="ts">
import { computed } from "vue";
import { useChatSession } from "../../composables/useChatSession";

/** 最近对话列表。后端还没有多会话，所以目前只有一条。 */
const { messages } = useChatSession();

// 取「最后一条」用户消息作为标题（原文用的是 find，取到的是第一条）。
const latestUserMessage = computed(() => {
  const latest = messages.value.filter((m) => m.role === "user").at(-1);
  return latest?.content || "当前对话";
});
</script>

<template>
  <div class="history-heading">最近对话</div>

  <div class="history-list">
    <button class="history-item history-item--active">
      <svg viewBox="0 0 24 24">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M4 5.5v15M8 7h8M8 10.5h7" />
      </svg>
      <span>{{ latestUserMessage }}</span>
    </button>

    <p v-if="messages.length === 0" class="history-empty">
      开始一段对话后，它会显示在这里。
      <br />
      多会话历史将在接入 Pi 会话管理后启用。
    </p>
  </div>
</template>

<style scoped>
.history-heading {
  margin: 29px 9px 10px;
  color: #999ea8;
  font-size: 11px;
  font-weight: 600;
}

.history-list {
  min-height: 0;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-width: 0;
  padding: 10px 9px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #626874;
  text-align: left;
}

.history-item:hover {
  background: #eff1f5;
}

.history-item--active {
  color: #2e333d;
  background: #e9ecf1;
}

.history-item svg {
  width: 16px;
  height: 16px;
}

.history-item span {
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-empty {
  padding: 9px 10px;
  color: #a0a5ae;
  font-size: 11px;
  line-height: 1.8;
}

/* 窄屏下整个侧栏收成图标条，历史列表随之隐藏。 */
@media (max-width: 760px) {
  .history-heading,
  .history-list {
    display: none;
  }
}
</style>
