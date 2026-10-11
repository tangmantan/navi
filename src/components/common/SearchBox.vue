<script setup lang="ts">
/**
 * 搜索框组件
 * ------------------------------------------------------------------
 * 通过 v-model 双向绑定搜索关键词，由父组件进行实时模糊过滤。
 * site.searchMode 为 suggest 时，搜索结果以面板形式显示在搜索框下方：
 * 按分类分组展示标题与说明，支持 ↑/↓ 选择、Enter 确认、Esc 关闭；
 * 点击结果项通过 select 事件通知父组件（卡片网格切换为仅显示该软件）。
 * filter 模式（默认）下面板不出现，行为与原先一致。
 * 图标直接使用 Iconify 离线数据（@iconify-icons/lucide）。
 */
import { computed, nextTick, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import searchIcon from '@iconify-icons/lucide/search'
import arrowRightIcon from '@iconify-icons/lucide/arrow-right'
import { siteConfig } from '@/config'
import type { SearchSuggestGroup, SoftwareItem } from '@/types'

// Vue 3.5 稳定的 defineModel，父组件使用 v-model 即可双向绑定
const keyword = defineModel<string>({ default: '' })

const props = defineProps<{
  /** suggest 模式下按分类聚合的搜索结果分组（App.vue 计算传入） */
  groups?: SearchSuggestGroup[]
}>()

const emit = defineEmits<{
  /** 点击下拉面板中的某个结果项 */
  (e: 'select', item: SoftwareItem): void
  /** 点击某个分类的分组标题：卡片网格显示该分类下所有命中搜索词的卡片 */
  (e: 'selectCategory', category: string): void
  /** 回车提交（未高亮任何结果项时）：卡片网格显示全部分类的命中结果 */
  (e: 'submit'): void
}>()

/** 是否为 suggest 搜索模式（结果面板显示在搜索框下方） */
const isSuggestMode = computed(() => siteConfig.searchMode === 'suggest')

/** 面板底部快捷键提示中 kbd 键位的统一样式 */
const kbdClass =
  'inline-block rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px] leading-4 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'

/** 输入框聚焦状态：聚焦且有关键词时展示结果面板 */
const focused = ref(false)

/** 键盘 ↑/↓ 导航的扁平索引（-1 表示未选中任何项） */
const activeIndex = ref(-1)

const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

/** 分组数据的扁平化列表（与面板展示顺序一致，供键盘导航） */
const flatItems = computed<SoftwareItem[]>(() =>
  (props.groups ?? []).flatMap(group => group.items),
)

/** 当前键盘高亮项的 id（用于面板项高亮与 aria-selected） */
const activeId = computed(() => flatItems.value[activeIndex.value]?.id ?? null)

/** 面板可见：suggest 模式 + 聚焦 + 有关键词（纯空白关键词视为未搜索） */
const panelOpen = computed(
  () => isSuggestMode.value && focused.value && keyword.value.trim().length > 0,
)

// 关键词或结果分组变化时重置键盘选中项
watch([keyword, () => props.groups], () => {
  activeIndex.value = -1
})

// 键盘高亮变化时将选中项滚动到可视范围（长列表导航）
watch(activeIndex, async () => {
  if (activeIndex.value < 0) return
  await nextTick()
  panelRef.value
    ?.querySelector('[data-active="true"]')
    ?.scrollIntoView({ block: 'nearest' })
})

/** 选中结果项（点击 / Enter 共用）：通知父组件并收起面板 */
function selectItem(item: SoftwareItem) {
  emit('select', item)
  closePanel()
}

/** 收起面板并让输入框失焦（移动端同步收起软键盘） */
function closePanel() {
  activeIndex.value = -1
  focused.value = false
  inputRef.value?.blur()
}

/** 输入框键盘导航：↑/↓ 移动高亮（边界钳制）、Enter 确认、Esc 关闭 */
function onKeydown(event: KeyboardEvent) {
  if (!panelOpen.value) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const total = flatItems.value.length
    if (total === 0) return
    const delta = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = Math.min(total - 1, Math.max(0, activeIndex.value + delta))
    return
  }
  if (event.key === 'Enter') {
    const item = flatItems.value[activeIndex.value]
    if (item) {
      // 高亮了某个结果项：确认该项（网格仅显示该软件）
      event.preventDefault()
      selectItem(item)
    } else {
      // 未高亮任何结果项：提交搜索（网格显示全部分类的命中结果）
      event.preventDefault()
      emit('submit')
      closePanel()
    }
    return
  }
  if (event.key === 'Escape') {
    // 阻止浏览器对 type=search 的原生「Esc 清空输入」行为，仅收起面板
    event.preventDefault()
    closePanel()
  }
}
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
      ref="inputRef"
      v-model="keyword"
      type="search"
      :placeholder="siteConfig.searchPlaceholder"
      aria-label="搜索软件"
      role="combobox"
      :aria-expanded="panelOpen"
      aria-controls="search-suggest-panel"
      aria-autocomplete="list"
      class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:bg-slate-900"
      @focus="focused = true"
      @blur="focused = false"
      @keydown="onKeydown"
    />
    <!--
      suggest 模式结果面板：绝对定位于搜索框正下方，按分类分组展示
      标题与说明。面板根元素 @mousedown.prevent：点击面板项时阻止输入框
      先失焦（blur 会先于 click 关闭面板，导致点击落空）。
    -->
    <div
      v-if="panelOpen"
      id="search-suggest-panel"
      ref="panelRef"
      role="listbox"
      aria-label="搜索结果"
      class="absolute inset-x-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-300/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50"
      @mousedown.prevent
    >
      <template v-if="groups?.length">
        <div
          v-for="group in groups"
          :key="group.category"
          role="group"
          :aria-label="group.category"
        >
          <!--
            分组标题：分类名，吸顶便于长列表滚动时定位所属分类；
            整行可点击（右侧「查看全部」入口），点击后卡片网格显示
            该分类下所有命中搜索词的卡片（面板保持展开可继续选择）
          -->
          <button
            type="button"
            class="sticky top-0 flex w-full cursor-pointer items-center justify-between bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            @click="emit('selectCategory', group.category)"
          >
            <span>{{ group.category }}</span>
            <span class="flex items-center gap-0.5 font-normal">
              查看全部
              <Icon :icon="arrowRightIcon" :width="11" :height="11" aria-hidden="true" />
            </span>
          </button>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            role="option"
            :aria-selected="item.id === activeId"
            :data-active="item.id === activeId || undefined"
            class="block w-full cursor-pointer px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            :class="item.id === activeId ? 'bg-slate-100 dark:bg-slate-800' : ''"
            @click="selectItem(item)"
          >
            <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {{ item.title }}
            </p>
            <p
              class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400"
            >
              {{ item.description }}
            </p>
          </button>
        </div>
      </template>
      <!-- 有关键词但无命中：面板内提示而非关闭面板 -->
      <p v-else class="px-3 py-6 text-center text-sm text-slate-400">
        没有找到匹配的软件
      </p>
      <!--
        快捷键提示条：仅在有结果时显示，sticky 吸底不随内容滚动；
        Enter（未高亮结果项时）提交搜索、在卡片网格显示全部分类命中结果
      -->
      <div
        v-if="groups?.length"
        class="sticky bottom-0 flex items-center gap-3 rounded-b-xl border-t border-slate-100 bg-white px-3 py-1.5 text-[11px] text-slate-400 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-500"
      >
        <span class="flex items-center gap-0.5">
          <kbd :class="kbdClass">↑</kbd><kbd :class="kbdClass">↓</kbd> 选择
        </span>
        <span class="flex items-center gap-1">
          <kbd :class="kbdClass">Enter</kbd> 查看全部结果
        </span>
        <span class="flex items-center gap-1">
          <kbd :class="kbdClass">Esc</kbd> 关闭
        </span>
        <span class="flex items-center gap-1">
          <kbd :class="kbdClass">🖱️</kbd> 单击查看单项
        </span>
      </div>
    </div>
  </div>
</template>
