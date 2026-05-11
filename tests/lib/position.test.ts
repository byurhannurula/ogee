import { describe, expect, it } from "vitest";
import { positionAnchor } from "@/lib/position";

describe("positionAnchor", () => {
  it("returns bottom-left by default", () => {
    const result = positionAnchor("bottom-left");
    expect(result).toEqual({ bottom: 20, left: 20 });
  });

  it("returns bottom-right", () => {
    const result = positionAnchor("bottom-right");
    expect(result).toEqual({ bottom: 20, right: 20 });
  });

  it("returns top-left", () => {
    const result = positionAnchor("top-left");
    expect(result).toEqual({ top: 20, left: 20 });
  });

  it("returns top-right", () => {
    const result = positionAnchor("top-right");
    expect(result).toEqual({ top: 20, right: 20 });
  });
});
