<script setup lang="ts">
import { useComposer } from "../../composables/useComposer";
import BrandMark from "../ui/BrandMark.vue";
import SuggestionGrid from "./SuggestionGrid.vue";

/** 空会话时的欢迎区。 */
const { usePrompt } = useComposer();
</script>

<template>
  <div class="welcome">
    <div class="welcome-logo">
      <BrandMark size="large" />
    </div>
    <div class="welcome-eyebrow">YOUR LOCAL AI WORKSPACE</div>
    <h1>你好，今天想一起完成什么？</h1>
    <p class="welcome-description">
      在这里与 Pi Agent 对话、探索代码，并逐步构建你的项目。
    </p>

    <SuggestionGrid @select="usePrompt" />
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(700px, calc(100% - 40px));
  margin: clamp(48px, 9vh, 90px) auto 45px;
  text-align: center;
}

.welcome-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  margin-bottom: 21px;
  border: 1px solid #eff0f3;
  border-radius: 23px;
  background: linear-gradient(145deg, #fff, #f7f8fa);
  box-shadow: 0 8px 26px #1e29390a;
}

.welcome-eyebrow {
  margin-bottom: 12px;
  color: #a0a5ae;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.welcome h1 {
  margin: 0;
  color: #292d35;
  font-size: clamp(22px, 2.2vw, 29px);
  font-weight: 600;
  letter-spacing: -0.7px;
  line-height: 1.45;
}

.welcome-description {
  margin: 11px 0 29px;
  color: #8b909a;
  font-size: 12px;
  line-height: 1.8;
}

@media (max-width: 980px) {
  .welcome {
    margin-top: 42px;
  }
}

@media (max-width: 760px) {
  .welcome {
    width: calc(100% - 28px);
    margin-top: 35px;
  }

  .welcome h1 {
    font-size: 22px;
  }

  .welcome-description {
    max-width: 340px;
    font-size: 11px;
  }
}

@media (max-width: 420px) {
  .welcome h1 {
    font-size: 20px;
  }
}
</style>
