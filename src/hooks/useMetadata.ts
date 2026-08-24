import { useEffect, useState } from "react";
import { extractAllMetadata, type MetaData } from "@/lib/metadata";
import { storage } from "@/lib/storage";
import { NAV_EVENT } from "@/lib/spa-nav";
import { HOST_ELEMENT_ID } from "@/lib/app";

interface UseMetadataResult {
  metadata: MetaData | null;
  enabled: boolean;
}

/**
 * Owns metadata extraction lifecycle:
 * - Initial extract deferred to `requestIdleCallback` (1500ms timeout fallback).
 * - Re-extracts on SPA navigation (history-patch event + popstate) and on
 *   `<head>` mutations (debounced 300ms).
 * - Subscribes to the per-host effective enabled flag in chrome.storage so
 *   Ctrl+Shift+E can completely hide the panel.
 */
export function useMetadata(): UseMetadataResult {
  const [metadata, setMetadata] = useState<MetaData | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const host = window.location.host;
    const refreshEnabled = () =>
      storage.getEffectiveEnabled(host).then((v) => {
        setEnabled(v);
        if (!v) {
          // When disabled, remove the host element so the panel disappears
          // completely (not just collapsed).
          const el = document.getElementById(HOST_ELEMENT_ID);
          if (el) el.remove();
        }
      });

    refreshEnabled();
    const unsubscribe = storage.onAnyChange(refreshEnabled);

    const extract = () => {
      setMetadata(extractAllMetadata());
    };

    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleExtract = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(extract, 300);
    };

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

  return { metadata, enabled };
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
