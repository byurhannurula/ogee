import type { CSSProperties } from "react";
import type { Position } from "./storage";

const OFFSET = 20;

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
