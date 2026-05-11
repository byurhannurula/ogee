// CSS injected into the shadow root at mount time. `:host { all: initial }`
// blocks style inheritance from the host page. The shared `themeTokens`
// block defines the CSS custom properties referenced by `theme.ts`;
// flipping the `data-theme` attribute on the React root swaps the palette.

import { themeTokens } from "./tokens";

export const shadowStyles = `
  :host { all: initial; }

  ${themeTokens}

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

  @keyframes mp-tab-fade-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .mp-tab-content {
    animation: mp-tab-fade-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
`;
