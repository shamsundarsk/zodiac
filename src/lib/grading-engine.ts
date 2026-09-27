import { QuestionItem, getRound2QuestionsForCase } from './questions-data';

export interface EvaluationResult {
  score: number;
  maxScore: number;
  scorePercentage: number;
  totalScore?: number;
  maxPossibleScore?: number;
  percentage?: number;
  isCorrect: boolean;
  evaluations: Record<string, {
    matched: boolean;
    pointsScored: number;
    maxPoints: number;
    expected: string;
    submitted: any;
    feedback?: string;
  }>;
  breakdown?: any[];
}

function normalizeString(str: any): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function extractNumber(str: any): number | null {
  if (typeof str === 'number') return str;
  if (!str) return null;
  const match = String(str).match(/-?\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

export function evaluateRound2Answers(
  caseId: string,
  answers: Record<string, any>
): EvaluationResult {
  const questions = getRound2QuestionsForCase(caseId);
  let totalScored = 0;
  let totalMax = 0;

  const breakdown: any[] = [];
  const evaluations: Record<string, {
    matched: boolean;
    pointsScored: number;
    maxPoints: number;
    expected: string;
    submitted: any;
    feedback?: string;
  }> = {};

  questions.forEach((q) => {
    const qKey = q.id;
    const submittedRaw = answers[qKey] ?? answers[`q${q.num}`] ?? answers[q.num] ?? '';
    let matched = false;
    let points = 0;
    const maxPoints = q.answer_type === 'MULTI_SELECT' ? (q.max_choices || q.maxSelect || q.marks || 3) : (q.marks || 1);
    totalMax += maxPoints;

    if (q.answer_type === 'MULTI_SELECT') {
      let selectedOptions: string[] = [];
      if (Array.isArray(submittedRaw)) {
        selectedOptions = submittedRaw.map(s => String(s).trim());
      } else if (typeof submittedRaw === 'string') {
        try {
          const parsed = JSON.parse(submittedRaw);
          if (Array.isArray(parsed)) selectedOptions = parsed.map(s => String(s).trim());
          else selectedOptions = submittedRaw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
        } catch (e) {
          selectedOptions = submittedRaw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
        }
      }

      const validOptions = (q.options || []).map(opt => normalizeString(opt));
      const chosenValid = selectedOptions.filter(opt => validOptions.includes(normalizeString(opt)));
      points = Math.min(chosenValid.length, maxPoints);
      matched = points === maxPoints;
      totalScored += points;

      evaluations[qKey] = {
        matched,
        pointsScored: points,
        maxPoints,
        expected: q.expected_answer || String(q.expectedAnswer || ''),
        submitted: selectedOptions,
        feedback: `Selected ${points} of ${maxPoints} valid evidence-backed weaknesses.`
      };

    } else if (q.answer_type === 'PERCENTAGE' || q.answer_type === 'NUMBER' || q.answer_type === 'CURRENCY') {
      const subNum = extractNumber(submittedRaw);
      const expNum = extractNumber(q.expected_answer || String(q.expectedAnswer || ''));
      const aliasNums = ((q.accepted_aliases || q.acceptedAliases) || []).map(a => extractNumber(a)).filter((n): n is number => n !== null);

      if (subNum !== null) {
        const allTargetNums = expNum !== null ? [expNum, ...aliasNums] : aliasNums;
        matched = allTargetNums.some(target => {
          if (target === 0) return subNum === 0;
          const diff = Math.abs(subNum - target);
          const relError = diff / Math.abs(target);
          return diff <= 0.15 || relError <= 0.03;
        });
      }

      if (!matched && submittedRaw) {
        const normSub = normalizeString(submittedRaw);
        const normExp = normalizeString(q.expected_answer || String(q.expectedAnswer || ''));
        const normAliases = ((q.accepted_aliases || q.acceptedAliases) || []).map(normalizeString);
        matched = normSub === normExp || normAliases.includes(normSub);
      }

      points = matched ? 1 : 0;
      totalScored += points;

      evaluations[qKey] = {
        matched,
        pointsScored: points,
        maxPoints: 1,
        expected: q.expected_answer || String(q.expectedAnswer || ''),
        submitted: submittedRaw
      };

    } else {
      // CODE, COMPANY, PERSON, LOCATION, SHORT_TEXT, OPEN_ENDED
      const normSub = normalizeString(submittedRaw);
      const normExp = normalizeString(q.expected_answer || String(q.expectedAnswer || ''));
      const normAliases = ((q.accepted_aliases || q.acceptedAliases) || []).map(normalizeString);

      if (normSub) {
        matched = normSub === normExp || normAliases.includes(normSub);
        if (!matched && normSub.length >= 3) {
          matched = normExp.includes(normSub) || normAliases.some(a => a.includes(normSub) || normSub.includes(a));
        }
      }

      points = matched ? (q.marks || 1) : 0;
      totalScored += points;

      evaluations[qKey] = {
        matched,
        pointsScored: points,
        maxPoints: q.marks || 1,
        expected: q.expected_answer || String(q.expectedAnswer || ''),
        submitted: submittedRaw
      };

      breakdown.push({
        questionId: q.id.toUpperCase(),
        questionText: q.question || q.text || '',
        submittedAnswer: submittedRaw,
        expectedAnswer: String(q.expected_answer || q.expectedAnswer || ''),
        isCorrect: matched,
        marksAwarded: points,
        maxMarks: q.marks || 1,
        answerType: q.answer_type || q.type || 'SHORT_TEXT'
      });
    }
  });

  const scorePercentage = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0;

  return {
    totalScore: totalScored,
    maxPossibleScore: totalMax,
    percentage: scorePercentage,
    score: totalScored,
    maxScore: totalMax,
    scorePercentage,
    isCorrect: scorePercentage >= 25,
    evaluations,
    breakdown
  };
}
