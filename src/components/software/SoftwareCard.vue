<script setup lang="ts">
/**
 * 软件展示块组件
 * ------------------------------------------------------------------
 * 卡片上半部分展示 logo、标题与说明，底部为下载按钮。
 * 下载按钮内部根据 links 数量自动处理「直下 / 展开选择」。
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { SoftwareItem } from '@/types'
import { parseCssText } from '@/utils/style'
import { siteConfig } from '@/config'
import DownloadButton from './DownloadButton.vue'

const { item } = defineProps<{
  /** 单个软件的完整展示数据 */
  item: SoftwareItem
}>()

/**
 * 顶部信息区是否为 stacked 布局：
 * 由 siteConfig.cardLayout 控制（horizontal 默认 / stacked）。
 * stacked 时 logo 与标题同行，说明在 logo 下方占满整行宽度。
 */
const isStackedLayout = computed(() => siteConfig.cardLayout === 'stacked')

/** 是否存在有效的第二组下载地址（配置了非空 links2 时才渲染第二个按钮） */
const hasSecondaryLinks = computed(() => Array.isArray(item.links2) && item.links2.length > 0)

/**
 * logo 自定义内联样式对象：
 * 将配置中的 CSS 文本（item.logoStyle）解析为对象后绑定。
 * 必须用对象形式——@iconify/vue 的 <Icon> 会丢弃字符串形式的 style。
 */
const logoInlineStyle = computed(() => parseCssText(item.logoStyle))

/** 两个下载按钮组件的实例引用，用于在一组展开面板时收起另一组（互斥） */
const primaryBtnRef = ref<InstanceType<typeof DownloadButton> | null>(null)
const secondaryBtnRef = ref<InstanceType<typeof DownloadButton> | null>(null)

/** 双按钮所在的 grid 容器引用，用于读取可用宽度与字体 */
const gridRef = ref<HTMLElement | null>(null)

/** 两个按钮的计算宽度（px），传入 DownloadButton 以精确控制 */
const primaryWidth = ref<number | undefined>(undefined)
const secondaryWidth = ref<number | undefined>(undefined)

/** 复用同一个 canvas 上下文测量文字宽度，避免反复创建 */
let measureCtx: CanvasRenderingContext2D | null = null
function measureTextWidth(text: string, font: string): number {
  if (!measureCtx) {
    measureCtx = document.createElement('canvas').getContext('2d')
  }
  if (!measureCtx) return text.length * 8
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

/**
 * 计算按钮内容的自然宽度（px）：
 * 左右内边距(px-4=32) + 下载图标(17) + 图标间距(8) + 文字宽度
 * + 多地址场景的下拉箭头(16)及其间距(8)。
 */
function contentWidth(text: string, hasChevron: boolean, font: string): number {
  const paddingX = 32
  const downloadIcon = 17
  const gap = 8
  const chevronIcon = 16
  return paddingX + downloadIcon + gap + measureTextWidth(text, font) + (hasChevron ? gap + chevronIcon : 0)
}

/**
 * 双按钮宽度分配策略：
 * 1. 两按钮内容总宽 ≤ 卡片可用宽度：
 *    - 若较宽者的内容 ≤ 半卡宽 → 两按钮等宽，各占半卡并撑满整张卡片；
 *    - 否则等宽会截断较长文本 → 第一个按钮取内容宽度（保证文本完整），
 *      第二个按钮占满剩余空间（同样撑满卡片）。
 * 2. 总宽 > 可用宽度 → 文字较多的按钮挤压文字较少的按钮，
 *    但至少保证第一个按钮（links）的文本完整显示。
 */
function computeWidths() {
  const grid = gridRef.value
  if (!grid) return

  // 读取按钮真实字体与列间距，保证测量与实际渲染一致
  const btnEl = grid.querySelector('a, button') as HTMLElement | null
  const font = btnEl ? getComputedStyle(btnEl).font : '500 14px sans-serif'
  const colGap = parseFloat(getComputedStyle(grid).columnGap) || 6
  const available = grid.clientWidth - colGap
  if (available <= 0) return

  const text1 = item.downloadText ?? '下载'
  const text2 = item.downloadText2 ?? item.downloadText ?? '下载'
  const hasChevron1 = item.links.length > 1
  const hasChevron2 = (item.links2?.length ?? 0) > 1

  const W1 = contentWidth(text1, hasChevron1, font)
  const W2 = contentWidth(text2, hasChevron2, font)

  let w1: number
  let w2: number

  if (W1 + W2 <= available) {
    const half = available / 2
    if (Math.max(W1, W2) <= half) {
      // 两按钮内容均不超过半卡：等宽撑满整张卡片
      w1 = w2 = half
    } else {
      // 等宽会截断较长文本：优先保证第一个按钮文本完整，第二个占满剩余
      w1 = W1
      w2 = available - w1
    }
  } else if (W1 >= W2) {
    // 第一个文字更多：第一个完整显示，第二个占剩余空间
    w1 = Math.min(W1, available)
    w2 = Math.max(0, available - w1)
  } else {
    // 第二个文字更多：先让第二个完整显示，第一个占剩余
    w2 = Math.min(W2, available)
    w1 = Math.max(0, available - w2)
    // 至少保证第一个按钮文本完整显示
    if (w1 < W1) {
      w1 = Math.min(W1, available)
      w2 = Math.max(0, available - w1)
    }
  }

  primaryWidth.value = Math.round(w1)
  secondaryWidth.value = Math.round(w2)
}

/** 监听卡片宽度变化（响应式布局），重新计算按钮宽度 */
let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  nextTick(computeWidths)
  if (gridRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(computeWidths)
    resizeObserver.observe(gridRef.value)
  }
})
onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

