// CSS injected into the shadow root at mount time. `:host { all: initial }`
// blocks style inheritance from the host page. The CSS custom properties
// here are referenced by `theme.ts` token getters; flipping the
// `data-theme` attribute on the React root swaps the palette.

export const shadowStyles = `
  :host { all: initial; }

  [data-theme] {
    --mp-bg-panel: rgba(28, 28, 32, 0.55);
    --mp-border: rgba(255, 255, 255, 0.08);
    --mp-text: #ffffff;
    --mp-text-muted: #c8c8cc;
    --mp-text-dim: #73737d;
    --mp-label: #19d9a0;
    --mp-accent: #c4a35a;
    --mp-accent-muted: rgba(196, 163, 90, 0.85);
    --mp-tabs-bg: rgba(0, 0, 0, 0.55);
    --mp-tab-tray: linear-gradient(180deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.82) 100%);
    --mp-tab-tray-border: rgba(255, 255, 255, 0.04);
    --mp-tab-tray-highlight: rgba(255, 255, 255, 0.04);
    --mp-tab-active: linear-gradient(180deg, rgba(92, 92, 100, 0.96) 0%, rgba(70, 70, 78, 0.96) 100%);
    --mp-tab-hover: rgba(255, 255, 255, 0.02);
    --mp-control-bg: linear-gradient(180deg, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.82) 100%);
    --mp-control-bg-hover: linear-gradient(180deg, rgba(56, 56, 62, 0.96) 0%, rgba(40, 40, 46, 0.96) 100%);
    --mp-code-bg: rgba(0, 0, 0, 0.5);
  }

  [data-theme="light"] {
    --mp-bg-panel: rgba(250, 250, 250, 0.82);
    --mp-border: rgba(0, 0, 0, 0.08);
    --mp-text: #111111;
    --mp-text-muted: #4a4a4a;
    --mp-text-dim: #888888;
    --mp-label: #0e7a55;
    --mp-accent: #a07f2c;
    --mp-accent-muted: rgba(160, 127, 44, 0.85);
    --mp-tabs-bg: rgba(0, 0, 0, 0.05);
    --mp-tab-tray: linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.06) 100%);
    --mp-tab-tray-border: rgba(0, 0, 0, 0.06);
    --mp-tab-tray-highlight: rgba(255, 255, 255, 0.5);
    --mp-tab-active: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(252, 252, 254, 1) 100%);
    --mp-tab-hover: rgba(0, 0, 0, 0.018);
    --mp-control-bg: linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.06) 100%);
    --mp-control-bg-hover: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(252, 252, 254, 1) 100%);
    --mp-code-bg: rgba(0, 0, 0, 0.04);
  }

  .mp-tab {
    background-color: transparent;
    color: var(--mp-text-dim);
    opacity: 0.94;
    text-shadow: none;
  }
  .mp-tab[aria-selected="true"] {
    color: var(--mp-text);
    opacity: 1;
    text-shadow: 0 0 10px rgba(255,255,255,0.03);
  }
  .mp-tab[aria-selected="false"]:hover {
    color: var(--mp-text);
    opacity: 1;
  }
  .mp-collapse {
    color: var(--mp-text-dim);
    transition:
      color 0.18s ease,
      background 0.18s ease,
      box-shadow 0.18s ease;
  }
  .mp-collapse:hover {
    color: var(--mp-text);
    background: var(--mp-control-bg-hover);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.10),
      inset 0 0 0 1px rgba(255,255,255,0.06),
      0 0 0 1px rgba(255,255,255,0.05),
      0 6px 14px -8px rgba(255,255,255,0.18);
  }
  .mp-tab:focus-visible,
  .mp-collapse:focus-visible {
    outline: 2px solid var(--mp-accent);
    outline-offset: -2px;
  }
  .mp-tab:focus:not(:focus-visible) {
    outline: none;
  }

  .mp-peek[data-expanded="false"]:hover {
    transform: scale(1.05) rotate(-3deg);
  }
`;
