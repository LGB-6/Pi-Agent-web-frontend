<script setup lang="ts">
import { useActivityLog } from "../../composables/useActivityLog";
import IconButton from "../ui/IconButton.vue";

/** 侧栏底部的身份区。设置面板尚未接入，点击只记一条活动。 */
const { addActivity } = useActivityLog();
</script>

<template>
  <div class="sidebar-profile">
    <div class="profile-avatar">P</div>
    <div class="profile-copy">
      <strong>本地工作区</strong>
      <span>Pi SDK · Local</span>
    </div>
    <IconButton
      title="设置（规划中）"
      @click="addActivity('设置', '设置面板将在后续版本中加入。')"
    >
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15 20 16l-2 2-1-.6a2 2 0 0 0-3 1.6v1h-3v-1a2 2 0 0 0-3-1.6L7 18l-2-2 .6-1a2 2 0 0 0-1.6-3H3v-3h1a2 2 0 0 0 1.6-3L5 5l2-2 1 .6a2 2 0 0 0 3-1.6V1h3v1a2 2 0 0 0 3 1.6L18 3l2 2-.6 1a2 2 0 0 0 1.6 3h1v3h-1a2 2 0 0 0-1.6 3Z" />
      </svg>
    </IconButton>
  </div>
</template>

<style scoped>
.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: auto;
  padding: 12px 3px 2px;
  border-top: 1px solid #e9ebef;
}

.profile-avatar {
  display: flex;
  flex: 0 0 30px;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e2e7ef;
  color: #465366;
  font-size: 12px;
  font-weight: 700;
}

.profile-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.profile-copy strong {
  font-size: 11px;
  font-weight: 600;
}

.profile-copy span {
  color: #999ea7;
  font-size: 10px;
}

@media (max-width: 760px) {
  .sidebar-profile {
    display: none;
  }
}
</style>
