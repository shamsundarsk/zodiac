"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SandClockTimerProps {
  remainingSec: number;
  totalSec: number;
  formattedTime: string;
  roundNumber: number;
}

export const SandClockTimer: React.FC<SandClockTimerProps> = ({
  remainingSec,
  totalSec,
  formattedTime,
  roundNumber
}) => {
  // Elapsed percent (0% at start -> 100% when timer finishes)
  const elapsedPercent = Math.max(0, Math.min(100, ((totalSec - remainingSec) / totalSec) * 100));
  const remainingPercent = 100 - elapsedPercent;
  const isRunning = remainingSec > 0 && remainingSec < totalSec;

  return (
    <div className="relative p-6 sm:p-8 bg-[#090807] border-2 border-zinc-800 rounded-none shadow-2xl select-none overflow-hidden flex flex-col items-center justify-center text-center">
      {/* BACKGROUND DYNAMIC RED FILL CONTAINER */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end opacity-20">
        <div
          className="w-full bg-gradient-to-t from-red-600 via-red-700 to-red-900 transition-all duration-1000 ease-linear relative"
          style={{ height: `${elapsedPercent}%` }}
        >
          {/* Animated Wave Glow Edge at top of red liquid fill */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500 shadow-[0_0_15px_#EF4444] animate-pulse" />
        </div>
      </div>

      {/* HEADER BADGE */}
      <div className="relative z-10 flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
        <span className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">
          ROUND 0{roundNumber} // RED COLOR CLOCK FILL
        </span>
      </div>

      {/* GIANT DYNAMIC RED FILL CLOCK DIGITS (Text fills up with red color as time passes) */}
      <div className="relative z-10 my-2">
        <h1
          className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tighter leading-none transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(to top, #EF4444 0%, #EF4444 ${elapsedPercent}%, #FFFFFF ${elapsedPercent}%, #FFFFFF 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: elapsedPercent > 50 ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.4))' : 'none'
          }}
        >
          {formattedTime}
        </h1>
      </div>

      {/* PROGRESS BAR & STATS */}
      <div className="relative z-10 max-w-md w-full mt-4 space-y-2 font-mono">
        {/* Red Fill Progress Bar Line */}
        <div className="w-full h-3 bg-zinc-900 border border-zinc-700 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-500 transition-all duration-1000 ease-linear relative"
            style={{ width: `${elapsedPercent}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-2 bg-white animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
          <span className="text-red-500">{elapsedPercent.toFixed(0)}% RED FILLED</span>
          <span className="text-zinc-400">·</span>
          <span className="text-white">{remainingPercent.toFixed(0)}% TIME LEFT</span>
          <span className="text-zinc-400">·</span>
          <span className={isRunning ? 'text-red-400 font-bold' : 'text-zinc-500'}>
            {isRunning ? 'TIME FILL ACTIVE' : 'PAUSED'}
          </span>
        </div>
      </div>
    </div>
  );
};
