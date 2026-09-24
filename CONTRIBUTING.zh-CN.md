# 贡献指南

[English](./CONTRIBUTING.md) | 简体中文

感谢你对 Navi 的兴趣！欢迎通过 Issue 反馈问题、通过 Pull Request 提交改进。

## 报告 Issue

提交问题时建议包含：

- 问题描述与复现步骤
- 期望行为与实际行为
- 浏览器、操作系统与 Node.js 版本
- 如可能，附上截图或控制台报错信息

## 提交 Pull Request

1. Fork 本仓库并从 `main` 分支创建你的特性分支
2. 完成改动后，确保类型检查与生产构建通过（见下方「开发与校验」）
3. 在 PR 描述中说明改动内容、原因以及关联的 Issue 编号（如 `Closes #12`）

## 开发与校验

```bash
# 安装依赖（需要 Node.js 20.19 或更高版本）
npm install

# 启动本地开发服务器（默认 http://localhost:5173）
npm run dev

# 类型检查 + 生产构建，提交前必须通过
npm run build

# 本地预览生产构建产物（默认 http://localhost:4173）
npm run preview
```

## 代码规范

- 组件采用 Vue 3 `<script setup>` 组合式 API 与 TypeScript，样式使用 Tailwind CSS 工具类
- **保持配置驱动**：软件数据与站点文案只写在 `src/config/` 中，不要在组件内硬编码
- 命名与现有文件、组件保持一致；关键逻辑补充说明「做什么、为什么」的注释
- 提交信息建议遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)，例如：
  - `feat: 新增软件卡片图标懒加载`
  - `fix: 修复浮层在窄屏下被遮挡的问题`
  - `docs: 更新新增软件的配置说明`

## 提交软件数据

新增或修改软件条目时，请注意：

- `id` 在整个软件列表中唯一
- `links` 只有一个地址时为直下，多个地址时才会出现选择面板
- `website` 为官网地址，点击卡片主体时打开；与下载地址 `links` 区分填写
- logo 图片建议放入 `public/icons/`，也可直接填写可访问的网络 logo 图片地址
- 下载地址需为公开、可正常访问的来源
