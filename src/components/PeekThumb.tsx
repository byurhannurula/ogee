import type { CSSProperties } from "react";
import { fontMono, theme } from "@/styles/theme";

const styles: Record<string, CSSProperties> = {
  card: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    aspectRatio: "1.91 / 1",
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.25)",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  textWrap: {
    padding: "5px 7px 7px",
    flexShrink: 0,
  },
  title: {
    fontSize: 9,
    fontWeight: 600,
    color: theme.text,
    lineHeight: 1.3,
    fontFamily: fontMono,
    letterSpacing: "0.01em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  fallback: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.textDim,
    fontSize: 10,
    fontFamily: fontMono,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
};

export function PeekThumb({ image, title }: { image: string; title: string }) {
  return (
    <div style={styles.card}>
      {image ? (
        <div style={styles.imageWrap}>
          <img
            src={image}
            alt=""
            style={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div style={styles.fallback}>OG</div>
      )}
      {title && (
        <div style={styles.textWrap}>
          <div style={styles.title}>{title}</div>
        </div>
      )}
    </div>
  );
}
