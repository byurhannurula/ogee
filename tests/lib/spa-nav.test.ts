import { beforeEach, describe, expect, it, vi } from "vitest";
import { installHistoryPatch, NAV_EVENT } from "@/lib/spa-nav";

const origPushState = history.pushState.bind(history);
const origReplaceState = history.replaceState.bind(history);

describe("installHistoryPatch", () => {
  beforeEach(() => {
    // Restore original methods so each test starts clean.
    history.pushState = origPushState;
    history.replaceState = origReplaceState;
    // Remove the patch flag so installHistoryPatch will re-apply.
    const flag = Symbol.for("ogee-history-patched");
    const h = history as History & Record<symbol, boolean | undefined>;
    delete h[flag];
  });

  it("dispatches NAV_EVENT on pushState", () => {
    const listener = vi.fn();
    window.addEventListener(NAV_EVENT, listener);
    installHistoryPatch();
    history.pushState({}, "", "#/test");
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(NAV_EVENT, listener);
  });

  it("dispatches NAV_EVENT on replaceState", () => {
    const listener = vi.fn();
    window.addEventListener(NAV_EVENT, listener);
    installHistoryPatch();
    history.replaceState({}, "", "#/test");
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(NAV_EVENT, listener);
  });

  it("original pushState still works", () => {
    installHistoryPatch();
    history.pushState({ foo: "bar" }, "", "#/original");
    expect(history.state).toEqual({ foo: "bar" });
  });

  it("double-install is a no-op", () => {
    installHistoryPatch();
    const listener = vi.fn();
    window.addEventListener(NAV_EVENT, listener);
    installHistoryPatch(); // second call should do nothing
    history.pushState({}, "", "#/double");
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(NAV_EVENT, listener);
  });
});
