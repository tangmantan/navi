<script setup lang="ts">
/**
 * 顶部区域：品牌区 + 搜索框 + 主题切换按钮
 * ------------------------------------------------------------------
 * 左侧为站点名称与简介，右侧依次为搜索框、主题切换按钮。
 * 搜索关键词通过 v-model 向父组件双向透传，由父组件实时过滤列表。
 */
import { siteConfig } from '@/config'
import { Icon } from '@iconify/vue'
import githubIcon from '@iconify-icons/lucide/github'
import SearchBox from '@/components/common/SearchBox.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import type { SearchSuggestGroup, SoftwareItem } from '@/types'

// 透传给 SearchBox 的搜索关键词（App.vue 持有真实状态）
const keyword = defineModel<string>('keyword', { default: '' })

defineProps<{
  /** suggest 模式下按分类聚合的搜索结果分组（App.vue 计算传入） */
  suggestGroups?: SearchSuggestGroup[]
}>()

const emit = defineEmits<{
  /** 点击下拉面板中的结果项（转发给 App.vue 更新卡片网格） */
  (e: 'select', item: SoftwareItem): void
  /** 点击下拉面板中的分类分组标题（转发给 App.vue 按分类限定命中结果） */
  (e: 'selectCategory', category: string): void
  /** 回车提交搜索（转发给 App.vue 显示全部分类命中结果） */
  (e: 'submit'): void
}>()

/** 转发 SearchBox 的结果项点击事件 */
function onSelect(item: SoftwareItem) {
  emit('select', item)
}

/** 转发 SearchBox 的分类分组标题点击事件 */
function onSelectCategory(category: string) {
  emit('selectCategory', category)
}

/** 转发 SearchBox 的回车提交事件 */
function onSubmit() {
  emit('submit')
}
</script>

<template>
  <!--
    固定在视口顶部的普通文档块（整页不滚动，无需 sticky）；
    shrink-0 保证在纵向 flex 布局中不被压缩。
  -->
  <header
    class="relative z-50 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
  >
    <div class="mx-auto max-w-7xl px-3 py-3 sm:px-4">
      <div class="flex items-center gap-3 md:gap-6">
        <!-- 站点名称（移动端仅显示名称，简介在 md 以上显示） -->
        <a href="/" class="flex shrink-0 items-baseline gap-2">
          <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {{ siteConfig.name }}
          </span>
          <span class="hidden text-sm text-slate-400 md:inline">
            {{ siteConfig.tagline }}
          </span>
        </a>

        <!-- 右侧操作区：搜索框弹性占满剩余空间，GitHub/主题按钮固定宽度 -->
        <div class="flex flex-1 items-center justify-end gap-2">
          <SearchBox
            v-model="keyword"
            :groups="suggestGroups"
            @select="onSelect"
            @select-category="onSelectCategory"
            @submit="onSubmit"
            class="w-full max-w-xs sm:max-w-sm"
          />
          <!-- 开源仓库链接（site.repo 配置后显示），样式与主题按钮保持一致 -->
          <a
            v-if="siteConfig.repo"
            :href="siteConfig.repo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub 开源仓库"
            title="GitHub 开源仓库"
            class="shrink-0 cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Icon :icon="githubIcon" :width="18" :height="18" aria-hidden="true" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>
</template>
