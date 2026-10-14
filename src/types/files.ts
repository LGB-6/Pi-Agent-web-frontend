/**
 * 工作区文件树的领域类型。
 * 与 backend/server.js 的 `GET /api/files` 输出一一对应。
 */

export type FileNodeType =
  /** 目录，可以展开。 */
  | "directory"
  /** 普通文件。 */
  | "file"
  /**
   * 软链接（Windows 上的 junction 也算）。
   *
   * 后端一律不跟随软链接，所以这类节点不可展开 —— 跟着走就等于把范围检查
   * 交给文件系统，一个指向工作区外的链接就能把外面的目录列出来。
   */
  | "symlink";

/**
 * 树里的一个节点。
 *
 * 注意**子项不挂在这个对象上**：它们在 useFileTree 的 childMap 里，
 * 按 path 索引。这样「首屏两层已经带下来的目录」和「点开才请求的目录」
 * 在渲染时是同一条路径，不需要两套逻辑。
 */
export interface FileNode {
  name: string;
  /** 相对工作目录，始终用 / 分隔。根层节点的值就是它的名字。 */
  path: string;
  type: FileNodeType;
}

/** 线上下发的形状：depth=2 时目录多带一层 children。 */
export interface FileNodePayload extends FileNode {
  children?: FileNodePayload[];
}

/** GET /api/files 的响应体。 */
export interface FileListResponse {
  success: boolean;
  /** 工作目录的真实路径（软链接已解开）。 */
  cwd: string;
  /** 本次列的是哪个目录，相对 cwd。空串表示根。 */
  path: string;
  entries: FileNodePayload[];
  /** 条目数触顶被截断了。 */
  truncated: boolean;
  /** 被默认隐藏清单过滤掉的条目数。 */
  hiddenCount: number;
}
