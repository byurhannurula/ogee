import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { positionAnchor } from "@/lib/position";
import type { Position } from "@/lib/storage";
import { fontMono, theme, Z_TOP } from "@/styles/theme";

const PANEL_WIDTH = 420;
const PANEL_MAX_HEIGHT_VH = 85;
const THUMB_WIDTH = 168;
const THUMB_HEIGHT = 128;
const SCROLL_AREA_PADDING_Y = 14 + 18;

const OPEN_DURATION_MS = 360;
const CLOSE_DURATION_MS = 220;
const OPEN_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const CLOSE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const FADE_MS = 180;

const styles: Record<string, CSSProperties> = {
  shell: {
    position: "fixed",
    zIndex: Z_TOP,
    backgroundColor: theme.bgPanel,
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    borderRadius: 10,
    border: `1px solid ${theme.border}`,
    boxShadow:
      "0 25px 50px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.04)",
    overflow: "hidden",
    textAlign: "left",
    fontFamily: fontMono,
    color: theme.text,
    padding: 0,
    fontSize: 14,
    lineHeight: 1.5,
    willChange: "width, height",
  },
  panel: {
    width: PANEL_WIDTH,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 18px 18px",
    scrollbarWidth: "thin",
    scrollbarColor: "#333 transparent",
    minHeight: 0,
  },
  thumb: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  },
};

function useNaturalHeight(
  contentRef: React.RefObject<HTMLDivElement | null>,
  footerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [h, setH] = useState<number | null>(null);
  useLayoutEffect(() => {
    const c = contentRef.current;
    const f = footerRef.current;
    if (!c || !f) return;
    const measure = () =>
      setH(c.offsetHeight + f.offsetHeight + SCROLL_AREA_PADDING_Y);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    ro.observe(f);
    return () => ro.disconnect();
  }, [contentRef, footerRef]);
  return h;
}

export function PeekShell({
  expanded,
  position,
  onOpen,
  thumbnail,
  body,
  footer,
}: {
  expanded: boolean;
  position: Position;
  onOpen: () => void;
  thumbnail: ReactNode;
  body: ReactNode;
  footer: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const naturalHeight = useNaturalHeight(contentRef, footerRef);

  // Detect prop change synchronously so the FIRST render with the new
  // `expanded` value already has `height` in the transition list. State-based
  // detection lags one render behind, which makes the height change snap.
  const prevExpanded = useRef(expanded);
  const justToggled = prevExpanded.current !== expanded;
  if (justToggled) prevExpanded.current = expanded;

  const [animatingHeight, setAnimatingHeight] = useState(false);
  const isFirstMount = useRef(true);
  const duration = expanded ? OPEN_DURATION_MS : CLOSE_DURATION_MS;
  const easing = expanded ? OPEN_EASING : CLOSE_EASING;
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setAnimatingHeight(true);
    const t = setTimeout(() => setAnimatingHeight(false), duration);
    return () => clearTimeout(t);
  }, [expanded, duration]);

  const baseTransition = `width ${duration}ms ${easing}, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)`;
  const transition =
    animatingHeight || justToggled
      ? `${baseTransition}, height ${duration}ms ${easing}`
      : baseTransition;
  const fadeTransition = `opacity ${FADE_MS}ms ease`;

  const expandedHeight =
    naturalHeight !== null
      ? Math.min(
          naturalHeight,
          Math.round((window.innerHeight * PANEL_MAX_HEIGHT_VH) / 100),
        )
      : undefined;

  return (
    <div
      className="mp-peek"
      data-expanded={expanded}
      role={expanded ? "dialog" : "button"}
      tabIndex={expanded ? -1 : 0}
      aria-label={expanded ? undefined : "Open metadata panel"}
      onClick={expanded ? undefined : onOpen}
      onKeyDown={
        expanded
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
      }
      style={{
        ...styles.shell,
        ...positionAnchor(position),
        width: expanded ? PANEL_WIDTH : THUMB_WIDTH,
        height: expanded ? (expandedHeight ?? THUMB_HEIGHT) : THUMB_HEIGHT,
        cursor: expanded ? "default" : "pointer",
        transition,
      }}
    >
      {/* Panel layer — always rendered so its natural height stays measured;
          opacity-faded out when collapsed. Width stays at PANEL_WIDTH so the
          measurement is stable; outer overflow:hidden clips the overhang. */}
      <div
        style={{
          ...styles.panel,
          opacity: expanded ? 1 : 0,
          pointerEvents: expanded ? "auto" : "none",
          transition: fadeTransition,
        }}
      >
        <div style={styles.scrollArea}>
          <div ref={contentRef}>{body}</div>
        </div>
        <div ref={footerRef}>{footer}</div>
      </div>
      {/* Thumbnail layer — image-on-top compact card, always visible above
          the (clipped) panel layer when collapsed. Crossfades out on open. */}
      <div
        style={{
          ...styles.thumb,
          opacity: expanded ? 0 : 1,
          pointerEvents: expanded ? "none" : "auto",
          transition: fadeTransition,
        }}
      >
        {thumbnail}
      </div>
    </div>
  );
}
