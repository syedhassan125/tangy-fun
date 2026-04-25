"use client";
import { useState, useCallback } from "react";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";
import WinEffect from "../components/WinEffect";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K";
interface Card { rank: Rank; suit: Suit; hidden?: boolean }

const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS: Suit[] = ["♠","♥","♦","♣"];
const RED: Suit[] = ["♥","♦"];
const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];
const CHIP_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "0.1":  { bg:"#6b7280", border:"#9ca3af", text:"#fff" },
  "0.25": { bg:"#3b82f6", border:"#60a5fa", text:"#fff" },
  "0.5":  { bg:"#ef4444", border:"#f87171", text:"#fff" },
  "1":    { bg:"#f59e0b", border:"#fbbf24", text:"#000" },
  "2":    { bg:"#8b5cf6", border:"#a78bfa", text:"#fff" },
  "5":    { bg:"#10b981", border:"#34d399", text:"#000" },
};

const ICON = <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <rect x="2" y="4" width="13" height="17" rx="2" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5"/>
  <rect x="9" y="2" width="13" height="17" rx="2" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.5"/>
  <text x="15.5" y="14" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" fontFamily="serif">A</text>
</svg>;

function makeDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ rank: r, suit: s });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
  return d;
}
function cardValue(r: Rank): number { if (r==="A") return 11; if (["J","Q","K"].includes(r)) return 10; return parseInt(r); }
function handValue(cards: Card[]): number {
  const vis = cards.filter(c => !c.hidden);
  let t = vis.reduce((s,c) => s+cardValue(c.rank),0);
  let a = vis.filter(c => c.rank==="A").length;
  while (t>21&&a>0){t-=10;a--;}
  return t;
}
function fullHandValue(cards: Card[]): number {
  let t = cards.reduce((s,c)=>s+cardValue(c.rank),0);
  let a = cards.filter(c=>c.rank==="A").length;
  while(t>21&&a>0){t-=10;a--;}
  return t;
}
function isBlackjack(cards: Card[]): boolean { return cards.length===2&&fullHandValue(cards)===21; }

/* ── Card suit center symbol sizes ── */
const SUIT_SIZE: Record<Suit, number> = { "♠":38, "♥":42, "♦":40, "♣":38 };

/* ── Playing Card ── */
function PlayingCard({ card, delay=0 }: { card: Card; delay?: number }) {
  if (card.hidden) {
    return (
      <div className="card-deal" style={{
        animationDelay:`${delay}ms`, "--deal-x":"20px", "--deal-y":"-60px", "--deal-r":"8deg",
        flexShrink:0, width:80, height:114, borderRadius:10,
        background:"linear-gradient(135deg,#1e3a5f 0%,#0f2040 100%)",
        border:"2px solid rgba(255,255,255,0.12)",
        boxShadow:"0 8px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)",
        display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden",
      } as React.CSSProperties}>
        {/* Card back pattern */}
        <div style={{ position:"absolute", inset:6, borderRadius:6, border:"1px solid rgba(255,255,255,0.15)",
          backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,0.04) 0,rgba(255,255,255,0.04) 1px,transparent 0,transparent 50%)",
          backgroundSize:"8px 8px"
        }}/>
        <div style={{ fontFamily:"var(--font-orbitron)", fontSize:11, fontWeight:900, color:"rgba(255,255,255,0.25)", letterSpacing:2 }}>TANGY</div>
      </div>
    );
  }
  const isRed = RED.includes(card.suit);
  const color = isRed ? "#dc2626" : "#111827";
  return (
    <div className="card-deal" style={{
      animationDelay:`${delay}ms`, "--deal-x":"0px", "--deal-y":"-80px", "--deal-r":"-5deg",
      flexShrink:0, width:80, height:114, borderRadius:10,
      background:"#ffffff",
      border:"1px solid rgba(0,0,0,0.12)",
      boxShadow:"0 8px 28px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.9)",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      padding:"7px 8px", userSelect:"none", position:"relative",
    } as React.CSSProperties}>
      {/* Top-left corner */}
      <div style={{ lineHeight:1.05, color }}>
        <div style={{ fontSize:16, fontWeight:900, fontFamily:"Georgia,serif" }}>{card.rank}</div>
        <div style={{ fontSize:13, marginTop:-1 }}>{card.suit}</div>
      </div>
      {/* Center suit */}
      <div style={{ textAlign:"center", fontSize:SUIT_SIZE[card.suit], color, lineHeight:1, position:"absolute",
        top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        textShadow: isRed ? "0 0 12px rgba(220,38,38,0.2)" : "none",
      }}>{card.suit}</div>
      {/* Bottom-right corner (rotated) */}
      <div style={{ lineHeight:1.05, color, alignSelf:"flex-end", transform:"rotate(180deg)" }}>
        <div style={{ fontSize:16, fontWeight:900, fontFamily:"Georgia,serif" }}>{card.rank}</div>
        <div style={{ fontSize:13, marginTop:-1 }}>{card.suit}</div>
      </div>
    </div>
  );
}

