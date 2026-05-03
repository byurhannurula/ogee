// Theme tokens. Values resolve to CSS custom properties defined in
// `keyframes.ts` so the panel/card can swap dark <-> light at runtime by
// flipping `data-theme` on the React root container.

export const theme = {
  bgPanel: "var(--mp-bg-panel)",
  border: "var(--mp-border)",
  text: "var(--mp-text)",
  textMuted: "var(--mp-text-muted)",
  textDim: "var(--mp-text-dim)",
  label: "var(--mp-label)",
  accent: "var(--mp-accent)",
  accentMuted: "var(--mp-accent-muted)",
  tabsBg: "var(--mp-tabs-bg)",
  tabActive: "var(--mp-tab-active)",
  imageBg: "var(--mp-image-bg)",
  codeBg: "var(--mp-code-bg)",
} as const;

export const fontMono =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace';

// Highest possible 32-bit signed int — used so the panel/thumbnail sit above
// any ad layer or sticky header on the host page.
export const Z_TOP = 2147483647;
