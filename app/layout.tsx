import type { Metadata } from "next";
import { Orbitron, Exo_2 } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tangy | Solana Casino",
  description: "Tangy.fun — the freshest Solana casino. Flip, bet, win instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${orbitron.variable} ${exo2.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
