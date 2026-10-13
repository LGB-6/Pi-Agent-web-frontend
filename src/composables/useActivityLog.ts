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

/**
 * 清空流水。
 *
 * 切换会话后调用：上一条流水讲的是上一个会话的事，留在面板里会与眼睛看到的
 * 会话对不上（右边写着「回答完成」，中间却是另一个会话的内容）。
 *
 * 清空而不是"只留第一句已就绪"：那句初始文案可能早就被挤掉了
 * （满 100 条时从头部丢），把它当成固定锚点会在长会话里留下一条无关记录。
 * 清空之后由调用方补一条说明，面板不会空着。
 */
function clearActivities() {
  activities.value = [];
}

export function useActivityLog() {
  return { activities, sortedActivities, addActivity, clearActivities };
}
