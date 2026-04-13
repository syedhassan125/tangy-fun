"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

const LINKS = [
  { href: "/crash",     label: "Crash",     color: "#f97316" },
  { href: "/coinflip",  label: "Coin Flip",  color: "#10b981" },
  { href: "/blackjack", label: "Blackjack",  color: "#ef4444" },
  { href: "/dice",      label: "Dice",       color: "#06b6d4" },
  { href: "/mines",     label: "Mines",      color: "#a855f7" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(6,6,15,0.92)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
          }}>🎰</div>
          <span style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 14, letterSpacing: 2, color: "#fff" }}>
            TANGY<span style={{ color: "#f5c518" }}>.FUN</span>
          </span>
          <span style={{ fontSize: 9, color: "#4b5563", border: "1px solid #1f2937", padding: "2px 6px", borderRadius: 4, letterSpacing: 2, marginLeft: 2 }}>BETA</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden lg:flex">
          {LINKS.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} style={{
                textDecoration: "none",
                padding: "7px 14px", borderRadius: 9,
                fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                background: active ? `${l.color}18` : "transparent",
                color: active ? l.color : "#4b5563",
                border: active ? `1px solid ${l.color}35` : "1px solid transparent",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.background = "transparent"; }}}>
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <WalletButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4, display: "none" }}
            className="lg:hidden">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, background: "rgba(6,6,15,0.98)" }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                textDecoration: "none", padding: "9px 0",
                borderRadius: 10, textAlign: "center",
                fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                background: pathname === l.href ? `${l.color}15` : "rgba(255,255,255,0.03)",
                border: `1px solid ${pathname === l.href ? l.color + "35" : "rgba(255,255,255,0.06)"}`,
                color: pathname === l.href ? l.color : "#6b7280",
              }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
