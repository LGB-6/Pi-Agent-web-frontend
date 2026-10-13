import { reactive, ref } from "vue";
import { streamChat } from "../api/chat";
import type { ChatMessage } from "../types/chat";
import { truncate } from "../utils/format";
import { useActivityLog } from "./useActivityLog";
import { useAutoScroll } from "./useAutoScroll";
import { useComposer } from "./useComposer";
import { useHealth } from "./useHealth";
import { useNotification } from "./useNotification";
import { useSessionHistory } from "./useSessionHistory";

/**
 * 注意这两处互相依赖的写法（见 useSessionHistory 顶部的说明）：
 * useChatSession 要在收尾时刷新树，useSessionHistory 要在切换时换消息。
 * **取对方必须发生在调用点，不能提到工厂函数体里** —— 提上去就成了
 * useChatSession() → useSessionHistory() → useChatSession() → … 的无限递归。
 */

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

      // 会话文件是懒写的：第一条消息落盘之前它在磁盘上根本不存在，
      // 树里也就没有对应节点。一轮结束（顺利答完、被中断、或出错）之后
      // 文件一定已经写出来了，这时再拉一次树，新会话才出现并高亮（设计 7.2）。
      //
      // 放在 finally 而不是只挂在 onDone 上：三条收尾路径都会让文件多出内容，
      // 只挂 onDone 会漏掉"有内容的中断/失败"。多拉一次没有代价 ——
      // loadSessions 不会重置用户手动展开的分组（hasLoaded 那道判断）。
      //
      // 在调用点取 useSessionHistory()，不把它提到工厂函数体里：两个 composable
      // 互相依赖，提前取就成了无限递归。
      void useSessionHistory().loadSessions();

      scrollToBottom();
      focusInput();
    }
  }

  function stopGeneration() {
    controller?.abort();
  }

  /**
   * 整批换掉消息列表。切换会话后调用（设计 第十节）。
   *
   * 整体替换而不是逐条 push：消息是另一个会话的，没有共同的 id 可以对齐，
   * 逐条增删只会让列表短暂闪出两个会话的内容。
   *
   * 只在没有生成时才调用 —— 生成中切换本来就被后端拦着（409 BUSY）。
   */
  function replaceMessages(next: ChatMessage[]) {
    messages.value = next;
  }

  /** 组件卸载时中断在途请求。由 App.vue 在 onBeforeUnmount 调用。 */
  function dispose() {
    controller?.abort();
    controller = null;
  }

  return {
    messages,
    isStreaming,
    sendMessage,
    stopGeneration,
    replaceMessages,
    dispose,
  };
}
