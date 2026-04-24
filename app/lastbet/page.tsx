"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";

const COUNTDOWN_MAX = 60;
const HOUSE_EDGE = 0.07;
const RADIUS = 85;
const CIRC = 2 * Math.PI * RADIUS;
const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];
const BOT_NAMES = ["whale69","sol_ape","degen44","moonboy","bigbrain","solgod","pumpit","rugged99","alpha99","wen_moon","ngmi","ghostflip","deathroll","solking","paperhands","diamondz"];
const BOT_SIZES = [0.1, 0.25, 0.5, 0.5, 1, 1, 2, 5];

const ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 6v6l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

interface BetEntry {
  id: string;
  player: string;
  amount: number;
  ts: number;
  isYou: boolean;
}

type Phase = "running" | "winner" | "restarting";

// Pick a hidden cutoff each round: somewhere between 3–52 seconds remaining
// When the countdown hits this value it snaps to 0 instantly — musical chairs
function pickSuddenDeath() { return Math.floor(Math.random() * 50) + 3; }

function LastBetGame() {
  const { connected, balance, updateBalance, connect } = useWallet();

  const [countdown, setCountdown]       = useState(COUNTDOWN_MAX);
  const [jackpot, setJackpot]           = useState(8.75);
  const [feed, setFeed]                 = useState<BetEntry[]>([]);
  const [lastBet, setLastBet]           = useState<BetEntry | null>(null);
  const [phase, setPhase]               = useState<Phase>("running");
  const [roundWinner, setRoundWinner]   = useState<BetEntry | null>(null);
  const [betAmount, setBetAmount]       = useState(0.5);
  const [customBet, setCustomBet]       = useState("");
  const [history, setHistory]           = useState<BetRecord[]>([]);
  const [playerInRound, setPlayerInRound] = useState(false);
  const [overtaken, setOvertaken]       = useState(false);
  const [totalBets, setTotalBets]       = useState(0);
  const [snapEffect, setSnapEffect]     = useState(false); // flash on sudden stop

  // Refs for interval access
  const countdownRef      = useRef(COUNTDOWN_MAX);
  const jackpotRef        = useRef(8.75);
  const lastBetRef        = useRef<BetEntry | null>(null);
  const phaseRef          = useRef<Phase>("running");
  const balanceRef        = useRef(balance);
  const playerLastRef     = useRef(false);
  const playerAmtRef      = useRef(0);
  const totalBetsRef      = useRef(0);
  const suddenDeathRef    = useRef(pickSuddenDeath()); // hidden cutoff, unknown to players

  useEffect(() => { balanceRef.current = balance; }, [balance]);

  const activeBet = customBet !== "" ? parseFloat(customBet) || 0 : betAmount;
  const ringColor = countdown > 30 ? "#10b981" : countdown > 10 ? "#f59e0b" : "#ef4444";
  const ringOffset = CIRC * (1 - countdown / COUNTDOWN_MAX);

  const addEntry = useCallback((entry: BetEntry) => {
    countdownRef.current   = COUNTDOWN_MAX;
    suddenDeathRef.current = pickSuddenDeath(); // new hidden cutoff after every bet reset
    jackpotRef.current     = parseFloat((jackpotRef.current + entry.amount).toFixed(3));
    lastBetRef.current     = entry;
    totalBetsRef.current  += 1;
    setCountdown(COUNTDOWN_MAX);
    setJackpot(jackpotRef.current);
    setLastBet(entry);
    setFeed(f => [entry, ...f].slice(0, 60));
    setTotalBets(totalBetsRef.current);
  }, []);

  const placeBet = useCallback(() => {
    if (!connected || activeBet <= 0 || activeBet > balanceRef.current || phaseRef.current !== "running") return;
    updateBalance(balanceRef.current - activeBet);

    const entry: BetEntry = { id: Math.random().toString(36).slice(2), player: "You", amount: activeBet, ts: Date.now(), isYou: true };

    // If bot was last bettor, flash "overtaken" reversal
    if (lastBetRef.current && !lastBetRef.current.isYou) {
      setOvertaken(false);
    }

    playerLastRef.current = true;
    playerAmtRef.current  = activeBet;
    setPlayerInRound(true);
    addEntry(entry);
    setCustomBet("");
  }, [connected, activeBet, updateBalance, addEntry]);

  // Main game loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (phaseRef.current !== "running") return;

      const next = countdownRef.current - 1;
      countdownRef.current = next;
      setCountdown(next);

      // ── MUSICAL CHAIRS: if we hit the hidden cutoff, snap to 0 ──
      const hitSuddenDeath = next <= suddenDeathRef.current && next > 0;
      if (hitSuddenDeath) {
        countdownRef.current = 0;
        setCountdown(0);
        setSnapEffect(true);
        setTimeout(() => setSnapEffect(false), 600);
      }

      if (next <= 0 || hitSuddenDeath) {
        // Round over
        phaseRef.current = "winner";
        setPhase("winner");
        const winner = lastBetRef.current;
        setRoundWinner(winner);

        if (winner?.isYou) {
          const payout = parseFloat((jackpotRef.current * (1 - HOUSE_EDGE)).toFixed(3));
          updateBalance(balanceRef.current + payout);
          setHistory(h => [...h, {
            id: Date.now().toString(), game: "Last Bet Wins",
            amount: playerAmtRef.current, result: "win", payout,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }]);
        } else if (playerLastRef.current) {
          setHistory(h => [...h, {
            id: Date.now().toString(), game: "Last Bet Wins",
            amount: playerAmtRef.current, result: "loss", payout: 0,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }]);
        }

        // Restart after 5s
        setTimeout(() => {
          const seed = parseFloat((Math.random() * 6 + 4).toFixed(2));
          countdownRef.current   = COUNTDOWN_MAX;
          jackpotRef.current     = seed;
          lastBetRef.current     = null;
          playerLastRef.current  = false;
          playerAmtRef.current   = 0;
          totalBetsRef.current   = 0;
          suddenDeathRef.current = pickSuddenDeath(); // new hidden cutoff every round
          phaseRef.current       = "running";
          setCountdown(COUNTDOWN_MAX);
          setJackpot(seed);
          setLastBet(null);
          setFeed([]);
          setRoundWinner(null);
          setPlayerInRound(false);
          setOvertaken(false);
          setTotalBets(0);
          setPhase("running");
        }, 5000);
        return;
      }

      // Bot bet probability — escalates as timer gets low
      let prob = 0.025;
      if (next < 40) prob = 0.05;
      if (next < 20) prob = 0.09;
      if (next < 10) prob = 0.16;
      if (next < 5)  prob = 0.28;

      if (Math.random() < prob) {
        const name   = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        const amount = BOT_SIZES[Math.floor(Math.random() * BOT_SIZES.length)];
        const entry: BetEntry = { id: Math.random().toString(36).slice(2), player: name, amount, ts: Date.now(), isYou: false };

        // If player was last and a bot overtakes them
        if (playerLastRef.current && lastBetRef.current?.isYou) {
          playerLastRef.current = false;
          setOvertaken(true);
          setTimeout(() => setOvertaken(false), 2500);
        }

        addEntry(entry);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [addEntry, updateBalance]);

  const isPlayerLast = lastBet?.isYou && phase === "running";
  const pnl = history.reduce((a, h) => a + (h.result === "win" ? h.payout - h.amount : -h.amount), 0);
  const accent = "#f97316";

  const isDanger = countdown <= 10 && phase === "running";
  const isCritical = countdown <= 5 && phase === "running";

  return (
    <GameLayout title="LAST BET WINS" accent={accent} icon={ICON}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Main arena */}
          <div className={isCritical ? "arena-shake" : ""} style={{
            background: isDanger
              ? `linear-gradient(145deg, #2a0800 0%, #3d1000 50%, #200600 100%)`
              : "linear-gradient(145deg, #1a0800 0%, #2a0f00 50%, #160700 100%)",
            border: `1px solid ${isDanger ? "rgba(239,68,68,0.4)" : `${accent}18`}`,
            borderRadius: 24, padding: 28,
            boxShadow: isDanger
              ? `0 0 80px rgba(239,68,68,0.15), 0 8px 40px rgba(0,0,0,0.6)`
              : `0 0 80px ${accent}06, 0 8px 40px rgba(0,0,0,0.6)`,
            position: "relative", overflow: "hidden",
            transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
          }}>
            {/* Danger pulse overlay */}
            {isDanger && (
              <div className="danger-pulse" style={{ position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none", zIndex: 1 }}/>
            )}
            {/* Ambient glow */}
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${isDanger ? "rgba(239,68,68,0.08)" : `${ringColor}06`} 0%, transparent 65%)`, pointerEvents: "none", transition: "background 0.5s ease" }}/>

            {/* Snap flash — fires when sudden death triggers */}
            {snapEffect && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 30, borderRadius: 24,
                background: "rgba(239,68,68,0.25)",
                animation: "snapFlash 0.5s ease-out forwards",
                pointerEvents: "none",
              }}/>
            )}

            {/* Winner overlay */}
            {phase === "winner" && roundWinner && (
              <div className="winner-blast" style={{
                position: "absolute", inset: 0, zIndex: 20, borderRadius: 24,
                background: roundWinner.isYou
                  ? "radial-gradient(ellipse at center, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.08) 60%, transparent 100%)"
                  : "radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 60%, transparent 100%)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
                backdropFilter: "blur(4px)",
              }}>
                {roundWinner.isYou ? (
                  <>
                    <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 42, color: "#10b981", textShadow: "0 0 60px #10b981, 0 0 120px #10b98160", letterSpacing: 4 }}>YOU WON!</div>
                    <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 28, color: "#fff", textShadow: "0 0 20px #10b981" }}>
                      +{(jackpot * (1 - HOUSE_EDGE)).toFixed(3)} ◎
                    </div>
                    <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: 3, textTransform: "uppercase" }}>New round starting...</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Round Over</div>
                    <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 26, color: "#ef4444", textShadow: "0 0 30px #ef4444", letterSpacing: 3 }}>
                      {roundWinner.player.toUpperCase()} WINS
                    </div>
                    <div style={{ fontSize: 16, color: "#9ca3af", fontWeight: 600 }}>
                      {(jackpot * (1 - HOUSE_EDGE)).toFixed(3)} ◎ claimed
                    </div>
                    {playerInRound && <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, letterSpacing: 1 }}>You were overtaken — better luck next round</div>}
                    <div style={{ fontSize: 11, color: "#374151", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>New round starting...</div>
                  </>
                )}
              </div>
            )}

            {/* Countdown ring + jackpot */}
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {/* Ring */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {/* Track */}
                  <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
                  {/* Progress */}
                  <circle
                    cx="100" cy="100" r={RADIUS}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 100 100)"
                    style={{
                      transition: "stroke-dashoffset 0.9s linear, stroke 0.4s ease",
                      filter: `drop-shadow(0 0 10px ${ringColor}) drop-shadow(0 0 20px ${ringColor}60)`,
                    }}
                  />
                  {/* Center */}
                  <text x="100" y="88" textAnchor="middle" fontSize="52" fontWeight="900" fill="white" fontFamily="monospace" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {countdown < 10 ? `0${countdown}` : countdown}
                  </text>
                  <text x="100" y="112" textAnchor="middle" fontSize="10" fill="#4b5563" fontFamily="monospace" letterSpacing="3">
                    SECONDS LEFT
                  </text>
                  {/* Inner glow ring */}
                  <circle cx="100" cy="100" r="70" fill="none" stroke={ringColor} strokeWidth="1" strokeOpacity=".08"/>
                </svg>

                {/* Pulse ring when under 10s */}
                {countdown <= 10 && phase === "running" && (
                  <div style={{
                    position: "absolute", inset: -8, borderRadius: "50%",
                    border: `2px solid ${ringColor}`,
                    animation: "pulse 1s ease-in-out infinite",
                    opacity: 0.4,
                  }}/>
                )}
              </div>

              {/* Jackpot + status */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Jackpot */}
                <div style={{
                  background: "rgba(245,197,24,0.05)", border: "1px solid rgba(245,197,24,0.15)",
                  borderRadius: 16, padding: "20px 24px",
                }}>
                  <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Current Jackpot</div>
                  <div style={{
                    fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 38,
                    color: "#f5c518", textShadow: "0 0 30px rgba(245,197,24,0.6)",
                    letterSpacing: 1, lineHeight: 1,
                  }}>
                    {jackpot.toFixed(3)} ◎
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 6 }}>
                    {totalBets} bets this round · You win {((1 - HOUSE_EDGE) * 100).toFixed(0)}% of pot
                  </div>
                </div>

                {/* Last bet status */}
                <div style={{
                  borderRadius: 14, padding: "16px 20px",
                  background: isPlayerLast
                    ? "rgba(16,185,129,0.08)"
                    : overtaken
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isPlayerLast ? "rgba(16,185,129,0.3)" : overtaken ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.3s ease",
                }}>
                  {isPlayerLast ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse 1s infinite" }}/>
                        <span style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 13, color: "#10b981", letterSpacing: 2 }}>YOU ARE THE LAST BET</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Don't let anyone overtake you. You win if the timer reaches 0.</div>
                    </div>
                  ) : overtaken ? (
                    <div>
                      <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 13, color: "#ef4444", letterSpacing: 2, marginBottom: 4 }}>SOMEONE OVERTOOK YOU!</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Bet again to reclaim the lead.</div>
                    </div>
                  ) : lastBet ? (
                    <div>
                      <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Last Bet</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "#9ca3af", fontSize: 13 }}>{lastBet.player}</span>
                        <span style={{ fontSize: 11, color: "#4b5563" }}>placed</span>
                        <span style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 800, fontSize: 13, color: accent }}>{lastBet.amount} ◎</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#374151" }}>No bets yet — be the first!</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bet controls */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#4b5563" }}>Your Bet</span>
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
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input type="number" min="0.01" max={balance} step="0.01" placeholder="Custom amount..."
                value={customBet} onChange={e => setCustomBet(e.target.value)}
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit" }}/>
              <button onClick={() => setCustomBet(balance.toFixed(2))} style={{ padding: "9px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#6b7280" }}>MAX</button>
            </div>
            {connected ? (
              <button onClick={placeBet}
                disabled={activeBet <= 0 || activeBet > balance || phase !== "running"}
                style={{
                  width: "100%", padding: "15px", fontSize: 15, letterSpacing: 3, borderRadius: 12, cursor: "pointer",
                  fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, border: "none",
                  background: phase !== "running" || activeBet <= 0 || activeBet > balance
                    ? "rgba(255,255,255,0.05)"
                    : isPlayerLast
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : `linear-gradient(135deg, ${accent}, #ea580c)`,
                  color: phase !== "running" || activeBet <= 0 || activeBet > balance ? "#374151" : "#fff",
                  boxShadow: phase === "running" && activeBet > 0 && activeBet <= balance
                    ? isPlayerLast ? "0 4px 24px rgba(16,185,129,0.4)" : `0 4px 24px ${accent}50`
                    : "none",
                  transition: "all 0.2s",
                }}>
                {phase !== "running"
                  ? "NEXT ROUND STARTING..."
                  : isPlayerLast
                  ? "BET AGAIN TO STAY ON TOP"
                  : `BET ${activeBet.toFixed(2)} ◎ — TAKE THE LEAD`}
              </button>
            ) : (
              <button onClick={connect} className="btn-primary" style={{ width: "100%", padding: "15px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>
                CONNECT WALLET
              </button>
            )}

            {/* How it works */}
            <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: "#4b5563", lineHeight: 1.8 }}>
                <span style={{ color: accent, fontWeight: 700 }}>How it works:</span> Every bet resets the timer and adds to the jackpot. The timer can <span style={{ color: "#ef4444", fontWeight: 700 }}>stop at any moment</span> — like musical chairs, nobody knows when. The <span style={{ color: "#fff", fontWeight: 600 }}>last bettor wins 96% of the pot.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 84 }}>

          {/* Live feed */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }}/>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151" }}>Live Bets</span>
            </div>
            {feed.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", fontSize: 11, color: "#374151" }}>Waiting for bets...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 300, overflowY: "auto" }}>
                {feed.map((entry, i) => (
                  <div key={entry.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "7px 10px", borderRadius: 8, fontSize: 11,
                    background: entry.isYou
                      ? "rgba(249,115,22,0.08)"
                      : i === 0
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.02)",
                    border: entry.isYou ? `1px solid rgba(249,115,22,0.25)` : i === 0 ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {i === 0 && <span style={{ fontSize: 9, color: "#f5c518" }}>★</span>}
                      <span style={{ color: entry.isYou ? accent : "#6b7280", fontWeight: entry.isYou ? 700 : 400 }}>
                        {entry.player}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 700, fontSize: 10, color: entry.isYou ? accent : "#4b5563" }}>
                      {entry.amount} ◎
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 16 }}>Session Stats</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { label: "Rounds played", value: history.length, color: "#fff" },
                { label: "Won", value: history.filter(h => h.result === "win").length, color: "#10b981" },
                { label: "Lost", value: history.filter(h => h.result === "loss").length, color: "#ef4444" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#4b5563" }}>{s.label}</span>
                  <span style={{ fontWeight: 700, color: s.color, fontFamily: "var(--font-orbitron, monospace)" }}>{s.value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 11, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.04); }
        }
        @keyframes snapFlash {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </GameLayout>
  );
}

export default function LastBetPage() {
  return <WalletProvider><LastBetGame /></WalletProvider>;
}
