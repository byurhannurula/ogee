import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

describe("useEscapeKey", () => {
  it("calls callback when Escape is pressed and active=true", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(true, callback));

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not call callback when active=false", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(false, callback));

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not call callback for non-Escape keys", () => {
    const callback = vi.fn();
    renderHook(() => useEscapeKey(true, callback));

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it("cleans up listener on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(true, callback));
    unmount();

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });
});
