import { beforeEach, describe, expect, it, vi } from "vitest";
import { storage } from "@/lib/storage";

// Mock chrome.storage.local
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
      remove: vi.fn((keys: string | string[]) => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        for (const key of keyArray) delete mockStorage[key];
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

describe("storage", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    mockListeners.clear();
  });

  it("getDefaultEnabled returns false by default", async () => {
    const result = await storage.getDefaultEnabled();
    expect(result).toBe(false);
  });

  it("setDefaultEnabled persists value", async () => {
    await storage.setDefaultEnabled(false);
    const result = await storage.getDefaultEnabled();
    expect(result).toBe(false);
  });

  it("getHostOverrides returns empty object by default", async () => {
    const result = await storage.getHostOverrides();
    expect(result).toEqual({});
  });

  it("setHostOverride adds override", async () => {
    await storage.setHostOverride("example.com", false);
    const result = await storage.getHostOverrides();
    expect(result).toEqual({ "example.com": false });
  });

  it("setHostOverride(null) deletes override", async () => {
    await storage.setHostOverride("example.com", false);
    await storage.setHostOverride("example.com", null);
    const result = await storage.getHostOverrides();
    expect(result).toEqual({});
  });

  it("getEffectiveEnabled uses override over default", async () => {
    await storage.setDefaultEnabled(true);
    await storage.setHostOverride("example.com", false);
    const result = await storage.getEffectiveEnabled("example.com");
    expect(result).toBe(false);
  });

  it("getEffectiveEnabled falls back to default when no override", async () => {
    await storage.setDefaultEnabled(false);
    const result = await storage.getEffectiveEnabled("example.com");
    expect(result).toBe(false);
  });

  it("invalid stored value falls back to default", async () => {
    mockStorage["ogee-theme"] = "invalid-theme";
    const result = await storage.getTheme();
    expect(result).toBe("dark"); // default
  });

  it("onAnyChange fires when relevant keys change", async () => {
    const cb = vi.fn();
    const unsubscribe = storage.onAnyChange(cb);

    fireChange({
      "ogee-theme": { newValue: "light" },
    });

    expect(cb).toHaveBeenCalledWith({ "ogee-theme": "light" });
    unsubscribe();
  });

  it("onAnyChange ignores unrelated storage changes", async () => {
    const cb = vi.fn();
    const unsubscribe = storage.onAnyChange(cb);

    fireChange({
      "unrelated-key": { newValue: "whatever" },
    });

    expect(cb).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("onAnyChange unsubscribe stops receiving events", async () => {
    const cb = vi.fn();
    const unsubscribe = storage.onAnyChange(cb);
    unsubscribe();

    fireChange({
      "ogee-theme": { newValue: "light" },
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it("onAnyChange skips invalid values", async () => {
    const cb = vi.fn();
    const unsubscribe = storage.onAnyChange(cb);

    fireChange({
      "ogee-theme": { newValue: 123 }, // invalid type
    });

    expect(cb).not.toHaveBeenCalled();
    unsubscribe();
  });
});
