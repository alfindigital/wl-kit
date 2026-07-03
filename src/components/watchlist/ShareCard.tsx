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
        background: "#fcfaf6",
        color: "#121b29",
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
            background: "#ce3600",
          }}
        />
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
          Watchlist<span style={{ color: "#ce3600" }}>Kit</span>
        </span>
      </div>

      <div
        style={{
          padding: 20,
          background: "#ffffff",
          border: "1px solid #e1ddd7",
          borderRadius: 16,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 15,
          lineHeight: 1.6,
          color: "#121b29",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {output || "-"}
      </div>

      <div
        style={{
          marginTop: 28,
          paddingTop: 16,
          borderTop: "1px solid #e1ddd7",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 12,
          color: "#373d48",
        }}
      >
        <span>
          Built with <span style={{ color: "#ce3600", fontWeight: 600 }}>WatchlistKit</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "#ce3600" }}>alfindigital.com</span>
          <span style={{ color: "#ce3600" }}>@AlfIDX</span>
        </span>
      </div>
    </div>
  );
});
