<script setup lang="ts">
/**
 * 页脚组件
 * 文案来自 siteConfig.footer，保持配置驱动。
 */
import { siteConfig } from '@/config'
</script>

<template>
  <footer
    v-if="siteConfig.footer"
    class="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500"
  >
    <p class="mx-auto max-w-3xl px-4">{{ siteConfig.footer }}</p>
  </footer>
</template>