// 按钮文字变化时重新计算
watch(
  () => [item.downloadText, item.downloadText2, item.links.length, item.links2?.length ?? 0],
  () => nextTick(computeWidths),
)

/**
 * 判断 logo 值是否为 Iconify 图标名（形如 `prefix:icon-name`）：
 * - 命中 → 交给 <Icon> 渲染；本地未注册时组件自动从 Iconify 在线 API
 *   （https://api.iconify.design）拉取图标数据；
 * - 未命中 → 视为图片地址，用 <img> 渲染（支持 /path、https URL）。
 */
function isIconifyName(value: string): boolean {
  return /^[\w-]+:[\w-]+$/.test(value)
}

/**
 * 解析图片地址：以 / 开头的本地 public 资源路径需拼接部署 base
 * （import.meta.env.BASE_URL），否则部署在子路径（如 GitHub Pages
 * 的 /<仓库名>/）时会因绝对路径指向域名根目录而 404。
 * 网络 URL 与 Iconify 名不受影响。
 */
function resolveImageUrl(url: string): string {
  return url.startsWith('/') ? import.meta.env.BASE_URL + url.slice(1) : url
}

/**
 * 图片加载失败处理：隐藏 <img> 避免出现破碎图标，该位置留空。
 * 按约定：配置了 logo 就不显示标题首字（首字仅用于 logo 为空时）。
 */
