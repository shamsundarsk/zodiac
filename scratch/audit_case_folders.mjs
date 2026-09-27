import fs from 'fs';
import path from 'path';

const caseFoldersDir = path.join(process.cwd(), 'case_folders');

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (!file.startsWith('.')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function auditRound(roundName) {
  const roundDir = path.join(caseFoldersDir, roundName);
  console.log(`\n==================================================`);
  console.log(`AUDIT FOR ${roundName.toUpperCase()}`);
  console.log(`==================================================`);

  if (!fs.existsSync(roundDir)) {
    console.log(`Directory ${roundDir} does not exist!`);
    return { total: 0, cases: {} };
  }

  const items = fs.readdirSync(roundDir);
  let totalFilesRound = 0;
  const casesSummary = {};

  items.forEach((item) => {
    const itemPath = path.join(roundDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const allFiles = getAllFiles(itemPath);
      const fileCount = allFiles.length;
      totalFilesRound += fileCount;

      const hasQuestions = allFiles.some(f => path.basename(f).toUpperCase() === 'QUESTIONS.TXT');
      const masterKeyFiles = allFiles.filter(f => path.basename(f).toUpperCase().includes('MASTER_KEY'));
      const evidenceFiles = allFiles.filter(f => {
        const bn = path.basename(f).toUpperCase();
        return !bn.includes('MASTER_KEY');
      });

      casesSummary[item] = {
        totalFiles: fileCount,
        questionsExists: hasQuestions,
        masterKeys: masterKeyFiles.map(f => path.relative(roundDir, f)),
        evidenceCount: evidenceFiles.length,
        filesList: allFiles.map(f => path.relative(roundDir, f))
      };

      console.log(`\nCase Folder: ${item}`);
      console.log(`  Total Files: ${fileCount}`);
      console.log(`  QUESTIONS.txt: ${hasQuestions ? 'YES' : 'NO'}`);
      console.log(`  Master Key Files (${masterKeyFiles.length}): ${masterKeyFiles.map(f => path.basename(f)).join(', ') || 'NONE'}`);
      console.log(`  Evidence Files Count: ${evidenceFiles.length}`);
    } else {
      // Loose files directly under round folder
      totalFilesRound += 1;
      console.log(`Loose File in ${roundName}: ${item}`);
    }
  });

  console.log(`\nTotal Files in ${roundName}: ${totalFilesRound}`);
  return { total: totalFilesRound, cases: casesSummary };
}

console.log("Starting Recursive Audit of original 'case_folders/'...");
const r1 = auditRound('round_1');
const r2 = auditRound('round_2');

console.log("\n==================================================");
console.log("DISCREPANCY RESOLUTION SUMMARY");
console.log("==================================================");
console.log(`Round 1 Total Files: ${r1.total}`);
console.log(`Round 2 Total Files: ${r2.total}`);
console.log(`Grand Total Files in case_folders/: ${r1.total + r2.total}`);
