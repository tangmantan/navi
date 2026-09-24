/// <reference types="vite/client" />

/**
 * vue-waterfall-mini 的样式副作用入口（包 exports 中的 "./style"）
 * 只引入 CSS，不导出任何值。
 */
declare module 'vue-waterfall-mini/style'

/** .env 环境变量类型声明（Vite 仅暴露 VITE_ 前缀的变量到客户端） */
interface ImportMetaEnv {
  /** 远程配置接口地址（可选），配置后页面数据从该接口获取，响应结构同 config.json */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
