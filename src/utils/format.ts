/** 展示层用的纯格式化函数，不含任何状态。 */

// 复用同一个 formatter，避免每次渲染都构造 Intl 实例。
const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
});

/** 把时间戳格式化成 HH:mm。 */
export function formatTime(timestamp: number): string {
  return timeFormatter.format(timestamp);
}

/** 超长文本截断，用于活动日志的摘要。 */
export function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
