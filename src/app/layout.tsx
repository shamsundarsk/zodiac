import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Gloria_Hallelujah } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const gloriaHallelujah = Gloria_Hallelujah({
  weight: ["400"],
  variable: "--font-zodiac",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "THE ZODIAC FILES // Cryptic Crime & Business Evidence Archive",
  description: "Investigate raw evidence, decode cryptic ciphers, and uncover the hidden enterprise. A 60-minute Zodiac forensic competition.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${gloriaHallelujah.variable} dark h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#000000] text-[#FFFFFF] font-sans selection:bg-[#FFFFFF]/30 selection:text-[#FFFFFF] flex flex-col overflow-x-hidden">
        {/* Zodiac Noir grain & subtle grid overlay */}
        <div className="fixed inset-0 bg-dossier-grid opacity-[0.04] pointer-events-none z-0" />
        <div className="fixed inset-0 bg-gradient-to-b from-[#000000]/90 via-transparent to-[#000000] pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
