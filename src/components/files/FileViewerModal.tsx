import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvidenceFile } from '@/lib/types';
import { X, Search, FileText, Lock, FileSpreadsheet, ExternalLink, Download } from 'lucide-react';

interface FileViewerModalProps {
  file: EvidenceFile | null;
  onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({ file, onClose }) => {
  const [tableSearch, setTableSearch] = useState('');
  const [activeSheet, setActiveSheet] = useState<string>('');

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

  const rawFileUrl = file.file_url || file.image_url || '';

  const renderContent = () => {
    // 1. XLSX / CSV Table Grid Viewer
    if (file.content_type === 'table' && file.data_json) {
      const sheetNames: string[] = file.data_json.sheetNames || [];
      const sheets = file.data_json.sheets;

      const currentSheetName = activeSheet && sheets && sheets[activeSheet]
        ? activeSheet
        : (sheetNames.length > 0 ? sheetNames[0] : '');

      const sheetData = (sheets && currentSheetName && sheets[currentSheetName])
        ? sheets[currentSheetName]
        : { headers: file.data_json.headers || [], rows: file.data_json.rows || [], title: file.data_json.title };

      const headers: string[] = sheetData.headers || [];
      const rows: string[][] = sheetData.rows || [];
      const tableTitle: string | undefined = sheetData.title || file.data_json.title;

      const filteredRows = rows.filter(row =>
        row.some(cell => String(cell || '').toLowerCase().includes(tableSearch.toLowerCase()))
      );

      return (
        <div className="flex flex-col h-full bg-[#050505]">
          {/* Multi-sheet navigation tabs */}
          {sheetNames.length > 1 && (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 border-b border-zinc-800 overflow-x-auto shrink-0">
              <span className="text-[11px] font-mono text-zinc-400 mr-2 uppercase font-bold shrink-0">EXCEL SHEETS ({sheetNames.length}):</span>
              {sheetNames.map((sName) => (
                <button
                  key={sName}
                  onClick={() => {
                    setActiveSheet(sName);
                    setTableSearch('');
                  }}
                  className={`px-3 py-1 text-xs font-mono font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    currentSheetName === sName
                      ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-white hover:text-white'
                  }`}
                >
                  {sName}
                </button>
              ))}
            </div>
          )}

          {tableTitle && (
            <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-800/60 text-amber-300 font-mono text-xs flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold">{tableTitle}</span>
            </div>
          )}

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
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-zinc-400">
                RECORDS: <span className="text-white font-bold">{filteredRows.length}</span> / {rows.length}
              </div>
              {rawFileUrl && (
                <a
                  href={rawFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={file.filename}
                  className="px-2.5 py-1 bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold flex items-center gap-1 transition-colors uppercase"
                >
                  <Download className="w-3.5 h-3.5" />
                  RAW FILE
                </a>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-[#0A0A0A]">
            <div className="border border-zinc-800 rounded overflow-x-auto shadow-2xl">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-700 text-zinc-200">
                    <th className="p-2.5 w-10 text-center border-r border-zinc-800 font-mono text-zinc-500">#</th>
                    {headers.map((h, i) => (
                      <th key={i} className="p-2.5 border-r border-zinc-800 last:border-r-0 font-bold uppercase tracking-wider text-zinc-300 min-w-[120px]">
                        {h || `COL ${i + 1}`}
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
                        <td key={cIdx} className="p-2.5 border-r border-zinc-800/60 last:border-r-0 text-zinc-200 font-mono selection:bg-white selection:text-black whitespace-nowrap">
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

    // 2. PDF / Confidential Document Viewer with Native Embedded Iframe
    if (file.file_type === 'PDF' || file.content_type === 'pdf') {
      return (
        <div className="flex-1 overflow-hidden bg-[#070707] flex flex-col h-full">
          {rawFileUrl ? (
            <div className="flex-1 w-full h-full relative bg-zinc-900">
              <iframe
                src={rawFileUrl}
                title={file.filename}
                className="w-full h-full border-0 bg-white"
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
              <div className="max-w-3xl w-full bg-[#D4C5A9] text-[#1A1A1A] border-4 border-black p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative rounded-none font-serif leading-relaxed select-text">
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 border-2 border-red-800 text-red-900 px-3 py-1 text-xs font-zodiac font-bold tracking-widest -rotate-6 opacity-90 uppercase">
                  CONFIDENTIAL // CIPHER ENCODED
                </div>
                <div className="border-b-2 border-black/80 pb-4 mb-6">
                  <div className="text-xs font-mono font-bold tracking-widest text-black/70 uppercase">
                    ZODIAC FORENSIC ARCHIVE :: REF-{file.filename}
                  </div>
                  <h2 className="text-2xl font-black font-mono tracking-tight text-black mt-1">
                    EVIDENCE RECORD #{file.evidence_id || 'CLASSIFIED'}
                  </h2>
                </div>
                <div className="font-mono text-xs sm:text-sm text-zinc-900 leading-relaxed whitespace-pre-wrap selection:bg-black selection:text-white">
                  {file.content}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 3. Image / Evidence Snapshot
    if (file.file_type === 'PNG' || file.file_type === 'JPG' || file.content_type === 'image') {
      return (
        <div className="flex-1 overflow-auto p-6 sm:p-10 bg-[#050505] flex flex-col items-center justify-center">
          <div className="bg-[#D4C5A9] p-4 pb-6 border-4 border-black max-w-2xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <div className="bg-black border-2 border-black p-2 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {rawFileUrl ? (
                <img
                  src={rawFileUrl}
                  alt={file.filename}
                  className="max-h-[60vh] w-auto object-contain shadow-2xl border border-zinc-800 bg-black"
                  onError={(e) => {
                    // Fallback on image load error
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="p-8">
                  <FileText className="w-12 h-12 text-white mb-2 mx-auto" />
                  <p className="text-sm font-mono text-white font-bold">{file.filename}</p>
                  <p className="text-xs font-mono text-zinc-400 mt-2">{file.content}</p>
                </div>
              )}
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
          <div className="text-xs text-zinc-500 mb-2 pb-2 border-b border-zinc-800 flex justify-between items-center">
            <span>RAW FORENSIC TEXT EXCERPT :: {file.filename}</span>
            {rawFileUrl && (
              <a
                href={rawFileUrl}
                target="_blank"
                rel="noreferrer"
                download={file.filename}
                className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[11px] font-mono font-bold flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                RAW TEXT
              </a>
            )}
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
          className="w-full max-w-5xl h-[90vh] bg-black border-2 border-zinc-700 flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Top Header Action Bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-zinc-950 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-white text-black border border-white uppercase tracking-wider">
                {file.file_type}
              </span>
              <h3 className="text-sm font-bold text-white font-mono tracking-tight">
                {file.filename}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {rawFileUrl && (
                <a
                  href={rawFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={file.filename}
                  className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black font-mono text-xs font-black flex items-center gap-1.5 uppercase transition-colors shadow-lg"
                  title="Open or download complete raw exhibit file"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  OPEN FULL FILE
                </a>
              )}
              <button
                onClick={onClose}
                className="p-1.5 border border-zinc-800 hover:border-white bg-black text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close evidence viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Body View */}
          {renderContent()}

          {/* Footer Bar */}
          <div className="px-5 py-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-zinc-300" />
              <span>SFPD CLASSIFIED CASE ARCHIVE</span>
            </div>
            <span className="font-zodiac text-zinc-300 text-xs">ZODIAC CASE DOSSIER // FULL ACCESS GRANTED</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
