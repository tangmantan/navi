/**
 * 配置层统一出口
 * ------------------------------------------------------------------
 * 默认数据源为项目根目录的 config.json（站点信息 + 软件列表）。
 * 若在 .env 中配置了 VITE_API_URL 远程接口地址，应用启动后会从该接口
 * 拉取同结构数据（{ site, software }）覆盖本地配置；拉取失败时自动
 * 回退到本地 config.json。
 *
 * 配置以响应式形式导出（siteConfig 为 reactive、softwareList 为 ref），
 * 远程数据到达后页面自动更新，组件中统一通过 `@/config` 引入。
 */
import { reactive, ref } from 'vue'
import type { SiteConfig, SoftwareItem } from '@/types'
import localConfig from '../../config.json'

/** 站点信息配置（页面文案、下载面板形态），远程配置到达后整体替换字段 */
export const siteConfig = reactive<SiteConfig>({ ...(localConfig.site as SiteConfig) })

/** 软件列表（唯一数据源），远程配置到达后整体替换 */
export const softwareList = ref<SoftwareItem[]>(localConfig.software as SoftwareItem[])

/**
 * 远程配置接口约定的响应结构（与 config.json 一致）
 */
interface RemoteConfig {
  site: SiteConfig
  software: SoftwareItem[]
}

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
    const data = (await response.json()) as Partial<RemoteConfig>

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
