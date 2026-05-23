import { forwardRef } from "react";

export const ShareCard = forwardRef<
  HTMLDivElement,
  { name: string; output: string; count: number; date: string }
>(function ShareCard({ output }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: 720,
        padding: 48,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
        borderRadius: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#ea580c",
          }}
        />
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
          WatchlistKit
        </span>
      </div>

      <div
        style={{
          padding: 20,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 15,
          lineHeight: 1.6,
          color: "#e2e8f0",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {output || "—"}
      </div>

      <div
        style={{
          marginTop: 28,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        <span>
          Built with{" "}
          <span style={{ color: "#ea580c", fontWeight: 600 }}>WatchlistKit</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "#ea580c" }}>alfindigital.com</span>
          <span style={{ color: "#ea580c" }}>@AlfIDX</span>
        </span>
      </div>
    </div>
  );
});
