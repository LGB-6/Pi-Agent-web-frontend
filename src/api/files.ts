/**
 * 工作区文件树接口。
 * 与 api/sessions.ts 的分工一致：只负责「请求 + 解析」，不持有状态、不弹提示。
 */

import type { FileListResponse } from "../types/files";
import { getJson } from "./client";

/**
 * 列一个目录的直接子项。
 *
 * @param path 相对工作目录的路径，空串表示工作目录本身。
 *   后端只接受相对路径 —— 绝对路径和 ../ 都会被范围断言拒掉。
 * @param depth 1 = 只列这一层；2 = 目录再带一层 children（首屏用）。
 *   后端会钳制到 [1, 2]，传别的值不会报错。
 *
 * 后端可能返回 404（工作目录不存在 / 路径不存在 / 不是目录）、
 * 400（路径越界）、500，错误文案已经是可以直接展示的中文。
 */
export function fetchFiles(
  path = "",
  depth: 1 | 2 = 1,
): Promise<FileListResponse> {
  const query = new URLSearchParams({ path, depth: String(depth) });

  return getJson<FileListResponse>(`/api/files?${query}`);
}
