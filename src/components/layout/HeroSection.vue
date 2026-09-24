<script setup lang="ts">
/**
 * Hero 主视觉区域
 * ------------------------------------------------------------------
 * 位于顶部栏下方、软件网格上方，集中呈现站点名称、简介与收录数量，
 * 建立页面的字体层级。背景使用柔和光晕装饰，暗色下同步降低强度。
 * 所有文案均来自 siteConfig，保持配置驱动。
 */
import { siteConfig } from '@/config'

defineProps<{
  /** 已收录软件总数 */
  total: number
}>()
</script>

<template>
  <section class="relative overflow-hidden">
    <!-- 背景光晕：纯装饰，不响应交互 -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0">
      <div
        class="absolute left-1/2 top-[-140px] h-[280px] w-[640px] max-w-[120vw] -translate-x-1/2 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-900/20"
      />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 pb-4 pt-12 text-center sm:pt-16">
      <!-- 主标题：移动端 4xl，sm 以上 5xl -->
      <h1
        class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white"
      >
        {{ siteConfig.name }}
      </h1>

      <!-- 副标题：限制最大宽度，避免超长行 -->
      <p
        class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400"
      >
        {{ siteConfig.tagline }}
      </p>

      <p class="mt-3 text-sm text-slate-400">
        共收录 {{ total }} 款常用软件
      </p>
    </div>
  </section>
</template>
