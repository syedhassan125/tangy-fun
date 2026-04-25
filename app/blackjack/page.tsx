"use client";
import { useState, useCallback } from "react";
import { WalletProvider, useWallet } from "../components/WalletContext";
import GameLayout from "../components/GameLayout";
import BetHistory, { BetRecord } from "../components/BetHistory";
import WinEffect from "../components/WinEffect";

type Suit = "♠"|"♥"|"♦"|"♣";
type Rank = "A"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K";
interface Card { rank: Rank; suit: Suit; hidden?: boolean }

const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS: Suit[] = ["♠","♥","♦","♣"];
const RED: Suit[] = ["♥","♦"];
const BET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];
const CHIP_COLORS: Record<string,{bg:string;border:string;text:string}> = {
  "0.1": {bg:"#6b7280",border:"#9ca3af",text:"#fff"},
  "0.25":{bg:"#3b82f6",border:"#60a5fa",text:"#fff"},
  "0.5": {bg:"#ef4444",border:"#f87171",text:"#fff"},
  "1":   {bg:"#f59e0b",border:"#fbbf24",text:"#000"},
  "2":   {bg:"#8b5cf6",border:"#a78bfa",text:"#fff"},
  "5":   {bg:"#10b981",border:"#34d399",text:"#000"},
};

const ICON = <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <rect x="2" y="4" width="13" height="17" rx="2" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5"/>
  <rect x="9" y="2" width="13" height="17" rx="2" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.5"/>
  <text x="15.5" y="14" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" fontFamily="serif">A</text>
</svg>;

function makeDeck(): Card[] {
  const d:Card[]=[];
  for(const s of SUITS) for(const r of RANKS) d.push({rank:r,suit:s});
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}
  return d;
}
function cardValue(r:Rank):number{if(r==="A")return 11;if(["J","Q","K"].includes(r))return 10;return parseInt(r);}
function handValue(cards:Card[]):number{
  const vis=cards.filter(c=>!c.hidden);
  let t=vis.reduce((s,c)=>s+cardValue(c.rank),0);
  let a=vis.filter(c=>c.rank==="A").length;
  while(t>21&&a>0){t-=10;a--;}return t;
}
function fullHandValue(cards:Card[]):number{
  let t=cards.reduce((s,c)=>s+cardValue(c.rank),0);
  let a=cards.filter(c=>c.rank==="A").length;
  while(t>21&&a>0){t-=10;a--;}return t;
}
function isBlackjack(cards:Card[]):boolean{return cards.length===2&&fullHandValue(cards)===21;}

