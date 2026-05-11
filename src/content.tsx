import { createRoot } from "react-dom/client";
import { App } from "@/components/App";
import { installHistoryPatch } from "@/lib/spa-nav";
import { TOGGLE_PANEL_EVENT, type Message } from "@/lib/messages";
import { HOST_ELEMENT_ID } from "@/lib/app";
import { shadowStyles } from "@/styles/keyframes";

// Patch history once at script load so SPA route changes are observable
// even before the React tree mounts.
installHistoryPatch();

// Bridge SW → React tree: keyboard command messages become a window event
// the App component listens for.
chrome.runtime?.onMessage.addListener((msg: Message) => {
  if (msg?.type === "toggle-panel" || msg?.type === "open-panel") {
    window.dispatchEvent(new CustomEvent(TOGGLE_PANEL_EVENT));
  }
});

let mounted = false;
function mount() {
  if (mounted) return;
  mounted = true;

  // Shadow DOM isolates panel styles from the host page (and vice versa).
  const host = document.createElement("div");
  host.id = HOST_ELEMENT_ID;
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = shadowStyles;
  shadow.appendChild(style);

  const reactRoot = document.createElement("div");
  // CSS custom properties live on this element via [data-theme] selectors;
  // useSettings() updates the attribute when the user picks light/dark/auto.
  reactRoot.dataset.theme = "dark";
  shadow.appendChild(reactRoot);
  createRoot(reactRoot).render(<App />);
}

// Cheap probe: skip React entirely on metadata-less pages. For SPAs that
// inject metadata after first paint, set a one-shot head observer that
// mounts when og/twitter tags appear (10s cap).
function hasRelevantMeta(): boolean {
  return !!document.querySelector(
    'meta[property^="og:"], meta[name^="twitter:"]',
  );
}

function bootstrap() {
  // Skip cross-origin iframes (ads, embeds): the panel would be invisibly
  // clipped, and React + the head observer would still run for nothing.
  if (window.top !== window) return;
  if (hasRelevantMeta()) {
    mount();
    return;
  }
  if (!document.head) return;
  const observer = new MutationObserver(() => {
    if (hasRelevantMeta()) {
      observer.disconnect();
      mount();
    }
  });
  observer.observe(document.head, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 10000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
