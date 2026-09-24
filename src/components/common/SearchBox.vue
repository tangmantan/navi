<script setup lang="ts">
/**
 * 搜索框组件
 * ------------------------------------------------------------------
 * 通过 v-model 双向绑定搜索关键词，由父组件进行实时模糊过滤。
 * 图标直接使用 Iconify 离线数据（@iconify-icons/lucide）。
 */
import { Icon } from '@iconify/vue'
import searchIcon from '@iconify-icons/lucide/search'

// Vue 3.5 稳定的 defineModel，父组件使用 v-model 即可双向绑定
const keyword = defineModel<string>({ default: '' })
</script>

<template>
  <div class="relative w-full">
    <!-- 前缀放大镜图标 -->
    <Icon
      :icon="searchIcon"
      :width="17"
      :height="17"
      aria-hidden="true"
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
    <input
      v-model="keyword"
      type="search"
      placeholder="搜索软件名称或说明…"
      aria-label="搜索软件"
      class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-900"
    />
  </div>
</template>
