import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getQuestionsForCase } from '@/lib/questions-engine';
import { getAuthSession } from '@/lib/auth-session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const round = Number(searchParams.get('round') || '1') as 1 | 2;
  const session = await getAuthSession(request);

  let targetCaseId = round === 1 ? 'case-r1-hyundai' : 'case-r2-hyundai';

  if (session && session.team_code) {
    const team = await db.getTeamByCode(session.team_code);
    if (team) {
      targetCaseId = round === 1 ? team.assigned_case_id_r1 : (team.assigned_case_id_r2 || 'case-r2-hyundai');
    }
  } else {
    const teamCodeParam = searchParams.get('team_code');
    if (teamCodeParam) {
      const team = await db.getTeamByCode(teamCodeParam);
      if (team) {
        targetCaseId = round === 1 ? team.assigned_case_id_r1 : (team.assigned_case_id_r2 || 'case-r2-hyundai');
      }
    }
  }

  const questions = getQuestionsForCase(targetCaseId, round);

  return NextResponse.json({
    success: true,
    round,
    case_id: targetCaseId,
    questions
  });
}
