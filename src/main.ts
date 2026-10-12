import { createApp } from "vue";

// 全局样式只有两份：设计令牌 + 元素级重置。
// 组件样式一律写在各自的 SFC <style scoped> 里。
// 顺序放在 App 之前：全局基线先注入，组件样式后注入以便覆盖它。
import "./styles/tokens.css";
import "./styles/base.css";

import App from "./App.vue";

createApp(App).mount("#app");
