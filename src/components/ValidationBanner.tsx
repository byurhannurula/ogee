import type { CSSProperties } from "react";
import type { Issue } from "@/lib/validate";
import { theme } from "@/styles/theme";

const styles: Record<string, CSSProperties> = {
  wrap: {
    marginBottom: 14,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    padding: "8px 12px",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: 600,
    display: "flex",
    gap: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  errorPill: {
    color: "#ff8585",
  },
  warnPill: {
    color: "#e6c25c",
  },
  list: {
    padding: "8px 12px",
    margin: 0,
    listStyle: "none",
    fontSize: 12,
    color: theme.textMuted,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  itemDot: {
    display: "inline-block",
    width: 6,
    height: 6,
    borderRadius: "50%",
    marginRight: 8,
    verticalAlign: "middle",
  },
};

export function ValidationBanner({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return null;
  const errors = issues.filter((i) => i.severity === "error").length;
  const warns = issues.length - errors;
  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        {errors > 0 && (
          <span style={styles.errorPill}>
            ● {errors} error{errors === 1 ? "" : "s"}
          </span>
        )}
        {warns > 0 && (
          <span style={styles.warnPill}>
            ● {warns} warning{warns === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <ul style={styles.list}>
        {issues.map((issue, i) => (
          <li key={i}>
            <span
              style={{
                ...styles.itemDot,
                backgroundColor:
                  issue.severity === "error" ? "#ff6b6b" : "#e0b94a",
              }}
            />
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
