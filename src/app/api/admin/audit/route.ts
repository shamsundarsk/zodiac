import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminAuthSession } from '@/lib/auth-session';

export async function GET(request: Request) {
  const adminSession = await getAdminAuthSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Administrator authentication required' }, { status: 401 });
  }

  const logs = await db.getAuditLogs();
  return NextResponse.json({ success: true, logs });
}
