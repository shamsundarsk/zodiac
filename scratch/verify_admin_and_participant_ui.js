const http = require('http');

async function main() {
  const {
    HYUNDAI_R2_QUESTIONS,
    ETERNAL_R2_QUESTIONS,
    CLOUDFLARE_R2_QUESTIONS,
    DIOR_R2_QUESTIONS
  } = require('../src/lib/questions-data');

  console.log('--- ADMIN ANSWER KEYS DATA CHECK ---');
  const allKeys = {
    'case-r2-hyundai': HYUNDAI_R2_QUESTIONS,
    'case-r2-eternal': ETERNAL_R2_QUESTIONS,
    'case-r2-cloudflare': CLOUDFLARE_R2_QUESTIONS,
    'case-r2-dior': DIOR_R2_QUESTIONS
  };

  for (const [key, qList] of Object.entries(allKeys)) {
    console.log(`\nChecking ${key} (${qList.length} questions):`);
    if (qList.length !== 12) {
      console.error(`❌ ERROR: ${key} does not have 12 questions!`);
      process.exit(1);
    }
    qList.forEach((q, i) => {
      const qText = q.question || q.text;
      const qExp = q.expected_answer !== undefined ? q.expected_answer : q.expectedAnswer;
      console.log(`  [Q${i+1}] ID: ${q.id} | TEXT: "${qText}" | EXPECTED: "${Array.isArray(qExp) ? qExp.join(', ') : qExp}"`);

      if (!qText) throw new Error(`Empty text at Q${i+1} in ${key}`);
      if (qExp === undefined || qExp === null || qExp === '') throw new Error(`Empty answer at Q${i+1} in ${key}`);
    });
  }

  console.log('\n✅ ADMIN ANSWER KEYS DATA PASSED: 100% complete.');
}

main().catch(err => {
  console.error('❌ CHECK FAILED:', err);
  process.exit(1);
});
