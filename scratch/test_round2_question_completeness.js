const path = require('path');
const {
  HYUNDAI_R2_QUESTIONS,
  ETERNAL_R2_QUESTIONS,
  CLOUDFLARE_R2_QUESTIONS,
  DIOR_R2_QUESTIONS,
  getRound2QuestionsForCase
} = require('../src/lib/questions-data');

const cases = [
  { id: 'hyundai', name: 'HYUNDAI', list: HYUNDAI_R2_QUESTIONS },
  { id: 'eternal', name: 'ETERNAL', list: ETERNAL_R2_QUESTIONS },
  { id: 'cloudflare', name: 'CLOUDFLARE', list: CLOUDFLARE_R2_QUESTIONS },
  { id: 'dior', name: 'DIOR', list: DIOR_R2_QUESTIONS }
];

let hasErrors = false;

console.log('========================================================');
console.log('ROUND 2 QUESTION COMPLETENESS TEST');
console.log('========================================================\n');

for (const c of cases) {
  console.log(`--- CASE: ${c.name} ---`);
  const questionsFromEngine = getRound2QuestionsForCase(c.id);

  if (!questionsFromEngine || questionsFromEngine.length !== 12) {
    console.error(`❌ ERROR: Case ${c.name} does not have exactly 12 questions! Count: ${questionsFromEngine ? questionsFromEngine.length : 0}`);
    hasErrors = true;
    continue;
  }

  questionsFromEngine.forEach((q, idx) => {
    const qId = q.id;
    const qText = q.question || q.text;
    const qExpected = q.expected_answer !== undefined ? q.expected_answer : q.expectedAnswer;
    const qType = q.type || q.answer_type;
    const qMarks = q.marks;

    console.log(`CASE: ${c.name}`);
    console.log(`QUESTION ID: ${qId}`);
    console.log(`QUESTION TEXT: ${qText}`);
    console.log(`EXPECTED ANSWER: ${Array.isArray(qExpected) ? JSON.stringify(qExpected) : qExpected}`);
    console.log(`TYPE: ${qType}`);
    console.log(`MARKS: ${qMarks}\n`);

    if (!qId) {
      console.error(`❌ ERROR in ${c.name} Q${idx+1}: Question ID is missing!`);
      hasErrors = true;
    }
    if (!qText || qText.trim() === '' || qText === 'undefined') {
      console.error(`❌ ERROR in ${c.name} ${qId}: Question text is empty or undefined!`);
      hasErrors = true;
    }
    if (qExpected === undefined || qExpected === '' || qExpected === null || (typeof qExpected === 'string' && qExpected.trim() === '')) {
      console.error(`❌ ERROR in ${c.name} ${qId}: Expected answer is empty or undefined!`);
      hasErrors = true;
    }
    if (!qType) {
      console.error(`❌ ERROR in ${c.name} ${qId}: Question type is missing!`);
      hasErrors = true;
    }
    if (qMarks === undefined || qMarks === null) {
      console.error(`❌ ERROR in ${c.name} ${qId}: Question marks is missing!`);
      hasErrors = true;
    }
  });
}

if (hasErrors) {
  console.error('\n❌ TEST FAILED: Round 2 questions contain empty/invalid/undefined values!');
  process.exit(1);
} else {
  console.log('\n✅ TEST PASSED: All 48 Round 2 questions (4 cases x 12 questions) are 100% complete with text, answers, types, and marks!');
  process.exit(0);
}
