"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvidenceFile } from '@/lib/types';
import { X, Search, FileText, Lock, FileSpreadsheet, AlertTriangle } from 'lucide-react';

interface FileViewerModalProps {
  file: EvidenceFile | null;
  onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, onClose }) => {
  const [tableSearch, setTableSearch] = useState('');

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const renderContent = () => {
    // 1. XLSX / CSV Table Grid Viewer
    if (file.content_type === 'table' && file.data_json) {
      const headers: string[] = file.data_json.headers || [];
      const rows: string[][] = file.data_json.rows || [];

      const filteredRows = rows.filter(row =>
        row.some(cell => cell.toLowerCase().includes(tableSearch.toLowerCase()))
      );

      return (
        <div className="flex flex-col h-full bg-[#050505]">
          <div className="flex items-center justify-between gap-4 p-3 bg-zinc-950 border-b border-zinc-800">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search raw dataset matrix..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-white font-mono"
              />
            </div>
            <div className="text-xs font-mono text-zinc-400">
              RECORDS: <span className="text-white font-bold">{filteredRows.length}</span> / {rows.length}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-[#0A0A0A]">
            <div className="border border-zinc-800 rounded overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-700 text-zinc-200">
                    <th className="p-2.5 w-10 text-center border-r border-zinc-800 font-mono text-zinc-500">#</th>
                    {headers.map((h, i) => (
                      <th key={i} className="p-2.5 border-r border-zinc-800 last:border-r-0 font-bold uppercase tracking-wider text-zinc-300">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-zinc-800/80 hover:bg-zinc-900/80 transition-colors">
                      <td className="p-2.5 text-center border-r border-zinc-800 text-zinc-600 font-bold">
                        {rIdx + 1}
                      </td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 border-r border-zinc-800/60 last:border-r-0 text-zinc-200 font-mono selection:bg-white selection:text-black">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // 2. PDF / Confidential Dossier Viewer
    if (file.file_type === 'PDF' || file.content_type === 'pdf') {
      return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070707] flex justify-center items-start">
          <div className="max-w-3xl w-full bg-[#D4C5A9] text-[#1A1A1A] border-4 border-black p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative rounded-none font-serif leading-relaxed select-text">
            
            {/* Top Red Crime Scene Stamp */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 border-2 border-red-800 text-red-900 px-3 py-1 text-xs font-zodiac font-bold tracking-widest -rotate-6 opacity-90 uppercase">
              CONFIDENTIAL // CIPHER ENCODED
            </div>

            {/* Header Stamp */}
            <div className="border-b-2 border-black/80 pb-4 mb-6">
              <div className="text-xs font-mono font-bold tracking-widest text-black/70 uppercase">
                ZODIAC FORENSIC ARCHIVE :: REF-{file.filename}
              </div>
              <h2 className="text-2xl font-black font-mono tracking-tight text-black mt-1">
                EVIDENCE RECORD #{file.evidence_id || 'CLASSIFIED'}
              </h2>
              <div className="text-xs font-mono text-black/70 mt-1 flex justify-between">
                <span>DATE RECORDED: {file.date}</span>
                <span>SIZE: {file.file_size}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="font-mono text-xs sm:text-sm text-zinc-900 leading-relaxed whitespace-pre-wrap selection:bg-black selection:text-white">
              {file.content}
            </div>

            {/* Handwritten Note Stamp */}
            <div className="mt-8 pt-4 border-t-2 border-black/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="font-zodiac text-xs text-red-950 font-bold">
                * Note: Raw data fields contain encoded ASCII/HEX cipher strings. Decode to solve.
              </div>
              <div className="font-mono text-[10px] text-black/60 uppercase">
                EVID-DOC // SFPD CASE FILE
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. Image / Evidence Snapshot
    if (file.file_type === 'PNG' || file.file_type === 'JPG' || file.content_type === 'image') {
      return (
        <div className="flex-1 overflow-auto p-6 sm:p-10 bg-[#050505] flex flex-col items-center justify-center">
          <div className="bg-[#D4C5A9] p-4 pb-8 border-4 border-black max-w-xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.9)] transform -rotate-1">
            <div className="bg-black aspect-video rounded-none border-2 border-black p-6 flex flex-col items-center justify-center text-center relative">
              <FileText className="w-12 h-12 text-white mb-2" />
              <p className="text-sm font-mono text-white font-bold">{file.filename}</p>
              <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 max-w-md w-full text-left whitespace-pre-wrap">
                {file.content}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between font-zodiac text-xs text-black font-bold">
              <span>EXHIBIT REF: {file.evidence_id || 'EVID-IMG'}</span>
              <span>STAMP: {file.date}</span>
            </div>
          </div>
        </div>
      );
    }

    // 4. Default Monospace Text Dossier
    return (
      <div className="flex-1 overflow-auto p-6 bg-[#050505] font-mono text-xs text-zinc-200">
        <div className="max-w-4xl mx-auto bg-black border border-zinc-800 p-6 rounded shadow-2xl">
          <div className="text-xs text-zinc-500 mb-2 pb-2 border-b border-zinc-800 flex justify-between">
            <span>RAW FORENSIC TEXT EXCERPT</span>
            <span>{file.filename}</span>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed text-zinc-300 selection:bg-white selection:text-black font-mono">
            {file.content || "No raw text body available for this file."}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-4xl h-[85vh] bg-black border-2 border-zinc-700 flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-white text-black border border-white uppercase tracking-wider">
                {file.file_type}
              </span>
              <h3 className="text-sm font-bold text-white font-mono tracking-tight">
                {file.filename}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1.5 border border-zinc-800 hover:border-white bg-black text-zinc-400 hover:text-white transition-colors"
                title="Close evidence viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          {renderContent()}

          {/* Footer Bar */}
          <div className="px-5 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-zinc-300" />
              <span>SFPD CLASSIFIED CASE ARCHIVE</span>
            </div>
            <span className="font-zodiac text-zinc-300 text-xs">ZODIAC CASE DOSSIER</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
