"use client";
import { useState, useCallback } from "react";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";

const GRID_SIZE = 25;
const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];
const MINE_COUNTS = [1, 3, 5, 10, 15, 20];
const ICON = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="11" cy="13" r="7.5" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M16 7.5L18.5 5M18.5 5l1.5-1.5M18.5 5l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" fillOpacity=".4"/>
  <line x1="11" y1="5" x2="11" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <line x1="11" y1="21" x2="11" y2="22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <line x1="3.5" y1="13" x2="2" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <line x1="18.5" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

function calcMultiplier(mineCount: number, revealed: number): number {
  let prob = 1;
  for (let i = 0; i < revealed; i++) {
    prob *= (GRID_SIZE - mineCount - i) / (GRID_SIZE - i);
  }
  return parseFloat(((1 / prob) * 0.93).toFixed(3));
}

type TileState = "hidden" | "safe" | "mine";
type GamePhase = "bet" | "playing" | "done";

function MinesGame() {
  const { connected, balance, updateBalance, connect } = useWallet();
  const [mineCount, setMineCount] = useState(5);
  const [betAmount, setBetAmount] = useState(0.5);
  const [customBet, setCustomBet] = useState("");
  const [phase, setPhase] = useState<GamePhase>("bet");
  const [tiles, setTiles] = useState<TileState[]>(Array(GRID_SIZE).fill("hidden"));
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(0);
  const [history, setHistory] = useState<BetRecord[]>([]);

  const activeBet = customBet !== "" ? parseFloat(customBet) || 0 : betAmount;
  const currentMultiplier = calcMultiplier(mineCount, revealed);
  const currentPayout = activeBet * currentMultiplier;
  const safeTiles = GRID_SIZE - mineCount;
  const pnl = history.reduce((a, h) => a + (h.result === "win" ? h.payout - h.amount : -h.amount), 0);

  const startGame = () => {
    if (!connected || activeBet <= 0 || activeBet > balance || phase !== "bet") return;
    const mineSet = new Set<number>();
    while (mineSet.size < mineCount) mineSet.add(Math.floor(Math.random() * GRID_SIZE));
    setMines(mineSet);
    setTiles(Array(GRID_SIZE).fill("hidden"));
    setRevealed(0);
    setPhase("playing");
  };

  const clickTile = useCallback((index: number) => {
    if (phase !== "playing" || tiles[index] !== "hidden") return;
    const isMine = mines.has(index);
    const newTiles = [...tiles];
    if (isMine) {
      newTiles[index] = "mine";
      mines.forEach(m => { newTiles[m] = "mine"; });
      setTiles(newTiles); setPhase("done");
      updateBalance(balance - activeBet);
      setHistory(h => [...h, { id: Date.now().toString(), game: `Mines (${mineCount} mines, ${revealed} safe)`, amount: activeBet, result: "loss", payout: 0, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } else {
      newTiles[index] = "safe";
      setTiles(newTiles);
      const newRevealed = revealed + 1;
      setRevealed(newRevealed);
      if (newRevealed === safeTiles) {
        const payout = activeBet * calcMultiplier(mineCount, newRevealed);
        updateBalance(balance - activeBet + payout);
        setPhase("done");
        setHistory(h => [...h, { id: Date.now().toString(), game: `Mines (all safe!)`, amount: activeBet, result: "win", payout, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      }
    }
  }, [phase, tiles, mines, revealed, activeBet, balance, mineCount, safeTiles, updateBalance]);

  const cashout = () => {
    if (phase !== "playing" || revealed === 0) return;
    updateBalance(balance - activeBet + currentPayout);
    const newTiles = [...tiles];
    mines.forEach(m => { if (newTiles[m] === "hidden") newTiles[m] = "mine"; });
    setTiles(newTiles); setPhase("done");
    setHistory(h => [...h, { id: Date.now().toString(), game: `Mines (${mineCount} mines, ${revealed} safe)`, amount: activeBet, result: "win", payout: currentPayout, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  const reset = () => { setPhase("bet"); setTiles(Array(GRID_SIZE).fill("hidden")); setRevealed(0); setMines(new Set()); };

  const accent = "#a855f7";

  return (
    <GameLayout title="MINES" accent={accent} icon={ICON}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

        {/* LEFT: grid + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Mine grid */}
          <div style={{
            background: "linear-gradient(145deg, #0d0020 0%, #180035 60%, #0a0018 100%)",
            border: `1px solid ${accent}20`,
            borderRadius: 20, padding: 24,
            boxShadow: `0 0 60px ${accent}08, 0 8px 40px rgba(0,0,0,0.5)`,
          }}>
            {/* Live multiplier bar */}
            {phase === "playing" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "12px 16px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Current Multiplier</div>
                  <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: revealed > 0 ? 24 : 16, color: revealed > 0 ? accent : "#374151", textShadow: revealed > 0 ? `0 0 16px ${accent}` : "none" }}>
                    {revealed > 0 ? `${currentMultiplier}×` : "—"}
                  </div>
                </div>
                {revealed > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>Cash Out For</div>
                    <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 800, fontSize: 18, color: "#10b981" }}>{currentPayout.toFixed(3)} ◎</div>
                  </div>
                )}
              </div>
            )}

            {/* Tile grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {tiles.map((state, i) => (
                <button key={i} onClick={() => clickTile(i)}
                  disabled={phase !== "playing" || state !== "hidden"}
                  style={{
                    aspectRatio: "1", borderRadius: 10, fontSize: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: phase === "playing" && state === "hidden" ? "pointer" : "default",
                    transition: "all 0.18s cubic-bezier(0.23,1,0.32,1)",
                    border: state === "safe" ? "1px solid rgba(16,185,129,0.5)" : state === "mine" ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(168,85,247,0.15)",
                    background: state === "safe" ? "rgba(16,185,129,0.15)" : state === "mine" ? "rgba(239,68,68,0.12)" : phase === "playing" ? "rgba(168,85,247,0.06)" : "rgba(255,255,255,0.02)",
                    boxShadow: state === "safe" ? "0 0 14px rgba(16,185,129,0.25)" : state === "mine" ? "0 0 14px rgba(239,68,68,0.3)" : "none",
                    transform: state === "safe" ? "scale(1.02)" : "scale(1)",
                  }}>
                  {state === "safe" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#10b981" opacity=".9"/></svg>}
                  {state === "mine" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="6" fill="#ef4444" opacity=".9"/><line x1="12" y1="6" x2="12" y2="4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="7.5" x2="17.5" y2="6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  {state === "hidden" && phase === "playing" && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(168,85,247,0.3)" }}/>
                  )}
                </button>
              ))}
            </div>

            {/* Done state */}
            {phase === "done" && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                {history[history.length - 1]?.result === "win" ? (
                  <div>
                    <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 22, color: "#10b981", textShadow: "0 0 20px #10b981", letterSpacing: 3, marginBottom: 4 }}>CASHED OUT!</div>
                    <div style={{ fontSize: 13, color: "#10b981" }}>+{history[history.length - 1].payout.toFixed(3)} ◎</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 22, color: "#ef4444", textShadow: "0 0 20px #ef4444", letterSpacing: 3, marginBottom: 4 }}>BOOM! 💥</div>
                    <div style={{ fontSize: 13, color: "#ef4444" }}>-{activeBet.toFixed(3)} ◎</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
            {phase === "bet" && (
              <>
                {/* Mine count */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4b5563" }}>Number of Mines</span>
                    <span style={{ fontSize: 11, color: "#4b5563" }}>1st pick: <span style={{ color: accent, fontWeight: 700 }}>{calcMultiplier(mineCount, 1)}×</span></span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
                    {MINE_COUNTS.map(m => (
                      <button key={m} onClick={() => setMineCount(m)}
                        style={{
                          padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "all 0.15s",
                          background: mineCount === m ? accent : "rgba(255,255,255,0.04)",
                          color: mineCount === m ? "#fff" : "#6b7280",
                          border: mineCount === m ? `1px solid ${accent}` : "1px solid var(--border)",
                          boxShadow: mineCount === m ? `0 0 16px ${accent}40` : "none",
                        }}>{m}B</button>
                    ))}
                  </div>
                </div>

                {/* Bet */}
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
                        color: betAmount === amt && customBet === "" ? "#fff" : "#6b7280",
                        border: betAmount === amt && customBet === "" ? `1px solid ${accent}` : "1px solid var(--border)",
                        opacity: amt > balance ? 0.4 : 1,
                      }}>{amt}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input type="number" min="0.01" max={balance} step="0.01" placeholder="Custom..."
                    value={customBet} onChange={e => setCustomBet(e.target.value)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit" }}/>
                  <button onClick={() => setCustomBet(balance.toFixed(2))} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#6b7280" }}>MAX</button>
                </div>
                {connected ? (
                  <button onClick={startGame} disabled={activeBet <= 0 || activeBet > balance}
                    className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #7c3aed)`, boxShadow: `0 4px 20px ${accent}40`, opacity: activeBet > balance ? 0.5 : 1 }}>
                    START GAME
                  </button>
                ) : (
                  <button onClick={connect} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>CONNECT WALLET</button>
                )}
              </>
            )}

            {phase === "playing" && (
              <button onClick={cashout} disabled={revealed === 0} className="btn-green"
                style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12, opacity: revealed === 0 ? 0.4 : 1 }}>
                {revealed === 0 ? "PICK A TILE FIRST" : `CASH OUT — ${currentPayout.toFixed(3)} ◎`}
              </button>
            )}

            {phase === "done" && (
              <button onClick={reset} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>
                PLAY AGAIN →
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 84 }}>
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

export default function MinesPage() {
  return <WalletProvider><MinesGame /></WalletProvider>;
}
