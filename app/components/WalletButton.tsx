"use client";
import { useState, useEffect } from "react";
import { useWallet } from "./WalletContext";

export default function WalletButton() {
  const { connected, balance, address, connect, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-gray-400">{address?.slice(0,4)}...{address?.slice(-4)}</span>
          <span className="text-xs neon-green font-bold">{balance.toFixed(2)} SOL</span>
        </div>
        <button
          onClick={disconnect}
          className="btn-neon-pink text-xs px-3 py-1.5 rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="btn-neon-green text-xs px-4 py-2 rounded"
    >
      Connect Wallet
    </button>
  );
}
