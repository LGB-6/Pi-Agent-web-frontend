import { computed, ref } from "vue";
import type { Activity, ActivityType } from "../types/chat";

/**
 * 右侧面板「Agent 活动」的流水记录。
 * 模块级 ref = 全局单例，任何组件 import 拿到的都是同一份。
 */

const MAX_ACTIVITIES = 100;

const activities = ref<Activity[]>([
  {
    id: crypto.randomUUID(),
    title: "Pi Agent 已就绪",
    detail: "发送消息后，这里会显示对话活动。",
    time: Date.now(),
    type: "system",
  },
]);

/** 最新的在最上面。 */
const sortedActivities = computed(() => [...activities.value].reverse());

function addActivity(
  title: string,
  detail: string,
  type: ActivityType = "system",
) {
  activities.value.push({
    id: crypto.randomUUID(),
    title,
    detail,
    time: Date.now(),
    type,
  });

  // 只保留最近 100 条，避免长时间运行后无限增长。
  if (activities.value.length > MAX_ACTIVITIES) {
    activities.value.splice(0, activities.value.length - MAX_ACTIVITIES);
  }
}

export function useActivityLog() {
  return { activities, sortedActivities, addActivity };
}
