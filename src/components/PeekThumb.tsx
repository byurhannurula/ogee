import { useEffect, useState, type CSSProperties } from "react";
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
    transition: "opacity 0.18s ease",
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
  // Fade behaviour only kicks in once we've successfully loaded an image
  // at least once. On first mount we let the browser render progressively
  // — hiding it would leave the user staring at a blank box during the
  // initial network fetch (1-3s on cold cache).
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);
  const hasEverLoaded = loadedUrl !== null;
  const isLoaded = loadedUrl === image;
  const showProgressiveLoad = !hasEverLoaded;

  // Reset error state when the URL changes so a previously-broken image
  // doesn't poison a fresh extract on SPA nav.
  useEffect(() => {
    setErrored(false);
  }, [image]);

  return (
    <div style={styles.card}>
      {image && !errored ? (
        <div style={styles.imageWrap}>
          <img
            key={image}
            src={image}
            alt=""
            style={{
              ...styles.image,
              opacity: showProgressiveLoad || isLoaded ? 1 : 0,
            }}
            onLoad={() => {
              setErrored(false);
              setLoadedUrl(image);
            }}
            onError={() => setErrored(true)}
          />
        </div>
      ) : (
        <div style={styles.fallback}>{errored ? "IMG ERR" : "OG"}</div>
      )}
      {title && (
        <div style={styles.textWrap}>
          <div style={styles.title}>{title}</div>
        </div>
      )}
    </div>
  );
}
