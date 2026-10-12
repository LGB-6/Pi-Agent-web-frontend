import { nextTick, ref } from "vue";
import type { ComponentPublicInstance } from "vue";

/**
 * 输入框状态。
 *
 * 独立成 composable 是因为有三个地方要写它：用户输入、欢迎页的建议卡片、
 * Ctrl+K 快捷键。发送逻辑（useChatSession）读取并清空它。
 */

const inputText = ref("");
const inputBox = ref<HTMLTextAreaElement | null>(null);

/**
 * 用函数 ref 而不是 ref="inputBox" 字符串绑定：
 * 元素的归属明确，且不会被 noUnusedLocals 误判为未使用。
 * 用法：<textarea :ref="registerInputBox">
 */
function registerInputBox(el: Element | ComponentPublicInstance | null) {
  inputBox.value = el instanceof HTMLTextAreaElement ? el : null;
}

function focusInput() {
  void nextTick(() => inputBox.value?.focus());
}

/** 把一段预设文案填进输入框并聚焦。 */
function usePrompt(prompt: string) {
  inputText.value = prompt;
  focusInput();
}

export function useComposer() {
  return { inputText, registerInputBox, focusInput, usePrompt };
}
