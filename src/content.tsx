import { useEffect, useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { extractAllMetadata, type MetaData, type MetaField } from "./lib/metadata";

// ─── Styles ───

const theme = {
  bg: "#0f0f0f",
  bgPanel: "rgba(15, 15, 15, 0.96)",
  border: "#1a1a1a",
  borderLight: "#2a2a2a",
  text: "#e5e5e5",
  textMuted: "#a0a0a0",
  textDim: "#666666",
  accent: "#c4a35a",
  accentMuted: "rgba(196, 163, 90, 0.85)",
};

const S: Record<string, React.CSSProperties> = {
  panel: {
    position: "fixed",
    bottom: 16,
    left: 16,
    width: 380,
    maxHeight: "85vh",
    backgroundColor: theme.bgPanel,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 12,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.04)",
    border: `1px solid ${theme.border}`,
    overflow: "hidden",
    textAlign: "left",
    zIndex: 2147483647,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: theme.text,
    display: "flex",
    flexDirection: "column",
    fontSize: 14,
    lineHeight: 1.5,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderBottom: `1px solid ${theme.border}`,
    flexShrink: 0,
  },
  urlRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 11,
    color: theme.textMuted,
    overflow: "hidden",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: theme.textDim,
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    transition: "color 0.15s, background 0.15s",
    flexShrink: 0,
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 16px",
    scrollbarWidth: "thin",
    scrollbarColor: "#333 transparent",
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: theme.textDim,
    marginBottom: 3,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    fontWeight: 500,
  },
  fieldValue: {
    fontSize: 13,
    color: theme.text,
    wordBreak: "break-word" as const,
    lineHeight: 1.5,
  },
  row: {
    display: "flex",
    gap: 32,
    marginBottom: 14,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    border: `1px solid ${theme.border}`,
    backgroundColor: "#050505",
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "cover" as const,
    display: "block",
  },
  imageCaption: {
    padding: "12px 14px",
    borderTop: `1px solid ${theme.border}`,
  },
  imageTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.accentMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: 4,
  },
  imageDesc: {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  },
  tabs: {
    display: "flex",
    alignItems: "center",
    borderTop: `1px solid ${theme.border}`,
    padding: "0 6px",
    flexShrink: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  tab: {
    flex: 1,
    padding: "10px 0",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "color 0.15s",
    fontFamily: 'inherit',
  },
  tabActive: {
    color: theme.text,
    borderTop: "2px solid #4a4a4a",
    marginTop: -1,
  },
  tabInactive: {
    color: theme.textDim,
  },
  peekBtn: {
    position: "fixed",
    bottom: 16,
    left: 16,
    zIndex: 2147483647,
    width: 64,
    height: 40,
    borderRadius: 6,
    overflow: "hidden",
    border: `1px solid rgba(60, 60, 60, 0.5)`,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
    background: "none",
    padding: 0,
    cursor: "pointer",
    transition: "transform 0.15s ease, border-color 0.15s",
  },
  peekImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
  },
  peekOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    transition: "background-color 0.15s",
    pointerEvents: "none",
  },
  codeBlock: {
    backgroundColor: "#0a0a0a",
    border: `1px solid ${theme.border}`,
    borderRadius: 6,
    padding: 10,
    fontSize: 11,
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    color: theme.textMuted,
    overflow: "auto",
    maxHeight: 200,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
  noData: {
    padding: "20px 0",
    textAlign: "center" as const,
    color: theme.textDim,
    fontSize: 13,
  },
};

// ─── Components ───

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={S.field}>
      <div style={S.fieldLabel}>{label}</div>
      <div style={S.fieldValue}>{value}</div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...S.tab,
        ...(active ? S.tabActive : S.tabInactive),
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = theme.textMuted;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = theme.textDim;
      }}
    >
      {label}
    </button>
  );
}

