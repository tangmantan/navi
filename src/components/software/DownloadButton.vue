<script setup lang="ts">
/**
 * 下载按钮组件（核心交互）
 * ------------------------------------------------------------------
 * 根据配置的下载地址数量自动切换两种行为：
 * - 1 个地址：渲染为 <a>，点击直接在新标签页打开下载地址；
 * - 多个地址：渲染为 <button>，点击展开/弹出地址选择面板，
 *   面板形态由 siteConfig.downloadPanelMode 决定（inline / popover）；
 * - 0 个地址：兜底渲染为禁用按钮（正常配置不应出现，仅防御性处理）。
 * 图标直接使用 Iconify 离线数据（@iconify-icons/lucide）。
 */
import { onUnmounted, ref, useId, type CSSProperties } from 'vue'
import { Icon } from '@iconify/vue'
import downloadIcon from '@iconify-icons/lucide/download'
import chevronDownIcon from '@iconify-icons/lucide/chevron-down'
import type { DownloadLink } from '@/types'
import { siteConfig } from '@/config'
import DownloadLinksInline from './DownloadLinksInline.vue'
import DownloadLinksPopover from './DownloadLinksPopover.vue'

const props = withDefaults(
  defineProps<{
    /** 当前软件的下载地址数组 */
    links: DownloadLink[]
    /** 下载按钮文字，不配置时默认为「下载」 */
    downloadText?: string
  }>(),
  {
    downloadText: '下载',
  },
)

/** 多地址面板的展示方式（来自站点配置，构建时确定，全局统一） */
const panelMode = siteConfig.downloadPanelMode

/** 多地址面板的展开状态（inline / popover 共用） */
const isOpen = ref(false)

/** 触发按钮的 DOM 引用（用于测量位置） */
const triggerRef = ref<HTMLButtonElement | null>(null)

/**
 * 组件根元素引用：内联模式下用于「点击外部收起」判断——
 * 点击目标不在根元素内（即按钮与面板之外的区域）时关闭面板。
 */
const rootRef = ref<HTMLElement | null>(null)

/** 浮层定位样式（打开时根据按钮位置计算） */
const panelStyle = ref<CSSProperties>({})

/** 面板唯一 id（Vue 3.5 useId），用于 aria-controls 无障碍关联 */
const panelId = useId()

/**
 * 测量触发按钮位置并计算浮层定位：
 * - 默认显示在按钮下方，与按钮同宽；
 * - 下方空间不足且上方空间更宽裕时，自动翻转到按钮上方，
 *   避免浮层超出视口。浮层高度按条目数估算（每行约 38px）。
 */
function measurePanelStyle(): CSSProperties {
  const rect = triggerRef.value!.getBoundingClientRect()
  const estimatedHeight = props.links.length * 38 + 12
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow

  const style: CSSProperties = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
  if (openUpward) {
    // 翻转向上：用 bottom 锚定到按钮上边缘
    style.bottom = `${window.innerHeight - rect.top + 6}px`
  } else {
    style.top = `${rect.bottom + 6}px`
  }
  return style
}

/**
 * 打开面板：
 * - 浮层模式：先测量定位并监听滚动/缩放，面板自带遮罩处理点击外部；
 * - 内联模式：注册 document click，点击按钮/面板以外的区域时收起。
 */
function openPanel() {
  if (panelMode === 'popover') {
    panelStyle.value = measurePanelStyle()
    // scroll 使用捕获阶段，可捕获任意容器的滚动事件；滚动即收起以防错位
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', closePanel)
  } else {
    document.addEventListener('click', handleOutsideClick)
  }
  isOpen.value = true
  // Esc 监听挂在 window 上，无论焦点在哪个元素都能关闭面板（两种模式通用）
  window.addEventListener('keydown', handleKeydown)
}

/** 关闭面板并移除已注册的全局监听 */
function closePanel() {
  if (!isOpen.value) return
  isOpen.value = false
  if (panelMode === 'popover') {
    window.removeEventListener('scroll', handleScroll, true)
    window.removeEventListener('resize', closePanel)
  } else {
    document.removeEventListener('click', handleOutsideClick)
  }
  window.removeEventListener('keydown', handleKeydown)
}

/**
 * 内联模式的「点击外部收起」：
 * 打开面板的那次点击会继续冒泡到 document，但其目标在根元素内
 * （触发按钮），因此不会立即误关；只有点击其他地方才收起。
 */
function handleOutsideClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) closePanel()
}

/** 切换浮层展开/收起 */
function togglePanel() {
  isOpen.value ? closePanel() : openPanel()
}

/** 滚动事件处理（捕获阶段）：浮层模式下任意滚动都收起面板 */
function handleScroll() {
  closePanel()
}

/** 键盘可访问性：按 Esc 收起已展开的浮层（window 级监听，不依赖焦点） */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closePanel()
}

// 组件卸载时兜底移除监听，避免内存泄漏
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', closePanel)
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('keydown', handleKeydown)
})

// 暴露收起方法，供父级组件在需要时（如切换搜索结果）调用
defineExpose({ closePanel })
</script>

<template>
  <div ref="rootRef">
    <!-- 场景一：仅有一个下载地址 —— 直接跳转 -->
    <a
      v-if="links.length === 1"
      :href="links[0].url"
      target="_blank"
      rel="noopener noreferrer"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 ring-1 ring-inset ring-blue-600/10 transition-colors hover:bg-blue-100 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20 dark:hover:bg-blue-500/20"
    >
      <Icon :icon="downloadIcon" :width="17" :height="17" aria-hidden="true" class="shrink-0" />
      <!-- min-w-0 + truncate：双按钮并排（宽度减半）时文字超长省略，避免撑破布局 -->
      <span class="min-w-0 truncate">{{ downloadText }}</span>
    </a>

    <!-- 场景二：有多个下载地址 —— 展开选择面板 -->
    <template v-else-if="links.length > 1">
      <button
        ref="triggerRef"
        type="button"
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 ring-1 ring-inset ring-blue-600/10 transition-colors hover:bg-blue-100 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20 dark:hover:bg-blue-500/20"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
        @click="togglePanel"
      >
        <Icon :icon="downloadIcon" :width="17" :height="17" aria-hidden="true" class="shrink-0" />
        <!-- min-w-0 + truncate：双按钮并排（宽度减半）时文字超长省略，避免撑破布局 -->
        <span class="min-w-0 truncate">{{ downloadText }}</span>
        <!-- 展开时箭头旋转 180° -->
        <Icon
          :icon="chevronDownIcon"
          :width="16"
          :height="16"
          aria-hidden="true"
          class="shrink-0 transition-transform duration-200"
          :class="isOpen ? 'rotate-180' : ''"
        />
      </button>

      <!-- 内联模式：面板在按钮下方展开，仅撑高当前卡片 -->
      <DownloadLinksInline
        v-if="panelMode === 'inline'"
        :links="links"
        :open="isOpen"
        :panel-id="panelId"
        @select="closePanel"
      />
      <!-- 浮层模式：Teleport 到 body，卡片高度保持不变 -->
      <DownloadLinksPopover
        v-else
        :links="links"
        :open="isOpen"
        :panel-id="panelId"
        :root-style="panelStyle"
        @select="closePanel"
        @close="closePanel"
      />
    </template>

    <!-- 场景三（兜底）：未配置地址 —— 禁用态 -->
    <button
      v-else
      type="button"
      disabled
      class="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-600"
    >
      <Icon :icon="downloadIcon" :width="17" :height="17" aria-hidden="true" class="shrink-0" />
      <span class="min-w-0 truncate">暂未提供下载</span>
    </button>
  </div>
</template>
