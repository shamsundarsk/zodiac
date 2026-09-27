import { NextResponse } from 'next/server';
import { loadMasterKeyForCase } from '@/lib/master-key-engine';
import { getAdminAuthSession } from '@/lib/auth-session';

export async function GET(request: Request) {
  const adminSession = await getAdminAuthSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Administrator authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const case_id = searchParams.get('case_id') || 'case-r1-hyundai';
  const round = Number(searchParams.get('round') || '1') as 1 | 2;

  const masterKey = loadMasterKeyForCase(case_id, round);

  if (!masterKey) {
    return NextResponse.json({ success: false, message: 'Master Key not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    masterKey
  });
}