/* ── Citrus Dealer Mascot (animated) ── */
function DealerMascot({ phase, result }: { phase: string; result: GameResult|null }) {
  const bodyClass = phase==="dealer" ? "mascot-deal"
    : result?.outcome==="win"||result?.outcome==="blackjack" ? "mascot-celebrate"
    : phase==="playing" ? "mascot-thinking"
    : "mascot-idle";

  return (
    <div className={bodyClass} style={{ position:"relative", width:90, height:100 }}>
      <svg width="90" height="100" viewBox="0 0 90 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left arm */}
        <g style={{ transformOrigin:"45px 70px",
          animation: phase==="dealer" ? "mascot-arm-l 0.7s ease-in-out forwards" : "none" }}>
          <rect x="8" y="62" width="22" height="8" rx="4" fill="#16a34a"
            style={{ transformOrigin:"28px 66px",
              transform: phase==="dealer" ? "rotate(-35deg) translateX(-8px)" : "rotate(15deg)",
              transition:"transform 0.4s ease" }}/>
          {/* Hand holding card when dealing */}
          {(phase==="dealer"||phase==="playing") && (
            <rect x="4" y="52" width="14" height="19" rx="3" fill="#fff" stroke="rgba(0,0,0,0.15)" strokeWidth="1"
              style={{ transform: phase==="dealer" ? "rotate(-35deg) translate(-10px,-8px)" : "rotate(15deg)",
                transition:"transform 0.4s ease", opacity: phase==="dealer" ? 1 : 0.6 }}/>
          )}
        </g>

        {/* Right arm */}
        <rect x="60" y="62" width="22" height="8" rx="4" fill="#16a34a"
          style={{ transformOrigin:"60px 66px",
            transform: phase==="dealer" ? "rotate(30deg) translateX(6px)" : "rotate(-15deg)",
            transition:"transform 0.4s ease" }}/>

        {/* Body */}
        <rect x="30" y="60" width="30" height="28" rx="8" fill="#15803d"/>
        <rect x="30" y="60" width="30" height="28" rx="8" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>

        {/* Bow tie */}
        <path d="M36 68 L45 73 L54 68 L45 63 Z" fill="#f59e0b"/>
        <circle cx="45" cy="68" r="3" fill="#d97706"/>

        {/* Dealer hat */}
        <rect x="22" y="14" width="46" height="24" rx="5" fill="#1a0a00" stroke="rgba(245,158,11,0.55)" strokeWidth="1.5"/>
        <rect x="14" y="36" width="62" height="7" rx="3.5" fill="#f59e0b"/>
        <rect x="40" y="6" width="10" height="10" rx="3" fill="#f59e0b"/>
        {/* Hat band */}
        <rect x="22" y="28" width="46" height="5" rx="1" fill="rgba(245,158,11,0.2)"/>

        {/* Head */}
        <circle cx="45" cy="56" r="24" fill="#22c55e"/>
        <circle cx="45" cy="56" r="24" fill="radial-gradient(circle at 38% 32%, rgba(255,255,255,0.15) 0%, transparent 60%)"/>
        <circle cx="45" cy="56" r="24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>

        {/* Citrus segments */}
        <line x1="45" y1="32" x2="45" y2="80" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
        <line x1="21" y1="56" x2="69" y2="56" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
        <line x1="28" y1="39" x2="62" y2="73" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        <line x1="62" y1="39" x2="28" y2="73" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>

        {/* Eyes with blink */}
        <g className="eye-blink">
          <circle cx="37" cy="52" r="4.5" fill="#052e16"/>
          <circle cx="53" cy="52" r="4.5" fill="#052e16"/>
          <circle cx="38.5" cy="50.5" r="1.5" fill="rgba(255,255,255,0.7)"/>
          <circle cx="54.5" cy="50.5" r="1.5" fill="rgba(255,255,255,0.7)"/>
        </g>

        {/* Expression changes with phase */}
        {(result?.outcome==="win"||result?.outcome==="blackjack") ? (
          /* Big smile for win */
          <path d="M34 62 Q45 72 56 62" stroke="#052e16" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        ) : result?.outcome==="loss" ? (
          /* Sad for loss */
          <path d="M34 68 Q45 62 56 68" stroke="#052e16" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        ) : (
          /* Neutral smile */
          <path d="M35 63 Q45 69 55 63" stroke="#052e16" strokeWidth="2" fill="none" strokeLinecap="round"/>
        )}

        {/* Shine on head */}
        <ellipse cx="36" cy="43" rx="8" ry="4" fill="rgba(255,255,255,0.15)" transform="rotate(-20 36 43)"/>

        {/* Speech bubble when thinking */}
        {phase==="dealer" && (
          <g>
            <rect x="58" y="8" width="28" height="18" rx="8" fill="rgba(245,158,11,0.9)"/>
            <path d="M64 26 L60 32 L68 26" fill="rgba(245,158,11,0.9)"/>
            <text x="72" y="20" textAnchor="middle" fontSize="10" fontWeight="900" fill="#000">🤔</text>
          </g>
        )}
        {(result?.outcome==="win"||result?.outcome==="blackjack") && (
          <g>
            <rect x="58" y="4" width="30" height="18" rx="8" fill="rgba(16,185,129,0.9)"/>
            <path d="M64 22 L60 28 L68 22" fill="rgba(16,185,129,0.9)"/>
            <text x="73" y="16" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">🎉</text>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ── Open Seat / Player Seat ── */
function PlayerSeat({ isBot, name, bet }: { isBot?: boolean; name?: string; bet?: number }) {
  if (!isBot) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
        <div className="seat-pulse" style={{
          width:52, height:52, borderRadius:"50%",
          background:"rgba(245,158,11,0.06)",
          border:"2px dashed rgba(245,158,11,0.35)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:"rgba(245,158,11,0.5)", textTransform:"uppercase" }}>Open Seat</div>
        <div style={{ fontSize:8, color:"rgba(255,255,255,0.2)", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:100, padding:"3px 10px", cursor:"pointer" }}>JOIN</div>
      </div>
    );
  }
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <div style={{
        width:52, height:52, borderRadius:"50%",
        background:"linear-gradient(135deg,#374151,#1f2937)",
        border:"2px solid rgba(255,255,255,0.12)",
        boxShadow:"0 0 12px rgba(0,0,0,0.5)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22,
      }}>🤖</div>
      <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:1 }}>{name}</div>
      {bet && (
        <div style={{ fontFamily:"var(--font-orbitron)", fontSize:9, fontWeight:800, color:"#f59e0b" }}>{bet} ◎</div>
      )}
    </div>
  );
}

/* ── Playing Card ── */
function PlayingCard({card,delay=0,rotate=0,zIdx=0}:{card:Card;delay?:number;rotate?:number;zIdx?:number}) {
  if(card.hidden) return (
    <div className="card-deal" style={{
      animationDelay:`${delay}ms`,"--deal-x":"10px","--deal-y":"-60px","--deal-r":"5deg",
      width:76,height:108,borderRadius:9,flexShrink:0,
      background:"linear-gradient(135deg,#2d1400 0%,#1a0a00 100%)",
      border:"2px solid rgba(245,158,11,0.25)",
      boxShadow:"0 8px 24px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,255,255,0.05)",
      display:"flex",alignItems:"center",justifyContent:"center",
      position:"relative",overflow:"hidden",
      transform:`rotate(${rotate}deg)`,
      zIndex:zIdx,
    } as React.CSSProperties}>
      <div style={{position:"absolute",inset:5,borderRadius:5,border:"1px solid rgba(245,158,11,0.15)",
        backgroundImage:"repeating-linear-gradient(45deg,rgba(245,158,11,0.03) 0,rgba(245,158,11,0.03) 1px,transparent 0,transparent 50%)",
        backgroundSize:"8px 8px"}}/>
      <div style={{fontFamily:"var(--font-orbitron)",fontSize:9,fontWeight:900,color:"rgba(245,158,11,0.3)",letterSpacing:2}}>TANGY</div>
    </div>
  );
  const isRed=RED.includes(card.suit);
  const color=isRed?"#dc2626":"#111827";
  return (
    <div className="card-deal" style={{
      animationDelay:`${delay}ms`,"--deal-x":"0px","--deal-y":"-70px","--deal-r":"-4deg",
      width:76,height:108,borderRadius:9,flexShrink:0,
      background:"#ffffff",
      border:"1px solid rgba(0,0,0,0.1)",
      boxShadow:"0 8px 28px rgba(0,0,0,0.65),0 2px 6px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.9)",
      display:"flex",flexDirection:"column",justifyContent:"space-between",
      padding:"6px 7px",userSelect:"none",position:"relative",
      transform:`rotate(${rotate}deg)`,
      zIndex:zIdx,
    } as React.CSSProperties}>
      <div style={{lineHeight:1.05,color}}>
        <div style={{fontSize:15,fontWeight:900,fontFamily:"Georgia,serif"}}>{card.rank}</div>
        <div style={{fontSize:12,marginTop:-1}}>{card.suit}</div>
      </div>
      <div style={{textAlign:"center",fontSize:card.rank==="10"?30:36,color,lineHeight:1,
        position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        textShadow:isRed?"0 0 8px rgba(220,38,38,0.15)":"none"}}>{card.suit}</div>
      <div style={{lineHeight:1.05,color,alignSelf:"flex-end",transform:"rotate(180deg)"}}>
        <div style={{fontSize:15,fontWeight:900,fontFamily:"Georgia,serif"}}>{card.rank}</div>
        <div style={{fontSize:12,marginTop:-1}}>{card.suit}</div>
      </div>
    </div>
  );
}

/* ── Fanned Hand ── */
function FannedHand({cards,delay=0}:{cards:Card[];delay?:number}) {
  const count=cards.length;
  const spread=Math.min(count*14,80);
  const startX=-spread/2;
  const angleStep=count>1?10/(count-1):0;
  const startAngle=count>1?-5:0;
  return (
    <div style={{position:"relative",height:120,width:Math.max(90,count*22+60),minWidth:80}}>
      {cards.map((c,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:startX+(i/(Math.max(count-1,1)))*spread*2+40,
          bottom:0,
          transformOrigin:"bottom center",
          transform:`rotate(${startAngle+i*angleStep}deg)`,
          zIndex:i,
          transition:"transform 0.2s ease",
        }}>
          <PlayingCard card={c} delay={delay+i*180} rotate={0} zIdx={i}/>
        </div>
      ))}
    </div>
  );
}

