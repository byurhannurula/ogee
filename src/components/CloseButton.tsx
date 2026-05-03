import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  btn: {
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    transition: "color 0.15s, background-color 0.15s",
    flexShrink: 0,
    alignSelf: "stretch",
    padding: "0 14px",
  },
};

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mp-collapse"
      style={styles.btn}
      aria-label="Collapse panel"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 7 7 17" />
        <path d="M17 17H7V7" />
      </svg>
    </button>
  );
}
