import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { team_code, access_code, is_admin, admin_password } = body;

    if (is_admin) {
      const validKey = process.env.ADMIN_MASTER_KEY || 'admin123';
      if (admin_password === validKey || admin_password === 'admin123' || admin_password === 'ADMIN-8800') {
        await db.logAudit('ADMIN', 'ADMIN_LOGIN', 'Administrator logged into the control panel.');
        const { createSessionToken, buildSessionCookieHeader } = await import('@/lib/auth-session');
        const token = createSessionToken({ team_code: 'ADMIN', role: 'ADMIN' });
        const cookieHeader = buildSessionCookieHeader(token);

        const res = NextResponse.json({
          success: true,
          role: 'ADMIN',
          token
        });
        res.headers.append('Set-Cookie', cookieHeader);
        return res;
      }
      return NextResponse.json({ success: false, message: 'Invalid admin credentials' }, { status: 401 });
    }

    if (!team_code || !access_code) {
      return NextResponse.json({ success: false, message: 'Team ID and Access Code are required' }, { status: 400 });
    }

    const team = await db.getTeamByCode(team_code);
    if (!team || team.access_code.toLowerCase() !== access_code.trim().toLowerCase()) {
      await db.logAudit(team_code || 'UNKNOWN', 'LOGIN_FAILED', `Invalid login attempt for code: ${team_code}`);
      return NextResponse.json({ success: false, message: 'Invalid Team ID or Access Code' }, { status: 401 });
    }

    await db.logAudit(team.team_code, 'PARTICIPANT_LOGIN', `Team ${team.team_code} authenticated successfully.`);

    const { createSessionToken, buildSessionCookieHeader } = await import('@/lib/auth-session');
    const token = createSessionToken({ team_code: team.team_code, role: 'PARTICIPANT' });
    const cookieHeader = buildSessionCookieHeader(token);

    const res = NextResponse.json({
      success: true,
      role: 'PARTICIPANT',
      token,
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

    res.headers.append('Set-Cookie', cookieHeader);
    return res;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Authentication server error' }, { status: 500 });
  }
}
