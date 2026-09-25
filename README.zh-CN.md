# Navi · 常用软件下载导航

[English](./README.md) | 简体中文

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Navi 是一个**配置文件驱动**的软件下载导航页：把常用软件的名称、说明、图标和下载地址写进配置文件，即可得到一个带搜索、暗色模式与响应式布局的导航网站，无需改动任何组件代码。当然你也可以使用 API 接口动态获取软件数据。

## 功能特性

- **纯配置驱动**：站点文案与软件数据全部位于 `src/config/`，组件零硬编码
- **两种下载交互**：
  - 单个下载地址——点击按钮直接前往
  - 多个下载地址——`inline` 卡片内联展开，或 `popover` 浮层弹出（支持 Esc / 遮罩关闭，空间不足自动向上翻转）
- **模糊搜索**：多关键词按「与」逻辑匹配标题与说明，大小写不敏感，无结果时展示空状态
- **分类导航**：网格上方的胶囊导航栏（全部 + 配置中出现的所有分类）可过滤列表，当前分类与搜索关键词按「与」逻辑叠加，窄屏下导航栏支持横向滑动
- **主题系统**：亮色 / 暗色 / 跟随系统，偏好持久化到 localStorage（`navi-theme`），首屏防闪烁
- **响应式布局**：移动端单列，`sm` / `lg` / `xl` 断点下依次为两列 / 三列 / 四列
- **可访问性**：暗色对比度满足 WCAG AA，尊重系统「减少动态效果」设置

## 技术栈

