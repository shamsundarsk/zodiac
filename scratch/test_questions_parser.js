const fs = require('fs');
const path = require('path');

const CANONICAL_CASE_MAP = {
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

function parseR1QuestionsFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File NOT found: ${fullPath}`);
    return [];
  }
  const text = fs.readFileSync(fullPath, 'utf8');
  const lines = text.split('\n');
  const questions = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    const match = line.match(/^\s*(\d+)\.\s*(.+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 12) {
        questions.push({
          id: `q${num}`,
          num,
          question: match[2].trim(),
          placeholder: `Enter finding for Q${num}...`,
          type: num === 7 || num === 12 ? 'textarea' : 'text',
          answer_type: num === 7 || num === 12 ? 'OPEN_ENDED' : 'SHORT_TEXT'
        });
      }
    }
  }

  return questions;
}

console.log('Testing Round 1 Questions Parsing for all 4 cases:\n');
Object.entries(CANONICAL_CASE_MAP).forEach(([caseKey, info]) => {
  const qs = parseR1QuestionsFile(info.r1File);
  console.log(`Case: ${caseKey} (${info.name}) -> Questions Count: ${qs.length}`);
  if (qs.length === 12) {
    console.log(`  [PASS] First Q: "${qs[0].question}"`);
    console.log(`  [PASS] Last Q: "${qs[11].question}"`);
  } else {
    console.error(`  [FAIL] Expected 12 questions, got ${qs.length}`);
  }
  console.log('---');
});
