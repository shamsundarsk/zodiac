import fs from 'fs';
import path from 'path';
import { QuestionItem, getRound2QuestionsForCase } from './questions-data';

export type { QuestionItem };

export type CanonicalCaseId = 'hyundai' | 'eternal' | 'dior' | 'cloudflare';

const CANONICAL_CASE_MAP: Record<CanonicalCaseId, {
  name: string;
  r1File: string;
}> = {
  hyundai: {
    name: 'Hyundai Motor India',
    r1File: 'case_folders/round_1/Hyndai_Automobile_PARTICIPANT/QUESTIONS.txt'
  },
  eternal: {
    name: 'Eternal Ltd (Zomato & Blinkit)',
    r1File: 'case_folders/round_1/Eternal_Deep_Investigation_PARTICIPANT/QUESTIONS.txt'
  },
  dior: {
    name: 'Christian Dior',
    r1File: 'case_folders/round_1/Dior_Deep_Investigation_PARTICIPANT/QUESTIONS.txt'
  },
  cloudflare: {
    name: 'Cloudflare Inc',
    r1File: 'case_folders/round_1/CF_Internet_Company_PARTICIPANT/QUESTIONS.txt'
  }
};

/**
 * Resolves any case ID string (e.g. 'case-01', 'case-r1-hyundai', 'case-r1-cf', 'dior') 
 * into a strict canonical case ID: 'hyundai' | 'eternal' | 'dior' | 'cloudflare'.
 * Returns null if no canonical match is found.
 */
export function getCanonicalCaseId(caseId: string): CanonicalCaseId | null {
  if (!caseId) return null;
  const norm = caseId.trim().toLowerCase();

  if (norm === 'hyundai' || norm.includes('hyndai') || norm.includes('hyundai') || norm === 'case-01' || norm === 'case-r1-hyundai' || norm === 'case-r2-hyundai' || norm === 'case-r2-01') {
    return 'hyundai';
  }
  if (norm === 'eternal' || norm.includes('eternal') || norm === 'case-02' || norm === 'case-r1-eternal' || norm === 'case-r2-eternal') {
    return 'eternal';
  }
  if (norm === 'dior' || norm.includes('dior') || norm === 'case-03' || norm === 'case-r1-dior' || norm === 'case-r2-dior') {
    return 'dior';
  }
  if (norm === 'cloudflare' || norm.includes('cloudflare') || norm.includes('cf') || norm === 'case-04' || norm === 'case-r1-cf' || norm === 'case-r2-cloudflare') {
    return 'cloudflare';
  }

  return null;
}

/**
 * Loads exact 12 questions for a specific case and round from authoritative sources.
 * Returns empty array [] if case ID is invalid or file missing — NEVER falls back to Hyundai.
 */
export function getQuestionsForCase(caseId: string, roundNumber: 1 | 2): QuestionItem[] {
  const canonicalId = getCanonicalCaseId(caseId);
  if (!canonicalId) {
    console.error(`Invalid case ID for question lookup: "${caseId}"`);
    return [];
  }

  // ROUND 2
  if (roundNumber === 2) {
    const r2Questions = getRound2QuestionsForCase(canonicalId);
    if (!r2Questions || r2Questions.length !== 12) {
      console.error(`Round 2 question lookup failed for canonical case: ${canonicalId}`);
      return [];
    }
    return r2Questions;
  }

  // ROUND 1: Parse actual QUESTIONS.txt from case folder
  const caseConfig = CANONICAL_CASE_MAP[canonicalId];
  if (!caseConfig || !caseConfig.r1File) {
    console.error(`No R1 config found for canonical case: ${canonicalId}`);
    return [];
  }

  const fullPath = path.join(process.cwd(), caseConfig.r1File);
  if (!fs.existsSync(fullPath)) {
    console.error(`QUESTIONS.txt file missing at path: ${fullPath}`);
    return [];
  }

  try {
    const text = fs.readFileSync(fullPath, 'utf8');
    const lines = text.split('\n');
    const questions: QuestionItem[] = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const match = line.match(/^\s*(\d+)\.\s*(.+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= 12) {
          const qId = `q${num}`;
          const isTextarea = num === 7 || num === 12;

          questions.push({
            id: qId,
            num,
            question: match[2].trim(),
            placeholder: `Enter finding for Q${num}...`,
            type: isTextarea ? 'textarea' : 'text',
            answer_type: isTextarea ? 'OPEN_ENDED' : 'SHORT_TEXT'
          });
        }
      }
    }

    if (questions.length !== 12) {
      console.error(`Parsed ${questions.length} questions from ${fullPath} (Expected 12).`);
      return [];
    }

    return questions;

  } catch (err) {
    console.error(`Failed to parse QUESTIONS.txt for ${canonicalId}:`, err);
    return [];
  }
}
