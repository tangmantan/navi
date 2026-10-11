<script setup lang="ts">
/**
 * 应用根组件
 * ------------------------------------------------------------------
 * 页面结构（整页锁定视口高度，仅卡片网格区域内部滚动）：
 *   顶部栏（搜索框 + 主题切换，固定不滚动）
 *   → Hero 主视觉（站点名 / 简介 / 收录数量，固定不滚动）
 *   → 分类导航栏（全部 + 各软件分类，固定不滚动）
 *   → 软件卡片网格（flex-1 + min-h-0，唯一的纵向滚动容器）
 *   → 页脚（固定在视口底部）
 */
import { computed, ref, watch, watchEffect } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import HeroSection from '@/components/layout/HeroSection.vue'
import CategoryNav from '@/components/layout/CategoryNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SoftwareGrid from '@/components/software/SoftwareGrid.vue'
import { useSoftwareList } from '@/composables/useSoftwareList'
import { useSearch } from '@/composables/useSearch'
import { siteConfig } from '@/config'
import type { SearchSuggestGroup, SoftwareItem } from '@/types'

// 浏览器标签页标题跟随站点配置：名称 · 说明
watchEffect(() => {
  document.title = `${siteConfig.name} · ${siteConfig.tagline}`
})

const { software, total, categories } = useSoftwareList()

/**
 * 当前选中的分类，空字符串 '' 表示「全部」。
 * 初始值来自站点配置 site.defaultCategory（不配置时为「全部」）；
 * 远程配置模式下数据异步到达，由下方 watch 在分类首次可用时应用。
 */
const activeCategory = ref('')

/** 当前搜索模式是否为 suggest（结果面板模式），由 site.searchMode 配置 */
const isSuggestMode = computed(() => siteConfig.searchMode === 'suggest')

/**
 * suggest 模式下被选中的下拉结果项：
 * 点击面板中的结果后，卡片网格切换为仅显示该软件；
 * 关键词变化 / 切换分类 / 远程数据整体替换时清除。
 */
const pickedResult = ref<SoftwareItem | null>(null)

/**
 * suggest 模式下的命中范围分类：
 * 点击面板中的分类分组标题后，卡片网格显示该分类下所有命中
 * 搜索词的卡片；清除时机与 pickedResult 相同。
 */
const pickedCategory = ref<string | null>(null)

/**
 * suggest 模式下的回车提交状态：按回车后卡片网格显示全部分类的
 * 命中结果、分类导航切换到「全部」；清除时机与 pickedResult 相同
 * （切换到具体分类、关键词变化、远程数据整体替换）。
 */
const searchSubmitted = ref(false)

/** 站点默认分类是否已应用（仅应用一次，避免覆盖用户后续的手动选择） */
let defaultCategoryApplied = false

// 分类列表就绪 / 远程数据整体替换时的处理（immediate：本地 config.json
// 启动时即有分类数据，需在 setup 阶段完成默认分类应用）
watch(
  categories,
  list => {
    // 已选分类在新数据中不存在 → 回退「全部」，避免过滤结果为空、
    // 导航栏无选中项
    if (activeCategory.value && !list.includes(activeCategory.value)) {
      activeCategory.value = ''
    }
    // 默认分类一次性应用：分类首次可用且用户尚未选择时生效；
    // site.defaultCategory 未配置或该分类不存在时保持「全部」
    if (!defaultCategoryApplied && !activeCategory.value && list.length) {
      const def = siteConfig.defaultCategory?.trim() ?? ''
      if (def && list.includes(def)) activeCategory.value = def
      defaultCategoryApplied = true
    }
  },
  { immediate: true },
)

/**
 * 分类过滤后的列表：选中「全部」时直接使用完整列表，
 * 否则只保留该分类下的软件。仅在未搜索时作为结果列表使用
 * （搜索激活时结果为全部分类的搜索命中，见下方 results）。
 */
const softwareByCategory = computed(() =>
  activeCategory.value
    ? software.value.filter(item => item.category === activeCategory.value)
    : software.value,
)

/**
 * 搜索在全部分类中进行：数据源为完整软件列表而非分类过滤后的子集，
 * 关键词可命中任意分类下的软件。
 */
const { keyword, results: searchResults, isSearching } = useSearch(software)

/**
 * 搜索与分类互斥联动：
 * - 输入关键词 → 记住当前分类并自动切到「全部」，在全部分类中搜索；
 *   导航高亮与搜索范围保持一致；
 * - 清空关键词 → 恢复搜索前选中的分类（该分类已不存在时回退「全部」）；
 * - 搜索中点击分类按钮 → 清空搜索并切换到该分类（两个控件不叠加过滤）。
 */
let categoryBeforeSearch = ''

watch(keyword, kw => {
  // 关键词变化即退出「已选中某个结果 / 已限定命中分类 / 回车提交」状态
  pickedResult.value = null
  pickedCategory.value = null
  searchSubmitted.value = false
  // suggest 模式下搜索结果只出现在下拉面板中，卡片网格保持分类视图，
  // 不做「切换全部/恢复分类」的联动
  if (isSuggestMode.value) return
  if (kw.trim()) {
    // 搜索激活：仅当当前选中具体分类时才备份并切换
    if (activeCategory.value) {
      categoryBeforeSearch = activeCategory.value
      activeCategory.value = ''
    }
  } else if (categoryBeforeSearch) {
    // 搜索结束：恢复备份的分类；远程配置更新导致分类消失时回退「全部」
    activeCategory.value = categories.value.includes(categoryBeforeSearch)
      ? categoryBeforeSearch
      : ''
    categoryBeforeSearch = ''
  }
})

