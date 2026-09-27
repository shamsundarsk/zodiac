"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CaseFolder, FolderType, FileType } from '@/lib/types';
import { Plus, ArrowLeft, Folder, FileText, CheckCircle2, Shield } from 'lucide-react';

export default function AdminCaseBuilderPage() {
  const [folders, setFolders] = useState<CaseFolder[]>([]);
  const [activeRound, setActiveRound] = useState<1 | 2>(1);

  // New Folder Form State
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderType, setNewFolderType] = useState<FolderType>('FINANCIAL');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // New File Form State
  const [targetFolderId, setTargetFolderId] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [newFileType, setNewFileType] = useState<FileType>('PDF');
  const [newEvidenceId, setNewEvidenceId] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFolders = async () => {
      const res = await fetch(`/api/cases?round=${activeRound}`);
      const data = await res.json();
      if (data.folders) {
        setFolders(data.folders);
        if (data.folders.length > 0) {
          setTargetFolderId(data.folders[0].id);
        }
      }
    };
    fetchFolders();
  }, [activeRound]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_FOLDER',
          folder_data: {
            case_id: activeRound === 1 ? 'case-01' : 'case-02',
            name: newFolderName,
            folder_type: newFolderType,
            description: newFolderDesc
          }
        })
      });
      const data = await res.json();
      if (data.folder) {
        setFolders([...folders, data.folder]);
        setNewFolderName('');
        setNewFolderDesc('');
        setMessage('New folder created successfully!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_FILE',
          file_data: {
            folder_id: targetFolderId,
            filename: newFilename,
            file_type: newFileType,
            evidence_id: newEvidenceId,
            content_type: newFileType === 'XLSX' ? 'table' : 'pdf',
            content: newFileContent
          }
        })
      });
      const data = await res.json();
      if (data.file) {
        setMessage(`File ${data.file.filename} added to folder.`);
        setNewFilename('');
        setNewFileContent('');
        // Refresh folders
        const refRes = await fetch(`/api/cases?round=${activeRound}`);
        const refData = await refRes.json();
        if (refData.folders) setFolders(refData.folders);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
            <h1 className="text-lg font-bold text-white uppercase tracking-wider">CASE BUILDER & EVIDENCE MANAGER</h1>
            <p className="text-xs text-zinc-400 font-mono">Configure raw business case files and evidence tags</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveRound(1)}
            className={`px-3 py-1.5 text-xs font-bold font-mono uppercase ${
              activeRound === 1 ? 'bg-white text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
            }`}
          >
            ROUND 01 CASES
          </button>
          <button
            onClick={() => setActiveRound(2)}
            className={`px-3 py-1.5 text-xs font-bold font-mono uppercase ${
              activeRound === 2 ? 'bg-white text-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
            }`}
          >
            ROUND 02 CASE
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Create Folder & File Forms (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {message && (
            <div className="p-3 bg-zinc-900 border border-white text-xs text-white flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{message}</span>
            </div>
          )}

          {/* Add Folder Form */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 font-mono">
            <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
              <Folder className="w-4 h-4 text-white" /> CREATE CUSTOM FOLDER
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 uppercase">FOLDER NAME</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. LOGISTICS"
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 uppercase">VISUAL ICON CATEGORY</label>
                <select
                  value={newFolderType}
                  onChange={(e) => setNewFolderType(e.target.value as FolderType)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                >
                  <option value="FINANCIAL">FINANCIAL (Ledger)</option>
                  <option value="MARKETING">MARKETING (Newspaper/Ad)</option>
                  <option value="OPERATIONS">OPERATIONS (Warehouse Grid)</option>
                  <option value="PRODUCTS">PRODUCTS (Robot Silhouette)</option>
                  <option value="PEOPLE">PEOPLE (Profile Dossier)</option>
                  <option value="MARKET">MARKET (Graph Chart)</option>
                  <option value="ARCHIVE">ARCHIVE (Old Paper)</option>
                  <option value="MISC">MISC (Confidential Evidence)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 uppercase">DESCRIPTION</label>
                <input
                  type="text"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="e.g. Assembly line and shipping manifests"
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition-colors uppercase cursor-pointer"
              >
                + ADD FOLDER
              </button>
            </form>
          </div>

          {/* Add Evidence File Form */}
          <div className="p-5 bg-zinc-950 border border-zinc-800 font-mono">
            <h3 className="text-xs font-bold text-white uppercase mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-white" /> UPLOAD / ADD RAW EVIDENCE FILE
            </h3>
            <form onSubmit={handleAddFile} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 uppercase">TARGET FOLDER</label>
                <select
                  value={targetFolderId}
                  onChange={(e) => setTargetFolderId(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.files.length} items)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1 uppercase">FILENAME</label>
                  <input
                    type="text"
                    required
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    placeholder="e.g. audit_log.pdf"
                    className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 uppercase">FILE TYPE</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as FileType)}
                    className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="XLSX">XLSX Spreadsheet</option>
                    <option value="CSV">CSV Data Sheet</option>
                    <option value="PNG">PNG Image</option>
                    <option value="JPG">JPG Photo</option>
                    <option value="TXT">TXT Transcript</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 uppercase">EVIDENCE RECORD ID</label>
                <input
                  type="text"
                  value={newEvidenceId}
                  onChange={(e) => setNewEvidenceId(e.target.value)}
                  placeholder="e.g. EVID-909"
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 uppercase">FILE RAW TEXT / CIPHER BODY</label>
                <textarea
                  rows={4}
                  required
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  placeholder="Enter raw evidence content (use space-separated ASCII or Hex string for encrypted fields)..."
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-white font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition-colors uppercase cursor-pointer"
              >
                + ADD EVIDENCE FILE
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Folders List (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 p-5 font-mono">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
            <h3 className="text-xs font-bold text-white uppercase">EXISTING FOLDERS & FILES IN ROUND 0{activeRound}</h3>
            <span className="text-[11px] text-zinc-400">{folders.length} FOLDERS</span>
          </div>

          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            {folders.map((folder) => (
              <div key={folder.id} className="bg-black border border-zinc-800 p-4">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{folder.name}</span>
                    <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 border border-zinc-700">
                      {folder.folder_type}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">{folder.files.length} items</span>
                </div>
                <p className="text-xs text-zinc-400 mb-3">{folder.description}</p>

                <div className="space-y-1.5">
                  {folder.files.map((file) => (
                    <div key={file.id} className="p-2 bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{file.filename}</span>
                        <span className="text-[10px] text-zinc-500">[{file.file_type}]</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{file.evidence_id}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
