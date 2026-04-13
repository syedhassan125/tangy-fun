"use client";
import { useState, useCallback } from "react";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";

/* ── Card types & deck ── */
type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K";
interface Card { rank: Rank; suit: Suit; hidden?: boolean }
const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS: Suit[] = ["♠","♥","♦","♣"];
const RED_SUITS: Suit[] = ["♥","♦"];
const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];

const ICON = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="4" width="13" height="17" rx="2" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5"/>
  <rect x="9" y="2" width="13" height="17" rx="2" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.5"/>
  <text x="15.5" y="14" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" fontFamily="serif">A</text>
  <text x="15.5" y="16.5" textAnchor="middle" fontSize="5" fill="currentColor" fontFamily="serif">♠</text>
</svg>;

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}
function cardValue(rank: Rank): number { if (rank === "A") return 11; if (["J","Q","K"].includes(rank)) return 10; return parseInt(rank); }
function handValue(cards: Card[]): number { const vis = cards.filter(c => !c.hidden); let t = vis.reduce((s,c) => s + cardValue(c.rank), 0); let a = vis.filter(c => c.rank === "A").length; while (t > 21 && a > 0) { t -= 10; a--; } return t; }
function fullHandValue(cards: Card[]): number { let t = cards.reduce((s,c) => s + cardValue(c.rank), 0); let a = cards.filter(c => c.rank === "A").length; while (t > 21 && a > 0) { t -= 10; a--; } return t; }
function isBlackjack(cards: Card[]): boolean { return cards.length === 2 && fullHandValue(cards) === 21; }

