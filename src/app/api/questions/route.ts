import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getQuestionsForCase, getCanonicalCaseId } from '@/lib/questions-engine';
import { getAuthSession } from '@/lib/auth-session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const { searchParams } = new URL(request.url);

    const eventState = await db.getEventState();
    let round = (eventState?.round2_status === 'ACTIVE' || eventState?.round2_status === 'ENDED' ? 2 : 1) as 1 | 2;
    let targetCaseId = '';

    if (session && session.role === 'ADMIN') {
      // Admin can preview questions for any case and round
      const requestedRound = searchParams.get('round');
      if (requestedRound === '1' || requestedRound === '2') {
        round = Number(requestedRound) as 1 | 2;
      }
      targetCaseId = searchParams.get('case') || searchParams.get('case_id') || 'case-r1-hyundai';
    } else if (session && session.team_code) {
      // Participant session: STRICT SERVER-SIDE DERIVATION FROM TEAM RECORD
      const team = await db.getTeamByCode(session.team_code);
      if (!team) {
        return NextResponse.json({ success: false, message: 'Team record not found for session' }, { status: 404 });
      }
      targetCaseId = round === 1 ? team.assigned_case_id_r1 : (team.assigned_case_id_r2 || team.assigned_case_id_r1);
    } else {
      // No session: Unauthorized
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
    }

    const canonicalId = getCanonicalCaseId(targetCaseId);
    if (!canonicalId) {
      return NextResponse.json({
        success: false,
        message: `Questions unavailable for assigned case "${targetCaseId}"`
      }, { status: 404 });
    }

    const questions = getQuestionsForCase(canonicalId, round);

    if (!questions || questions.length !== 12) {
      return NextResponse.json({
        success: false,
        message: `Questions unavailable for assigned case "${canonicalId}" (Round ${round})`
      }, { status: 500 });
    }

    // SANITIZE QUESTIONS: Never expose expected answers or aliases to participant browsers
    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      num: q.num,
      text: q.question || q.text || '',
      question: q.question || q.text || '',
      placeholder: q.placeholder || `Enter finding for Q${q.num}...`,
      type: q.type || 'text',
      answer_type: q.answer_type || 'SHORT_TEXT',
      unit: q.unit || q.format_hint,
      format_hint: q.format_hint || q.unit,
      options: q.options,
      maxSelect: q.maxSelect || q.max_choices,
      marks: q.marks || 1
    }));

    console.log('[ZODIAC QUESTIONS API]', {
      team: session?.team_code,
      assignedCase: targetCaseId,
      canonicalCase: canonicalId,
      activeRound: round,
      questionCount: sanitizedQuestions.length,
      firstQuestion: sanitizedQuestions[0]?.question || sanitizedQuestions[0]?.text
    });

    return NextResponse.json({
      success: true,
      round,
      canonical_case: canonicalId,
      case_id: targetCaseId,
      question_count: sanitizedQuestions.length,
      questions: sanitizedQuestions
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

  } catch (err) {
    console.error('API questions error:', err);
    return NextResponse.json({ success: false, message: 'Failed to retrieve questions' }, { status: 500 });
  }
}

