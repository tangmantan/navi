# Contributing Guide

English | [简体中文](./CONTRIBUTING.zh-CN.md)

Thank you for your interest in Navi! Issues for bug reports and Pull Requests for improvements are both welcome.

## Reporting an Issue

When filing an issue, please include:

- A description of the problem and the steps to reproduce it
- The expected behavior and the actual behavior
- Your browser, operating system, and Node.js versions
- Screenshots or console error messages, if possible

## Submitting a Pull Request

1. Fork this repository and create your feature branch from `main`
2. After making your changes, make sure the type check and production build pass (see "Development & Verification" below)
3. In the PR description, explain what changed, why, and reference the related issue number (e.g. `Closes #12`)

## Development & Verification

```bash
# Install dependencies (Node.js 20.19 or later is required)
npm install

# Start the local dev server (http://localhost:5173 by default)
npm run dev

# Type check + production build; this must pass before submitting
npm run build

# Preview the production build locally (http://localhost:4173 by default)
npm run preview
```

## Code Style

- Components use Vue 3 `<script setup>` Composition API with TypeScript; styling uses Tailwind CSS utility classes
- **Keep it config-driven**: software data and site copy belong in `src/config/` only — do not hardcode them in components
- Follow the naming conventions of existing files and components; add comments for non-obvious logic explaining what and why
- Commit messages should follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), for example:
  - `feat: add lazy loading for software card icons`
  - `fix: prevent the popover from being clipped on small screens`
  - `docs: update configuration instructions for adding software`

## Submitting Software Data

When adding or modifying software entries, please note:

- `id` must be unique across the entire software list
- A single link in `links` downloads directly; multiple links show a selection panel
- `website` is the official site opened when the card body is clicked; keep it separate from the download links
- Logo files should be placed in `public/icons/`, or you can use a publicly accessible remote logo URL
- Download links must point to public, reliably accessible sources
