import { nextTick, ref } from "vue";
import type { ComponentPublicInstance } from "vue";

/**
 * 聊天滚动区。
 *
 * 滚动容器由 ChatPanel 通过 <section :ref="registerContainer"> 登记进来；
 * 会话逻辑（收到增量、发送完成）直接调用 scrollToBottom()，
 * 不需要把 DOM ref 层层往外传。
 */

const container = ref<HTMLElement | null>(null);

function registerContainer(el: Element | ComponentPublicInstance | null) {
  container.value = el instanceof HTMLElement ? el : null;
}

export function scrollToBottom() {
  void nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight;
    }
  });
}

export function useAutoScroll() {
  return { registerContainer, scrollToBottom };
}
