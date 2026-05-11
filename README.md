# OGee

A browser extension for developers to inspect Open Graph, Twitter Cards, and all page metadata without opening DevTools. Debug social sharing, SEO, and structured data in seconds.

<img src="public/ogee-logo.png" alt="OGee" width="64" height="64" />

## What it does

OGee reveals all hidden metadata on any webpage — Open Graph tags, Twitter Cards, JSON-LD, and general meta tags — in a clean, organized overlay. Perfect for debugging dynamic OG images, verifying meta tag injection, and catching missing fields before going live.

### Features

- **Instant metadata overlay** — Press `Ctrl+E` to see all `<meta>` and `<link>` tags at a glance
- **OG image verification** — Preview images as crawlers see them, including dynamically generated ones
- **Complete tag coverage** — Open Graph, Twitter Cards, general meta, JSON-LD structured data, page links
- **SPA support** — Auto re-extracts on React, Vue, Angular, and other single-page apps
- **Validation warnings** — Checks for missing required fields (og:title, og:image, twitter:card, etc.)
- **Per-site control** — Enable/disable per domain with `Ctrl+Shift+E`
- **Export tools** — Copy metadata as JSON, download for debugging, open in social debuggers
- **Cross-browser** — Chrome, Brave, Edge, Firefox (MV3)
- **Dark/Light themes** — Auto-detects system preference
- **Positionable** — Pin the panel to any corner

## Why developers use OGee

- **Debug dynamic OG images** — See if generated social images render correctly before deploying
- **Verify meta injection** — Confirm SSR or client-side meta tags work on every route
- **Catch missing tags** — Spot missing og:image, twitter:card, or description early
- **SPA debugging** — History changes and head mutations trigger automatic re-extraction
- **Faster than DevTools** — No need to dig through Elements → scroll through `<head>`

## Install

### From source

```bash
# Clone and install
git clone https://github.com/byurhannurula/ogee.git
cd ogee
npm install

# Build for Chrome/Brave/Edge
npm run build

# Or build for Firefox
npm run build:firefox

# Load in browser:
# Chrome: chrome://extensions → "Load unpacked" → select dist-chromium/
# Firefox: about:debugging → "Load Temporary Add-on" → select dist-firefox/manifest.json
```

### Development

```bash
# Watch mode with auto-reload
npm run dev          # Chromium
npm run dev:firefox  # Firefox
```

## Usage

| Shortcut | Action |
|----------|--------|
| `Ctrl+E` | Toggle OGee panel |
| `Ctrl+Shift+E` | Enable/disable on current site |
| `Esc` | Close panel |

Click the extension icon for settings: theme, position, validation toggle, export tools.

## Tech Stack

- **React 18** (aliased to Preact for smaller bundle)
- **TypeScript**
- **ESBuild** — fast builds, watch mode with SSE reload
- **Shadow DOM** — style isolation from host pages
- **Vitest** — unit tests with happy-dom

## Project Structure

```
src/
  components/     — UI components (panel, tabs, fields, toolbar)
  hooks/          — React hooks (metadata, settings, escape key)
  lib/            — Core logic (metadata extraction, storage, validation)
  styles/         — Theme tokens and CSS animations
  background.ts   — Service worker (commands, reload)
  content.tsx     — Content script injection
  popup.tsx       — Settings popup
  manifest.json   — Extension manifest
tests/            — Test files mirroring src/
scripts/          — Build and release scripts
public/           — Extension icons and assets
```

## Development

```bash
npm test        # Run tests
npm run lint    # ESLint
npm run format  # Prettier
npm run typecheck  # TypeScript
```

## Privacy

OGee doesn't track you, collect your data, or phone home. All metadata extraction happens locally in your browser. No analytics, no telemetry.

## License

MIT

---

Built by [Byurhan Nurula](https://github.com/byurhannurula)
