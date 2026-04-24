"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";
import WinEffect from "../components/WinEffect";

const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];
const HOUSE_EDGE = 0.05;
const ICON = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="12" cy="12" rx="9.5" ry="9.5" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5"/>
  <ellipse cx="12" cy="12" rx="7" ry="7" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2"/>
  <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor" fontFamily="monospace">◎</text>
</svg>;

function CoinFlipGame() {
  const { connected, balance, updateBalance, connect } = useWallet();
  const [side, setSide] = useState<"heads" | "tails" | null>(null);
  const [betAmount, setBetAmount] = useState(0.1);
  const [customBet, setCustomBet] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<null | { outcome: "heads" | "tails"; won: boolean; payout: number }>(null);
  const [history, setHistory] = useState<BetRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [winTrigger, setWinTrigger] = useState(false);
  const coinRef = useRef<HTMLDivElement>(null);

  const activeBet = customBet !== "" ? parseFloat(customBet) || 0 : betAmount;
  const payout = activeBet * (2 - HOUSE_EDGE);

  const flip = async () => {
    if (!connected || !side || activeBet <= 0 || activeBet > balance || spinning) return;
    setSpinning(true); setResult(null);
    await new Promise(r => setTimeout(r, 1400));
    const outcome: "heads" | "tails" = Math.random() < 0.5 ? "heads" : "tails";
    const won = outcome === side;
    updateBalance(won ? balance - activeBet + payout : balance - activeBet);
    if (won) setWinTrigger(t => !t);
    setStreak(s => won ? s + 1 : 0);
    setHistory(h => [...h, { id: Date.now().toString(), game: `Coin Flip (${side})`, amount: activeBet, result: won ? "win" : "loss", payout, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setResult({ outcome, won, payout });
    setSpinning(false);
  };

  const pnl = history.reduce((a, h) => a + (h.result === "win" ? h.payout - h.amount : -h.amount), 0);

  return (
    <GameLayout title="COIN FLIP" accent="#10b981" icon={ICON}>
      <WinEffect trigger={winTrigger} amount={result?.won ? payout - activeBet : undefined} accent="#10b981"/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

        {/* LEFT: game + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Coin display */}
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(145deg, #001a0d 0%, #002618 60%, #001208 100%)",
            border: "1px solid rgba(16,185,129,0.2)",
            boxShadow: "0 0 60px rgba(16,185,129,0.06), 0 8px 40px rgba(0,0,0,0.5)",
            minHeight: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 24, position: "relative",
          }}>
            {/* Grid bg */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }}/>
            {/* Glow */}
            <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", filter: "blur(40px)" }}/>

            {/* Coin */}
            <div ref={coinRef} style={{ position: "relative", zIndex: 2 }}>
              <div className={spinning ? "coin-physics" : result ? "coin-land" : ""} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  width: 150, height: 150, borderRadius: "50%",
                  background: spinning ? "linear-gradient(135deg, #f59e0b, #d97706)" :
                    result ? (result.outcome === "heads"
                      ? "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)"
                      : "linear-gradient(135deg, #4ade80, #22c55e, #15803d)")
                    : "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: result && result.outcome === "heads"
                    ? "0 0 50px rgba(245,158,11,0.8), 0 0 100px rgba(245,158,11,0.35), inset 0 2px 8px rgba(255,255,255,0.3)"
                    : result && result.outcome === "tails"
                    ? "0 0 50px rgba(74,222,128,0.7), 0 0 100px rgba(74,222,128,0.25), inset 0 2px 8px rgba(255,255,255,0.3)"
                    : "0 0 35px rgba(245,158,11,0.45), inset 0 2px 8px rgba(255,255,255,0.2)",
                  border: "4px solid rgba(255,255,255,0.25)",
                  overflow: "hidden", position: "relative",
                  transition: "box-shadow 0.4s ease",
                }}>
                  {/* Shine */}
                  <div style={{ position:"absolute", top:8, left:16, width:40, height:20, borderRadius:"50%", background:"rgba(255,255,255,0.25)", transform:"rotate(-30deg)", pointerEvents:"none" }}/>
                  {(!result || result.outcome === "heads") && (
                    <Image src="/tangy-logo.png" alt="TANGY" width={108} height={128}
                      style={{ objectFit: "contain", mixBlendMode: "screen", position: "relative", zIndex: 1 }}/>
                  )}
                  {result && result.outcome === "tails" && (
                    <svg width="80" height="80" viewBox="0 0 72 72" fill="none" style={{ position: "relative", zIndex: 1 }}>
                      <circle cx="36" cy="38" r="28" fill="#16a34a" opacity=".9"/>
                      <circle cx="36" cy="38" r="28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                      <line x1="36" y1="10" x2="36" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                      <line x1="8" y1="38" x2="64" y2="38" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                      <line x1="16" y1="18" x2="56" y2="58" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
                      <line x1="56" y1="18" x2="16" y2="58" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
                      <path d="M36 10 C36 10 40 4 46 6" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                      <circle cx="24" cy="26" r="4" fill="rgba(255,255,255,0.2)"/>
                    </svg>
                  )}
                </div>
              </div>
              {/* Shadow beneath coin */}
              <div style={{ width:100, height:12, borderRadius:"50%", background:"rgba(0,0,0,0.4)", filter:"blur(6px)", margin:"8px auto 0" }}/>
            </div>

            {/* Result */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              {spinning && (
                <div style={{ fontSize: 13, color: "#4b5563", letterSpacing: 4, textTransform: "uppercase", fontFamily:"var(--font-orbitron)" }}>Flipping...</div>
              )}
              {result && !spinning && (
                <div className="slide-up">
                  <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 32, letterSpacing: 3, color: result.won ? "#10b981" : "#ef4444", textShadow: result.won ? "0 0 30px #10b981, 0 0 60px #10b98160" : "0 0 30px #ef4444, 0 0 60px #ef444460", marginBottom: 8 }}>
                    {result.won ? "YOU WON!" : "YOU LOST"}
                  </div>
                  <div style={{ fontSize: 14, color: "#6b7280" }}>
                    Landed: <span style={{ color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{result.outcome}</span>
                    <span style={{ color: result.won ? "#10b981" : "#ef4444", fontWeight: 700, marginLeft: 10, fontFamily:"var(--font-orbitron)", fontSize:13 }}>
                      {result.won ? `+${(payout - activeBet).toFixed(3)} ◎` : `-${activeBet.toFixed(3)} ◎`}
                    </span>
                  </div>
                  {streak > 1 && result.won && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#f59e0b", fontWeight: 800, textShadow: "0 0 12px #f59e0b", display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"var(--font-orbitron)", letterSpacing:2 }}>
                      🔥 {streak}× WIN STREAK!
                    </div>
                  )}
                </div>
              )}
              {!spinning && !result && (
                <div style={{ fontSize: 12, color: "#374151", letterSpacing: 3, textTransform: "uppercase", fontFamily:"var(--font-orbitron)" }}>
                  {side ? `${side.toUpperCase()} selected` : "Pick a side to begin"}
                </div>
              )}
            </div>

            {/* Side selector */}
            <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 12 }}>
              {(["heads", "tails"] as const).map(s => (
                <button key={s} onClick={() => setSide(s)} disabled={spinning}
                  style={{
                    padding: "12px 32px", borderRadius: 12, fontSize: 13, fontWeight: 800,
                    letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
                    background: side === s
                      ? (s === "heads" ? "#f59e0b" : "#22c55e")
                      : "rgba(255,255,255,0.04)",
                    color: side === s ? "#000" : "#4b5563",
                    border: side === s
                      ? (s === "heads" ? "1px solid #f59e0b" : "1px solid #22c55e")
                      : "1px solid var(--border)",
                    boxShadow: side === s ? (s === "heads" ? "0 0 20px rgba(245,158,11,0.5)" : "0 0 16px rgba(34,197,94,0.4)") : "none",
                    opacity: spinning ? 0.5 : 1,
                  }}>
                  {s === "heads" ? "🟠 Heads" : "🟢 Tails"}
                </button>
              ))}
            </div>
          </div>

          {/* Bet controls */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4b5563" }}>Bet Amount</span>
              <span style={{ fontSize: 12, color: "#4b5563" }}>Balance: <span style={{ color: "#10b981", fontWeight: 700 }}>{balance.toFixed(3)} ◎</span></span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 12 }}>
              {BET_AMOUNTS.map(amt => (
                <button key={amt} onClick={() => { setBetAmount(amt); setCustomBet(""); }}
                  disabled={spinning || amt > balance}
                  style={{
                    padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                    background: betAmount === amt && customBet === "" ? "#10b981" : "rgba(255,255,255,0.04)",
                    color: betAmount === amt && customBet === "" ? "#000" : "#6b7280",
                    border: betAmount === amt && customBet === "" ? "1px solid #10b981" : "1px solid var(--border)",
                    opacity: spinning || amt > balance ? 0.4 : 1,
                  }}>{amt}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input type="number" min="0.01" max={balance} step="0.01" placeholder="Custom amount..."
                value={customBet} onChange={e => setCustomBet(e.target.value)} disabled={spinning}
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit" }}/>
              {[["MAX", () => setCustomBet(balance.toFixed(2))], ["½", () => setCustomBet((activeBet / 2).toFixed(2))], ["2×", () => setCustomBet((activeBet * 2).toFixed(2))]].map(([label, action]) => (
                <button key={label as string} onClick={action as () => void} disabled={spinning}
                  style={{ padding: "9px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#6b7280", transition: "all 0.15s" }}>
                  {label as string}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#374151", padding: "8px 4px 14px" }}>
              <span>Bet: <span style={{ color: "#fff", fontWeight: 600 }}>{activeBet.toFixed(3)} ◎</span></span>
              <span>Win: <span style={{ color: "#10b981", fontWeight: 600 }}>{payout.toFixed(3)} ◎</span></span>
              <span>Net: <span style={{ color: "#10b981", fontWeight: 600 }}>+{(payout - activeBet).toFixed(3)} ◎</span></span>
            </div>
            {connected ? (
              <button onClick={flip} disabled={!side || activeBet <= 0 || activeBet > balance || spinning}
                className="btn-green" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12, opacity: (!side || spinning || activeBet > balance) ? 0.5 : 1 }}>
                {spinning ? "FLIPPING..." : side ? `FLIP ${side.toUpperCase()}` : "SELECT A SIDE FIRST"}
              </button>
            ) : (
              <button onClick={connect} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>CONNECT WALLET</button>
            )}
          </div>
        </div>

        {/* RIGHT: stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 84 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 16 }}>Session Stats</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Bets placed", value: history.length, color: "#fff" },
                { label: "Wins", value: history.filter(h => h.result === "win").length, color: "#10b981" },
                { label: "Losses", value: history.filter(h => h.result === "loss").length, color: "#ef4444" },
                { label: "Win streak", value: `${streak}×`, color: "#f59e0b" },
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

export default function CoinFlipPage() {
  return <WalletProvider><CoinFlipGame /></WalletProvider>;
}