/* ── Score Badge ── */
function ScoreBadge({ score, isDealer, phase }: { score: number; isDealer?: boolean; phase: string }) {
  if (score === 0) return null;
  const bust = score > 21;
  const bj = score === 21;
  const color = bust ? "#ef4444" : bj ? "#f59e0b" : isDealer ? "#a78bfa" : "#10b981";
  const bg = bust ? "rgba(239,68,68,0.15)" : bj ? "rgba(245,158,11,0.15)" : isDealer ? "rgba(167,139,250,0.12)" : "rgba(16,185,129,0.12)";
  return (
    <div className="score-pop" style={{
      display:"inline-flex", alignItems:"center", gap:6,
      background:bg, border:`1px solid ${color}40`,
      borderRadius:100, padding:"5px 14px",
    }}>
      {bust && <span style={{ fontSize:10, color, fontWeight:700, letterSpacing:1 }}>BUST</span>}
      {bj && <span style={{ fontSize:10, color:"#f59e0b", fontWeight:700, letterSpacing:1 }}>BJ ★</span>}
      <span style={{ fontFamily:"var(--font-orbitron)", fontWeight:900, fontSize:18, color, textShadow:`0 0 10px ${color}80` }}>
        {score}
      </span>
    </div>
  );
}

/* ── Chip ── */
function Chip({ amount }: { amount: number }) {
  const key = BET_AMOUNTS.find(a => a === amount)?.toString() ?? "1";
  const c = CHIP_COLORS[key] ?? CHIP_COLORS["1"];
  return (
    <div className="chip-drop" style={{
      width:52, height:52, borderRadius:"50%",
      background:`radial-gradient(circle at 35% 30%, ${c.border}, ${c.bg})`,
      border:`3px solid ${c.border}`,
      boxShadow:`0 0 16px ${c.bg}80, inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.5)`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1,
    }}>
      <span style={{ fontSize:9, fontWeight:700, color:c.text, opacity:0.7, letterSpacing:1 }}>BET</span>
      <span style={{ fontFamily:"var(--font-orbitron)", fontSize:11, fontWeight:900, color:c.text, lineHeight:1 }}>{amount}</span>
    </div>
  );
}

type Phase = "bet"|"playing"|"dealer"|"done";
interface GameResult { outcome:"blackjack"|"win"|"loss"|"push"; payout:number }

