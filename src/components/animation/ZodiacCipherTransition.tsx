"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Authentic Zodiac Killer 340/408 Cipher Symbols & Rotated Runes
const ZODIAC_SYMBOLS = [
  '⌖', '⊕', '⊗', '∆', '∇', '◬', '⍙', '⍚', '⍟', '⏣',
  '⏚', '⎔', '⍝', '⎈', 'Ǝ', 'Ⅎ', '⅁', 'ꓵ', 'Ↄ', 'ꓭ',
  'ꓘ', '⨁', '⨂', '⊥', '⊞', '⊟', '⌗', '⏍', '⎅', '⎌'
];

interface ZodiacCipherTransitionProps {
  children: React.ReactNode;
}

export const ZodiacCipherTransition: React.FC<ZodiacCipherTransitionProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [symbolsGrid, setSymbolsGrid] = useState<string[]>([]);

  useEffect(() => {
    // Generate initial grid of random Zodiac symbols
    const generateGrid = () => {
      const grid = Array.from({ length: 40 }, () =>
        ZODIAC_SYMBOLS[Math.floor(Math.random() * ZODIAC_SYMBOLS.length)]
      );
      setSymbolsGrid(grid);
    };

    generateGrid();

    // Rapid symbol scramble interval
    const interval = setInterval(() => {
      setSymbolsGrid(prev =>
        prev.map(() => ZODIAC_SYMBOLS[Math.floor(Math.random() * ZODIAC_SYMBOLS.length)])
      );
    }, 80);

    // End transition after 800ms
    const timer = setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
    }, 800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="max-w-md w-full text-center">
              {/* Top Secret Badge */}
              <div className="text-[10px] font-mono tracking-widest text-[#8C8275] uppercase mb-4">
                [ SFPD DECRYPTION PROTOCOL // DECODING ZODIAC CIPHER ]
              </div>

              {/* Scrambling Zodiac Symbols Grid */}
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-3 p-6 bg-black border-2 border-[#26231F] rounded-none shadow-2xl mb-6">
                {symbolsGrid.map((sym, idx) => (
                  <motion.span
                    key={idx}
                    animate={{ opacity: [0.3, 1, 0.5] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatType: 'reverse' }}
                    className="font-mono text-xl sm:text-2xl text-[#D4C5A9] font-bold flex items-center justify-center h-8"
                  >
                    {sym}
                  </motion.span>
                ))}
              </div>

              {/* Decoder Status Text */}
              <div className="font-zodiac text-red-700 text-sm font-bold tracking-wide">
                "This is the Zodiac speaking..."
              </div>
              <div className="mt-2 font-mono text-xs text-[#8C8275] flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>RESOLVING CIPHERTEXT TO PLAINTEXT...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
