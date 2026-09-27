"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuditLog } from '@/lib/types';
import { ArrowLeft, Search, ListFilter, Shield } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterTeam, setFilterTeam] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/audit');
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log =>
    log.team_code.toLowerCase().includes(filterTeam.toLowerCase()) ||
    log.action.toLowerCase().includes(filterTeam.toLowerCase()) ||
    log.details.toLowerCase().includes(filterTeam.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono selection:bg-white selection:text-black">
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">EVENT AUDIT & ACTION LOGS</h1>
            <p className="text-xs text-zinc-400 font-mono">Real-time audit stream of all team and administrator actions</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search team or action..."
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="bg-black border border-zinc-800 rounded-none pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-white font-mono"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto bg-zinc-950 border border-zinc-800 p-5">
        {loading ? (
          <p className="text-xs text-zinc-500 py-8 text-center uppercase tracking-wider">LOADING AUDIT STREAM...</p>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3 bg-black border border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-white font-bold">
                    {log.team_code}
                  </span>
                  <span className="px-2 py-0.5 bg-white text-black font-bold">
                    {log.action}
                  </span>
                  <span className="text-zinc-300">{log.details}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
