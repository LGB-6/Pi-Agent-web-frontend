import { computed, ref } from "vue";
import {
  deleteSession,
  fetchSessions,
  renameSession,
  switchSession,
} from "../api/sessions";
import type { SessionSummary, WorkspaceGroup } from "../types/session";
import { sessionTitle } from "../utils/session";
import { useActivityLog } from "./useActivityLog";
import { useChatSession } from "./useChatSession";
import { useHealth } from "./useHealth";
import { useNotification } from "./useNotification";

/**
 * 左侧栏的会话历史树。
 *
 * 按既有约定：模块级 ref = 全局单例，组件通过这里读写，
 * 不层层下钻 props，也不在组件里 fetch。
 *
 * 与 useChatSession 是**互相依赖**的：切换会话时要换掉聊天区的消息，
 * 而一轮对话收尾时要刷新这棵树。两边都必须在**调用点**取对方（
 * `useChatSession().replaceMessages(...)` 这样），绝不能提到工厂函数体里 ——
 * 提到函数体里就是 `useSessionHistory() → useChatSession() → useSessionHistory()
 * → …`，一路递归到爆栈。这条踩过一次，见第十四节步骤 8。
 */

const groups = ref<WorkspaceGroup[]>([]);
const currentCwd = ref("");
const activeSessionPath = ref<string | null>(null);

const isLoading = ref(false);
const isSwitching = ref(false);

/**
 * 有写操作（重命名 / 删除）在进行。
 *
 * 同一时刻只放一个：两个写操作本身不会互相破坏（改的是不同文件），
 * 但它们各自都要重新拉一次树，并发刷新纯属浪费，而且失败时两条提示会挤在一起。
 */
const isMutating = ref(false);

/** 是否成功加载过。用来区分「还没加载完」与「真的没有会话」。 */
const hasLoaded = ref(false);

/** 展开的分组（按 cwd）。默认只展开当前工作目录。 */
const expandedWorkspaces = ref<Set<string>>(new Set());

const isEmpty = computed(() => hasLoaded.value && groups.value.length === 0);

