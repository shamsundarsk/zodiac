"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, ArrowRight, UserPlus, KeyRound } from 'lucide-react';
import { ZodiacCipherTransition } from '@/components/animation/ZodiacCipherTransition';

export default function ParticipantLoginPage() {
  const router = useRouter();
  const [teamCode, setTeamCode] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_code: teamCode.trim().toUpperCase(),
          access_code: accessCode.trim()
        })
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Invalid Team ID or Access Code');
        setLoading(false);
        return;
      }

      // Store team authentication in sessionStorage
      sessionStorage.setItem('casefiles_team', JSON.stringify(data.team));
      router.push('/dashboard');

    } catch (err) {
      setError('Connection to case server failed.');
      setLoading(false);
    }
  };

  return (
    <ZodiacCipherTransition>
      <div className="min-h-screen flex flex-col justify-between p-6 bg-black relative font-sans text-white selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 pb-4 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black font-mono font-black flex items-center justify-center text-sm">
            Z
          </div>
          <span className="font-mono font-bold tracking-widest text-base text-white">
            ZODIAC ARCHIVE <span className="text-zinc-400 font-normal">// TEAM ACCESS</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 transition-all font-mono text-xs font-extrabold flex items-center gap-2 uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            Register Team
          </Link>
        </div>
      </header>

      {/* Center Card */}
      <main className="flex-1 flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-zinc-950 border-2 border-zinc-800 p-8 shadow-2xl relative z-10"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-black border border-zinc-700 text-white">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-mono text-white tracking-tight">TEAM ACCESS</h2>
                <p className="text-xs text-zinc-400 font-mono">ENTER CASE CREDENTIALS</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-zinc-900 border border-red-800 text-xs font-mono text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                UNIQUE TEAM ID
              </label>
              <input
                type="text"
                required
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="e.g. TEAM-047"
                className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                ACCESS CODE
              </label>
              <input
                type="password"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="e.g. CASE-101"
                className="w-full bg-black border border-zinc-800 px-4 py-3 font-mono text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-mono font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {loading ? 'AUTHENTICATING...' : 'ENTER CASE ARCHIVE'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center font-mono text-xs">
            <p className="text-zinc-400 mb-2">Don't have a team yet?</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-white hover:underline font-bold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register New Team (2 Members Required)
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-zinc-500">
        <div>ZODIAC ARCHIVE © 2026</div>
        <div>PORT 3000 // PARTICIPANT INTERFACE</div>
      </footer>
    </div>
    </ZodiacCipherTransition>
  );
}
