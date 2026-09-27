import fs from 'fs';
import path from 'path';
import { evaluateSubmissionAgainstMasterKey } from '../src/lib/master-key-engine.ts';

const testInputs = [
  { answers: { Q1: "" }, label: "Empty string" },
  { answers: { Q1: "a" }, label: "Single char 'a'" },
  { answers: { Q1: "Hyundai Motor Company" }, label: "Exact 'Hyundai Motor Company'" },
  { answers: { Q1: "hyundai motor company" }, label: "Lowercase 'hyundai motor company'" },
  { answers: { Q1: " HYUNDAI MOTOR COMPANY " }, label: "Whitespace ' HYUNDAI MOTOR COMPANY '" },
  { answers: { Q11: "1967" }, label: "Exact '1967'" },
  { answers: { Q1: "random text" }, label: "Random text" },
  { answers: { Q1: "almost correct answer" }, label: "Almost correct" }
];

console.log("==================================================");
console.log("9. SCORING SECURITY DETAILED TEST");
console.log("==================================================");

testInputs.forEach(t => {
  const result = evaluateSubmissionAgainstMasterKey('case-r1-hyundai', 1, t.answers);
  const qKey = Object.keys(t.answers)[0];
  const evalItem = result.evaluations[qKey];
  console.log(`Test [${t.label}] (input: "${t.answers[qKey]}") -> ${qKey} Matched: ${evalItem?.matched} (Expected: "${evalItem?.expected}")`);
});

