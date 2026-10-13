<script setup lang="ts">
import { useLayoutPanels } from "../../composables/useLayoutPanels";
import BrandMark from "../ui/BrandMark.vue";
import IconButton from "../ui/IconButton.vue";
import HistoryList from "./HistoryList.vue";
import SidebarProfile from "./SidebarProfile.vue";

/**
 * 左侧栏：品牌、折叠按钮、会话树、身份区。
 *
 * 这里原本还有「新建对话」和「搜索对话」两个入口，已随会话历史功能一起去掉：
 * 新建会话只能靠重启 pi-web，搜索不做（设计第五、六节）。
 * 顺带清掉了两个 Ctrl K 提示 —— 它绑的一直是「聚焦输入框」，不是新建或搜索。
 */
const { sidebarOpen, toggleSidebar } = useLayoutPanels();
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': !sidebarOpen }">
    <div class="sidebar-brand">
      <IconButton title="收起或展开侧栏" @click="toggleSidebar">
        <svg viewBox="0 0 24 24">
          <rect x="3.5" y="4" width="17" height="16" rx="2" />
          <path d="M9 4v16" />
        </svg>
      </IconButton>

      <div v-if="sidebarOpen" class="brand">
        <BrandMark />
        <strong>Pi Agent</strong>
      </div>
    </div>

    <template v-if="sidebarOpen">
      <HistoryList />
      <SidebarProfile />
    </template>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex: 0 0 250px;
  flex-direction: column;
  min-width: 0;
  padding: 17px 12px 12px;
  border-right: 1px solid #eef0f3;
  background: var(--sidebar-bg);
  transition: flex-basis 0.2s ease;
}

.sidebar--collapsed {
  flex-basis: 60px;
  align-items: center;
  padding-inline: 9px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  margin-bottom: 23px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  white-space: nowrap;
}

.brand strong {
  font-size: 14px;
  letter-spacing: -0.3px;
}

@media (max-width: 1200px) {
  .sidebar {
    flex-basis: 220px;
  }

  .sidebar--collapsed {
    flex-basis: 60px;
  }
}

@media (max-width: 980px) {
  .sidebar {
    flex-basis: 205px;
  }

  .sidebar--collapsed {
    flex-basis: 60px;
  }
}

/* 窄屏下侧栏收成图标条，只剩折叠按钮。 */
@media (max-width: 760px) {
  .sidebar {
    flex-basis: 54px;
    align-items: center;
    padding: 13px 6px;
  }

  .sidebar-brand {
    margin-bottom: 17px;
  }

  .sidebar-brand .brand {
    display: none;
  }
}

@media (max-width: 420px) {
  .sidebar {
    flex-basis: 44px;
    padding-inline: 4px;
  }

  .sidebar-brand :deep(.icon-button) {
    flex-basis: 30px;
    width: 30px;
  }
}
</style>
