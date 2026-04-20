"use client";
import { useState } from "react";
import { Crown, ChevronRight, Zap, Shield, Star, Gem } from "lucide-react";
import GameLayout from "../components/GameLayout";
import { useWallet } from "../components/WalletContext";

const ACCENT = "#f59e0b";

const TIERS = [
  {
    name: "Seed",
    emoji: "🌱",
    min: 0,
    max: 10,
    color: "#6b7280",
    bg: "rgba(107,114,128,0.06)",
    border: "rgba(107,114,128,0.18)",
    glow: "rgba(107,114,128,0.12)",
    perks: ["Access to all 7 games", "Live leaderboard access", "Demo wallet (10 SOL)"],
    Icon: Zap,
  },
  {
    name: "Citrus",
    emoji: "🍋",
    min: 10,
    max: 100,
    color: "#a3e635",
    bg: "rgba(163,230,53,0.06)",
    border: "rgba(163,230,53,0.2)",
    glow: "rgba(163,230,53,0.12)",
    perks: ["Everything in Seed", "Priority support", "Leaderboard badge"],
    Icon: Zap,
  },
  {
    name: "Tropical",
    emoji: "🌴",
    min: 100,
    max: 500,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.06)",
    border: "rgba(6,182,212,0.2)",
    glow: "rgba(6,182,212,0.12)",
    perks: ["Everything in Citrus", "0.5% cashback on losses", "Exclusive game access", "Higher bet limits"],
    Icon: Shield,
  },
  {
    name: "Elite",
    emoji: "👑",
    min: 500,
    max: 2000,
    color: ACCENT,
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.25)",
    glow: "rgba(245,158,11,0.15)",
    perks: ["Everything in Tropical", "1% cashback on losses", "Personal account manager", "VIP leaderboard position"],
    Icon: Crown,
  },
  {
    name: "Diamond",
    emoji: "💎",
    min: 2000,
    max: null,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.28)",
    glow: "rgba(167,139,250,0.18)",
    perks: ["Everything in Elite", "2% cashback on all losses", "Custom bet limits", "Dedicated VIP host", "Exclusive Diamond events"],
    Icon: Gem,
  },
];

function getUserTier(wagered: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (wagered >= TIERS[i].min) return i;
  }
  return 0;
}

function ProgressBar({ current, min, max, color }: { current: number; min: number; max: number | null; color: string }) {
  if (!max) return (
    <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 1 }}>MAX TIER REACHED</div>
  );
  const pct = Math.min(100, ((current - min) / (max - min)) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4b5563", marginBottom: 6 }}>
        <span>{current.toFixed(1)} SOL</span>
        <span>{max} SOL to next tier</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 100, transition: "width 0.6s ease-out",
        }} />
      </div>
    </div>
  );
}

export default function VIPPage() {
  const { connected, balance } = useWallet();
  // Simulate wagered amount (in real app this would come from backend)
  const [simulatedWagered] = useState(0);
  const userTierIdx = getUserTier(simulatedWagered);
  const currentTier = TIERS[userTierIdx];

  return (
    <GameLayout title="VIP TIERS" accent={ACCENT} icon={<Crown size={18} />}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-orbitron)", fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: 2, margin: 0 }}>
            VIP PROGRAM
          </h1>
          <p style={{ color: "#4b5563", fontSize: 13, marginTop: 6 }}>
            Wager more, climb higher, unlock exclusive rewards.
          </p>
        </div>

        {/* Current status card */}
        <div style={{
          background: currentTier.bg,
          border: `1px solid ${currentTier.border}`,
          borderRadius: 16, padding: "20px 24px", marginBottom: 28,
          boxShadow: `0 0 32px ${currentTier.glow}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${currentTier.color}18`,
              border: `1px solid ${currentTier.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>{currentTier.emoji}</div>
            <div>
              <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 2, textTransform: "uppercase" }}>Your Current Tier</div>
              <div style={{ fontFamily: "var(--font-orbitron)", fontWeight: 900, fontSize: 20, color: currentTier.color, letterSpacing: 2 }}>
                {currentTier.name.toUpperCase()}
              </div>
            </div>
            {!connected && (
              <div style={{ marginLeft: "auto", fontSize: 11, color: "#4b5563", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px" }}>
                Connect wallet to track progress
              </div>
            )}
          </div>
          <ProgressBar
            current={simulatedWagered}
            min={currentTier.min}
            max={currentTier.max}
            color={currentTier.color}
          />
        </div>

        {/* Tiers grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TIERS.map((tier, idx) => {
            const isActive = idx === userTierIdx;
            const isLocked = idx > userTierIdx;
            return (
              <div key={tier.name} style={{
                background: isActive ? tier.bg : "var(--bg-card)",
                border: `1px solid ${isActive ? tier.border : "var(--border)"}`,
                borderRadius: 14, padding: "18px 22px",
                opacity: isLocked ? 0.55 : 1,
                boxShadow: isActive ? `0 0 24px ${tier.glow}` : "none",
                transition: "all 0.15s ease-out",
                position: "relative", overflow: "hidden",
              }}>
                {isActive && (
                  <div style={{
                    position: "absolute", top: 10, right: 14,
                    fontSize: 9, fontWeight: 800, letterSpacing: 2,
                    background: `${tier.color}20`, color: tier.color,
                    border: `1px solid ${tier.color}40`,
                    borderRadius: 100, padding: "3px 10px",
                  }}>CURRENT</div>
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  {/* Tier icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: `${tier.color}12`,
                    border: `1px solid ${tier.color}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}>{tier.emoji}</div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-orbitron)", fontWeight: 900, fontSize: 15, color: tier.color, letterSpacing: 2 }}>
                        {tier.name.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 11, color: "#4b5563" }}>
                        {tier.max ? `${tier.min} – ${tier.max} SOL wagered` : `${tier.min}+ SOL wagered`}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                      {tier.perks.map((perk, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: i === 0 ? "#6b7280" : "#9ca3af" }}>
                          <Star size={10} style={{ color: tier.color, flexShrink: 0 }} fill={tier.color} />
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>

                  {idx < TIERS.length - 1 && !isActive && isLocked && (
                    <ChevronRight size={16} style={{ color: "#374151", flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#374151", marginTop: 24 }}>
          Tier progress tracks lifetime wagered volume · Cashback activates at Tropical and above
        </p>
      </div>
    </GameLayout>
  );
}
