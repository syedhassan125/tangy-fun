"use client";
import { useState, useEffect } from "react";
import { Trophy, Crown, Medal, TrendingUp, Clock, Users } from "lucide-react";
import GameLayout from "../components/GameLayout";

const ACCENT = "#f59e0b";

const MOCK_PLAYERS = [
  { rank: 1,  name: "0xDegen...4f2a", wagered: 4821.50, wins: 312, games: 891 },
  { rank: 2,  name: "SolSharK...9c1b", wagered: 3644.20, wins: 247, games: 703 },
  { rank: 3,  name: "TangyKing...77e3", wagered: 2987.80, wins: 198, games: 614 },
  { rank: 4,  name: "NightApe...2d8f", wagered: 2103.40, wins: 176, games: 502 },
  { rank: 5,  name: "CryptoWolf...b5a1", wagered: 1876.60, wins: 154, games: 433 },
  { rank: 6,  name: "FlipGod...3e9c", wagered: 1542.30, wins: 129, games: 387 },
  { rank: 7,  name: "LuckySOL...f1d4", wagered: 1211.90, wins: 103, games: 298 },
  { rank: 8,  name: "JuicyBets...8b2e", wagered: 987.20,  wins: 89,  games: 241 },
  { rank: 9,  name: "CitrusMax...6a7f", wagered: 743.50,  wins: 71,  games: 189 },
  { rank: 10, name: "DiamondH...c4d1", wagered: 612.80,  wins: 58,  games: 154 },
];

function getRankStyle(rank: number): { color: string; bg: string; border: string } {
  if (rank === 1) return { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)" };
  if (rank === 2) return { color: "#9ca3af", bg: "rgba(156,163,175,0.06)", border: "rgba(156,163,175,0.18)" };
  if (rank === 3) return { color: "#cd7f32", bg: "rgba(205,127,50,0.06)", border: "rgba(205,127,50,0.18)" };
  return { color: "#4b5563", bg: "transparent", border: "rgba(245,158,11,0.06)" };
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={16} style={{ color: "#fbbf24" }} />;
  if (rank === 2) return <Trophy size={16} style={{ color: "#9ca3af" }} />;
  if (rank === 3) return <Medal size={16} style={{ color: "#cd7f32" }} />;
  return <span style={{ fontSize: 13, fontWeight: 700, color: "#4b5563", fontFamily: "var(--font-orbitron)" }}>#{rank}</span>;
}

function Countdown() {
  const getSecondsUntilMonday = () => {
    const now = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysUntilMonday);
    monday.setHours(0, 0, 0, 0);
    return Math.floor((monday.getTime() - now.getTime()) / 1000);
  };

  const [secs, setSecs] = useState(getSecondsUntilMonday());
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {[{ v: d, l: "D" }, { v: h, l: "H" }, { v: m, l: "M" }, { v: s, l: "S" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center" }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 10px", minWidth: 42,
            fontFamily: "var(--font-orbitron)", fontWeight: 800, fontSize: 16, color: ACCENT,
          }}>{String(v).padStart(2, "0")}</div>
          <div style={{ fontSize: 9, color: "#4b5563", marginTop: 3, letterSpacing: 1 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <GameLayout title="LEADERBOARD" accent={ACCENT} icon={<Trophy size={18} />}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-orbitron)", fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: 2, margin: 0 }}>
              WEEKLY LEADERBOARD
            </h1>
            <p style={{ color: "#4b5563", fontSize: 13, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={13} style={{ color: ACCENT }} />
              Top players by total wagered · Resets every Monday at 00:00 UTC
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
              <Clock size={10} /> Resets in
            </div>
            <Countdown />
          </div>
        </div>

        {/* Prizes banner */}
        <div style={{
          background: "rgba(245,158,11,0.04)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: 14, padding: "14px 20px",
          marginBottom: 24, display: "flex", alignItems: "center", gap: 12,
        }}>
          <Crown size={20} style={{ color: ACCENT, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: ACCENT, fontFamily: "var(--font-orbitron)", letterSpacing: 1 }}>
              PRIZES COMING SOON
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
              Rewards will be activated as our player base grows. Climb the board now to secure your spot when prizes go live.
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Players This Week", value: "3,847", icon: <Users size={16} style={{ color: ACCENT }} /> },
            { label: "Total Wagered", value: "21,531 SOL", icon: <TrendingUp size={16} style={{ color: "#10b981" }} /> },
            { label: "Games Played", value: "48,203", icon: <Trophy size={16} style={{ color: "#a855f7" }} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
            }}>
              {icon}
              <div>
                <div style={{ fontSize: 11, color: "#4b5563", letterSpacing: 1 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-orbitron)", fontWeight: 800, fontSize: 15, color: "#fff", marginTop: 3 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "60px 1fr 130px 90px 90px",
          padding: "10px 18px", marginBottom: 6,
          fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#374151",
          textTransform: "uppercase",
        }}>
          <span>Rank</span>
          <span>Player</span>
          <span style={{ textAlign: "right" }}>Wagered</span>
          <span style={{ textAlign: "right" }}>Wins</span>
          <span style={{ textAlign: "right" }}>Games</span>
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {MOCK_PLAYERS.map((p) => {
            const rs = getRankStyle(p.rank);
            return (
              <div key={p.rank} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 130px 90px 90px",
                alignItems: "center",
                background: rs.bg || "var(--bg-card)",
                border: `1px solid ${rs.border}`,
                borderRadius: 12, padding: "14px 18px",
                transition: "all 0.15s ease-out",
                cursor: "default",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = rs.bg || "var(--bg-card)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32 }}>
                  <RankIcon rank={p.rank} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: p.rank <= 3 ? rs.color : "#d1d5db" }}>
                  {p.name}
                </div>
                <div style={{ textAlign: "right", fontFamily: "var(--font-orbitron)", fontWeight: 800, fontSize: 13, color: "#10b981" }}>
                  {p.wagered.toLocaleString("en-US", { minimumFractionDigits: 2 })} ◎
                </div>
                <div style={{ textAlign: "right", fontSize: 13, color: "#9ca3af" }}>
                  {p.wins.toLocaleString()}
                </div>
                <div style={{ textAlign: "right", fontSize: 13, color: "#6b7280" }}>
                  {p.games.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#374151", marginTop: 20 }}>
          Data updates every 60 seconds · All amounts in SOL
        </p>
      </div>
    </GameLayout>
  );
}
