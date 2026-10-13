/**
 * 会话历史接口。
 *
 * 组件不直接 fetch，一律经过这里 —— 与 api/chat.ts 的分工一致。
 * 这一层只负责「请求 + 解析」，不持有状态、不弹提示。
 */

import type {
  SessionListResponse,
  SessionWriteResponse,
  SwitchSessionResponse,
} from "../types/session";
import { getJson, sendJson } from "./client";

/** 拉取两级会话树。 */
export function fetchSessions(): Promise<SessionListResponse> {
  return getJson<SessionListResponse>("/api/sessions");
}

/**
 * 切换到指定会话。
 *
 * 只传 id：后端自己把 id 解析成文件路径，前端不接触路径。
 * 切换成功后工作目录会跟着会话走，新的 cwd 在响应里。
 *
 * 后端可能返回 409 —— 生成中（BUSY）、工作目录不可用（CWD_MISSING）、
 * 或 id 已失效（404 NOT_FOUND），错误文案已经是可以直接展示的中文。
 */
export function switchSession(id: string): Promise<SwitchSessionResponse> {
  return sendJson<SwitchSessionResponse>("POST", "/api/sessions/switch", {
    id,
  });
}

/**
 * 给会话改名。空字符串表示清除名字，标题会退回第一条用户消息。
 *
 * 名字长度与换行由后端清洗（换行会变成空格），前端只做 trim，
 * 两边都清洗一次不会打架：trim 是幂等的。
 */
export function renameSession(
  id: string,
  name: string,
): Promise<SessionWriteResponse> {
  return sendJson<SessionWriteResponse>(
    "PATCH",
    `/api/sessions/${encodeURIComponent(id)}`,
    { name },
  );
}

/**
 * 删除会话文件。
 *
 * 后端可能返回 409 IS_ACTIVE —— 当前会话不能删，先切走才行（设计 7.3）。
 * 错误文案是可以直接展示的中文。
 */
export function deleteSession(id: string): Promise<SessionWriteResponse> {
  return sendJson<SessionWriteResponse>(
    "DELETE",
    `/api/sessions/${encodeURIComponent(id)}`,
  );
}
