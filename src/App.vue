<script setup lang="ts">
/**
 * 应用根组件
 * ------------------------------------------------------------------
 * 页面结构：
 *   顶部栏（搜索框 + 主题切换，sticky）
 *   → Hero 主视觉（站点名 / 简介 / 收录数量）
 *   → 分类导航栏（全部 + 各软件分类）
 *   → 软件卡片网格（分类 + 搜索双重过滤结果，响应式列数）
 *   → 页脚
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

// 浏览器标签页标题跟随站点配置：名称 · 说明
watchEffect(() => {
  document.title = `${siteConfig.name} · ${siteConfig.tagline}`
})

const { software, total, categories } = useSoftwareList()

/**
 * 当前选中的分类，空字符串 '' 表示「全部」。
 * 默认选中「装机必备」；用户可手动切换到其他分类或「全部」。
 */
const activeCategory = ref('装机必备')

// 远程配置到达后分类列表可能整体变化：若当前选中的分类在新数据中
// 已不存在，自动回退为「全部」，避免过滤结果为空、导航栏无选中项
watch(categories, list => {
  if (activeCategory.value && !list.includes(activeCategory.value)) {
    activeCategory.value = ''
  }
})

/**
 * 分类过滤后的列表：选中「全部」时直接使用完整列表，
 * 否则只保留该分类下的软件。作为搜索的数据源，
 * 因此分类与搜索关键词为 AND 关系（先分类、再搜索）。
 */
const softwareByCategory = computed(() =>
  activeCategory.value
    ? software.value.filter(item => item.category === activeCategory.value)
    : software.value,
)

// 以分类过滤后的列表为数据源做实时模糊搜索
const { keyword, results } = useSearch(softwareByCategory)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- 搜索关键词双向绑定到顶部输入框 -->
    <AppHeader v-model:keyword="keyword" />

    <!-- 主视觉区域：展示软件总数（总数不随搜索/分类变化） -->
    <HeroSection :total="total" />

    <main class="flex-1">
      <!-- 分类导航栏：v-model 绑定当前选中分类 -->
      <CategoryNav v-model="activeCategory" :categories="categories" />
      <!-- 展示分类 + 搜索双重过滤后的结果；无匹配时网格内部渲染空状态 -->
      <SoftwareGrid :items="results" />
    </main>

    <AppFooter />
  </div>
</template>
