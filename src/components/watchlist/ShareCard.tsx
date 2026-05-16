import { forwardRef } from "react";

export const ShareCard = forwardRef<
  HTMLDivElement,
  { name: string; output: string; count: number; date: string }
>(function ShareCard({ name, output, count, date }, ref) {
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
            background: "#f59e0b",
          }}
        />
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>
          WatchlistKit
        </span>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{name}</div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
          {count} {count === 1 ? "ticker" : "tickers"} · {date}
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
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
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          fontSize: 12,
          color: "#94a3b8",
          textAlign: "center",
        }}
      >
        @alfindigital
      </div>
    </div>
  );
});
