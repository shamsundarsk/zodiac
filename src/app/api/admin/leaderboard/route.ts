import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminAuthSession } from '@/lib/auth-session';

export async function GET(request: Request) {
  const adminSession = await getAdminAuthSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  const teams = await db.getTeams();
  const allSubmissions = await db.getSubmissions();
  const eventState = await db.getEventState();

  const leaderboard = teams.map((team, idx) => {
    const teamSubs = allSubmissions.filter(s => s.team_code.toUpperCase() === team.team_code.toUpperCase());
    
    // R1 status
    const r1Sub = teamSubs.find(s => s.round_number === 1 && s.is_correct);
    const r1Status = r1Sub ? 'COMPLETE' : (teamSubs.some(s => s.round_number === 1) ? 'FAILED' : 'IN_PROGRESS');
    const r1Time = r1Sub ? `${Math.floor(r1Sub.time_taken_seconds / 60)}m ${r1Sub.time_taken_seconds % 60}s` : '--';

    // R2 status
    const r2Sub = teamSubs.find(s => s.round_number === 2 && s.status === 'ACCEPTED');
    const r2Status = r2Sub ? 'LOCKED' : (eventState.round2_status === 'ACTIVE' ? 'ACTIVE' : 'LOCKED');
    const finalPrize = r2Sub ? r2Sub.remaining_prize : null;
    const currentLivePrize = (r2Status === 'ACTIVE' && !r2Sub) ? eventState.current_prize : (r2Sub ? r2Sub.remaining_prize : 0);
    const submissionTime = r2Sub ? new Date(r2Sub.submitted_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--';

    return {
      rank: 0,
      team_code: team.team_code,
      name: team.name,
      member1_name: team.member1_name || 'Member 1',
      member2_name: team.member2_name || 'Member 2',
      assigned_case_id: team.assigned_case_id_r1 || 'case-01',
      r1_status: r1Status,
      r1_time: r1Time,
      r2_status: r2Status,
      current_prize: currentLivePrize,
      final_prize: finalPrize,
      submission_time: submissionTime,
      raw_prize: finalPrize || 0,
      r1_time_sec: r1Sub ? r1Sub.time_taken_seconds : 999999
    };
  });

  // Sort Leaderboard:
  // First priority: Round 2 final locked prize (descending)
  // Second priority: Round 1 completion (completed first, then faster time)
  leaderboard.sort((a, b) => {
    if (a.raw_prize !== b.raw_prize) {
      return b.raw_prize - a.raw_prize;
    }
    if (a.r1_status === 'COMPLETE' && b.r1_status !== 'COMPLETE') return -1;
    if (b.r1_status === 'COMPLETE' && a.r1_status !== 'COMPLETE') return 1;
    return a.r1_time_sec - b.r1_time_sec;
  });

  // Assign ranks
  leaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });

  return NextResponse.json({ success: true, leaderboard });
}
