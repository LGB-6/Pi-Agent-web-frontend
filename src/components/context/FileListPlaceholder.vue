<script setup lang="ts">
/**
 * 文件树占位。
 * 等后端提供只读的文件列表 API 后，这个组件会被真正的 FileTree 替换。
 */
</script>

<template>
  <div class="file-placeholder">
    <span class="file-placeholder-icon">
      <svg viewBox="0 0 24 24">
        <path d="M5 3h9l5 5v13H5z" />
        <path d="M14 3v5h5M8 13h8M8 17h6" />
      </svg>
    </span>
    <strong>浏览工作区文件</strong>
    <p>接入安全的文件树 API 后，可以在这里浏览项目目录与文件。</p>
  </div>
</template>

<style scoped>
.file-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 13px 16px;
  border: 1px dashed #e4e7ec;
  border-radius: 10px;
  background: #fff;
  text-align: center;
}

.file-placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-bottom: 10px;
  border-radius: 11px;
  color: #8793a4;
  background: #f1f4f8;
}

.file-placeholder-icon svg {
  width: 19px;
  height: 19px;
}

.file-placeholder strong {
  color: #626873;
  font-size: 10px;
  font-weight: 600;
}

.file-placeholder p {
  margin: 7px 0 0;
  color: #a1a6af;
  font-size: 10px;
  line-height: 1.7;
}
</style>
