# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run build` / `npm run build:firefox` / `npm run build:all` — production build. Output goes to `dist-chromium/` (Chrome / Brave / Edge) or `dist-firefox/` (Firefox 121+). The build script reads `src/manifest.json` once and emits a per-target manifest (Firefox gets a `browser_specific_settings.gecko.*` block; Chromium output is unmodified).
- `npm run dev` / `npm run dev:firefox` — esbuild watch mode. Static files are watched per-file; manifest/popup edits re-copy without restart. Watch builds also stand up an SSE reload server on `localhost:9012` and inject a matching `host_permissions` entry; the SW streams that endpoint, reloads all http(s) tabs, then `chrome.runtime.reload()`s on every successful rebuild.
- `npm test` — Vitest (happy-dom). Tests live in `tests/` mirroring `src/`.
- `npm run typecheck` / `npm run lint` / `npm run lint:fix` / `npm run format` — TS, ESLint v9 flat, Prettier. Husky + lint-staged enforce on commit.
- Load the extension by pointing Chrome / Brave / Edge → `chrome://extensions` → "Load unpacked" at `dist-chromium/`, or Firefox → `about:debugging` → "Load Temporary Add-on" at `dist-firefox/manifest.json`.

The legacy `README.md` is a Plasmo starter leftover and does not describe the current build — ignore it. The real build is `scripts/build.mjs`.

## Architecture

MV3 WebExtension with three esbuild entry points (`content.tsx`, `popup.tsx`, `background.ts`). React is aliased to `preact/compat` for a smaller content-script bundle (~32 KB minified). Path alias `@/*` → `./src/*` everywhere.

- **`src/content.tsx`** — content script injected into every page (`<all_urls>`, `document_idle`). Bootstraps lazily: cheap meta-tag probe → `requestIdleCallback` extract → mount React inside a Shadow DOM (`attachShadow({ mode: "open" })` + `:host { all: initial }`) on a `<div id="tagpeek-host">` appended to `document.body`. Listens for `tagpeek:nav` (history-patched in `src/lib/spa-nav.ts`) and a head-only debounced MutationObserver to re-extract on SPA navigations.
- **`src/components/TagPeek.tsx`** — top-level orchestrator. Owns view state (active tab, expanded vs. card, closing animation). Renders either `<PeekCard>` (collapsed mini preview) or `<Panel>` containing the optional `<PanelToolbar>`, `<TabPanel>`, and `<TabBar>` (footer).
- **`src/popup.tsx`** — toolbar popup (380×~). Settings: per-host enable, theme, position, opt-in toggles for validation warnings and export tools. Writes through `src/lib/storage.ts`; content script subscribes via `storage.onAnyChange`.
- **`src/background.ts`** — service worker. Owns `chrome.commands.onCommand` (forwards `toggle-panel` to the active tab; flips per-host override for `toggle-host-enabled`). Dev-only: streams the SSE reload endpoint and triggers `chrome.runtime.reload()`. The reload code tree-shakes away in production (define is `""`).
- **`src/lib/metadata.ts`** — pure DOM-scraping module. `extractAllMetadata()` returns six groups (`og`, `twitter`, `general`, `links`, `jsonld`, `page`), each `{ name, fields, hasData }`. Single-pass walk over `meta, link[rel], script[type="application/ld+json"]`. JSON-LD `@type` is extracted via regex; full `JSON.parse` is deferred to the JSON-LD tab render path.
- **`src/lib/validate.ts`** — required/recommended OG, absolute-URL constraints, Twitter card enum + OG fallback. Returns `{ issues, errorCount, warnCount, byField: Map<"group:key", Severity> }`. Rendered only when the popup `Validation warnings` toggle is on.
- **`src/lib/storage.ts`** — single source of truth for `chrome.storage.local` keys + typed accessors + `onAnyChange` subscription. All keys are prefixed `tagpeek-*`. No raw `chrome.storage` calls outside this module.
- **`src/lib/messages.ts`** — discriminated `Message` union + shared event-name constant for SW ↔ content script.
- **`src/styles/`** — `theme.ts` token strings (`var(--mp-...)`); `keyframes.ts` injects `:host { all: initial }`, theme custom properties for `[data-theme="light|dark"]`, panel slide animations, and `:focus-visible` rules into the shadow root at mount.

### Build pipeline (`scripts/build.mjs`)

Three parallel esbuild contexts (content + popup + background). Output dir is `dist-${target}/` where `target ∈ {chromium, firefox}`. Manifest is transformed per-target: Firefox gets `browser_specific_settings.gecko.id` (`tagpeek@recheck.dev`, `strict_min_version: 121.0`); Chromium output is byte-identical to source. In watch mode, an esbuild `onEnd` plugin debounces (~80 ms) and broadcasts `data: reload` over an SSE server on `localhost:9012`; the SW client reconnects on disconnect.

Adding a new entry point (e.g. an options page) requires: a new esbuild context, a `staticFiles` entry for any HTML, and a manifest update.

### UI conventions

- Panel open/close animations are driven by `isClosing` + `setTimeout(PANEL_EXIT_MS=220ms)` matching `panelSlideOut` in `keyframes.ts`. Touch both if you change timing.
- The panel and the `PeekCard` both anchor to the user's chosen corner via `positionAnchor()` and `transformOriginFor()` in `src/lib/position.ts`, so the panel scales out of the card.
- Tab indicator: each tab button registers itself in a `Map<string, HTMLButtonElement>` ref (cleaned up on unmount), and a `useEffect` reads `offsetLeft`/`offsetWidth` of the active tab to position an absolutely-positioned indicator. Tabs are `flex: 1` so they distribute evenly across the bar.
- On every panel open, the active tab resets — preferring `og`, falling back to the first tab whose `hasData` is true.
- The panel is intentionally **not** dismissed by outside clicks or page navigation; only the explicit collapse button or `Esc` closes it.
- A11y: tablist/tab roles, roving `tabIndex`, ←/→/Home/End navigation, `aria-selected`/`aria-controls`/`aria-labelledby` linking the tab list to the tabpanel container.

## Cross-browser notes

- Targeting **Chrome / Brave / Edge** (Chromium MV3) and **Firefox 121+ (MV3)**. MV2 is intentionally not supported — Chrome and Brave have phased it out, FF MV3 is stable.
- Code uses `chrome.*` everywhere. Firefox MV3 aliases `chrome.*` to promise-based APIs, so no polyfill is needed.
- Anything Firefox-specific belongs in the manifest transform in `scripts/build.mjs`, not in source.

## Reference assets

`idea/` contains the original design screenshots and a screen recording that the current UI is matched against. Consult these before making visual changes.
