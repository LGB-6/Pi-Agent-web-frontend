import { useActivityLog } from "./useActivityLog";
import { useHealth } from "./useHealth";
import { useNotification } from "./useNotification";

/** 复制到剪贴板，并统一处理成功提示与权限失败。 */

export function useClipboard() {
  const { addActivity } = useActivityLog();
  const { workspace } = useHealth();
  const { notifyError } = useNotification();

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      addActivity("已复制", "内容已复制到剪贴板。");
    } catch {
      notifyError("复制失败，请检查浏览器剪贴板权限。");
    }
  }

  function copyWorkspace() {
    void copyText(workspace.value);
  }

  return { copyText, copyWorkspace };
}