watch(activeCategory, value => {
  // 面板交互（点击结果项 / 分组标题）会同步切换分类导航，此时保留
  // 对应的选中状态；其他来源（点击导航、远程配置重置）则正常清除
  if (pickedResult.value?.category !== value) pickedResult.value = null
  if (pickedCategory.value !== value) pickedCategory.value = null
  // 回车提交后导航停在「全部」：只有切换到具体分类才视为用户重新选择
  if (searchSubmitted.value && value !== '') searchSubmitted.value = false
  // 搜索期间选中态变为具体分类只可能来自用户点击导航：清空搜索，
  // 备份一并丢弃（用户已明确选择新分类，不再恢复旧分类）。
  // suggest 模式下搜索与分类互不干扰，无需清空关键词。
  if (value && isSearching.value && !isSuggestMode.value) {
    keyword.value = ''
    categoryBeforeSearch = ''
  }
})

// 远程配置整体替换软件列表后，已选结果的对象引用可能失效，一并清除
watch(software, () => {
  pickedResult.value = null
  pickedCategory.value = null
  searchSubmitted.value = false
})

/**
 * suggest 模式下拉面板的分组数据：
 * 按分类聚合搜索命中结果（分组顺序与分类首次出现顺序一致，
 * 与分类导航栏一致）；非 suggest 模式或未搜索时为空数组。
 */
const suggestGroups = computed<SearchSuggestGroup[]>(() => {
  if (!isSuggestMode.value || !isSearching.value) return []
  const grouped = new Map<string, SoftwareItem[]>()
  for (const item of searchResults.value) {
    const list = grouped.get(item.category)
    if (list) list.push(item)
    else grouped.set(item.category, [item])
  }
  return Array.from(grouped, ([category, items]) => ({ category, items }))
})

/**
 * 下拉面板结果项点击：卡片网格切换为仅显示该软件，
 * 分类导航同步高亮到该软件所属分类（导航与网格内容保持一致）
 */
function pickResult(item: SoftwareItem) {
  pickedResult.value = item
  pickedCategory.value = null
  activeCategory.value = item.category
}

/**
 * 下拉面板分类分组标题点击：卡片网格显示该分类下所有命中搜索词的
 * 卡片，分类导航同步高亮到该分类（面板保持展开，可继续选择）
 */
function pickCategory(category: string) {
  pickedResult.value = null
  pickedCategory.value = category
  activeCategory.value = category
}

/**
 * 搜索框回车提交（suggest 模式、未高亮结果项时）：
 * 卡片网格显示全部分类的命中结果，分类导航切换到「全部」
 */
function submitSearch() {
  if (!isSuggestMode.value || !isSearching.value) return
  searchSubmitted.value = true
  activeCategory.value = ''
}

/**
 * 最终展示列表（优先级从高到低）：
 * 1. suggest 模式下点击了下拉结果 → 仅显示该软件；
 * 2. suggest 模式下点击了分类分组标题 → 该分类下所有命中搜索词的卡片；
 * 3. suggest 模式下按回车提交 → 全部分类的命中结果；
 * 4. filter 模式且有关键词 → 全部分类的搜索结果；
 * 5. 其余情况 → 分类过滤结果。
 */
const results = computed(() => {
  if (pickedResult.value) return [pickedResult.value]
  if (pickedCategory.value && isSearching.value) {
    return searchResults.value.filter(item => item.category === pickedCategory.value)
  }
  if (searchSubmitted.value && isSearching.value) return searchResults.value
  if (isSearching.value && !isSuggestMode.value) return searchResults.value
  return softwareByCategory.value
})
</script>

<template>
  <!--
    h-dvh + overflow-hidden：整页锁定为视口高度且自身不滚动，
    纵向 flex 划分「固定高度区（头/Hero/导航/页脚）+ 弹性网格区」。
  -->
  <div class="flex h-dvh flex-col overflow-hidden">
    <!-- 搜索关键词双向绑定到顶部输入框；suggest 模式传入分组结果与选中事件 -->
    <AppHeader
      v-model:keyword="keyword"
      :suggest-groups="suggestGroups"
      @select="pickResult"
      @select-category="pickCategory"
      @submit="submitSearch"
    />

    <!-- 主视觉区域：展示软件总数（总数不随搜索/分类变化） -->
    <HeroSection :total="total" />

    <!-- min-h-0 允许弹性区域收缩到内容以下，滚动由内部网格区承担 -->
    <main class="flex min-h-0 flex-1 flex-col">
      <!-- 分类导航栏：v-model 绑定当前选中分类 -->
      <CategoryNav v-model="activeCategory" :categories="categories" />
      <!-- 展示分类 + 搜索双重过滤后的结果；无匹配时网格内部渲染空状态 -->
      <SoftwareGrid :items="results" />
    </main>

    <AppFooter />
  </div>
</template>
