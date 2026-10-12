<script setup lang="ts">
import { onMounted } from "vue";
import { useChatSession } from "../../composables/useChatSession";
import { useComposer } from "../../composables/useComposer";
import { useNotification } from "../../composables/useNotification";
import ErrorBanner from "./ErrorBanner.vue";

/** 输入区：文本域 + 发送/停止按钮 + 快捷键提示。 */
const { isStreaming, sendMessage, stopGeneration } = useChatSession();
const { inputText, registerInputBox, focusInput } = useComposer();
const { errorMessage, clearError } = useNotification();

onMounted(focusInput);

/** Enter 发送，Shift+Enter 换行；isComposing 用于避开中文输入法选词回车。 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    void sendMessage();
  }
}
</script>

<template>
  <footer class="composer-area">
    <ErrorBanner
      v-if="errorMessage"
      :message="errorMessage"
      @dismiss="clearError"
    />

    <form class="composer" @submit.prevent="sendMessage">
      <textarea
        :ref="registerInputBox"
        v-model="inputText"
        rows="1"
        :disabled="isStreaming"
        placeholder="给 Pi Agent 发送消息…"
        aria-label="输入消息"
        @keydown="handleKeydown"
      ></textarea>

      <div class="composer-bottom">
        <div class="composer-hints">
          <span class="mode-label"><i></i> Pi SDK</span>
          <span class="hint-divider"></span>
          <span>Enter 发送</span>
          <span>Shift + Enter 换行</span>
        </div>

        <button
          v-if="isStreaming"
          type="button"
          class="send-button stop-button"
          title="停止生成"
          @click="stopGeneration"
        >
          <svg viewBox="0 0 24 24">
            <rect x="7" y="7" width="10" height="10" rx="1.5" />
          </svg>
        </button>
        <button
          v-else
          type="submit"
          class="send-button"
          :disabled="!inputText.trim()"
          title="发送消息"
        >
          <svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </button>
      </div>
    </form>

    <p class="composer-note">
      Pi Agent 在本地工作区运行。执行代码或修改文件前，请检查相关操作。
    </p>
  </footer>
</template>

<style scoped>
.composer-area {
  flex: 0 0 auto;
  width: 100%;
  padding: 13px clamp(20px, 3.5vw, 50px) 12px;
  background: linear-gradient(180deg, #ffffffeb, #fff 22%);
}

.composer {
  width: min(790px, 100%);
  margin: 0 auto;
  padding: 11px 12px 9px 16px;
  border: 1px solid #e4e7ec;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 4px 20px #20293808, 0 1px 2px #20293805;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.composer:focus-within {
  border-color: #cbd2dd;
  box-shadow: 0 5px 22px #2029380b, 0 0 0 3px #e9edf366;
}

.composer textarea {
  display: block;
  width: 100%;
  min-height: 28px;
  max-height: 160px;
  resize: vertical;
  padding: 3px 0 8px;
  border: 0;
  outline: none;
  color: #343943;
  background: transparent;
  font-size: 13px;
  line-height: 1.65;
}

.composer textarea:focus-visible {
  outline: none;
}

.composer textarea::placeholder {
  color: #a0a5ae;
}

.composer textarea:disabled {
  opacity: 0.65;
}

.composer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.composer-hints {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: #a1a6af;
  font-size: 10px;
}

.mode-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #737b87;
}

.mode-label i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8ea99b;
}

.hint-divider {
  width: 1px;
  height: 11px;
  background: #e7e9ed;
}

.send-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 9px;
  color: #fff;
  background: #303641;
}

.send-button:hover:not(:disabled) {
  background: #171b22;
}

.send-button:disabled {
  cursor: not-allowed;
  color: #b7bbc2;
  background: #eff1f4;
}

.send-button svg {
  width: 17px;
  height: 17px;
}

.stop-button {
  color: #4b515c;
  background: #eef0f3;
}

.stop-button:hover {
  background: #e3e6eb;
}

.composer-note {
  margin: 9px auto 0;
  color: #b0b4bc;
  font-size: 9px;
  text-align: center;
}

@media (max-width: 1200px) {
  .composer-area {
    padding-inline: 24px;
  }
}

@media (max-width: 760px) {
  .composer-area {
    padding: 10px 10px 8px;
  }

  .composer {
    padding: 9px 9px 8px 12px;
    border-radius: 13px;
  }

  .composer-hints {
    gap: 7px;
    font-size: 9px;
  }

  .composer-note {
    font-size: 8px;
  }
}

@media (max-width: 420px) {
  .composer-hints > span:nth-last-child(-n + 2) {
    display: none;
  }
}
</style>
