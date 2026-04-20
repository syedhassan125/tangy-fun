"use client";
import { useState, useCallback, useRef } from "react";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";

const TOTAL_BALLS = 40;
const DRAW_COUNT = 20;
const MAX_PICKS = 10;
const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];

// Payout table [picks][matches] → multiplier
// Calibrated for 20/40 draw rate (~25% house edge across all pick counts)
const PAYOUT_TABLE: Record<number, number[]> = {
  1:  [0, 1.5],
  2:  [0, 0, 3.0],
  3:  [0, 0, 0, 6.5],
  4:  [0, 0, 0, 1.0, 10],
  5:  [0, 0, 0, 0, 2.0, 19],
  6:  [0, 0, 0, 0, 1.0, 3.0, 25],
  7:  [0, 0, 0, 0, 0, 1.5, 8.0, 45],
  8:  [0, 0, 0, 0, 0, 0.3, 3.0, 14, 70],
  9:  [0, 0, 0, 0, 0, 0, 1.0, 4.0, 15, 100],
  10: [0, 0, 0, 0, 0, 0, 0, 2.5, 9.0, 40, 180],
};

const ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

type Phase = "pick" | "drawing" | "done";

function getMultiplier(picks: number, matches: number): number {
  const table = PAYOUT_TABLE[picks];
  if (!table || matches >= table.length) return 0;
  return table[matches] || 0;
}

