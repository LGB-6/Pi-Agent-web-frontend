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
  /**
   * 当前生效的工作目录。
   *
   * 有运行时就是**会话自己的 cwd** —— Pi 原生行为是换会话即换工作目录，
   * 所以它可能已经不是启动时那个目录了。
   */
  workspace?: string;
  /** 启动工作区，进程级、一辈子不变。用来跟上面那个对比。 */
  launchWorkspace?: string;
  /**
   * workspace 是否就是 launchWorkspace。
   *
   * 判断由后端做：路径归一（Windows 盘符大小写）已经有 samePath 了，
   * 没必要让前端再实现一遍。
   */
  isLaunchWorkspace?: boolean;
  sessionInitialized?: boolean;
  isPrompting?: boolean;
}