export function useSessionHistory() {
  const { notifyError, clearError } = useNotification();
  const { loadHealth } = useHealth();
  const { addActivity, clearActivities } = useActivityLog();

  /** 某个会话是不是当前 runtime 正持有的那个。 */
  function isActiveSession(session: SessionSummary): boolean {
    return session.path === activeSessionPath.value;
  }

  function isExpanded(cwd: string): boolean {
    return expandedWorkspaces.value.has(cwd);
  }

  function toggleWorkspace(cwd: string) {
    const next = new Set(expandedWorkspaces.value);

    if (next.has(cwd)) {
      next.delete(cwd);
    } else {
      next.add(cwd);
    }

    // 整体替换而不是原地改，确保触发响应式更新。
    expandedWorkspaces.value = next;
  }

  async function loadSessions() {
    isLoading.value = true;

    try {
      const data = await fetchSessions();

      groups.value = data.groups;
      currentCwd.value = data.currentCwd;
      activeSessionPath.value = data.activeSessionPath;

      // 只在第一次成功加载时决定展开哪些分组。
      // 之后重新加载不能覆盖用户手动折叠的结果。
      if (!hasLoaded.value) {
        expandedWorkspaces.value = new Set([data.currentCwd]);
      }

      hasLoaded.value = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "会话列表加载失败";
      notifyError(`读取会话历史失败：${message}`);
    } finally {
      isLoading.value = false;
    }
  }

  /** 找到会话所属的分组，用来读该组的 cwdStatus。 */
  function findGroupOf(session: SessionSummary): WorkspaceGroup | undefined {
    return groups.value.find((group) =>
      group.sessions.some((item) => item.id === session.id),
    );
  }

  /**
   * 切换到某个会话。工作目录会跟着会话走。
   *
   * 不可切换的会话这里直接拦下并说明原因，不发请求：
   *   - 工作目录已被删除 → 后端也会返回 409，但没必要走一趟
   *   - 旧版本会话没记录工作目录 → 必须拦住。Pi 不认为空 cwd 有问题，
   *     放过去会静默把服务进程的当前目录当成工作目录用（设计 7.5）
   */
  async function switchTo(session: SessionSummary) {
    if (isSwitching.value) return;

    const group = findGroupOf(session);

    if (group && group.cwdStatus !== "ok") {
      notifyError(
        group.cwdStatus === "missing"
          ? `工作目录已被删除，无法切换：${group.cwd}`
          : "这个会话没有记录工作目录，无法切换。",
      );
      return;
    }

    isSwitching.value = true;

    try {
      const result = await switchSession(session.id);

      currentCwd.value = result.currentCwd;
      activeSessionPath.value = result.activeSessionPath;

      // 切过去之后那组必须是展开的，否则当前节点藏在折叠的分组里。
      const next = new Set(expandedWorkspaces.value);
      next.add(result.currentCwd);
      expandedWorkspaces.value = next;

      // ---- 以下四处联动刷新（设计 8.3 / 第十节）----
      // 这些都是"上一个会话的残留"，只有跟着换掉，屏幕上呈现的才自始至终
      // 是同一个会话。

      // 1. 聊天区换成目标会话的内容。漏掉这一步，切完之后中间栏还挂着
      //    上一个会话的对话 —— 树里高亮的是新的，中间显示的是旧的。
      //
      //    在调用点取 useChatSession()，不提到工厂函数体里：两个 composable
      //    互相依赖（chat 要在收尾时刷新树），提前取会变成无限递归。
      useChatSession().replaceMessages(result.messages);

      // 2. 工作区路径变了：右栏「当前项目」卡片读的就是 useHealth，
      //    刷新 health 一处即可，卡片自己会跟着变。
      await loadHealth();

      // 3. 活动流水讲的是上一个会话的事，留着会与眼前的会话对不上。
      clearActivities();
      addActivity(
        "已切换会话",
        `当前会话：${sessionTitle(session)}`,
        "system",
      );

      // 4. 清掉上一个会话留下的报错。它是一个已经消失的上下文里的失败，
      //    继续挂在顶部只会让人以为当前会话出了问题。
      clearError();

      // 重新拉一次：当前 cwd 要置顶，排序与消息数也可能变了。
      await loadSessions();
    } catch (error) {
      const message = error instanceof Error ? error.message : "切换会话失败";
      notifyError(message);
    } finally {
      isSwitching.value = false;
    }
  }

  /**
   * 给会话改名。传空串表示清除名字，标题会退回第一条用户消息。
   *
   * 返回是否成功 —— 失败时节点要保持编辑态，不能把用户刚打的字吞掉。
   * 失败文案由这里弹，调用方只管编辑框的开合。
   */
  async function rename(session: SessionSummary, name: string): Promise<boolean> {
    if (isMutating.value) return false;

    isMutating.value = true;

    try {
      await renameSession(session.id, name.trim());
      await loadSessions();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "重命名会话失败";
      notifyError(message);
      return false;
    } finally {
      isMutating.value = false;
    }
  }

  /**
   * 删除会话。
   *
   * 当前会话在这里就拦下（后端也会独立拒绝，设计 7.3）—— 提前拦是为了
   * 不发那一趟没意义的请求，也为了给出"先切走再删"的引导。
   *
   * 刻意**不看** cwdStatus：工作目录没了、或者旧版本没记录工作目录的会话照样能删。
   * 要清理的往往正是它们，而且删文件只用得到路径，跟目录在不在没关系。
   */
  async function remove(session: SessionSummary): Promise<boolean> {
    if (isMutating.value) return false;

    if (isActiveSession(session)) {
      notifyError("不能删除当前正在使用的会话，先切到同目录下的其它会话再删。");
      return false;
    }

    isMutating.value = true;

    try {
      await deleteSession(session.id);
      await loadSessions();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除会话失败";
      notifyError(message);
      return false;
    } finally {
      isMutating.value = false;
    }
  }

  return {
    groups,

    currentCwd,
    activeSessionPath,
    isLoading,
    isSwitching,
    isMutating,
    hasLoaded,
    isEmpty,
    expandedWorkspaces,
    isActiveSession,
    isExpanded,
    toggleWorkspace,
    loadSessions,
    switchTo,
    rename,
    remove,
  };
}
