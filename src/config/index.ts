/**
 * 配置层统一出口
 * ------------------------------------------------------------------
 * 两个可选数据源，可单独或同时使用：
 * 1. 本地 config.json（项目根目录）——作为初始渲染数据；
 * 2. 远程接口（.env 的 VITE_API_URL）——应用启动后拉取同结构数据
 *    （{ site, software }）覆盖本地配置，拉取失败时保持本地数据。
 * 仅使用远程接口时可以完全省略 config.json：本地文件通过
 * import.meta.glob 惰性匹配，缺失时构建不报错（静态 import 则会），
 * 两个数据源都缺失时以空配置兜底渲染。
 *
 * 配置以响应式形式导出（siteConfig 为 reactive、softwareList 为 ref），
 * 远程数据到达后页面自动更新，组件中统一通过 `@/config` 引入。
 */
import { reactive, ref } from 'vue'
import type { SiteConfig, SoftwareItem } from '@/types'

/** 配置文件结构约定（config.json 与远程接口响应一致） */
interface ConfigFile {
  site: SiteConfig
  software: SoftwareItem[]
}

/**
 * 本地 config.json（可选数据源）：
 * import.meta.glob 在构建期按模式匹配「实际存在」的文件——
 * config.json 存在时照常打包（行为等同静态 import），缺失时
 * 匹配结果为空，不会像静态 import 那样在构建/转换阶段报错。
 */
const localConfigFiles = import.meta.glob<ConfigFile>('../../config.json', {
  eager: true,
  import: 'default',
})

/**
 * config.json 缺失时的兜底配置：
 * 仅在远程配置到达前（或两者均未提供时）短暂渲染空列表使用。
 */
const fallbackConfig: ConfigFile = {
  site: { name: 'Navi', tagline: '', downloadPanelMode: 'inline' },
  software: [],
}

const localConfigList = Object.values(localConfigFiles)
if (localConfigList.length === 0) {
  console.warn('[config] 未找到本地 config.json，页面数据将依赖远程接口（VITE_API_URL）提供')
}
const localConfig: ConfigFile = localConfigList[0] ?? fallbackConfig

/** 站点信息配置（页面文案、下载面板形态），远程配置到达后整体替换字段 */
export const siteConfig = reactive<SiteConfig>({ ...localConfig.site })

// searchMode 未配置时的默认值：suggest（结果面板模式）。
// 远程配置未携带该字段时 Object.assign 不会覆盖，默认值得以保留；
// 显式配置为 "filter" 则正常覆盖回过滤模式
siteConfig.searchMode ??= 'suggest'

// 搜索框占位文案未配置时的默认值（远程未携带该字段时同样保留）
siteConfig.searchPlaceholder ??= '搜索软件名或介绍，支持模糊匹配'

/** 软件列表（唯一数据源），远程配置到达后整体替换 */
export const softwareList = ref<SoftwareItem[]>([...localConfig.software])

/**
 * 从 VITE_API_URL 拉取远程配置并覆盖本地配置。
 * 未配置接口地址时直接返回（使用本地 config.json）；
 * 网络错误、非 2xx 响应或响应结构不符约定时，输出警告并保持本地配置。
 */
export async function loadRemoteConfig(): Promise<void> {
  const url = import.meta.env.VITE_API_URL
  if (!url) return

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = (await response.json()) as Partial<ConfigFile>

    // 结构校验：必须包含 site 对象与 software 数组，否则视为无效响应
    if (!data || typeof data.site !== 'object' || data.site === null || !Array.isArray(data.software)) {
      throw new Error('响应结构不符合 { site, software } 约定')
    }

    Object.assign(siteConfig, data.site)
    softwareList.value = data.software
  } catch (error) {
    console.warn('[config] 远程配置加载失败，已回退到本地 config.json：', error)
  }
}
