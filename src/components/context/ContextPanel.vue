<script setup lang="ts">
import { useActivityLog } from "../../composables/useActivityLog";
import { useLayoutPanels } from "../../composables/useLayoutPanels";
import IconButton from "../ui/IconButton.vue";
import ActivityList from "./ActivityList.vue";
import FileListPlaceholder from "./FileListPlaceholder.vue";
import RuntimeStatus from "./RuntimeStatus.vue";
import WorkspaceCard from "./WorkspaceCard.vue";

/**
 * 右侧工作区面板。
 * 三个 section 的外壳与标题都在这里，子组件只负责内容，
 * 这样 .section-heading / .section-icon 只需要写一份。
 */
const { activities } = useActivityLog();
const { closeRightPanel } = useLayoutPanels();
</script>

<template>
  <aside class="context-panel">
    <header class="context-header">
      <div>
        <h2>工作区</h2>
        <p>项目上下文与运行状态</p>
      </div>
      <IconButton title="关闭面板" @click="closeRightPanel">
        <svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </IconButton>
    </header>

    <section class="context-section">
      <div class="section-heading">
        <span class="section-icon">
          <svg viewBox="0 0 24 24">
            <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
          </svg>
        </span>
        <h3>当前项目</h3>
      </div>

      <WorkspaceCard />
    </section>

    <section class="context-section">
      <div class="section-heading">
        <span class="section-icon">
          <svg viewBox="0 0 24 24">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
          </svg>
        </span>
        <h3>文件列表</h3>
        <span class="coming-soon">待接入</span>
      </div>

      <FileListPlaceholder />
    </section>

    <section class="context-section activity-section">
      <div class="section-heading">
        <span class="section-icon">
          <svg viewBox="0 0 24 24">
            <path d="M4 13h4l3-8 4 14 3-6h2" />
          </svg>
        </span>
        <h3>Agent 活动</h3>
        <span class="activity-count">{{ activities.length }}</span>
      </div>

      <ActivityList />
    </section>

    <RuntimeStatus />
  </aside>
</template>

<style scoped>
.context-panel {
  display: flex;
  flex: 0 0 315px;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  border-left: 1px solid #eceef1;
  background: var(--panel-bg);
}

.context-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 17px 18px;
  border-bottom: 1px solid #f0f1f3;
}

.context-header h2 {
  margin: 0 0 5px;
  color: #30343d;
  font-size: 13px;
  font-weight: 700;
}

.context-header p {
  margin: 0;
  color: #9a9fa8;
  font-size: 10px;
}

.context-section {
  padding: 18px 16px;
  border-bottom: 1px solid #eff0f3;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin-bottom: 13px;
}

.section-heading h3 {
  margin: 0;
  color: #4b505a;
  font-size: 11px;
  font-weight: 700;
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  border-radius: 7px;
  color: #7e8795;
  background: #f0f2f5;
}

.section-icon svg {
  width: 14px;
  height: 14px;
}

.coming-soon {
  margin-left: auto;
  padding: 3px 6px;
  border-radius: 5px;
  color: #999ea7;
  background: #f1f2f5;
  font-size: 9px;
  white-space: nowrap;
}

.activity-section {
  flex: 1 0 auto;
}

.activity-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 18px;
  margin-left: auto;
  padding: 0 5px;
  border-radius: 6px;
  color: #8b919c;
  background: #f0f2f5;
  font-size: 9px;
}

@media (max-width: 1200px) {
  .context-panel {
    flex-basis: 280px;
  }
}

@media (max-width: 980px) {
  .context-panel {
    flex-basis: 250px;
  }
}

/* 窄屏下优先保证聊天区，直接隐藏整个面板。 */
@media (max-width: 760px) {
  .context-panel {
    display: none;
  }
}
</style>
