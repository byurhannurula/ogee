import { storage } from "@/lib/storage";
import { queryActiveTab, queryTabs } from "@/lib/tabs";
import type { Message } from "@/lib/messages";
import { SW_LOG_PREFIX, DEV_RELOAD_PENDING_KEY } from "@/lib/app";

// Service worker. Owns keyboard shortcuts: forwards "toggle-panel" to the
// active tab's content script, and flips the per-host override for
// "toggle-host-enabled" directly via chrome.storage (the content script
// reactively picks up the change).

chrome.commands?.onCommand.addListener(async (command) => {
  console.log(`${SW_LOG_PREFIX} command fired:`, command);
  const [tab] = await queryActiveTab();
  if (!tab?.id || !tab.url) {
    console.log(`${SW_LOG_PREFIX} no active tab; skipping`);
    return;
  }

  if (command === "toggle-panel") {
    if (!tab.id) return;

    let host: string;
    try {
      host = new URL(tab.url).host;
    } catch {
      return;
    }
    if (!host) return;

    const enabled = await storage.getEffectiveEnabled(host);
    if (!enabled) {
      console.log(`${SW_LOG_PREFIX} site disabled, skipping`);
      return;
    }

    const msg: Message = { type: "toggle-panel" };
    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      })
      .then(() => {
        chrome.tabs.sendMessage(tab.id as number, msg).catch((err: unknown) => {
          console.log(
            `${SW_LOG_PREFIX} sendMessage failed:`,
            err instanceof Error ? err.message : err,
          );
        });
      })
      .catch((err: unknown) => {
        console.log(
          `${SW_LOG_PREFIX} script injection failed:`,
          err instanceof Error ? err.message : err,
        );
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
    console.log(
      `${SW_LOG_PREFIX} toggle-host-enabled host=${host} ${current} -> ${next}`,
    );
    // If new state matches default, clear the override; else set explicit.
    await storage.setHostOverride(host, next === defaultEnabled ? null : next);

    // If enabling, inject content script and show thumbnail immediately.
    if (next && tab.id) {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        })
        .then(() => {
          chrome.tabs
            .sendMessage(tab.id as number, { type: "open-panel" })
            .catch((err: unknown) => {
              console.log(
                `${SW_LOG_PREFIX} sendMessage failed:`,
                err instanceof Error ? err.message : err,
              );
            });
        })
        .catch((err: unknown) => {
          console.log(
            `${SW_LOG_PREFIX} script injection failed:`,
            err instanceof Error ? err.message : err,
          );
        });
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log(`${SW_LOG_PREFIX} installed/reloaded`);
  chrome.commands?.getAll().then((cmds) => {
    console.log(`${SW_LOG_PREFIX} registered commands:`, cmds);
  });
});

// Dev-only: connect to the build script's SSE reload endpoint. On signal,
// reload all http(s) tabs (so content scripts re-inject) and then reload
// the extension itself. The URL is stamped at build time and is "" in prod
// so this whole block tree-shakes away.
const RELOAD_URL = process.env.OGEE_RELOAD_URL;

if (RELOAD_URL) {
  const reloadAllTabs = async () => {
    const tabs = await queryTabs({});
    await Promise.all(
      tabs
        .filter((t) => t.id != null && /^https?:/.test(t.url ?? ""))
        .map((t) => chrome.tabs.reload(t.id as number).catch(() => {})),
    );
  };

  const markReloadPending = async () => {
    await chrome.storage.local.set({
      [DEV_RELOAD_PENDING_KEY]: Date.now(),
    });
  };

  const consumePendingReload = async () => {
    const stored = await chrome.storage.local.get(DEV_RELOAD_PENDING_KEY);
    if (!stored[DEV_RELOAD_PENDING_KEY]) return false;
    await chrome.storage.local.remove(DEV_RELOAD_PENDING_KEY);
    return true;
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
            await markReloadPending();
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

  const bootstrapDevReload = async () => {
    if (await consumePendingReload()) {
      await reloadAllTabs();
    }
    watchReload();
  };

  bootstrapDevReload();
}
