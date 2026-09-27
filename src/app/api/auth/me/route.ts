import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-session';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);

    if (!session || !session.team_code) {
      return NextResponse.json({ success: false, message: 'Unauthenticated session' }, { status: 401 });
    }

    const team = await db.getTeamByCode(session.team_code);
    if (!team) {
      return NextResponse.json({ success: false, message: 'Team record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      role: session.role,
      team: {
        id: team.id,
        team_code: team.team_code,
        name: team.name,
        member1_name: team.member1_name,
        member2_name: team.member2_name,
        access_code: team.access_code,
        assigned_case_id_r1: team.assigned_case_id_r1,
        assigned_case_id_r2: team.assigned_case_id_r2,
        status: team.status
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ success: false, message: 'Server authentication error' }, { status: 500 });
  }
}
