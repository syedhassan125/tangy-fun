"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  connected: boolean;
  balance: number;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
  updateBalance: (newBalance: number) => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  balance: 0,
  address: null,
  connect: () => {},
  disconnect: () => {},
  updateBalance: () => {},
});

// Simulated wallet for MVP demo — no real Solana transactions
export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(10); // Start with 10 demo SOL
  const [address] = useState("DegenXf9mK2vBpQR3nYsT7wLhCjUoAPz8Wq4Nv1");

  const connect = () => setConnected(true);
  const disconnect = () => setConnected(false);
  const updateBalance = (newBalance: number) => setBalance(Math.max(0, newBalance));

  return (
    <WalletContext.Provider value={{ connected, balance, address, connect, disconnect, updateBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
