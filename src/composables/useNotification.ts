import { ref } from "vue";

/**
 * 全局提示条状态。
 *
 * 单独成文件是为了打破循环依赖：聊天会话和剪贴板都要报错，
 * 但剪贴板不应该反过来依赖聊天会话。
 */

const errorMessage = ref("");

export function useNotification() {
  function notifyError(message: string) {
    errorMessage.value = message;
  }

  function clearError() {
    errorMessage.value = "";
  }

  return { errorMessage, notifyError, clearError };
}
