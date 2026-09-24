<script setup lang="ts">
/**
 * 软件分类导航栏
 * ------------------------------------------------------------------
 * 胶囊按钮形式，位于 Hero 与卡片网格之间：
 * - 固定首项「全部」，其后为从软件数据自动汇总出的分类；
 * - 使用 v-model 绑定当前选中分类，空字符串 '' 代表「全部」；
 * - 移动端按钮过多时整行可横向滑动（隐藏滚动条），sm 以上居中。
 * 仅做展示与选择，不包含任何过滤逻辑（过滤在数据层完成）。
 */
defineProps<{
  /** 分类名称列表（已去重、按首次出现顺序排列，不含「全部」） */
  categories: string[]
  /** 当前选中的分类，'' 表示全部 */
  modelValue: string
}>()

const emit = defineEmits<{
  /** 切换分类 */
  (e: 'update:modelValue', value: string): void
}>()

function select(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <nav aria-label="软件分类" class="mx-auto max-w-7xl px-4 pt-2">
    <!--
      横向排列：移动端左对齐并允许横向滚动（scrollbar-width:none +
      WebKit 伪元素隐藏滚动条），sm 以上居中且不滚动。
      -bottom-1 留出滚动条隐藏后的空间，pb-1 防止按钮焦点轮廓被裁切。
    -->
    <div
      class="flex justify-start gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden"
    >
      <!-- 全部：以空字符串标识 -->
      <button
        type="button"
        :aria-pressed="modelValue === ''"
        class="shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
        :class="
          modelValue === ''
            ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        "
        @click="select('')"
      >
        全部
      </button>

      <!-- 各分类按钮 -->
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :aria-pressed="modelValue === category"
        class="shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
        :class="
          modelValue === category
            ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        "
        @click="select(category)"
      >
        {{ category }}
      </button>
    </div>
  </nav>
</template>
