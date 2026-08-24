import { createRoot } from "react-dom/client";
import { App } from "@/components/App";
import { installHistoryPatch } from "@/lib/spa-nav";
import { TOGGLE_PANEL_EVENT, type Message } from "@/lib/messages";
import { HOST_ELEMENT_ID } from "@/lib/app";
import { shadowStyles } from "@/styles/keyframes";

// Patch history once at script load so SPA route changes are observable
// while the panel is open.
installHistoryPatch();

// Bridge SW → React tree: keyboard command messages become a window event
// the App component listens for. Guard with a Symbol so re-injections
// (after disable → re-enable) never register a duplicate listener.
const LISTENER_FLAG = Symbol.for("ogee-msg-listener-registered");
const w = window as unknown as Window & Record<symbol, boolean>;
if (!w[LISTENER_FLAG]) {
  w[LISTENER_FLAG] = true;
  chrome.runtime?.onMessage.addListener((msg: Message) => {
    if (msg?.type === "toggle-panel" || msg?.type === "open-panel") {
      window.dispatchEvent(new CustomEvent(TOGGLE_PANEL_EVENT));
    }
  });
}

// Content script is injected on-demand via activeTab + scripting.
// Skip cross-origin iframes (ads, embeds): the panel would be invisibly
// clipped, and React would run for nothing.
if (window.top === window && !document.getElementById(HOST_ELEMENT_ID)) {
  const host = document.createElement("div");
  host.id = HOST_ELEMENT_ID;
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = shadowStyles;
  shadow.appendChild(style);

  const reactRoot = document.createElement("div");
  reactRoot.dataset.theme = "dark";
  shadow.appendChild(reactRoot);
  createRoot(reactRoot).render(<App />);
}
