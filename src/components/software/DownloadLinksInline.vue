<script setup lang="ts">
/**
 * 下载地址选择面板 —— 内联模式（downloadPanelMode: 'inline'）
 * ------------------------------------------------------------------
 * 面板直接在卡片下载按钮下方展开：
 * - 采用 CSS Grid grid-rows [0fr] → [1fr] 技巧实现高度过渡，无需测量；
 * - 收起时通过 inert 属性禁止内部链接被键盘聚焦，避免 Tab 误入隐藏面板；
 * - 配合网格容器的 items-start，仅当前卡片被撑高，同行卡片不受影响。
 */
import { Icon } from '@iconify/vue'
import externalLinkIcon from '@iconify-icons/lucide/external-link'
import type { DownloadLink } from '@/types'

defineProps<{
  /** 下载地址列表（由 DownloadButton 保证至少 2 项） */
  links: DownloadLink[]
  /** 是否展开 */
  open: boolean
  /** 面板根元素 id，供触发按钮 aria-controls 关联 */
  panelId: string
}>()

const emit = defineEmits<{
  /** 选中某个地址 */
  (e: 'select'): void
}>()
</script>

<template>
  <div :id="panelId" :inert="open ? undefined : true">
    <!--
      外层 grid：通过 grid-template-rows 在 0fr / 1fr 间过渡；
      配合透明度变化，使展开/收起更柔和。
    -->
    <div
      class="grid transition-all duration-300 ease-out"
      :class="open ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
    >
      <!-- 内部包裹必须 overflow-hidden，0fr 时才能完全裁剪 -->
      <div class="overflow-hidden">
        <ul
          class="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60"
        >
          <li v-for="link in links" :key="link.url">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400"
              @click="emit('select')"
            >
              <span class="truncate">{{ link.name }}</span>
              <Icon
                :icon="externalLinkIcon"
                :width="15"
                :height="15"
                aria-hidden="true"
                class="shrink-0 opacity-50"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
