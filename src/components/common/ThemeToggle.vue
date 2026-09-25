<script setup lang="ts">
/**
 * 主题切换按钮
 * ------------------------------------------------------------------
 * 点击在 亮色 → 暗色 → 跟随系统 之间循环切换。
 * 图标展示「当前模式」，title 提示点击后将切换到的模式。
 */
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import sunIcon from '@iconify-icons/lucide/sun'
import moonIcon from '@iconify-icons/lucide/moon'
import monitorIcon from '@iconify-icons/lucide/monitor'
import { useTheme } from '@/composables/useTheme'

const { mode, cycleMode } = useTheme()

/** 各模式的中文名称 */
const MODE_LABEL: Record<string, string> = {
  light: '亮色',
  dark: '暗色',
  system: '跟随系统',
}

/** 各模式对应的图标 */
const modeIcon = computed(() => {
  if (mode.value === 'light') return sunIcon
  if (mode.value === 'dark') return moonIcon
  return monitorIcon
})

/** 循环切换后下一模式的中文名（用于 tooltip 提示） */
const nextModeLabel = computed(() => {
  const next = mode.value === 'light' ? 'dark' : mode.value === 'dark' ? 'system' : 'light'
  return MODE_LABEL[next]
})

/** 无障碍标签：说明当前状态与点击行为 */
const ariaLabel = computed(
  () => `当前主题：${MODE_LABEL[mode.value]}，点击切换为${nextModeLabel.value}`,
)
</script>

<template>
  <button
    type="button"
    :aria-label="ariaLabel"
    :title="`${MODE_LABEL[mode]} · 点击切换为${nextModeLabel}`"
    class="shrink-0 cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    @click="cycleMode"
  >
    <Icon :icon="modeIcon" :width="18" :height="18" aria-hidden="true" />
  </button>
</template>
