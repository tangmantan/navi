import { computed, watch } from 'vue'
import { softwareList as softwareConfig } from '@/config'
import type { SoftwareItem } from '@/types'

/**
 * 配置合法性校验（仅开发环境执行）
 * ------------------------------------------------------------------
 * 在维护配置文件时尽早暴露常见错误：id 重复、缺少下载地址等。
 * 生产构建中此函数不会产生任何输出。
 */
function validateSoftwareList(list: SoftwareItem[]): void {
  const seenIds = new Set<string>()

  for (const item of list) {
    // 检查 id 是否重复（重复 id 会导致列表 key 冲突与状态错乱）
    if (seenIds.has(item.id)) {
      console.warn(`[config] 发现重复的软件 id："${item.id}"，请确保每个软件的 id 唯一。`)
    }
    seenIds.add(item.id)

    // 检查下载地址是否为空（空数组会导致下载按钮无任何行为）
    if (item.links.length === 0) {
      console.warn(`[config] 软件 "${item.title}" 未配置任何下载地址（links 为空）。`)
    }

    // 检查分类是否为空（空分类无法出现在导航栏，也无法被筛选到）
    if (!item.category.trim()) {
      console.warn(`[config] 软件 "${item.title}" 未配置分类（category 为空）。`)
    }
  }
}

// 模块加载时对本地配置执行一次校验（开发环境）；
// 远程配置到达后同样校验一次，尽早暴露接口数据中的常见问题
if (import.meta.env.DEV) {
  validateSoftwareList(softwareConfig.value)
  watch(softwareConfig, list => validateSoftwareList(list))
}

/**
 * 软件列表读取组合式函数
 * ------------------------------------------------------------------
 * 所有组件通过本函数获取软件数据，而非直接 import 配置文件：
 * 这样后续若把静态配置替换为接口请求，只需改动这一处。
 *
 * @returns software   只读的软件列表（响应式）
 * @returns total      软件总数
 * @returns categories 去重后的分类名称列表（按首次出现顺序），供导航栏渲染
 */
export function useSoftwareList() {
  // computed 包装为只读响应式数据，远程配置到达后自动更新
  const software = computed<SoftwareItem[]>(() => softwareConfig.value)
  const total = computed(() => software.value.length)

  // 汇总分类：遍历列表依次加入 Set 去重，天然保持首次出现顺序
  const categories = computed<string[]>(() => {
    const seen = new Set<string>()
    for (const item of software.value) {
      seen.add(item.category)
    }
    return Array.from(seen)
  })

  return {
    software,
    total,
    categories,
  }
}
