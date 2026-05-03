import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { storage, type Position, type ThemeMode } from "@/lib/storage";

const styles = {
  shell: {
    width: 280,
    padding: 16,
    backgroundColor: "#0f0f0f",
    color: "#e5e5e5",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(196, 163, 90, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: { fontWeight: 600, fontSize: 15, marginBottom: 1 },
  subtitle: { fontSize: 12, color: "#888" },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderRadius: 8,
    backgroundColor: "#161616",
    border: "1px solid #222",
    marginBottom: 8,
    gap: 10,
  },
  rowStack: {
    padding: "10px 12px",
    borderRadius: 8,
    backgroundColor: "#161616",
    border: "1px solid #222",
    marginBottom: 8,
  },
  rowLabel: { fontSize: 13, color: "#e5e5e5" },
  rowSubLabel: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    maxWidth: 190,
  },
  segGroup: {
    display: "flex",
    marginTop: 8,
    backgroundColor: "#0d0d0d",
    border: "1px solid #222",
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  segBtn: (active: boolean) => ({
    flex: 1,
    padding: "6px 4px",
    fontSize: 11,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500 as const,
    backgroundColor: active ? "rgba(196, 163, 90, 0.2)" : "transparent",
    color: active ? "#c4a35a" : "#888",
    transition: "background-color 0.12s, color 0.12s",
  }),
  posGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 4,
    marginTop: 8,
  },
  posBtn: (active: boolean) => ({
    padding: "8px 4px",
    fontSize: 11,
    border: `1px solid ${active ? "#c4a35a" : "#222"}`,
    borderRadius: 5,
    cursor: "pointer",
    backgroundColor: active ? "rgba(196, 163, 90, 0.15)" : "#0d0d0d",
    color: active ? "#c4a35a" : "#888",
    fontFamily: "inherit",
    transition: "all 0.12s",
  }),
  switchTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    position: "relative" as const,
    cursor: "pointer",
    transition: "background-color 0.15s",
    flexShrink: 0,
  },
  switchThumb: {
    position: "absolute" as const,
    top: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundColor: "#fff",
    transition: "left 0.15s",
  },
  hint: {
    marginTop: 10,
    fontSize: 11,
    color: "#555",
    textAlign: "center" as const,
    lineHeight: 1.6,
  },
  kbd: {
    display: "inline-block",
    padding: "1px 5px",
    borderRadius: 3,
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    color: "#aaa",
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
    fontSize: 10,
  },
};

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      role="switch"
      aria-checked={on}
      style={{
        ...styles.switchTrack,
        backgroundColor: on ? "rgba(196, 163, 90, 0.85)" : "#2a2a2a",
      }}
    >
      <div style={{ ...styles.switchThumb, left: on ? 18 : 2 }} />
    </div>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: "top-left", label: "↖  Top left" },
  { value: "top-right", label: "↗  Top right" },
  { value: "bottom-left", label: "↙  Bottom left" },
  { value: "bottom-right", label: "↘  Bottom right" },
];

export default function Popup() {
  const [defaultEnabled, setDefaultEnabled] = useState(true);
  const [host, setHost] = useState<string>("");
  const [hostOverride, setHostOverride] = useState<boolean | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [position, setPosition] = useState<Position>("bottom-left");
  const [showValidation, setShowValidation] = useState(false);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    storage.getDefaultEnabled().then(setDefaultEnabled);
    storage.getTheme().then(setTheme);
    storage.getPosition().then(setPosition);
    storage.getShowValidation().then(setShowValidation);
    storage.getShowTools().then(setShowTools);
    chrome.tabs
      ?.query({ active: true, currentWindow: true })
      .then(async ([tab]) => {
        if (!tab?.url) return;
        let h = "";
        try {
          h = new URL(tab.url).host;
        } catch {
          return;
        }
        setHost(h);
        const overrides = await storage.getHostOverrides();
        setHostOverride(h in overrides ? overrides[h] : null);
      });
  }, []);

  const hostEnabled = hostOverride === null ? defaultEnabled : hostOverride;
  const canControlHost = !!host;

  const toggleDefault = async () => {
    const next = !defaultEnabled;
    setDefaultEnabled(next);
    await storage.setDefaultEnabled(next);
  };

  const toggleHost = async () => {
    if (!canControlHost) return;
    const next = !hostEnabled;
    const override = next === defaultEnabled ? null : next;
    setHostOverride(override);
    await storage.setHostOverride(host, override);
  };

  const pickTheme = async (v: ThemeMode) => {
    setTheme(v);
    await storage.setTheme(v);
  };

  const pickPosition = async (v: Position) => {
    setPosition(v);
    await storage.setPosition(v);
  };

  const toggleShowValidation = async () => {
    const next = !showValidation;
    setShowValidation(next);
    await storage.setShowValidation(next);
  };

  const toggleShowTools = async () => {
    const next = !showTools;
    setShowTools(next);
    await storage.setShowTools(next);
  };

  return (
    <div style={styles.shell}>
      <div style={styles.header}>
        <div style={styles.iconBox}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c4a35a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <div style={styles.title}>TagPeek</div>
          <div style={styles.subtitle}>OG &amp; Twitter metadata</div>
        </div>
      </div>

      <div style={styles.row}>
        <div>
          <div style={styles.rowLabel}>Enable globally</div>
          <div style={styles.rowSubLabel}>Default for all sites</div>
        </div>
        <Switch on={defaultEnabled} onClick={toggleDefault} />
      </div>

      <div style={{ ...styles.row, opacity: canControlHost ? 1 : 0.5 }}>
        <div style={{ minWidth: 0 }}>
          <div style={styles.rowLabel}>Enable on this site</div>
          <div style={styles.rowSubLabel}>{host || "—"}</div>
        </div>
        <Switch on={hostEnabled} onClick={toggleHost} />
      </div>

      <div style={styles.rowStack}>
        <div style={styles.rowLabel}>Theme</div>
        <div style={styles.segGroup}>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              style={styles.segBtn(theme === opt.value)}
              onClick={() => pickTheme(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.rowStack}>
        <div style={styles.rowLabel}>Position</div>
        <div style={styles.posGrid}>
          {POSITION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              style={styles.posBtn(position === opt.value)}
              onClick={() => pickPosition(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.row}>
        <div>
          <div style={styles.rowLabel}>Validation warnings</div>
          <div style={styles.rowSubLabel}>Show errors &amp; missing fields</div>
        </div>
        <Switch on={showValidation} onClick={toggleShowValidation} />
      </div>

      <div style={styles.row}>
        <div>
          <div style={styles.rowLabel}>Export tools</div>
          <div style={styles.rowSubLabel}>Copy / download / debuggers</div>
        </div>
        <Switch on={showTools} onClick={toggleShowTools} />
      </div>

      <div style={styles.hint}>
        <span style={styles.kbd}>⌃M</span> open/close ·{" "}
        <span style={styles.kbd}>⌃⇧M</span> toggle site
        <div style={{ marginTop: 4, color: "#444" }}>
          Rebind at{" "}
          <span style={styles.kbd}>chrome://extensions/shortcuts</span>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