function KenoGame() {
  const { connected, balance, updateBalance, connect } = useWallet();
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<number[]>([]);
  const [drawProgress, setDrawProgress] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState(0.5);
  const [customBet, setCustomBet] = useState("");
  const [phase, setPhase] = useState<Phase>("pick");
  const [history, setHistory] = useState<BetRecord[]>([]);
  const [lastResult, setLastResult] = useState<{ multiplier: number; payout: number; matches: number } | null>(null);
  const drawTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeBet = customBet !== "" ? parseFloat(customBet) || 0 : betAmount;
  const picksArr = Array.from(picks).sort((a, b) => a - b);
  const accent = "#f59e0b"; // amber/gold for Keno
  const pnl = history.reduce((a, h) => a + (h.result === "win" ? h.payout - h.amount : -h.amount), 0);

  const togglePick = (num: number) => {
    if (phase !== "pick") return;
    setPicks(prev => {
      const next = new Set(prev);
      if (next.has(num)) { next.delete(num); }
      else if (next.size < MAX_PICKS) { next.add(num); }
      return next;
    });
  };

  const clearPicks = () => { if (phase === "pick") setPicks(new Set()); };

  const quickPick = () => {
    if (phase !== "pick") return;
    const count = picks.size > 0 ? picks.size : 5;
    const pool = Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setPicks(new Set(pool.slice(0, count)));
  };

  const play = useCallback(() => {
    if (!connected || picks.size === 0 || activeBet <= 0 || activeBet > balance || phase !== "pick") return;

    // Generate all drawn numbers
    const pool = Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const drawnNums = pool.slice(0, DRAW_COUNT);
    setDrawn(drawnNums);
    setDrawProgress([]);
    setPhase("drawing");

    // Animate draws one by one
    drawnNums.forEach((num, idx) => {
      const t = setTimeout(() => {
        setDrawProgress(prev => [...prev, num]);
        if (idx === drawnNums.length - 1) {
          // All drawn — compute result
          const matchCount = drawnNums.filter(n => picks.has(n)).length;
          const mult = getMultiplier(picks.size, matchCount);
          const payout = activeBet * mult;
          const won = payout > 0;

          if (won) {
            updateBalance(balance - activeBet + payout);
          } else {
            updateBalance(balance - activeBet);
          }

          setLastResult({ multiplier: mult, payout, matches: matchCount });
          setPhase("done");

          const record: BetRecord = {
            id: Date.now().toString(),
            game: `Keno (${picks.size} picks, ${matchCount} hits)`,
            amount: activeBet,
            result: won ? "win" : "loss",
            payout: won ? payout : 0,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setHistory(h => [...h, record]);
        }
      }, idx * 140);
      drawTimerRef.current = t;
    });
  }, [connected, picks, activeBet, balance, phase, updateBalance]);

  const reset = () => {
    setPhase("pick");
    setDrawn([]);
    setDrawProgress([]);
    setLastResult(null);
    // Keep picks for next game
  };

  const isDrawn = (n: number) => drawn.includes(n);
  const isAnimated = (n: number) => drawProgress.includes(n);
  const isPick = (n: number) => picks.has(n);
  const isHit = (n: number) => isPick(n) && isDrawn(n);

  // Payout preview table for current pick count
  const payoutPreview = picks.size > 0 ? PAYOUT_TABLE[picks.size] : null;
  const matchesPreview = payoutPreview
    ? payoutPreview.map((mult, i) => ({ matches: i, mult })).filter(r => r.mult > 0)
    : [];

  return (
    <GameLayout title="KENO" accent={accent} icon={ICON}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

        {/* LEFT: grid + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status bar */}
          <div style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(217,119,6,0.04) 100%)",
            border: `1px solid rgba(245,158,11,0.15)`,
            borderRadius: 14, padding: "14px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>
                {phase === "pick" ? "Pick Your Numbers" : phase === "drawing" ? "Drawing..." : "Result"}
              </div>
              <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 18, color: accent, letterSpacing: 2 }}>
                {phase === "pick"
                  ? picks.size === 0 ? "SELECT 1–10 NUMBERS" : `${picks.size} SELECTED`
                  : phase === "drawing"
                  ? `${drawProgress.length} / ${DRAW_COUNT} DRAWN`
                  : lastResult
                  ? lastResult.matches + ` MATCH${lastResult.matches !== 1 ? "ES" : ""}`
                  : "—"}
              </div>
            </div>
            {phase === "drawing" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase" }}>Progress</div>
                <div style={{ width: 140, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg, ${accent}, #d97706)`, width: `${(drawProgress.length / DRAW_COUNT) * 100}%`, transition: "width 0.12s ease" }}/>
                </div>
              </div>
            )}
            {phase === "done" && lastResult && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>
                  {lastResult.payout > 0 ? "Won" : "Lost"}
                </div>
                <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 20, color: lastResult.payout > 0 ? "#10b981" : "#ef4444", textShadow: `0 0 16px ${lastResult.payout > 0 ? "#10b981" : "#ef4444"}` }}>
                  {lastResult.payout > 0 ? `+${lastResult.payout.toFixed(3)}` : `-${activeBet.toFixed(3)}`} ◎
                </div>
              </div>
            )}
          </div>

          {/* Number grid */}
          <div style={{
            background: "linear-gradient(145deg, #110d00 0%, #1c1500 60%, #0f0b00 100%)",
            border: `1px solid rgba(245,158,11,0.12)`,
            borderRadius: 20, padding: 24,
            boxShadow: `0 0 60px rgba(245,158,11,0.04), 0 8px 40px rgba(0,0,0,0.5)`,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
              {Array.from({ length: TOTAL_BALLS }, (_, i) => i + 1).map(num => {
                const picked = isPick(num);
                const animated = isAnimated(num);
                const hit = isHit(num) && phase !== "pick";
                const miss = !picked && animated;
                const pickedNotHit = picked && phase !== "pick" && !hit && phase === "done";

                let bg = "rgba(255,255,255,0.03)";
                let border = "1px solid rgba(255,255,255,0.06)";
                let color = "#4b5563";
                let shadow = "none";
                let scale = "scale(1)";
                let fontWeight: number = 600;

                if (picked && phase === "pick") {
                  bg = `rgba(245,158,11,0.18)`;
                  border = `1px solid rgba(245,158,11,0.5)`;
                  color = accent;
                  shadow = `0 0 12px rgba(245,158,11,0.3)`;
                  fontWeight = 800;
                }
                if (animated && !picked) {
                  bg = "rgba(255,255,255,0.05)";
                  border = "1px solid rgba(255,255,255,0.15)";
                  color = "#9ca3af";
                }
                if (hit) {
                  bg = `rgba(245,158,11,0.25)`;
                  border = `1px solid ${accent}`;
                  color = accent;
                  shadow = `0 0 20px rgba(245,158,11,0.6)`;
                  scale = "scale(1.08)";
                  fontWeight = 900;
                }
                if (pickedNotHit) {
                  bg = "rgba(239,68,68,0.08)";
                  border = "1px solid rgba(239,68,68,0.3)";
                  color = "#ef4444";
                }

                return (
                  <button key={num} onClick={() => togglePick(num)}
                    disabled={phase !== "pick" || (!picked && picks.size >= MAX_PICKS)}
                    style={{
                      aspectRatio: "1", borderRadius: 10, fontSize: 13,
                      fontWeight, fontFamily: "var(--font-orbitron, monospace)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: phase === "pick" && (picked || picks.size < MAX_PICKS) ? "pointer" : "default",
                      transition: "all 0.15s cubic-bezier(0.23,1,0.32,1)",
                      background: bg, border, color,
                      boxShadow: shadow,
                      transform: scale,
                    }}>
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
            {phase === "pick" && (
              <>
                {/* Bet amount */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4b5563" }}>Bet Amount</span>
                  <span style={{ fontSize: 12, color: "#4b5563" }}>Balance: <span style={{ color: "#10b981", fontWeight: 700 }}>{balance.toFixed(3)} ◎</span></span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 12 }}>
                  {BET_AMOUNTS.map(amt => (
                    <button key={amt} onClick={() => { setBetAmount(amt); setCustomBet(""); }} disabled={amt > balance}
                      style={{
                        padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                        background: betAmount === amt && customBet === "" ? accent : "rgba(255,255,255,0.04)",
                        color: betAmount === amt && customBet === "" ? "#000" : "#6b7280",
                        border: betAmount === amt && customBet === "" ? `1px solid ${accent}` : "1px solid var(--border)",
                        opacity: amt > balance ? 0.4 : 1,
                      }}>{amt}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input type="number" min="0.01" max={balance} step="0.01" placeholder="Custom amount..."
                    value={customBet} onChange={e => setCustomBet(e.target.value)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit" }}/>
                  <button onClick={() => setCustomBet(balance.toFixed(2))} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#6b7280" }}>MAX</button>
                </div>

                {/* Quick picks row */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button onClick={quickPick} style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: accent, transition: "all 0.15s" }}>
                    ⚡ QUICK PICK
                  </button>
                  <button onClick={clearPicks} disabled={picks.size === 0} style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: picks.size === 0 ? "default" : "pointer", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "#4b5563", opacity: picks.size === 0 ? 0.4 : 1, transition: "all 0.15s" }}>
                    CLEAR
                  </button>
                </div>

                {connected ? (
                  <button onClick={play} disabled={picks.size === 0 || activeBet <= 0 || activeBet > balance}
                    style={{
                      width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12,
                      fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, cursor: "pointer",
                      background: picks.size === 0 || activeBet <= 0 || activeBet > balance
                        ? "rgba(255,255,255,0.05)"
                        : `linear-gradient(135deg, ${accent}, #d97706)`,
                      color: picks.size === 0 || activeBet <= 0 || activeBet > balance ? "#374151" : "#000",
                      border: "none",
                      boxShadow: picks.size > 0 && activeBet > 0 && activeBet <= balance ? `0 4px 24px rgba(245,158,11,0.4)` : "none",
                      transition: "all 0.2s",
                    }}>
                    {picks.size === 0 ? "SELECT NUMBERS FIRST" : `PLAY — ${activeBet.toFixed(2)} ◎`}
                  </button>
                ) : (
                  <button onClick={connect} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>CONNECT WALLET</button>
                )}
              </>
            )}

            {phase === "drawing" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 16, color: accent, letterSpacing: 3, marginBottom: 8 }}>DRAWING NUMBERS...</div>
                <div style={{ fontSize: 12, color: "#4b5563" }}>Watch the grid above</div>
              </div>
            )}

            {phase === "done" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lastResult && lastResult.payout > 0 && (
                  <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                    <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 24, color: "#10b981", textShadow: "0 0 24px #10b981", letterSpacing: 3 }}>
                      {lastResult.multiplier}× WIN!
                    </div>
                    <div style={{ fontSize: 13, color: "#10b981", marginTop: 4 }}>
                      {lastResult.matches} hits → +{lastResult.payout.toFixed(3)} ◎
                    </div>
                  </div>
                )}
                {lastResult && lastResult.payout === 0 && (
                  <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                    <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 20, color: "#ef4444", textShadow: "0 0 20px #ef4444", letterSpacing: 3 }}>
                      NO WIN
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{lastResult.matches} hit{lastResult.matches !== 1 ? "s" : ""} — try again</div>
                  </div>
                )}
                <button onClick={reset} style={{
                  width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12, cursor: "pointer",
                  fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900,
                  background: `linear-gradient(135deg, ${accent}, #d97706)`,
                  color: "#000", border: "none",
                  boxShadow: `0 4px 24px rgba(245,158,11,0.4)`,
                }}>
                  PLAY AGAIN →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: payout table + stats + history */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 84 }}>

          {/* Payout table */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 12 }}>
              Payout Table {picks.size > 0 ? `(${picks.size} picks)` : ""}
            </div>
            {picks.size === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: "#374151" }}>Select numbers to see payouts</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {matchesPreview.map(({ matches, mult }) => {
                  const isCurrentHit = phase === "done" && lastResult?.matches === matches;
                  return (
                    <div key={matches} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "7px 10px", borderRadius: 8, fontSize: 12,
                      background: isCurrentHit ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.02)",
                      border: isCurrentHit ? `1px solid rgba(245,158,11,0.4)` : "1px solid transparent",
                      transition: "all 0.2s",
                    }}>
                      <span style={{ color: isCurrentHit ? accent : "#6b7280" }}>
                        {matches} match{matches !== 1 ? "es" : ""}
                      </span>
                      <span style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 800, fontSize: 11, color: isCurrentHit ? "#10b981" : "#374151" }}>
                        {mult}×
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session stats */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 16 }}>Session Stats</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Games played", value: history.length, color: "#fff" },
                { label: "Wins", value: history.filter(h => h.result === "win").length, color: "#10b981" },
                { label: "Losses", value: history.filter(h => h.result === "loss").length, color: "#ef4444" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#4b5563" }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color, fontFamily: "var(--font-orbitron, monospace)" }}>{s.value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#4b5563" }}>P&L</span>
                <span style={{ fontWeight: 800, color: pnl >= 0 ? "#10b981" : "#ef4444", fontFamily: "var(--font-orbitron, monospace)" }}>
                  {pnl >= 0 ? "+" : ""}{pnl.toFixed(3)} ◎
                </span>
              </div>
            </div>
          </div>

          <BetHistory history={history} />
        </div>
      </div>
    </GameLayout>
  );
}

export default function KenoPage() {
  return <WalletProvider><KenoGame /></WalletProvider>;
}
