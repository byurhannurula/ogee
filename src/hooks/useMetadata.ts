import { useEffect, useState } from "react";
import { extractAllMetadata, type MetaData } from "@/lib/metadata";
import { storage } from "@/lib/storage";
import { NAV_EVENT } from "@/lib/spa-nav";

interface UseMetadataResult {
  metadata: MetaData | null;
  hasData: boolean;
  enabled: boolean;
}

/**
 * Owns metadata extraction lifecycle:
 * - Initial extract deferred to `requestIdleCallback` (1500ms timeout fallback).
 * - Re-extracts on SPA navigation (history-patch event + popstate) and on
 *   `<head>` mutations (debounced 300ms).
 * - Subscribes to the per-host effective enabled flag in chrome.storage.
 */
export function useMetadata(): UseMetadataResult {
  const [metadata, setMetadata] = useState<MetaData | null>(null);
  const [hasData, setHasData] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const host = window.location.host;
    const refreshEnabled = () =>
      storage.getEffectiveEnabled(host).then(setEnabled);

    refreshEnabled();
    const unsubscribe = storage.onAnyChange(refreshEnabled);

    const extract = () => {
      const data = extractAllMetadata();
      setMetadata(data);
      setHasData(Object.values(data).some((g) => g.hasData));
    };

    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleExtract = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(extract, 300);
    };

    // Register listeners + observer BEFORE the first idle extract. If meta
    // is injected during the gap between idle scheduling and observer
    // attach, the mutation still queues a re-extract.
    window.addEventListener(NAV_EVENT, scheduleExtract);
    window.addEventListener("popstate", scheduleExtract);

    const headObserver = new MutationObserver(scheduleExtract);
    if (document.head) {
      headObserver.observe(document.head, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["content", "href"],
      });
    }

    idle(extract);

    return () => {
      unsubscribe();
      window.removeEventListener(NAV_EVENT, scheduleExtract);
      window.removeEventListener("popstate", scheduleExtract);
      headObserver.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { metadata, hasData, enabled };
}

function idle(cb: () => void) {
  const w = window as Window & {
    requestIdleCallback?: (
      cb: () => void,
      opts?: { timeout: number },
    ) => number;
  };
  if (typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(cb, { timeout: 1500 });
  } else {
    setTimeout(cb, 0);
  }
}
