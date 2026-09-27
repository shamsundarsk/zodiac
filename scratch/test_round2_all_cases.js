const { evaluateRound2Answers } = require('../src/lib/grading-engine');
const { getRound2QuestionsForCase } = require('../src/lib/questions-data');

console.log('====================================================');
console.log('VERIFYING ALL FOUR ROUND 2 CASES & DETERMINISTIC GRADING');
console.log('====================================================\n');

const casesToTest = [
  { id: 'case-r2-hyundai', name: 'Hyundai Motor India' },
  { id: 'case-r2-eternal', name: 'Eternal Ltd (Zomato & Blinkit)' },
  { id: 'case-r2-cloudflare', name: 'Cloudflare' },
  { id: 'case-r2-dior', name: 'Dior' }
];

let allPassed = true;

casesToTest.forEach(({ id, name }) => {
  console.log(`--- Testing Case: ${name} (${id}) ---`);
  const questions = getRound2QuestionsForCase(id);
  console.log(`Loaded ${questions.length} questions.`);

  if (questions.length !== 12) {
    console.error(`FAIL: Expected 12 questions, found ${questions.length}`);
    allPassed = false;
    return;
  }

  // Test perfect answers
  const perfectAnswers = {};
  questions.forEach(q => {
    if (q.answer_type === 'MULTI_SELECT') {
      perfectAnswers[q.id] = (q.options || []).slice(0, 3);
    } else {
      perfectAnswers[q.id] = q.expected_answer;
    }
  });

  const evalResult = evaluateRound2Answers(id, perfectAnswers);
  console.log(`Perfect Submission Score: ${evalResult.percentage}% (${evalResult.totalScore}/${evalResult.maxPossibleScore} pts)`);
  if (evalResult.percentage !== 100) {
    console.error(`FAIL: Perfect answers did not achieve 100% score! Got ${evalResult.percentage}%`);
    allPassed = false;
  } else {
    console.log(`PASS: Perfect answers achieved 100% score.`);
  }

  // Test alias / case-insensitive variations
  const variantAnswers = {};
  questions.forEach(q => {
    if (q.answer_type === 'MULTI_SELECT') {
      variantAnswers[q.id] = (q.options || []).slice(0, 3);
    } else if (q.accepted_aliases && q.accepted_aliases.length > 0) {
      variantAnswers[q.id] = q.accepted_aliases[0];
    } else if (q.expected_answer) {
      variantAnswers[q.id] = q.expected_answer.toLowerCase();
    }
  });

  const variantEval = evaluateRound2Answers(id, variantAnswers);
  console.log(`Variant/Alias Submission Score: ${variantEval.percentage}% (${variantEval.totalScore}/${variantEval.maxPossibleScore} pts)`);
  if (variantEval.percentage < 90) {
    console.error(`WARN: Variant answers score lower than expected: ${variantEval.percentage}%`);
  } else {
    console.log(`PASS: Alias/Variant answers evaluated accurately.`);
  }

  console.log('\nQuestions breakdown check:');
  evalResult.breakdown.forEach(b => {
    console.log(`  [${b.questionId}] (${b.answerType}): "${b.questionText.slice(0, 45)}..." -> Expected: "${b.expectedAnswer}" [${b.isCorrect ? 'PASS' : 'FAIL'}]`);
  });
  console.log('----------------------------------------------------\n');
});

if (allPassed) {
  console.log('ALL FOUR ROUND 2 CASES TESTED & VERIFIED SUCCESSFULLY!');
} else {
  console.log('ONE OR MORE CASES FAILED VERIFICATION.');
  process.exit(1);
}