/* ── Playing Card ── */
function PlayingCard({ card, animDelay = 0 }: { card: Card; animDelay?: number }) {
  if (card.hidden) {
    return (
      <div className="card-flip" style={{ animationDelay: `${animDelay}ms`, flexShrink: 0, width: 70, height: 98, borderRadius: 10, background: "linear-gradient(135deg, #1a0030 0%, #0d0020 100%)", border: "1px solid rgba(168,85,247,0.4)", boxShadow: "0 6px 20px rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>🂠</div>
      </div>
    );
  }
  const isRed = RED_SUITS.includes(card.suit);
  return (
    <div className="card-flip" style={{
      animationDelay: `${animDelay}ms`, flexShrink: 0,
      width: 70, height: 98, borderRadius: 10,
      padding: "6px 7px", userSelect: "none",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      background: isRed ? "linear-gradient(145deg, #1a0505, #0f0303)" : "linear-gradient(145deg, #08080f, #050508)",
      border: `1px solid ${isRed ? "rgba(239,68,68,0.45)" : "rgba(200,200,200,0.2)"}`,
      boxShadow: `0 6px 20px rgba(0,0,0,0.8), 0 0 10px ${isRed ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)"}`,
      color: isRed ? "#ef4444" : "#e5e7eb",
      fontWeight: 800, fontSize: 14,
    }}>
      <div style={{ lineHeight: 1.1 }}>{card.rank}<br/>{card.suit}</div>
      <div style={{ alignSelf: "flex-end", transform: "rotate(180deg)", lineHeight: 1.1 }}>{card.rank}<br/>{card.suit}</div>
    </div>
  );
}

/* ── Hand display ── */
function Hand({ cards, label, score, isDealer }: { cards: Card[]; label: string; score: number; isDealer?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151" }}>{label}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {cards.map((card, i) => <PlayingCard key={i} card={card} animDelay={i * 120} />)}
      </div>
      {score > 0 && (
        <div style={{
          fontFamily: "var(--font-orbitron, monospace)", fontWeight: 800, fontSize: 16,
          color: score > 21 ? "#ef4444" : score === 21 ? "#10b981" : isDealer ? "#a78bfa" : "#fff",
          textShadow: score === 21 ? "0 0 12px #10b981" : "none",
        }}>
          {score > 21 ? `BUST (${score})` : score === 21 ? "21 ★" : score}
        </div>
      )}
    </div>
  );
}

type Phase = "bet" | "playing" | "dealer" | "done";
interface GameResult { outcome: "blackjack"|"win"|"loss"|"push"; message: string; payout: number; }

function BlackjackGame() {
  const { connected, balance, updateBalance, connect } = useWallet();
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("bet");
  const [betAmount, setBetAmount] = useState(0.5);
  const [customBet, setCustomBet] = useState("");
  const [result, setResult] = useState<GameResult | null>(null);
  const [history, setHistory] = useState<BetRecord[]>([]);
  const [dealing, setDealing] = useState(false);

  const activeBet = customBet !== "" ? parseFloat(customBet) || 0 : betAmount;
  const playerScore = handValue(playerCards);
  const dealerScore = handValue(dealerCards);
  const pnl = history.reduce((a, h) => a + (h.result === "win" ? h.payout : -h.amount), 0);

  const deal = useCallback(async () => {
    if (!connected || activeBet <= 0 || activeBet > balance || dealing) return;
    setDealing(true); setResult(null);
    const newDeck = makeDeck();
    const p1 = newDeck.pop()!, d1 = newDeck.pop()!, p2 = newDeck.pop()!, d2 = { ...newDeck.pop()!, hidden: true };
    setDeck(newDeck); setPlayerCards([p1, p2]); setDealerCards([d1, d2]); setPhase("playing"); setDealing(false);
    if (isBlackjack([p1, p2])) await resolveGame([p1, p2], [d1, { ...d2, hidden: false }], newDeck, activeBet, true);
  }, [connected, activeBet, balance, dealing]);

  const hit = useCallback(async () => {
    if (phase !== "playing" || dealing) return;
    const newCard = deck[deck.length - 1], newDeck = deck.slice(0, -1), newPlayer = [...playerCards, newCard];
    setDeck(newDeck); setPlayerCards(newPlayer);
    if (fullHandValue(newPlayer) >= 21) await runDealer(newPlayer, dealerCards.map(c => ({ ...c, hidden: false })), newDeck, activeBet);
  }, [phase, dealing, deck, playerCards, dealerCards, activeBet]);

  const stand = useCallback(async () => {
    if (phase !== "playing" || dealing) return;
    await runDealer(playerCards, dealerCards.map(c => ({ ...c, hidden: false })), deck, activeBet);
  }, [phase, dealing, playerCards, dealerCards, deck, activeBet]);

  const double = useCallback(async () => {
    if (phase !== "playing" || dealing || playerCards.length !== 2 || activeBet * 2 > balance) return;
    const newCard = deck[deck.length - 1], newDeck = deck.slice(0, -1), newPlayer = [...playerCards, newCard];
    setDeck(newDeck); setPlayerCards(newPlayer);
    await runDealer(newPlayer, dealerCards.map(c => ({ ...c, hidden: false })), newDeck, activeBet * 2);
  }, [phase, dealing, deck, playerCards, dealerCards, balance, activeBet]);

  async function runDealer(finalPlayer: Card[], revealedDealer: Card[], currentDeck: Card[], bet: number) {
    setPhase("dealer"); setDealerCards(revealedDealer);
    let dCards = [...revealedDealer], dDeck = [...currentDeck];
    await new Promise(r => setTimeout(r, 600));
    while (fullHandValue(dCards) < 17) {
      const newCard = dDeck.pop()!; dCards = [...dCards, newCard]; setDealerCards([...dCards]);
      await new Promise(r => setTimeout(r, 500));
    }
    await resolveGame(finalPlayer, dCards, dDeck, bet, false);
  }

  async function resolveGame(finalPlayer: Card[], finalDealer: Card[], _: Card[], bet: number, playerBJ: boolean) {
    const pVal = fullHandValue(finalPlayer), dVal = fullHandValue(finalDealer);
    let outcome: GameResult["outcome"]; let payout = 0;
    if (playerBJ && !isBlackjack(finalDealer)) { outcome = "blackjack"; payout = bet * 1.5; }
    else if (pVal > 21) { outcome = "loss"; }
    else if (dVal > 21 || pVal > dVal) { outcome = "win"; payout = bet; }
    else if (pVal === dVal) { outcome = "push"; payout = 0; }
    else { outcome = "loss"; }
    const messages = { blackjack: "BLACKJACK! 🃏", win: "YOU WIN! 🎉", loss: "DEALER WINS 💀", push: "PUSH" };
    const balanceChange = outcome === "blackjack" ? payout : outcome === "win" ? payout : outcome === "push" ? 0 : -bet;
    updateBalance(balance + balanceChange);
    setResult({ outcome, message: messages[outcome], payout });
    setPhase("done");
    setHistory(h => [...h, { id: Date.now().toString(), game: playerBJ ? "Blackjack (BJ!)" : "Blackjack", amount: bet, result: outcome === "win" || outcome === "blackjack" ? "win" : "loss", payout: outcome === "blackjack" ? payout : outcome === "win" ? payout : 0, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  }

  const newGame = () => { setPlayerCards([]); setDealerCards([]); setResult(null); setPhase("bet"); };

  const resultAccent = result?.outcome === "win" || result?.outcome === "blackjack" ? "#10b981" : result?.outcome === "push" ? "#06b6d4" : "#ef4444";
  const accent = "#ef4444";

  return (
    <GameLayout title="BLACKJACK" accent={accent} icon={ICON}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

        {/* LEFT: table + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Table */}
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(145deg, #001a08 0%, #002a10 50%, #001208 100%)",
            border: "1px solid rgba(16,185,129,0.15)",
            boxShadow: "0 0 60px rgba(16,185,129,0.05), 0 8px 40px rgba(0,0,0,0.6)",
            padding: "28px 24px", display: "flex", flexDirection: "column", gap: 0,
          }}>
            {/* Dealer zone */}
            <div style={{
              minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "20px", background: "rgba(0,0,0,0.2)", borderRadius: 14,
              border: "1px solid rgba(16,185,129,0.08)", marginBottom: 16,
            }}>
              {dealerCards.length > 0
                ? <Hand cards={dealerCards} label="Dealer" score={phase === "playing" ? dealerScore : fullHandValue(dealerCards)} isDealer />
                : <div style={{ fontSize: 12, color: "#1f2937", letterSpacing: 4, textTransform: "uppercase" }}>Dealer</div>
              }
            </div>

            {/* VS divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(16,185,129,0.08)" }}/>
              <div style={{ fontSize: 10, color: "#1f2937", letterSpacing: 4, fontWeight: 700 }}>VS</div>
              <div style={{ flex: 1, height: 1, background: "rgba(16,185,129,0.08)" }}/>
            </div>

            {/* Player zone */}
            <div style={{
              minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "20px", background: "rgba(0,0,0,0.15)", borderRadius: 14,
              border: "1px solid rgba(16,185,129,0.08)",
            }}>
              {playerCards.length > 0
                ? <Hand cards={playerCards} label="You" score={playerScore} />
                : <div style={{ fontSize: 12, color: "#1f2937", letterSpacing: 4, textTransform: "uppercase" }}>Your Hand</div>
              }
            </div>
          </div>

          {/* Result */}
          {result && (
            <div style={{
              padding: "16px 20px", borderRadius: 14, textAlign: "center",
              background: `${resultAccent}10`, border: `1px solid ${resultAccent}35`,
              boxShadow: `0 0 20px ${resultAccent}15`,
            }}>
              <div style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 22, color: resultAccent, letterSpacing: 3, textShadow: `0 0 20px ${resultAccent}`, marginBottom: 4 }}>
                {result.message}
              </div>
              {result.outcome !== "push" && (
                <div style={{ fontSize: 13, color: resultAccent }}>
                  {result.outcome === "win" || result.outcome === "blackjack" ? `+${result.payout.toFixed(3)} ◎` : `-${activeBet.toFixed(3)} ◎`}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
            {phase === "bet" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
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
                  <input type="number" min="0.05" max={balance} step="0.05" placeholder="Custom bet..."
                    value={customBet} onChange={e => setCustomBet(e.target.value)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "inherit" }}/>
                  <button onClick={() => setCustomBet(balance.toFixed(2))} style={{ padding: "9px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "#6b7280" }}>MAX</button>
                </div>
                {connected ? (
                  <button onClick={deal} disabled={activeBet <= 0 || activeBet > balance || dealing}
                    className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12, background: `linear-gradient(135deg, ${accent}, #b91c1c)`, boxShadow: `0 4px 20px ${accent}40`, opacity: activeBet > balance || dealing ? 0.5 : 1 }}>
                    {dealing ? "DEALING..." : "DEAL CARDS"}
                  </button>
                ) : (
                  <button onClick={connect} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>CONNECT WALLET</button>
                )}
              </>
            )}

            {phase === "playing" && (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={hit} className="btn-green" style={{ flex: 1, padding: "13px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>HIT</button>
                <button onClick={stand} className="btn-red" style={{ flex: 1, padding: "13px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>STAND</button>
                {playerCards.length === 2 && activeBet * 2 <= balance && (
                  <button onClick={double} className="btn-primary" style={{ flex: 1, padding: "13px", fontSize: 13, letterSpacing: 1, borderRadius: 12 }}>DOUBLE</button>
                )}
              </div>
            )}

            {phase === "dealer" && (
              <div style={{ padding: "14px", textAlign: "center", fontSize: 12, color: "#374151", letterSpacing: 3, textTransform: "uppercase" }}>
                Dealer playing...
              </div>
            )}

            {phase === "done" && (
              <button onClick={newGame} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: 2, borderRadius: 12 }}>
                NEW HAND →
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
                { label: "Hands played", value: history.length, color: "#fff" },
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

          {/* Rules */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", marginBottom: 14 }}>Rules</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Blackjack pays", "3:2", "#10b981"],
                ["Dealer stands", "Soft 17", "#fff"],
                ["Double on", "Any 2 cards", "#fff"],
                ["House edge", "~0.5%", "#a78bfa"],
              ].map(([label, val, color]) => (
                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#4b5563" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: color as string }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <BetHistory history={history} />
        </div>
      </div>
    </GameLayout>
  );
}

export default function BlackjackPage() {
  return <WalletProvider><BlackjackGame /></WalletProvider>;
}
