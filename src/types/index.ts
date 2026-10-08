/**
 * 应用全局类型定义
 * ------------------------------------------------------------------
 * 所有组件、组合式函数与配置文件共用此处的类型，保证数据契约一致。
 */

/** 主题模式：亮色 / 暗色 / 跟随系统 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * 多下载地址面板的展示方式：
 * - inline：在卡片内联展开（会撑高当前卡片，不影响其他卡片）
 * - popover：以浮层形式弹出（不占据文档流，卡片高度不变）
 */
export type DownloadPanelMode = 'inline' | 'popover'

/**
 * 卡片顶部信息区的布局方式：
 * - horizontal：logo 在左，标题与说明纵向排列在 logo 右侧（默认）
 * - stacked：logo 与标题在同一行，说明移至下一行并占满卡片整宽
 */
export type CardLayoutMode = 'horizontal' | 'stacked'

/** 下载地址（单个软件可配置一个或多个） */
export interface DownloadLink {
  /** 下载源名称，例如：官网、GitHub Releases、蓝奏云、百度网盘 */
  name: string
  /** 下载地址（URL） */
  url: string
  /**
   * 是否为推荐地址（可选）：
   * 仅在同一组存在多个下载地址时有意义——推荐地址在地址列表面板中
   * 的名称旁显示「推荐」徽标，徽标文案由 site.recommendedText
   * 配置（默认「推荐」）。
   */
  recommended?: boolean
}

/** 站点信息配置（顶部标题、副标题、页脚等页面文案） */
export interface SiteConfig {
  /** 站点名称：显示在顶部品牌区与 Hero 主标题处 */
  name: string
  /** 标题下方的说明文字（一句话简介），同时显示在顶部品牌名右侧 */
  tagline: string
  /** 页脚内容（可选，留空则不渲染页脚） */
  footer?: string
  /** 开源仓库地址（可选）：配置后顶栏主题按钮右侧显示 GitHub 图标链接 */
  repo?: string
  /**
   * 默认主题模式（可选）：light 亮色 / dark 暗色 / system 跟随系统。
   * 仅在用户未曾手动切换主题（localStorage 无记录）时生效；
   * 不配置时默认 system。
   */
  theme?: ThemeMode
  /** 多下载地址的面板展示方式：inline 内联展开 / popover 浮层弹出 */
  downloadPanelMode: DownloadPanelMode
  /**
   * 卡片顶部信息区布局（可选）：
   * horizontal 左右布局（logo 在左、标题与说明在右，默认值）；
   * stacked 上下布局（logo 与标题同行，说明在 logo 下方占满整宽）。
   * 不配置时默认 horizontal。
   */
  cardLayout?: CardLayoutMode
  /**
   * 推荐下载地址的徽标文案（可选）：
   * 某条下载地址配置 recommended: true 时，在地址列表面板中显示该徽标；
   * 不配置时默认显示「推荐」。
   */
  recommendedText?: string
}

/** 软件展示条目 */
export interface SoftwareItem {
  /** 唯一标识，用于列表渲染时的 key */
  id: string
  /** 软件标题 */
  title: string
  /**
   * 软件分类名称，如「下载工具」「压缩解压」。
   * 分类为自由字符串（无需预先登记枚举）：配置中出现过哪些分类，
   * 页面的分类导航栏就自动列出哪些，按首次出现的顺序排列。
   */
  category: string
  /** 软件说明（一句话简介） */
  description: string
  /**
   * 软件 logo，三种写法：
   * - Iconify 图标名（如 'ant-design:wechat-filled'，在线获取）；
   * - 图片地址（网络 URL / 本地静态资源路径）；
   * - 空字符串 ''：不展示图片，改用标题首字占位。
   * 只要配置了 logo 就不会显示标题首字。
   */
  logo: string
  /** 软件官网地址（可选）：点击卡片主体（下载按钮以外区域）时跳转；不配置则卡片不可点击跳转 */
  website?: string
  /** 下载按钮自定义文字（可选，不配置时默认为「下载」） */
  downloadText?: string
  /**
   * 第二个下载按钮的自定义文字（可选）：
   * 仅在配置了 links2 时生效；不配置时回退使用 downloadText，
   * 两者都不配置时默认为「下载」。
   */
  downloadText2?: string
  /**
   * logo 自定义样式（可选）：标准 CSS 文本字符串（如 'color: #f8d714'），
   * 以内联样式作用于 logo 元素。内联样式优先级高于组件内置的 class 样式，
   * 因此这里的配置会覆盖默认样式，未配置时保持默认样式不变。
   * Iconify 图标与图片地址类型的 logo 均生效
   * （图片可配置 object-fit、padding、border-radius 等属性）。
   */
  logoStyle?: string
  /**
   * 下载地址数组：
   * - 长度为 1 时，点击按钮直接下载
   * - 长度大于 1 时，点击按钮展开地址列表供用户选择
   */
  links: DownloadLink[]
  /**
   * 第二组下载地址（可选）：配置后卡片底部并排显示第二个下载按钮，
   * 行为与 links 完全一致（单地址直下 / 多地址展开选择）。
   * 典型场景：同一软件提供两组不同用途的下载入口
   * （如 32 位 / 64 位、稳定版 / 测试版）。
   */
  links2?: DownloadLink[]
}
