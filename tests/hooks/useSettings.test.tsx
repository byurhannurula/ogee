import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSettings } from "@/hooks/useSettings";

const mockStorage: Record<string, unknown> = {};
const mockListeners = new Set<
  (changes: Record<string, { newValue?: unknown; oldValue?: unknown }>) => void
>();

vi.stubGlobal("chrome", {
  storage: {
    local: {
      get: vi.fn((keys: string | string[]) => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};
        for (const key of keyArray) {
          if (key in mockStorage) result[key] = mockStorage[key];
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        for (const [key, value] of Object.entries(items)) {
          mockStorage[key] = value;
        }
        return Promise.resolve();
      }),
      onChanged: {
        addListener: vi.fn(
          (cb: typeof mockListeners extends Set<infer T> ? T : never) => {
            mockListeners.add(cb);
          },
        ),
        removeListener: vi.fn(
          (cb: typeof mockListeners extends Set<infer T> ? T : never) => {
            mockListeners.delete(cb);
          },
        ),
      },
    },
  },
});

function fireChange(
  changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
) {
  for (const listener of mockListeners) listener(changes);
}

describe("useSettings", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    mockListeners.clear();
  });

  it("reads theme from storage", async () => {
    mockStorage["ogee-theme"] = "light";
    const { result } = renderHook(() => useSettings());

    await waitFor(() => expect(result.current.theme).toBe("light"));
  });

  it("reads position from storage", async () => {
    mockStorage["ogee-position"] = "top-right";
    const { result } = renderHook(() => useSettings());

    await waitFor(() => expect(result.current.position).toBe("top-right"));
  });

  it("defaults to dark theme when storage is empty", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => expect(result.current.theme).toBe("dark"));
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("subscribes to storage changes", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => expect(result.current.theme).toBe("dark"));

    fireChange({
      "ogee-theme": { newValue: "light" },
    });

    await waitFor(() => expect(result.current.theme).toBe("light"));
  });

  it("resolves auto theme from matchMedia", async () => {
    mockStorage["ogee-theme"] = "auto";

    // Mock matchMedia to return light
    const mqList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => mqList),
    );

    const { result } = renderHook(() => useSettings());

    await waitFor(() => expect(result.current.resolvedTheme).toBe("light"));
  });
});
