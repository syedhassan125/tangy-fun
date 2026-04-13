"use client";

export interface BetRecord {
  id: string;
  game: string;
  amount: number;
  result: "win" | "loss";
  payout: number;
  time: string;
}

export default function BetHistory({ history }: { history: BetRecord[] }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 14 }}>Bet History</div>
      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0", fontSize: 11, color: "#1f2937" }}>No bets yet. Let&apos;s go.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
          {[...history].reverse().map(bet => (
            <div key={bet.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 10px", borderRadius: 8, fontSize: 11,
              background: bet.result === "win" ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.07)",
              border: `1px solid ${bet.result === "win" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                <span style={{ color: bet.result === "win" ? "#10b981" : "#ef4444", fontSize: 10 }}>
                  {bet.result === "win" ? "▲" : "▼"}
                </span>
                <span style={{ color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bet.game}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ color: "#374151" }}>{bet.amount.toFixed(2)} ◎</span>
                <span style={{ fontWeight: 800, color: bet.result === "win" ? "#10b981" : "#ef4444", fontFamily: "var(--font-orbitron, monospace)", fontSize: 10 }}>
                  {bet.result === "win" ? `+${bet.payout.toFixed(2)}` : `-${bet.amount.toFixed(2)}`} ◎
                </span>
                <span style={{ color: "#1f2937", fontSize: 10 }}>{bet.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
