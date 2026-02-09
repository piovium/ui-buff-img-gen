/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE: string;
  // 在这里添加更多环境变量类型定义
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

