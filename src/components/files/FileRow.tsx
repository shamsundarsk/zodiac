"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EvidenceFile, FileType } from '@/lib/types';
import { FileText, Table, Image as ImageIcon, FileCode, Eye } from 'lucide-react';

interface FileRowProps {
  file: EvidenceFile;
  onOpen: (file: EvidenceFile) => void;
}

const FileTypeIcon: React.FC<{ type: FileType }> = ({ type }) => {
  switch (type) {
    case 'PDF':
      return (
        <div className="w-9 h-10 rounded-none bg-red-950/40 border border-red-800 flex flex-col justify-between p-1 relative overflow-hidden group-hover:border-red-500 transition-colors">
          <div className="flex justify-between items-center text-red-500">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] font-mono font-bold bg-red-800 text-white px-1 py-0.5 self-start tracking-tighter">
            PDF
          </span>
        </div>
      );
    case 'XLSX':
    case 'CSV':
      return (
        <div className="w-9 h-10 rounded-none bg-emerald-950/40 border border-emerald-800 flex flex-col justify-between p-1 relative overflow-hidden group-hover:border-emerald-500 transition-colors">
          <div className="flex justify-between items-center text-emerald-500">
            <Table className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] font-mono font-bold bg-emerald-800 text-white px-1 py-0.5 self-start tracking-tighter">
            {type}
          </span>
        </div>
      );
    case 'PNG':
    case 'JPG':
      return (
        <div className="w-9 h-10 rounded-none bg-amber-950/40 border border-amber-800 flex flex-col justify-between p-1 relative overflow-hidden group-hover:border-amber-500 transition-colors">
          <div className="flex justify-between items-center text-amber-500">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] font-mono font-bold bg-amber-800 text-white px-1 py-0.5 self-start tracking-tighter">
            IMG
          </span>
        </div>
      );
    case 'TXT':
    default:
      return (
        <div className="w-9 h-10 rounded-none bg-cyan-950/40 border border-cyan-800 flex flex-col justify-between p-1 relative overflow-hidden group-hover:border-cyan-500 transition-colors">
          <div className="flex justify-between items-center text-cyan-500">
            <FileCode className="w-3.5 h-3.5" />
          </div>
          <span className="text-[9px] font-mono font-bold bg-cyan-800 text-white px-1 py-0.5 self-start tracking-tighter">
            TXT
          </span>
        </div>
      );
  }
};

export const FileRow: React.FC<FileRowProps> = ({ file, onOpen }) => {
  return (
    <motion.div
      onClick={() => onOpen(file)}
      whileHover={{ x: 3 }}
      className="group flex items-center justify-between p-3.5 border border-zinc-800 bg-black hover:border-zinc-500 hover:bg-zinc-950 cursor-pointer transition-all duration-150"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <FileTypeIcon type={file.file_type} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold font-mono text-white group-hover:text-zinc-200 truncate">
              {file.filename}
            </h4>
            {file.evidence_id && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-700">
                {file.evidence_id}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mt-0.5">
            <span>{file.file_type} · {file.file_size}</span>
            <span>·</span>
            <span>{file.date}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(file);
          }}
          className="p-1.5 border border-zinc-800 hover:border-white bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          title="Inspect Evidence File"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
