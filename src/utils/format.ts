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

const monthDayFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 会话列表里用的相对时间。
 * 今天给 HH:mm，昨天给「昨天 HH:mm」，更早给日期。
 *
 * 按自然日比较而不是按 24 小时：23:50 的会话在次日 00:10 应该显示成「昨天」，
 * 而不是「10 分钟前」那种看不出是几号的写法。
 */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const time = new Date(iso).getTime();

  if (Number.isNaN(time)) {
    return "";
  }

  const today = new Date(now);
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();

  if (time >= startOfToday) {
    return formatTime(time);
  }

  if (time >= startOfToday - DAY_MS) {
    return `昨天 ${formatTime(time)}`;
  }

  return new Date(time).getFullYear() === today.getFullYear()
    ? monthDayFormatter.format(time)
    : fullDateFormatter.format(time);
}
