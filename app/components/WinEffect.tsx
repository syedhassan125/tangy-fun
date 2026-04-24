"use client";
import { useEffect, useState } from "react";

interface Particle {
  id: number; x: number; color: string;
  size: number; delay: number; duration: number;
}

const COLORS = ["#f59e0b","#10b981","#a78bfa","#ec4899","#06b6d4","#fbbf24","#34d399"];

interface WinEffectProps {
  trigger: boolean;
  amount?: number;
  accent?: string;
}

export default function WinEffect({ trigger, amount, accent = "#10b981" }: WinEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [flash, setFlash] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    setKey(k => k + 1);
    setFlash(true);
    setShowAmount(true);
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        delay: Math.random() * 0.4,
        duration: 0.8 + Math.random() * 0.6,
      }))
    );
    const t1 = setTimeout(() => setFlash(false), 1200);
    const t2 = setTimeout(() => setShowAmount(false), 1000);
    const t3 = setTimeout(() => setParticles([]), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [trigger, key]);

  if (!flash && particles.length === 0) return null;

  return (
    <>
      {flash && <div className="win-flash-overlay" key={`flash-${key}`} />}

      {/* Confetti */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9001, overflow: "hidden" }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "40%",
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            boxShadow: `0 0 6px ${p.color}`,
          }} />
        ))}
      </div>

      {/* Win amount flyup */}
      {showAmount && amount !== undefined && (
        <div key={`amt-${key}`} style={{
          position: "fixed", top: "45%", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9002, pointerEvents: "none",
          fontFamily: "var(--font-orbitron)", fontWeight: 900,
          fontSize: 32, color: accent,
          textShadow: `0 0 30px ${accent}, 0 0 60px ${accent}60`,
          letterSpacing: 2,
        }} className="amount-flyup">
          +{amount.toFixed(3)} ◎
        </div>
      )}
    </>
  );
}
