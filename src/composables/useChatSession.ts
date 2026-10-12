import { reactive, ref } from "vue";
import { streamChat } from "../api/chat";
import type { ChatMessage } from "../types/chat";
import { truncate } from "../utils/format";
import { useActivityLog } from "./useActivityLog";
import { useAutoScroll } from "./useAutoScroll";
import { useComposer } from "./useComposer";
import { useHealth } from "./useHealth";
import { useNotification } from "./useNotification";

/**
 * 聊天会话：消息列表 + 发送 / 停止。
 *
 * 这是唯一有副作用的 composable —— 它在发送过程中编排活动日志、
 * 自动滚动、错误提示和健康检查。其余 composable 都是被它调用的叶子。
 */

const messages = ref<ChatMessage[]>([]);
const isStreaming = ref(false);

/** 当前进行中的请求，用于「停止生成」和卸载时中断。 */
let controller: AbortController | null = null;

export function useChatSession() {
  const { addActivity } = useActivityLog();
  const { scrollToBottom } = useAutoScroll();
  const { inputText, focusInput } = useComposer();
  const { loadHealth } = useHealth();
  const { errorMessage, notifyError, clearError } = useNotification();

  async function sendMessage() {
    const text = inputText.value.trim();

    if (!text || isStreaming.value) return;

    clearError();
    inputText.value = "";

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    // 必须是 reactive 代理：下面要在 push 之后按引用持续追加增量，
    // 只有走代理的 set trap 才会触发重绘，否则流式输出不会逐字出现。
    const assistantMessage = reactive<ChatMessage>({
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    });

    messages.value.push(userMessage, assistantMessage);
    isStreaming.value = true;

    addActivity("发送消息", truncate(text), "user");
    addActivity("正在请求 Pi SDK", "等待模型生成回复。");

    scrollToBottom();
    controller = new AbortController();

    try {
      await streamChat({
        message: text,
        signal: controller.signal,
        onDelta(delta) {
          assistantMessage.content += delta;
          scrollToBottom();
        },
        onDone() {
          addActivity("回答完成", "Pi Agent 已完成本次回复。", "assistant");
        },
        onError(message) {
          notifyError(message);
          addActivity("请求失败", message, "error");
        },
      });

      if (!assistantMessage.content && !errorMessage.value) {
        assistantMessage.content = "本次请求结束，但没有收到文本回复。";
      }
    } catch (error: unknown) {
      const err = error as Error;

      if (err.name === "AbortError") {
        addActivity("停止生成", "当前请求已停止。");

        if (!assistantMessage.content) {
          assistantMessage.content = "（已停止生成）";
        }
      } else {
        notifyError(err.message || "连接 Pi Agent 失败。");
        addActivity("连接错误", errorMessage.value, "error");

        if (!assistantMessage.content) {
          assistantMessage.content = "暂时无法获取回复，请检查后端服务后重试。";
        }
      }
    } finally {
      controller = null;
      isStreaming.value = false;
      void loadHealth();
      scrollToBottom();
      focusInput();
    }
  }

  function stopGeneration() {
    controller?.abort();
  }

  /**
   * 后端目前只维护一个 Pi 会话，无法真正开新对话。
   * 保留界面行为：空会话时聚焦输入框，否则提示暂不支持。
   */
  function startNewChat() {
    if (isStreaming.value) return;

    if (messages.value.length) {
      notifyError(
        "当前后端只有一个 Pi 会话。接入独立会话管理后即可安全创建新对话。",
      );
      addActivity("新建对话", "等待后端支持独立会话创建。");
      return;
    }

    focusInput();
  }

  /** 组件卸载时中断在途请求。由 App.vue 在 onBeforeUnmount 调用。 */
  function dispose() {
    controller?.abort();
    controller = null;
  }

  return { messages, isStreaming, sendMessage, stopGeneration, startNewChat, dispose };
}
