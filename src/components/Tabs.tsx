import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type { Position } from "@/lib/storage";
import { TAB_PANEL_ID } from "@/lib/app";
import { fontMono, theme } from "@/styles/theme";
import { CloseButton } from "./CloseButton";

const styles: Record<string, CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    padding: "6px 10px 9px",
    gap: 6,
    flexShrink: 0,
    position: "relative",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    flex: 1,
    padding: 3,
    minHeight: 38,
    borderRadius: 10,
    background: theme.tabTray,
  },
  indicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    backgroundColor: theme.textDim,
    borderRadius: 9,
    boxShadow:
      "0 2px 1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.04)",
    zIndex: 0,
    transition:
      "left 0.28s cubic-bezier(0.22, 1, 0.36, 1), width 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
  },
  tab: {
    flex: 1,
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.10em",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    transition: "color 0.18s ease, opacity 0.18s ease, text-shadow 0.18s ease",
    fontFamily: fontMono,
    position: "relative",
    zIndex: 1,
    whiteSpace: "nowrap",
    textAlign: "center",
  },
};

export interface Tab {
  key: string;
  label: string;
}

const tabId = (key: string) => `ogee-tab-${key}`;

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  onCollapse,
  position,
}: {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  onCollapse: () => void;
  position: Position;
}) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [hasMeasured, setHasMeasured] = useState(false);

  useEffect(() => {
    const activeEl = tabRefs.current.get(activeTab);
    if (activeEl) {
      setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
      setHasMeasured(true);
    }
  }, [activeTab, tabs]);

  const focusTab = (key: string) => {
    const el = tabRefs.current.get(key);
    if (el) el.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (!tabs.length) return;
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft")
      nextIdx = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = tabs.length - 1;
    if (nextIdx === null) return;
    e.preventDefault();
    const nextKey = tabs[nextIdx].key;
    onTabChange(nextKey);
    focusTab(nextKey);
  };

  return (
    <div style={styles.bar}>
      <div style={styles.inner} role="tablist" aria-label="Metadata sections">
        <div
          style={{
            ...styles.indicator,
            left: indicator.left,
            width: indicator.width,
            opacity: hasMeasured ? 1 : 0,
            transition: hasMeasured ? styles.indicator.transition : "none",
          }}
        />
        {tabs.map((tab, idx) => {
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={tabId(tab.key)}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.key, el);
                else tabRefs.current.delete(tab.key);
              }}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={TAB_PANEL_ID}
              tabIndex={selected ? 0 : -1}
              onClick={() => onTabChange(tab.key)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="mp-tab"
              style={styles.tab}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <CloseButton onClick={onCollapse} position={position} />
    </div>
  );
}

export { tabId };
