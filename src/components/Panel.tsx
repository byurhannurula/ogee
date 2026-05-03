import type { CSSProperties, ReactNode } from "react";
import { positionAnchor, transformOriginFor } from "@/lib/position";
import type { Position } from "@/lib/storage";
import { fontMono, theme, Z_TOP } from "@/styles/theme";

const styles: Record<string, CSSProperties> = {
  panel: {
    position: "fixed",
    width: 580,
    maxHeight: "85vh",
    backgroundColor: theme.bgPanel,
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    borderRadius: 14,
    boxShadow:
      "0 25px 50px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.04)",
    border: `1px solid ${theme.border}`,
    overflow: "hidden",
    textAlign: "left",
    zIndex: Z_TOP,
    fontFamily: fontMono,
    color: theme.text,
    display: "flex",
    flexDirection: "column",
    fontSize: 14,
    lineHeight: 1.5,
    willChange: "transform, opacity",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px 18px",
    scrollbarWidth: "thin",
    scrollbarColor: "#333 transparent",
  },
  enter: {
    animation: "panelSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
  },
  exit: {
    animation: "panelSlideOut 0.22s cubic-bezier(0.4, 0, 0.2, 1) forwards",
  },
};

/**
 * Animated panel shell. Renders the scroll area + a slot below for the tab
 * bar. Animation direction is controlled by `closing`.
 */
export function Panel({
  closing,
  position,
  body,
  footer,
}: {
  closing: boolean;
  position: Position;
  body: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      style={{
        ...styles.panel,
        ...positionAnchor(position),
        transformOrigin: transformOriginFor(position),
        ...(closing ? styles.exit : styles.enter),
      }}
    >
      <div style={styles.scrollArea}>{body}</div>
      {footer}
    </div>
  );
}

export const PANEL_EXIT_MS = 220;
