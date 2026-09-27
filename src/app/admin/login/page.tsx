"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_admin: true,
          admin_password: adminPassword
        })
      });

      const data = await res.json();
      if (!data.success) {
        setError('Invalid Admin Security Key.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('casefiles_admin_token', data.token);
      router.push('/admin');

    } catch (err) {
      setError('Admin server connection error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white relative font-sans selection:bg-white selection:text-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-950 border-2 border-zinc-800 p-8 shadow-2xl relative z-10"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
          <div className="p-2 bg-black border border-white text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono text-white tracking-tight uppercase">OPERATIONS CONTROL</h2>
            <p className="text-xs text-zinc-400 font-mono">PORT 3001 ADMINISTRATOR</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-zinc-900 border border-red-800 text-xs font-mono text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5 font-mono">
          <div>
            <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              ADMIN MASTER SECURITY KEY
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter security key"
                className="w-full bg-black border border-zinc-800 rounded-none pl-10 pr-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-mono font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {loading ? 'VERIFYING...' : 'UNLOCK CONTROL CONSOLE'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-800 text-center font-mono text-xs text-zinc-500">
          Default Key: <span className="text-white font-bold">admin123</span>
        </div>
      </motion.div>
    </div>
  );
}
