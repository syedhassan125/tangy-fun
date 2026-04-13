"use client";
import { useState } from "react";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";

const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];
const HOUSE_EDGE = 0.05;
const ICON = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 7L12 2l10 5v10l-10 5L2 17V7z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M12 2l10 5M12 2v15M2 7l10 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <circle cx="7" cy="10" r="1.2" fill="currentColor"/>
  <circle cx="12" cy="14.5" r="1.2" fill="currentColor"/>
  <circle cx="7" cy="15.5" r="1.2" fill="currentColor"/>
</svg>;

function calcMultiplier(target: number, over: boolean): number {
  const winChance = over ? (99 - target) / 100 : target / 100;
  return parseFloat(((1 / winChance) * (1 - HOUSE_EDGE)).toFixed(4));
}

function DiceGame() {
  const { connected, balance, updateBalance, connect } = useWallet();
  const [target, setTarget] = useState(50);
  const [over, setOver] = useState(true);
  const [betAmount, setBetAmount] = useState(0.1);
  const [customBet, setCustomBet] = useState("");
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<null | { roll: number; won: boolean; payout: number }>(null);
  const [history, setHistory] = useState<BetRecord[]>([]);

  const activeBet = customBet !== "" ? parseFloat(customBet) || 0 : betAmount;
  const multiplier = calcMultiplier(target, over);
  const winChance = over ? 99 - target : target;
  const payout = activeBet * multiplier;
  const pnl = history.reduce((a, h) => a + (h.result === "win" ? h.payout - h.amount : -h.amount), 0);

  const roll = async () => {
    if (!connected || activeBet <= 0 || activeBet > balance || rolling) return;
    setRolling(true); setResult(null);
    await new Promise(r => setTimeout(r, 900));
    const rolled = Math.floor(Math.random() * 100) + 1;
    const won = over ? rolled > target : rolled < target;
    updateBalance(won ? balance - activeBet + payout : balance - activeBet);
    setResult({ roll: rolled, won, payout });
    setHistory(h => [...h, { id: Date.now().toString(), game: `Dice (${over ? ">" : "<"}${target})`, amount: activeBet, result: won ? "win" : "loss", payout, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setRolling(false);
  };

  const accent = "#06b6d4";
  const resultAccent = result ? (result.won ? "#10b981" : "#ef4444") : accent;

  return (
    <GameLayout title="DICE" accent={accent} icon={ICON}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Roll display */}
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(145deg, #00111a 0%, #001e2d 60%, #000f18 100%)",
            border: `1px solid ${resultAccent}25`,
            boxShadow: `0 0 60px ${resultAccent}08, 0 8px 40px rgba(0,0,0,0.5)`,
            minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "32px 24px", gap: 16, position: "relative",
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${accent}06 1px, transparent 1px), linear-gradient(90deg, ${accent}06 1px, transparent 1px)`, backgroundSize: "40px 40px" }}/>
            <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${resultAccent}10 0%, transparent 70%)`, filter: "blur(40px)" }}/>

            {/* Roll number */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900,
                fontSize: rolling ? 72 : result ? 100 : 72,
                color: rolling ? "#374151" : resultAccent,
                textShadow: rolling ? "none" : `0 0 40px ${resultAccent}, 0 0 80px ${resultAccent}40`,
                letterSpacing: 4, lineHeight: 1, transition: "all 0.3s ease",
              }}>
                {rolling ? "??" : result ? result.roll.toString().padStart(2, "0") : "--"}
              </div>
              {rolling && <div style={{ fontSize: 12, color: "#374151", letterSpacing: 3, textTransform: "uppercase", marginTop: 8 }}>Rolling...</div>}
              {result && !rolling && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 20, color: resultAccent, letterSpacing: 3, textShadow: `0 0 16px ${resultAccent}` }}>
                    {result.won ? "WIN!" : "LOST"}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    <span style={{ color: resultAccent, fontWeight: 700 }}>
                      {result.won ? `+${result.payout.toFixed(3)} ◎` : `-${activeBet.toFixed(3)} ◎`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Target slider */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4b5563" }}>Target Number</span>
              <span style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 20, color: accent }}>{target}</span>
            </div>

            {/* Track */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div style={{ height: 8, borderRadius: 100, overflow: "hidden", background: "rgba(255,255,255,0.06)", marginBottom: 4 }}>
                <div style={{ height: "100%", borderRadius: 100, transition: "width 0.1s", background: over ? `linear-gradient(90deg, rgba(239,68,68,0.6) ${target}%, ${accent} ${target}%)` : `linear-gradient(90deg, ${accent} ${target}%, rgba(239,68,68,0.6) ${target}%)`, width: "100%" }}/>
              </div>
              <input type="range" min={2} max={98} value={target}
                onChange={e => setTarget(parseInt(e.target.value))} disabled={rolling}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 8, opacity: 0, cursor: "pointer", zIndex: 5 }}/>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "#374151" }}>
                <span>1</span><span>25</span><span>50</span><span>75</span><span>99</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Win Chance", value: `${winChance}%`, color: accent },
                { label: "Multiplier", value: `${multiplier}×`, color: "#f59e0b" },
                { label: "Payout", value: `${payout.toFixed(2)} ◎`, color: "#10b981" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#374151", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 800, fontSize: 15, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Over / Under */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[{ label: "ROLL UNDER", val: false }, { label: "ROLL OVER", val: true }].map(o => (
                <button key={o.label} onClick={() => setOver(o.val)} disabled={rolling}
                  style={{
                    padding: "11px", borderRadius: 10, fontSize: 12, fontWeight: 800,
                    letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s",
                    background: over === o.val ? accent : "rgba(255,255,255,0.04)",
                    color: over === o.val ? "#000" : "#4b5563",
                    border: over === o.val ? `1px solid ${accent}` : "1px solid var(--border)",
                    boxShadow: over === o.val ? `0 0 20px ${accent}50` : "none",
                  }}>{o.label}</button>
              ))}
            </div>
          </div>

          {/* Bet controls */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4b5563" }}>Bet Amount</span>
              <span style={{ fontSize: 12, color: "#4b5563" }}>Balance: <span style={{ color: "#10b981", fontWeight: 700 }}>{balance.toFixed(3)} ◎</span></span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 12 }}>
              {BET_AMOUNTS.map(amt => (
                <button key={amt} onClick={() => { setBetAmount(amt); setCustomBet(""); }} disabled={rolling || amt > balance}
                  style={{
                    padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                    background: betAmount === amt && customBet === "" ? accent : "rgba(255,255,255,0.04)",
                    color: betAmount === amt && customBet === "" ? "#000" : "#6b7280",
                    border: betAmount === amt && customBet === "" ? `1px solid ${accent}` : "1px solid var(--border)",
                    opacity: rolling || amt > balance ? 0.4 : 1,
                  }}>{amt}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input type="number" min="0.01" max={balance} step="0.01" placeholder="Custom..."
                value={customBet} onChange={e => setCustomBet(e.target.value)} disabled={rolling}
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit" }}/>
              <button onClick={() => setCustomBet(balance.toFixed(2))} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#6b7280" }}>MAX</button>
              <button onClick={() => setCustomBet((activeBet * 2).toFixed(2))} disabled={rolling || activeBet * 2 > balance} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#6b7280", opacity: activeBet * 2 > balance ? 0.4 : 1 }}>2×</button>
            </div>
            {connected ? (
              <button onClick={roll} disabled={activeBet <= 0 || activeBet > balance || rolling}
                className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #0891b2)`, boxShadow: `0 4px 20px ${accent}40`, opacity: rolling || activeBet > balance ? 0.5 : 1 }}>
                {rolling ? "ROLLING..." : "ROLL DICE"}
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
                { label: "Rolls", value: history.length, color: "#fff" },
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

export default function DicePage() {
  return <WalletProvider><DiceGame /></WalletProvider>;
}
