import fs from 'fs';
import path from 'path';

export interface QuestionItem {
  id: string;
  num: number;
  question: string;
  placeholder: string;
  type: "text" | "textarea";
}

const CASE_QUESTIONS_FILE_MAP: Record<string, { r1: string; r2: string }> = {
  'case-r1-hyundai': {
    r1: 'case_folders/round_1/Hyndai_Automobile_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)/QUESTIONS.txt'
  },
  'case-r1-eternal': {
    r1: 'case_folders/round_1/Eternal_Deep_Investigation_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Eternal_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  },
  'case-r1-dior': {
    r1: 'case_folders/round_1/Dior_Deep_Investigation_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Dior_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  },
  'case-r1-cf': {
    r1: 'case_folders/round_1/CF_Internet_Company_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Cloudflare_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  },
  // Aliases for initial case IDs
  'case-01': {
    r1: 'case_folders/round_1/Hyndai_Automobile_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)/QUESTIONS.txt'
  },
  'case-02': {
    r1: 'case_folders/round_1/Eternal_Deep_Investigation_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Eternal_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  },
  'case-03': {
    r1: 'case_folders/round_1/Dior_Deep_Investigation_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Dior_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  },
  'case-04': {
    r1: 'case_folders/round_1/CF_Internet_Company_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Cloudflare_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  },
  'case-r2-01': {
    r1: 'case_folders/round_1/Hyndai_Automobile_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)/QUESTIONS.txt'
  },
  'case-r2-hyundai': {
    r1: 'case_folders/round_1/Hyndai_Automobile_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)/QUESTIONS.txt'
  },
  'case-r2-eternal': {
    r1: 'case_folders/round_1/Eternal_Deep_Investigation_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Eternal_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  },
  'case-r2-dior': {
    r1: 'case_folders/round_1/Dior_Deep_Investigation_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Dior_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  },
  'case-r2-cloudflare': {
    r1: 'case_folders/round_1/CF_Internet_Company_PARTICIPANT/QUESTIONS.txt',
    r2: 'case_folders/round_2/Cloudflare_Corporate_War_Room_Round2_PARTICIPANT/QUESTIONS.txt'
  }
};

export function getQuestionsForCase(caseId: string, roundNumber: 1 | 2): QuestionItem[] {
  const normCaseId = (caseId || 'case-r1-hyundai').toLowerCase();
  const config = CASE_QUESTIONS_FILE_MAP[normCaseId] || CASE_QUESTIONS_FILE_MAP['case-r1-hyundai'];
  const relPath = roundNumber === 1 ? config.r1 : config.r2;
  const fullPath = path.join(process.cwd(), relPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`QUESTIONS.txt not found at ${fullPath}`);
    return [];
  }

  try {
    const text = fs.readFileSync(fullPath, 'utf8');
    const lines = text.split('\n');
    const questions: QuestionItem[] = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const match = line.match(/^(?:Q|q)?(\d+)\.\s*(.+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 1 && num <= 12) {
          const qId = roundNumber === 1 ? `q${num}` : `r2_q${num}`;
          const isTextarea = num === 7 || num === 12 || line.toLowerCase().includes('describe') || line.toLowerCase().includes('assessment') || line.toLowerCase().includes('weaknesses');
          
          questions.push({
            id: qId,
            num,
            question: line,
            placeholder: `Enter finding for Q${num}...`,
            type: isTextarea ? 'textarea' : 'text'
          });
        }
      }
    }

    return questions;
  } catch (err) {
    console.error(`Error reading QUESTIONS.txt from ${fullPath}:`, err);
    return [];
  }
}
