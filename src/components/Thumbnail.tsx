import { useState, type CSSProperties } from "react";
import { positionAnchor } from "@/lib/position";
import type { Position } from "@/lib/storage";
import { fontMono, theme, Z_TOP } from "@/styles/theme";

const styles: Record<string, CSSProperties> = {
  btn: {
    position: "fixed",
    zIndex: Z_TOP,
    width: 140,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    border: `1px solid ${theme.border}`,
    background: theme.bgPanel,
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    padding: 0,
    cursor: "pointer",
    fontFamily: fontMono,
    color: theme.text,
    textAlign: "left",
    // Image gets the flexible top region; text sits at the bottom with
    // intrinsic height. Grid (rather than flex) gives <img height="100%">
    // a definite container inside <button>.
    display: "grid",
    gridTemplateRows: "1fr auto",
    transition: "transform 0.2s ease, border-color 0.2s, box-shadow 0.2s",
  },
  textWrap: {
    padding: "10px 10px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minHeight: 0,
    overflow: "hidden",
  },
  title: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.text,
    lineHeight: 1.25,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  description: {
    fontSize: 9.5,
    color: theme.textMuted,
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    borderBottom: `1px solid ${theme.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  fallbackBadge: {
    fontSize: 9,
    letterSpacing: "0.15em",
    color: theme.label,
    textTransform: "uppercase",
    fontWeight: 600,
  },
};

export function Thumbnail({
  title,
  description,
  image,
  position,
  onClick,
}: {
  title: string;
  description: string;
  image: string;
  position: Position;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = image && !imgFailed;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Click to view metadata"
      style={{
        ...styles.btn,
        ...positionAnchor(position),
        transform: hover
          ? "scale(1.04) rotate(-1deg)"
          : "scale(1) rotate(0deg)",
        borderColor: hover
          ? "rgba(120, 120, 120, 0.7)"
          : "rgba(80, 80, 80, 0.5)",
        boxShadow: hover
          ? "0 18px 35px -5px rgba(0, 0, 0, 0.45)"
          : "0 12px 28px -5px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div style={styles.imageWrap}>
        {showImage ? (
          <img
            src={image}
            alt=""
            style={styles.image}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={styles.fallbackBadge}>META</div>
        )}
      </div>
      <div style={styles.textWrap}>
        {title && <div style={styles.title}>{title}</div>}
        {description && <div style={styles.description}>{description}</div>}
        {!title && !description && (
          <div style={styles.description}>Page metadata</div>
        )}
      </div>
    </button>
  );
}
