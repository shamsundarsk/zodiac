"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, ArrowRight, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { Team } from '@/lib/types';
import { ZodiacCipherTransition } from '@/components/animation/ZodiacCipherTransition';

export default function RegisterTeamPage() {
  const router = useRouter();

  // Form state
  const [teamName, setTeamName] = useState('');
  const [member1, setMember1] = useState('');
  const [member2, setMember2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Post-registration confirmation dossier
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!member1.trim() || !member2.trim()) {
      setError('Exactly TWO members are required. Enter names for both Member 01 and Member 02.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName.trim(),
          member1_name: member1.trim(),
          member2_name: member2.trim()
        })
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setError(data.message || 'Registration failed.');
        return;
      }

      setCreatedTeam(data.team);
    } catch (err) {
      setLoading(false);
      setError('Connection to case server failed.');
    }
  };

  const handleEnterInvestigation = () => {
    if (createdTeam) {
      sessionStorage.setItem('casefiles_team', JSON.stringify(createdTeam));
      router.push('/dashboard');
    }
  };

  return (
    <ZodiacCipherTransition>
      <div className="min-h-screen flex flex-col justify-between bg-black text-white relative font-sans selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-800 z-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black font-mono font-black flex items-center justify-center text-sm">
            Z
          </div>
          <span className="font-mono font-bold tracking-widest text-sm text-white">
            ZODIAC ARCHIVE <span className="text-zinc-400 font-normal">// REGISTRATION</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-white hover:border-white transition-all font-mono text-xs font-semibold"
        >
          Team Login
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl mx-auto px-6 flex flex-col justify-center py-12 z-10 w-full">
        <AnimatePresence mode="wait">
          {!createdTeam ? (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-zinc-950 border-2 border-zinc-800 p-8 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-black border border-zinc-700 text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                      TEAM REGISTRATION
                    </span>
                    <h2 className="text-lg font-bold font-mono text-white">Register Investigation Team</h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-black border border-zinc-700 font-mono text-[11px] text-zinc-300">
                  EXACTLY 2 MEMBERS
                </span>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-zinc-900 border border-red-800 text-xs font-mono text-red-400 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleRegister} className="space-y-5 font-mono">
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                    TEAM NAME <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Apex Analysts or Cipher Squad"
                    className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-all"
                  />
                  <p className="mt-1.5 text-[11px] text-zinc-500 font-mono">Unique name for live competition leaderboard</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                      MEMBER 01 NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={member1}
                      onChange={(e) => setMember1(e.target.value)}
                      placeholder="First Investigator"
                      className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                      MEMBER 02 NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={member2}
                      onChange={(e) => setMember2(e.target.value)}
                      placeholder="Second Investigator"
                      className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-mono font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    {loading ? (
                      <span>ASSIGNING RANDOM CASE...</span>
                    ) : (
                      <>
                        <span>REGISTER & ASSIGN CASE</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>SERVER-SIDE RANDOM CASE GENERATION</span>
                <span>5 CASES DISTRIBUTED</span>
              </div>
            </motion.div>
          ) : (
            /* Post Registration Confirmation Dossier View */
            <motion.div
              key="confirmation-dossier"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#D4C5A9] text-black border-4 border-black p-8 shadow-2xl relative font-serif"
            >
              <div className="text-center mb-6 border-b-2 border-black pb-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black text-white text-xs font-mono font-bold mb-3 uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  REGISTRATION SUCCESSFUL
                </div>
                <h2 className="text-2xl font-black font-mono text-black uppercase">INVESTIGATION DOSSIER CREATED</h2>
                <p className="text-xs text-black/70 mt-1 font-mono">Your team credentials and assigned case have been locked.</p>
              </div>

              {/* Dossier Info Box */}
              <div className="bg-black text-white p-6 mb-6 space-y-4 font-mono">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400">TEAM NAME</span>
                  <span className="text-sm font-bold text-white">{createdTeam.name}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400">UNIQUE TEAM ID</span>
                  <span className="text-sm font-bold text-white px-2.5 py-0.5 bg-zinc-900 border border-zinc-700">
                    {createdTeam.team_code}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400">ACCESS CODE</span>
                  <span className="text-sm font-bold text-white">{createdTeam.access_code}</span>
                </div>

                <div className="pb-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-2">REGISTERED MEMBERS</span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white">
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">MEMBER 01</span>
                      <strong className="text-white">{createdTeam.member1_name}</strong>
                    </div>
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 block">MEMBER 02</span>
                      <strong className="text-white">{createdTeam.member2_name}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">RANDOMLY ASSIGNED CASE</span>
                  <span className="text-sm font-bold text-white px-2.5 py-0.5 bg-zinc-900 border border-white underline">
                    {createdTeam.assigned_case_id_r1.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleEnterInvestigation}
                className="w-full py-4 bg-black text-white hover:bg-zinc-800 font-mono font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>ENTER THE INVESTIGATION</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500 z-20">
        <div>ZODIAC ARCHIVE © 2026 COMPETITION SYSTEM</div>
        <div>SERVER TIME SYNCED</div>
      </footer>
    </div>
    </ZodiacCipherTransition>
  );
}
