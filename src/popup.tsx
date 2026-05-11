import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { storage, type Position, type ThemeMode } from "@/lib/storage";
import { queryActiveTab } from "@/lib/tabs";
import { themeTokens } from "@/styles/tokens";

const popupStyles = `
  ${themeTokens}

  html, body {
    margin: 0;
    padding: 0;
    background: var(--mp-popup-bg);
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--mp-text);
  }

  .mp-pop-shell {
    width: 300px;
    padding: 16px;
    background: var(--mp-popup-bg);
    color: var(--mp-text);
    font-size: 14px;
  }

  .mp-pop-card {
    background: var(--mp-card-bg);
    border: 1px solid var(--mp-border);
    border-radius: 10px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      inset 0 0 0 1px rgba(255, 255, 255, 0.015);
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .mp-pop-card + .mp-pop-card {
    margin-top: 8px;
  }
  .mp-pop-card:hover {
    background: var(--mp-card-bg-hover);
    border-color: var(--mp-border-strong);
  }

  .mp-pop-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mp-label);
  }

  .mp-pop-segbtn,
  .mp-pop-posbtn {
    font-family: inherit;
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }
  .mp-pop-segbtn:focus-visible,
  .mp-pop-posbtn:focus-visible,
  .mp-pop-switch:focus-visible {
    outline: 2px solid var(--mp-accent);
    outline-offset: 2px;
  }
  .mp-pop-segbtn:hover:not([data-active="true"]),
  .mp-pop-posbtn:hover:not([data-active="true"]) {
    color: var(--mp-text);
  }

  .mp-pop-kbd {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--mp-code-bg);
    border: 1px solid var(--mp-border);
    color: var(--mp-text-muted);
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    font-size: 10px;
  }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("mp-pop-styles")
) {
  const styleEl = document.createElement("style");
  styleEl.id = "mp-pop-styles";
  styleEl.textContent = popupStyles;
  document.head.appendChild(styleEl);
}

const styles = {
  shell: { width: 300 } as const,
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  } as const,
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "var(--mp-tabs-bg)",
    border: "1px solid var(--mp-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  } as const,
  title: {
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "-0.01em",
    color: "var(--mp-text)",
  } as const,
  subtitle: {
    fontSize: 11,
    color: "var(--mp-text-dim)",
    marginTop: 1,
  } as const,
  rowFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "11px 13px",
    gap: 10,
  } as const,
  rowStack: {
    padding: "11px 13px",
  } as const,
  rowLabel: {
    fontSize: 13,
    color: "var(--mp-text)",
    fontWeight: 500,
  } as const,
  rowSubLabel: {
    fontSize: 11,
    color: "var(--mp-text-dim)",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    maxWidth: 200,
  } as const,
  sectionLabel: {
    marginBottom: 8,
  } as const,
  segGroup: {
    display: "flex",
    background: "var(--mp-tabs-bg)",
    border: "1px solid var(--mp-border)",
    borderRadius: 7,
    padding: 2,
    gap: 2,
  } as const,
  segBtn: (active: boolean) =>
    ({
      flex: 1,
      padding: "6px 4px",
      fontSize: 11,
      fontWeight: 500,
      border: "none",
      borderRadius: 5,
      background: active ? "var(--mp-tab-active)" : "transparent",
      color: active ? "var(--mp-text)" : "var(--mp-text-dim)",
      boxShadow: active
        ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.25)"
        : "none",
    }) as const,
  posGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
  } as const,
  posBtn: (active: boolean) =>
    ({
      padding: "9px 6px",
      fontSize: 11,
      fontWeight: 500,
      borderRadius: 6,
      background: active ? "var(--mp-tab-active)" : "var(--mp-tabs-bg)",
      border: `1px solid ${active ? "var(--mp-border-strong)" : "var(--mp-border)"}`,
      color: active ? "var(--mp-text)" : "var(--mp-text-dim)",
      boxShadow: active
        ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.25)"
        : "none",
    }) as const,
  switchTrack: {
    width: 38,
    height: 22,
    borderRadius: 11,
    position: "relative" as const,
    cursor: "pointer",
    border: "none",
    padding: 0,
    transition: "background-color 0.18s ease",
    flexShrink: 0,
  } as const,
  switchThumb: {
    position: "absolute" as const,
    top: 2,
    width: 18,
    height: 18,
    borderRadius: "50%",
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
    transition: "left 0.18s ease",
  } as const,
  hint: {
    marginTop: 12,
    fontSize: 11,
    color: "var(--mp-text-dim)",
    textAlign: "center" as const,
    lineHeight: 1.7,
  } as const,
  hintRebind: {
    marginTop: 4,
    fontSize: 10,
    color: "var(--mp-text-dim)",
    opacity: 0.7,
  } as const,
};

function Switch({
  on,
  onClick,
  disabled,
  ariaLabel,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      className="mp-pop-switch"
      onClick={onClick}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      style={{
        ...styles.switchTrack,
        backgroundColor: on ? "var(--mp-label)" : "rgba(127, 127, 135, 0.35)",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span style={{ ...styles.switchThumb, left: on ? 18 : 2 }} />
    </button>
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

function useResolvedTheme(theme: ThemeMode): "light" | "dark" {
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return useMemo(
    () => (theme === "auto" ? (systemDark ? "dark" : "light") : theme),
    [theme, systemDark],
  );
}

export default function Popup() {
  const [defaultEnabled, setDefaultEnabled] = useState(true);
  const [host, setHost] = useState<string>("");
  const [hostOverride, setHostOverride] = useState<boolean | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [position, setPosition] = useState<Position>("bottom-left");
  const [showValidation, setShowValidation] = useState(false);
  const [showTools, setShowTools] = useState(false);

  const resolvedTheme = useResolvedTheme(theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.body.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    storage.getDefaultEnabled().then(setDefaultEnabled);
    storage.getTheme().then(setTheme);
    storage.getPosition().then(setPosition);
    storage.getShowValidation().then(setShowValidation);
    storage.getShowTools().then(setShowTools);
    queryActiveTab().then(async ([tab]) => {
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
    <div
      className="mp-pop-shell"
      data-theme={resolvedTheme}
      style={styles.shell}
    >
      <div style={styles.header}>
        <div style={styles.iconBox}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--mp-label)"
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
          <div style={styles.title}>OGee</div>
          <div style={styles.subtitle}>Social metadata inspector</div>
        </div>
      </div>

      <div className="mp-pop-card">
        <div style={styles.rowFlex}>
          <div>
            <div style={styles.rowLabel}>Enable globally</div>
            <div style={styles.rowSubLabel}>Default for all sites</div>
          </div>
          <Switch
            on={defaultEnabled}
            onClick={toggleDefault}
            ariaLabel="Enable globally"
          />
        </div>
      </div>

      <div
        className="mp-pop-card"
        style={{ opacity: canControlHost ? 1 : 0.55 }}
      >
        <div style={styles.rowFlex}>
          <div style={{ minWidth: 0 }}>
            <div style={styles.rowLabel}>Enable on this site</div>
            <div style={styles.rowSubLabel}>{host || "—"}</div>
          </div>
          <Switch
            on={hostEnabled}
            onClick={toggleHost}
            disabled={!canControlHost}
            ariaLabel="Enable on this site"
          />
        </div>
      </div>

      <div className="mp-pop-card">
        <div style={styles.rowStack}>
          <div className="mp-pop-label" style={styles.sectionLabel}>
            Theme
          </div>
          <div style={styles.segGroup}>
            {THEME_OPTIONS.map((opt) => {
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className="mp-pop-segbtn"
                  data-active={active}
                  style={styles.segBtn(active)}
                  onClick={() => pickTheme(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mp-pop-card">
        <div style={styles.rowStack}>
          <div className="mp-pop-label" style={styles.sectionLabel}>
            Position
          </div>
          <div style={styles.posGrid}>
            {POSITION_OPTIONS.map((opt) => {
              const active = position === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className="mp-pop-posbtn"
                  data-active={active}
                  style={styles.posBtn(active)}
                  onClick={() => pickPosition(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mp-pop-card">
        <div style={styles.rowFlex}>
          <div>
            <div style={styles.rowLabel}>Validation warnings</div>
            <div style={styles.rowSubLabel}>
              Show errors &amp; missing fields
            </div>
          </div>
          <Switch
            on={showValidation}
            onClick={toggleShowValidation}
            ariaLabel="Validation warnings"
          />
        </div>
      </div>

      <div className="mp-pop-card">
        <div style={styles.rowFlex}>
          <div>
            <div style={styles.rowLabel}>Export tools</div>
            <div style={styles.rowSubLabel}>Copy / download / debuggers</div>
          </div>
          <Switch
            on={showTools}
            onClick={toggleShowTools}
            ariaLabel="Export tools"
          />
        </div>
      </div>

      <div style={styles.hint}>
        <span className="mp-pop-kbd">⌃E</span> open/close ·{" "}
        <span className="mp-pop-kbd">⌃⇧E</span> toggle site
        <div style={styles.hintRebind}>
          Rebind at{" "}
          <span className="mp-pop-kbd">chrome://extensions/shortcuts</span>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
