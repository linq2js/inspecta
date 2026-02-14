# Inspecta

Upload screenshots, annotate UI regions, pick colors, and generate bug-reporting prompts. A cross-platform UI component reference library.

## Features

### Screenshot Inspector

The flagship feature — a Figma-like canvas for inspecting and annotating UI screenshots.

- **Image upload** via file picker, drag-and-drop, or clipboard paste (Ctrl+V)
- **Canvas controls** — zoom (Ctrl+scroll, `+`/`-` keys, zoom bar), pan (scroll, shift+scroll, middle-click drag), fit-to-view, and reset (`0` key)
- **Rectangular annotations** — draw regions on the image with numbered badges, dashed borders, and optional notes
- **Annotation management** — sidebar list with select, edit, delete, clear all, and auto-scroll to selection
- **Undo / Redo** — full history (up to 50 snapshots) via Ctrl+Z / Ctrl+Shift+Z
- **Color picker** — toggle eyedropper mode to hover-preview and click-copy any pixel's hex color
- **Prompt generation** — generate structured prompts for AI-assisted bug reporting ("Report Issues") or UI refactoring ("Refactor UI"), with an extra prompt textarea for additional context
- **Export** — copy prompt to clipboard, copy annotated image to clipboard, or download as a timestamped PNG

### UI Component Reference Library

A browsable catalog of 25+ common UI components (Navigation Bar, Tab Bar, Button, Modal, Toast, etc.) with cross-platform coverage.

- **Fuzzy search** across component names, alternative names, and descriptions
- **Filtering** by platform (iOS, macOS, Android, Windows, Web) and category (Navigation, Input, Feedback, Overlay, Layout, Actions)
- **URL-synced filters** for shareable, bookmarkable search results
- **Detail pages** with five sections per component:
  - Overview — official names per platform, alternative names, category, description
  - Visual Anatomy — numbered breakdown of component parts
  - Placement — position, fixed/scrolling, overlay/embedded context
  - Behavior — appearance triggers, interaction model, dismissal, gesture support
  - Platform Variations — per-platform visual and behavioral notes
- **SVG wireframe thumbnails** for every component, with dark mode support
- **Smart display names** — cards show platform-specific names when filtering by platform

### Progressive Web App

Full PWA support for offline-capable, installable usage.

- Precaches all static assets via Workbox
- Prompts for updates when a new version is available
- Native install prompt with "Install Inspecta" toast
- Runtime caching for Google Fonts

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript 5.9 |
| Build | Vite 7 |
| Routing | TanStack Router (file-based, auto code-splitting) |
| State | Zustand 5 |
| Styling | Tailwind CSS 4 (full dark mode) |
| Search | Fuse.js |
| PWA | vite-plugin-pwa, Workbox |
| Testing | Jest 30, Testing Library |
| Package Manager | pnpm |

## Project Structure

```
src/
├── components/
│   ├── atoms/          # Button, Badge, Chip, Icon, Textarea, ToastContainer
│   ├── molecules/      # SearchBar, ChipGroup, ComponentCard, NoteInput, PromptBlock
│   ├── organisms/      # ImageCanvas, IdentifyToolbar, FilterBar, ComponentGrid, etc.
│   └── templates/      # RootLayout, HomeTemplate, DetailTemplate, IdentifyTemplate
├── data/               # Component catalog data, categories, platforms
├── hooks/              # useColorPicker, usePreviewCanvas, usePWA
├── illustrations/      # Hand-crafted SVG wireframe thumbnails
├── lib/                # Color utilities, Fuse.js search wrappers
├── routes/             # TanStack Router file-based routes
├── stores/             # Zustand stores (identify, filter, toast)
└── types/              # TypeScript type definitions
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+V` / `Cmd+V` | Paste image from clipboard |
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |
| `Delete` / `Backspace` | Remove selected annotation |
| `Escape` | Deselect annotation or exit color picker |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom and center |
| `Ctrl+Scroll` / `Cmd+Scroll` | Zoom toward cursor |