function BlackjackGame() {
  const { connected, balance, updateBalance, connect } = useWallet();
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("bet");
  const [betAmount, setBetAmount] = useState(0.5);
  const [customBet, setCustomBet] = useState("");
  const [result, setResult] = useState<GameResult|null>(null);
  const [history, setHistory] = useState<BetRecord[]>([]);
  const [dealing, setDealing] = useState(false);
  const [winTrigger, setWinTrigger] = useState(false);
  const [activeBetLocked, setActiveBetLocked] = useState(0);

  const activeBet = customBet !== "" ? parseFloat(customBet)||0 : betAmount;
  const playerScore = handValue(playerCards);
  const dealerScore = handValue(dealerCards);
  const pnl = history.reduce((a,h) => a+(h.result==="win"?h.payout:-h.amount),0);

  const deal = useCallback(async () => {
    if (!connected||activeBet<=0||activeBet>balance||dealing) return;
    setDealing(true); setResult(null); setActiveBetLocked(activeBet);
    const newDeck = makeDeck();
    const p1=newDeck.pop()!, d1=newDeck.pop()!, p2=newDeck.pop()!, d2={...newDeck.pop()!,hidden:true};
    setDeck(newDeck); setPlayerCards([p1,p2]); setDealerCards([d1,d2]); setPhase("playing"); setDealing(false);
    if (isBlackjack([p1,p2])) await resolveGame([p1,p2],[d1,{...d2,hidden:false}],newDeck,activeBet,true);
  },[connected,activeBet,balance,dealing]);

  const hit = useCallback(async () => {
    if (phase!=="playing"||dealing) return;
    const newCard=deck[deck.length-1],newDeck=deck.slice(0,-1),newPlayer=[...playerCards,newCard];
    setDeck(newDeck); setPlayerCards(newPlayer);
    if (fullHandValue(newPlayer)>=21) await runDealer(newPlayer,dealerCards.map(c=>({...c,hidden:false})),newDeck,activeBetLocked);
  },[phase,dealing,deck,playerCards,dealerCards,activeBetLocked]);

  const stand = useCallback(async () => {
    if (phase!=="playing"||dealing) return;
    await runDealer(playerCards,dealerCards.map(c=>({...c,hidden:false})),deck,activeBetLocked);
  },[phase,dealing,playerCards,dealerCards,deck,activeBetLocked]);

  const double = useCallback(async () => {
    if (phase!=="playing"||dealing||playerCards.length!==2||activeBetLocked*2>balance) return;
    const newCard=deck[deck.length-1],newDeck=deck.slice(0,-1),newPlayer=[...playerCards,newCard];
    setDeck(newDeck); setPlayerCards(newPlayer);
    await runDealer(newPlayer,dealerCards.map(c=>({...c,hidden:false})),newDeck,activeBetLocked*2);
  },[phase,dealing,deck,playerCards,dealerCards,balance,activeBetLocked]);

  async function runDealer(fp:Card[],rd:Card[],cd:Card[],bet:number) {
    setPhase("dealer"); setDealerCards(rd);
    let dCards=[...rd],dDeck=[...cd];
    await new Promise(r=>setTimeout(r,700));
    while(fullHandValue(dCards)<17){
      const nc=dDeck.pop()!; dCards=[...dCards,nc]; setDealerCards([...dCards]);
      await new Promise(r=>setTimeout(r,550));
    }
    await resolveGame(fp,dCards,dDeck,bet,false);
  }

  async function resolveGame(fp:Card[],fd:Card[],_:Card[],bet:number,playerBJ:boolean) {
    const pVal=fullHandValue(fp),dVal=fullHandValue(fd);
    let outcome:GameResult["outcome"]; let payout=0;
    if(playerBJ&&!isBlackjack(fd)){outcome="blackjack";payout=bet*1.2;}
    else if(pVal>21){outcome="loss";}
    else if(dVal>21||pVal>dVal){outcome="win";payout=bet;}
    else if(pVal===dVal){outcome="push";payout=0;}
    else{outcome="loss";}
    const balChange=outcome==="blackjack"?payout:outcome==="win"?payout:outcome==="push"?0:-bet;
    updateBalance(balance+balChange);
    if(outcome==="win"||outcome==="blackjack") setWinTrigger(t=>!t);
    setResult({outcome,payout});
    setPhase("done");
    setHistory(h=>[...h,{id:Date.now().toString(),game:playerBJ?"Blackjack (BJ!)":"Blackjack",amount:bet,result:outcome==="win"||outcome==="blackjack"?"win":"loss",payout:outcome==="blackjack"?payout:outcome==="win"?payout:0,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
  }

  const newGame = () => { setPlayerCards([]); setDealerCards([]); setResult(null); setPhase("bet"); setActiveBetLocked(0); };

  const accent = "#ef4444";
  const resultColor = result?.outcome==="win"||result?.outcome==="blackjack" ? "#10b981" : result?.outcome==="push" ? "#06b6d4" : "#ef4444";
  const resultLabel = result?.outcome==="blackjack" ? "BLACKJACK!" : result?.outcome==="win" ? "YOU WIN!" : result?.outcome==="push" ? "PUSH" : "DEALER WINS";

  return (
    <GameLayout title="BLACKJACK" accent={accent} icon={ICON}>
      <WinEffect trigger={winTrigger} amount={result?.payout} accent="#10b981"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>

        {/* ── LEFT: TABLE ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Casino Felt Table */}
          <div style={{
            borderRadius:20, overflow:"hidden", position:"relative",
            background:"radial-gradient(ellipse at 50% 40%, #0d5a24 0%, #0a4a1e 50%, #072e13 100%)",
            border:"2px solid rgba(255,255,255,0.06)",
            boxShadow:"0 0 0 1px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
            minHeight:520,
          }}>
            {/* Felt texture overlay */}
            <div style={{ position:"absolute", inset:0, backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23ffffff' fill-opacity='0.015'/%3E%3C/svg%3E\")", pointerEvents:"none", zIndex:0 }}/>
            {/* Ambient glow center */}
            <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", width:400, height:300, borderRadius:"50%", background:"radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)", filter:"blur(30px)", pointerEvents:"none", zIndex:0 }}/>

            {/* Table header text */}
            <div style={{ position:"relative", zIndex:1, textAlign:"center", paddingTop:18, paddingBottom:8 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:5, color:"rgba(255,255,255,0.2)", textTransform:"uppercase" }}>
                ◆ BLACKJACK PAYS 3:2 ◆ DEALER STANDS ON HARD 17 ◆
              </div>
            </div>

            {/* DEALER ZONE */}
            <div style={{ position:"relative", zIndex:1, padding:"20px 28px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:14, minHeight:180 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:4, color:"rgba(255,255,255,0.25)", textTransform:"uppercase" }}>DEALER</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", minHeight:114 }}>
                {dealerCards.length > 0
                  ? dealerCards.map((c,i) => <PlayingCard key={i} card={c} delay={i*180}/>)
                  : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", opacity:0.15, fontSize:12, color:"#fff", letterSpacing:4 }}>WAITING</div>
                }
              </div>
              {dealerCards.length > 0 && (
                <ScoreBadge
                  score={phase==="playing" ? dealerScore : fullHandValue(dealerCards)}
                  isDealer
                  phase={phase}
                />
              )}
              {phase==="dealer" && (
                <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                  {[1,2,3].map(n=><div key={n} className={`dot-${n}`} style={{ width:8,height:8,borderRadius:"50%",background:"rgba(255,255,255,0.4)" }}/>)}
                </div>
              )}
            </div>

            {/* CENTER DIVIDER with chip */}
            <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", padding:"0 28px", gap:16, margin:"4px 0" }}>
              <div style={{ flex:1, height:1, background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }}/>
              {(phase==="playing"||phase==="dealer"||phase==="done") && activeBetLocked > 0
                ? <Chip amount={activeBetLocked}/>
                : <div style={{ fontSize:10, color:"rgba(255,255,255,0.15)", letterSpacing:4, fontWeight:700 }}>◆</div>
              }
              <div style={{ flex:1, height:1, background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }}/>
            </div>

            {/* PLAYER ZONE */}
            <div style={{ position:"relative", zIndex:1, padding:"24px 28px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:14, minHeight:180 }}>
              {playerCards.length > 0 && <ScoreBadge score={playerScore} phase={phase}/>}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", minHeight:114 }}>
                {playerCards.length > 0
                  ? playerCards.map((c,i) => <PlayingCard key={i} card={c} delay={i*220}/>)
                  : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", opacity:0.15, fontSize:12, color:"#fff", letterSpacing:4 }}>YOUR HAND</div>
                }
              </div>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:4, color:"rgba(255,255,255,0.25)", textTransform:"uppercase" }}>YOU</div>
            </div>

            {/* RESULT OVERLAY */}
            {result && (
              <div className="bj-result-in" style={{
                position:"absolute", inset:0, zIndex:10,
                background: result.outcome==="win"||result.outcome==="blackjack"
                  ? "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.22) 0%, rgba(0,0,0,0.6) 100%)"
                  : result.outcome==="push"
                  ? "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.15) 0%, rgba(0,0,0,0.6) 100%)"
                  : "radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0.6) 100%)",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                backdropFilter:"blur(3px)",
              }}>
                <div style={{
                  fontFamily:"var(--font-orbitron)", fontWeight:900, fontSize:44, letterSpacing:3,
                  color:resultColor,
                  textShadow:`0 0 40px ${resultColor}, 0 0 80px ${resultColor}60`,
                }}>
                  {resultLabel}
                </div>
                {result.outcome !== "push" && (
                  <div style={{ fontFamily:"var(--font-orbitron)", fontWeight:800, fontSize:22, color:"#fff" }}>
                    {result.outcome==="win"||result.outcome==="blackjack"
                      ? <span style={{ color:"#10b981" }}>+{result.payout.toFixed(3)} ◎</span>
                      : <span style={{ color:"#ef4444" }}>-{activeBetLocked.toFixed(3)} ◎</span>
                    }
                  </div>
                )}
              </div>
            )}

            {/* ACTION BUTTONS — on the felt */}
            <div style={{ position:"relative", zIndex:11, padding:"0 28px 24px" }}>
              {phase==="bet" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
                    {BET_AMOUNTS.map(amt => {
                      const c = CHIP_COLORS[amt.toString()];
                      const selected = betAmount===amt && customBet==="";
                      return (
                        <button key={amt} onClick={()=>{setBetAmount(amt);setCustomBet("");}} disabled={amt>balance}
                          style={{
                            padding:"10px 0", borderRadius:10, fontSize:13, fontWeight:800, cursor:"pointer",
                            background: selected ? c.bg : "rgba(0,0,0,0.35)",
                            color: selected ? c.text : "rgba(255,255,255,0.4)",
                            border: selected ? `1px solid ${c.border}` : "1px solid rgba(255,255,255,0.08)",
                            boxShadow: selected ? `0 0 16px ${c.bg}60` : "none",
                            transition:"all 0.15s", opacity:amt>balance?0.3:1,
                          }}>{amt}</button>
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <input type="number" min="0.05" max={balance} step="0.05" placeholder="Custom bet..."
                      value={customBet} onChange={e=>setCustomBet(e.target.value)}
                      style={{ flex:1, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#fff", outline:"none", fontFamily:"inherit" }}/>
                    <button onClick={()=>setCustomBet(balance.toFixed(2))} style={{ padding:"10px 14px", borderRadius:10, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)" }}>MAX</button>
                  </div>
                  {connected ? (
                    <button onClick={deal} disabled={activeBet<=0||activeBet>balance||dealing}
                      style={{
                        width:"100%", padding:"16px", fontSize:15, letterSpacing:3, borderRadius:12, cursor:"pointer",
                        fontFamily:"var(--font-orbitron)", fontWeight:900, border:"none",
                        background: activeBet>0&&activeBet<=balance&&!dealing
                          ? "linear-gradient(135deg,#ef4444,#b91c1c)"
                          : "rgba(255,255,255,0.06)",
                        color: activeBet>0&&activeBet<=balance&&!dealing ? "#fff" : "rgba(255,255,255,0.3)",
                        boxShadow: activeBet>0&&activeBet<=balance&&!dealing ? "0 4px 24px rgba(239,68,68,0.5)" : "none",
                        transition:"all 0.2s",
                      }}>
                      {dealing ? "DEALING..." : `DEAL — ${activeBet.toFixed(2)} ◎`}
                    </button>
                  ) : (
                    <button onClick={connect} className="btn-primary" style={{ width:"100%", padding:"16px", fontSize:14, letterSpacing:2, borderRadius:12 }}>CONNECT WALLET</button>
                  )}
                </div>
              )}

              {phase==="playing" && (
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={hit} style={{
                    flex:1, padding:"16px", borderRadius:12, fontSize:15, letterSpacing:2, cursor:"pointer",
                    fontFamily:"var(--font-orbitron)", fontWeight:900, border:"none",
                    background:"linear-gradient(135deg,#059669,#047857)",
                    color:"#fff", boxShadow:"0 4px 20px rgba(5,150,105,0.5)", transition:"all 0.15s",
                  }}>HIT</button>
                  <button onClick={stand} style={{
                    flex:1, padding:"16px", borderRadius:12, fontSize:15, letterSpacing:2, cursor:"pointer",
                    fontFamily:"var(--font-orbitron)", fontWeight:900, border:"none",
                    background:"linear-gradient(135deg,#dc2626,#b91c1c)",
                    color:"#fff", boxShadow:"0 4px 20px rgba(220,38,38,0.5)", transition:"all 0.15s",
                  }}>STAND</button>
                  {playerCards.length===2 && activeBetLocked*2<=balance && (
                    <button onClick={double} style={{
                      flex:1, padding:"16px", borderRadius:12, fontSize:14, letterSpacing:1, cursor:"pointer",
                      fontFamily:"var(--font-orbitron)", fontWeight:900, border:"none",
                      background:"linear-gradient(135deg,#d97706,#b45309)",
                      color:"#fff", boxShadow:"0 4px 20px rgba(217,119,6,0.5)", transition:"all 0.15s",
                    }}>DOUBLE</button>
                  )}
                </div>
              )}

              {phase==="dealer" && (
                <div style={{ height:56, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  {[1,2,3].map(n=><div key={n} className={`dot-${n}`} style={{ width:10,height:10,borderRadius:"50%",background:"rgba(255,255,255,0.35)" }}/>)}
                </div>
              )}

              {phase==="done" && (
                <button onClick={newGame} style={{
                  width:"100%", padding:"16px", fontSize:15, letterSpacing:3, borderRadius:12, cursor:"pointer",
                  fontFamily:"var(--font-orbitron)", fontWeight:900, border:`1px solid ${resultColor}50`,
                  background:`${resultColor}15`, color:resultColor,
                  boxShadow:`0 4px 24px ${resultColor}30`, transition:"all 0.2s",
                }}>NEW HAND →</button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:14, position:"sticky", top:84 }}>
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:20 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"#374151", marginBottom:16 }}>Session Stats</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { label:"Hands played", value:history.length, color:"#fff" },
                { label:"Wins", value:history.filter(h=>h.result==="win").length, color:"#10b981" },
                { label:"Losses", value:history.filter(h=>h.result==="loss").length, color:"#ef4444" },
              ].map(s=>(
                <div key={s.label} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                  <span style={{ color:"#4b5563" }}>{s.label}</span>
                  <span style={{ fontWeight:700, color:s.color, fontFamily:"var(--font-orbitron)" }}>{s.value}</span>
                </div>
              ))}
              <div style={{ borderTop:"1px solid var(--border)", paddingTop:12, display:"flex", justifyContent:"space-between", fontSize:13 }}>
                <span style={{ color:"#4b5563" }}>P&L</span>
                <span style={{ fontWeight:800, color:pnl>=0?"#10b981":"#ef4444", fontFamily:"var(--font-orbitron)" }}>
                  {pnl>=0?"+":""}{pnl.toFixed(3)} ◎
                </span>
              </div>
            </div>
          </div>

          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:20 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"#374151", marginBottom:14 }}>Rules</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                ["Blackjack pays","3:2","#10b981"],
                ["Dealer stands","Hard 17","#fff"],
                ["Double on","Any 2 cards","#fff"],
                ["House edge","~5%","#a78bfa"],
              ].map(([l,v,c])=>(
                <div key={l as string} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                  <span style={{ color:"#4b5563" }}>{l}</span>
                  <span style={{ fontWeight:700, color:c as string }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <BetHistory history={history}/>
        </div>
      </div>
    </GameLayout>
  );
}

export default function BlackjackPage() {
  return <WalletProvider><BlackjackGame/></WalletProvider>;
}
