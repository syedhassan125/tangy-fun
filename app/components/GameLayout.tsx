"use client";
import { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { useWallet } from "./WalletContext";

interface Props {
  children: ReactNode;
  title: string;
  accent: string;
  icon: ReactNode;
}

function TopBar({ title, accent, icon }: { title: string; accent: string; icon: ReactNode }) {
  const { balance } = useWallet();
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "rgba(6,6,15,0.92)",
      borderBottom: "1px solid var(--border)",
      backdropFilter: "blur(20px)",
      height: 60, display: "flex", alignItems: "center",
      padding: "0 24px", gap: 16, justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{
          textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "#4b5563", fontWeight: 600,
          padding: "6px 12px", borderRadius: 8,
          border: "1px solid var(--border)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = "var(--border)"; }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Lobby
        </Link>
        <div style={{ width: 1, height: 20, background: "var(--border)" }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: accent }}>{icon}</span>
          <span style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 900, fontSize: 14, letterSpacing: 2, color: "#fff" }}>{title}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "7px 14px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 002 2h14v-4"/><circle cx="18" cy="12" r="2"/></svg>
          <span style={{ fontFamily: "var(--font-orbitron, monospace)", fontWeight: 800, fontSize: 13, color: "#10b981", letterSpacing: 1 }}>{balance.toFixed(2)} ◎</span>
        </div>
        <button className="btn-primary" style={{ fontSize: 11, padding: "8px 16px", letterSpacing: 1 }}>Connect Wallet</button>
      </div>
    </div>
  );
}

export default function GameLayout({ children, title, accent, icon }: Props) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Aurora */}
      <div className="aurora" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="aurora-1"/><div className="aurora-2"/><div className="aurora-3"/>
      </div>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <TopBar title={title} accent={accent} icon={icon} />
        <div style={{ padding: "24px 28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
