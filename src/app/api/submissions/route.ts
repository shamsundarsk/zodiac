import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { broadcastStateChange } from '@/lib/realtime-broadcaster';
import { evaluateSubmissionAgainstMasterKey } from '@/lib/master-key-engine';
import { evaluateRound2Answers } from '@/lib/grading-engine';
import { getAuthSession } from '@/lib/auth-session';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  const { searchParams } = new URL(request.url);
  const requestedTeamCode = searchParams.get('team_code');

  if (requestedTeamCode) {
    if (session?.role !== 'ADMIN' && session?.team_code.toLowerCase() !== requestedTeamCode.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Forbidden: Cannot access another team\'s submissions' }, { status: 403 });
    }
    const submissions = await db.getTeamSubmissions(requestedTeamCode);
    return NextResponse.json({ success: true, submissions });
  }

  // Admin access to all submissions
  if (session?.role !== 'ADMIN') {
    if (session?.team_code) {
      const submissions = await db.getTeamSubmissions(session.team_code);
      return NextResponse.json({ success: true, submissions });
    }
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const allSubmissions = await db.getSubmissions();
  return NextResponse.json({ success: true, submissions: allSubmissions });
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session || !session.team_code) {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
    }

    const team_code = session.team_code.toUpperCase();
    const body = await request.json();
    const { round_number, answers } = body;

    if (!round_number || !answers) {
      return NextResponse.json({ success: false, message: 'Missing required submission fields' }, { status: 400 });
    }

    const eventState = await db.getEventState();
    const team = await db.getTeamByCode(team_code);
    if (!team) {
      return NextResponse.json({ success: false, message: 'Team record not found' }, { status: 404 });
    }

    const existingTeamSubs = (await db.getTeamSubmissions(team_code)).filter(s => s.round_number === round_number);
    const attemptNumber = existingTeamSubs.length + 1;

    // Verify Round state
    if (round_number === 1 && eventState.round1_status !== 'ACTIVE') {
      return NextResponse.json({ success: false, message: 'Round 01 is not active.' }, { status: 400 });
    }

    if (round_number === 2 && eventState.round2_status !== 'ACTIVE') {
      return NextResponse.json({ success: false, message: 'Round 02 is not active.' }, { status: 400 });
    }

    const assignedCaseId = round_number === 1
      ? (team.assigned_case_id_r1 || 'case-r1-hyundai')
      : (team.assigned_case_id_r2 || 'case-r2-hyundai');

    // ROUND 1 SUBMISSION
    if (round_number === 1) {
      const evaluation = evaluateSubmissionAgainstMasterKey(assignedCaseId, 1, answers);
      const isCorrect = evaluation.isCorrect;
      const timeTakenSec = eventState.round1_start_time 
        ? Math.floor((Date.now() - new Date(eventState.round1_start_time).getTime()) / 1000)
        : 0;

      const submission = await db.addSubmission({
        team_id: team.id,
        team_code: team.team_code,
        round_number: 1,
        answers,
        is_correct: isCorrect,
        score: evaluation.scorePercentage,
        status: isCorrect ? 'ACCEPTED' : 'REJECTED',
        remaining_prize: 0,
        attempt_number: attemptNumber,
        time_taken_seconds: timeTakenSec
      });

      await db.logAudit(
        team.team_code,
        isCorrect ? 'R1_SUBMISSION_ACCEPTED' : 'R1_SUBMISSION_REJECTED',
        `Attempt #${attemptNumber} for Round 01: Score ${evaluation.scorePercentage}% (${evaluation.matchedCount}/${evaluation.totalQuestions} matches).`
      );

      broadcastStateChange({ type: 'SUBMISSION', team_code: team.team_code, round_number: 1 });

      return NextResponse.json({
        success: true,
        is_correct: isCorrect,
        score_percentage: evaluation.scorePercentage,
        matched_count: evaluation.matchedCount,
        total_questions: evaluation.totalQuestions,
        attempt_number: attemptNumber,
        message: isCorrect ? 'CASE IDENTIFIED! Round 01 Complete.' : 'INCORRECT FINDING. Re-examine evidence files and retry.'
      });
    }

    // ROUND 2 SUBMISSION
    if (round_number === 2) {
      const lockedSub = existingTeamSubs.find(s => s.status === 'ACCEPTED');
      if (lockedSub) {
        return NextResponse.json({ success: false, message: 'Final answer already locked for Round 02.' }, { status: 400 });
      }

      const lockedPrize = eventState.current_prize;
      const timeTakenSec = eventState.round2_start_time
        ? Math.floor((Date.now() - new Date(eventState.round2_start_time).getTime()) / 1000)
        : 0;

      const r2Eval = evaluateRound2Answers(assignedCaseId, answers);

      const submission = await db.addSubmission({
        team_id: team.id,
        team_code: team.team_code,
        round_number: 2,
        answers,
        is_correct: true,
        score: r2Eval.percentage,
        original_score: r2Eval.percentage,
        breakdown: r2Eval.breakdown,
        status: 'ACCEPTED',
        remaining_prize: lockedPrize,
        attempt_number: attemptNumber,
        time_taken_seconds: timeTakenSec
      });

      await db.logAudit(
        team.team_code,
        'R2_FINAL_LOCK',
        `Locked Round 02 answer with ₹${(lockedPrize || 0).toLocaleString('en-IN')} remaining prize. Master Key score: ${r2Eval.percentage}% (${r2Eval.totalScore}/${r2Eval.maxPossibleScore} pts).`
      );

      broadcastStateChange({ type: 'SUBMISSION', team_code: team.team_code, round_number: 2 });

      return NextResponse.json({
        success: true,
        is_correct: true,
        locked_prize: lockedPrize,
        score_percentage: r2Eval.percentage,
        total_score: r2Eval.totalScore,
        max_possible_score: r2Eval.maxPossibleScore,
        breakdown: r2Eval.breakdown,
        message: 'FINAL ANSWER LOCKED. Your submission has been recorded.'
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid round submission' }, { status: 400 });

  } catch (err) {
    console.error('Submission error:', err);
    return NextResponse.json({ success: false, message: 'Failed to process submission' }, { status: 500 });
  }
}
