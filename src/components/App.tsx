import { useCallback, useEffect, useMemo, useState } from "react";
import { TAB_CONFIG, type TabKey } from "@/lib/constants";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useMetadata } from "@/hooks/useMetadata";
import { useSettings } from "@/hooks/useSettings";
import { TOGGLE_PANEL_EVENT } from "@/lib/messages";
import { validate } from "@/lib/validate";
import { PeekShell } from "./PeekShell";
import { PeekThumb } from "./PeekThumb";
import { TabContent } from "./TabContent";
import { Tabs, TAB_PANEL_ID, tabId } from "./Tabs";
import { Toolbar } from "./Toolbar";

export function App() {
  const { metadata, hasData, enabled } = useMetadata();
  const { resolvedTheme, position, showValidation, showTools } = useSettings();
  const [activeTab, setActiveTab] = useState<TabKey>("og");
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleClose = useCallback(() => setIsExpanded(false), []);

  const handleOpen = useCallback(() => {
    if (!metadata) return;
    const firstTab = metadata.og.hasData
      ? "og"
      : TAB_CONFIG.find((t) => metadata[t.key].hasData)?.key || "og";
    setActiveTab(firstTab);
    setIsExpanded(true);
  }, [metadata]);

  useEscapeKey(isExpanded, handleClose);

  useEffect(() => {
    const handler = () => {
      if (isExpanded) handleClose();
      else handleOpen();
    };
    window.addEventListener(TOGGLE_PANEL_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_PANEL_EVENT, handler);
  }, [isExpanded, handleOpen, handleClose]);

  const validation = useMemo(
    () => (metadata ? validate(metadata) : null),
    [metadata],
  );

  if (!enabled || !hasData || !metadata || !validation) return null;

  const titleField =
    metadata.og.fields.find((f) => f.key === "og:title")?.value ||
    metadata.twitter.fields.find((f) => f.key === "twitter:title")?.value ||
    metadata.page.fields.find((f) => f.key === "title")?.value ||
    "";

  return (
    <PeekShell
      expanded={isExpanded}
      position={position}
      onOpen={handleOpen}
      thumbnail={<PeekThumb image={previewImage} title={titleField} />}
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
          position={position}
        />
      }
    />
  );
}
