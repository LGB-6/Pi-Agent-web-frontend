<script setup lang="ts">
import { useActivityLog } from "../../composables/useActivityLog";
import { formatTime } from "../../utils/format";

/** Agent 活动流水，最新的在最上面。 */
const { sortedActivities } = useActivityLog();
</script>

<template>
  <div class="activity-list">
    <div
      v-for="item in sortedActivities"
      :key="item.id"
      class="activity-item"
    >
      <span
        class="activity-marker"
        :class="`activity-marker--${item.type}`"
      ></span>
      <div class="activity-copy">
        <div class="activity-title-row">
          <strong>{{ item.title }}</strong>
          <time>{{ formatTime(item.time) }}</time>
        </div>
        <p>{{ item.detail }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
}

.activity-marker {
  flex: 0 0 7px;
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border-radius: 50%;
  background: #aeb5c0;
  box-shadow: 0 0 0 3px #f0f2f5;
}

.activity-marker--user {
  background: #7392bd;
  box-shadow: 0 0 0 3px #edf2f9;
}

.activity-marker--assistant {
  background: #6d9c81;
  box-shadow: 0 0 0 3px #edf6f0;
}

.activity-marker--error {
  background: #c77970;
  box-shadow: 0 0 0 3px #fbefed;
}

.activity-copy {
  flex: 1;
  min-width: 0;
}

.activity-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.activity-title-row strong {
  overflow: hidden;
  color: #656a74;
  font-size: 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-title-row time {
  flex: 0 0 auto;
  color: #b0b4bc;
  font-size: 9px;
}

.activity-copy p {
  margin: 4px 0 0;
  color: #999ea7;
  font-size: 10px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
</style>
