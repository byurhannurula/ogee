import type { CSSProperties } from "react";

import type { Position } from "@/lib/storage";
import { theme } from "@/styles/theme";

const styles: Record<string, CSSProperties> = {
  btn: {
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    flexShrink: 0,
    alignSelf: "stretch",
    minWidth: 40,
    padding: "0 10px",
    background: theme.controlBg,
    boxShadow: `inset 0 1px 0 ${theme.tabTrayHighlight}, inset 0 0 0 1px ${theme.tabTrayBorder}, 0 8px 20px -16px rgba(0,0,0,0.72)`,
  },
};

const ARROW_PATHS: Record<Position, { line: string; head: string }> = {
  // Each glyph is a diagonal line + an arrowhead pointing toward the
  // panel's anchored corner — the visual cue is "collapse to here".
  "bottom-left": { line: "M17 7 7 17", head: "M14 17H7V10" },
  "bottom-right": { line: "M7 7 17 17", head: "M17 10V17H10" },
  "top-left": { line: "M17 17 7 7", head: "M7 14V7H14" },
  "top-right": { line: "M7 17 17 7", head: "M10 7H17V14" },
};

export function CloseButton({
  onClick,
  position,
}: {
  onClick: () => void;
  position: Position;
}) {
  const { line, head } = ARROW_PATHS[position];
  return (
    <button
      onClick={onClick}
      className="mp-collapse"
      style={styles.btn}
      aria-label="Collapse panel"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={line} />
        <path d={head} />
      </svg>
    </button>
  );
}
