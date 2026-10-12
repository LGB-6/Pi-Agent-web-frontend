import { onBeforeUnmount, onMounted } from "vue";
import { useComposer } from "./useComposer";

/** 全局快捷键。目前只有 Ctrl/Cmd + K 聚焦输入框。 */

export function useGlobalShortcut() {
  const { focusInput } = useComposer();

  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      focusInput();
    }
  }

  // 在组件生命周期里注册，避免模块加载时就绑到 window 上。
  onMounted(() => window.addEventListener("keydown", handleKeydown));
  onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
}
