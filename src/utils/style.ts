/**
 * CSS 文本解析工具
 * ------------------------------------------------------------------
 * 将配置文件中 logoStyle 这类「CSS 声明文本」解析为 Vue :style
 * 可直接使用的样式对象。
 *
 * 背景：@iconify/vue 的 <Icon> 组件只接受对象形式的 style——
 * 字符串形式的 style 在组件内部会被静默丢弃（见其 render 实现），
 * 因此即使配置了 'color: #f8d714' 也不会生效；而 <img> 等原生标签
 * 虽支持字符串，统一解析为对象后行为一致、更可控。
 */
import type { CSSProperties } from 'vue'

/**
 * 将 CSS 声明文本解析为样式对象，例如：
 *   'color: #f8d714; font-size: 40px'
 *   -> { color: '#f8d714', fontSize: '40px' }
 *
 * 规则：
 * - 以分号分隔多条声明，以第一个冒号分隔属性名与值（值中可含冒号，
 *   如 url(http://...) 不受影响）；
 * - 属性名自动转为 camelCase（font-size -> fontSize），Vue 对两种
 *   写法都兼容，camelCase 与类型定义 CSSProperties 更匹配；
 * - 空字符串、空白声明或解析结果为空时返回 undefined，
 *   方便模板中直接绑定（不渲染无意义的 style 属性）。
 */
export function parseCssText(cssText: string | undefined): CSSProperties | undefined {
  if (!cssText) return undefined

  const style: Record<string, string> = {}
  for (const declaration of cssText.split(';')) {
    const colonIndex = declaration.indexOf(':')
    if (colonIndex === -1) continue

    const property = declaration.slice(0, colonIndex).trim()
    const value = declaration.slice(colonIndex + 1).trim()
    if (!property || !value) continue

    // kebab-case -> camelCase：-后的字母大写，去掉连字符
    const camelProperty = property.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
    style[camelProperty] = value
  }

  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined
}
