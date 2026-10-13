<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useChatSession } from "../../composables/useChatSession";
import { useNotification } from "../../composables/useNotification";
import { useSessionHistory } from "../../composables/useSessionHistory";
import type { SessionSummary } from "../../types/session";
import { formatRelativeTime } from "../../utils/format";
import { sessionTitle } from "../../utils/session";

/**
 * 会话树二级：一个会话。
 *
 * 三种情况要分开对待：
 *   - 生成中 / 切换中：暂时动不了，但点了要给说明（所以不用 disabled，
 *     用 aria-disabled —— disabled 的按钮收不到点击，用户只会觉得没反应）
 *   - 工作目录不可用：置灰，点了由 switchTo 说明原因，不发请求
 *   - 当前会话：可以改名，但不能删（设计 7.3）
 *
 * 整行是一个切换按钮，重命名 / 删除是它**旁边**的独立按钮，不是嵌套在里面
 * —— button 里套 button 是非法结构，点击行为也会变得难以预料。
 * 平时藏起来（hover / 键盘聚焦时出现），腾出来的位置正好顶掉时间那一栏。
 */
const props = defineProps<{
  session: SessionSummary;
  /** 所属工作目录不可用。 */
  blocked?: boolean;
}>();

const { isActiveSession, isSwitching, switchTo, rename, remove } =
  useSessionHistory();
const { isStreaming } = useChatSession();
const { notifyError } = useNotification();

const active = computed(() => isActiveSession(props.session));
const title = computed(() => sessionTitle(props.session));
const time = computed(() => formatRelativeTime(props.session.modified));

/** 当前会话不能删：runtime 还指着这个文件（后端也会独立拒绝）。 */
const canDelete = computed(() => !active.value);

/** 非空表示此刻做不了事，内容是给用户看的理由。 */
const busyReason = computed(() => {
  if (isStreaming.value) {
    return "当前会话正在生成，请稍后再试。";
  }

  if (isSwitching.value) {
    return "正在切换会话，请稍后再试。";
  }

  return "";
});

function handleClick() {
  if (busyReason.value) {
    notifyError(busyReason.value);
    return;
  }

  void switchTo(props.session);
}

// ------------------------------------------------------------
// 重命名
// ------------------------------------------------------------

const editing = ref(false);
const saving = ref(false);
const draft = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

async function startEditing() {
  if (busyReason.value) {
    notifyError(busyReason.value);
    return;
  }

  confirming.value = false;
  draft.value = title.value;
  editing.value = true;

  // 进编辑态就把光标放进去并全选，否则用户还得再点一次
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
}

function cancelEditing() {
  editing.value = false;
  draft.value = "";
}

/**
 * 提交重命名。
 *
 * 三件事都在这里定：失焦也提交（文件管理器那套习惯）、名字没变就直接收工
 * （省掉一次没意义的文件写入）、失败保留编辑态（不能把用户打的字吞掉）。
 */
async function commitEditing() {
  // 已经退出编辑态时不要再提交：Escape 之后输入框被移除，blur 仍可能补发一次
  if (!editing.value || saving.value) {
    return;
  }

  if (draft.value.trim() === title.value.trim()) {
    cancelEditing();
    return;
  }

  saving.value = true;

  const ok = await rename(props.session, draft.value);

  saving.value = false;

  if (ok) {
    cancelEditing();
  } else {
    inputRef.value?.focus();
  }
}

function onEditKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    event.preventDefault();
    void commitEditing();
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    cancelEditing();
  }
}

// ------------------------------------------------------------
// 删除
// ------------------------------------------------------------

const confirming = ref(false);
const removing = ref(false);

function askRemove() {
  if (busyReason.value) {
    notifyError(busyReason.value);
    return;
  }

  if (!canDelete.value) {
    notifyError("不能删除当前正在使用的会话，先切到同目录下的其它会话再删。");
    return;
  }

  editing.value = false;
  confirming.value = true;
}

async function confirmRemove() {
  if (removing.value) {
    return;
  }

  removing.value = true;

  const ok = await remove(props.session);

  removing.value = false;

  // 删成功的话这个组件通常已经被新一轮列举移掉了，这里只是兜底
  if (ok) {
    confirming.value = false;
  }
}
</script>

