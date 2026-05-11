import { useState, type CSSProperties } from "react";
import type { MetaData } from "@/lib/metadata";
import { APP_NAME } from "@/lib/app";
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
  status: {
    fontSize: 10,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginLeft: 4,
  },
  statusOk: { color: theme.label },
  statusErr: { color: "#e76f51" },
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

type Flash = {
  action: "copy" | "download";
  state: "ok" | "err";
} | null;

export function Toolbar({ metadata }: { metadata: MetaData }) {
  const [flash, setFlash] = useState<Flash>(null);

  const json = () => JSON.stringify(stripForExport(metadata), null, 2);

  const showFlash = (next: NonNullable<Flash>) => {
    setFlash(next);
    setTimeout(() => setFlash(null), 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json());
      showFlash({ action: "copy", state: "ok" });
    } catch {
      showFlash({ action: "copy", state: "err" });
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([json()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${APP_NAME.toLowerCase()}-${slugifyHost()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showFlash({ action: "download", state: "ok" });
    } catch {
      showFlash({ action: "download", state: "err" });
    }
  };

  const flashLabel = (() => {
    if (!flash) return null;
    if (flash.state === "err") return "failed";
    return flash.action === "copy" ? "copied" : "downloaded";
  })();

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
      {flashLabel && (
        <span
          style={{
            ...styles.status,
            ...(flash?.state === "err" ? styles.statusErr : styles.statusOk),
          }}
        >
          {flashLabel}
        </span>
      )}
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
