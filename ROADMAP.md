# TagPeek — Improvement Roadmap

A prioritized list of improvements across performance, popup features, DX, and architecture.

Legend: **P** = priority (P0 highest), **Effort** = S/M/L, **Status** = ✅ done · ⏳ todo · ⏸️ deferred · ⏭️ skipped.

---

## Progress

**Done**

- §1 perf: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7
- §2 popup: 2.1 per-domain enable, 2.3 validation (opt-in), 2.5 copy/download JSON (opt-in), 2.6 mini panel card, 2.7 social debuggers (opt-in), 2.8 keyboard shortcuts, 2.9 position picker, 2.10 theme picker
- §3 DX: 3.1 Shadow DOM, 3.3 Preact, 3.4 watch-mode static copy, 3.5 auto-reload on rebuild, 3.6 lint/format/hooks, 3.7 Vitest, 3.8 Firefox build target
- §4 arch: 4.1 service worker, 4.2 a11y on tabs, 4.3 typed messages, 4.5 stale `tabRefs` fix, 4.6 typed storage, 4.8 click-to-copy, 4.9 dead `panelRef` removed
- **Final shortcuts:** `Ctrl+M` / `MacCtrl+M` toggle panel · `Ctrl+Shift+M` / `MacCtrl+Shift+M` toggle host. (`Alt+M` was unreliable on macOS — composes µ.)
- **Animation:** open/close scales from corner anchor matching position pick. Closing curve = Material standard `cubic-bezier(0.4, 0, 0.2, 1)` at 220 ms.
- **Optional features:** validation warnings (§2.3) and export tools (§2.5/§2.7) are now gated behind popup toggles, default off.
- **Tooling extras:** ESLint v9 flat + Prettier + Husky + lint-staged + EditorConfig + VS Code format-on-save; `src/` reorganized into `components/`, `hooks/`, `lib/`, `styles/`; tests in `tests/` mirror tree; `@/*` path alias.

**Open**

- §2.4 quick counts · §2.11 search/filter
- §3.9 release script
- §4.4 badge · §4.7 microdata/RDFa

---

## 1 · Metadata extraction performance

| # | Item | P | Effort | Status |
|---|---|---|---|---|
| 1.1 | Single-pass DOM walk in `extractAllMetadata`. | P0 | M | ✅ |
| 1.2 | Lazy JSON-LD parsing — `@type` via regex; full `JSON.parse` skipped during scrape. | P1 | S | ✅ |
| 1.3 | Defer extraction to `requestIdleCallback` (1500 ms timeout fallback). | P0 | S | ✅ |
| 1.4 | Gate React mount behind probe + SPA fallback (one-shot head observer, 10 s cap). | P0 | S | ✅ |
| 1.5 | History-patch + head-only debounced observer (300 ms). | P0 | M | ✅ |
| 1.6 | Cache extraction result per URL. | P2 | S | ⏭️ Made moot by 1.5. |
| 1.7 | Drop unused `getMeta*` helpers. | P2 | S | ✅ |

---

## 2 · Popup features

| # | Item | P | Effort | Status | Notes |
|---|---|---|---|---|---|
| 2.1 | Per-domain enable/disable — global default + per-host overrides. | P0 | M | ✅ | Two-row popup UI, supports allow- and deny-list modes. |
| 2.2 | "Open panel" button. | P0 | S | ⏭️ | Replaced by §2.8 keyboard shortcut. |
| 2.3 | Validation warnings — required/recommended OG, absolute-URL checks, Twitter card enum, OG fallbacks. | P0 | M | ✅ | Opt-in (popup toggle, default off). |
| 2.4 | Quick counts — "12 OG · 4 Twitter · 8 Links · 2 JSON-LD". | P1 | S | ⏳ | Surface on the popup; reads from content via `chrome.tabs.sendMessage`. |
| 2.5 | Copy / Download as JSON — stripped shape, blob download. | P1 | S | ✅ | Opt-in via `Export tools` toggle. |
| 2.6 | Mini panel card on every page with metadata. | P1 | M | ✅ | ~140×180, replaces og:image-only thumbnail. |
| 2.7 | Open in social debuggers (FB / X / LinkedIn). | P1 | S | ✅ | Opt-in via `Export tools` toggle. |
| 2.8 | Keyboard shortcuts — toggle panel + toggle host. | P1 | S | ✅ | See "Final shortcuts" above. |
| 2.9 | Position picker — 4 corners; card + panel anchor and panel transform-origin all align. | P2 | S | ✅ | |
| 2.10 | Theme: auto / light / dark — CSS custom props on shadow root, `prefers-color-scheme` for auto. | P2 | M | ✅ | |
| 2.11 | Search/filter inside the panel. | P2 | M | ⏳ | Useful for pages with 50+ link tags. |

