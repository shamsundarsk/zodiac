"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileSearch, ArrowRight, X, CheckCircle2, Cpu, Key, FileText, Lock } from 'lucide-react';
import { ZodiacCipherTransition } from '@/components/animation/ZodiacCipherTransition';

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<'HOW_IT_WORKS' | 'RULES' | null>(null);

  return (
    <ZodiacCipherTransition>
      <div className="min-h-screen flex flex-col justify-between relative bg-[#060606] text-[#E0D5C1] font-sans selection:bg-[#D4C5A9] selection:text-black overflow-hidden">
      {/* Subtle Vignette & Low-Light Ambient Shadow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1C1814]/40 via-[#0A0908]/90 to-[#030303] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />

      {/* Fincher Zodiac Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20 border-b border-[#1C1915]">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 bg-[#D4C5A9] text-black border-2 border-[#D4C5A9] flex items-center justify-center font-zodiac font-black text-xl shadow-lg">
            Z
          </div>
          <div>
            <span className="font-mono font-extrabold tracking-widest text-sm text-[#F5F2EB] block">
              THE ZODIAC FILES
            </span>
            <span className="font-mono text-[10px] text-[#8C8275] tracking-widest uppercase block">
              SAN FRANCISCO POLICE DEPT // HOMICIDE & FORENSIC ARCHIVE
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => setActiveModal('HOW_IT_WORKS')}
            className="px-3.5 py-2 text-[#8C8275] hover:text-[#E0D5C1] hover:bg-[#12100E] border border-transparent hover:border-[#26231F] transition-all cursor-pointer uppercase tracking-wider"
          >
            [ DOSSIER BRIEF ]
          </button>
          <button
            onClick={() => setActiveModal('RULES')}
            className="px-3.5 py-2 text-[#8C8275] hover:text-[#E0D5C1] hover:bg-[#12100E] border border-transparent hover:border-[#26231F] transition-all cursor-pointer uppercase tracking-wider"
          >
            [ PROTOCOL ]
          </button>
          <Link
            href="/login"
            className="px-4 py-2 bg-[#12100E] border border-[#26231F] text-[#E0D5C1] hover:border-[#D4C5A9] transition-all font-mono font-semibold"
          >
            Team Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-[#D4C5A9] text-black hover:bg-[#E0D5C1] transition-all font-mono font-extrabold uppercase tracking-wider"
          >
            Register Team
          </Link>
        </nav>
      </header>

      {/* Cinematic Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 flex flex-col justify-center items-center text-center py-16 sm:py-24 z-10">
        
        {/* Classified Case Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#12100E] border border-[#8B0000]/60 text-xs font-mono text-[#D4C5A9] mb-8 shadow-2xl"
        >
          <span className="w-2 h-2 bg-[#991B1B] animate-pulse" />
          <span className="font-zodiac text-red-500 font-bold">CLASSIFIED // SFPD FORENSIC INVESTIGATION</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-mono tracking-tight text-[#F5F2EB] leading-[1.1] uppercase"
        >
          DECODE THE CIPHER. <br />
          <span className="font-zodiac text-[#D4C5A9] font-normal tracking-wide normal-case text-3xl sm:text-5xl md:text-6xl block mt-2 text-red-900/90">
            "This is the Zodiac speaking..."
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm sm:text-base md:text-lg text-[#8C8275] max-w-2xl font-mono leading-relaxed"
        >
          Step into a 1969-style digital investigation. Decipher raw ASCII decimal byte streams and Hexadecimal strings to uncover the hidden identity of a corporate entity.
        </motion.p>

        {/* Action CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            href="/register"
            className="group px-8 py-4 bg-[#D4C5A9] text-black font-mono font-black text-sm hover:bg-[#E0D5C1] transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(212,197,169,0.15)] cursor-pointer uppercase tracking-widest"
          >
            REGISTER TEAM (2 MEMBERS)
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/login"
            className="px-7 py-4 bg-[#0A0908] border border-[#26231F] text-[#E0D5C1] font-mono font-bold text-sm hover:border-[#D4C5A9] transition-all cursor-pointer uppercase tracking-wider"
          >
            ENTER EXISTING CASE
          </Link>
        </motion.div>

        {/* Period Case Dossier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 text-left max-w-4xl w-full font-mono">
          <div className="p-6 bg-[#0E0C0A] border-2 border-[#1C1915] relative group hover:border-[#26231F] transition-all">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1C1915]">
              <span className="text-xs font-bold text-white uppercase tracking-widest">ROUND 01 — 30 MINS</span>
              <span className="text-[10px] text-red-700 font-zodiac font-bold uppercase">CONFIDENTIAL</span>
            </div>
            <h3 className="text-base font-bold text-[#F5F2EB] uppercase">CIPHER DECRYPTION</h3>
            <p className="text-xs text-[#8C8275] mt-2 leading-relaxed font-sans">
              Investigate raw records containing decimal ASCII byte codes (e.g. <code className="text-[#D4C5A9] bg-black px-1">65 116 104 101 114</code>) and Hexadecimal strings. Convert raw numbers into plain text to discover company and product details.
            </p>
          </div>

          <div className="p-6 bg-[#0E0C0A] border-2 border-[#1C1915] relative group hover:border-[#26231F] transition-all">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1C1915]">
              <span className="text-xs font-bold text-white uppercase tracking-widest">ROUND 02 — LIVE DECAY</span>
              <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">₹2,000 PRIZE POOL</span>
            </div>
            <h3 className="text-base font-bold text-[#F5F2EB] uppercase">INCIDENT FORENSICS</h3>
            <p className="text-xs text-[#8C8275] mt-2 leading-relaxed font-sans">
              Investigate the failure cause and financial impact. The ₹2,000 prize pool decays continuously over time until your team locks the final answer.
            </p>
          </div>
        </div>
      </main>

      {/* Period Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-[#1C1915] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8C8275] z-20">
        <div>SFPD CASE ARCHIVE © 1969-2026 // COMPETITION CONTROL</div>
        <div className="font-zodiac text-red-900 text-sm mt-2 sm:mt-0 font-bold">
          "I hope you are having lots of fan in trying to catch me..."
        </div>
      </footer>

      {/* Info Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#D4C5A9] text-black border-4 border-black p-8 shadow-2xl relative font-serif"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1 bg-black text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'HOW_IT_WORKS' ? (
                <div>
                  <div className="border-b-2 border-black pb-3 mb-4">
                    <span className="text-xs font-mono font-bold text-black/70 uppercase tracking-widest">
                      ZODIAC DOSSIER BRIEF // SFPD HOMICIDE
                    </span>
                    <h3 className="text-2xl font-black font-mono text-black uppercase mt-1">
                      HOW THE INVESTIGATION WORKS
                    </h3>
                  </div>

                  <div className="space-y-4 font-mono text-xs sm:text-sm text-zinc-900 leading-relaxed">
                    <p>
                      Teams of <strong className="text-black">exactly 2 members</strong> register and are randomly assigned 1 of 5 confidential case files (20 teams total, ~4 teams per case).
                    </p>
                    <div className="p-4 bg-black text-white border-2 border-black">
                      <h4 className="text-xs font-mono font-bold text-[#D4C5A9] uppercase">ROUND 01: CIPHER IDENTIFICATION</h4>
                      <p className="mt-1 text-xs text-zinc-300">
                        Evidence documents contain ASCII byte sequences and Hexadecimal strings. Use the on-screen [ CIPHER HINT ] button for decoder instructions.
                      </p>
                    </div>
                    <div className="p-4 bg-black text-white border-2 border-black">
                      <h4 className="text-xs font-mono font-bold text-white uppercase">ROUND 02: INCIDENT FORENSIC</h4>
                      <p className="mt-1 text-xs text-zinc-300">
                        Investigate operational failure causes. The ₹2,000 prize pool decays live over time until your team locks the final answer.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="border-b-2 border-black pb-3 mb-4">
                    <span className="text-xs font-mono font-bold text-black/70 uppercase tracking-widest">
                      INVESTIGATION PROTOCOL // SFPD
                    </span>
                    <h3 className="text-2xl font-black font-mono text-black uppercase mt-1">
                      RULES & INTEGRITY
                    </h3>
                  </div>

                  <ul className="space-y-3 font-mono text-xs sm:text-sm text-zinc-900">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-black mt-0.5 shrink-0" />
                      <span>Case assignment is server-side and randomly assigned across 5 active case folders.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-black mt-0.5 shrink-0" />
                      <span>Round 1 answers accept decoded plain text or exact cipher string sequences.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-black mt-0.5 shrink-0" />
                      <span>Round 2 prize pool calculations run synchronously on central event server.</span>
                    </li>
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </ZodiacCipherTransition>
  );
}