<template>
  <div
    class="session-row"
    :class="{ 'session-row--active': active }"
  >
    <!-- 编辑态：整行换成输入框 -->
    <input
      v-if="editing"
      ref="inputRef"
      v-model="draft"
      class="session-rename"
      type="text"
      maxlength="120"
      placeholder="留空表示清除名字"
      :disabled="saving"
      @keydown="onEditKeydown"
      @blur="commitEditing"
    />

    <!-- 删除确认态：第二次确认就在原地，不弹窗 -->
    <div v-else-if="confirming" class="session-confirm">
      <span class="confirm-text">删除这条会话？</span>
      <button
        type="button"
        class="confirm-yes"
        :disabled="removing"
        @click="confirmRemove"
      >
        {{ removing ? "删除中…" : "删除" }}
      </button>
      <button
        type="button"
        class="confirm-no"
        :disabled="removing"
        @click="confirming = false"
      >
        取消
      </button>
    </div>

    <template v-else>
      <button
        type="button"
        class="session-item"
        :class="{
          'session-item--active': active,
          'session-item--blocked': blocked,
          'session-item--locked': Boolean(busyReason),
        }"
        :aria-disabled="Boolean(busyReason)"
        :title="title"
        @click="handleClick"
      >
        <span class="session-name">{{ title }}</span>
        <span class="session-time">{{ time }}</span>
      </button>

      <div class="session-actions">
        <button
          type="button"
          class="session-action"
          title="重命名"
          aria-label="重命名"
          @click.stop="startEditing"
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
            <path d="M14.5 6.5 17.5 9.5" />
          </svg>
        </button>

        <button
          type="button"
          class="session-action session-action--danger"
          :title="canDelete ? '删除' : '当前会话不能删除'"
          :aria-label="canDelete ? '删除' : '当前会话不能删除'"
          :aria-disabled="!canDelete"
          @click.stop="askRemove"
        >
          <svg viewBox="0 0 24 24">
            <path d="M5 7h14" />
            <path d="M10 7V4.8h4V7" />
            <path d="M6.8 7l.9 12h8.6l.9-12" />
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.session-row {
  display: flex;
  align-items: center;
  border-radius: 7px;
}

.session-row:hover {
  background: #eff1f5;
}

/* 与 .session-item--active 同色，让高亮一直铺到右边的操作按钮底下。 */
.session-row--active {
  background: #e9ecf1;
}

.session-item {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 9px 8px 11px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #626874;
  text-align: left;
}

.session-item:hover {
  background: #eff1f5;
}

.session-item--active {
  color: #2e333d;
  background: #e9ecf1;
  font-weight: 600;
}

/* 工作目录不可用：置灰，但仍然可点（点了会说明原因）。 */
.session-item--blocked {
  color: #b3b7c0;
  cursor: not-allowed;
}

.session-item--blocked:hover {
  background: transparent;
}

.session-item--locked {
  cursor: not-allowed;
}

.session-item--locked:hover {
  background: transparent;
}

.session-name {
  flex: 1;
  overflow: hidden;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-time {
  flex: 0 0 auto;
  color: #a8adb6;
  font-size: 10px;
  white-space: nowrap;
}

.session-item--active .session-time {
  color: #8b919c;
}

/*
 * 操作按钮平时藏着，hover 或键盘聚焦时出现 —— 出现的同时把时间那一栏让出来，
 * 这样不会挤到名字，也不会浮在文字上面。
 */
.session-actions {
  display: none;
  flex: 0 0 auto;
  align-items: center;
  gap: 2px;
  padding-right: 4px;
}

.session-row:hover .session-actions,
.session-row:focus-within .session-actions {
  display: flex;
}

.session-row:hover .session-time,
.session-row:focus-within .session-time {
  display: none;
}

.session-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  color: #a8adb6;
  background: transparent;
}

.session-action:hover {
  color: #343943;
  background: #e3e6ec;
}

.session-action--danger:hover {
  color: #c0503f;
  background: #f6e5e2;
}

.session-action[aria-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
}

.session-action[aria-disabled="true"]:hover {
  color: #a8adb6;
  background: transparent;
}

.session-action svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 编辑态 */
.session-rename {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  padding: 6px 8px;
  border: 1px solid #c8ccd4;
  border-radius: 7px;
  color: #2e333d;
  font: inherit;
  font-size: 11px;
  background: #fff;
}

.session-rename:disabled {
  color: #8b919c;
  background: #f4f5f7;
}

/* 删除确认态：第二次确认就在原地，不做弹窗 */
.session-confirm {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 4px 5px 4px 10px;
  border-radius: 7px;
  background: #fbeeec;
}

.confirm-text {
  flex: 1;
  overflow: hidden;
  color: #a3453a;
  font-size: 11px;
  white-space: nowrap;
}

.confirm-yes,
.confirm-no {
  flex: 0 0 auto;
  padding: 3px 7px;
  border: 0;
  border-radius: 5px;
  font-size: 11px;
}

.confirm-yes {
  color: #fff;
  background: #c0503f;
}

.confirm-yes:hover {
  background: #a84334;
}

.confirm-no {
  color: #626874;
  background: #e7e9ee;
}

.confirm-yes:disabled,
.confirm-no:disabled {
  opacity: 0.6;
}
</style>
