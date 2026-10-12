import { computed, ref } from "vue";
import { getJson } from "../api/client";
import type { Health } from "../types/chat";

/**
 * 后端健康状态。
 * 后端不可达时把 health 清空，UI 据此显示「等待连接 / 未连接」。
 */

const health = ref<Health>({});

/** 工作区路径，未就绪时给一个占位文案。 */
const workspace = computed(
  () => health.value.workspace || "正在读取工作区…",
);

async function loadHealth() {
  try {
    health.value = await getJson<Health>("/api/health");
  } catch {
    health.value = {};
  }
}

export function useHealth() {
  return { health, workspace, loadHealth };
}
