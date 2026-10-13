/**
 * 会话树的展示文案。
 * 纯函数，不含状态 —— 后端只给原始字段（设计 8.2）。
 */

import type { CwdStatus, SessionSummary } from "../types/session";

/** 后端对没有任何消息的会话会下发这个占位串。 */
const EMPTY_FIRST_MESSAGE = "(no messages)";

/** 节点标题：优先用户设的名字，否则第一条用户消息。 */
export function sessionTitle(session: SessionSummary): string {
  const name = session.name?.trim();

  if (name) {
    return name;
  }

  const first = session.firstMessage.trim();

  return !first || first === EMPTY_FIRST_MESSAGE ? "（没有消息）" : first;
}

/**
 * 分组标题：只显示路径最后一段。
 * 完整路径由调用方放进 title 悬停提示。
 */
export function workspaceLabel(cwd: string): string {
  if (!cwd) {
    return "未记录工作目录";
  }

  // 去掉结尾的分隔符，否则 "D:\foo\" 会被切成空串
  const trimmed = cwd.replace(/[/\\]+$/, "");
  const segments = trimmed.split(/[/\\]/);
  const last = segments[segments.length - 1];

  return last || trimmed || cwd;
}

/**
 * 工作目录不可用时的一行说明，占掉会话计数的位置。
 * 可用的目录返回空串，由调用方决定不渲染。
 */
export function workspaceStatusText(status: CwdStatus): string {
  if (status === "missing") {
    return "目录已删除";
  }

  if (status === "unknown") {
    return "无工作目录";
  }

  return "";
}
