<script setup lang="ts">
/**
 * 内容区域：软件展示块瀑布流网格
 * ------------------------------------------------------------------
 * 接收经过分类 + 搜索双重过滤的软件数组，使用 vue-waterfall-mini 组件
 * 完成瀑布流定位：组件通过 Vue 响应式数据绑定元素样式（而非命令式
 * DOM 操作），在列数变化、容器宽度变化、list 增删改时自动重排，
 * 保留卡片以 left/top 过渡平滑滑动，新加入卡片播 fade-up 加入动画。
 *
 * 组件无法感知卡片「内部」的高度变化（内联下载面板展开/收起），
 * 这里通过 ResizeObserver 监听每个卡片的尺寸并调用组件暴露的
 * rerender 触发重排。数组为空时渲染空状态提示。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import searchIcon from '@iconify-icons/lucide/search'
import Waterfall from 'vue-waterfall-mini'
import 'vue-waterfall-mini/style'
import type { SoftwareItem } from '@/types'
import SoftwareCard from './SoftwareCard.vue'

defineProps<{
  /** 待展示的软件列表 */
  items: SoftwareItem[]
}>()

/** 瀑布流组件实例（用于调用暴露的 rerender 与读取根 DOM） */
const waterfallRef = ref<InstanceType<typeof Waterfall> | null>(null)

/**
 * 列数断点。注意 breakPoint 收到的是「瀑布流容器宽度」而非视口宽度：
 * 容器带有 -m-2.5 负边距（-10px × 2），宽度 = section 内容宽 + 20px。
 * section 内容宽 = min(视口宽 - 32(px-4), 1440(max-w-[1440px]))，
 * 因此 Tailwind 断点 sm/lg/xl（640/1024/1280）理论映射为
 * 628 / 1012 / 1268；考虑负边距下的亚像素测量误差，阈值各留 2px
 * 余量（626 / 1010 / 1266），最多只提前 2px 换列，视觉无差异。
 */
function getColumns(containerWidth: number): number {
  if (containerWidth >= 1266) return 4
  if (containerWidth >= 1010) return 3
  if (containerWidth >= 626) return 2
  return 1
}

/**
 * 调用瀑布流重排。组件内部的 rerender 是 100ms 的尾部防抖，
 * 若以 <100ms 的间隔连续调用会被不断重置（面板高度过渡期间
 * ResizeObserver 每帧触发），导致一次重排都无法落地。
 * 这里做「间隔 ≥110ms 的节流 + 一次尾部调用」，保证过渡期间
 * 重排能周期性落地、面板停止变化后还能再收尾一次。
 */
const RERENDER_INTERVAL = 110
let lastRerenderAt = 0
let trailingTimer: ReturnType<typeof setTimeout> | null = null

function scheduleRerender() {
  if (!waterfallRef.value) return
  const now = performance.now()
  const elapsed = now - lastRerenderAt
  if (elapsed >= RERENDER_INTERVAL) {
    lastRerenderAt = now
    void waterfallRef.value.rerender()
    return
  }
  if (trailingTimer) return
  trailingTimer = setTimeout(() => {
    trailingTimer = null
    lastRerenderAt = performance.now()
    void waterfallRef.value?.rerender()
  }, RERENDER_INTERVAL - elapsed)
}

/** 观察瀑布流内部每个卡片元素的尺寸变化（内联面板展开/收起） */
let resizeObserver: ResizeObserver | null = null
/** 观察瀑布流卡片的增删（搜索过滤），为新卡片挂上尺寸观察 */
let mutationObserver: MutationObserver | null = null

onMounted(() => {
  const root = waterfallRef.value?.$el as HTMLElement | undefined
  if (!root || typeof ResizeObserver === 'undefined') return

  resizeObserver = new ResizeObserver(() => scheduleRerender())
  const ro = resizeObserver
  mutationObserver = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) ro.observe(node as Element)
      })
      record.removedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) ro.unobserve(node as Element)
      })
    })
  })

  Array.from(root.children).forEach(child => ro.observe(child))
  mutationObserver.observe(root, { childList: true })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  if (trailingTimer) clearTimeout(trailingTimer)
})
</script>

<template>
  <!--
    唯一的纵向滚动容器：
    - w-full：显式宽度。section 是 flex-column 容器 main 的子项，而
      mx-auto 的 auto 外边距在 flex 中会使元素放弃默认拉伸、改按内容
      宽度收缩；瀑布流卡片为绝对定位无法撑开父容器，缺它会坍缩成一条；
    - max-w-[1440px] + mx-auto：限宽 1440px 并水平居中（窄屏由 w-full 占满）；
    - flex-1 + min-h-0：占满 main 的剩余高度，并允许在 flex 布局中收缩；
    - overflow-y-auto：仅卡片网格区域内部滚动，头部/Hero/分类栏/页脚固定；
    - overscroll-contain：滚动到边界时不发生滚动链穿透；
    - 滚动条隐藏策略与全站一致（Firefox scrollbar-width + WebKit 伪元素），
      仍可通过滚轮 / 触控板 / 触屏正常滚动。
  -->
  <section
    class="mx-auto w-full max-w-[1440px] min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4 [scrollbar-width:none] sm:pb-10 sm:pt-6 [&::-webkit-scrollbar]:hidden"
  >
    <!--
      Waterfall：
      - list 驱动卡片集合，row-key 以 item.id 唯一识别（搜索过滤时
        保留卡片才能被组件正确识别并播放重排过渡）；
      - -m-2.5 负边距配合卡片自身 m-2.5，制造 20px 视觉间距的同时
        边缘仍与 section 的 px-4 对齐（组件内部卡片间隙固定为 0，
        官方推荐用卡片 margin 调整视觉间隙）；
      - animate="fade-up"：新加入卡片淡入并从下方滑入；
      - transition 控制重排动画时长，join-duration 控制加入动画时长。
    -->
    <Waterfall
      ref="waterfallRef"
      :list="items"
      :row-key="(item: Record<string, unknown>) => item.id as string"
      :break-point="getColumns"
      :transition="300"
      :join-duration="300"
      animate="fade-up"
      class="-m-2.5"
    >
      <template #="{ item }">
        <SoftwareCard :item="item as unknown as SoftwareItem" />
      </template>
    </Waterfall>

    <!-- 空状态：搜索无结果时展示（容器此时高度为 0，视觉无差异） -->
    <div v-if="!items.length" class="flex flex-col items-center py-24 text-center">
      <!-- 圆形图标底，强化空状态视觉层级 -->
      <div
        class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-900"
      >
        <Icon :icon="searchIcon" :width="26" :height="26" aria-hidden="true" />
      </div>
      <p class="mt-4 text-base font-medium text-slate-700 dark:text-slate-300">
        没有找到匹配的软件
      </p>
      <p class="mt-1 text-sm text-slate-400">试试更换搜索关键词</p>
    </div>
  </section>
</template>
