import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Field } from "@/components/Field";

describe("Field", () => {
  afterEach(() => cleanup());

  it("renders key and value", () => {
    render(<Field label="og:title" value="Hello World" />);
    expect(screen.getByText("og:title")).toBeTruthy();
    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("renders error badge for severity=error", () => {
    render(<Field label="og:title" value="Test" severity="error" />);
    expect(screen.getByText("error")).toBeTruthy();
  });

  it("renders warn badge for severity=warn", () => {
    render(<Field label="og:title" value="Test" severity="warn" />);
    expect(screen.getByText("warn")).toBeTruthy();
  });

  it("click-to-copy invokes clipboard API", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: { writeText },
    });

    render(<Field label="og:title" value="Copy Me" />);
    const valueEl = screen.getByText("Copy Me");
    fireEvent.click(valueEl);

    // Wait for async clipboard
    await new Promise((r) => setTimeout(r, 0));

    expect(writeText).toHaveBeenCalledWith("Copy Me");
  });

  it("shows 'copied' feedback after click", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<Field label="og:title" value="Copy Me" />);
    const valueEl = screen.getByText("Copy Me");
    fireEvent.click(valueEl);

    // Wait for async clipboard + state update
    await new Promise((r) => setTimeout(r, 0));

    expect(screen.getByText("copied")).toBeTruthy();
  });

  it("returns null when value is empty", () => {
    const { container } = render(<Field label="og:title" value="" />);
    expect(container.firstChild).toBeNull();
  });
});
