"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FolderType } from '@/lib/types';
import { Folder, FolderOpen } from 'lucide-react';

interface FolderCardProps {
  name: string;
  folder_type: FolderType;
  item_count: number;
  last_modified: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const WeirdFolderCard: React.FC<FolderCardProps> = ({
  name,
  item_count,
  isSelected = false,
  onClick
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group cursor-pointer p-4 border transition-all duration-150 flex flex-col justify-between select-none ${
        isSelected
          ? 'bg-zinc-900 border-white text-white shadow-lg'
          : 'bg-black border-zinc-800 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-950'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {isSelected ? (
            <FolderOpen className="w-5 h-5 text-white shrink-0" />
          ) : (
            <Folder className="w-5 h-5 text-zinc-400 group-hover:text-white shrink-0 transition-colors" />
          )}
          <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider truncate">
            {name}
          </h3>
        </div>

        <span className={`text-[10px] font-mono px-2 py-0.5 border shrink-0 tracking-widest ${
          isSelected
            ? 'bg-white text-black font-bold border-white'
            : 'bg-zinc-950 text-zinc-400 border-zinc-800 group-hover:border-zinc-700'
        }`}>
          {item_count} ITEMS
        </span>
      </div>
    </motion.div>
  );
};