/* ── Score Badge on card stack ── */
function ScoreOnStack({score,bust,bj}:{score:number;bust:boolean;bj:boolean}) {
  if(score===0) return null;
  const color=bust?"#ef4444":bj?"#f59e0b":"#fff";
  const bg=bust?"rgba(239,68,68,0.9)":bj?"rgba(245,158,11,0.9)":"rgba(0,0,0,0.82)";
  const glow=bust?"0 0 12px rgba(239,68,68,0.8)":bj?"0 0 12px rgba(245,158,11,0.8)":"none";
  return (
    <div className="score-pop" style={{
      background:bg,border:`1px solid ${color}50`,
      borderRadius:100,padding:"4px 12px",
      display:"inline-flex",alignItems:"center",gap:5,
      boxShadow:glow,
    }}>
      {bust&&<span style={{fontSize:9,color,fontWeight:700,letterSpacing:1}}>BUST</span>}
      {bj&&<span style={{fontSize:9,color:"#f59e0b",fontWeight:700,letterSpacing:1}}>BJ ★</span>}
      <span style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:17,color,letterSpacing:1}}>{score}</span>
    </div>
  );
}

/* ── Chip Stack ── */
function ChipStack({amount}:{amount:number}) {
  const key=BET_AMOUNTS.find(a=>a===amount)?.toString()??"1";
  const c=CHIP_COLORS[key]??CHIP_COLORS["1"];
  const stacks=Math.min(Math.ceil(amount),3);
  return (
    <div className="chip-drop" style={{position:"relative",width:48,height:48+stacks*4}}>
      {Array.from({length:stacks}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",bottom:i*4,left:0,
          width:48,height:48,borderRadius:"50%",
          background:`radial-gradient(circle at 35% 30%,${c.border},${c.bg})`,
          border:`3px solid ${c.border}`,
          boxShadow:`0 0 12px ${c.bg}80,inset 0 2px 4px rgba(255,255,255,0.3),0 3px 8px rgba(0,0,0,0.5)`,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
        }}>
          {i===stacks-1&&<>
            <span style={{fontSize:8,fontWeight:700,color:c.text,opacity:0.7,letterSpacing:1}}>BET</span>
            <span style={{fontFamily:"var(--font-orbitron)",fontSize:10,fontWeight:900,color:c.text,lineHeight:1}}>{amount}</span>
          </>}
        </div>
      ))}
    </div>
  );
}

