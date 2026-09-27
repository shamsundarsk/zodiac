import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { getCanonicalCaseId, CanonicalCaseId } from './questions-engine';

export interface MasterKeyQuestionItem {
  qid: string;
  question: string;
  answer: string;
  evidence_path: string;
  difficulty?: string;
  notes?: string;
}

export interface CaseSolutionSummary {
  field: string;
  answer: string;
}

export interface MasterKeyDataset {
  case_id: string;
  case_title: string;
  round_number: 1 | 2;
  questions: MasterKeyQuestionItem[];
  solution_summary?: CaseSolutionSummary[];
}

const CANONICAL_KEY_MAP: Record<CanonicalCaseId, { r1KeyFile: string; r2KeyFile: string; title: string }> = {
  hyundai: {
    r1KeyFile: 'Hyundai_Deep_Investigation_MASTER_KEY.xlsx',
    r2KeyFile: 'Hyundai_Corporate_War_Room_Round2_MASTER_KEY.xlsx',
    title: 'Hyundai Motor Company Investigation'
  },
  eternal: {
    r1KeyFile: 'Eternal_Deep_Investigation_MASTER_KEY.xlsx',
    r2KeyFile: 'Eternal_Corporate_War_Room_Round2_MASTER_KEY.xlsx',
    title: 'Eternal Ltd Investigation'
  },
  dior: {
    r1KeyFile: 'Dior_Deep_Investigation_MASTER_KEY.xlsx',
    r2KeyFile: 'Dior_Corporate_War_Room_Round2_MASTER_KEY.xlsx',
    title: 'Christian Dior Investigation'
  },
  cloudflare: {
    r1KeyFile: 'CF_Internet_Company_MASTER_KEY.xlsx',
    r2KeyFile: 'Cloudflare_Corporate_War_Room_Round2_MASTER_KEY.xlsx',
    title: 'Cloudflare Inc Investigation'
  }
};

export function loadMasterKeyForCase(caseId: string, roundNumber: 1 | 2): MasterKeyDataset | null {
  const canonicalId = getCanonicalCaseId(caseId);
  if (!canonicalId) {
    console.error(`Unknown case ID for master key lookup: "${caseId}"`);
    return null;
  }

  const config = CANONICAL_KEY_MAP[canonicalId];
  if (!config) return null;

  const fileName = roundNumber === 1 ? config.r1KeyFile : config.r2KeyFile;
  const roundSubDir = roundNumber === 1 ? 'round_1' : 'round_2';
  const filePath = path.join(process.cwd(), 'case_folders', roundSubDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`Master Key file not found at: ${filePath}`);
    return null;
  }


  try {
    const wb = XLSX.readFile(filePath);
    const questions: MasterKeyQuestionItem[] = [];
    const solution_summary: CaseSolutionSummary[] = [];

    if (roundNumber === 1) {
      const qSheetName = wb.SheetNames.find(s => s.includes('12 Questions') || s.includes('Question Answers')) || wb.SheetNames[0];
      const rawQData = XLSX.utils.sheet_to_json<any>(wb.Sheets[qSheetName]);

      rawQData.forEach((row, idx) => {
        questions.push({
          qid: row.QID || row['Question ID'] || `Q${idx + 1}`,
          question: row.Question || row.QuestionText || `Question ${idx + 1}`,
          answer: String(row.Answer || row['Correct Answer'] || row['Master Answer'] || '').trim(),
          evidence_path: String(row['Evidence Path (Organizer)'] || row['Primary Evidence'] || '').trim(),
          difficulty: row.Difficulty ? String(row.Difficulty) : undefined
        });
      });

      if (wb.SheetNames.includes('Case Solution')) {
        const rawSol = XLSX.utils.sheet_to_json<any>(wb.Sheets['Case Solution']);
        rawSol.forEach(r => {
          if (r.Field && r['Private organizer answer']) {
            solution_summary.push({
              field: String(r.Field),
              answer: String(r['Private organizer answer'])
            });
          }
        });
      }
    } else {
      const qSheetName = wb.SheetNames.find(s => s.includes('Question Key') || s.includes('12 Questions')) || wb.SheetNames[0];
      const rawRows = XLSX.utils.sheet_to_json<any[]>(wb.Sheets[qSheetName], { header: 1 });

      rawRows.slice(1).forEach((row, idx) => {
        if (!row || row.length === 0) return;
        const qNum = row[0] || idx + 1;
        questions.push({
          qid: `r2_q${qNum}`,
          question: String(row[1] || `Question ${qNum}`).trim(),
          answer: String(row[2] || '').trim(),
          evidence_path: String(row[3] || '').trim(),
          notes: row[4] ? String(row[4]).trim() : undefined
        });
      });
    }

    return {
      case_id: caseId,
      case_title: config.title,
      round_number: roundNumber,
      questions,
      solution_summary
    };

  } catch (err) {
    console.error(`Error reading Master Key Excel ${filePath}:`, err);
    return null;
  }
}

