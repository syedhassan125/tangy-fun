"use client";
import { useState } from "react";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";

/* ─── Types ─── */
type Suit = "♠" | "♥" | "♦" | "♣";
type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
interface Card { value: CardValue; suit: Suit; }
type Phase = "idle" | "waiting" | "revealing" | "cashed" | "bust";

/* ─── Constants ─── */
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RED_SUITS = new Set<Suit>(["♥", "♦"]);
const FACE: Record<number, string> = { 11: "J", 12: "Q", 13: "K", 14: "A" };
const HOUSE_EDGE = 0.03;
const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];
const ACCENT = "#ec4899";

const ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="3" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 8l3-3 3 3M9 16l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1" strokeOpacity=".3" />
  </svg>
);

/* ─── Helpers ─── */
function lbl(v: CardValue): string { return (FACE[v] ?? String(v)) as string; }

function randCard(): Card {
  return {
    value: (Math.floor(Math.random() * 13) + 2) as CardValue,
    suit: SUITS[Math.floor(Math.random() * 4)],
  };
}

// Higher-or-Same: probability = (15 - v) / 13  (fresh 52-card draw)
// Lower-or-Same:  probability = (v - 1) / 13
function hiMult(v: CardValue): number {
  const p = (15 - v) / 13;
  if (p <= 0) return 50;
  return Math.max(1.0, Math.round(((1 - HOUSE_EDGE) / p) * 100) / 100);
}
function loMult(v: CardValue): number {
  const p = (v - 1) / 13;
  if (p <= 0) return 50;
  return Math.max(1.0, Math.round(((1 - HOUSE_EDGE) / p) * 100) / 100);
}
function hiPct(v: CardValue): number { return Math.round(Math.min(100, ((15 - v) / 13) * 100)); }
function loPct(v: CardValue): number { return Math.round(Math.min(100, ((v - 1) / 13) * 100)); }

