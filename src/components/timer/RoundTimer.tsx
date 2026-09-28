"use client";

import React, { useState, useEffect } from 'react';
import { Clock, IndianRupee } from 'lucide-react';
import { EventState, EVENT_CONFIG } from '@/lib/types';

interface RoundTimerProps {
  eventState: EventState;
  roundNumber: 1 | 2;
}

export const RoundTimer: React.FC<RoundTimerProps> = ({ eventState, roundNumber }) => {
  const [timeLeftSec, setTimeLeftSec] = useState<number>(1800);
  const [prize, setPrize] = useState<number>(eventState?.starting_prize || EVENT_CONFIG.STARTING_PRIZE);

  useEffect(() => {
    const updateTimer = () => {
      if (!eventState) return;

      const status = roundNumber === 1 ? eventState.round1_status : eventState.round2_status;
      const startTime = roundNumber === 1 ? eventState.round1_start_time : eventState.round2_start_time;
      const endsAt = roundNumber === 1 ? eventState.round1_ends_at : eventState.round2_ends_at;
      const durationMins = roundNumber === 1 ? eventState.round1_duration_mins : eventState.round2_duration_mins;
      const pausedSec = roundNumber === 1 ? (eventState.round1_paused_elapsed_sec || 0) : (eventState.round2_paused_elapsed_sec || 0);
      const totalSec = (durationMins || 30) * 60;
      const basePrize = EVENT_CONFIG.STARTING_PRIZE;

      if (status === 'NOT_STARTED' || status === 'LOCKED') {
        setTimeLeftSec(totalSec);
        setPrize(basePrize);
        return;
      }

      if (status === 'ENDED') {
        setTimeLeftSec(0);
        setPrize(0);
        return;
      }

      if (status === 'PAUSED') {
        const remaining = Math.max(0, totalSec - pausedSec);
        setTimeLeftSec(remaining);
        if (roundNumber === 2) {
          const ratio = remaining / totalSec;
          setPrize(Math.max(0, Math.round(basePrize * ratio)));
        }
        return;
      }

      // ACTIVE status: calculate server-authoritative remaining time
      let remainingSec = totalSec;

      const serverOffsetMs = eventState.server_now
        ? new Date(eventState.server_now).getTime() - Date.now()
        : 0;
      const currentEstimatedServerNowMs = Date.now() + serverOffsetMs;

      if (endsAt) {
        const endsAtMs = new Date(endsAt).getTime();
        remainingSec = Math.max(0, Math.floor((endsAtMs - currentEstimatedServerNowMs) / 1000));
      } else if (startTime) {
        const startTimeMs = new Date(startTime).getTime();
        const elapsedSec = Math.max(0, (currentEstimatedServerNowMs - startTimeMs) / 1000) + pausedSec;
        remainingSec = Math.max(0, Math.floor(totalSec - elapsedSec));
      }

      setTimeLeftSec(remainingSec);

      if (roundNumber === 2) {
        const ratio = totalSec > 0 ? remainingSec / totalSec : 0;
        const currentPrizeCalculated = Math.max(0, Math.round(basePrize * ratio));
        setPrize(currentPrizeCalculated);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [eventState, roundNumber]);

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isDanger = minutes < 5;
  const isWarning = minutes >= 5 && minutes < 10;

  return (
    <div className="flex items-center gap-4 font-mono">
      {/* Time Remaining Badge */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
        isDanger
          ? 'bg-[#2A1719] border-[#EF4444] text-[#EF4444] red-glow animate-pulse'
          : isWarning
          ? 'bg-[#261E14] border-[#E58E26] text-[#E58E26]'
          : 'bg-[#15171C] border-[#282C33] text-[#F2F2F0]'
      }`}>
        <Clock className="w-4 h-4" />
        <div className="flex flex-col">
          <span className="text-[9px] text-[#8B9099] leading-none">TIME REMAINING</span>
          <span className="text-sm font-bold leading-tight">{formattedTime}</span>
        </div>
      </div>

      {/* Round 2 Signature Decaying Prize Pool Badge */}
      {roundNumber === 2 && (
        <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-lg border transition-all ${
          isDanger
            ? 'bg-[#2D1618] border-[#EF4444] text-[#EF4444] red-glow'
            : 'bg-[#1E1B15] border-[#E58E26] text-[#E58E26] amber-glow'
        }`}>
          <div className="p-1 rounded bg-[#0D0F12] border border-current">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#8B9099] leading-none uppercase font-semibold">PRIZE POOL</span>
            <span className="text-lg font-bold leading-tight tracking-wide">
              ₹{(prize ?? EVENT_CONFIG.STARTING_PRIZE).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
