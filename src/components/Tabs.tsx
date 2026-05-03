import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { fontMono, theme } from "@/styles/theme";
import { CloseButton } from "./CloseButton";

const styles: Record<string, CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    padding: "6px 8px",
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
  },
  indicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    backgroundColor: theme.tabActive,
    borderRadius: 8,
    boxShadow:
      "0 1px 2px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)",
    transition:
      "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 0,
  },
  tab: {
    flex: 1,
    padding: "11px 12px",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "color 0.15s ease, background-color 0.15s ease",
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

export const TAB_PANEL_ID = "tagpeek-tabpanel";
const tabId = (key: string) => `tagpeek-tab-${key}`;

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  onCollapse,
}: {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  onCollapse: () => void;
}) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeEl = tabRefs.current.get(activeTab);
    if (activeEl) {
      setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
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
      <CloseButton onClick={onCollapse} />
    </div>
  );
}

export { tabId };
