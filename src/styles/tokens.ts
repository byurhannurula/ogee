// CSS custom properties shared between the in-page panel (rendered inside
// the content-script shadow root) and the popup (rendered in its own
// document). Selecting on `[data-theme]` lets either context flip palette
// at runtime by toggling the attribute on its root container.
//
// Note: the in-page panel uses translucent backgrounds so the host page
// shows through. The popup paints onto an opaque chrome window, so a few
// surface tokens (`--mp-popup-bg`, `--mp-card-bg`) are popup-only and
// resolve to opaque equivalents.

export const themeTokens = `
  [data-theme] {
    --mp-bg-panel: rgba(28, 28, 32, 0.55);
    --mp-popup-bg: #18181c;
    --mp-card-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.015) 100%);
    --mp-card-bg-hover: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.025) 100%);
    --mp-border: rgba(255, 255, 255, 0.08);
    --mp-border-strong: rgba(255, 255, 255, 0.12);
    --mp-text: #ffffff;
    --mp-text-muted: #c8c8cc;
    --mp-text-dim: #73737d;
    --mp-label: #19d9a0;
    --mp-accent: #c4a35a;
    --mp-accent-muted: rgba(196, 163, 90, 0.85);
    --mp-accent-soft: rgba(196, 163, 90, 0.15);
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
    --mp-popup-bg: #fafafa;
    --mp-card-bg: linear-gradient(180deg, rgba(0, 0, 0, 0.025) 0%, rgba(0, 0, 0, 0.012) 100%);
    --mp-card-bg-hover: linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.02) 100%);
    --mp-border: rgba(0, 0, 0, 0.08);
    --mp-border-strong: rgba(0, 0, 0, 0.14);
    --mp-text: #111111;
    --mp-text-muted: #4a4a4a;
    --mp-text-dim: #888888;
    --mp-label: #0e7a55;
    --mp-accent: #a07f2c;
    --mp-accent-muted: rgba(160, 127, 44, 0.85);
    --mp-accent-soft: rgba(160, 127, 44, 0.12);
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
`;
