"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EventState, Submission, AuditLog } from '@/lib/types';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Trophy,
  Users,
  Clock,
  IndianRupee,
  Eye,
  FileText,
  AlertTriangle,
  X,
  Tv,
  ListFilter,
  Layers,
  ExternalLink,
  Lock,
  KeyRound,
  CheckSquare,
  Award
} from 'lucide-react';
import { RoundTimer } from '@/components/timer/RoundTimer';

interface LeaderboardItem {
  rank: number;
  team_code: string;
  name: string;
  member1_name: string;
  member2_name: string;
  assigned_case_id: string;
  r1_status: string;
  r1_time: string;
  r2_status: string;
  current_prize: number;
  final_prize: number | null;
  submission_time: string;
  raw_prize: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // State
  const [eventState, setEventState] = useState<EventState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<LeaderboardItem | null>(null);
  const [teamSubmissions, setTeamSubmissions] = useState<Submission[]>([]);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Answer Key & Override States
  const [answerKeyModalOpen, setAnswerKeyModalOpen] = useState(false);
  const [allAnswerKeys, setAllAnswerKeys] = useState<Record<string, any>>({});
  const [activeCaseTab, setActiveCaseTab] = useState<string>('case-r2-hyundai');
  const [overrideScores, setOverrideScores] = useState<Record<string, number>>({});
  const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({});
  const [savingSubId, setSavingSubId] = useState<string | null>(null);

  // Authenticate & SSE Setup
  useEffect(() => {
    const token = sessionStorage.getItem('casefiles_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

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
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // SSE Listener
    const sse = new EventSource('/api/realtime');
    sse.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.state) setEventState(data.state);
        
        // Refresh leaderboard on state change or submission
        const lbRes = await fetch('/api/admin/leaderboard');
        const lbData = await lbRes.json();
        if (lbData.leaderboard) setLeaderboard(lbData.leaderboard);
      } catch (e) {
        console.error('Error handling admin SSE:', e);
      }
    };

