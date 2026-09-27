import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminAuthSession } from '@/lib/auth-session';
import { broadcastStateChange } from '@/lib/realtime-broadcaster';

export async function POST(request: Request) {
  try {
    const adminSession = await getAdminAuthSession(request);
    if (!adminSession) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { submission_id, override_score, override_reason } = body;

    if (!submission_id || override_score === undefined || override_score === null) {
      return NextResponse.json({ success: false, message: 'Missing submission_id or override_score' }, { status: 400 });
    }

    const numericScore = Number(override_score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return NextResponse.json({ success: false, message: 'Invalid override_score (must be number 0-100)' }, { status: 400 });
    }

    const updatedSub = await db.updateSubmissionScore(submission_id, numericScore, override_reason);
    if (!updatedSub) {
      return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });
    }

    await db.logAudit(
      updatedSub.team_code,
      'ADMIN_SCORE_OVERRIDE',
      `Score updated to ${numericScore}% for submission ${submission_id}. Original score: ${updatedSub.original_score ?? 'N/A'}. Reason: ${override_reason || 'Manual override'}`
    );

    broadcastStateChange({ type: 'SCORE_OVERRIDE', team_code: updatedSub.team_code, submission_id });

    return NextResponse.json({
      success: true,
      submission: updatedSub,
      message: `Score updated to ${numericScore}% successfully.`
    });

  } catch (err) {
    console.error('Score override error:', err);
    return NextResponse.json({ success: false, message: 'Failed to update submission score' }, { status: 500 });
  }
}
