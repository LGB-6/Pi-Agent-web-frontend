/**
 * 会话历史的领域类型。
 * 与 backend/session-index.js 的输出一一对应（设计文档 9.4）。
 *
 * title / label 这类展示文案不在这里 —— 它们由 utils/ 里的纯函数算，
 * 与既有分层保持一致。
 */

import type { ChatMessage } from "./chat";

/** 会话记录里的工作目录是否可用。 */
export type CwdStatus =
  /** 目录存在，可以切过去。 */
  | "ok"
  /** 记录里写了目录，但目录已经不在了。 */
  | "missing"
  /** 旧版本会话，记录里根本没有工作目录。 */
  | "unknown";

/** 树里二级的一个会话。 */
export interface SessionSummary {
  id: string;
  path: string;
  /** 用户通过 /name 或重命名设的名字，没设过则后端不下发这个字段。 */
  name?: string;
  /** 第一条用户消息，用作兜底标题。 */
  firstMessage: string;
  messageCount: number;
  /** ISO 字符串。 */
  created: string;
  modified: string;
  /** 是否由 fork 产生。 */
  isForked: boolean;
}

/** 树里一级的一个工作目录。 */
export interface WorkspaceGroup {
  /** 空串表示旧版本会话，没有记录工作目录。 */
  cwd: string;
  cwdStatus: CwdStatus;
  /** 已按 modified 倒序排好，前端照渲染即可。 */
  sessions: SessionSummary[];
}

/** GET /api/sessions 的响应体。 */
export interface SessionListResponse {
  success: boolean;
  /** 当前工作目录，用于判断哪个分组该置顶、该默认展开。 */
  currentCwd: string;
  /** 当前 runtime 持有的会话文件；未初始化或新会话未落盘时为 null。 */
  activeSessionPath: string | null;
  groups: WorkspaceGroup[];
}

/** POST /api/sessions/switch 的响应体。 */
export interface SwitchSessionResponse {
  success: boolean;
  currentCwd: string;
  activeSessionPath: string | null;
  /**
   * 目标会话的对话内容，用来替换聊天区。
   *
   * 只有纯文本的 user / assistant 两轮，工具调用与思考过程在服务端就被滤掉了
   * （见 backend/chat-messages.js）。
   */
  messages: ChatMessage[];
}

/**
 * POST /api/sessions/new 的响应体。
 *
 * 与切换会话**刻意同形**：新建会话同样是「运行时被换掉了」的一种 ——
 * 只是目标是一个还没落盘的空会话（messages 为空数组，activeSessionPath
 * 指向那个尚未写出的文件）。前端两条路径因此复用同一套联动刷新。
 */
export type NewSessionResponse = SwitchSessionResponse;

/**
 * PATCH / DELETE 的响应体。
 *
 * 写操作不做乐观更新：改完一律重新拉一次树，所以这里只需要 id
 * （PATCH 顺带回显清洗过的名字，便于对不上时排查）。
 */
export interface SessionWriteResponse {
  success: boolean;
  id: string;
  name?: string;
}
