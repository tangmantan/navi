import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { SoftwareItem } from '@/types'

/**
 * 模糊搜索组合式函数
 * ------------------------------------------------------------------
 * 基于软件的标题与说明做实时子串匹配：
 * 1. 关键词去除首尾空白并转为小写（大小写不敏感）；
 * 2. 支持以空格分隔多个关键词，多个关键词之间为 AND 关系
 *    （例如输入 "google 浏览器"，要求标题/说明中同时包含两者）；
 * 3. 关键词为空时返回完整列表。
 *
 * @param source 待搜索的软件列表（ref / getter / 普通数组均可）
 */
export function useSearch(source: MaybeRefOrGetter<SoftwareItem[]>) {
  /** 搜索框绑定的原始关键词 */
  const keyword = ref('')

  /**
   * 将输入规范化为关键词数组：
   * 连续空白折叠、拆分、转小写；纯空白输入得到空数组。
   */
  const tokens = computed(() =>
    keyword.value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
  )

  /** 判断单个软件是否命中全部关键词 */
  function matches(item: SoftwareItem): boolean {
    // 把标题与说明拼成一个可搜索文本（小写）
    const haystack = `${item.title} ${item.description}`.toLowerCase()
    return tokens.value.every((token) => haystack.includes(token))
  }

  /** 过滤后的软件列表（响应式派生，输入变化时自动更新） */
  const results = computed<SoftwareItem[]>(() => {
    // 无关键词直接返回原列表，避免无谓遍历
    if (tokens.value.length === 0) return toValue(source)
    return toValue(source).filter(matches)
  })

  /** 当前是否处于「有关键词」的搜索状态（供 UI 区分展示） */
  const isSearching = computed(() => tokens.value.length > 0)

  return {
    keyword,
    results,
    isSearching,
  }
}
