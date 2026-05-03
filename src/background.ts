import { storage } from "@/lib/storage";
import type { Message } from "@/lib/messages";

// Service worker. Owns keyboard shortcuts: forwards "toggle-panel" to the
// active tab's content script, and flips the per-host override for
// "toggle-host-enabled" directly via chrome.storage (the content script
// reactively picks up the change).

chrome.commands?.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id || !tab.url) return;

  if (command === "toggle-panel") {
    const msg: Message = { type: "toggle-panel" };
    chrome.tabs.sendMessage(tab.id, msg).catch(() => {
      // Content script may not be injected (e.g. chrome:// pages). Ignore.
    });
    return;
  }

  if (command === "toggle-host-enabled") {
    let host: string;
    try {
      host = new URL(tab.url).host;
    } catch {
      return;
    }
    if (!host) return;
    const current = await storage.getEffectiveEnabled(host);
    const defaultEnabled = await storage.getDefaultEnabled();
    const next = !current;
    // If new state matches default, clear the override; else set explicit.
    await storage.setHostOverride(host, next === defaultEnabled ? null : next);
  }
});

// Dev-only: connect to the build script's SSE reload endpoint. On signal,
// reload all http(s) tabs (so content scripts re-inject) and then reload
// the extension itself. The URL is stamped at build time and is "" in prod
// so this whole block tree-shakes away.
const RELOAD_URL = process.env.TAGPEEK_RELOAD_URL;

if (RELOAD_URL) {
  const reloadAllTabs = async () => {
    const tabs = await chrome.tabs.query({});
    await Promise.all(
      tabs
        .filter((t) => t.id != null && /^https?:/.test(t.url ?? ""))
        .map((t) => chrome.tabs.reload(t.id as number).catch(() => {})),
    );
  };

  const watchReload = async () => {
    while (true) {
      try {
        const res = await fetch(RELOAD_URL);
        if (!res.body) throw new Error("no body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          if (buffer.includes("data: reload")) {
            await reloadAllTabs();
            chrome.runtime.reload();
            return;
          }
        }
      } catch {
        // Server not running yet or connection dropped — retry.
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  };

  watchReload();
}
