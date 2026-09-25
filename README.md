# Navi · Software Download Navigation

English | [简体中文](./README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Navi is a **config-file-driven** software download navigation page. Put the names, descriptions, icons, and download links of your favorite software into config files, and you get a navigation site with search, dark mode, and a responsive layout — without touching any component code.

## Features

- **Fully config-driven**: site copy and software data live entirely in `src/config/`, with zero hardcoding in components
- **Two download interactions**:
  - A single download link — the button opens it directly
  - Multiple download links — shown via `inline` expansion inside the card, or a `popover` panel (closes via Esc / overlay, flips upward automatically when space is tight)
- **Fuzzy search**: multiple keywords are combined with AND logic across titles and descriptions, case-insensitive, with an empty-state message when nothing matches
- **Category navigation**: a pill bar above the grid (All + every category defined in the config) filters the list; the active category and search keywords are combined with AND logic, and the bar scrolls horizontally on narrow screens
- **Theming**: light / dark / follow-system, persisted to localStorage (`navi-theme`), with a first-paint anti-flash script
- **Responsive layout**: one column on mobile, switching to two / three / four columns at the `sm` / `lg` / `xl` breakpoints
- **Accessibility**: dark-mode contrast meets WCAG AA, and the system "reduce motion" setting is respected

## Tech Stack

- [Vue 3](https://vuejs.org/) (`<script setup>` Composition API)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) (via the official Vite plugin, no config file needed)
- [Vite](https://vite.dev/)
- [vue-waterfall-mini](https://github.com/Dave-12138/vue-waterfall-mini) — lightweight Vue 3 waterfall component (positions cards via reactive style bindings, with built-in reflow and join animations)
- [Iconify](https://iconify.design/) — lucide UI icons bundled offline; software logos may also use any Iconify icon name, loaded on demand from the Iconify API

## Quick Start

Requirements: **Node.js 20.19 or later**.

```bash
# Install dependencies
npm install

# Copy the example config file to start with
cp config.json.example config.json

# Start the dev server (http://localhost:5173 by default)
npm run dev

# Type-check + production build, output goes to dist/
npm run build

# Preview the production build locally (http://localhost:4173 by default)
npm run preview
```

> **Note:** `config.json` is committed to the repository and is ready to use after cloning. If you ever need to reset it to the default template (for example after breaking the file by mistake), run:
>
> ```bash
> cp config.json.example config.json
> ```
>
> See the [Configuration Guide](#configuration-guide) for available fields.

In development, the config is validated automatically: duplicate `id` values or empty `links` arrays produce warnings in the browser console.

## Configuration Guide

All configuration lives in a single file: **`config.json` at the project root**, with two top-level keys — `site` (site info) and `software` (software list). Optionally, the data can be loaded from a remote API instead (see section 3).

### 1. Site info: `site` in `config.json`

| Field | Description |
| --- | --- |
| `name` | Site name, shown in the header brand area and the Hero title |
| `tagline` | One-line tagline, shown below the title |
| `footer` | Footer content; set to an empty string to hide the footer |
| `downloadPanelMode` | Multi-link panel style: `inline` (expand in place) or `popover` (floating panel) |
| `repo` | Optional open-source repository URL. When set, a GitHub icon link appears in the header to the left of the theme toggle |
| `theme` | Optional default theme mode: `light`, `dark`, or `system` (default). Only applies until the user switches themes manually |

### 2. Software list: `software` in `config.json`

Each software entry has the following fields:

| Field | Description |
| --- | --- |
| `id` | Short English identifier, unique across the list, used as the render key |
| `title` | Software title |
| `category` | Category name (e.g. `Download Tools`); free-form string — all distinct categories in the list are collected automatically into the navigation bar, ordered by first appearance |
| `description` | One-line description (also matched by search) |
| `logo` | An Iconify icon name (e.g. `ant-design:wechat-filled`, fetched on demand from the Iconify API), an image URL (local path like `/icons/xxx.svg` / remote URL), or an empty string `''` to fall back to the title's first character |
| `website` | Optional. Official website URL; clicking the card body (outside the download button) opens it in a new tab. If omitted, the card body is not clickable |
| `downloadText` | _(optional)_ Custom download button label; defaults to `下载` (Download) |
| `logoColor` | _(optional)_ Color for an Iconify logo (e.g. `#07c160`); no effect on image logos |
| `links` | Array of download links: 1 item downloads directly; more than 1 opens a link panel |

A single download link:

```json
{
  "id": "example",
  "title": "Example App",
  "category": "System Tools",
  "description": "A one-line description of what this app does.",
  "logo": "/icons/example.svg",
  "website": "https://example.com",
  "links": [
    { "name": "Official site", "url": "https://example.com/download" }
  ]
}
```

Multiple download links (just keep adding items to `links`, there is no limit):

```json
{
  "id": "example-pro",
  "title": "Example App Pro",
  "category": "Download Tools",
  "description": "Available both from the official site and GitHub.",
  "logo": "/icons/example-pro.svg",
  "website": "https://example.com",
  "links": [
    { "name": "Official site", "url": "https://example.com/download" },
    { "name": "GitHub Releases", "url": "https://github.com/xxx/xxx/releases" }
  ]
}
```

### 3. Remote data source: `.env` (optional)

By default the page reads the local `config.json`. To load data from a remote API instead:

1. Copy `.env.example` to `.env` (`.env` is git-ignored).
2. Set the API address:

   ```bash
   VITE_API_URL=https://example.com/config.json
   ```

The API must return JSON with the same structure as `config.json`:

```json
{
  "site": { "name": "...", "tagline": "...", "footer": "...", "downloadPanelMode": "inline" },
  "software": [
    { "id": "...", "title": "...", "category": "...", "description": "...", "logo": "...", "links": [{ "name": "...", "url": "..." }] }
  ]
}
```

Behavior:

- The page first renders with the local `config.json`, then swaps in the remote data once the request succeeds (title, categories, cards and footer all update automatically).
- If `VITE_API_URL` is unset or empty, the local `config.json` is used — this is the default.
- If the request fails or returns an invalid structure, the site falls back to the local `config.json` and prints a warning to the console.
- If the currently selected category does not exist in the remote data, the filter automatically resets to "All".

Notes: `VITE_API_URL` is read when the dev server starts / the project builds — restart or rebuild after changing `.env`. The API must also allow CORS requests from your site's origin.

**When deploying via GitHub Actions**: `.env` is not uploaded to the repository, so use a repository variable instead — go to **Settings → Secrets and variables → Actions → Variables** and create a variable named `VITE_API_URL`. The workflow reads it automatically during the build step (see [deploy.yml](./.github/workflows/deploy.yml)). If the variable is not created, the deployed build simply uses the local `config.json`. Since the value is bundled into the public JS file, do not put anything truly secret there.

### 4. Logo Images

Place local logo images in the `public/icons/` directory and reference them as `/icons/filename.svg`. The site favicon is `public/favicon.svg`.

## Project Structure

```
navi/
├── index.html                  # Entry HTML (includes the first-paint anti-flash script)
├── config.json                # ★ Site info + software data (the main file to edit)
├── config.json.example        # Default config template (used when resetting config.json)
├── .env.example               # Remote API address template (copy to .env to enable)
├── vite.config.ts             # Vite config (Vue + Tailwind plugins, @ path alias)
├── public/
│   ├── favicon.svg
│   └── icons/                 # Software logo images
└── src/
    ├── main.ts                # App entry (triggers remote config loading)
    ├── App.vue                # Root component
    ├── style.css              # Tailwind entry and global styles
    ├── types/index.ts         # Global type definitions
    ├── config/index.ts        # Config accessor: typed exports of config.json + remote loading
    ├── composables/           # Composables: data access, search, theme
    └── components/
        ├── common/            # Search box, theme toggle
        ├── layout/            # Header, Hero, category nav, footer
        └── software/          # Card grid, card, download button and link panels
```

## Build & Deploy

`npm run build` produces purely static files in `dist/`, which can be deployed to any static host (e.g. Nginx, Netlify, Vercel, Cloudflare Pages).

### Deploy to GitHub Pages (automatic)

The repo ships with a GitHub Actions workflow at [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml):

1. In your repository, go to **Settings → Pages → Source** and select **GitHub Actions**.
2. Push to the `main` branch (or trigger the workflow manually from the Actions tab).

Every push builds the site and deploys it automatically. The workflow detects the deploy path with a three-level priority:

1. If the repository variable `VITE_BASE` (Settings → Variables) is set, that value is used;
2. If a **custom domain** is configured for Pages (Settings → Pages → Custom domain) → deployed at the domain root `/`;
3. Repository named `<username>.github.io` → root `/`; any other repository name (project site) → `/<repo-name>/`.

> Blank page after deploying? The base path usually doesn't match the actual URL. Create a `VITE_BASE` repository variable to set it manually (`/` for a custom domain, `/<repo-name>/` for a project site), then re-run the workflow.

### Deploying elsewhere / manual build

If you deploy to a sub-path on another host, set the base path at build time:

```bash
VITE_BASE=/your-sub-path/ npm run build
```

The default build uses `/`.

## License

This project is released under the [MIT License](./LICENSE). The software listed on the page belongs to their respective owners.