    return () => sse.close();
  }, [router]);

  const [masterKeyData, setMasterKeyData] = useState<any>(null);

  // Handle Answer Keys Modal Open
  const handleOpenAnswerKeys = async () => {
    try {
      const res = await fetch('/api/admin/answer-key');
      const data = await res.json();
      if (data.answer_keys) {
        setAllAnswerKeys(data.answer_keys);
        setAnswerKeyModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch answer keys:', err);
    }
  };

  // Handle Save Score Override
  const handleSaveOverride = async (subId: string) => {
    const scoreVal = overrideScores[subId];
    const reasonVal = overrideReasons[subId] || '';
    if (scoreVal === undefined || isNaN(scoreVal)) return;

    setSavingSubId(subId);
    try {
      const res = await fetch('/api/admin/override-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: subId,
          override_score: Number(scoreVal),
          override_reason: reasonVal
        })
      });
      const data = await res.json();
      if (data.success) {
        if (selectedTeam) {
          const subRes = await fetch(`/api/submissions?team_code=${selectedTeam.team_code}`);
          const subData = await subRes.json();
          if (subData.submissions) setTeamSubmissions(subData.submissions);
        }
        const lbRes = await fetch('/api/admin/leaderboard');
        const lbData = await lbRes.json();
        if (lbData.leaderboard) setLeaderboard(lbData.leaderboard);
      }
    } catch (err) {
      console.error('Failed to save score override:', err);
    } finally {
      setSavingSubId(null);
    }
  };

  // Handle Team Detail Inspection
  const handleInspectTeam = async (item: LeaderboardItem) => {
    setSelectedTeam(item);
    setMasterKeyData(null);
    try {
      const [subRes, mkRes] = await Promise.all([
        fetch(`/api/submissions?team_code=${item.team_code}`),
        fetch(`/api/admin/master-key?case_id=${item.assigned_case_id}&round=1`)
      ]);
      const subData = await subRes.json();
      const mkData = await mkRes.json();
      if (subData.submissions) {
        setTeamSubmissions(subData.submissions);
        const initScores: Record<string, number> = {};
        const initReasons: Record<string, string> = {};
        subData.submissions.forEach((s: Submission) => {
          initScores[s.id] = s.override_score !== undefined && s.override_score !== null ? s.override_score : (s.score || 0);
          initReasons[s.id] = s.override_reason || '';
        });
        setOverrideScores(initScores);
        setOverrideReasons(initReasons);
      }
      if (mkData.masterKey) setMasterKeyData(mkData.masterKey);
    } catch (e) {
      console.error('Failed to load team audit data:', e);
    }
  };

  // Event Action Controls
  const handleEventAction = async (action: string) => {
    try {
      const res = await fetch('/api/event/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.state) setEventState(data.state);
      if (action === 'RESET_EVENT') setResetConfirmOpen(false);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  if (loading || !eventState) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-white">
        <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin mb-4" />
        <span className="tracking-widest uppercase">LOADING ADMIN OPERATIONS CENTER...</span>
      </div>
    );
  }

  const activeTeamsCount = leaderboard.filter(l => l.r1_status === 'COMPLETE' || l.r2_status === 'ACTIVE').length;
  const completedTeamsCount = leaderboard.filter(l => l.r2_status === 'LOCKED' && l.final_prize !== null).length;

  // Group teams by assigned case
  const caseAssignments: Record<string, LeaderboardItem[]> = {
    'case-01': [],
    'case-02': [],
    'case-03': [],
    'case-04': [],
    'case-05': []
  };

  leaderboard.forEach(item => {
    const cId = item.assigned_case_id || 'case-01';
    if (!caseAssignments[cId]) caseAssignments[cId] = [];
    caseAssignments[cId].push(item);
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Admin Top Header */}
      <header className="bg-black border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider">
            PORT 3001 // ADMIN CONTROL
          </div>
          <h1 className="font-mono font-extrabold text-base text-white">
            ZODIAC ARCHIVE <span className="text-zinc-500 font-normal">// OPERATIONS CENTER</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <RoundTimer eventState={eventState} roundNumber={eventState.round2_status === 'ACTIVE' || eventState.round2_status === 'ENDED' ? 2 : 1} />
          <button
            onClick={handleOpenAnswerKeys}
            className="px-3.5 py-1.5 bg-emerald-950 border border-emerald-700 text-emerald-300 hover:text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            Answer Keys (Round 2)
          </button>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-1.5"
          >
            <span>Participant Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/admin/live"
            target="_blank"
            className="px-3.5 py-1.5 bg-white text-black font-mono text-xs font-extrabold flex items-center gap-2 hover:bg-zinc-200 transition-all uppercase tracking-wider"
          >
            <Tv className="w-3.5 h-3.5" />
            Live Projector Screen
          </Link>
          <Link
            href="/admin/audit"
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-1.5"
          >
            <ListFilter className="w-3.5 h-3.5" />
            Audit Logs
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* ------------------------------------------------
            EVENT STATUS CARDS
        ------------------------------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Round 1 Card */}
          <div className="p-5 bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">ROUND 01 STATUS</span>
            <div className="text-xl font-bold font-mono text-white mt-1 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                eventState.round1_status === 'ACTIVE' ? 'bg-white animate-pulse' : 'bg-zinc-700'
              }`} />
              {eventState.round1_status}
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-mono">Duration: 30 Mins</p>
          </div>

          {/* Round 2 Card */}
          <div className="p-5 bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">ROUND 02 STATUS</span>
            <div className="text-xl font-bold font-mono text-white mt-1 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                eventState.round2_status === 'ACTIVE' ? 'bg-white animate-pulse' : 'bg-zinc-700'
              }`} />
              {eventState.round2_status}
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-mono font-bold">Prize Pool Decay: ACTIVE</p>
          </div>

          {/* Current Prize Pool Card */}
          <div className="p-5 bg-black border-2 border-zinc-700">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">CURRENT PRIZE POOL</span>
            <div className="text-2xl font-black font-mono text-white mt-1 flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {(eventState?.current_prize ?? 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-zinc-400 mt-2 font-mono">Starts ₹2,000 → ₹0</p>
          </div>

          {/* Active Teams */}
          <div className="p-5 bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">TEAM PARTICIPATION</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {activeTeamsCount} ACTIVE / {completedTeamsCount} FINISHED
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-mono">Total Teams: {leaderboard.length}</p>
          </div>
        </div>

        {/* ------------------------------------------------
            ADMIN CONTROL CENTER BUTTONS
        ------------------------------------------------ */}
        <div className="p-5 bg-zinc-950 border border-zinc-800">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-4">
            GLOBAL EVENT CONTROLS
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Round 1 Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 mr-2">ROUND 01:</span>
              <button
                onClick={() => handleEventAction('START_ROUND_01')}
                disabled={eventState.round1_status === 'ACTIVE'}
                className="px-3.5 py-2 bg-white text-black hover:bg-zinc-200 font-mono font-extrabold text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer uppercase"
              >
                <Play className="w-3.5 h-3.5" /> START R1
              </button>
              <button
                onClick={() => handleEventAction('PAUSE_ROUND_01')}
                disabled={eventState.round1_status !== 'ACTIVE'}
                className="px-3.5 py-2 bg-zinc-800 text-white hover:bg-zinc-700 font-mono font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer uppercase"
              >
                <Pause className="w-3.5 h-3.5" /> PAUSE R1
              </button>
              <button
                onClick={() => handleEventAction('END_ROUND_01')}
                className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <Square className="w-3.5 h-3.5" /> END R1
              </button>
            </div>

            {/* Round 2 Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 mr-2">ROUND 02:</span>
              <button
                onClick={() => handleEventAction('START_ROUND_02')}
                disabled={eventState.round2_status === 'ACTIVE'}
                className="px-3.5 py-2 bg-white text-black hover:bg-zinc-200 font-mono font-extrabold text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer uppercase"
              >
                <Play className="w-3.5 h-3.5" /> START R2 (DECAY)
              </button>
              <button
                onClick={() => handleEventAction('PAUSE_ROUND_02')}
                disabled={eventState.round2_status !== 'ACTIVE'}
                className="px-3.5 py-2 bg-zinc-800 text-white hover:bg-zinc-700 font-mono font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer uppercase"
              >
                <Pause className="w-3.5 h-3.5" /> PAUSE R2
              </button>
              <button
                onClick={() => handleEventAction('END_ROUND_02')}
                className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <Square className="w-3.5 h-3.5" /> END R2
              </button>
            </div>

            {/* Reset Controls */}
            <div>
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="px-4 py-2 bg-zinc-900 border border-red-800 text-red-400 hover:bg-red-950 font-mono font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RESET EVENT
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------
            CASE ASSIGNMENTS MATRIX OVERVIEW (5 CASES)
        ------------------------------------------------ */}
        <div className="p-5 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold font-mono text-white tracking-wider">RANDOM CASE ASSIGNMENTS MATRIX (5 CASES)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono text-xs">
            {Object.entries(caseAssignments).map(([caseId, teams]) => (
              <div key={caseId} className="p-4 bg-black border border-zinc-800">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <span className="font-bold text-white uppercase">{caseId}</span>
                  <span className="text-[10px] text-zinc-500 font-bold">{teams.length} TEAMS</span>
                </div>
                {teams.length === 0 ? (
                  <p className="text-[11px] text-zinc-600 italic">No teams assigned</p>
                ) : (
                  <div className="space-y-1.5">
                    {teams.map(t => (
                      <div key={t.team_code} className="flex justify-between items-center text-[11px] text-zinc-400">
                        <span className="font-bold text-white">{t.team_code}</span>
                        <span className="truncate max-w-[90px]">{t.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------
            LIVE REAL-TIME LEADERBOARD MATRIX
        ------------------------------------------------ */}
        <div className="p-5 bg-zinc-950 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold font-mono text-white">LIVE EVENT LEADERBOARD & TEAMS</h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">AUTO-UPDATES IN REALTIME</span>
          </div>

          <div className="overflow-x-auto border border-zinc-800">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-black border-b border-zinc-800 text-zinc-300">
                  <th className="p-3 w-12 text-center">RANK</th>
                  <th className="p-3">TEAM DETAILS</th>
                  <th className="p-3">MEMBERS (EXACTLY 2)</th>
                  <th className="p-3">CASE ASSIGNED</th>
                  <th className="p-3">ROUND 01</th>
                  <th className="p-3">ROUND 02</th>
                  <th className="p-3">LOCKED PRIZE</th>
                  <th className="p-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-zinc-600 font-mono text-xs">
                      NO TEAMS REGISTERED YET. TEAMS REGISTERED AT PORT 3000 WILL APPEAR HERE INSTANTLY.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((item) => (
                    <tr key={item.team_code} className="border-b border-zinc-800/80 hover:bg-zinc-900 transition-colors">
                      <td className="p-3 text-center font-bold text-white">
                        #{String(item.rank).padStart(2, '0')}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white">{item.team_code}</div>
                        <div className="text-[11px] text-zinc-400">{item.name}</div>
                      </td>
                      <td className="p-3 text-[11px] text-zinc-400">
                        <div>1. {item.member1_name}</div>
                        <div>2. {item.member2_name}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 font-bold bg-black text-white border border-zinc-700">
                          {item.assigned_case_id.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold ${
                          item.r1_status === 'COMPLETE'
                            ? 'bg-zinc-900 text-white border border-zinc-600'
                            : 'bg-black text-zinc-500 border border-zinc-800'
                        }`}>
                          {item.r1_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold ${
                          item.r2_status === 'LOCKED'
                            ? 'bg-white text-black'
                            : 'bg-black text-zinc-500 border border-zinc-800'
                        }`}>
                          {item.r2_status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">
                        {(item.final_prize !== null && item.final_prize !== undefined) ? `₹${Number(item.final_prize).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleInspectTeam(item)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-mono text-[11px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          Submissions
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Team Submission Inspection Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-zinc-950 border-2 border-zinc-700 p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold font-mono text-white">
                    TEAM AUDIT :: {selectedTeam.team_code} ({selectedTeam.name})
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    ASSIGNED: {selectedTeam.assigned_case_id.toUpperCase()} | MEMBERS: {selectedTeam.member1_name} & {selectedTeam.member2_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="p-1.5 border border-zinc-800 hover:border-white bg-black text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-5 font-mono text-xs">
                {/* ADMIN DIAGNOSTIC QUESTION BINDING VIEW */}
                <div className="p-3 bg-amber-950/40 border border-amber-800 font-mono text-xs space-y-1">
                  <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px] pb-1 border-b border-amber-900/60 flex items-center justify-between">
                    <span>SYSTEM DIAGNOSTICS :: QUESTION BINDING</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 border border-amber-700">CONFIDENTIAL ADMIN</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div><span className="text-zinc-400">Team:</span> <strong className="text-white">{selectedTeam.team_code}</strong></div>
                    <div><span className="text-zinc-400">Assigned Case:</span> <strong className="text-white">{selectedTeam.assigned_case_id.toUpperCase()}</strong></div>
                    <div><span className="text-zinc-400">Active Round:</span> <strong className="text-amber-300">Round {eventState.round2_status === 'ACTIVE' || eventState.round2_status === 'ENDED' ? '2' : '1'}</strong></div>
                    <div><span className="text-zinc-400">Question Set:</span> <strong className="text-emerald-400">{(selectedTeam.assigned_case_id || 'case-01')}-round{eventState.round2_status === 'ACTIVE' || eventState.round2_status === 'ENDED' ? '2' : '1'}</strong></div>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Question Count: <strong className="text-white">12 Questions</strong> | Verification: <span className="text-emerald-400 font-bold">CASE-ISOLATED & BOUND</span>
                  </div>
                </div>

                {/* Master Key Solution Summary */}
                {masterKeyData && masterKeyData.questions && (
                  <div className="p-4 bg-zinc-900 border border-zinc-700">
                    <div className="flex justify-between items-center pb-2 mb-3 border-b border-zinc-700">
                      <span className="font-bold text-white uppercase tracking-wider text-xs">
                        OFFICIAL MASTER KEY SOLUTION :: {masterKeyData.case_title}
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-black px-2 py-0.5 border border-zinc-700 font-bold">
                        {masterKeyData.questions.length} QUESTIONS KEY
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {masterKeyData.questions.map((q: any) => (
                        <div key={q.qid} className="p-2 bg-black border border-zinc-800 text-[11px]">
                          <div className="text-zinc-400 font-bold">{q.question}</div>
                          <div className="text-white font-extrabold mt-0.5">EXPECTED: <span className="text-emerald-400">{q.answer}</span></div>
                          {q.evidence_path && (
                            <div className="text-zinc-500 text-[10px] mt-0.5">TRAIL: {q.evidence_path}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Submissions */}
                <div className="space-y-4">
                  <div className="font-bold text-zinc-300 text-xs uppercase tracking-wider">LOGGED TEAM SUBMISSIONS</div>
                  {teamSubmissions.length === 0 ? (
                    <p className="text-center text-zinc-500 py-6 border border-zinc-800 bg-black">No submissions logged for this team yet.</p>
                  ) : (
                    teamSubmissions.map((sub) => (
                      <div key={sub.id} className="p-4 bg-black border border-zinc-800 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                          <div>
                            <span className="font-bold text-white text-sm">ROUND 0{sub.round_number} SUBMISSION</span>
                            <span className="ml-2 text-[10px] text-zinc-500">{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
                              Score: {sub.score !== undefined ? `${sub.score}%` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Breakdown if Round 2 */}
                        {sub.breakdown && sub.breakdown.length > 0 && (
                          <div className="space-y-2 mt-2">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">AUTOMATIC GRADING BREAKDOWN:</span>
                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 border border-zinc-900 p-2 bg-zinc-950">
                              {sub.breakdown.map((item: any) => (
                                <div key={item.questionId} className="p-2 bg-black border border-zinc-800 text-[11px] flex items-start justify-between gap-2">
                                  <div className="space-y-0.5 flex-1">
                                    <div className="text-zinc-400 font-bold">{item.questionId}: {item.questionText}</div>
                                    <div className="text-zinc-300">Submitted: <span className="font-mono text-white font-bold">{Array.isArray(item.submittedAnswer) ? item.submittedAnswer.join(', ') : (item.submittedAnswer || '—')}</span></div>
                                    <div className="text-emerald-400 text-[10px]">Expected: {item.expectedAnswer}</div>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                    <span className={`px-1.5 py-0.5 text-[9px] font-bold ${item.isCorrect ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                                      {item.isCorrect ? 'MATCH' : 'MISMATCH'}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-bold mt-1">{item.marksAwarded}/{item.maxMarks} pts</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Answers JSON Fallback if no breakdown */}
                        {(!sub.breakdown || sub.breakdown.length === 0) && (
                          <pre className="whitespace-pre-wrap text-zinc-300 text-xs font-mono p-2 bg-zinc-950 border border-zinc-900">
                            {JSON.stringify(sub.answers, null, 2)}
                          </pre>
                        )}

                        {/* Manual Score Override Panel */}
                        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5" /> ADMIN SCORE OVERRIDE
                            </span>
                            <div className="text-[11px] text-zinc-400">
                              Automatic Score: <span className="font-bold text-white">{sub.original_score !== undefined ? `${sub.original_score}%` : (sub.score !== undefined ? `${sub.score}%` : 'N/A')}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-zinc-400 block mb-1">FINAL SCORE (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={overrideScores[sub.id] !== undefined ? overrideScores[sub.id] : (sub.score || 0)}
                                onChange={(e) => setOverrideScores({ ...overrideScores, [sub.id]: Number(e.target.value) })}
                                className="w-full bg-black border border-zinc-700 px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-400 block mb-1">OVERRIDE REASON</label>
                              <input
                                type="text"
                                placeholder="Reason for score adjustment..."
                                value={overrideReasons[sub.id] || ''}
                                onChange={(e) => setOverrideReasons({ ...overrideReasons, [sub.id]: e.target.value })}
                                className="w-full bg-black border border-zinc-700 px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => handleSaveOverride(sub.id)}
                                disabled={savingSubId === sub.id}
                                className="w-full py-1 px-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold font-mono text-xs transition-colors disabled:opacity-50 cursor-pointer uppercase"
                              >
                                {savingSubId === sub.id ? 'SAVING...' : 'SAVE OVERRIDE'}
                              </button>
                            </div>
                          </div>

                          {sub.override_reason && (
                            <p className="text-[10px] text-zinc-400 italic">
                              Current Override Reason: "{sub.override_reason}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Round 2 Official Answer Key Viewer Modal */}
      <AnimatePresence>
        {answerKeyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-zinc-950 border-2 border-emerald-700 p-6 shadow-2xl relative max-h-[90vh] flex flex-col font-mono text-xs"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                    <KeyRound className="w-5 h-5" /> OFFICIAL ROUND 2 ANSWER KEYS (CONFIDENTIAL)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Strictly confidential. Never expose to participant browsers or frontend APIs.
                  </p>
                </div>
                <button
                  onClick={() => setAnswerKeyModalOpen(false)}
                  className="p-1.5 border border-zinc-800 hover:border-white bg-black text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Case Tabs */}
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2 overflow-x-auto">
                {Object.keys(allAnswerKeys).map((cKey) => (
                  <button
                    key={cKey}
                    onClick={() => setActiveCaseTab(cKey)}
                    className={`px-3 py-1.5 font-bold uppercase transition-colors whitespace-nowrap ${
                      activeCaseTab === cKey
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {allAnswerKeys[cKey].case_title}
                  </button>
                ))}
              </div>

              {/* Active Case Questions List */}
              {allAnswerKeys[activeCaseTab] && (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  <div className="text-xs font-bold text-zinc-300 mb-2">
                    CASE: {allAnswerKeys[activeCaseTab].case_title} ({allAnswerKeys[activeCaseTab].questions.length} QUESTIONS)
                  </div>
                  {allAnswerKeys[activeCaseTab].questions.map((q: any) => {
                    const qText = q.question || q.text || '';
                    const qExpected = q.expected_answer !== undefined ? q.expected_answer : q.expectedAnswer;
                    const qAliases = q.accepted_aliases || q.acceptedAliases;
                    const qUnit = q.unit || q.format_hint;
                    const qMaxSelect = q.max_choices || q.maxSelect;

                    return (
                      <div key={q.id} className="p-3 bg-black border border-zinc-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{q.id}. {qText}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] font-bold">
                              TYPE: {q.type}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                              {q.marks || 1} MARKS
                            </span>
                          </div>
                        </div>
                        <div className="text-emerald-400 font-bold text-xs mt-1">
                          EXPECTED:{' '}
                          <span className="underline">
                            {Array.isArray(qExpected) ? qExpected.join(', ') : (qExpected || 'N/A')}
                          </span>{' '}
                          {qUnit ? `(${qUnit})` : ''}
                        </div>
                        {qAliases && qAliases.length > 0 && (
                          <div className="text-zinc-400 text-[11px]">
                            ACCEPTED ALIASES: {Array.isArray(qAliases) ? qAliases.join(' | ') : qAliases}
                          </div>
                        )}
                        {q.options && (
                          <div className="text-zinc-500 text-[10px] mt-1">
                            OPTIONS {qMaxSelect ? `(Select ${qMaxSelect})` : ''}: {q.options.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border-2 border-red-800 p-6 shadow-2xl relative font-mono text-xs"
            >
              <h3 className="text-base font-bold text-red-500 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> CONFIRM EVENT RESET
              </h3>
              <p className="text-zinc-300 leading-relaxed mb-6">
                Are you sure you want to reset the competition event? This will reset the timer state, round statuses, and prize pool decay.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setResetConfirmOpen(false)}
                  className="px-4 py-2 bg-black border border-zinc-700 text-zinc-300 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleEventAction('RESET_EVENT')}
                  className="px-4 py-2 bg-red-900 border border-red-500 text-white font-bold hover:bg-red-800"
                >
                  RESET NOW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

