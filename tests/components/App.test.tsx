import { afterEach, describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { App } from "@/components/App";
import * as useMetadataModule from "@/hooks/useMetadata";
import * as useSettingsModule from "@/hooks/useSettings";
import { TOGGLE_PANEL_EVENT } from "@/lib/messages";

function mockMetadata() {
  return {
    og: {
      name: "Open Graph",
      fields: [{ key: "og:title", value: "Test Title" }],
      hasData: true,
    },
    twitter: { name: "Twitter", fields: [], hasData: false },
    general: { name: "General", fields: [], hasData: false },
    links: { name: "Links", fields: [], hasData: false },
    jsonld: { name: "JSON-LD", fields: [], hasData: false },
    page: {
      name: "Page",
      fields: [{ key: "title", value: "Page Title" }],
      hasData: true,
    },
  };
}

describe("App", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing when no metadata", () => {
    vi.spyOn(useMetadataModule, "useMetadata").mockReturnValue({
      metadata: null,
      enabled: true,
    });
    vi.spyOn(useSettingsModule, "useSettings").mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      position: "bottom-left",
      showValidation: false,
      showTools: false,
    });

    const { container } = render(<App />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when disabled", () => {
    vi.spyOn(useMetadataModule, "useMetadata").mockReturnValue({
      metadata: mockMetadata() as ReturnType<
        typeof useMetadataModule.useMetadata
      >["metadata"],
      enabled: false,
    });
    vi.spyOn(useSettingsModule, "useSettings").mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      position: "bottom-left",
      showValidation: false,
      showTools: false,
    });

    const { container } = render(<App />);
    expect(container.firstChild).toBeNull();
  });

  it("renders thumbnail by default", () => {
    vi.spyOn(useMetadataModule, "useMetadata").mockReturnValue({
      metadata: mockMetadata() as ReturnType<
        typeof useMetadataModule.useMetadata
      >["metadata"],
      enabled: true,
    });
    vi.spyOn(useSettingsModule, "useSettings").mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      position: "bottom-left",
      showValidation: false,
      showTools: false,
    });

    render(<App />);
    // Should start as thumbnail (collapsed)
    expect(screen.queryByRole("dialog")).toBeFalsy();
    expect(
      screen.getByRole("button", { name: /open metadata panel/i }),
    ).toBeTruthy();
  });

  it("expands panel on thumbnail click", () => {
    vi.spyOn(useMetadataModule, "useMetadata").mockReturnValue({
      metadata: mockMetadata() as ReturnType<
        typeof useMetadataModule.useMetadata
      >["metadata"],
      enabled: true,
    });
    vi.spyOn(useSettingsModule, "useSettings").mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      position: "bottom-left",
      showValidation: false,
      showTools: false,
    });

    render(<App />);
    // Should start as thumbnail
    expect(screen.queryByRole("dialog")).toBeFalsy();

    // Click thumbnail to expand
    const thumb = screen.getByRole("button", { name: /open metadata panel/i });
    fireEvent.click(thumb);

    expect(screen.queryByRole("dialog")).toBeTruthy();
  });

  it("collapses on ESC key", () => {
    vi.spyOn(useMetadataModule, "useMetadata").mockReturnValue({
      metadata: mockMetadata() as ReturnType<
        typeof useMetadataModule.useMetadata
      >["metadata"],
      enabled: true,
    });
    vi.spyOn(useSettingsModule, "useSettings").mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      position: "bottom-left",
      showValidation: false,
      showTools: false,
    });

    render(<App />);
    // Start expanded
    const thumb = screen.getByRole("button", { name: /open metadata panel/i });
    fireEvent.click(thumb);
    expect(screen.queryByRole("dialog")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeFalsy();
  });

  it("toggles on TOGGLE_PANEL_EVENT", async () => {
    vi.spyOn(useMetadataModule, "useMetadata").mockReturnValue({
      metadata: mockMetadata() as ReturnType<
        typeof useMetadataModule.useMetadata
      >["metadata"],
      enabled: true,
    });
    vi.spyOn(useSettingsModule, "useSettings").mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      position: "bottom-left",
      showValidation: false,
      showTools: false,
    });

    render(<App />);

    // Should start as thumbnail
    expect(screen.queryByRole("dialog")).toBeFalsy();

    // Toggle to expanded
    await act(async () => {
      window.dispatchEvent(new CustomEvent(TOGGLE_PANEL_EVENT));
    });

    expect(screen.queryByRole("dialog")).toBeTruthy();

    // Toggle back to thumbnail
    await act(async () => {
      window.dispatchEvent(new CustomEvent(TOGGLE_PANEL_EVENT));
    });

    expect(screen.queryByRole("dialog")).toBeFalsy();
  });
});
