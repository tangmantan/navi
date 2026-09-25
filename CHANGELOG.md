# Changelog

English | [简体中文](./CHANGELOG.zh-CN.md)

This project follows [Semantic Versioning](https://semver.org/), and the format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Optional `recommended` field on download links: when a software entry has multiple links, marking one with `"recommended": true` shows a badge next to its name in the link panel. The badge label is configurable via the new optional `site.recommendedText` field (defaults to `推荐`).
- `website` field on software entries: clicking the card body (outside the download button) opens the official website in a new tab via a stretched link. The link is keyboard-focusable and supports Enter.
- Optional `downloadText` field on software entries to customize the download button label (defaults to `下载`).
- The `logo` field now also accepts an Iconify icon name (e.g. `ant-design:wechat-filled`); icon data is fetched on demand from the Iconify online API. Image URLs keep working as before.
- Optional `logoColor` field to set the color of an Iconify logo (e.g. `#07c160`).
- Optional `site.repo` field: when an open-source repository URL is configured, a GitHub icon link appears in the header to the right of the theme toggle (opens in a new tab); both buttons show a pointer cursor on hover.
- Optional `site.theme` field: sets the default theme mode (`light` / `dark` / `system`). It only applies until the user switches themes manually — the user's choice always wins and is persisted to localStorage.
- `category` field on software entries, and a category navigation bar above the grid: a fixed "All" pill followed by every distinct category automatically collected from the data (ordered by first appearance). Selecting a category filters the grid, and the active category is combined with search keywords using AND logic. The bar scrolls horizontally on narrow screens.
- All configuration is merged into a single `config.json` at the project root (`site` + `software` keys), replacing the previous `src/config/site.ts` and `src/config/software.ts`.
- Optional remote data source: set `VITE_API_URL` in `.env` (see `.env.example`) to load page data from a remote API that returns the same JSON structure as `config.json`. The page renders local data first and swaps in remote data on success; when the variable is unset, or the request fails / returns an invalid structure, the site falls back to the local `config.json`.
- GitHub Pages auto-deploy workflow (`.github/workflows/deploy.yml`): builds and deploys on every push to `main`. The deploy path is resolved with a three-level priority — manual override via the `VITE_BASE` repository variable > custom domain detection (root path) > repository-name rules (root for `<user>.github.io`, `/<repo-name>/` for project sites). The build also injects `VITE_API_URL` from repository variables (Actions Variables); when unset, the deployed site uses the local `config.json`.
- Added a `config.json.example` default config template: `config.json` is committed to the repository and works immediately after cloning; copy the template over it whenever you need to reset the configuration. The deploy workflow only falls back to the template if `config.json` is unexpectedly missing.

### Changed

- Card layout is now masonry: expanding an inline download panel only pushes cards in the same column; other columns stay in place.
- The inline download panel closes when clicking outside the button/panel, instead of closing on mouse leave.
- Card descriptions now show up to three lines (previously two).
- Logo containers no longer have a default background color; logos render directly on the card surface.
- Logos no longer scale up when hovering a card.
- Download buttons use a soft light-blue tinted style instead of the saturated solid blue, in both light and dark modes.
- Waterfall layout is now powered by [vue-waterfall-mini](https://github.com/Dave-12138/vue-waterfall-mini): cards are positioned via Vue reactive style bindings (replacing the custom masonry composable), with the component's built-in reflow animation for search filtering/width changes and a fade-up join animation for newly added cards.
- `website` is now optional: when omitted, the card body is not clickable (previously required).
- The category navigation bar defaults to the "装机必备" (Essential Apps) category on page load.

### Fixed

- Local image paths in config (e.g. `/icons/xxx.svg`) are now resolved against the deploy base path at render time, so they load correctly when the site is deployed to a sub-path such as GitHub Pages project sites.
- When remote config data arrives, a selected category that no longer exists in the new data now resets to "All" instead of leaving the grid empty.
- The title's first character no longer shows through an Iconify logo's transparent padding. The letter is now shown only when `logo` is an empty string; whenever a logo is configured (Iconify name or image URL), no letter is rendered.
- Cards now redistribute correctly when the viewport is widened back after shrinking (previously they kept the narrow-layout column positions). Column assignments are reset whenever the column count changes, in either direction.

## [0.1.0] - 2026-09-23

First open-source release.

### Added

- Config-file-driven software list: site copy and software data are maintained in `src/config/`, with no hardcoded data in components
- Software card grid: logo, title, one-line description, and download action
- Two download interactions: direct download for a single link and link selection for multiple links
  - `inline`: the link list expands inside the card (only the current card grows taller)
  - `popover`: the link list appears in a floating panel (card height stays unchanged; closes via Esc or overlay; flips upward automatically when space is tight)
- Multi-keyword fuzzy search (matches titles and descriptions, keywords combined with AND logic, case-insensitive) with an empty-state message
- Light / dark / follow-system themes, with the preference persisted to localStorage and a first-paint anti-flash script
- Responsive layout: one column on mobile, switching to two / three / four columns at the sm / lg / xl breakpoints
- Dark-mode contrast meets WCAG AA, and the system "reduce motion" setting is respected
