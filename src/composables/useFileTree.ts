import { computed, ref } from "vue";
import { fetchFiles } from "../api/files";
import type { FileNode, FileNodePayload } from "../types/files";

/**
 * 右侧面板的工作区文件树。
 *
 * 按既有约定：模块级 ref = 全局单例，组件通过这里读写，不在组件里 fetch。
 *
 * 与 `useSessionHistory` 最大的不同是**没有「用户手动折叠要保留」这回事**：
 * 换工作目录时整棵树连同展开态一起扔掉重建。会话树的展开态要留着（那是
 * 用户对同一个列表的整理），文件树的展开态是跟着目录走的一次性状态，
 * 留着只会让新目录里同名的 `src`、`test` 带着旧目录的展开态复活。
 */

/** 相对路径 → 该目录的直接子项。"" 是工作目录根。 */
const childMap = ref<Map<string, FileNode[]>>(new Map());

/** 已展开的目录（按相对路径）。 */
const expanded = ref<Set<string>>(new Set());

/** 正在请求子项的目录。 */
const pending = ref<Set<string>>(new Set());

/** 子项读取失败的目录。与「空目录」区分开，否则是拿沉默骗人。 */
const failed = ref<Set<string>>(new Set());

/** 当前这棵树属于哪个工作目录，用来判断要不要重拉。 */
const loadedCwd = ref("");

const hasLoaded = ref(false);
const isLoading = ref(false);
const truncated = ref(false);
const hiddenCount = ref(0);
const errorText = ref("");

/**
 * 树的代次。
 *
 * 两个用途，都不能省：
 *   - 丢弃过期的整树响应（快速连点两个会话会连发两次 loadTree，先发的可能后到，
 *     把新目录的树覆盖成旧目录的）
 *   - 整树一重载，所有在飞的子目录请求一起作废 —— 它们带回来的子项属于上一棵树
 */
let generation = 0;

/**
 * 把线上那种「目录里嵌 children」的形状摊平成 路径 → 子项列表。
 *
 * 摊平之后，「首屏两层已经带下来的目录」和「点开时才请求的目录」在渲染时
 * 就是同一回事：查同一个 Map，区别只是查得到还是查不到。
 */
function flatten(payloads: FileNodePayload[]): Map<string, FileNode[]> {
  const map = new Map<string, FileNode[]>();

  function walk(list: FileNodePayload[]): FileNode[] {
    for (const payload of list) {
      if (payload.children) {
        map.set(payload.path, walk(payload.children));
      }
    }

    // 节点本身不带 children —— 子项统一在 map 里，避免同一份数据存两份。
    return list.map(({ name, path, type }) => ({ name, path, type }));
  }

  map.set("", walk(payloads));

  return map;
}

export function useFileTree() {
  const rootNodes = computed(() => childMap.value.get("") ?? []);

  function isExpanded(path: string): boolean {
    return expanded.value.has(path);
  }

  function isLoadingPath(path: string): boolean {
    return pending.value.has(path);
  }

  function hasFailed(path: string): boolean {
    return failed.value.has(path);
  }

  function childrenOf(path: string): FileNode[] {
    return childMap.value.get(path) ?? [];
  }

  /**
   * 拉整棵树（首屏两层）。
   *
   * 失败时**不用 notifyError 弹全局提示**：这里失败几乎都是「工作目录没了」
   * 这类状态，不是用户刚做的某个动作失败了。右上角卡片上已经有「目录已删除」
   * 在说同一件事，再弹一条横幅是重复噪音。所以走组件内的 inline 文案。
   */
  async function loadTree() {
    const mine = ++generation;

    isLoading.value = true;
    errorText.value = "";

    try {
      const result = await fetchFiles("", 2);

      // 期间又发起了一次重载，这次的结果已经过期。
      if (mine !== generation) return;

      childMap.value = flatten(result.entries);
      expanded.value = new Set();
      pending.value = new Set();
      failed.value = new Set();

      loadedCwd.value = result.cwd;
      truncated.value = result.truncated;
      hiddenCount.value = result.hiddenCount;
      hasLoaded.value = true;
    } catch (error) {
      if (mine !== generation) return;

      // 旧树属于旧目录，留着比空着更误导 —— 直接清掉，只留一句说明。
      childMap.value = new Map();
      expanded.value = new Set();
      hasLoaded.value = true;
      errorText.value =
        error instanceof Error ? error.message : "读取文件列表失败";
    } finally {
      if (mine === generation) {
        isLoading.value = false;
      }
    }
  }

  /** 按需取某个目录的子项。首屏两层已经带下来的目录会直接返回。 */
  async function loadChildren(node: FileNode) {
    if (childMap.value.has(node.path) || pending.value.has(node.path)) {
      return;
    }

    const mine = generation;

    const loading = new Set(pending.value);
    loading.add(node.path);
    pending.value = loading;

    try {
      const result = await fetchFiles(node.path, 1);

      if (mine !== generation) return;

      const next = new Map(childMap.value);
      next.set(
        node.path,
        result.entries.map(({ name, path, type }) => ({ name, path, type })),
      );
      childMap.value = next;
    } catch {
      if (mine !== generation) return;

      // 目录可能在列举途中被删了，或者没有读权限。记下来让节点自己说明，
      // 不往回塞一个空数组 —— 那会把「读不到」显示成「（空目录）」。
      const next = new Set(failed.value);
      next.add(node.path);
      failed.value = next;
    } finally {
      if (mine === generation) {
        const rest = new Set(pending.value);
        rest.delete(node.path);
        pending.value = rest;
      }
    }
  }

  /** 展开 / 折叠一个目录。展开时顺带把没拉过的子项拉回来。 */
  async function toggleDir(node: FileNode) {
    if (node.type !== "directory") {
      return;
    }

    const next = new Set(expanded.value);

    if (next.has(node.path)) {
      next.delete(node.path);
      // 整体替换而不是原地改，确保触发响应式更新（与 expandedWorkspaces 同款）。
      expanded.value = next;
      return;
    }

    next.add(node.path);
    expanded.value = next;

    await loadChildren(node);
  }

  return {
    rootNodes,
    hasLoaded,
    isLoading,
    truncated,
    hiddenCount,
    errorText,
    loadedCwd,
    isExpanded,
    isLoadingPath,
    hasFailed,
    childrenOf,
    loadTree,
    toggleDir,
  };
}
