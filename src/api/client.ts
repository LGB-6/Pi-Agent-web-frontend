/**
 * 后端通信的基础设施：地址解析、错误信息提取、JSON GET。
 * 所有网络请求都应经过这里，方便后续统一加鉴权、重试、超时。
 */

/** 后端地址。未配置 VITE_API_BASE_URL 时回退到本机开发端口。 */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/**
 * 从失败响应里取出后端给的 error 文案。
 * 后端在 400 / 409 时会返回 { success: false, error: "..." }。
 */
export async function readErrorDetail(response: Response): Promise<string> {
  let detail = `请求失败（HTTP ${response.status}）`;

  try {
    const body = (await response.json()) as { error?: unknown };

    if (typeof body.error === "string" && body.error) {
      detail = body.error;
    }
  } catch {
    // 响应体可能不是 JSON，保留默认文案。
  }

  return detail;
}

/** 发起请求并解析 JSON，非 2xx 时抛出带后端文案的 Error。 */
export async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(apiUrl(path), init);

  if (!response.ok) {
    throw new Error(await readErrorDetail(response));
  }

  return (await response.json()) as T;
}

/** GET 一个 JSON 接口。 */
export function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  return requestJson<T>(path, init);
}

/**
 * 带 JSON 请求体的写操作。
 * body 省略时不发 Content-Type 与请求体。
 */
export function sendJson<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  return requestJson<T>(path, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