function handleLogoError(event: Event) {
  ;(event.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <article
    class="group relative m-2.5 flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-300/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-xl dark:hover:shadow-black/60"
  >
    <!--
      整卡官网链接（stretched link）：透明 <a> 覆盖整张卡片，
      点击 logo / 标题 / 说明区域即在新标签页打开官网，原生支持键盘与中键。
      下载按钮所在区域通过 relative z-10 浮于该链接之上，点击互不干扰。
      website 未配置时不渲染此链接，卡片主体不可点击跳转。
    -->
    <a
      v-if="item.website"
      :href="item.website"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`访问 ${item.title} 官网`"
      class="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    />
    <!--
      顶部信息区：logo + 标题 + 说明。
      使用 CSS Grid 命名区域（见文件底部 <style>），同一套 DOM 在两种布局间切换，
      布局由 siteConfig.cardLayout 控制：
      - horizontal（默认）：logo 在左并跨两行，标题/说明纵向排在其右侧；
      - stacked：logo 与标题在第一行，说明移至第二行占满整宽（logo 下方）。
    -->
    <div
      class="card-header"
      :class="isStackedLayout ? 'card-header--stacked' : 'card-header--horizontal'"
    >
      <!--
        logo 容器：固定 48×48 占位，overflow-hidden 裁剪溢出，
        默认不带背景色。logo 不随卡片悬停放大。
        - Iconify 图标名：只渲染图标；
        - 图片地址：只渲染图片（加载失败时隐藏图片，不留文字）；
        - 空字符串：显示标题首字作为占位。
        即：只要配置了 logo，就不显示标题首字；logo 为空才显示。
      -->
      <div
        class="card-header__logo relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden"
      >
        <!--
          Iconify 图标：单色图标以 currentColor 着色，默认中性深色；
          配置了 logoStyle 时通过内联样式覆盖默认样式（内联样式优先级
          高于 class）。注意 @iconify/vue 只接受对象形式的 style，
          CSS 文本需先经 parseCssText 解析。
        -->
        <Icon
          v-if="isIconifyName(item.logo)"
          :icon="item.logo"
          aria-hidden="true"
          class="absolute inset-0 h-full w-full text-slate-700 dark:text-slate-200"
          :style="logoInlineStyle"
        />
        <!-- 图片地址：只渲染图片本身；logoStyle 解析为同一对象后生效 -->
        <img
          v-else-if="item.logo"
          :src="resolveImageUrl(item.logo)"
          :alt="`${item.title} logo`"
          class="absolute inset-0 h-full w-full"
          :style="logoInlineStyle"
          loading="lazy"
          @error="handleLogoError"
        />
        <!-- logo 为空：标题首字占位 -->
        <span
          v-else
          class="text-lg font-semibold text-slate-400 dark:text-slate-500"
        >
          {{ item.title.charAt(0) }}
        </span>
      </div>

      <!-- min-w-0 使 grid 轨道内的 truncate 能正常截断超长标题 -->
      <h3
        class="card-header__title min-w-0 truncate text-base font-semibold text-slate-900 dark:text-slate-100"
      >
        {{ item.title }}
      </h3>
      <!--
        说明区：line-clamp-3 超出三行省略，min-h-[4.875em] 固定占用
        三行高度（leading-relaxed 行高 1.625 × 3），即使文案不足三行，
        所有卡片默认高度仍保持一致。
        horizontal 时排在 logo 右侧；stacked 时经 grid-area 移至
        logo 下方并占满整行宽度（与标题的间距由 card-header 的 row-gap 控制）。
      -->
      <p
        class="card-header__desc min-h-[4.875em] line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400"
      >
        {{ item.description }}
      </p>
    </div>

    <!--
      下载操作区：relative z-10 使其浮于整卡官网链接之上，
      mt-auto 将下载按钮推至卡片底部（默认高度由说明区三行占位保证一致）。
    -->
    <div class="relative z-10 mt-auto pt-5">
      <!--
        配置了第二组地址（links2）时：两个下载按钮同一行显示，面板占满整行宽度。
        - grid grid-cols-[max-content_max-content]：两个按钮各按内容宽度占一列，
          避免被强制拉伸；gap-x-1.5 控制按钮间距；
        - 包裹 div 与 DownloadButton 根元素均为 display:contents，使按钮与面板
          直接成为 grid 的子项；
        - DownloadButton 传 compact：按钮 w-auto（内容宽），内联面板 col-span-full
          占满整行（与单按钮时宽度一致），浮层面板宽度也取整行宽度；
        - 点击任一组区域时借助事件冒泡收起另一组已展开的面板，保证两组互斥。
      -->
      <div
        v-if="hasSecondaryLinks"
        ref="gridRef"
        class="grid w-full grid-cols-[auto_auto] gap-x-1.5 items-start"
      >
        <div class="contents" @click="secondaryBtnRef?.closePanel()">
          <DownloadButton
            ref="primaryBtnRef"
            compact
            :compact-col="1"
            :width="primaryWidth"
            :links="item.links"
            :download-text="item.downloadText"
          />
        </div>
        <div class="contents" @click="primaryBtnRef?.closePanel()">
          <DownloadButton
            ref="secondaryBtnRef"
            compact
            :compact-col="2"
            :width="secondaryWidth"
            :links="item.links2 ?? []"
            :download-text="item.downloadText2 ?? item.downloadText"
          />
        </div>
      </div>
      <!-- 未配置 links2：保持单个下载按钮的原有布局 -->
      <DownloadButton
        v-else
        :links="item.links"
        :download-text="item.downloadText"
      />
    </div>
  </article>
</template>

<style scoped>
/**
 * 卡片顶部信息区 Grid 布局
 * ------------------------------------------------------------------
 * 两列固定为 [logo(auto) | 文案(1fr)]，通过 grid-template-areas
 * 重排三个直接子元素（logo / title / desc），两种布局共用一套 DOM：
 * - horizontal：logo 区域跨两行（'logo title' / 'logo desc'），
 *   与原 flex 布局等价，logo 顶部对齐；
 * - stacked：logo 与标题共享第一行（'logo title'），
 *   说明独占第二行整宽（'desc desc'），logo 与标题垂直居中对齐。
 */
.card-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 1rem; /* gap-4：logo 与文案的横向间距 */
}
.card-header--horizontal {
  align-items: start;
  row-gap: 0.25rem; /* 对应原标题与说明之间的 mt-1 */
  grid-template-areas:
    'logo title'
    'logo desc';
}
.card-header--stacked {
  align-items: center;
  row-gap: 0.75rem; /* logo/标题行 与 说明行之间的间距 */
  grid-template-areas:
    'logo title'
    'desc desc';
}
.card-header__logo {
  grid-area: logo;
}
.card-header__title {
  grid-area: title;
}
.card-header__desc {
  grid-area: desc;
}
</style>
