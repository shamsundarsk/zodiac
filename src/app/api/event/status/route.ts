import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { broadcastStateChange } from '@/lib/realtime-broadcaster';
import { getAdminAuthSession } from '@/lib/auth-session';

export async function GET() {
  const state = await db.getEventState();
  return NextResponse.json({
    success: true,
    state: {
      ...state,
      server_now: new Date().toISOString()
    }
  });
}

export async function POST(request: Request) {
  try {
    const adminSession = await getAdminAuthSession(request);
    if (!adminSession) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Administrator authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, round_duration_mins, starting_prize } = body;

    let currentState = await db.getEventState();
    let newState = currentState;
    const now = Date.now();

    if (action === 'START_ROUND_01') {
      if (currentState.round1_status !== 'ACTIVE') {
        const durationMins = currentState.round1_duration_mins || 30;
        const startTime = new Date(now).toISOString();
        const endsAt = new Date(now + durationMins * 60 * 1000).toISOString();
        newState = await db.updateEventState({
          round1_status: 'ACTIVE',
          round2_status: 'LOCKED',
          round1_start_time: startTime,
          round1_ends_at: endsAt,
          round1_paused_elapsed_sec: 0
        });
        await db.logAudit('ADMIN', action, 'Round 01 started by admin.');
      }
    } else if (action === 'RESUME_ROUND_01') {
      if (currentState.round1_status === 'PAUSED') {
        const pausedSec = currentState.round1_paused_elapsed_sec || 0;
        const durationMins = currentState.round1_duration_mins || 30;
        const remainingMs = Math.max(0, (durationMins * 60 - pausedSec) * 1000);
        const startTime = new Date(now).toISOString();
        const endsAt = new Date(now + remainingMs).toISOString();
        newState = await db.updateEventState({
          round1_status: 'ACTIVE',
          round1_start_time: startTime,
          round1_ends_at: endsAt
        });
        await db.logAudit('ADMIN', action, 'Round 01 resumed by admin.');
      }
    } else if (action === 'PAUSE_ROUND_01') {
      let accumulated = currentState.round1_paused_elapsed_sec || 0;
      if (currentState.round1_status === 'ACTIVE' && currentState.round1_start_time) {
        const added = Math.floor((now - new Date(currentState.round1_start_time).getTime()) / 1000);
        accumulated += Math.max(0, added);
      }
      newState = await db.updateEventState({
        round1_status: 'PAUSED',
        round1_paused_elapsed_sec: accumulated,
        round1_start_time: null,
        round1_ends_at: null
      });
      await db.logAudit('ADMIN', 'PAUSE_ROUND_01', `Round 01 paused by admin at ${accumulated}s elapsed.`);
    } else if (action === 'END_ROUND_01') {
      newState = await db.updateEventState({ round1_status: 'ENDED' });
      await db.logAudit('ADMIN', 'END_ROUND_01', 'Round 01 ended by admin.');
    } else if (action === 'START_ROUND_02') {
      if (currentState.round2_status !== 'ACTIVE') {
        const durationMins = currentState.round2_duration_mins || 30;
        const startTime = new Date(now).toISOString();
        const endsAt = new Date(now + durationMins * 60 * 1000).toISOString();
        newState = await db.updateEventState({
          round1_status: 'ENDED',
          round2_status: 'ACTIVE',
          round2_start_time: startTime,
          round2_ends_at: endsAt,
          round2_paused_elapsed_sec: 0
        });
        await db.logAudit('ADMIN', action, 'Round 02 started by admin. Prize decay active.');
      }
    } else if (action === 'RESUME_ROUND_02') {
      if (currentState.round2_status === 'PAUSED') {
        const pausedSec = currentState.round2_paused_elapsed_sec || 0;
        const durationMins = currentState.round2_duration_mins || 30;
        const remainingMs = Math.max(0, (durationMins * 60 - pausedSec) * 1000);
        const startTime = new Date(now).toISOString();
        const endsAt = new Date(now + remainingMs).toISOString();
        newState = await db.updateEventState({
          round1_status: 'ENDED',
          round2_status: 'ACTIVE',
          round2_start_time: startTime,
          round2_ends_at: endsAt
        });
        await db.logAudit('ADMIN', action, 'Round 02 resumed by admin.');
      }
    } else if (action === 'PAUSE_ROUND_02') {
      let accumulated = currentState.round2_paused_elapsed_sec || 0;
      if (currentState.round2_status === 'ACTIVE' && currentState.round2_start_time) {
        const added = Math.floor((now - new Date(currentState.round2_start_time).getTime()) / 1000);
        accumulated += Math.max(0, added);
      }
      newState = await db.updateEventState({
        round2_status: 'PAUSED',
        round2_paused_elapsed_sec: accumulated,
        round2_start_time: null,
        round2_ends_at: null
      });
      await db.logAudit('ADMIN', 'PAUSE_ROUND_02', `Round 02 paused by admin at ${accumulated}s elapsed.`);
    } else if (action === 'END_ROUND_02') {
      newState = await db.updateEventState({ round2_status: 'ENDED', current_prize: 0 });
      await db.logAudit('ADMIN', 'END_ROUND_02', 'Round 02 ended by admin.');
    } else if (action === 'RESET_EVENT') {
      newState = await db.resetEvent();
      await db.logAudit('ADMIN', 'RESET_EVENT', 'Full event reset performed by admin.');
    } else if (action === 'UPDATE_SETTINGS') {
      newState = await db.updateEventState({
        round1_duration_mins: round_duration_mins || newState.round1_duration_mins,
        round2_duration_mins: round_duration_mins || newState.round2_duration_mins,
        starting_prize: starting_prize !== undefined ? Number(starting_prize) : newState.starting_prize
      });
      await db.logAudit('ADMIN', 'UPDATE_SETTINGS', 'Event configuration updated.');
    }

    const responseState = {
      ...newState,
      server_now: new Date().toISOString()
    };

    broadcastStateChange({ action, state: responseState });
    return NextResponse.json({ success: true, state: responseState });

  } catch (err) {
    console.error('Event status error:', err);
    return NextResponse.json({ success: false, message: 'Failed to update event status' }, { status: 500 });
  }
}
