import { useState, type CSSProperties } from "react";
import type { MetaData } from "@/lib/metadata";
import { fontMono, theme } from "@/styles/theme";

const styles: Record<string, CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  group: {
    display: "flex",
    gap: 4,
    padding: 3,
    border: `1px solid ${theme.border}`,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  btn: {
    background: "transparent",
    border: "none",
    color: theme.textMuted,
    fontSize: 11,
    fontFamily: fontMono,
    fontWeight: 500,
    padding: "5px 10px",
    borderRadius: 4,
    cursor: "pointer",
    transition: "color 0.12s, background-color 0.12s",
    letterSpacing: "0.05em",
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: theme.border,
    margin: "0 2px",
  },
  copied: {
    fontSize: 10,
    color: theme.label,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginLeft: 4,
  },
};

const SOCIAL_LINKS: { label: string; href: (url: string) => string }[] = [
  {
    label: "FB",
    href: (u) =>
      `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(u)}`,
  },
  {
    label: "X",
    href: (u) =>
      `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(u)}`,
  },
  {
    label: "LinkedIn",
    href: (u) =>
      `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(u)}`,
  },
];

function ToolButton({
  label,
  onClick,
  title,
}: {
  label: string;
  onClick: () => void;
  title?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={title}
      style={{
        ...styles.btn,
        color: hover ? theme.text : theme.textMuted,
        backgroundColor: hover ? "rgba(255,255,255,0.05)" : "transparent",
      }}
    >
      {label}
    </button>
  );
}

export function Toolbar({ metadata }: { metadata: MetaData }) {
  const [copied, setCopied] = useState(false);

  const json = () => JSON.stringify(stripForExport(metadata), null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silent */
    }
  };

  const handleDownload = () => {
    const blob = new Blob([json()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tagpeek-${slugifyHost()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openIn = (build: (u: string) => string) => {
    const pageUrl = window.location.href;
    window.open(build(pageUrl), "_blank", "noopener,noreferrer");
  };

  return (
    <div style={styles.bar}>
      <div style={styles.group}>
        <ToolButton label="Copy JSON" onClick={handleCopy} />
        <ToolButton label="Download" onClick={handleDownload} />
      </div>
      <div style={styles.group}>
        {SOCIAL_LINKS.map((s) => (
          <ToolButton
            key={s.label}
            label={s.label}
            title={`Open in ${s.label} debugger`}
            onClick={() => openIn(s.href)}
          />
        ))}
      </div>
      {copied && <span style={styles.copied}>copied</span>}
    </div>
  );
}

// Strip the `name` / `hasData` UI metadata to keep the export focused on
// raw fields the user actually cares about.
function stripForExport(metadata: MetaData) {
  const out: Record<string, Record<string, string>> = {};
  for (const [groupKey, group] of Object.entries(metadata)) {
    const fields: Record<string, string> = {};
    for (const f of group.fields) fields[f.key] = f.value;
    out[groupKey] = fields;
  }
  return out;
}

function slugifyHost() {
  try {
    return window.location.host.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  } catch {
    return "page";
  }
}