/* ─── Playing Card Component ─── */
function PlayingCard({ card, size = "lg", dimmed = false }: { card: Card; size?: "sm" | "lg"; dimmed?: boolean }) {
  const isRed = RED_SUITS.has(card.suit);
  const w = size === "lg" ? 110 : 58;
  const h = size === "lg" ? 154 : 82;
  const fz = size === "lg" ? 26 : 14;
  const sz = size === "lg" ? 20 : 11;
  const corner = size === "lg" ? 14 : 8;
  const pad = size === "lg" ? 8 : 5;
  const textColor = isRed ? "#dc2626" : "#0f172a";

  return (
    <div style={{
      width: w, height: h, borderRadius: corner, flexShrink: 0,
      background: "#fff",
      border: `2px solid ${isRed ? "rgba(220,38,38,0.35)" : "rgba(15,23,42,0.25)"}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative",
      boxShadow: `0 ${size === "lg" ? 10 : 5}px ${size === "lg" ? 30 : 14}px rgba(0,0,0,0.65)`,
      opacity: dimmed ? 0.45 : 1,
      transition: "opacity 0.3s",
    }}>
      <div style={{ position: "absolute", top: pad, left: pad, lineHeight: 1.1, textAlign: "center" }}>
        <div style={{ fontSize: size === "lg" ? 13 : 7, fontWeight: 900, color: textColor }}>{lbl(card.value)}</div>
        <div style={{ fontSize: size === "lg" ? 11 : 6, color: textColor }}>{card.suit}</div>
      </div>
      <div style={{ fontSize: fz, color: textColor, fontFamily: "Georgia,serif", fontWeight: 900, lineHeight: 1 }}>{lbl(card.value)}</div>
      <div style={{ fontSize: sz, color: textColor }}>{card.suit}</div>
      <div style={{ position: "absolute", bottom: pad, right: pad, lineHeight: 1.1, textAlign: "center", transform: "rotate(180deg)" }}>
        <div style={{ fontSize: size === "lg" ? 13 : 7, fontWeight: 900, color: textColor }}>{lbl(card.value)}</div>
        <div style={{ fontSize: size === "lg" ? 11 : 6, color: textColor }}>{card.suit}</div>
      </div>
    </div>
  );
}

/* ─── Direction Button ─── */
function DirButton({ dir, mult, pct, onClick, disabled, active, won }: {
  dir: "hi" | "lo"; mult: number; pct: number;
  onClick: () => void; disabled: boolean; active: boolean; won: boolean | null;
}) {
  const resultColor = won === true ? "#10b981" : won === false ? "#ef4444" : ACCENT;
  const bg = active ? (won === true ? "rgba(16,185,129,0.15)" : won === false ? "rgba(239,68,68,0.15)" : `rgba(236,72,153,0.18)`) : "rgba(236,72,153,0.06)";
  const border = active ? `2px solid ${resultColor}` : `2px solid ${ACCENT}30`;
  const iconColor = active && won !== null ? resultColor : ACCENT;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: 84, height: 84, borderRadius: 18,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          cursor: disabled ? "default" : "pointer",
          background: bg, border,
          boxShadow: active && won !== null ? `0 0 24px ${resultColor}44` : "none",
          transition: "all 0.2s",
          opacity: !active && disabled ? 0.3 : 1,
        }}
      >
        <span style={{ fontSize: 22, color: iconColor, lineHeight: 1 }}>{dir === "hi" ? "▲" : "▼"}</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: iconColor, letterSpacing: 1 }}>{dir.toUpperCase()}</span>
      </button>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{mult}×</div>
        <div style={{ fontSize: 10, color: "#4b5563" }}>{pct}% win</div>
      </div>
    </div>
  );
}

/* ─── Main Game ─── */
function HiLoGame() {
  const { connected, balance, updateBalance, connect } = useWallet();

  const [phase, setPhase] = useState<Phase>("idle");
  const [card, setCard] = useState<Card | null>(null);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [betAmount, setBetAmount] = useState(0.1);
  const [customBet, setCustomBet] = useState("");
  const [accMult, setAccMult] = useState(1.0);
  const [initBet, setInitBet] = useState(0);
  const [lastChoice, setLastChoice] = useState<"hi" | "lo" | null>(null);
  const [wonLast, setWonLast] = useState<boolean | null>(null);
  const [trail, setTrail] = useState<Array<{ card: Card; choice: "hi" | "lo"; won: boolean }>>([]);
  const [history, setHistory] = useState<BetRecord[]>([]);

  const activeBet = customBet !== "" ? parseFloat(customBet) || 0 : betAmount;
  const potWin = +(initBet * accMult).toFixed(4);
  const pnl = history.reduce((a, h) => a + (h.result === "win" ? h.payout - h.amount : -h.amount), 0);
  const isActive = phase === "waiting" || phase === "revealing";

  const deal = async () => {
    if (!connected || activeBet <= 0 || activeBet > balance || phase !== "idle") return;
    updateBalance(balance - activeBet);
    setInitBet(activeBet);
    setAccMult(1.0);
    setTrail([]);
    setLastChoice(null);
    setWonLast(null);
    setDrawnCard(null);
    setCard(randCard());
    setPhase("waiting");
  };

  const choose = async (choice: "hi" | "lo") => {
    if (!card || phase !== "waiting") return;
    setLastChoice(choice);
    setWonLast(null);
    setPhase("revealing");

    // brief pause before revealing
    await new Promise(r => setTimeout(r, 480));

    const drawn = randCard();
    const won = choice === "hi" ? drawn.value >= card.value : drawn.value <= card.value;
    const stepMult = choice === "hi" ? hiMult(card.value) : loMult(card.value);

    setDrawnCard(drawn);
    setWonLast(won);
    setTrail(t => [...t, { card, choice, won }]);

    // show result briefly
    await new Promise(r => setTimeout(r, 900));

    if (won) {
      const newAcc = +(accMult * stepMult).toFixed(4);
      setAccMult(newAcc);
      setCard(drawn);
      setDrawnCard(null);
      setLastChoice(null);
      setWonLast(null);
      setPhase("waiting");
    } else {
      setPhase("bust");
      setHistory(h => [...h, {
        id: Date.now().toString(), game: "Hi-Lo",
        amount: initBet, result: "loss", payout: 0,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  };

  const cashOut = () => {
    if (phase !== "waiting" || accMult <= 1) return;
    updateBalance(balance + potWin);
    setPhase("cashed");
    setHistory(h => [...h, {
      id: Date.now().toString(), game: "Hi-Lo",
      amount: initBet, result: "win", payout: potWin,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  const reset = () => {
    setPhase("idle");
    setCard(null);
    setDrawnCard(null);
    setLastChoice(null);
    setWonLast(null);
    setAccMult(1);
    setInitBet(0);
    setTrail([]);
  };

  return (
    <GameLayout title="HI-LO" accent={ACCENT} icon={ICON}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

        {/* ── LEFT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Arena */}
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(145deg, #12001a 0%, #1e0030 60%, #0a0012 100%)",
            border: "1px solid rgba(236,72,153,0.2)",
            boxShadow: "0 0 60px rgba(236,72,153,0.06), 0 8px 40px rgba(0,0,0,0.5)",
            minHeight: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 28, position: "relative", padding: "32px 24px",
          }}>
            {/* Grid overlay */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(236,72,153,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(236,72,153,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
            {/* Glow */}
            <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 70%)", filter: "blur(50px)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

            <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 580, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

              {/* Card trail */}
              {trail.length > 0 && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", justifyContent: "center" }}>
                  {trail.slice(-6).map((t, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <PlayingCard card={t.card} size="sm" />
                      <div style={{
                        fontSize: 14, fontWeight: 900,
                        color: t.won ? "#10b981" : "#ef4444",
                        textShadow: `0 0 8px ${t.won ? "#10b981" : "#ef4444"}`,
                      }}>
                        {t.choice === "hi" ? "▲" : "▼"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* IDLE */}
              {phase === "idle" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 72, marginBottom: 16, filter: "drop-shadow(0 0 28px rgba(236,72,153,0.55))" }}>🃏</div>
                  <div style={{ fontFamily: "var(--font-orbitron,monospace)", fontSize: 22, color: "#fff", fontWeight: 900, letterSpacing: 4, marginBottom: 12 }}>HI-LO</div>
                  <div style={{ fontSize: 12, color: "#374151", letterSpacing: 2 }}>GUESS HIGHER OR LOWER · COMPOUND YOUR MULTIPLIER</div>
                </div>
              )}

              {/* ACTIVE: HI button · Card · LO button */}
              {isActive && card && (
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                  <DirButton
                    dir="hi"
                    mult={hiMult(card.value)}
                    pct={hiPct(card.value)}
                    onClick={() => choose("hi")}
                    disabled={phase !== "waiting"}
                    active={lastChoice === "hi"}
                    won={lastChoice === "hi" ? wonLast : null}
                  />

                  {/* Center: cards */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    {drawnCard ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <PlayingCard card={card} size="lg" dimmed />
                        <div style={{ fontSize: 22, color: wonLast === true ? "#10b981" : wonLast === false ? "#ef4444" : "#fff", textShadow: wonLast !== null ? `0 0 12px ${wonLast ? "#10b981" : "#ef4444"}` : "none" }}>
                          →
                        </div>
                        <PlayingCard card={drawnCard} size="lg" />
                      </div>
                    ) : (
                      <PlayingCard card={card} size="lg" />
                    )}

                    {/* Drawing indicator */}
                    {phase === "revealing" && wonLast === null && (
                      <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: 3, textTransform: "uppercase" }}>Drawing...</div>
                    )}

                    {/* Result */}
                    {phase === "revealing" && wonLast !== null && (
                      <div style={{
                        fontSize: 15, fontWeight: 900, letterSpacing: 2,
                        color: wonLast ? "#10b981" : "#ef4444",
                        textShadow: `0 0 14px ${wonLast ? "#10b981" : "#ef4444"}`,
                      }}>
                        {wonLast ? "✓ CORRECT!" : "✗ WRONG!"}
                      </div>
                    )}

                    {/* Cash out */}
                    {phase === "waiting" && accMult > 1 && (
                      <button onClick={cashOut} style={{
                        padding: "9px 22px", borderRadius: 9, fontSize: 12, fontWeight: 800,
                        letterSpacing: 1, cursor: "pointer",
                        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
                        color: "#10b981", transition: "all 0.15s",
                      }}>
                        CASH OUT · {potWin.toFixed(3)} ◎
                      </button>
                    )}
                  </div>

                  <DirButton
                    dir="lo"
                    mult={loMult(card.value)}
                    pct={loPct(card.value)}
                    onClick={() => choose("lo")}
                    disabled={phase !== "waiting"}
                    active={lastChoice === "lo"}
                    won={lastChoice === "lo" ? wonLast : null}
                  />
                </div>
              )}

              {/* Multiplier counter */}
              {isActive && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#374151", letterSpacing: 3, marginBottom: 5 }}>ACCUMULATED MULTIPLIER</div>
                  <div style={{
                    fontFamily: "var(--font-orbitron,monospace)", fontSize: 30, fontWeight: 900,
                    color: ACCENT, textShadow: `0 0 28px ${ACCENT}88`,
                  }}>
                    {accMult.toFixed(2)}×
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3 }}>Potential payout: {potWin.toFixed(3)} ◎</div>
                </div>
              )}

              {/* CASHED / BUST */}
              {(phase === "cashed" || phase === "bust") && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  {phase === "cashed" ? (
                    <>
                      <div style={{ fontFamily: "var(--font-orbitron,monospace)", fontWeight: 900, fontSize: 30, color: "#10b981", textShadow: "0 0 28px #10b981", marginBottom: 10 }}>
                        CASHED OUT!
                      </div>
                      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
                        Won <span style={{ color: "#10b981", fontWeight: 800 }}>{potWin.toFixed(3)} ◎</span>
                        {" "}at <span style={{ color: "#fff", fontWeight: 700 }}>{accMult.toFixed(2)}×</span>
                        {trail.length > 0 && <> after <span style={{ color: "#fff", fontWeight: 700 }}>{trail.length}</span> correct {trail.length === 1 ? "guess" : "guesses"}</>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "var(--font-orbitron,monospace)", fontWeight: 900, fontSize: 30, color: "#ef4444", textShadow: "0 0 28px #ef4444", marginBottom: 10 }}>
                        BUSTED!
                      </div>
                      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
                        Lost <span style={{ color: "#ef4444", fontWeight: 800 }}>{initBet.toFixed(3)} ◎</span>
                        {trail.length > 0 && <> after <span style={{ color: "#fff", fontWeight: 700 }}>{trail.length}</span> correct {trail.length === 1 ? "guess" : "guesses"}</>}
                      </div>
                    </>
                  )}
                  <button onClick={reset} className="btn-primary"
                    style={{ padding: "13px 40px", fontSize: 13, letterSpacing: 2, borderRadius: 12 }}>
                    PLAY AGAIN
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Bet Controls */}
          {(phase === "idle" || phase === "cashed" || phase === "bust") && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4b5563" }}>Bet Amount</span>
                <span style={{ fontSize: 12, color: "#4b5563" }}>Balance: <span style={{ color: "#10b981", fontWeight: 700 }}>{balance.toFixed(3)} ◎</span></span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 12 }}>
                {BET_AMOUNTS.map(amt => (
                  <button key={amt} onClick={() => { setBetAmount(amt); setCustomBet(""); }}
                    disabled={amt > balance}
                    style={{
                      padding: "9px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                      background: betAmount === amt && !customBet ? ACCENT : "rgba(255,255,255,0.04)",
                      color: betAmount === amt && !customBet ? "#000" : "#6b7280",
                      border: betAmount === amt && !customBet ? `1px solid ${ACCENT}` : "1px solid var(--border)",
                      opacity: amt > balance ? 0.4 : 1,
                    }}>{amt}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type="number" min="0.01" max={balance} step="0.01" placeholder="Custom amount..."
                  value={customBet} onChange={e => setCustomBet(e.target.value)}
                  style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit" }} />
                {([["MAX", () => setCustomBet(balance.toFixed(2))], ["½", () => setCustomBet((activeBet / 2).toFixed(2))], ["2×", () => setCustomBet((activeBet * 2).toFixed(2))]] as [string, () => void][]).map(([lbl2, fn]) => (
                  <button key={lbl2} onClick={fn}
                    style={{ padding: "9px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#6b7280", transition: "all 0.15s" }}>
                    {lbl2}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#374151", padding: "8px 4px 14px" }}>
                <span>Bet: <span style={{ color: "#fff", fontWeight: 600 }}>{activeBet.toFixed(3)} ◎</span></span>
                <span>House Edge: <span style={{ color: ACCENT, fontWeight: 600 }}>3%</span></span>
                <span>Max Win: <span style={{ color: ACCENT, fontWeight: 600 }}>∞</span></span>
              </div>
              {connected ? (
                <button onClick={deal} disabled={activeBet <= 0 || activeBet > balance}
                  style={{
                    width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12,
                    fontWeight: 900, cursor: activeBet > 0 && activeBet <= balance ? "pointer" : "default",
                    background: activeBet > 0 && activeBet <= balance ? ACCENT : "rgba(236,72,153,0.15)",
                    color: "#fff", border: "none", fontFamily: "var(--font-orbitron,monospace)",
                    opacity: activeBet <= 0 || activeBet > balance ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}>
                  DEAL CARD
                </button>
              ) : (
                <button onClick={connect} className="btn-primary"
                  style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>
                  CONNECT WALLET
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 84 }}>

          {/* Active Round */}
          {isActive && (
            <div style={{ background: "var(--bg-card)", border: `1px solid ${ACCENT}22`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 14 }}>Active Round</div>
              {([
                { label: "Initial bet", value: `${initBet.toFixed(3)} ◎`, color: "#fff" },
                { label: "Multiplier", value: `${accMult.toFixed(2)}×`, color: ACCENT },
                { label: "Cash out now", value: `${potWin.toFixed(3)} ◎`, color: "#10b981" },
                { label: "Guesses won", value: trail.filter(t => t.won).length, color: "#10b981" },
              ] as { label: string; value: string | number; color: string }[]).map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                  <span style={{ color: "#4b5563" }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color, fontFamily: "var(--font-orbitron,monospace)" }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Current Card Odds */}
          {card && isActive && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 12 }}>Card Odds</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {([
                  { dir: "▲ HIGHER", mult: hiMult(card.value), pct: hiPct(card.value) },
                  { dir: "▼ LOWER", mult: loMult(card.value), pct: loPct(card.value) },
                ]).map(o => (
                  <div key={o.dir} style={{ background: `rgba(236,72,153,0.06)`, border: `1px solid ${ACCENT}22`, borderRadius: 10, padding: "14px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: "#374151", marginBottom: 6 }}>{o.dir}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "var(--font-orbitron,monospace)" }}>{o.mult}×</div>
                    <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{o.pct}% win</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Stats */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 14 }}>Session Stats</div>
            {([
              { label: "Bets placed", value: history.length, color: "#fff" },
              { label: "Wins", value: history.filter(h => h.result === "win").length, color: "#10b981" },
              { label: "Losses", value: history.filter(h => h.result === "loss").length, color: "#ef4444" },
            ] as { label: string; value: number; color: string }[]).map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                <span style={{ color: "#4b5563" }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: s.color, fontFamily: "var(--font-orbitron,monospace)" }}>{s.value}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#4b5563" }}>P&L</span>
              <span style={{ fontWeight: 800, color: pnl >= 0 ? "#10b981" : "#ef4444", fontFamily: "var(--font-orbitron,monospace)" }}>
                {pnl >= 0 ? "+" : ""}{pnl.toFixed(3)} ◎
              </span>
            </div>
          </div>

          <BetHistory history={history} />
        </div>
      </div>
    </GameLayout>
  );
}

export default function HiLoPage() {
  return <WalletProvider><HiLoGame /></WalletProvider>;
}
