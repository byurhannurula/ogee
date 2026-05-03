// CSS injected into the shadow root at mount time. `:host { all: initial }`
// blocks style inheritance from the host page. The CSS custom properties
// here are referenced by `theme.ts` token getters; flipping the
// `data-theme` attribute on the React root swaps the palette.

export const shadowStyles = `
  :host { all: initial; }

  [data-theme] {
    --mp-bg-panel: rgba(8, 8, 8, 0.55);
    --mp-border: rgba(255, 255, 255, 0.06);
    --mp-text: #e5e5e5;
    --mp-text-muted: #a0a0a0;
    --mp-text-dim: #666666;
    --mp-label: #4a9f8e;
    --mp-accent: #c4a35a;
    --mp-accent-muted: rgba(196, 163, 90, 0.85);
    --mp-tabs-bg: rgba(0, 0, 0, 0.45);
    --mp-tab-active: rgba(255, 255, 255, 0.12);
    --mp-tab-hover: rgba(255, 255, 255, 0.05);
    --mp-image-bg: #050505;
    --mp-code-bg: #0a0a0a;
  }

  [data-theme="light"] {
    --mp-bg-panel: rgba(250, 250, 250, 0.78);
    --mp-border: rgba(0, 0, 0, 0.08);
    --mp-text: #111111;
    --mp-text-muted: #4a4a4a;
    --mp-text-dim: #888888;
    --mp-label: #1f7a6a;
    --mp-accent: #a07f2c;
    --mp-accent-muted: rgba(160, 127, 44, 0.85);
    --mp-tabs-bg: rgba(0, 0, 0, 0.05);
    --mp-tab-active: #ffffff;
    --mp-tab-hover: rgba(0, 0, 0, 0.04);
    --mp-image-bg: #ececec;
    --mp-code-bg: rgba(0, 0, 0, 0.04);
  }

  .mp-tab {
    background-color: transparent;
    color: var(--mp-text-dim);
  }
  .mp-tab[aria-selected="true"] {
    color: var(--mp-text);
  }
  .mp-tab[aria-selected="false"]:hover {
    color: var(--mp-text);
    background-color: var(--mp-tab-hover);
  }
  .mp-collapse {
    background-color: transparent;
    color: var(--mp-text-dim);
  }
  .mp-collapse:hover {
    color: var(--mp-text);
    background-color: var(--mp-tab-hover);
  }
  .mp-tab:focus-visible,
  .mp-collapse:focus-visible {
    outline: 2px solid var(--mp-accent);
    outline-offset: -2px;
  }
  .mp-tab:focus:not(:focus-visible) {
    outline: none;
  }

  @keyframes panelSlideIn {
    from { opacity: 0; transform: scale(0.35); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes panelSlideOut {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(0.35); }
  }
`;