---

## 3 · DX & build

| # | Item | P | Effort | Status | Notes |
|---|---|---|---|---|---|
| 3.1 | Shadow DOM for the content-script root. | P0 | M | ✅ | `attachShadow({mode:"open"})` + `:host { all: initial }`. |
| 3.3 | Swap React → Preact (esbuild alias). | P1 | S | ✅ | Bundle ~32 KB minified. |
| 3.4 | Fix watch-mode static copy. | P1 | S | ✅ | Per-file `fs.watch` + 50 ms coalesce. |
| 3.5 | Auto-reload extension on rebuild — SSE server in `scripts/build.mjs` broadcasts on every successful rebuild; SW streams the endpoint, reloads all http(s) tabs, then `chrome.runtime.reload()`. Dev manifest gets a `localhost:9012` `host_permissions`; prod manifest is untouched. | P1 | M | ✅ | `scripts/build.mjs`, `src/background.ts`. |
| 3.6 | Lint + format + git hooks. | P1 | S | ✅ | ESLint v9 flat + Prettier + Husky + lint-staged. |
| 3.7 | Vitest for `metadata.ts` (+ `validate.ts`). | P0 | M | ✅ | 19 tests, `happy-dom` env. |
| 3.8 | Cross-browser build (Firefox 121+ MV3) — `--target=chromium\|firefox` flag, output to `dist-${target}/`, manifest transform adds `browser_specific_settings.gecko` for FF only. No polyfill (FF MV3 aliases `chrome.*` to promises). | P2 | M | ✅ | `scripts/build.mjs`, `package.json`. |
| 3.9 | Versioned releases via `gh release` + zip. | P2 | S | ⏳ | `scripts/release.mjs`. |

---

## 4 · Architecture & correctness

| # | Item | P | Effort | Status | Notes |
|---|---|---|---|---|---|
| 4.1 | Service worker — registered, handles `chrome.commands.onCommand`. | P0 | S | ✅ | |
| 4.2 | A11y on tabs — `role="tablist"`/`role="tab"`, `aria-selected`, `aria-controls`, roving tabindex, ←/→/Home/End nav, `:focus-visible` outline (accent color, inside shadow root). Tabpanel container gets `role="tabpanel"` + `aria-labelledby`. | P1 | M | ✅ | `src/components/TabBar.tsx`, `src/components/TagPeek.tsx`, `src/styles/keyframes.ts`. |
| 4.3 | Typed message passing — `Message` discriminated union + shared event name. | P1 | S | ✅ | |
| 4.4 | Per-tab badge count — `chrome.action.setBadgeText` with OG count. | P2 | S | ⏳ | |
| 4.5 | Fix stale `tabRefs` map. | P1 | S | ✅ | |
| 4.6 | Type-safe storage wrapper. | P1 | S | ✅ | All `chrome.storage.local` access goes through `src/lib/storage.ts`. |
| 4.7 | Microdata + RDFa support. | P2 | L | ⏳ | |
| 4.8 | Click-to-copy on any field. | P2 | S | ✅ | |
| 4.9 | Drop the unused `panelRef`. | P2 | S | ✅ | |

---

## Suggested next sequencing

1. **Popup polish:** §2.4 quick counts (needs a `get-counts` message round-trip via the SW).
2. **Reach:** §3.8 Firefox build → §3.9 release script (pair these).
3. **Optional later:** §2.11 in-panel search, §4.4 badge, §4.7 microdata/RDFa.

## Key files

- `src/content.tsx` — `mount()`, history patching, head observer
- `src/components/TagPeek.tsx` — orchestrator (view state, validation gate)
- `src/components/PanelToolbar.tsx`, `IssuesBanner.tsx`, `TabPanel.tsx`, `Field.tsx` — opt-in tools / validation
- `src/lib/metadata.ts` — `extractAllMetadata` (target of §1, §4.7)
- `src/lib/validate.ts` — validation rules
- `src/lib/storage.ts` — typed storage wrapper
- `src/lib/messages.ts` — message type union + event name
- `src/hooks/useSettings.ts` — theme / position / opt-in toggles
- `src/popup.tsx`, `src/background.ts`, `src/manifest.json`
- `scripts/build.mjs` — esbuild (Preact alias, watch-mode copy, future 3.5)
- `vitest.config.ts`, `tests/` — test setup (19 tests)