function TabPanel({
  group,
  imageUrl,
}: {
  group: { name: string; fields: MetaField[]; hasData: boolean };
  imageUrl?: string;
}) {
  if (!group.hasData) {
    return <div style={S.noData}>No {group.name} metadata found</div>;
  }

  // Extract common fields for special rendering
  const fieldMap = new Map(group.fields.map((f) => [f.key, f.value]));
  const title = fieldMap.get("og:title") || fieldMap.get("twitter:title") || fieldMap.get("title") || "";
  const description = fieldMap.get("og:description") || fieldMap.get("twitter:description") || fieldMap.get("description") || "";
  const image = fieldMap.get("og:image") || fieldMap.get("twitter:image") || imageUrl || "";
  const imageType = fieldMap.get("og:image:type") || "";
  const imageWidth = fieldMap.get("og:image:width") || fieldMap.get("twitter:image:width") || "";
  const imageHeight = fieldMap.get("og:image:height") || fieldMap.get("twitter:image:height") || "";
  const siteName = fieldMap.get("og:site_name") || fieldMap.get("twitter:site") || "";
  const url = fieldMap.get("og:url") || fieldMap.get("twitter:url") || fieldMap.get("url") || "";

  // For JSON-LD, show raw JSON
  if (group.name === "JSON-LD") {
    return (
      <div>
        {group.fields.map((field, i) => (
          <div key={i} style={S.field}>
            <div style={S.fieldLabel}>{field.key}</div>
            <pre style={S.codeBlock}>{field.value}</pre>
          </div>
        ))}
      </div>
    );
  }

  // Special layout for OG tab with image preview
  const isOgTab = group.name === "Open Graph";
  const isTwitterTab = group.name === "Twitter";
  const showImagePreview = (isOgTab || isTwitterTab) && image;

  return (
    <div>
      {/* Primary fields */}
      {title && <Field label={isOgTab ? "og:title" : isTwitterTab ? "twitter:title" : "title"} value={title} />}
      {description && (
        <Field
          label={isOgTab ? "og:description" : isTwitterTab ? "twitter:description" : "description"}
          value={description}
        />
      )}
      {imageType && <Field label="og:image:type" value={imageType} />}

      {/* Image dimensions */}
      {(imageWidth || imageHeight) && (
        <div style={S.row}>
          {imageWidth && (
            <div>
              <div style={S.fieldLabel}>{isOgTab ? "og:image:width" : "image:width"}</div>
              <div style={S.fieldValue}>{imageWidth}</div>
            </div>
          )}
          {imageHeight && (
            <div>
              <div style={S.fieldLabel}>{isOgTab ? "og:image:height" : "image:height"}</div>
              <div style={S.fieldValue}>{imageHeight}</div>
            </div>
          )}
        </div>
      )}

      {/* Image preview */}
      {showImagePreview && (
        <div style={S.field}>
          <div style={S.fieldLabel}>{isOgTab ? "og:image" : "twitter:image"}</div>
          <div style={S.imageContainer}>
            <img
              src={image}
              alt="Preview"
              style={S.image}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {(siteName || title || description) && (
              <div style={S.imageCaption}>
                {siteName && <div style={S.imageTitle}>{siteName}</div>}
                <div style={S.imageDesc}>{description || title}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remaining fields */}
      {group.fields
        .filter((f) => {
          const key = f.key;
          if (key === "og:title" || key === "twitter:title" || key === "title") return false;
          if (key === "og:description" || key === "twitter:description" || key === "description") return false;
          if (key === "og:image" || key === "twitter:image") return false;
          if (key === "og:image:type" || key === "twitter:image:type") return false;
          if (key === "og:image:width" || key === "twitter:image:width") return false;
          if (key === "og:image:height" || key === "twitter:image:height") return false;
          if (key === "og:site_name" || key === "twitter:site") return false;
          if (key === "og:url" || key === "twitter:url" || key === "url") return false;
          return true;
        })
        .map((field, i) => (
          <Field key={i} label={field.key} value={field.value} />
        ))}
    </div>
  );
}

function PeekThumbnail({ image, onClick }: { image: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        ...S.peekBtn,
        transform: hover ? "scale(1.05)" : "scale(1)",
        borderColor: hover ? "rgba(100, 100, 100, 0.6)" : "rgba(60, 60, 60, 0.5)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Click to view metadata"
    >
      <img
        src={image}
        alt="Preview"
        style={S.peekImg}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div
        style={{
          ...S.peekOverlay,
          backgroundColor: hover ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.15)",
        }}
      />
    </button>
  );
}

// ─── Main Component ───

type TabKey = "og" | "twitter" | "general" | "links" | "jsonld";

const TAB_ORDER: { key: TabKey; label: string }[] = [
  { key: "og", label: "OG" },
  { key: "twitter", label: "Twitter" },
  { key: "general", label: "Meta" },
  { key: "links", label: "Links" },
  { key: "jsonld", label: "JSON-LD" },
];

export default function MetaPeekContent() {
  const [metadata, setMetadata] = useState<MetaData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("og");
  const [isExpanded, setIsExpanded] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [hasData, setHasData] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const extract = useCallback(() => {
    const data = extractAllMetadata();
    const anyData = Object.values(data).some((g) => g.hasData);
    setMetadata(data);
    setHasData(anyData);
  }, []);

  useEffect(() => {
    // Check if enabled
    chrome.storage?.local.get("metapeek-enabled").then((res) => {
      if (typeof res["metapeek-enabled"] === "boolean") {
        setEnabled(res["metapeek-enabled"]);
      }
    });

    // Listen for storage changes
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes["metapeek-enabled"]) {
        setEnabled(changes["metapeek-enabled"].newValue);
      }
    };
    chrome.storage?.local.onChanged.addListener(listener);

    extract();

    // SPA navigation support
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(extract, 500);
      }
    });
    observer.observe(document, { subtree: true, childList: true });

    return () => {
      chrome.storage?.local.onChanged.removeListener(listener);
      observer.disconnect();
    };
  }, [extract]);

  // Click outside to close
  useEffect(() => {
    if (!isExpanded) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isExpanded]);

  // Escape to close
  useEffect(() => {
    if (!isExpanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isExpanded]);

  if (!enabled || !hasData || !metadata) return null;

  const currentGroup = metadata[activeTab];
  const previewImage = metadata.og.fields.find((f) => f.key === "og:image")?.value
    || metadata.twitter.fields.find((f) => f.key === "twitter:image")?.value
    || "";

  return (
    <div>
      {isExpanded ? (
        <div ref={panelRef} style={S.panel}>
          {/* Header */}
          <div style={S.header}>
            <div style={S.urlRow}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {window.location.href}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={S.closeBtn}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = theme.textMuted;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = theme.textDim;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div style={S.scrollArea}>
            <TabPanel group={currentGroup} imageUrl={previewImage} />
          </div>

          {/* Tabs */}
          <div style={S.tabs}>
            {TAB_ORDER.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                ...S.closeBtn,
                padding: "10px 8px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = theme.textMuted;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = theme.textDim;
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      ) : previewImage ? (
        <PeekThumbnail image={previewImage} onClick={() => setIsExpanded(true)} />
      ) : null}
    </div>
  );
}

// ─── Mount ───

function mount() {
  const container = document.createElement("div");
  container.id = "metapeek-root";
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<MetaPeekContent />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
