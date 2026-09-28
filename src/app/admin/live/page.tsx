"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EventState } from '@/lib/types';
import { Trophy, Clock, IndianRupee, Users, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SandClockTimer } from '@/components/timer/SandClockTimer';

interface LiveLeaderboardItem {
  rank: number;
  team_code: string;
  name: string;
  r1_status: string;
  r2_status: string;
  current_prize: number;
  final_prize: number | null;
  submission_time: string;
}

export default function ProjectionLiveScreenPage() {
  const [eventState, setEventState] = useState<EventState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LiveLeaderboardItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, lbRes] = await Promise.all([
          fetch('/api/event/status'),
          fetch('/api/admin/leaderboard')
        ]);
        const statusData = await statusRes.json();
        const lbData = await lbRes.json();

        if (statusData.state) setEventState(statusData.state);
        if (lbData.leaderboard) setLeaderboard(lbData.leaderboard);
      } catch (err) {
        console.error('Failed to load live data:', err);
      }
    };

    fetchData();

    // SSE Realtime Sync
    const sse = new EventSource('/api/realtime');
    sse.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.state) setEventState(data.state);
        const lbRes = await fetch('/api/admin/leaderboard');
        const lbData = await lbRes.json();
        if (lbData.leaderboard) setLeaderboard(lbData.leaderboard);
      } catch (e) {
        console.error(e);
      }
    };

    return () => sse.close();
  }, []);

  const activeRound = eventState?.round2_status === 'ACTIVE' || eventState?.round2_status === 'ENDED' ? 2 : 1;

  // Timer math
  const status = activeRound === 1 ? eventState?.round1_status : eventState?.round2_status;
  const startTime = activeRound === 1 ? eventState?.round1_start_time : eventState?.round2_start_time;
  const endsAt = activeRound === 1 ? eventState?.round1_ends_at : eventState?.round2_ends_at;
  const durationMins = activeRound === 1 ? eventState?.round1_duration_mins : eventState?.round2_duration_mins;
  const totalSec = (durationMins || 30) * 60;
  
  let remainingSec = totalSec;
  if (status === 'ENDED') {
    remainingSec = 0;
  } else if (status === 'ACTIVE') {
    const serverOffsetMs = eventState?.server_now
      ? new Date(eventState.server_now).getTime() - Date.now()
      : 0;
    const currentEstimatedServerNowMs = Date.now() + serverOffsetMs;

    if (endsAt) {
      const endsAtMs = new Date(endsAt).getTime();
      remainingSec = Math.max(0, Math.floor((endsAtMs - currentEstimatedServerNowMs) / 1000));
    } else if (startTime) {
      const startTimeMs = new Date(startTime).getTime();
      const elapsedSec = Math.max(0, (currentEstimatedServerNowMs - startTimeMs) / 1000);
      remainingSec = Math.max(0, Math.floor(totalSec - elapsedSec));
    }
  }

  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentPrize = eventState?.current_prize || 2000;
  const activeTeamsCount = leaderboard.filter(l => l.r1_status === 'COMPLETE' || l.r2_status === 'ACTIVE').length;
  const completedTeamsCount = leaderboard.filter(l => l.r2_status === 'LOCKED' && l.final_prize !== null).length;

  return (
    <div className="min-h-screen bg-black text-white p-6 sm:p-8 flex flex-col justify-between font-mono selection:bg-white selection:text-black overflow-hidden">
      {/* Top Projection Header */}
      <header className="flex items-center justify-between pb-6 border-b-2 border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-black font-mono font-black flex items-center justify-center text-2xl shadow-xl">
            Z
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase font-mono">ZODIAC CASE FILES</h1>
            <p className="text-xs sm:text-sm text-zinc-400 tracking-wider font-mono">LIVE EVENT PROJECTION DISPLAY // PORT 3001</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-white font-bold text-sm sm:text-base font-mono">
            ROUND 0{activeRound}
          </span>
          <span className="flex items-center gap-2 px-4 py-2 bg-black border border-zinc-700 text-white font-bold text-xs sm:text-sm font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            BROADCAST ONLINE
          </span>
        </div>
      </header>

      {/* Hero Projection Dashboard: Sand Clock Timer & Metrics */}
      <div className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Animated Hourglass / Sandbox Timer (6 cols) */}
        <div className="lg:col-span-6">
          <SandClockTimer
            remainingSec={remainingSec}
            totalSec={totalSec}
            formattedTime={formattedTime}
            roundNumber={activeRound}
          />
        </div>

        {/* Live Metrics Grid (6 cols) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Prize Pool */}
          <div className="p-5 bg-black border-2 border-zinc-700 flex flex-col items-center justify-center text-center shadow-2xl">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1 font-bold flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-white" /> PRIZE POOL
            </span>
            <span className="text-3xl sm:text-4xl font-black tracking-tighter text-white font-mono mt-1">
              ₹{(currentPrize ?? 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Active Teams */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center shadow-2xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-zinc-300" /> ACTIVE
            </span>
            <span className="text-3xl sm:text-4xl font-black tracking-tighter text-white font-mono mt-1">
              {activeTeamsCount}
            </span>
          </div>

          {/* Completed Teams */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center shadow-2xl">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" /> LOCKED
            </span>
            <span className="text-3xl sm:text-4xl font-black tracking-tighter text-white font-mono mt-1">
              {completedTeamsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Projection Leaderboard Table */}
      <main className="flex-1 bg-zinc-950 border border-zinc-800 p-6 shadow-2xl flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <h2 className="text-base sm:text-lg font-bold tracking-wider text-white uppercase font-mono">
            LIVE COMPETITION STANDINGS
          </h2>
          <span className="text-xs text-zinc-400 font-mono">REAL-TIME PRIZE VALUATION RANKINGS</span>
        </div>

        <div className="overflow-hidden border border-zinc-800">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-black border-b border-zinc-800 text-zinc-300 text-xs sm:text-sm">
                <th className="p-3.5 w-16 text-center">RANK</th>
                <th className="p-3.5">TEAM CODE</th>
                <th className="p-3.5">TEAM NAME</th>
                <th className="p-3.5">ROUND 01</th>
                <th className="p-3.5">ROUND 02</th>
                <th className="p-3.5 text-right">LOCKED PRIZE AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-600 font-mono text-xs sm:text-sm">
                    NO TEAMS LOGGED IN YET. LIVE STANDINGS WILL ANIMATE AUTOMATICALLY.
                  </td>
                </tr>
              ) : (
                leaderboard.slice(0, 8).map((item) => (
                  <tr key={item.team_code} className="border-b border-zinc-800/80 hover:bg-zinc-900 text-sm sm:text-base transition-colors">
                    <td className="p-3.5 text-center font-black text-white text-base sm:text-lg">
                      #{String(item.rank).padStart(2, '0')}
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {item.team_code}
                    </td>
                    <td className="p-3.5 text-zinc-400">
                      {item.name}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 font-bold text-xs ${
                        item.r1_status === 'COMPLETE' ? 'bg-zinc-900 text-white border border-zinc-700' : 'bg-black text-zinc-600 border border-zinc-800'
                      }`}>
                        {item.r1_status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 font-bold text-xs ${
                        item.r2_status === 'LOCKED' ? 'bg-white text-black' : 'bg-black text-zinc-600 border border-zinc-800'
                      }`}>
                        {item.r2_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-lg sm:text-xl text-white">
                      {(item.final_prize !== null && item.final_prize !== undefined) ? `₹${Number(item.final_prize).toLocaleString('en-IN')}` : '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>ZODIAC CASE FILES — OFFICIAL HALL PROJECTION DISPLAY</span>
        <span>HOURGLASS TIMER: REALTIME SYNCHRONIZED</span>
      </footer>
    </div>
  );
}
