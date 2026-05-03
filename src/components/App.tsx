import { useCallback, useEffect, useMemo, useState } from "react";
import { TAB_CONFIG, type TabKey } from "@/lib/constants";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useMetadata } from "@/hooks/useMetadata";
import { useSettings } from "@/hooks/useSettings";
import { TOGGLE_PANEL_EVENT } from "@/lib/messages";
import { validate } from "@/lib/validate";
import { Panel, PANEL_EXIT_MS } from "./Panel";
import { TabContent } from "./TabContent";
import { Tabs, TAB_PANEL_ID, tabId } from "./Tabs";
import { Thumbnail } from "./Thumbnail";
import { Toolbar } from "./Toolbar";

/**
 * Top-level orchestrator. Owns view state (which tab, expanded vs.
 * card, closing animation) and delegates everything else.
 */
export function App() {
  const { metadata, hasData, enabled } = useMetadata();
  const { resolvedTheme, position, showValidation, showTools } = useSettings();
  const [activeTab, setActiveTab] = useState<TabKey>("og");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Apply data-theme to the React root container so CSS vars cascade to
  // the panel/card. Has to walk up to the closest [data-theme] ancestor —
  // we set one in content.tsx mount().
  useEffect(() => {
    const host = document.getElementById("tagpeek-host");
    const themeRoot = host?.shadowRoot?.querySelector(
      "[data-theme]",
    ) as HTMLElement | null;
    if (themeRoot) themeRoot.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const previewImage =
    metadata?.og.fields.find((f) => f.key === "og:image")?.value ||
    metadata?.twitter.fields.find((f) => f.key === "twitter:image")?.value ||
    "";

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, PANEL_EXIT_MS);
  }, []);

  const handleOpen = useCallback(() => {
    if (!metadata) return;
    const firstTab = metadata.og.hasData
      ? "og"
      : TAB_CONFIG.find((t) => metadata[t.key].hasData)?.key || "og";
    setActiveTab(firstTab);
    setIsExpanded(true);
  }, [metadata]);

  useEscapeKey(isExpanded, handleClose);

  // Keyboard shortcut → SW → content script dispatches this event.
  useEffect(() => {
    const handler = () => {
      if (isExpanded && !isClosing) handleClose();
      else if (!isExpanded) handleOpen();
    };
    window.addEventListener(TOGGLE_PANEL_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_PANEL_EVENT, handler);
  }, [isExpanded, isClosing, handleOpen, handleClose]);

  const validation = useMemo(
    () => (metadata ? validate(metadata) : null),
    [metadata],
  );

  if (!enabled || !hasData || !metadata || !validation) return null;

  if (isExpanded) {
    return (
      <Panel
        closing={isClosing}
        position={position}
        body={
          <>
            {showTools && <Toolbar metadata={metadata} />}
            <div
              id={TAB_PANEL_ID}
              role="tabpanel"
              aria-labelledby={tabId(activeTab)}
            >
              <TabContent
                group={metadata[activeTab]}
                imageUrl={previewImage}
                validation={validation}
                showValidation={showValidation}
              />
            </div>
          </>
        }
        footer={
          <Tabs
            tabs={TAB_CONFIG.filter((tab) => metadata[tab.key].hasData)}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as TabKey)}
            onCollapse={handleClose}
          />
        }
      />
    );
  }

  const titleField =
    metadata.og.fields.find((f) => f.key === "og:title")?.value ||
    metadata.twitter.fields.find((f) => f.key === "twitter:title")?.value ||
    metadata.page.fields.find((f) => f.key === "title")?.value ||
    "";
  const descField =
    metadata.og.fields.find((f) => f.key === "og:description")?.value ||
    metadata.twitter.fields.find((f) => f.key === "twitter:description")
      ?.value ||
    metadata.general.fields.find((f) => f.key === "description")?.value ||
    "";

  return (
    <Thumbnail
      title={titleField}
      description={descField}
      image={previewImage}
      position={position}
      onClick={handleOpen}
    />
  );
}
