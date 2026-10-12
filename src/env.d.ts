/// <reference types="vite/client" />

/** 声明项目用到的 Vite 环境变量，取值见根目录 .env.example。 */
interface ImportMetaEnv {
  /** 后端地址，缺省为 http://127.0.0.1:3000 */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
