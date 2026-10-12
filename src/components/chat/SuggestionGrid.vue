<script setup lang="ts">
import { suggestions } from "../../data/suggestions";

/** 欢迎页的四张建议卡片，内容来自 data/suggestions.ts。 */
const emit = defineEmits<{ select: [prompt: string] }>();
</script>

<template>
  <div class="suggestion-grid">
    <button
      v-for="item in suggestions"
      :key="item.title"
      type="button"
      class="suggestion-card"
      @click="emit('select', item.prompt)"
    >
      <span class="suggestion-icon" :class="`icon-${item.tone}`">
        <!-- item.icon 是 data/suggestions.ts 里的静态常量，非用户输入 -->
        <svg viewBox="0 0 24 24" v-html="item.icon"></svg>
      </span>
      <span class="suggestion-copy">
        <strong>{{ item.title }}</strong>
        <small>{{ item.description }}</small>
      </span>
      <svg class="suggestion-arrow" viewBox="0 0 24 24">
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: min(600px, 100%);
  text-align: left;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  min-height: 68px;
  padding: 12px;
  border: 1px solid #eceef2;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}

.suggestion-card:hover {
  transform: translateY(-1px);
  border-color: #d8dde5;
  box-shadow: 0 5px 16px #1f29370a;
}

.suggestion-icon {
  display: flex;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.suggestion-icon svg {
  width: 17px;
}

.icon-blue {
  color: #5877a8;
  background: #edf3fc;
}

.icon-purple {
  color: #8170b4;
  background: #f2effb;
}

.icon-green {
  color: #578d76;
  background: #edf7f0;
}

.icon-amber {
  color: #b18a4b;
  background: #fbf4e8;
}

.suggestion-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.suggestion-copy strong {
  color: #424752;
  font-size: 11px;
  font-weight: 600;
}

.suggestion-copy small {
  overflow: hidden;
  color: #989da6;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-arrow {
  width: 14px;
  height: 14px;
  color: #b8bdc5;
}

@media (max-width: 760px) {
  .suggestion-grid {
    gap: 8px;
  }

  .suggestion-card {
    min-height: 62px;
    padding: 9px;
    gap: 8px;
  }

  .suggestion-icon {
    flex-basis: 30px;
    width: 30px;
    height: 30px;
  }

  .suggestion-copy small {
    font-size: 9px;
  }
}

@media (max-width: 420px) {
  .suggestion-card {
    gap: 7px;
    padding: 8px;
  }
}
</style>