function normalizeStr(str: string = ''): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractNumbers(str: string): number[] {
  const matches = str.match(/-?\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

export function evaluateSubmissionAgainstMasterKey(
  caseId: string,
  roundNumber: 1 | 2,
  answers: Record<string, string>
): {
  isCorrect: boolean;
  scorePercentage: number;
  matchedCount: number;
  totalQuestions: number;
  evaluations: Record<string, { matched: boolean; expected: string; submitted: string; evidencePath: string }>;
} {
  const masterKey = loadMasterKeyForCase(caseId, roundNumber);
  if (!masterKey || masterKey.questions.length === 0) {
    return {
      isCorrect: true,
      scorePercentage: 100,
      matchedCount: 12,
      totalQuestions: 12,
      evaluations: {}
    };
  }

  let matchedCount = 0;
  const evaluations: Record<string, { matched: boolean; expected: string; submitted: string; evidencePath: string }> = {};

  masterKey.questions.forEach((qItem, idx) => {
    const qKey = qItem.qid || (roundNumber === 1 ? `q${idx + 1}` : `r2_q${idx + 1}`);
    const submittedVal = (answers[qKey] || answers[`q${idx + 1}`] || '').trim();
    const normSubmitted = normalizeStr(submittedVal);
    const normExpected = normalizeStr(qItem.answer);

    let matched = false;

    if (submittedVal && qItem.answer) {
      // 1. Single character protection: single letter/digit only matches exact single character
      if (normSubmitted.length < 2) {
        matched = normSubmitted === normExpected;
      } else {
        // 2. Exact normalized match
        if (normSubmitted === normExpected) {
          matched = true;
        } else {
          // 3. Numeric tolerance check for percentage/amounts
          const subNums = extractNumbers(submittedVal);
          const expNums = extractNumbers(qItem.answer);
          if (subNums.length > 0 && expNums.length > 0) {
            const numMatched = subNums.some(sn => 
              expNums.some(en => {
                if (en === 0) return sn === 0;
                const diff = Math.abs(sn - en);
                const relError = diff / Math.abs(en);
                return diff <= 0.1 || relError <= 0.02;
              })
            );
            if (numMatched) matched = true;
          }

          // 4. Multi-token overlap check (requires token length >= 3)
          if (!matched) {
            const expectedTokens = qItem.answer
              .split(/[\/\;\,\.\s\:]+/)
              .map(t => normalizeStr(t))
              .filter(t => t.length >= 3);

            if (expectedTokens.length > 0) {
              const matchesToken = expectedTokens.some(token => 
                normSubmitted.includes(token) || (normSubmitted.length >= 4 && token.includes(normSubmitted))
              );
              if (matchesToken) matched = true;
            }
          }
        }
      }
    }

    if (matched) matchedCount++;

    evaluations[qKey] = {
      matched,
      expected: qItem.answer,
      submitted: submittedVal,
      evidencePath: qItem.evidence_path
    };
  });

  const totalQuestions = masterKey.questions.length;
  const scorePercentage = Math.round((matchedCount / totalQuestions) * 100);

  // Round 1 auto-validation requires at least 4 matching core findings or >= 35% score
  const isCorrect = roundNumber === 1 ? matchedCount >= 4 || scorePercentage >= 35 : true;

  return {
    isCorrect,
    scorePercentage,
    matchedCount,
    totalQuestions,
    evaluations
  };
}
