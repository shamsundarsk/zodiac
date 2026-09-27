const { getQuestionsForCase, getCanonicalCaseId } = require('../src/lib/questions-engine');

console.log('====================================================');
console.log('STEP 15: AUTOMATED ISOLATION TEST FOR ALL 8 QUESTION SETS');
console.log('====================================================\n');

const testCases = [
  // Round 1
  { round: 1, caseId: 'case-r1-eternal', canonical: 'eternal', expectedKey: 'mystery company', forbiddenKey: 'first car launched in India' },
  { round: 1, caseId: 'case-r1-cf', canonical: 'cloudflare', expectedKey: '1.1.1.1', forbiddenKey: 'first car launched in India' },
  { round: 1, caseId: 'case-r1-dior', canonical: 'dior', expectedKey: 'fashion house', forbiddenKey: 'first car launched in India' },
  { round: 1, caseId: 'case-r1-hyundai', canonical: 'hyundai', expectedKey: 'first car launched in India', forbiddenKey: '1.1.1.1' },

  // Round 2
  { round: 2, caseId: 'case-r2-eternal', canonical: 'eternal', expectedKey: 'Quick commerce', forbiddenKey: 'TLE-02' },
  { round: 2, caseId: 'case-r2-cloudflare', canonical: 'cloudflare', expectedKey: 'bandwidth', forbiddenKey: 'TLE-02' },
  { round: 2, caseId: 'case-r2-dior', canonical: 'dior', expectedKey: 'Atelier', forbiddenKey: 'TLE-02' },
  { round: 2, caseId: 'case-r2-hyundai', canonical: 'hyundai', expectedKey: 'TLE-02', forbiddenKey: 'DDoS' }
];

let allPassed = true;

testCases.forEach(({ round, caseId, canonical, expectedKey, forbiddenKey }) => {
  const canonicalId = getCanonicalCaseId(caseId);
  console.log(`[TEST] Round ${round} x ${caseId} (Canonical: ${canonicalId})`);

  if (canonicalId !== canonical) {
    console.error(`  [FAIL] Expected canonical ID '${canonical}', got '${canonicalId}'`);
    allPassed = false;
    return;
  }

  const questions = getQuestionsForCase(caseId, round);
  console.log(`  Question Count: ${questions.length}`);

  if (questions.length !== 12) {
    console.error(`  [FAIL] Expected exactly 12 questions, got ${questions.length}`);
    allPassed = false;
    return;
  }

  const allText = questions.map(q => q.question || q.text || '').join(' ');
  const hasExpected = allText.toLowerCase().includes(expectedKey.toLowerCase());
  const hasForbidden = allText.toLowerCase().includes(forbiddenKey.toLowerCase());

  if (!hasExpected) {
    console.error(`  [FAIL] Expected key phrase '${expectedKey}' not found in question set!`);
    allPassed = false;
  } else {
    console.log(`  [PASS] Expected key phrase '${expectedKey}' verified in question set.`);
  }

  if (hasForbidden) {
    console.error(`  [FAIL] CROSS-CASE LEAKAGE DETECTED! Forbidden key phrase '${forbiddenKey}' found in question set!`);
    allPassed = false;
  } else {
    console.log(`  [PASS] Zero cross-case leakage verified (No '${forbiddenKey}').`);
  }

  console.log('---');
});

if (allPassed) {
  console.log('\nALL 8 QUESTION SETS VERIFIED WITH PERFECT CASE ISOLATION & ZERO LEAKAGE!');
} else {
  console.error('\nONE OR MORE QUESTION SETS FAILED ISOLATION TEST!');
  process.exit(1);
}
