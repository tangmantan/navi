<script setup lang="ts">
/**
 * 顶部区域：品牌区 + 搜索框 + 主题切换按钮
 * ------------------------------------------------------------------
 * 左侧为站点名称与简介，右侧依次为搜索框、主题切换按钮。
 * 搜索关键词通过 v-model 向父组件双向透传，由父组件实时过滤列表。
 */
import { siteConfig } from '@/config'
import SearchBox from '@/components/common/SearchBox.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

// 透传给 SearchBox 的搜索关键词（App.vue 持有真实状态）
const keyword = defineModel<string>('keyword', { default: '' })
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80"
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

        <!-- 右侧操作区：搜索框弹性占满剩余空间，主题按钮固定宽度 -->
        <div class="flex flex-1 items-center justify-end gap-2">
          <SearchBox v-model="keyword" class="w-full max-w-xs sm:max-w-sm" />
          <ThemeToggle />
        </div>
      </div>
    </div>
  </header>
</template>
