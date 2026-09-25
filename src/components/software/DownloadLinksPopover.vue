<script setup lang="ts">
/**
 * 下载地址选择面板 —— 浮层模式（downloadPanelMode: 'popover'）
 * ------------------------------------------------------------------
 * 通过 Teleport 挂载到 <body>，以 fixed 定位浮在按钮正下方：
 * - 不占据文档流高度，展开时卡片自身与同行卡片高度都不变；
 * - 透明遮罩覆盖全屏，点击浮层以外区域关闭；
 * - 位置由父组件在打开瞬间测量按钮后通过 rootStyle 传入；
 * - 进入/离开使用透明度 + 轻微缩放上移的过渡。
 */
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import externalLinkIcon from '@iconify-icons/lucide/external-link'
import type { DownloadLink } from '@/types'
import { siteConfig } from '@/config'
import type { CSSProperties } from 'vue'

defineProps<{
  /** 下载地址列表（由 DownloadButton 保证至少 2 项） */
  links: DownloadLink[]
  /** 是否展开 */
  open: boolean
  /** 浮层根元素 id，供触发按钮 aria-controls 关联 */
  panelId: string
  /** 浮层定位样式（top / left / width，由父组件测量得到） */
  rootStyle: CSSProperties
}>()

const emit = defineEmits<{
  /** 选中某个地址 */
  (e: 'select'): void
  /** 点击遮罩（浮层外部） */
  (e: 'close'): void
}>()

/** 推荐徽标文案：site.recommendedText 可覆盖，默认「推荐」 */
const recommendedLabel = computed(() => siteConfig.recommendedText?.trim() || '推荐')
</script>

<template>
  <Teleport to="body">
    <!-- 透明点击层：覆盖视口，点击即关闭；z-40 低于浮层（无过渡，立即挂载/移除） -->
    <div
      v-if="open"
      class="fixed inset-0 z-40 cursor-default"
      aria-hidden="true"
      @click="emit('close')"
    />

    <!-- 浮层主体：过渡仅作用于浮层自身，避免祖先 transform 破坏 fixed 定位 -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      leave-active-class="transition duration-100 ease-in"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        :id="panelId"
        role="region"
        aria-label="选择下载地址"
        class="fixed z-50"
        :style="rootStyle"
      >
        <ul
          class="rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/40"
        >
          <li v-for="link in links" :key="link.url">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400"
              @click="emit('select')"
            >
              <!-- min-w-0 保证名称过长时截断而不是撑破浮层 -->
              <span class="flex min-w-0 items-center gap-1.5">
                <span class="truncate">{{ link.name }}</span>
                <!-- 推荐徽标：仅在地址配置 recommended: true 时显示 -->
                <span
                  v-if="link.recommended"
                  class="shrink-0 rounded-md bg-green-500/15 px-1.5 py-0.5 text-xs font-medium leading-none text-green-600 dark:bg-green-400/15 dark:text-green-400"
                >
                  {{ recommendedLabel }}
                </span>
              </span>
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
    </Transition>
  </Teleport>
</template>
