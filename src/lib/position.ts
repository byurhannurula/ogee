import type { CSSProperties } from "react";
import type { Position } from "./storage";

const OFFSET = 20;

/**
 * Returns absolute corner anchors for a fixed-position element. Used by
 * both `Thumbnail` and `Panel` so they stay locked to the same corner.
 */
export function positionAnchor(pos: Position): CSSProperties {
  switch (pos) {
    case "bottom-right":
      return { bottom: OFFSET, right: OFFSET };
    case "top-left":
      return { top: OFFSET, left: OFFSET };
    case "top-right":
      return { top: OFFSET, right: OFFSET };
    case "bottom-left":
    default:
      return { bottom: OFFSET, left: OFFSET };
  }
}

/**
 * Matches the corner anchor so the panel's open/close scale animation
 * grows out of the card's anchor.
 */
export function transformOriginFor(pos: Position): string {
  switch (pos) {
    case "bottom-right":
      return "bottom right";
    case "top-left":
      return "top left";
    case "top-right":
      return "top right";
    case "bottom-left":
    default:
      return "bottom left";
  }
}
