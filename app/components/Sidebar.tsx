"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Home, TrendingUp, Coins, Layers, Dices,
  Bomb, LayoutGrid, Timer, Clock, ArrowUpDown,
} from "lucide-react";

const BRAND = "#f59e0b";
const BRAND_DIM = "#d97706";

const GAMES = [
  { href: "/coinflip", label: "Coin Flip",      accent: "#10b981", hot: false, Icon: Coins      },
  { href: "/blackjack",label: "Blackjack",      accent: "#ef4444", hot: false, Icon: Layers     },
  { href: "/dice",     label: "Dice",           accent: "#06b6d4", hot: false, Icon: Dices      },
  { href: "/mines",    label: "Mines",          accent: "#a855f7", hot: true,  Icon: Bomb       },
  { href: "/lastbet",  label: "Last Bet Wins",  accent: "#f97316", hot: true,  Icon: Timer      },
  { href: "/keno",     label: "Keno",           accent: "#f59e0b", hot: true,  Icon: LayoutGrid },
  { href: "/hilo",    label: "Hi-Lo",          accent: "#ec4899", hot: true,  Icon: ArrowUpDown },
];

// Tangy logo mark
function TangyLogo() {
  return (
    <Image src="/tangy-logo.png" alt="Tangy" width={42} height={50} loading="eager" style={{ objectFit: "contain", mixBlendMode: "screen" }} />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [players, setPlayers] = useState(3847);
  useEffect(() => {
    const t = setInterval(() => setPlayers(p => p + (Math.random() > 0.5 ? 1 : -1)), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: "var(--bg-sidebar)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0, overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <TangyLogo />
          <div>
            <div style={{ fontSize: 9, color: "#374151", letterSpacing: 3, textTransform: "uppercase" }}>BETA</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", padding: "4px 6px 8px" }}>LOBBY</div>

        <Link href="/" className="nav-item" style={pathname === "/" ? {
          background: `rgba(245,158,11,0.08)`, color: BRAND, border: `1px solid rgba(245,158,11,0.2)`
        } : {}}>
          <Home size={15} strokeWidth={pathname === "/" ? 2.5 : 1.8}/>
          <span>Home</span>
        </Link>

        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#374151", padding: "10px 6px 8px" }}>GAMES</div>

        {GAMES.map(({ href, label, accent, hot, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="nav-item" style={active ? {
              background: `${accent}12`, color: accent, border: `1px solid ${accent}28`
            } : {}}>
              <span style={{ color: accent, opacity: active ? 1 : 0.65 }}>
                <Icon size={15} strokeWidth={active ? 2.5 : 1.8}/>
              </span>
              <span>{label}</span>
              {hot && (
                <span style={{
                  marginLeft: "auto", fontSize: 9, fontWeight: 800, letterSpacing: 1,
                  background: `rgba(245,158,11,0.1)`, color: BRAND,
                  border: `1px solid rgba(245,158,11,0.22)`,
                  borderRadius: 100, padding: "2px 7px",
                }}>HOT</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <div className="live-badge" style={{ marginBottom: 10 }}>
          <span className="live-dot"/> LIVE
        </div>
        <div style={{ fontSize: 11, color: "#4b5563", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Players online</span>
            <span style={{ color: "#10b981", fontWeight: 700 }}>{players.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>House edge</span>
            <span style={{ color: BRAND, fontWeight: 700 }}>2%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
