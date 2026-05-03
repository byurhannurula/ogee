import { useState, type CSSProperties } from "react";
import type { Severity } from "@/lib/validate";
import { fontMono, theme } from "@/styles/theme";

const styles: Record<string, CSSProperties> = {
  field: {
    marginBottom: 18,
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: theme.label,
    fontFamily: fontMono,
    fontWeight: 500,
  },
  value: {
    fontSize: 15,
    color: theme.text,
    wordBreak: "break-word",
    lineHeight: 1.5,
    fontFamily: fontMono,
    cursor: "pointer",
    borderRadius: 4,
    padding: "2px 4px",
    margin: "-2px -4px",
    transition: "background-color 0.12s",
  },
  copied: {
    fontSize: 10,
    color: theme.label,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
};

const badgeStyle = (severity: Severity): CSSProperties => ({
  fontSize: 9,
  fontWeight: 600,
  padding: "1px 5px",
  borderRadius: 3,
  letterSpacing: "0.1em",
  color: severity === "error" ? "#ff6b6b" : "#e0b94a",
  backgroundColor:
    severity === "error" ? "rgba(255,107,107,0.12)" : "rgba(224,185,74,0.12)",
  border:
    severity === "error"
      ? "1px solid rgba(255,107,107,0.3)"
      : "1px solid rgba(224,185,74,0.3)",
  textTransform: "uppercase",
});

export function Field({
  label,
  value,
  severity,
}: {
  label: string;
  value: string;
  severity?: Severity;
}) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);

  if (!value) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard access can be blocked on some pages — silent fail */
    }
  };

  return (
    <div style={styles.field}>
      <div style={styles.labelRow}>
        <div style={styles.label}>{label}</div>
        {severity && (
          <span style={badgeStyle(severity)}>
            {severity === "error" ? "error" : "warn"}
          </span>
        )}
        {copied && <span style={styles.copied}>copied</span>}
      </div>
      <div
        title="Click to copy"
        onClick={handleCopy}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...styles.value,
          backgroundColor: hover ? "rgba(255,255,255,0.04)" : "transparent",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export const fieldStyles = styles;
