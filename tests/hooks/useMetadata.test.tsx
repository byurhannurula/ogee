import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMetadata } from "@/hooks/useMetadata";
import { NAV_EVENT } from "@/lib/spa-nav";

describe("useMetadata", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    document.title = "";
  });

  it("returns null metadata before extraction", () => {
    const { result } = renderHook(() => useMetadata());
    expect(result.current.metadata).toBeNull();
  });

  it("extracts metadata after mount", async () => {
    document.head.innerHTML = `
      <meta property="og:title" content="Test Title">
    `;
    const { result } = renderHook(() => useMetadata());

    await waitFor(() => expect(result.current.metadata).not.toBeNull());
    expect(result.current.metadata?.og.fields[0].value).toBe("Test Title");
  });

  it("re-extracts on SPA navigation event", async () => {
    document.head.innerHTML = `
      <meta property="og:title" content="Initial">
    `;
    const { result } = renderHook(() => useMetadata());

    await waitFor(() => expect(result.current.metadata).not.toBeNull());

    document.head.innerHTML = `
      <meta property="og:title" content="Updated">
    `;
    window.dispatchEvent(new Event(NAV_EVENT));

    await waitFor(() =>
      expect(result.current.metadata?.og.fields[0].value).toBe("Updated"),
    );
  });

  it("metadata is null when no metadata tags", async () => {
    const { result } = renderHook(() => useMetadata());

    await waitFor(() => expect(result.current.metadata).not.toBeNull());
    // page group always has title/url/lang, but og/twitter/general will be empty
    expect(result.current.metadata?.og.hasData).toBe(false);
    expect(result.current.metadata?.page.hasData).toBe(true);
  });
});
