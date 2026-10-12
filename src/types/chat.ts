/**
 * 前后端共享的领域类型。
 * 与 backend/server.js 暴露的接口一一对应。
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export type ActivityType = "system" | "user" | "assistant" | "error";

/** 右侧面板「Agent 活动」里的一条记录。 */
export interface Activity {
  id: string;
  title: string;
  detail: string;
  time: number;
  type: ActivityType;
}

/** GET /api/health 的响应体。字段可选，因为后端不可达时前端会清空它。 */
export interface Health {
  success?: boolean;
  message?: string;
  workspace?: string;
  sessionInitialized?: boolean;
  isPrompting?: boolean;
}
