"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EventState, CaseFolder, EvidenceFile, Team } from '@/lib/types';
import { WeirdFolderCard } from '@/components/folders/WeirdFolderCard';
import { FileRow } from '@/components/files/FileRow';
import { FileViewerModal } from '@/components/files/FileViewerModal';
import { RoundTimer } from '@/components/timer/RoundTimer';
import { Terminal, LogOut, Send, CheckCircle2, AlertTriangle, FileSearch, Lock, Users, HelpCircle, X, KeyRound, Edit3, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZodiacCipherTransition } from '@/components/animation/ZodiacCipherTransition';
import { QuestionItem } from '@/lib/questions-data';

export default function ParticipantDashboard() {
  const router = useRouter();

  // State
  const [team, setTeam] = useState<Team | null>(null);
  const [eventState, setEventState] = useState<EventState | null>(null);
  const [caseInfo, setCaseInfo] = useState<{ id?: string; title?: string; description?: string; hint_text?: string } | null>(null);
  const [folders, setFolders] = useState<CaseFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<CaseFolder | null>(null);
  const [inspectingFile, setInspectingFile] = useState<EvidenceFile | null>(null);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic Question State (Loaded from server /api/questions for assigned case)
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Active question index for Round 2 compact navigation [1]..[12]
  const [activeQIndex, setActiveQIndex] = useState<number>(0);

  // Scratchpad state for participant working notes
  const [scratchpadNotes, setScratchpadNotes] = useState<string>('');

  // Round 1 Submission State (12 Questions)
  const [r1Answers, setR1Answers] = useState<Record<string, string>>({});
  const [r1Submitting, setR1Submitting] = useState(false);
  const [r1Message, setR1Message] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Round 2 Submission State (12 Questions)
  const [r2Answers, setR2Answers] = useState<Record<string, any>>({});
  const [r2Submitting, setR2Submitting] = useState(false);
  const [r2Locked, setR2Locked] = useState(false);
  const [r2Message, setR2Message] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleR1AnswerChange = (key: string, val: string) => {
    setR1Answers(prev => ({ ...prev, [key]: val }));
  };

  const handleR2AnswerChange = (key: string, val: any) => {
    setR2Answers(prev => {
      const updated = { ...prev, [key]: val };
      if (team) {
        sessionStorage.setItem(`r2_draft_${team.team_code}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleR2MultiSelectToggle = (qid: string, option: string, maxSelect = 3) => {
    setR2Answers((prev) => {
      const current = prev[qid];
      let selectedList: string[] = [];
      if (Array.isArray(current)) {
        selectedList = [...current];
      } else if (typeof current === 'string' && current.length > 0) {
        try {
          selectedList = JSON.parse(current);
        } catch {
          selectedList = current.split(',').map((s: string) => s.trim());
        }
      }

      if (selectedList.includes(option)) {
        selectedList = selectedList.filter(o => o !== option);
      } else {
        if (selectedList.length < maxSelect) {
          selectedList.push(option);
        }
      }

      const updated = { ...prev, [qid]: selectedList };
      if (team) {
        sessionStorage.setItem(`r2_draft_${team.team_code}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const getAuthHeaders = (extraHeaders?: Record<string, string>) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('zodiac_token') : null;
    const headers: Record<string, string> = { 'Cache-Control': 'no-store', ...(extraHeaders || {}) };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Initialize team & Realtime SSE Stream
  useEffect(() => {
    const cachedTeam = sessionStorage.getItem('casefiles_team');
    if (!cachedTeam) {
      router.push('/login');
      return;
    }

    const teamObj: Team = JSON.parse(cachedTeam);
    setTeam(teamObj);

    // Load saved scratchpad & Round 2 draft from session if any
    const savedNotes = sessionStorage.getItem(`scratchpad_${teamObj.team_code}`);
    if (savedNotes) setScratchpadNotes(savedNotes);

    const savedR2Draft = sessionStorage.getItem(`r2_draft_${teamObj.team_code}`);
    if (savedR2Draft) {
      try {
        setR2Answers(JSON.parse(savedR2Draft));
      } catch (e) {}
    }

    // Fetch initial state & folders for assigned case
    const initData = async () => {
      try {
        const stateRes = await fetch('/api/event/status', { headers: getAuthHeaders() });
        const stateData = await stateRes.json();
        if (stateData.state) setEventState(stateData.state);

        const currentRound = stateData.state?.round2_status === 'ACTIVE' ? 2 : 1;
        const foldersRes = await fetch(`/api/cases?round=${currentRound}&team_code=${teamObj.team_code}`, { headers: getAuthHeaders() });
        const foldersData = await foldersRes.json();
        if (foldersData.folders) {
          setFolders(foldersData.folders);
          if (foldersData.folders.length > 0) {
            setSelectedFolder(foldersData.folders[0]);
          }
        }
        if (foldersData.case) {
          setCaseInfo(foldersData.case);
        }
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // Setup SSE Realtime event broadcast listener
    const sse = new EventSource('/api/realtime');
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.state) {
          setEventState(data.state);
        }
      } catch (err) {
        console.error('SSE message parse error:', err);
      }
    };

    // Keyboard ESC key listener for modals
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHintModalOpen(false);
        setInspectingFile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      sse.close();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  // Handle active round changes dynamically
  const activeRound = eventState?.round2_status === 'ACTIVE' || eventState?.round2_status === 'ENDED' ? 2 : 1;
  const round1Status = eventState?.round1_status;
  const round2Status = eventState?.round2_status;

  useEffect(() => {
    if (!team) return;
    const fetchRoundData = async () => {
      setQuestionsLoading(true);
      setQuestionsError(null);
      setQuestions([]);
      try {
        const [foldersRes, questionsRes] = await Promise.all([
          fetch(`/api/cases?round=${activeRound}&team_code=${team.team_code}`, { headers: getAuthHeaders() }),
          fetch(`/api/questions?round=${activeRound}`, { headers: getAuthHeaders() })
        ]);

        const foldersData = await foldersRes.json();
        if (foldersData.folders) {
          setFolders(foldersData.folders);
          if (foldersData.folders.length > 0) {
            setSelectedFolder(foldersData.folders[0]);
          }
        }
        if (foldersData.case) {
          setCaseInfo(foldersData.case);
        }

        const qData = await questionsRes.json();
        console.log('[ZODIAC UI QUESTIONS]', {
          activeRound,
          teamCode: team.team_code,
          qSuccess: qData.success,
          canonicalCase: qData.canonical_case,
          assignedCase: qData.case_id,
          count: qData.questions?.length,
          firstQ: qData.questions?.[0]?.question || qData.questions?.[0]?.text
        });

        if (qData.success && qData.questions && qData.questions.length === 12) {
          setQuestions(qData.questions);
        } else {
          setQuestions([]);
          setQuestionsError(qData.message || 'Questions unavailable for assigned case');
        }
      } catch (err) {
        setQuestions([]);
        setQuestionsError('Questions unavailable for assigned case');
      } finally {
        setQuestionsLoading(false);
      }
    };
    fetchRoundData();
  }, [activeRound, team, round1Status, round2Status]);


  // Handle Scratchpad Note Saving
  const handleScratchpadChange = (val: string) => {
    setScratchpadNotes(val);
    if (team) {
      sessionStorage.setItem(`scratchpad_${team.team_code}`, val);
    }
  };

  // Handlers
  const handleRound1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    setR1Submitting(true);
    setR1Message(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          team_code: team.team_code,
          round_number: 1,
          answers: r1Answers
        })
      });

      const data = await res.json();
      setR1Submitting(false);

      if (data.is_correct) {
        setR1Message({ type: 'success', text: data.message });
      } else {
        setR1Message({ type: 'error', text: data.message });
      }
    } catch (err) {
      setR1Submitting(false);
      setR1Message({ type: 'error', text: 'Submission error. Please retry.' });
    }
  };

  const handleRound2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    setR2Submitting(true);
    setR2Message(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          team_code: team.team_code,
          round_number: 2,
          answers: r2Answers
        })
      });

      const data = await res.json();
      setR2Submitting(false);

      if (data.success) {
        setR2Locked(true);
        setR2Message({
          type: 'success',
          text: `FINAL ANSWER LOCKED! Recorded locked prize of ₹${(data.locked_prize || 0).toLocaleString('en-IN')}`
        });
      } else {
        setR2Message({ type: 'error', text: data.message });
      }
    } catch (err) {
      setR2Submitting(false);
      setR2Message({ type: 'error', text: 'Submission failed.' });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('casefiles_team');
    sessionStorage.removeItem('zodiac_token');
    router.push('/login');
  };

  if (loading || !eventState || !team) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-white">
        <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin mb-4" />
        <span className="tracking-widest uppercase">LOADING ZODIAC EVIDENCE ARCHIVE...</span>
      </div>
    );
  }

  const assignedCaseId = (caseInfo?.id || activeRound === 1
    ? (team.assigned_case_id_r1 || 'case-01')
    : (team.assigned_case_id_r2 || 'case-r2-01')).toUpperCase();

  return (
    <ZodiacCipherTransition>
      <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* ------------------------------------------------
          TOP HEADER & DOSSIER BAR
      ------------------------------------------------ */}
      <header className="bg-black border-b border-zinc-800 px-6 py-3.5 flex flex-col md:flex-row items-center justify-between sticky top-0 z-30 gap-4">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white text-black border border-white flex items-center justify-center font-mono font-black text-sm">
              Z
            </div>
            <span className="font-mono font-extrabold tracking-widest text-sm text-white">
              ZODIAC CASE FILES
            </span>
          </div>

          <div className="hidden md:block h-4 w-[1px] bg-zinc-800" />

          {/* Dossier Badges */}
          <div className="flex items-center gap-3 font-mono text-xs flex-wrap">
            <div className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300">
              ASSIGNED CASE: <strong className="text-white underline">{assignedCaseId}</strong>
            </div>

            <div className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300">
              TEAM: <strong className="text-white">{team.team_code}</strong> ({team.name})
            </div>

            {team.member1_name && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>{team.member1_name} & {team.member2_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Server-Synced Countdown & Actions */}
        <div className="flex items-center gap-3">
          {/* HINT BUTTON */}
          <button
            onClick={() => setHintModalOpen(true)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>[ CIPHER HINT ]</span>
          </button>

          <RoundTimer eventState={eventState} roundNumber={activeRound} />
          
          <button
            onClick={handleLogout}
            className="p-2 border border-zinc-800 hover:border-white bg-black text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------
          MAIN CONTENT AREA (3-COLUMN LAYOUT)
      ------------------------------------------------ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT & CENTER: FOLDER EXPLORER & FILE MANAGER (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col border-r border-zinc-800 bg-black">
          <div id="evidence-archive-header" className="px-6 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2 uppercase tracking-wider">
                <FileSearch className="w-4 h-4 text-white" />
                EVIDENCE ARCHIVE // {assignedCaseId}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 bg-black px-3 py-1 border border-zinc-800">
                {folders.length} FOLDERS
              </span>
            </div>
          </div>

          {/* Folder Grid */}
          <div className="p-6 overflow-y-auto max-h-[380px] border-b border-zinc-800 bg-black">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <WeirdFolderCard
                  key={folder.id}
                  name={folder.name}
                  folder_type={folder.folder_type}
                  item_count={folder.item_count}
                  last_modified={folder.last_modified}
                  description={folder.description}
                  isSelected={selectedFolder?.id === folder.id}
                  onClick={() => setSelectedFolder(folder)}
                />
              ))}
            </div>
          </div>

          {/* Folder Contents Section */}
          <div className="flex-1 p-6 overflow-y-auto bg-black">
            {selectedFolder ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white px-3 py-1 bg-zinc-900 border border-zinc-700">
                      DOSSIER: {selectedFolder.name}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {selectedFolder.files.length} evidence files
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {selectedFolder.files.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      onOpen={(f) => setInspectingFile(f)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center font-mono text-xs text-zinc-600">
                SELECT A DOSSIER FOLDER ABOVE TO INSPECT EVIDENCE FILES
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: WHITE CANVAS INVESTIGATION & ANSWER NOTEPAD (5 Cols) */}
        <div className="lg:col-span-5 bg-[#F9F7F1] text-black p-6 overflow-y-auto flex flex-col justify-between border-l-4 border-black select-text shadow-2xl">
          <div>
            {/* White Canvas Banner Header */}
            <div className="p-4 bg-black text-white mb-5 border-2 border-black">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#D4C5A9]">
                  INVESTIGATION CANVAS // DECODER PAD
                </span>
                <span className="text-[10px] font-mono text-black bg-[#D4C5A9] px-2 py-0.5 font-bold uppercase">
                  {assignedCaseId}
                </span>
              </div>
              <h3 className="text-base font-bold font-mono text-white mt-1 uppercase">
                {activeRound === 1 ? "Round 01: Decipher Corporate Identity" : "Round 02: Investigate Incident"}
              </h3>
            </div>

            {/* SECTION 1: INTERACTIVE DECODER SCRATCHPAD */}
            <div className="mb-6 p-4 bg-white border-2 border-black shadow-md font-mono">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-300">
                <label className="text-xs font-bold text-black uppercase flex items-center gap-1.5 tracking-wider">
                  <Edit3 className="w-3.5 h-3.5 text-black" />
                  INVESTIGATOR SCRATCHPAD / CIPHER NOTES
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">LIVE DRAFT</span>
              </div>
              <textarea
                value={scratchpadNotes}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                placeholder="Scratchpad note canvas... Paste raw ASCII numbers (e.g. 65 116 104 -> Ather) or Hex strings here while decoding evidence files..."
                rows={3}
                className="answer-input w-full border border-zinc-300 p-2.5 text-xs font-mono focus:outline-none focus:border-black resize-y"
              />
              <div className="mt-2 flex justify-between items-center text-[10px] text-zinc-600">
                <span>Notes persist automatically across folder clicks</span>
                <button
                  onClick={() => setHintModalOpen(true)}
                  className="font-bold underline text-black hover:text-red-900"
                >
                  [ HINT DECODER GUIDE ]
                </button>
              </div>
            </div>

            {/* SECTION 2: FORM SUBMISSION CANVAS */}
            {activeRound === 1 && (
              <form onSubmit={handleRound1Submit} className="space-y-4 font-mono">
                <div className="pb-2 border-b-2 border-black flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-black tracking-wider">
                    ROUND 01 CASE FINDINGS ({questions.length} QUESTIONS)
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">{assignedCaseId}</span>
                </div>

                {r1Message && (
                  <div className={`p-3.5 border-2 text-xs font-mono flex items-start gap-2.5 ${
                    r1Message.type === 'success'
                      ? 'bg-emerald-100 border-emerald-800 text-emerald-950 font-bold'
                      : 'bg-red-100 border-red-800 text-red-950 font-bold'
                  }`}>
                    {r1Message.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-800" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-800" />
                    )}
                    <span>{r1Message.text}</span>
                  </div>
                )}

                {questionsLoading ? (
                  <div className="p-8 text-center text-xs font-mono font-bold text-zinc-600 animate-pulse">
                    LOADING CASE QUESTIONS FOR {assignedCaseId}...
                  </div>
                ) : questionsError ? (
                  <div className="p-4 border-2 border-red-800 bg-red-100 text-red-950 font-bold text-xs font-mono">
                    {questionsError}
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                    {questions.map((q, idx) => (
                      <div key={q.id || `r1-q-${idx}`}>
                        <label className="block text-xs font-bold text-black mb-1 uppercase tracking-wider leading-snug">
                          Q{q.num || idx + 1}. {q.question || q.text}
                        </label>
                        {q.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            value={r1Answers[q.id] || ''}
                            onChange={(e) => handleR1AnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || `Enter finding for Q${q.num || idx + 1}...`}
                            className="answer-input w-full border-2 border-black px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        ) : (
                          <input
                            type="text"
                            value={r1Answers[q.id] || ''}
                            onChange={(e) => handleR1AnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || `Enter finding for Q${q.num || idx + 1}...`}
                            className="answer-input w-full border-2 border-black px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={r1Submitting || questionsLoading || !questions.length}
                  className="w-full mt-3 py-3.5 bg-black hover:bg-zinc-800 text-white font-mono font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {r1Submitting ? 'VERIFYING FINDINGS...' : 'SUBMIT ROUND 01 FINDINGS'}
                </button>
              </form>
            )}

            {/* ROUND 2 SUBMISSION FORM */}
            {activeRound === 2 && (
              <form onSubmit={handleRound2Submit} className="space-y-4 font-mono">
                <div className="pb-2 border-b-2 border-black flex justify-between items-center flex-wrap gap-2">
                  <span className="text-xs font-black uppercase text-black tracking-wider">
                    ROUND 02 WAR ROOM ({questions.length} QUESTIONS)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('evidence-archive-header');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1 bg-black text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <FileSearch className="w-3 h-3 text-amber-400" />
                    <span>VIEW EVIDENCE</span>
                  </button>
                </div>

                {questionsLoading ? (
                  <div className="p-8 text-center text-xs font-mono font-bold text-zinc-600 animate-pulse">
                    LOADING ROUND 2 WAR ROOM QUESTIONS FOR {assignedCaseId}...
                  </div>
                ) : questionsError ? (
                  <div className="p-4 border-2 border-red-800 bg-red-100 text-red-950 font-bold text-xs font-mono">
                    {questionsError}
                  </div>
                ) : (
                  <>
                    {/* Compact Question Navigation [1] [2] .. [12] */}
                    <div className="p-2 bg-black border-2 border-black text-xs font-mono">
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">QUESTION NAVIGATION</span>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {Object.keys(r2Answers).filter(k => !k.endsWith('_evidence') && r2Answers[k] && (Array.isArray(r2Answers[k]) ? r2Answers[k].length > 0 : true)).length} / {questions.length} ANSWERED
                        </span>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                        {questions.map((q, idx) => {
                          const qKey = q.id || `q${idx + 1}`;
                          const isAnswered = r2Answers[qKey] !== undefined && r2Answers[qKey] !== '' && (Array.isArray(r2Answers[qKey]) ? r2Answers[qKey].length > 0 : true);
                          const isActive = activeQIndex === idx;
                          return (
                            <button
                              type="button"
                              key={qKey}
                              onClick={() => {
                                setActiveQIndex(idx);
                                const el = document.getElementById(`r2-q-${idx}`);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }}
                              className={`py-1.5 font-bold text-xs flex items-center justify-center transition-all cursor-pointer border ${
                                isActive
                                  ? 'bg-amber-400 text-black border-amber-400 font-black ring-2 ring-black scale-105'
                                  : isAnswered
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {r2Message && (
                      <div className={`p-3.5 border-2 text-xs font-mono flex items-start gap-2.5 ${
                        r2Message.type === 'success'
                          ? 'bg-emerald-100 border-emerald-800 text-emerald-950 font-bold'
                          : 'bg-red-100 border-red-800 text-red-950 font-bold'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{r2Message.text}</span>
                      </div>
                    )}

                    {/* Redesigned Compact Questions List */}
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {questions.map((q, idx) => {
                        const qKey = q.id || `q${idx + 1}`;
                        const isActive = activeQIndex === idx;
                        const qText = q.question || q.text || '';
                        return (
                          <div
                            key={qKey}
                            id={`r2-q-${idx}`}
                            onClick={() => setActiveQIndex(idx)}
                            className={`p-3 border-2 transition-all ${
                              isActive
                                ? 'border-black bg-white shadow-md'
                                : 'border-zinc-300 bg-[#FAF9F5] hover:border-zinc-500'
                            }`}
                          >
                            <label className="block text-xs font-bold text-black mb-1 uppercase tracking-wider leading-snug">
                              Q{q.num || idx + 1}. {qText}
                            </label>

                            {/* Render input depending on type */}
                            {q.type === 'PERCENTAGE' && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <input
                                  type="text"
                                  disabled={r2Locked}
                                  value={r2Answers[qKey] || ''}
                                  onChange={(e) => handleR2AnswerChange(qKey, e.target.value)}
                                  placeholder={q.placeholder || 'e.g. 5.5'}
                                  className="answer-input w-40 border-2 border-black px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                                />
                                <span className="font-mono font-black text-sm text-black">%</span>
                              </div>
                            )}

                            {q.type === 'NUMBER' && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <input
                                  type="text"
                                  disabled={r2Locked}
                                  value={r2Answers[qKey] || ''}
                                  onChange={(e) => handleR2AnswerChange(qKey, e.target.value)}
                                  placeholder={q.placeholder || 'e.g. 0.79'}
                                  className="answer-input w-40 border-2 border-black px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                                />
                                {q.unit && <span className="font-mono font-bold text-xs text-black">{q.unit}</span>}
                              </div>
                            )}

                            {q.type === 'CURRENCY' && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="font-mono font-black text-sm text-black">₹</span>
                                <input
                                  type="text"
                                  disabled={r2Locked}
                                  value={r2Answers[qKey] || ''}
                                  onChange={(e) => handleR2AnswerChange(qKey, e.target.value)}
                                  placeholder={q.placeholder || 'Amount...'}
                                  className="answer-input w-48 border-2 border-black px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                                />
                              </div>
                            )}

                            {q.type === 'CODE' && (
                              <div className="mt-1.5">
                                <input
                                  type="text"
                                  disabled={r2Locked}
                                  value={r2Answers[qKey] || ''}
                                  onChange={(e) => handleR2AnswerChange(qKey, e.target.value.toUpperCase())}
                                  placeholder={q.placeholder || 'e.g. TLE-02'}
                                  className="answer-input w-48 uppercase border-2 border-black px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 tracking-wider"
                                />
                              </div>
                            )}

                            {(q.type === 'PERSON' || q.type === 'COMPANY' || q.type === 'LOCATION' || q.type === 'SHORT_TEXT' || q.type === 'DATE' || q.type === 'text') && (
                              <div className="mt-1.5">
                                <input
                                  type="text"
                                  disabled={r2Locked}
                                  value={r2Answers[qKey] || ''}
                                  onChange={(e) => handleR2AnswerChange(qKey, e.target.value)}
                                  placeholder={q.placeholder || 'Short answer...'}
                                  className="answer-input w-full max-w-xs border-2 border-black px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                                />
                              </div>
                            )}

                            {q.type === 'MULTI_SELECT' && (
                              <div className="space-y-2 border border-black p-3 bg-white mt-1.5">
                                <div className="text-[11px] font-bold text-black uppercase tracking-wider mb-1">
                                  Select THREE evidence-backed weaknesses:
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                  {q.options?.map((opt) => {
                                    const selectedOpts = Array.isArray(r2Answers[qKey])
                                      ? r2Answers[qKey]
                                      : (typeof r2Answers[qKey] === 'string' ? r2Answers[qKey].split(',').map((s: string) => s.trim()) : []);
                                    const isChecked = selectedOpts.includes(opt);
                                    return (
                                      <label key={opt} className={`flex items-center gap-2.5 p-2 border border-black cursor-pointer text-xs font-mono font-bold transition-all ${
                                        isChecked ? 'bg-black text-white' : 'bg-[#FAF9F5] text-black hover:bg-zinc-100'
                                      }`}>
                                        <input
                                          type="checkbox"
                                          disabled={r2Locked}
                                          checked={isChecked}
                                          onChange={() => handleR2MultiSelectToggle(qKey, opt, q.maxSelect || 3)}
                                          className="w-4 h-4 accent-black cursor-pointer"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                                <div className="mt-3 pt-2 border-t border-zinc-300">
                                  <label className="text-[10px] font-bold text-zinc-600 block mb-1">Evidence / metric (optional, max 300 chars):</label>
                                  <textarea
                                    rows={2}
                                    maxLength={300}
                                    disabled={r2Locked}
                                    value={r2Answers[`${qKey}_evidence`] || ''}
                                    onChange={(e) => handleR2AnswerChange(`${qKey}_evidence`, e.target.value)}
                                    placeholder="Optional short evidence quote..."
                                    className="answer-input w-full border border-zinc-400 p-2 text-xs font-mono focus:outline-none focus:border-black"
                                  />
                                </div>
                              </div>
                            )}

                            {(q.type === 'OPEN_ENDED' || q.type === 'CHAIN' || q.type === 'textarea') && (
                              <div className="mt-1.5">
                                <textarea
                                  rows={2}
                                  disabled={r2Locked}
                                  value={r2Answers[qKey] || ''}
                                  onChange={(e) => handleR2AnswerChange(qKey, e.target.value)}
                                  placeholder={q.placeholder || 'Answer...'}
                                  className="answer-input w-full border-2 border-black px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!r2Locked ? (
                      <button
                        type="submit"
                        disabled={r2Submitting || questionsLoading || !questions.length}
                        className="w-full mt-3 py-3.5 bg-black hover:bg-zinc-800 text-white font-mono font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest shadow-lg disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        {r2Submitting ? 'LOCKING PRIZE...' : 'LOCK FINAL ANSWER'}
                      </button>
                    ) : (
                      <div className="p-4 bg-black text-white border-2 border-black text-xs font-mono text-center font-bold">
                        FINAL ANSWER LOCKED // PRIZE RECORDED
                      </div>
                    )}
                  </>
                )}
              </form>
            )}
          </div>

          <div className="pt-4 mt-6 border-t-2 border-black/40 text-[11px] font-mono text-zinc-700 flex justify-between">
            <span>TEAM SESSION: {team.team_code}</span>
            <span>CANVAS WORKBENCH ACTIVE</span>
          </div>
        </div>
      </div>

      {/* File Inspector Modal */}
      <FileViewerModal
        file={inspectingFile}
        onClose={() => setInspectingFile(null)}
      />

      {/* CIPHER HINT MODAL */}
      <AnimatePresence>
        {hintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#D4C5A9] text-black border-4 border-black p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative"
            >
              {/* Close button */}
              <button
                onClick={() => setHintModalOpen(false)}
                className="absolute top-4 right-4 p-1 bg-black text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b-2 border-black pb-3 mb-4">
                <div className="text-xs font-mono font-bold tracking-widest text-black/70 uppercase">
                  ZODIAC CIPHER DECODER // {assignedCaseId}
                </div>
                <h3 className="text-xl font-black font-mono tracking-tight text-black mt-1">
                  INVESTIGATOR'S DECODER HINT
                </h3>
              </div>

              <div className="font-mono text-sm text-zinc-900 leading-relaxed my-4 whitespace-pre-wrap">
                {caseInfo?.hint_text || "Search evidence files for decimal ASCII sequences (e.g. 65 116 104) or Hexadecimal strings. Convert numbers to ASCII characters to reveal company, headquarters, and product details."}
              </div>

              {/* Handwritten note style snippet */}
              <div className="p-4 bg-black text-white font-zodiac text-sm rounded-none border border-black shadow-inner my-4">
                "This is the Zodiac speaking... Don't take raw numbers at face value. A space-separated sequence like 66 101 110 103 97 108 117 114 117 spells a city name in ASCII..."
              </div>

              <div className="mt-6 pt-3 border-t-2 border-black/40 flex justify-between items-center font-mono text-[10px] text-black/70">
                <span>SFPD CASE REF: {assignedCaseId}</span>
                <button
                  onClick={() => setHintModalOpen(false)}
                  className="px-4 py-1.5 bg-black text-white hover:bg-zinc-800 font-bold uppercase transition-colors"
                >
                  CLOSE DECODER
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </ZodiacCipherTransition>
  );
}
