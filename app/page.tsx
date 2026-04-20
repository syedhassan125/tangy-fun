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
  { href:"/coinflip",  key:"coinflip",  label:"Coin Flip", desc:"Heads or tails · 1.96× payout",   accent:"#10b981", hot:false, players:31, maxMult:"1.96×",
    bg:"linear-gradient(145deg,#001a0d,#002a18,#001208)",
    art:<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <defs><radialGradient id="cg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#10b981" stopOpacity=".28"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></radialGradient></defs>
      <circle cx="100" cy="60" r="52" fill="url(#cg)"/>
      <circle cx="100" cy="60" r="40" stroke="#10b981" strokeWidth="1.5" strokeOpacity=".45"/>
      <circle cx="100" cy="60" r="30" stroke="#34d399" strokeWidth="1" strokeDasharray="5 3" strokeOpacity=".6"/>
      <text x="100" y="70" textAnchor="middle" fill="#10b981" fontSize="30" fontFamily="monospace" fontWeight="bold" opacity=".9">◎</text>
    </svg>,
  },
  { href:"/blackjack", key:"blackjack", label:"Blackjack", desc:"Beat the dealer · 3:2 blackjack",  accent:"#ef4444", hot:false, players:24, maxMult:"3:2",
    bg:"linear-gradient(145deg,#1a0005,#2a0010,#120003)",
    art:<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <rect x="62" y="14" width="52" height="76" rx="7" fill="#12000a" stroke="#ef4444" strokeWidth="1.5" strokeOpacity=".5"/>
      <rect x="86" y="24" width="52" height="76" rx="7" fill="#0c0005" stroke="#ef4444" strokeWidth="1.5" strokeOpacity=".85"/>
      <text x="90" y="75" textAnchor="middle" fill="#ef4444" fontSize="30" fontFamily="serif" opacity=".9">♠</text>
      <text x="91" y="42" textAnchor="middle" fill="#ef4444" fontSize="13" fontFamily="monospace" fontWeight="bold" opacity=".9">A</text>
      <text x="132" y="93" textAnchor="middle" fill="#ef4444" fontSize="13" fontFamily="monospace" fontWeight="bold" opacity=".45" transform="rotate(180,132,93)">A</text>
    </svg>,
  },
  { href:"/dice",      key:"dice",      label:"Dice",      desc:"Roll over or under your target",   accent:"#06b6d4", hot:false, players:19, maxMult:"98×",
    bg:"linear-gradient(145deg,#00111a,#001e2d,#000f18)",
    art:<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <defs><linearGradient id="dt" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ef4444" stopOpacity=".75"/><stop offset="44%" stopColor="#ef4444" stopOpacity=".75"/><stop offset="44%" stopColor="#06b6d4" stopOpacity=".75"/><stop offset="100%" stopColor="#06b6d4" stopOpacity=".75"/></linearGradient></defs>
      <rect x="20" y="54" width="160" height="7" rx="3.5" fill="rgba(255,255,255,0.05)"/>
      <rect x="20" y="54" width="160" height="7" rx="3.5" fill="url(#dt)"/>
      <rect x="107" y="50" width="2" height="15" rx="1" fill="#fff" opacity=".8"/>
      <rect x="73" y="14" width="54" height="42" rx="9" fill="#0a1e28" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity=".65"/>
      <circle cx="88" cy="27" r="3.5" fill="#06b6d4" opacity=".9"/><circle cx="112" cy="27" r="3.5" fill="#06b6d4" opacity=".9"/><circle cx="100" cy="35" r="3.5" fill="#06b6d4" opacity=".9"/>
    </svg>,
  },
  { href:"/mines",     key:"mines",     label:"Mines",     desc:"Reveal tiles · avoid the bombs",   accent:"#a855f7", hot:true,  players:38, maxMult:"24×",
    bg:"linear-gradient(145deg,#0d0020,#18003a,#0a0018)",
    art:<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      {[0,1,2,3,4].map(col=>[0,1,2].map(row=>{
        const x=30+col*30,y=15+row*30,isMine=(col===2&&row===1)||(col===4&&row===0),isRev=col<2||(col===2&&row===0);
        return(<g key={`${col}-${row}`}><rect x={x} y={y} width="24" height="24" rx="4" fill={isMine?"rgba(168,85,247,0.12)":isRev?"rgba(168,85,247,0.22)":"rgba(255,255,255,0.03)"} stroke={isRev?"rgba(168,85,247,0.55)":"rgba(255,255,255,0.07)"} strokeWidth="1"/>{isMine&&<><circle cx={x+12} cy={y+13} r="5" fill="#a855f7" opacity=".85"/><line x1={x+12} y1={y+7} x2={x+12} y2={y+5} stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/><line x1={x+15} y1={y+8} x2={x+17} y2={y+6} stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round"/></>}{isRev&&!isMine&&<text x={x+12} y={y+17} textAnchor="middle" fontSize="11" fill="#a855f7" fontFamily="monospace" fontWeight="bold" opacity=".9">✓</text>}</g>);
      }))}
    </svg>,
  },
  { href:"/keno",      key:"keno",      label:"Keno",      desc:"Pick numbers · up to 5000× payout",  accent:"#f59e0b", hot:true,  players:52, maxMult:"5000×",
    bg:"linear-gradient(145deg,#110d00,#1c1500,#0f0b00)",
    art:<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <defs><radialGradient id="kg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f59e0b" stopOpacity=".2"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/></radialGradient></defs>
      <circle cx="100" cy="60" r="55" fill="url(#kg)"/>
      {[0,1,2,3,4,5,6,7].map(col=>[0,1,2].map(row=>{
        const x=18+col*22,y=12+row*34,isHit=(col===1&&row===0)||(col===3&&row===1)||(col===5&&row===2)||(col===7&&row===0)||(col===2&&row===2);
        return(<g key={`${col}-${row}`}><circle cx={x+9} cy={y+9} r="9" fill={isHit?"rgba(245,158,11,0.25)":"rgba(255,255,255,0.03)"} stroke={isHit?"rgba(245,158,11,0.7)":"rgba(255,255,255,0.07)"} strokeWidth="1"/>{isHit&&<circle cx={x+9} cy={y+9} r="5" fill="#f59e0b" opacity=".8" style={{filter:"drop-shadow(0 0 4px #f59e0b)"}}/>}</g>);
      }))}
    </svg>,
  },
  { href:"/hilo",      key:"hilo",      label:"Hi-Lo",         desc:"Guess higher or lower · compound multiplier", accent:"#ec4899", hot:true,  players:44, maxMult:"∞×",
    bg:"linear-gradient(145deg,#12001a,#1e0030,#0a0012)",
    art:<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <defs><radialGradient id="hg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ec4899" stopOpacity=".2"/><stop offset="100%" stopColor="#ec4899" stopOpacity="0"/></radialGradient></defs>
      <circle cx="100" cy="60" r="55" fill="url(#hg)"/>
      {/* Center card */}
      <rect x="78" y="22" width="44" height="60" rx="5" fill="#fff" stroke="rgba(220,38,38,0.45)" strokeWidth="1.5"/>
      <text x="100" y="52" textAnchor="middle" fill="#dc2626" fontSize="16" fontFamily="serif" fontWeight="bold" opacity=".95">A</text>
      <text x="100" y="66" textAnchor="middle" fill="#dc2626" fontSize="12" fontFamily="serif" opacity=".85">♥</text>
      {/* HI arrow */}
      <path d="M100 16l6 8H94l6-8z" fill="#ec4899" opacity=".85" style={{filter:"drop-shadow(0 0 6px #ec4899)"}}/>
      {/* LO arrow */}
      <path d="M100 88l6-8H94l6 8z" fill="#ec4899" opacity=".85" style={{filter:"drop-shadow(0 0 6px #ec4899)"}}/>
      {/* Multiplier text */}
      <text x="100" y="106" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#ec4899" opacity=".8">12.48× · COMPOUND</text>
    </svg>,
  },
  { href:"/lastbet",   key:"lastbet",   label:"Last Bet Wins", desc:"Last to bet before timer wins the pot", accent:"#f97316", hot:true,  players:89, maxMult:"∞×",
    bg:"linear-gradient(145deg,#1a0800,#2a0f00,#160700)",
    art:<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
      <defs><radialGradient id="lg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f97316" stopOpacity=".18"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></radialGradient></defs>
      <circle cx="100" cy="60" r="55" fill="url(#lg)"/>
      {/* Clock ring */}
      <circle cx="100" cy="60" r="45" stroke="#f97316" strokeWidth="2" strokeOpacity=".25" fill="none"/>
      <circle cx="100" cy="60" r="45" stroke="#f97316" strokeWidth="2.5" strokeOpacity=".9" fill="none"
        strokeDasharray="212" strokeDashoffset="80" strokeLinecap="round"
        transform="rotate(-90 100 60)" style={{filter:"drop-shadow(0 0 6px #f97316)"}}/>
      {/* Clock hands */}
      <line x1="100" y1="60" x2="100" y2="24" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeOpacity=".9"/>
      <line x1="100" y1="60" x2="124" y2="72" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity=".6"/>
      <circle cx="100" cy="60" r="4" fill="#f97316"/>
      {/* Jackpot badge */}
      <rect x="60" y="88" width="80" height="22" rx="11" fill="rgba(245,197,24,0.12)" stroke="rgba(245,197,24,0.35)" strokeWidth="1"/>
      <text x="100" y="103" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#f5c518" opacity=".9">JACKPOT LIVE</text>
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
  return(
    <div style={{position:"relative",borderRadius:22,overflow:"hidden",height:230,background:"linear-gradient(135deg,#100900 0%,#1a1000 45%,#0e0c18 100%)",border:"1px solid rgba(245,158,11,0.2)",boxShadow:"0 0 0 1px rgba(245,158,11,0.06), 0 20px 80px rgba(0,0,0,0.5)"}}>
      {/* Subtle grid */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(245,158,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.03) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
      {/* Glow orbs */}
      <div style={{position:"absolute",top:-60,left:"15%",width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.14) 0%,transparent 70%)",filter:"blur(55px)"}}/>
      <div style={{position:"absolute",bottom:-40,right:"20%",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)",filter:"blur(60px)"}}/>

      {/* Content */}
      <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 44px"}}>
        <div className="live-badge" style={{marginBottom:16,width:"fit-content"}}><span className="live-dot"/>LIVE · SOLANA · NO KYC · INSTANT</div>
        <h1 style={{fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:"clamp(2rem,4vw,3.2rem)",lineHeight:1.1,marginBottom:12,letterSpacing:3}}>
          <span style={{color:"#f59e0b",textShadow:"0 0 40px rgba(245,158,11,0.55), 0 0 80px rgba(245,158,11,0.25)"}}>TANGY</span>
          <span style={{color:"#fff"}}>.FUN</span>
        </h1>
        <p style={{color:"#6b7280",fontSize:13,marginBottom:22}}>6 provably fair games · 2% house edge · win instantly on Solana</p>
        <div style={{display:"flex",gap:10}}>
          <Link href="/lastbet" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#0a1a00",fontFamily:"var(--font-orbitron)",fontWeight:900,fontSize:12,letterSpacing:2,padding:"11px 22px",borderRadius:100,border:"none",boxShadow:"0 4px 20px rgba(245,158,11,0.35)"}}>
            <Zap size={14} strokeWidth={2.5}/> Last Bet Wins
          </Link>
          <Link href="/mines" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.05)",color:"#9ca3af",fontFamily:"var(--font-orbitron)",fontWeight:700,fontSize:12,letterSpacing:2,padding:"11px 22px",borderRadius:100,border:"1px solid rgba(255,255,255,0.1)"}}>
            <Bomb size={14} strokeWidth={1.8}/> Play Mines
          </Link>
        </div>
      </div>

      {/* Decorative citrus ring */}
      <div style={{position:"absolute",right:60,top:"50%",transform:"translateY(-50%)",opacity:.06}}>
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="75" stroke="#f59e0b" strokeWidth="2"/>
          <circle cx="80" cy="80" r="55" stroke="#f59e0b" strokeWidth="1.5"/>
          <circle cx="80" cy="80" r="35" stroke="#f59e0b" strokeWidth="1"/>
          <line x1="80" y1="5" x2="80" y2="155" stroke="#f59e0b" strokeWidth="1"/>
          <line x1="5" y1="80" x2="155" y2="80" stroke="#f59e0b" strokeWidth="1"/>
          <line x1="27" y1="27" x2="133" y2="133" stroke="#f59e0b" strokeWidth="1"/>
          <line x1="133" y1="27" x2="27" y2="133" stroke="#f59e0b" strokeWidth="1"/>
          <circle cx="80" cy="80" r="8" fill="#f59e0b"/>
        </svg>
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
function GameTile({g}:{g:typeof GAMES[0]}) {
  return(
    <Link href={g.href} style={{textDecoration:"none",display:"block",cursor:"pointer"}}>
      <div className="game-tile" style={{position:"relative",boxShadow:`0 4px 24px rgba(0,0,0,0.5)`}}
        onMouseEnter={e=>{ (e.currentTarget as HTMLDivElement).style.boxShadow=`0 20px 60px rgba(0,0,0,0.6), 0 0 80px ${g.accent}20, 0 0 0 1px ${g.accent}25`; }}
        onMouseLeave={e=>{ (e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 24px rgba(0,0,0,0.5)"; }}>

        {/* Art */}
        <div style={{height:148,background:g.bg,position:"relative",overflow:"hidden"}}>
          {g.art}
          {g.hot&&<div style={{position:"absolute",top:10,left:10,zIndex:5,fontSize:9,fontWeight:800,letterSpacing:2,background:"rgba(245,158,11,0.12)",color:"#f5c518",border:"1px solid rgba(245,158,11,0.35)",borderRadius:100,padding:"3px 9px",display:"flex",alignItems:"center",gap:4}}><Flame size={9} strokeWidth={2.5}/>HOT</div>}
          <div style={{position:"absolute",top:10,right:10,zIndex:5,fontSize:9,color:"#4a4b6a",background:"rgba(0,0,0,0.55)",borderRadius:100,padding:"3px 8px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#10b981",display:"inline-block",boxShadow:"0 0 4px #10b981"}}/>
            {g.players}
          </div>
          {/* Hover overlay */}
          <div className="game-tile-overlay">
            <div className="btn-primary" style={{fontSize:13,padding:"10px 28px",pointerEvents:"none"}}>Play Now</div>
          </div>
        </div>

        {/* Info */}
        <div style={{padding:"14px 16px",background:"var(--bg-card)",borderTop:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontFamily:"var(--font-orbitron)",fontWeight:800,fontSize:13,color:"#e2e4f0",letterSpacing:1}}>{g.label}</span>
            <span style={{fontFamily:"var(--font-orbitron)",fontSize:11,color:g.accent,fontWeight:700,display:"flex",alignItems:"center",gap:3}}><TrendingUp size={11} strokeWidth={2.5}/>{g.maxMult}</span>
          </div>
          <p style={{fontSize:11,color:"#4a4b6a"}}>{g.desc}</p>
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
                {GAMES.map(g=><GameTile key={g.href} g={g}/>)}
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
