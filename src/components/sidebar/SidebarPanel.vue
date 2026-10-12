<script setup lang="ts">
import { useChatSession } from "../../composables/useChatSession";
import { useComposer } from "../../composables/useComposer";
import { useLayoutPanels } from "../../composables/useLayoutPanels";
import BrandMark from "../ui/BrandMark.vue";
import IconButton from "../ui/IconButton.vue";
import HistoryList from "./HistoryList.vue";
import SidebarProfile from "./SidebarProfile.vue";

/** 左侧栏：品牌、新建/搜索、历史、身份区。 */
const { sidebarOpen, toggleSidebar } = useLayoutPanels();
const { startNewChat } = useChatSession();
const { focusInput } = useComposer();
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
      <button class="new-chat-button" @click="startNewChat">
        <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        <span>新建对话</span>
        <kbd>Ctrl K</kbd>
      </button>

      <button
        class="search-button"
        title="搜索入口（完整历史搜索待接入）"
        @click="focusInput"
      >
        <svg viewBox="0 0 24 24">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <span>搜索对话</span>
        <kbd>Ctrl K</kbd>
      </button>

      <HistoryList />
      <SidebarProfile />
    </template>

    <IconButton
      v-else
      class="collapsed-new-chat"
      title="新建对话"
      @click="startNewChat"
    >
      <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
    </IconButton>
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

.new-chat-button,
.search-button {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 39px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 9px;
  text-align: left;
  background: transparent;
  color: #555b66;
}

.new-chat-button {
  border-color: #e3e6eb;
  background: #fff;
  box-shadow: 0 1px 2px #20293808;
  font-weight: 600;
}

.new-chat-button:hover {
  border-color: #d4d9e1;
  background: #fdfdfd;
}

.new-chat-button svg {
  width: 17px;
}

.new-chat-button kbd,
.search-button kbd {
  margin-left: auto;
  color: #a2a6ae;
  font-size: 10px;
  white-space: nowrap;
}

.search-button {
  margin-top: 7px;
  color: #7d828d;
}

.search-button:hover {
  background: #eff1f4;
}

.search-button svg {
  width: 16px;
}

.collapsed-new-chat {
  margin-top: 4px;
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

/* 窄屏下侧栏收成图标条，只留折叠按钮和新建按钮。 */
@media (max-width: 760px) {
  .sidebar {
    flex-basis: 54px;
    align-items: center;
    padding: 13px 6px;
  }

  .sidebar-brand {
    margin-bottom: 17px;
  }

  .sidebar-brand .brand,
  .new-chat-button span,
  .new-chat-button kbd,
  .search-button {
    display: none;
  }

  .new-chat-button {
    justify-content: center;
    width: 36px;
    min-height: 36px;
    padding: 0;
    background: #fff;
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