- [Vue 3](https://vuejs.org/)（`<script setup>` 组合式 API）
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)（通过官方 Vite 插件，零配置文件）
- [Vite](https://vite.dev/)
- [vue-waterfall-mini](https://github.com/Dave-12138/vue-waterfall-mini) —— 轻量 Vue 3 瀑布流组件（通过响应式样式绑定定位卡片，内置重排与加入动画）
- [Iconify](https://iconify.design/)（lucide UI 图标离线打包；软件 logo 也可使用任意 Iconify 图标名，在线按需加载）

## 快速开始

环境要求：**Node.js 20.19 或更高版本**。

```bash
# 安装依赖
npm install

# 复制配置文件
cp config.json.example config.json

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 类型检查 + 生产构建，产物输出到 dist/
npm run build

# 本地预览生产构建（默认 http://localhost:4173）
npm run preview
```

> **注意：**`config.json` 随仓库一起提交，克隆后即可直接使用。如果需要将配置恢复为默认模板（例如误改坏了文件），执行：
>
> ```bash
> cp config.json.example config.json
> ```
>
> 字段说明见下文 [配置指南](#配置指南)。

开发环境下会自动校验配置：发现重复的 `id`、为空的 `links` 或为空的 `category` 时，会在浏览器控制台输出警告。

## 配置指南

所有配置集中在**项目根目录的 `config.json`** 一个文件中，包含两个顶层键：`site`（站点信息）与 `software`（软件列表）。也可以选择从远程接口动态获取数据（见第 3 节）。

### 1. 站点信息：`config.json` 中的 `site`

| 字段 | 说明 |
| --- | --- |
| `name` | 站点名称，显示在顶部品牌区与 Hero 主标题 |
| `tagline` | 一句话简介，显示在标题下方 |
| `footer` | 页脚内容，留空字符串则不渲染页脚 |
| `downloadPanelMode` | 多地址面板形态：`inline`（内联展开）或 `popover`（浮层弹出） |
| `recommendedText` | _（可选）_ 标记为 `recommended` 的下载地址上显示的徽标文案，不配置时默认为「推荐」 |
| `repo` | 可选。开源仓库地址，配置后顶栏主题按钮左侧会显示 GitHub 图标链接 |
| `theme` | 可选。默认主题模式：`light` 亮色 / `dark` 暗色 / `system` 跟随系统（默认）。仅在用户未曾手动切换主题时生效 |

### 2. 软件列表：`config.json` 中的 `software`

每个软件条目包含以下字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 英文短标识，全站唯一，用作列表渲染的 key |
| `title` | 软件标题 |
| `category` | 分类名称（如「下载工具」）；自由字符串，列表里出现过的所有不同分类会自动汇总到导航栏，按首次出现顺序排列 |
| `description` | 一句话说明（也会被搜索匹配） |
| `logo` | Iconify 图标名（如 `ant-design:wechat-filled`，自动从 Iconify 在线 API 获取）、图片地址（本地路径如 `/icons/xxx.svg` / 网络 URL），或空字符串 `''` 时用标题首字占位 |
| `website` | 可选。官网地址；点击卡片主体（下载按钮以外区域）在新标签页打开。不配置时卡片主体不可点击跳转 |
| `downloadText` | _（可选）_ 下载按钮自定义文字，不配置时默认为「下载」 |
| `downloadText2` | _（可选）_ 下载按钮2自定义文字，不配置时默认为「下载」 |
| `logoColor` | _（可选）_ Iconify 图标的颜色（如 `#07c160`）；对图片类型的 logo 不生效 |
| `links` | 下载地址数组：1 项为直下，多于 1 项展开地址面板 |
| `links2` | 下载地址数组2：1 项为直下，多于 1 项展开地址面板 |

单个下载地址：

```json
{
  "id": "example",
  "title": "示例软件",
  "category": "系统工具",
  "description": "一句话介绍这款软件的用途。",
  "logo": "/icons/example.svg",
  "website": "https://example.com",
  "links": [
    { "name": "官网下载", "url": "https://example.com/download" }
  ]
}
```

多个下载地址（在 `links` 中继续追加即可，数量不限）：

```json
{
  "id": "example-pro",
  "title": "示例软件 Pro",
  "category": "下载工具",
  "description": "提供官网与 GitHub 两种下载方式。",
  "logo": "/icons/example-pro.svg",
  "website": "https://example.com",
  "links": [
    { "name": "官网下载", "url": "https://example.com/download", "recommended": true },
    { "name": "GitHub Releases", "url": "https://github.com/xxx/xxx/releases" }
  ]
}
```

为某个地址添加 `"recommended": true` 后，该地址在地址面板中的名称旁会显示徽标（文案来自 `site.recommendedText`，默认「推荐」），适合在多个下载源中标识你的首选。

### 3. 远程数据源：`.env`（可选）

默认情况下页面读取本地 `config.json`。如需从远程接口动态获取数据：

1. 复制 `.env.example` 为 `.env`（`.env` 已被 git 忽略）。
2. 填写接口地址：

   ```bash
   VITE_API_URL=https://example.com/config.json
   ```

接口需返回与 `config.json` 相同结构的 JSON：

```json
{
  "site": { "name": "...", "tagline": "...", "footer": "...", "downloadPanelMode": "inline" },
  "software": [
    { "id": "...", "title": "...", "category": "...", "description": "...", "logo": "...", "links": [{ "name": "...", "url": "..." }] }
  ]
}
```

行为说明：

- 页面先以本地 `config.json` 渲染，接口请求成功后自动替换为远程数据（标题、分类、卡片与页脚均会更新）。
- 未配置或留空 `VITE_API_URL` 时，使用本地 `config.json`——这是默认方式。
- 接口请求失败或返回结构不符约定时，自动回退到本地 `config.json`，并在控制台输出警告。
- 若当前选中的分类在远程数据中不存在，分类筛选自动重置为「全部」。

注意：`VITE_API_URL` 在开发服务器启动 / 项目构建时读取，修改 `.env` 后需重启或重新构建；接口还需允许来自站点域名的跨域请求（CORS）。

**GitHub Actions 部署时**：`.env` 不会被上传到仓库，需改用仓库变量注入——进入仓库 **Settings → Secrets and variables → Actions → Variables** 标签页，新建变量 `VITE_API_URL`，工作流构建时会自动读取并注入（详见 [deploy.yml](./.github/workflows/deploy.yml)）。未创建该变量时，线上构建直接使用本地 `config.json`。由于该值会被打包进公开的 JS 文件，请勿填写私密信息。

### 4. Logo 图片

本地 logo 图片放入 `public/icons/` 目录后，以 `/icons/文件名.svg` 的形式引用；站点 favicon 为 `public/favicon.svg`。

## 项目结构

```
navi/
├── index.html                  # 入口 HTML（含首屏防闪烁内联脚本）
├── config.json                # ★ 站点信息 + 软件数据（主要维护的文件）
├── config.json.example        # 默认配置模板（用于重置 config.json）
├── .env.example               # 远程接口地址模板（复制为 .env 后启用）
├── vite.config.ts             # Vite 配置（Vue + Tailwind 插件、@ 路径别名）
├── public/
│   ├── favicon.svg
│   └── icons/                 # 软件 logo 图片
└── src/
    ├── main.ts                # 应用入口（触发远程配置加载）
    ├── App.vue                # 根组件
    ├── style.css              # Tailwind 入口与全局样式
    ├── types/index.ts         # 全局类型定义
    ├── config/index.ts        # 配置读取入口：config.json 类型化导出 + 远程加载
    ├── composables/           # 组合式函数：数据读取、搜索、主题
    └── components/
        ├── common/            # 搜索框、主题切换
        ├── layout/            # 顶部栏、Hero、分类导航、页脚
        └── software/          # 卡片网格、卡片、下载按钮与地址面板
```

## 构建与部署

`npm run build` 产物为纯静态文件，位于 `dist/`，可部署到任意静态托管服务（如 Nginx、Netlify、Vercel、Cloudflare Pages 等）。

### 部署到 GitHub Pages（自动）

仓库内置了 GitHub Actions 工作流：[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

1. 在仓库 **Settings → Pages → Source** 中选择「GitHub Actions」。
2. 推送代码到 `main` 分支（或在 Actions 页面手动触发工作流）。

之后每次推送都会自动构建并部署。工作流自动推断部署路径（三级优先级）：

1. 仓库变量 `VITE_BASE`（Settings → Variables）非空时，直接使用该值；
2. Pages 配置了**自定义域名**（Settings → Pages → Custom domain）→ 部署在域名根路径 `/`；
3. 仓库名为 `<用户名>.github.io` → 根路径 `/`；其他仓库名（项目站点）→ `/<仓库名>/`。

> 若部署后页面空白：通常是 base 路径与实际访问路径不符。可在仓库 Variables 中创建 `VITE_BASE` 手动指定（自定义域名填 `/`，项目站点填 `/<仓库名>/`），再重新触发工作流。

### 部署到其他平台 / 手动构建

如需部署到其他主机的子路径，构建时通过环境变量指定：

```bash
VITE_BASE=/your-sub-path/ npm run build
```

默认构建使用根路径 `/`。

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。页面中所列软件的版权归各自所有者所有。
