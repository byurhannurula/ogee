import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export default function Popup() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get("metapeek-enabled").then((res) => {
      if (typeof res["metapeek-enabled"] === "boolean") {
        setEnabled(res["metapeek-enabled"]);
      }
    });
  }, []);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    await chrome.storage.local.set({ "metapeek-enabled": next });
  };

  return (
    <div
      style={{
        width: 240,
        padding: 16,
        backgroundColor: "#0f0f0f",
        color: "#e5e5e5",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: "rgba(196, 163, 90, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4a35a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 1 }}>MetaPeek</div>
          <div style={{ fontSize: 12, color: "#888" }}>OG &amp; Twitter metadata</div>
        </div>
      </div>

      <button
        onClick={toggle}
        style={{
          width: "100%",
          padding: "8px 0",
          borderRadius: 8,
          border: "none",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
          backgroundColor: enabled ? "rgba(196, 163, 90, 0.15)" : "#1a1a1a",
          color: enabled ? "#c4a35a" : "#888",
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget;
          if (enabled) btn.style.backgroundColor = "rgba(196, 163, 90, 0.25)";
          else btn.style.backgroundColor = "#222";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget;
          if (enabled) btn.style.backgroundColor = "rgba(196, 163, 90, 0.15)";
          else btn.style.backgroundColor = "#1a1a1a";
        }}
      >
        {enabled ? "Enabled" : "Disabled"}
      </button>

      <div style={{ marginTop: 10, fontSize: 11, color: "#555", textAlign: "center" }}>
        Look for the thumbnail in the bottom-left
      </div>
    </div>
  );
}

// Mount
const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
