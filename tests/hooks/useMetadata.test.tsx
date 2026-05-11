import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMetadata } from "@/hooks/useMetadata";
import { NAV_EVENT } from "@/lib/spa-nav";

const mockStorage: Record<string, unknown> = {};

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
      set: vi.fn(),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  },
});

describe("useMetadata", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    document.title = "";
  });

  it("returns enabled=true by default", async () => {
    const { result } = renderHook(() => useMetadata());

    await waitFor(() => expect(result.current.enabled).toBe(true));
  });

  it("extracts metadata after mount", async () => {
    document.head.innerHTML = `
      <meta property="og:title" content="Test Title">
    `;
    const { result } = renderHook(() => useMetadata());

    await waitFor(() => expect(result.current.hasData).toBe(true));
    expect(result.current.metadata?.og.fields[0].value).toBe("Test Title");
  });

  it("re-extracts on SPA navigation event", async () => {
    document.head.innerHTML = `
      <meta property="og:title" content="Initial">
    `;
    const { result } = renderHook(() => useMetadata());

    await waitFor(() => expect(result.current.hasData).toBe(true));

    document.head.innerHTML = `
      <meta property="og:title" content="Updated">
    `;
    window.dispatchEvent(new Event(NAV_EVENT));

    await waitFor(() =>
      expect(result.current.metadata?.og.fields[0].value).toBe("Updated"),
    );
  });

  it("hasData is false when no metadata", async () => {
    const { result } = renderHook(() => useMetadata());

    await waitFor(() => expect(result.current.hasData).toBe(false));
  });
});
