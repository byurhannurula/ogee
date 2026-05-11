import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Tabs } from "@/components/Tabs";

const TABS = [
  { key: "og", label: "OG" },
  { key: "twitter", label: "Twitter" },
  { key: "general", label: "Meta" },
];

describe("Tabs", () => {
  afterEach(() => cleanup());

  it("renders tab buttons with labels", () => {
    render(
      <Tabs
        tabs={TABS}
        activeTab="og"
        onTabChange={vi.fn()}
        onCollapse={vi.fn()}
        position="bottom-left"
      />,
    );
    expect(screen.getByRole("tab", { name: "OG" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Twitter" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Meta" })).toBeTruthy();
  });

  it("active tab has aria-selected=true", () => {
    render(
      <Tabs
        tabs={TABS}
        activeTab="og"
        onTabChange={vi.fn()}
        onCollapse={vi.fn()}
        position="bottom-left"
      />,
    );
    expect(
      screen.getByRole("tab", { name: "OG" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("tab", { name: "Twitter" })
        .getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("arrow right moves to next tab", () => {
    const onTabChange = vi.fn();
    render(
      <Tabs
        tabs={TABS}
        activeTab="og"
        onTabChange={onTabChange}
        onCollapse={vi.fn()}
        position="bottom-left"
      />,
    );

    const ogTab = screen.getByRole("tab", { name: "OG" });
    fireEvent.keyDown(ogTab, { key: "ArrowRight" });

    expect(onTabChange).toHaveBeenCalledWith("twitter");
  });

  it("arrow left wraps to last tab", () => {
    const onTabChange = vi.fn();
    render(
      <Tabs
        tabs={TABS}
        activeTab="og"
        onTabChange={onTabChange}
        onCollapse={vi.fn()}
        position="bottom-left"
      />,
    );

    const ogTab = screen.getByRole("tab", { name: "OG" });
    fireEvent.keyDown(ogTab, { key: "ArrowLeft" });

    expect(onTabChange).toHaveBeenCalledWith("general");
  });

  it("Home key jumps to first tab", () => {
    const onTabChange = vi.fn();
    render(
      <Tabs
        tabs={TABS}
        activeTab="general"
        onTabChange={onTabChange}
        onCollapse={vi.fn()}
        position="bottom-left"
      />,
    );

    const generalTab = screen.getByRole("tab", { name: "Meta" });
    fireEvent.keyDown(generalTab, { key: "Home" });

    expect(onTabChange).toHaveBeenCalledWith("og");
  });

  it("End key jumps to last tab", () => {
    const onTabChange = vi.fn();
    render(
      <Tabs
        tabs={TABS}
        activeTab="og"
        onTabChange={onTabChange}
        onCollapse={vi.fn()}
        position="bottom-left"
      />,
    );

    const ogTab = screen.getByRole("tab", { name: "OG" });
    fireEvent.keyDown(ogTab, { key: "End" });

    expect(onTabChange).toHaveBeenCalledWith("general");
  });

  it("click changes tab", () => {
    const onTabChange = vi.fn();
    render(
      <Tabs
        tabs={TABS}
        activeTab="og"
        onTabChange={onTabChange}
        onCollapse={vi.fn()}
        position="bottom-left"
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Twitter" }));
    expect(onTabChange).toHaveBeenCalledWith("twitter");
  });
});