type Phase="bet"|"playing"|"dealer"|"done";
interface GameResult{outcome:"blackjack"|"win"|"loss"|"push";payout:number}

function BlackjackGame() {
  const {connected,balance,updateBalance,connect}=useWallet();
  const [deck,setDeck]=useState<Card[]>([]);
  const [playerCards,setPlayerCards]=useState<Card[]>([]);
  const [dealerCards,setDealerCards]=useState<Card[]>([]);
  const [phase,setPhase]=useState<Phase>("bet");
  const [betAmount,setBetAmount]=useState(0.5);
  const [customBet,setCustomBet]=useState("");
  const [result,setResult]=useState<GameResult|null>(null);
  const [history,setHistory]=useState<BetRecord[]>([]);
  const [dealing,setDealing]=useState(false);
  const [winTrigger,setWinTrigger]=useState(false);
  const [activeBetLocked,setActiveBetLocked]=useState(0);

  const activeBet=customBet!==""?parseFloat(customBet)||0:betAmount;
  const playerScore=handValue(playerCards);
  const dealerScore=handValue(dealerCards);
  const pnl=history.reduce((a,h)=>a+(h.result==="win"?h.payout:-h.amount),0);

  const deal=useCallback(async()=>{
    if(!connected||activeBet<=0||activeBet>balance||dealing)return;
    setDealing(true);setResult(null);setActiveBetLocked(activeBet);
    const nd=makeDeck();
    const p1=nd.pop()!,d1=nd.pop()!,p2=nd.pop()!,d2={...nd.pop()!,hidden:true};
    setDeck(nd);setPlayerCards([p1,p2]);setDealerCards([d1,d2]);setPhase("playing");setDealing(false);
    if(isBlackjack([p1,p2]))await resolveGame([p1,p2],[d1,{...d2,hidden:false}],nd,activeBet,true);
  },[connected,activeBet,balance,dealing]);

  const hit=useCallback(async()=>{
    if(phase!=="playing"||dealing)return;
    const nc=deck[deck.length-1],nd=deck.slice(0,-1),np=[...playerCards,nc];
    setDeck(nd);setPlayerCards(np);
    if(fullHandValue(np)>=21)await runDealer(np,dealerCards.map(c=>({...c,hidden:false})),nd,activeBetLocked);
  },[phase,dealing,deck,playerCards,dealerCards,activeBetLocked]);

  const stand=useCallback(async()=>{
    if(phase!=="playing"||dealing)return;
    await runDealer(playerCards,dealerCards.map(c=>({...c,hidden:false})),deck,activeBetLocked);
  },[phase,dealing,playerCards,dealerCards,deck,activeBetLocked]);

  const double=useCallback(async()=>{
    if(phase!=="playing"||dealing||playerCards.length!==2||activeBetLocked*2>balance)return;
    const nc=deck[deck.length-1],nd=deck.slice(0,-1),np=[...playerCards,nc];
    setDeck(nd);setPlayerCards(np);
    await runDealer(np,dealerCards.map(c=>({...c,hidden:false})),nd,activeBetLocked*2);
  },[phase,dealing,deck,playerCards,dealerCards,balance,activeBetLocked]);

  async function runDealer(fp:Card[],rd:Card[],cd:Card[],bet:number){
    setPhase("dealer");setDealerCards(rd);
    let dc=[...rd],dd=[...cd];
    await new Promise(r=>setTimeout(r,700));
    while(fullHandValue(dc)<17){
      const nc=dd.pop()!;dc=[...dc,nc];setDealerCards([...dc]);
      await new Promise(r=>setTimeout(r,550));
    }
    await resolveGame(fp,dc,dd,bet,false);
  }

  async function resolveGame(fp:Card[],fd:Card[],_:Card[],bet:number,pBJ:boolean){
    const pv=fullHandValue(fp),dv=fullHandValue(fd);
    let outcome:GameResult["outcome"];let payout=0;
    if(pBJ&&!isBlackjack(fd)){outcome="blackjack";payout=bet*1.2;}
    else if(pv>21){outcome="loss";}
    else if(dv>21||pv>dv){outcome="win";payout=bet;}
    else if(pv===dv){outcome="push";payout=0;}
    else{outcome="loss";}
    const bc=outcome==="blackjack"?payout:outcome==="win"?payout:outcome==="push"?0:-bet;
    updateBalance(balance+bc);
    if(outcome==="win"||outcome==="blackjack")setWinTrigger(t=>!t);
    setResult({outcome,payout});
    setPhase("done");
    setHistory(h=>[...h,{id:Date.now().toString(),game:pBJ?"Blackjack (BJ!)":"Blackjack",amount:bet,result:outcome==="win"||outcome==="blackjack"?"win":"loss",payout:outcome==="blackjack"?payout:outcome==="win"?payout:0,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
  }

  const newGame=()=>{setPlayerCards([]);setDealerCards([]);setResult(null);setPhase("bet");setActiveBetLocked(0);};

  const accent="#ef4444";
  const resultColor=result?.outcome==="win"||result?.outcome==="blackjack"?"#10b981":result?.outcome==="push"?"#06b6d4":"#ef4444";
  const resultLabel=result?.outcome==="blackjack"?"BLACKJACK!":result?.outcome==="win"?"YOU WIN!":result?.outcome==="push"?"PUSH":"DEALER WINS";
  const dFull=fullHandValue(dealerCards);
  const dScore=phase==="playing"?dealerScore:dFull;

  return (
    <GameLayout title="BLACKJACK" accent={accent} icon={ICON}>
      <WinEffect trigger={winTrigger} amount={result?.payout} accent="#10b981"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:20,alignItems:"start"}}>

        {/* ── LEFT: OVAL TABLE ── */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Oval felt table */}
          <div style={{
            position:"relative",
            borderRadius:180,
            background:"radial-gradient(ellipse at 50% 38%,#2a1500 0%,#1c0e00 45%,#100800 100%)",
            border:"3px solid rgba(245,158,11,0.25)",
            boxShadow:"0 0 0 1px rgba(245,158,11,0.08),0 0 80px rgba(245,158,11,0.08),0 20px 60px rgba(0,0,0,0.8),inset 0 0 100px rgba(0,0,0,0.3)",
            minHeight:560,overflow:"hidden",
          }}>
            {/* Felt texture */}
            <div style={{position:"absolute",inset:0,backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23ffffff' fill-opacity='0.012'/%3E%3C/svg%3E\")",pointerEvents:"none",zIndex:0}}/>
            {/* Spotlight from above */}
            <div style={{position:"absolute",top:-60,left:"50%",transform:"translateX(-50%)",width:500,height:400,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(245,158,11,0.06) 0%,transparent 70%)",filter:"blur(40px)",pointerEvents:"none",zIndex:0}}/>
            {/* Inner table rail */}
            <div style={{position:"absolute",inset:16,borderRadius:165,border:"1px solid rgba(245,158,11,0.12)",pointerEvents:"none",zIndex:0}}/>
            <div style={{position:"absolute",inset:22,borderRadius:160,border:"1px solid rgba(245,158,11,0.06)",pointerEvents:"none",zIndex:0}}/>

            {/* SEATS — left and right absolutely positioned */}
            <div style={{position:"absolute",left:"6%",top:"52%",transform:"translateY(-50%)",zIndex:2}}>
              <PlayerSeat isBot name="sol_ape" bet={0.5}/>
            </div>
            <div style={{position:"absolute",right:"6%",top:"52%",transform:"translateY(-50%)",zIndex:2}}>
              <PlayerSeat/>
            </div>

            {/* DEALER ZONE */}
            <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:24,gap:8}}>
              {/* Animated citrus dealer mascot */}
              <DealerMascot phase={phase} result={result}/>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:4,color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>DEALER</div>

              {/* Dealer cards */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                {dealerCards.length>0?(
                  <>
                    <FannedHand cards={dealerCards} delay={0}/>
                    <ScoreOnStack
                      score={dScore}
                      bust={dFull>21&&phase==="done"}
                      bj={isBlackjack(dealerCards)&&phase==="done"}
                    />
                  </>
                ):(
                  <div style={{height:130,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.12,fontSize:11,color:"#fff",letterSpacing:4}}>WAITING</div>
                )}
                {phase==="dealer"&&(
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {[1,2,3].map(n=><div key={n} className={`dot-${n}`} style={{width:7,height:7,borderRadius:"50%",background:"rgba(255,255,255,0.35)"}}/>)}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER — table text + chip */}
            <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0",gap:10}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:4,color:"rgba(255,255,255,0.1)",textTransform:"uppercase"}}>
                ◆ BLACKJACK PAYS 3:2 ◆ DEALER STANDS ON HARD 17 ◆
              </div>
              {(phase==="playing"||phase==="dealer"||phase==="done")&&activeBetLocked>0&&(
                <ChipStack amount={activeBetLocked}/>
              )}
            </div>

            {/* PLAYER ZONE */}
            <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:10,paddingBottom:32}}>
              {playerCards.length>0?(
                <>
                  <ScoreOnStack
                    score={playerScore}
                    bust={fullHandValue(playerCards)>21}
                    bj={isBlackjack(playerCards)}
                  />
                  <FannedHand cards={playerCards} delay={100}/>
                </>
              ):(
                <div style={{height:130,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.12,fontSize:11,color:"#fff",letterSpacing:4}}>YOUR HAND</div>
              )}
              <div style={{fontSize:9,fontWeight:700,letterSpacing:4,color:"rgba(255,255,255,0.2)",textTransform:"uppercase"}}>YOU</div>
            </div>

            {/* RESULT OVERLAY */}
            {result&&(
              <div className="bj-result-in" style={{
                position:"absolute",inset:0,zIndex:10,
                background:result.outcome==="win"||result.outcome==="blackjack"
                  ?"radial-gradient(ellipse at 50% 50%,rgba(16,185,129,0.28) 0%,rgba(0,0,0,0.72) 100%)"
                  :result.outcome==="push"
                  ?"radial-gradient(ellipse at 50% 50%,rgba(6,182,212,0.2) 0%,rgba(0,0,0,0.72) 100%)"
                  :"radial-gradient(ellipse at 50% 50%,rgba(239,68,68,0.25) 0%,rgba(0,0,0,0.72) 100%)",
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,
                backdropFilter:"blur(4px)",borderRadius:177,
              }}>
                <div style={{
                  fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:48,letterSpacing:3,
                  color:resultColor,
                  textShadow:`0 0 50px ${resultColor},0 0 100px ${resultColor}50`,
                }}>{resultLabel}</div>
                {result.outcome!=="push"&&(
                  <div style={{fontFamily:"var(--font-orbitron)",fontWeight:800,fontSize:24,color:"#fff"}}>
                    {result.outcome==="win"||result.outcome==="blackjack"
                      ?<span style={{color:"#10b981"}}>+{result.payout.toFixed(3)} ◎</span>
                      :<span style={{color:"#ef4444"}}>-{activeBetLocked.toFixed(3)} ◎</span>
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTION PANEL — below the table */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:18,padding:20}}>
            {phase==="bet"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#4b5563"}}>Bet Amount</span>
                  <span style={{fontSize:12,color:"#4b5563"}}>Balance: <span style={{color:"#10b981",fontWeight:700}}>{balance.toFixed(3)} ◎</span></span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
                  {BET_AMOUNTS.map(amt=>{
                    const c=CHIP_COLORS[amt.toString()];
                    const sel=betAmount===amt&&customBet==="";
                    return(
                      <button key={amt} onClick={()=>{setBetAmount(amt);setCustomBet("");}} disabled={amt>balance}
                        style={{
                          padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:800,cursor:"pointer",
                          background:sel?c.bg:"rgba(255,255,255,0.04)",
                          color:sel?c.text:"rgba(255,255,255,0.4)",
                          border:sel?`1px solid ${c.border}`:"1px solid var(--border)",
                          boxShadow:sel?`0 0 14px ${c.bg}60`:"none",
                          transition:"all 0.15s",opacity:amt>balance?0.3:1,
                        }}>{amt}</button>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input type="number" min="0.05" max={balance} step="0.05" placeholder="Custom bet..."
                    value={customBet} onChange={e=>setCustomBet(e.target.value)}
                    style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#fff",outline:"none",fontFamily:"inherit"}}/>
                  <button onClick={()=>setCustomBet(balance.toFixed(2))} style={{padding:"10px 14px",borderRadius:10,fontSize:11,fontWeight:700,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",color:"#6b7280"}}>MAX</button>
                </div>
                {connected?(
                  <button onClick={deal} disabled={activeBet<=0||activeBet>balance||dealing}
                    style={{
                      width:"100%",padding:"15px",fontSize:14,letterSpacing:3,borderRadius:12,cursor:"pointer",
                      fontFamily:"var(--font-orbitron)",fontWeight:900,border:"none",
                      background:activeBet>0&&activeBet<=balance&&!dealing?"linear-gradient(135deg,#ef4444,#b91c1c)":"rgba(255,255,255,0.05)",
                      color:activeBet>0&&activeBet<=balance&&!dealing?"#fff":"rgba(255,255,255,0.3)",
                      boxShadow:activeBet>0&&activeBet<=balance&&!dealing?"0 4px 24px rgba(239,68,68,0.5)":"none",
                      transition:"all 0.2s",
                    }}>
                    {dealing?"DEALING...":`DEAL — ${activeBet.toFixed(2)} ◎`}
                  </button>
                ):(
                  <button onClick={connect} className="btn-primary" style={{width:"100%",padding:"15px",fontSize:14,letterSpacing:2,borderRadius:12}}>CONNECT WALLET</button>
                )}
              </div>
            )}

            {phase==="playing"&&(
              <div style={{display:"flex",gap:10}}>
                <button onClick={hit} style={{flex:1,padding:"15px",borderRadius:12,fontSize:15,letterSpacing:2,cursor:"pointer",fontFamily:"var(--font-orbitron)",fontWeight:900,border:"none",background:"linear-gradient(135deg,#059669,#047857)",color:"#fff",boxShadow:"0 4px 20px rgba(5,150,105,0.5)"}}>HIT</button>
                <button onClick={stand} style={{flex:1,padding:"15px",borderRadius:12,fontSize:15,letterSpacing:2,cursor:"pointer",fontFamily:"var(--font-orbitron)",fontWeight:900,border:"none",background:"linear-gradient(135deg,#dc2626,#b91c1c)",color:"#fff",boxShadow:"0 4px 20px rgba(220,38,38,0.5)"}}>STAND</button>
                {playerCards.length===2&&activeBetLocked*2<=balance&&(
                  <button onClick={double} style={{flex:1,padding:"15px",borderRadius:12,fontSize:13,letterSpacing:1,cursor:"pointer",fontFamily:"var(--font-orbitron)",fontWeight:900,border:"none",background:"linear-gradient(135deg,#d97706,#b45309)",color:"#fff",boxShadow:"0 4px 20px rgba(217,119,6,0.5)"}}>DOUBLE</button>
                )}
              </div>
            )}

            {phase==="dealer"&&(
              <div style={{height:52,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {[1,2,3].map(n=><div key={n} className={`dot-${n}`} style={{width:10,height:10,borderRadius:"50%",background:"rgba(255,255,255,0.3)"}}/>)}
              </div>
            )}

            {phase==="done"&&(
              <button onClick={newGame} style={{
                width:"100%",padding:"15px",fontSize:14,letterSpacing:3,borderRadius:12,cursor:"pointer",
                fontFamily:"var(--font-orbitron)",fontWeight:900,border:`1px solid ${resultColor}50`,
                background:`${resultColor}15`,color:resultColor,
                boxShadow:`0 4px 24px ${resultColor}30`,transition:"all 0.2s",
              }}>NEW HAND →</button>
            )}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div style={{display:"flex",flexDirection:"column",gap:14,position:"sticky",top:84}}>
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#374151",marginBottom:16}}>Session Stats</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[
                {label:"Hands played",value:history.length,color:"#fff"},
                {label:"Wins",value:history.filter(h=>h.result==="win").length,color:"#10b981"},
                {label:"Losses",value:history.filter(h=>h.result==="loss").length,color:"#ef4444"},
              ].map(s=>(
                <div key={s.label} style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                  <span style={{color:"#4b5563"}}>{s.label}</span>
                  <span style={{fontWeight:700,color:s.color,fontFamily:"var(--font-orbitron)"}}>{s.value}</span>
                </div>
              ))}
              <div style={{borderTop:"1px solid var(--border)",paddingTop:12,display:"flex",justifyContent:"space-between",fontSize:13}}>
                <span style={{color:"#4b5563"}}>P&L</span>
                <span style={{fontWeight:800,color:pnl>=0?"#10b981":"#ef4444",fontFamily:"var(--font-orbitron)"}}>
                  {pnl>=0?"+":""}{pnl.toFixed(3)} ◎
                </span>
              </div>
            </div>
          </div>

          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#374151",marginBottom:14}}>Rules</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[["Blackjack pays","3:2","#10b981"],["Dealer stands","Hard 17","#fff"],["Double on","Any 2 cards","#fff"],["House edge","~5%","#a78bfa"]].map(([l,v,c])=>(
                <div key={l as string} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:"#4b5563"}}>{l}</span>
                  <span style={{fontWeight:700,color:c as string}}>{v}</span>
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

export default function BlackjackPage(){return <WalletProvider><BlackjackGame/></WalletProvider>;}
