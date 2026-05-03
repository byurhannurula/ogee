import { useEffect } from "react";

/**
 * Calls `onEscape` when the Escape key is pressed while `active` is true.
 * Listens on `document` so it works regardless of focus location (the panel
 * lives inside a shadow root and may not have focus).
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active, onEscape]);
}
