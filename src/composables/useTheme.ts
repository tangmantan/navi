import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ThemeMode } from '@/types'

/**
 * 主题系统组合式函数
 * ------------------------------------------------------------------
 * 支持三种模式：light（亮色）/ dark（暗色）/ system（跟随系统）。
 *
 * 实现要点：
 * - 状态定义在模块作用域，多个组件调用 useTheme 共享同一份状态；
 * - 用户选择持久化到 localStorage，刷新后保持；
 * - system 模式下监听系统主题变化，自动同步；
 * - 通过 <html> 上的 .dark class 驱动 Tailwind 暗色样式，
 *   同时设置 color-scheme，让滚动条/表单控件等原生 UI 也跟随主题。
 */

/** localStorage 存储键名 */
const STORAGE_KEY = 'navi-theme'

/** 合法模式列表（同时定义循环切换顺序：亮 → 暗 → 系统 → 亮） */
const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system']

/** 读取系统当前偏好的主题 */
function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** 从 localStorage 读取用户上次选择，非法或缺失时回退为 system */
function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (THEME_MODES as readonly string[]).includes(stored)) {
      return stored as ThemeMode
    }
  } catch {
    // 隐私模式等场景下 localStorage 可能不可用，静默回退
  }
  return 'system'
}

/** 用户选择的模式（模块级单例） */
const mode = ref<ThemeMode>(readStoredMode())

/** 系统主题的实时值（初始读取一次，之后由媒体查询监听器更新） */
const systemTheme = ref<'light' | 'dark'>(getSystemTheme())

/** 实际生效的主题：system 模式解析为系统当前主题 */
const resolvedTheme = computed<'light' | 'dark'>(() =>
  mode.value === 'system' ? systemTheme.value : mode.value,
)

/** 当前是否为暗色（组件可直接用于条件判断） */
const isDark = computed(() => resolvedTheme.value === 'dark')

/**
 * 将生效主题同步到 <html>：
 * - 切换 .dark class（Tailwind 暗色变体由此触发）
 * - 设置 color-scheme（原生滚动条、表单控件配色跟随）
 */
function applyTheme() {
  const root = document.documentElement
  root.classList.toggle('dark', isDark.value)
  root.style.colorScheme = resolvedTheme.value
}

/** 将当前模式写入 localStorage */
function persistMode() {
  try {
    localStorage.setItem(STORAGE_KEY, mode.value)
  } catch {
    // 存储不可用时忽略，主题仍可在本次会话内正常切换
  }
}

// 模式变化时：持久化并立即应用（systemTheme 变化也需重新应用）
watch([mode, systemTheme], () => {
  persistMode()
  applyTheme()
})

/** 系统主题变化事件回调：仅在 system 模式下影响最终效果 */
function handleSystemChange(event: MediaQueryListEvent) {
  systemTheme.value = event.matches ? 'dark' : 'light'
}

/** 系统主题媒体查询（组件挂载时注册监听） */
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

export function useTheme() {
  /** 设置指定主题模式 */
  function setMode(next: ThemeMode) {
    mode.value = next
  }

  /** 按 亮 → 暗 → 系统 → 亮 的顺序循环切换 */
  function cycleMode() {
    const index = THEME_MODES.indexOf(mode.value)
    mode.value = THEME_MODES[(index + 1) % THEME_MODES.length]
  }

  onMounted(() => {
    // 挂载时先同步一次，保证 DOM 状态与数据一致
    applyTheme()
    mediaQuery.addEventListener('change', handleSystemChange)
  })

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleSystemChange)
  })

  return {
    /** 用户选择的模式（light/dark/system） */
    mode,
    /** 实际生效的主题（system 已被解析） */
    resolvedTheme,
    isDark,
    setMode,
    cycleMode,
  }
}
