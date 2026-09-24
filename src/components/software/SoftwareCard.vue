<script setup lang="ts">
/**
 * 软件展示块组件
 * ------------------------------------------------------------------
 * 卡片上半部分展示 logo、标题与说明，底部为下载按钮。
 * 下载按钮内部根据 links 数量自动处理「直下 / 展开选择」。
 */
import { Icon } from '@iconify/vue'
import type { SoftwareItem } from '@/types'
import DownloadButton from './DownloadButton.vue'

const { item } = defineProps<{
  /** 单个软件的完整展示数据 */
  item: SoftwareItem
}>()

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
    class="group relative m-2.5 flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:shadow-lg dark:hover:shadow-blue-950/40"
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
    <!-- 顶部信息区：logo + 标题/说明 -->
    <div class="flex items-start gap-4">
      <!--
        logo 容器：固定 48×48 占位，overflow-hidden 裁剪溢出，
        默认不带背景色。logo 不随卡片悬停放大。
        - Iconify 图标名：只渲染图标；
        - 图片地址：只渲染图片（加载失败时隐藏图片，不留文字）；
        - 空字符串：显示标题首字作为占位。
        即：只要配置了 logo，就不显示标题首字；logo 为空才显示。
      -->
      <div
        class="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl"
      >
        <!--
          Iconify 图标：单色图标以 currentColor 着色，默认中性深色；
          配置了 logoColor 时内联样式覆盖默认色（内联样式优先级高于
          class，且动态颜色值无法在构建时生成 Tailwind class）。
        -->
        <Icon
          v-if="isIconifyName(item.logo)"
          :icon="item.logo"
          aria-hidden="true"
          class="absolute inset-0 h-full w-full text-slate-700 dark:text-slate-200"
          :style="item.logoColor ? { color: item.logoColor } : undefined"
        />
        <!-- 图片地址：只渲染图片本身 -->
        <img
          v-else-if="item.logo"
          :src="resolveImageUrl(item.logo)"
          :alt="`${item.title} logo`"
          class="absolute inset-0 h-full w-full"
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

      <div class="min-w-0">
        <h3 class="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
          {{ item.title }}
        </h3>
        <!--
          说明区：line-clamp-3 超出三行省略；
          min-h-[4.875em] 固定占用三行高度（leading-relaxed 行高 1.625 × 3），
          即使文案不足三行，所有卡片默认高度仍保持一致。
        -->
        <p
          class="mt-1 min-h-[4.875em] text-sm leading-relaxed text-slate-500 line-clamp-3 dark:text-slate-400"
        >
          {{ item.description }}
        </p>
      </div>
    </div>

    <!--
      下载操作区：relative z-10 使其浮于整卡官网链接之上，
      mt-auto 将下载按钮推至卡片底部（默认高度由说明区三行占位保证一致）。
    -->
    <div class="relative z-10 mt-auto pt-5">
      <DownloadButton :links="item.links" :download-text="item.downloadText" />
    </div>
  </article>
</template>
