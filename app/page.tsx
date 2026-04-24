"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Activity, Wallet, Trophy, Users, Zap, Bomb, Flame, TrendingUp, Crown } from "lucide-react";
import { WalletProvider, useWallet } from "./components/WalletContext";

/* ─────────────────────────────── LOADING SCREEN ── */
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 18 + 6;
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        setProgress(100);
        setTimeout(() => { setExiting(true); setTimeout(onDone, 400); }, 300);
      } else {
        setProgress(p);
      }
    }, 80);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <div className={`loader-screen ${exiting ? "loader-exit" : ""}`}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)", filter: "blur(60px)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}/>

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <Image src="/tangy-logo.png" alt="TANGY" width={220} height={259} loading="eager" style={{ objectFit: "contain", mixBlendMode: "screen", animation: "logoFloat 3s ease-in-out infinite", filter: "drop-shadow(0 0 30px rgba(245,158,11,0.6)) drop-shadow(0 0 60px rgba(245,158,11,0.3))" }} />
          <div style={{ fontSize: 10, color: "#4a4b6a", letterSpacing: 8, textTransform: "uppercase", marginTop: 4 }}>
            Solana Casino
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="loader-bar-track">
            <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#4a4b6a", letterSpacing: 3, fontFamily: "var(--font-space)" }}>
            {progress < 100 ? "Loading..." : "Ready"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── TOAST SYSTEM ── */
interface Toast { id: number; player: string; game: string; amount: string; mult: string; }

function ToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const NAMES = ["whale69","sol_ape","degen44","moonboy","chad","bigbrain","solgod","alpha99"];
  const GAMES = ["Mines","Coin Flip","Dice","Blackjack","Keno","Last Bet Wins","Hi-Lo"];

  useEffect(() => {
    const fire = () => {
      const id = idRef.current++;
      const toast: Toast = {
        id,
        player: NAMES[Math.floor(Math.random() * NAMES.length)],
        game: GAMES[Math.floor(Math.random() * GAMES.length)],
        amount: (Math.random() * 8 + 0.5).toFixed(2),
        mult: (Math.random() * 14 + 2).toFixed(2),
      };
      setToasts(p => [...p, toast]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    };

    const t = setInterval(fire, 4000 + Math.random() * 3000);
    setTimeout(fire, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <div style={{color:"#f59e0b",display:"flex",alignItems:"center"}}><Flame size={20} strokeWidth={2}/></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>
              <span style={{ color: "#f59e0b" }}>{t.player}</span> won on {t.game}
            </div>
            <div style={{ fontSize: 11, color: "#a0a0b8", marginTop: 1 }}>
              {t.amount} ◎ bet · <span style={{ color: "#10b981", fontWeight: 700 }}>+{(parseFloat(t.amount) * parseFloat(t.mult)).toFixed(2)} ◎</span> at {t.mult}×
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────── ICONS ── */
const Icons = {
  coinflip: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="12" rx="9.5" ry="9.5" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5"/>
    <ellipse cx="12" cy="12" rx="7" ry="7" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2"/>
    <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor" fontFamily="monospace">◎</text>
  </svg>,
  blackjack: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="13" height="17" rx="2" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="2" width="13" height="17" rx="2" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.5"/>
    <text x="15.5" y="14" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" fontFamily="serif">A</text>
    <text x="15.5" y="16.5" textAnchor="middle" fontSize="5" fill="currentColor" fontFamily="serif">♠</text>
  </svg>,
  dice: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 7L12 2l10 5v10l-10 5L2 17V7z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 2l10 5M12 2v15M2 7l10 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="7" cy="10" r="1.2" fill="currentColor"/>
    <circle cx="12" cy="14.5" r="1.2" fill="currentColor"/>
    <circle cx="7" cy="15.5" r="1.2" fill="currentColor"/>
  </svg>,
  mines: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="13" r="7.5" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 7.5L18.5 5M18.5 5l1.5-1.5M18.5 5l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" fillOpacity=".4"/>
    <line x1="11" y1="5" x2="11" y2="3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11" y1="21" x2="11" y2="22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="3.5" y1="13" x2="2" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18.5" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
  home: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="9" y="13" width="6" height="9" rx="1" fill="currentColor" fillOpacity=".3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>,
  keno: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="4" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18" cy="6" r="4" fill="currentColor" fillOpacity=".35" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="6" cy="18" r="4" fill="currentColor" fillOpacity=".35" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18" cy="18" r="4" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
    <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
  </svg>,
  lastbet: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 6v6l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
  </svg>,
  hilo: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="2" width="14" height="20" rx="3" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 8l3-3 3 3M9 16l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1" strokeOpacity=".3"/>
  </svg>,
};

/* ─────────────────────────────── GAME DATA ── */
const GAMES = [
  { href:"/coinflip", key:"coinflip", label:"Coin Flip", desc:"Heads or tails — instant result", accent:"#10b981", hot:false, players:31, maxMult:"1.95×", badge:"",
    bg:"linear-gradient(160deg,#001a0d 0%,#003020 50%,#001a0d 100%)",
    art:<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <defs>
        <radialGradient id="cf-bg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#10b981" stopOpacity=".15"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></radialGradient>
        <radialGradient id="cf-coin" cx="38%" cy="32%" r="60%"><stop offset="0%" stopColor="#fde68a"/><stop offset="40%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/></radialGradient>
        <filter id="cf-glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="120" cy="100" r="90" fill="url(#cf-bg)"/>
      <ellipse cx="120" cy="108" rx="52" ry="10" fill="rgba(0,0,0,0.4)" filter="url(cf-glow)"/>
      <circle cx="120" cy="90" r="52" fill="url(#cf-coin)" filter="url(#cf-glow)"/>
      <circle cx="120" cy="90" r="44" fill="none" stroke="rgba(253,230,138,0.4)" strokeWidth="2"/>
      <circle cx="120" cy="90" r="36" fill="none" stroke="rgba(253,230,138,0.2)" strokeWidth="1" strokeDasharray="6 3"/>
      <text x="120" y="100" textAnchor="middle" fill="rgba(120,53,15,0.9)" fontSize="28" fontFamily="monospace" fontWeight="bold">◎</text>
      <path d="M95 60 Q120 50 145 60" stroke="rgba(253,230,138,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="107" cy="68" r="3" fill="rgba(253,230,138,0.6)"/>
      {[0,60,120,180,240,300].map(a=>{const r=62,x=120+r*Math.cos(a*Math.PI/180),y=90+r*Math.sin(a*Math.PI/180);return<circle key={a} cx={x} cy={y} r="2" fill="#10b981" opacity=".4"/>;})}
    </svg>,
  },
  { href:"/blackjack", key:"blackjack", label:"Blackjack", desc:"Beat the dealer — 3:2 on blackjack", accent:"#ef4444", hot:false, players:24, maxMult:"3:2", badge:"",
    bg:"linear-gradient(160deg,#0a0002 0%,#1a0008 50%,#0a0002 100%)",
    art:<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <defs><filter id="bj-shadow"><feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000" floodOpacity=".7"/></filter></defs>
      <rect x="30" y="20" width="110" height="155" rx="10" fill="#0d0005" stroke="rgba(239,68,68,0.2)" strokeWidth="1" filter="url(#bj-shadow)" transform="rotate(-8 85 97)"/>
      <rect x="30" y="20" width="110" height="155" rx="10" fill="#f8f0f5" stroke="rgba(180,0,30,0.3)" strokeWidth="1" filter="url(#bj-shadow)" transform="rotate(-8 85 97)"/>
      <text x="46" y="50" fill="#c00020" fontSize="18" fontFamily="Georgia,serif" fontWeight="bold" transform="rotate(-8 46 50)">A</text>
      <text x="46" y="68" fill="#c00020" fontSize="14" fontFamily="Georgia,serif" transform="rotate(-8 46 68)">♠</text>
      <rect x="100" y="30" width="110" height="155" rx="10" fill="#fff" stroke="rgba(180,0,30,0.25)" strokeWidth="1" filter="url(#bj-shadow)" transform="rotate(5 155 107)"/>
      <text x="110" y="80" fill="#c00020" fontSize="20" fontFamily="Georgia,serif" fontWeight="bold" transform="rotate(5 110 80)">K</text>
      <text x="110" y="100" fill="#c00020" fontSize="15" fontFamily="Georgia,serif" transform="rotate(5 110 100)">♥</text>
      <text x="152" y="172" fill="#c00020" fontSize="20" fontFamily="Georgia,serif" fontWeight="bold" transform="rotate(185 152 172)">K</text>
      <rect x="80" y="168" width="80" height="24" rx="12" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.4)" strokeWidth="1"/>
      <text x="120" y="184" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#ef4444" opacity=".9">BLACKJACK!</text>
    </svg>,
  },
  { href:"/dice", key:"dice", label:"Dice", desc:"Roll over or under — up to 98× multiplier", accent:"#06b6d4", hot:false, players:19, maxMult:"98×", badge:"",
    bg:"linear-gradient(160deg,#00111a 0%,#002030 50%,#00111a 100%)",
    art:<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <defs>
        <linearGradient id="dice-face" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0e3a4a"/><stop offset="100%" stopColor="#051820"/></linearGradient>
        <linearGradient id="dice-top" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#1a5a70"/><stop offset="100%" stopColor="#0e3a4a"/></linearGradient>
        <linearGradient id="dice-side" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a2a38"/><stop offset="100%" stopColor="#051820"/></linearGradient>
        <filter id="dice-glow"><feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#06b6d4" floodOpacity=".5"/></filter>
      </defs>
      <g filter="url(#dice-glow)" transform="translate(50,20)">
        <path d="M70 0L140 35V105L70 140L0 105V35L70 0Z" fill="url(#dice-face)" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity=".7"/>
        <path d="M70 0L140 35L110 52L40 17L70 0Z" fill="url(#dice-top)" stroke="#06b6d4" strokeWidth="1" strokeOpacity=".5"/>
        <path d="M140 35L140 105L110 122L110 52L140 35Z" fill="url(#dice-side)" stroke="#06b6d4" strokeWidth="1" strokeOpacity=".4"/>
        {[[50,55],[50,80],[50,105],[90,55],[90,80],[90,105]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r="7" fill="#06b6d4" opacity=".9"/>
        ))}
      </g>
      <rect x="20" y="158" width="200" height="8" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="20" y="158" width="88" height="8" rx="4" fill="rgba(239,68,68,0.6)"/>
      <rect x="108" y="158" width="112" height="8" rx="4" fill="rgba(6,182,212,0.6)"/>
      <circle cx="108" cy="162" r="6" fill="#fff" stroke="#06b6d4" strokeWidth="2"/>
      <text x="120" y="183" textAnchor="middle" fontSize="10" fill="#06b6d4" fontFamily="monospace" fontWeight="bold" opacity=".8">ROLL OVER 44 → WIN 2.14×</text>
    </svg>,
  },
  { href:"/mines", key:"mines", label:"Mines", desc:"Reveal gems — dodge the bombs", accent:"#a855f7", hot:true, players:38, maxMult:"24×", badge:"HOT",
    bg:"linear-gradient(160deg,#0d0020 0%,#1a003a 50%,#0d0020 100%)",
    art:<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <defs>
        <radialGradient id="mine-bg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#a855f7" stopOpacity=".12"/><stop offset="100%" stopColor="#a855f7" stopOpacity="0"/></radialGradient>
        <filter id="gem-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="bomb-glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="120" cy="100" r="90" fill="url(#mine-bg)"/>
      {[0,1,2,3,4].map(col=>[0,1,2,3].map(row=>{
        const x=22+col*44,y=18+row*44;
        const isExplode=col===3&&row===1,isGem=(col+row)%3===0&&!isExplode,isHidden=!isGem&&!isExplode;
        return(<g key={`${col}-${row}`}>
          <rect x={x} y={y} width="36" height="36" rx="7"
            fill={isExplode?"rgba(239,68,68,0.15)":isGem?"rgba(168,85,247,0.2)":"rgba(255,255,255,0.03)"}
            stroke={isExplode?"rgba(239,68,68,0.8)":isGem?"rgba(168,85,247,0.6)":"rgba(255,255,255,0.06)"}
            strokeWidth={isExplode||isGem?1.5:1}/>
          {isGem&&<g filter="url(#gem-glow)">
            <polygon points={`${x+18},${y+8} ${x+28},${y+18} ${x+18},${y+28} ${x+8},${y+18}`} fill="#a855f7" opacity=".9"/>
            <polygon points={`${x+18},${y+8} ${x+28},${y+18} ${x+18},${y+18}`} fill="rgba(255,255,255,0.35)"/>
          </g>}
          {isExplode&&<g filter="url(#bomb-glow)">
            <circle cx={x+18} cy={y+20} r="9" fill="#ef4444" opacity=".9"/>
            <line x1={x+18} y1={y+10} x2={x+18} y2={y+7} stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            <line x1={x+24} y1={y+12} x2={x+27} y2={y+9} stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1={x+12} y1={y+12} x2={x+9} y2={y+9} stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
            {[0,45,90,135,180,225,270,315].map(a=>{const r=16,bx=x+18+r*Math.cos(a*Math.PI/180),by=y+20+r*Math.sin(a*Math.PI/180);return<circle key={a} cx={bx} cy={by} r="2" fill="#f97316" opacity=".8"/>;})}
          </g>}
        </g>);
      }))}
    </svg>,
  },
  { href:"/keno", key:"keno", label:"Keno", desc:"Pick your numbers — massive multipliers", accent:"#f59e0b", hot:true, players:52, maxMult:"180×", badge:"HOT",
    bg:"linear-gradient(160deg,#110d00 0%,#201500 50%,#110d00 100%)",
    art:<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <defs>
        <radialGradient id="kn-bg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#f59e0b" stopOpacity=".14"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/></radialGradient>
        <radialGradient id="kn-ball" cx="35%" cy="30%" r="60%"><stop offset="0%" stopColor="#fde68a"/><stop offset="50%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/></radialGradient>
        <filter id="kn-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="120" cy="100" r="90" fill="url(#kn-bg)"/>
      {[{n:7,x:50,y:45,hit:true},{n:14,x:95,y:30,hit:false},{n:22,x:145,y:45,hit:true},{n:31,x:175,y:80,hit:false},{n:3,x:30,y:95,hit:false},{n:19,x:80,y:110,hit:true},{n:27,x:130,y:100,hit:false},{n:35,x:170,y:130,hit:true},{n:11,x:55,y:150,hit:false},{n:40,x:110,y:155,hit:true}].map(({n,x,y,hit})=>(
        <g key={n} filter={hit?"url(#kn-glow)":undefined}>
          <circle cx={x} cy={y} r={hit?19:15} fill={hit?"url(#kn-ball)":"rgba(255,255,255,0.05)"} stroke={hit?"rgba(253,230,138,0.6)":"rgba(255,255,255,0.08)"} strokeWidth={hit?1.5:1}/>
          {hit&&<circle cx={x-5} cy={y-6} r="5" fill="rgba(255,255,255,0.25)"/>}
          <text x={x} y={y+4} textAnchor="middle" fontSize={hit?11:9} fontFamily="monospace" fontWeight="bold" fill={hit?"rgba(120,53,15,0.95)":"rgba(255,255,255,0.3)"}>{n}</text>
        </g>
      ))}
    </svg>,
  },
  { href:"/hilo", key:"hilo", label:"Hi-Lo", desc:"Higher or lower — compound your winnings", accent:"#ec4899", hot:true, players:44, maxMult:"∞×", badge:"HOT",
    bg:"linear-gradient(160deg,#12001a 0%,#22003a 50%,#12001a 100%)",
    art:<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <defs>
        <radialGradient id="hl-bg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#ec4899" stopOpacity=".15"/><stop offset="100%" stopColor="#ec4899" stopOpacity="0"/></radialGradient>
        <filter id="hl-arrow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="120" cy="100" r="90" fill="url(#hl-bg)"/>
      <rect x="65" y="30" width="50" height="70" rx="6" fill="#fff" stroke="rgba(180,0,60,0.3)" strokeWidth="1" opacity=".25" transform="rotate(-10 90 65)"/>
      <rect x="125" y="30" width="50" height="70" rx="6" fill="#fff" stroke="rgba(180,0,60,0.3)" strokeWidth="1" opacity=".25" transform="rotate(10 150 65)"/>
      <rect x="88" y="48" width="64" height="90" rx="8" fill="#fff" stroke="rgba(180,0,60,0.2)" strokeWidth="1.5"/>
      <text x="120" y="88" textAnchor="middle" fill="#b91c1c" fontSize="26" fontFamily="Georgia,serif" fontWeight="bold">A</text>
      <text x="120" y="108" textAnchor="middle" fill="#b91c1c" fontSize="20" fontFamily="Georgia,serif">♥</text>
      <text x="96" y="63" fill="#b91c1c" fontSize="11" fontFamily="Georgia,serif" fontWeight="bold">A</text>
      <path d="M120 30 L132 48 L108 48 Z" fill="#10b981" filter="url(#hl-arrow)" opacity=".95"/>
      <path d="M120 158 L132 140 L108 140 Z" fill="#ef4444" filter="url(#hl-arrow)" opacity=".95"/>
      <rect x="70" y="163" width="100" height="22" rx="11" fill="rgba(236,72,153,0.1)" stroke="rgba(236,72,153,0.4)" strokeWidth="1"/>
      <text x="120" y="178" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#ec4899">12.48× MULTIPLIER</text>
    </svg>,
  },
  { href:"/lastbet", key:"lastbet", label:"Last Bet Wins", desc:"Last bettor when timer hits zero wins the pot", accent:"#f97316", hot:true, players:89, maxMult:"∞×", badge:"LIVE",
    bg:"linear-gradient(160deg,#1a0800 0%,#2e1200 50%,#1a0800 100%)",
    art:<svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <defs>
        <radialGradient id="lb-bg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#f97316" stopOpacity=".18"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></radialGradient>
        <filter id="lb-glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="120" cy="95" r="90" fill="url(#lb-bg)"/>
      <circle cx="120" cy="95" r="70" stroke="rgba(249,115,22,0.12)" strokeWidth="12" fill="none"/>
      <circle cx="120" cy="95" r="70" stroke="#f97316" strokeWidth="6" fill="none"
        strokeDasharray="440" strokeDashoffset="350" strokeLinecap="round"
        transform="rotate(-90 120 95)" filter="url(#lb-glow)"/>
      <circle cx="120" cy="95" r="52" fill="rgba(0,0,0,0.4)" stroke="rgba(249,115,22,0.2)" strokeWidth="1"/>
      <text x="120" y="88" textAnchor="middle" fontFamily="monospace" fontWeight="900" fontSize="36" fill="#fff">07</text>
      <text x="120" y="106" textAnchor="middle" fontSize="9" fill="#4b5563" letterSpacing="3" fontFamily="monospace">SECONDS</text>
      <rect x="58" y="150" width="124" height="30" rx="15" fill="rgba(245,197,24,0.1)" stroke="rgba(245,197,24,0.4)" strokeWidth="1.5"/>
      <circle cx="75" cy="165" r="5" fill="#f5c518" opacity=".8"/>
      <text x="120" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#f5c518">POT: 42.75 ◎</text>
    </svg>,
  },
];

const NAMES = ["sol_ape","degen44","wagmi","moonboy","chad","rektlord","bigbrain","solgod","pumpit","ngmi","alpha99","whale","paperhands","diamondz","ghostflip","deathroll","wen_moon","rugged99","solking","nfa_bro"];
function makeBet() {
  const g = GAMES[Math.floor(Math.random()*GAMES.length)];
  const amt = parseFloat((Math.random()*8+0.1).toFixed(2));
  const won = Math.random()>0.48;
  const mult = won?parseFloat((Math.random()*14+1.2).toFixed(2)):0;
  return{id:Math.random(),name:NAMES[Math.floor(Math.random()*NAMES.length)],game:g.label,accent:g.accent,amount:amt,won,mult,payout:won?parseFloat((amt*mult).toFixed(2)):0};
}

/* ─────────────────────────────── SIDEBAR ── */
function Sidebar() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const [players,setPlayers]=useState(3847);
  useEffect(()=>{ const t=setInterval(()=>setPlayers(p=>p+(Math.random()>.5?1:-1)),3000); return()=>clearInterval(t); },[]);

  return(
    <aside style={{width:220,minWidth:220,background:"var(--bg-sidebar)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0,overflow:"hidden"}}>
      {/* Logo */}
      <div style={{padding:"22px 20px 18px",borderBottom:"1px solid var(--border)"}}>
        <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>
          <Image src="/tangy-logo.png" alt="Tangy" width={46} height={54} loading="eager" style={{objectFit:"contain",mixBlendMode:"screen"}}/>
          <div style={{fontSize:9,color:"#4a4b6a",letterSpacing:3,textTransform:"uppercase"}}>BETA</div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:"14px 10px",overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#2a2b4a",padding:"4px 6px 10px"}}>LOBBY</div>
        <Link href="/" className="nav-item active">{Icons.home}<span>Home</span></Link>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#2a2b4a",padding:"14px 6px 10px"}}>GAMES</div>
        {GAMES.map(g=>(
          <Link key={g.href} href={g.href} className="nav-item" style={{color:"#4a4b6a"}}>
            <span style={{color:g.accent,opacity:.85}}>{Icons[g.key as keyof typeof Icons]}</span>
            <span>{g.label}</span>
            {g.hot&&<span style={{marginLeft:"auto",fontSize:9,fontWeight:800,background:"rgba(245,158,11,0.1)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.22)",borderRadius:100,padding:"2px 7px"}}>HOT</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{padding:"12px 16px",borderTop:"1px solid var(--border)"}}>
        <div className="live-badge" style={{marginBottom:10}}><span className="live-dot"/>LIVE</div>
        <div style={{fontSize:11,color:"#4a4b6a",display:"flex",flexDirection:"column",gap:5}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>Players online</span><span style={{color:"#10b981",fontWeight:700}}>{players.toLocaleString()}</span></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span>House edge</span><span style={{color:"#f59e0b",fontWeight:700}}>2%</span></div>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────── TOP BAR ── */
function TopBar() {
  const {balance}=useWallet();
  const [jackpot,setJackpot]=useState(84291.47);
  useEffect(()=>{ const t=setInterval(()=>setJackpot(v=>parseFloat((v+Math.random()*.6+.1).toFixed(2))),350); return()=>clearInterval(t); },[]);
  return(
    <div style={{position:"sticky",top:0,zIndex:40,background:"var(--bg-topbar)",borderBottom:"1px solid var(--border)",backdropFilter:"blur(20px)",height:60,display:"flex",alignItems:"center",padding:"0 24px",gap:16,justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Trophy size={22} strokeWidth={1.8} style={{color:"#f59e0b",filter:"drop-shadow(0 0 8px rgba(245,158,11,0.5))"}} />
        <div>
          <div style={{fontSize:9,color:"#4a4b6a",letterSpacing:3,textTransform:"uppercase"}}>Jackpot Pool</div>
          <div className="jackpot-tick" style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:15,color:"#f59e0b",textShadow:"0 0 20px rgba(245,158,11,0.5)",letterSpacing:1}}>
            {jackpot.toLocaleString("en-US",{minimumFractionDigits:2})} ◎
          </div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {[
          {href:"/leaderboard",label:"Leaderboard",Icon:Trophy,color:"#f59e0b"},
          {href:"/vip",        label:"Rewards",    Icon:Crown, color:"#a78bfa"},
        ].map(({href,label,Icon,color})=>(
          <Link key={href} href={href} style={{
            textDecoration:"none",display:"flex",alignItems:"center",gap:6,
            fontSize:12,fontWeight:600,padding:"6px 14px",borderRadius:100,
            border:"1px solid var(--border)",color:"#4b5563",
            transition:"all 0.15s ease-out",
          }}
          onMouseEnter={e=>{e.currentTarget.style.color=color;e.currentTarget.style.borderColor=`${color}40`;e.currentTarget.style.background=`${color}10`;}}
          onMouseLeave={e=>{e.currentTarget.style.color="#4b5563";e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="transparent";}}>
            <Icon size={12} strokeWidth={1.8}/>{label}
          </Link>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:100,padding:"8px 16px"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 002 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>
          <span style={{fontFamily:"var(--font-orbitron)",fontWeight:800,fontSize:13,color:"#10b981"}}>{balance.toFixed(2)} ◎</span>
        </div>
        <button className="btn-primary" style={{fontSize:12,padding:"9px 20px"}}>Connect Wallet</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────── HERO ── */
function HeroBanner() {
  const [jackpot,setJackpot]=useState(84291.47);
  useEffect(()=>{const t=setInterval(()=>setJackpot(v=>parseFloat((v+Math.random()*.8+.1).toFixed(2))),280);return()=>clearInterval(t);},[]);
  return(
    <div style={{position:"relative",borderRadius:24,overflow:"hidden",height:320,background:"linear-gradient(135deg,#100900 0%,#1e1200 40%,#0e0c18 100%)",border:"1px solid rgba(245,158,11,0.2)",boxShadow:"0 0 0 1px rgba(245,158,11,0.06), 0 24px 80px rgba(0,0,0,0.6)"}}>
      {/* Grid */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(245,158,11,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.025) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      {/* Glow orbs */}
      <div style={{position:"absolute",top:-80,left:"10%",width:420,height:420,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.16) 0%,transparent 70%)",filter:"blur(60px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-60,right:"15%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 70%)",filter:"blur(70px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"30%",right:"30%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.05) 0%,transparent 70%)",filter:"blur(40px)",pointerEvents:"none"}}/>

      {/* Left content */}
      <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 52px",maxWidth:560}}>
        <div className="live-badge" style={{marginBottom:20,width:"fit-content"}}><span className="live-dot"/>LIVE · SOLANA · NO KYC · INSTANT PAYOUTS</div>
        <h1 style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:"clamp(2.4rem,4.5vw,3.8rem)",lineHeight:1.05,marginBottom:8,letterSpacing:2}}>
          <span style={{color:"#f59e0b",textShadow:"0 0 40px rgba(245,158,11,0.7), 0 0 80px rgba(245,158,11,0.3)"}}>TANGY</span>
          <span style={{color:"#fff"}}>.FUN</span>
        </h1>
        <p style={{color:"#6b7280",fontSize:13,marginBottom:10,lineHeight:1.6}}>7 provably fair games · instant Solana payouts · no KYC required</p>

        {/* Live jackpot counter */}
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:"10px 16px",marginBottom:24,width:"fit-content"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 8px #f59e0b",animation:"live-pulse 1.6s ease-in-out infinite"}}/>
          <span style={{fontSize:10,color:"#6b7280",letterSpacing:2,textTransform:"uppercase"}}>Live Jackpot</span>
          <span style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:16,color:"#f59e0b",textShadow:"0 0 16px rgba(245,158,11,0.5)",letterSpacing:1}}>{jackpot.toLocaleString("en-US",{minimumFractionDigits:2})} ◎</span>
        </div>

        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Link href="/lastbet" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#0a1a00",fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:11,letterSpacing:2,padding:"12px 24px",borderRadius:100,boxShadow:"0 4px 24px rgba(245,158,11,0.45)"}}>
            <Zap size={13} strokeWidth={2.5}/> LAST BET WINS
          </Link>
          <Link href="/mines" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,background:"rgba(168,85,247,0.08)",color:"#a855f7",fontFamily:"var(--font-orbitron)",fontWeight:700,fontSize:11,letterSpacing:2,padding:"12px 24px",borderRadius:100,border:"1px solid rgba(168,85,247,0.25)"}}>
            <Bomb size={13} strokeWidth={1.8}/> PLAY MINES
          </Link>
        </div>
      </div>

      {/* Right: decorative rings + floating elements */}
      <div style={{position:"absolute",right:80,top:"50%",transform:"translateY(-50%)",opacity:.08,pointerEvents:"none"}}>
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
          <circle cx="110" cy="110" r="105" stroke="#f59e0b" strokeWidth="1.5"/>
          <circle cx="110" cy="110" r="80" stroke="#f59e0b" strokeWidth="1" strokeDasharray="8 4"/>
          <circle cx="110" cy="110" r="55" stroke="#f59e0b" strokeWidth="1"/>
          <circle cx="110" cy="110" r="30" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="4 3"/>
          {[0,45,90,135,180,225,270,315].map(a=>{const r=105,x=110+r*Math.cos(a*Math.PI/180),y=110+r*Math.sin(a*Math.PI/180);return<circle key={a} cx={x} cy={y} r="4" fill="#f59e0b"/>;})}
        </svg>
      </div>

      {/* Stats strip at bottom */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:48,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(245,158,11,0.08)",display:"flex",alignItems:"center",paddingLeft:52,gap:32,zIndex:3}}>
        {[{l:"Total Bets",v:"128,421+",c:"#f59e0b"},{l:"SOL Wagered",v:"642,891 ◎",c:"#10b981"},{l:"Players Online",v:"3,847",c:"#06b6d4"},{l:"House Edge",v:"~5%",c:"#a78bfa"}].map(s=>(
          <div key={s.l} style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:9,color:"#374151",letterSpacing:2,textTransform:"uppercase"}}>{s.l}</span>
            <span style={{fontFamily:"var(--font-orbitron)",fontWeight:800,fontSize:12,color:s.c}}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────── STATS ── */
function StatsRow() {
  const [s,setS]=useState({bets:128421,volume:642891,wins:58240,players:3847});
  const [mounted,setMounted]=useState(false);
  useEffect(()=>{
    setMounted(true);
    const t=setInterval(()=>setS(p=>({bets:p.bets+Math.floor(Math.random()*6),volume:p.volume+Math.floor(Math.random()*90),wins:p.wins+Math.floor(Math.random()*3),players:p.players+(Math.random()>.6?1:0)})),1800);
    return()=>clearInterval(t);
  },[]);
  if(!mounted) return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      {[1,2,3,4].map(i=>(
        <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
          <div className="skeleton" style={{width:38,height:38,borderRadius:10,flexShrink:0}}/>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
            <div className="skeleton" style={{height:8,width:"55%"}}/>
            <div className="skeleton" style={{height:14,width:"80%"}}/>
          </div>
        </div>
      ))}
    </div>
  );

  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      {[
        {label:"Total Bets",value:s.bets.toLocaleString(),color:"#f59e0b",icon:<Activity size={20} strokeWidth={1.8}/>},
        {label:"SOL Wagered",value:s.volume.toLocaleString()+" ◎",color:"#10b981",icon:<Wallet size={20} strokeWidth={1.8}/>},
        {label:"Total Wins",value:s.wins.toLocaleString(),color:"#a855f7",icon:<Trophy size={20} strokeWidth={1.8}/>},
        {label:"Online Now",value:s.players.toLocaleString(),color:"#06b6d4",icon:<Users size={20} strokeWidth={1.8}/>},
      ].map(stat=>(
        <div key={stat.label} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{color:stat.color,display:"flex",alignItems:"center",padding:"9px",background:`${stat.color}12`,borderRadius:10,border:`1px solid ${stat.color}20`}}>{stat.icon}</div>
          <div>
            <div style={{fontSize:9,color:"#4a4b6a",letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{stat.label}</div>
            <div style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:15,color:stat.color,letterSpacing:.5}}>{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────── GAME TILE ── */
function GameTile({g,idx}:{g:typeof GAMES[0];idx:number}) {
  return(
    <Link href={g.href} style={{textDecoration:"none",display:"block",cursor:"pointer"}}>
      <div className="game-tile" style={{
        position:"relative",
        animation:`tile-enter 0.5s cubic-bezier(0.23,1,0.32,1) ${idx*0.07}s both`,
        borderTop:`2px solid ${g.accent}`,
        boxShadow:"0 4px 32px rgba(0,0,0,0.5)",
      }}
        onMouseEnter={e=>{
          const el=e.currentTarget as HTMLDivElement;
          el.style.boxShadow=`0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px ${g.accent}50, 0 0 60px ${g.accent}12`;
          el.style.borderTopColor=g.accent;
        }}
        onMouseLeave={e=>{
          const el=e.currentTarget as HTMLDivElement;
          el.style.boxShadow="0 4px 32px rgba(0,0,0,0.5)";
          el.style.borderTopColor=g.accent;
        }}>

        {/* Art area */}
        <div style={{height:210,background:g.bg,position:"relative",overflow:"hidden"}}>
          {g.art}

          {/* Bottom fade into info */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:70,background:`linear-gradient(to top, rgba(22,18,8,0.95) 0%, transparent 100%)`,zIndex:4}}/>

          {/* Badge top-left */}
          {g.badge&&(
            <div className={g.badge==="HOT"?"hot-badge":""} style={{
              position:"absolute",top:12,left:12,zIndex:6,
              fontSize:9,fontWeight:800,letterSpacing:2,
              background:g.badge==="LIVE"?"rgba(16,185,129,0.15)":"rgba(245,158,11,0.12)",
              color:g.badge==="LIVE"?"#10b981":"#f5c518",
              border:`1px solid ${g.badge==="LIVE"?"rgba(16,185,129,0.5)":"rgba(245,158,11,0.4)"}`,
              borderRadius:100,padding:"4px 10px",
              display:"flex",alignItems:"center",gap:4,
            }}>
              {g.badge==="LIVE"
                ?<><span style={{width:5,height:5,borderRadius:"50%",background:"#10b981",display:"inline-block",boxShadow:"0 0 5px #10b981",animation:"live-pulse 1.6s ease-in-out infinite"}}/>LIVE</>
                :<><Flame size={9} strokeWidth={2.5}/>{g.badge}</>
              }
            </div>
          )}

          {/* Players online top-right */}
          <div style={{position:"absolute",top:12,right:12,zIndex:6,fontSize:9,color:"#6b7280",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",borderRadius:100,padding:"4px 10px",display:"flex",alignItems:"center",gap:5,border:"1px solid rgba(255,255,255,0.06)"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#10b981",display:"inline-block",boxShadow:"0 0 4px #10b981"}}/>
            <span style={{fontWeight:600}}>{g.players} playing</span>
          </div>

          {/* Max mult bottom-left (above fade) */}
          <div style={{position:"absolute",bottom:14,left:14,zIndex:5,display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontFamily:"var(--font-orbitron)",fontSize:11,fontWeight:900,color:g.accent,textShadow:`0 0 12px ${g.accent}`,letterSpacing:1}}>UP TO {g.maxMult}</span>
          </div>

          {/* Slide-up PLAY button */}
          <div className="game-tile-play">
            <div style={{background:g.accent,color:"#000",fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:11,letterSpacing:3,padding:"10px 28px",borderRadius:100,boxShadow:`0 0 24px ${g.accent}70`,pointerEvents:"none"}}>
              PLAY NOW
            </div>
          </div>
        </div>

        {/* Info bar */}
        <div style={{padding:"13px 16px 15px",background:"var(--bg-card)",borderTop:`1px solid ${g.accent}20`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
          <div>
            <div style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:13,color:"#fff",letterSpacing:1,marginBottom:3}}>{g.label}</div>
            <p style={{fontSize:11,color:"#4b5563",lineHeight:1.4}}>{g.desc}</p>
          </div>
          <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:5,background:`${g.accent}12`,border:`1px solid ${g.accent}25`,borderRadius:8,padding:"6px 10px"}}>
            <TrendingUp size={10} strokeWidth={2.5} style={{color:g.accent}}/>
            <span style={{fontFamily:"var(--font-orbitron)",fontSize:10,color:g.accent,fontWeight:800}}>{g.maxMult}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────── LIVE FEED ── */
function LiveFeed() {
  const [bets,setBets]=useState<ReturnType<typeof makeBet>[]>([]);
  const [newId,setNewId]=useState<number|null>(null);
  useEffect(()=>{setBets(Array.from({length:40},makeBet));},[]);
  useEffect(()=>{
    const t=setInterval(()=>{
      const bet=makeBet(); setNewId(bet.id);
      setTimeout(()=>setNewId(null),800);
      setBets(p=>[bet,...p.slice(0,49)]);
    },1100);
    return()=>clearInterval(t);
  },[]);
  const doubled=[...bets,...bets];

  return(
    <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span className="live-dot"/><span style={{fontWeight:700,fontSize:12,color:"#e2e4f0",letterSpacing:1}}>Live Bets</span></div>
        <span style={{fontSize:10,color:"#2a2b4a"}}>Real-time</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",padding:"8px 14px",borderBottom:"1px solid var(--border)"}}>
        {["Player","Game","Profit"].map(h=><span key={h} style={{fontSize:9,color:"#2a2b4a",letterSpacing:2,textTransform:"uppercase"}}>{h}</span>)}
      </div>
      <div style={{height:380,overflow:"hidden"}}>
        <div className="scroll-up">
          {doubled.map((bet,i)=>(
            <div key={`${bet.id}-${i}`} className={`feed-row ${newId===bet.id?(bet.won?"winner-flash":"loser-flash"):""}`}
              style={{display:"grid",gridTemplateColumns:"1fr auto auto",alignItems:"center",padding:"9px 14px",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${bet.accent}28,${bet.accent}10)`,border:`1px solid ${bet.accent}35`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,color:bet.accent,fontWeight:800}}>{bet.name.slice(0,2).toUpperCase()}</span>
                </div>
                <span style={{fontSize:12,color:"#a0a0b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bet.name}</span>
              </div>
              <span style={{fontSize:10,color:"#4a4b6a",background:"rgba(255,255,255,0.04)",padding:"2px 7px",borderRadius:6}}>{bet.game}</span>
              {bet.won
                ?<span style={{fontFamily:"var(--font-orbitron)",fontSize:11,fontWeight:800,color:"#10b981",textAlign:"right",minWidth:64}}>+{bet.payout.toFixed(2)}◎</span>
                :<span style={{fontFamily:"var(--font-orbitron)",fontSize:11,fontWeight:800,color:"#ef4444",textAlign:"right",minWidth:64}}>-{bet.amount.toFixed(2)}◎</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── WHY SECTION ── */
function WhySection() {
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      {[
        {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#f5c518" fillOpacity=".2" stroke="#f5c518" strokeWidth="1.5" strokeLinejoin="round"/></svg>,title:"Sub-second",desc:"Solana finalises in < 400ms. Win instantly.",color:"#f5c518"},
        {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="11" rx="2" fill="#10b981" fillOpacity=".15" stroke="#10b981" strokeWidth="1.5"/><path d="M8 11V7a4 4 0 118 0v4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="#10b981"/></svg>,title:"No KYC",desc:"Just a wallet. No ID, no name, no drama.",color:"#10b981"},
        {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#06b6d4" fillOpacity=".15" stroke="#06b6d4" strokeWidth="1.5"/><circle cx="12" cy="9" r="2.5" stroke="#06b6d4" strokeWidth="1.5"/></svg>,title:"Provably Fair",desc:"Every result verifiable on-chain.",color:"#06b6d4"},
        {icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" fill="#a855f7" fillOpacity=".12" stroke="#a855f7" strokeWidth="1.5"/><path d="M12 7v10M9 9.5h4.5a1.5 1.5 0 010 3H10a1.5 1.5 0 000 3H15" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/></svg>,title:"2% Edge",desc:"Lowest house edge in crypto gambling.",color:"#a855f7"},
      ].map(item=>(
        <div key={item.title} className="card card-hover" style={{padding:"20px 18px"}}>
          <div style={{marginBottom:12,display:"flex",alignItems:"center"}}>{item.icon}</div>
          <div style={{fontWeight:800,fontSize:13,color:"#e2e4f0",marginBottom:6}}>{item.title}</div>
          <div style={{fontSize:11,color:"#4a4b6a",lineHeight:1.6}}>{item.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────── MAIN ── */
function LobbyContent() {
  return(
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
      <div className="aurora"><div className="aurora-1"/><div className="aurora-2"/><div className="aurora-3"/></div>
      <ToastManager/>
      <Sidebar/>
      <div style={{flex:1,minWidth:0,position:"relative",zIndex:1}}>
        <TopBar/>
        <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:26,maxWidth:1400}}>
          <HeroBanner/>
          <StatsRow/>
          {/* Games + Feed */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:24,alignItems:"start"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <span className="section-heading">All Games</span>
                <div style={{flex:1,height:1,background:"var(--border)"}}/>
                <span style={{fontSize:10,color:"#2a2b4a"}}>5 available</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {GAMES.map((g,i)=><GameTile key={g.href} g={g} idx={i}/>)}
              </div>
            </div>
            <div style={{position:"sticky",top:84}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <span className="section-heading">Live Feed</span>
                <div style={{flex:1,height:1,background:"var(--border)"}}/>
              </div>
              <LiveFeed/>
            </div>
          </div>
          {/* Why */}
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <span className="section-heading">Why Tangy</span>
              <div style={{flex:1,height:1,background:"var(--border)"}}/>
            </div>
            <WhySection/>
          </div>
          {/* Footer */}
          <div style={{borderTop:"1px solid var(--border)",paddingTop:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:14,color:"#f59e0b",textShadow:"0 0 16px rgba(245,158,11,0.4)"}}>TANGY</span><span style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:14,color:"#fff"}}>.FUN</span>
              <span style={{fontSize:9,color:"#2a2b4a",border:"1px solid #2a2b4a",padding:"2px 6px",borderRadius:4,letterSpacing:2}}>BETA</span>
            </div>
            <p style={{fontSize:11,color:"#2a2b4a"}}>Demo mode · No real funds · 18+ · Play responsibly</p>
            <div style={{display:"flex",gap:16,fontSize:11,color:"#2a2b4a"}}>
              {["Discord","Twitter","Terms","Support"].map(t=>(
                <span key={t} style={{cursor:"pointer",transition:"color 0.15s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="#a0a0b8")}
                  onMouseLeave={e=>(e.currentTarget.style.color="#2a2b4a")}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [loaded,setLoaded]=useState(false);
  return(
    <WalletProvider>
      {!loaded&&<LoadingScreen onDone={()=>setLoaded(true)}/>}
      {loaded&&<LobbyContent/>}
    </WalletProvider>
  );
}
