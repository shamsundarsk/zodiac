import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-session';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const { searchParams } = new URL(request.url);
    const round = Number(searchParams.get('round') || '1') as 1 | 2;
    const requestedPath = searchParams.get('path') || '';

    // Admin override access
    if (session?.role === 'ADMIN') {
      return fetchAndServeFile(requestedPath, round, 'admin');
    }

    if (!session || !session.team_code) {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
    }

    const team = await db.getTeamByCode(session.team_code);
    if (!team) {
      return NextResponse.json({ success: false, message: 'Team record not found' }, { status: 404 });
    }

    const eventState = await db.getEventState();

    // Verify round status
    if (round === 1 && eventState.round1_status === 'NOT_STARTED') {
      return NextResponse.json({ success: false, message: 'Round 01 has not started yet.' }, { status: 403 });
    }
    if (round === 2 && (eventState.round2_status === 'LOCKED' || eventState.round2_status === 'NOT_STARTED')) {
      return NextResponse.json({ success: false, message: 'Round 02 is currently locked.' }, { status: 403 });
    }

    // Security check: verify path traversal
    const normalizedPath = path.normalize(requestedPath).replace(/\\/g, '/');
    if (normalizedPath.includes('..') || normalizedPath.toUpperCase().includes('MASTER_KEY')) {
      return NextResponse.json({ success: false, message: 'Invalid or forbidden file request' }, { status: 400 });
    }

    // Determine assigned case ID
    const assignedCaseId = round === 1 ? team.assigned_case_id_r1 : (team.assigned_case_id_r2 || 'case-r2-hyundai');

    if (!normalizedPath.includes(assignedCaseId) && !normalizedPath.toLowerCase().includes(assignedCaseId.replace('case-r1-', '').replace('case-r2-', ''))) {
      return NextResponse.json({ success: false, message: 'Forbidden: You do not have access to another case\'s evidence files' }, { status: 403 });
    }

    return fetchAndServeFile(normalizedPath, round, assignedCaseId);

  } catch (err) {
    console.error('File access error:', err);
    return NextResponse.json({ success: false, message: 'Failed to access file' }, { status: 500 });
  }
}

async function fetchAndServeFile(relPath: string, round: number, assignedCaseId: string) {
  // Construct storage path: e.g. round1/case-r1-hyundai/folder/file
  const cleanPath = relPath.replace(/^public\//, '').replace(/^case-files\//, '').replace(/^Round1\//i, '').replace(/^Round2\//i, '');
  const roundSubDir = round === 1 ? 'round1' : 'round2';
  
  let storagePath = cleanPath;
  if (!cleanPath.startsWith('round1/') && !cleanPath.startsWith('round2/')) {
    storagePath = `${roundSubDir}/${cleanPath}`;
  }

  // 1. Try Supabase Private Storage bucket 'zodiac-case-files'
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('zodiac-case-files')
        .download(storagePath);

      if (data && !error) {
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = path.basename(storagePath);
        const contentType = getContentType(filename);

        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Content-Disposition': `inline; filename="${filename}"`
          }
        });
      }
    } catch (err) {
      console.error('Error fetching file from Supabase storage:', err);
    }
  }

  // 2. Fallback to server-side case_folders directory (never public/)
  const diskPath = path.join(process.cwd(), 'case_folders', round === 1 ? 'round_1' : 'round_2', cleanPath);
  if (fs.existsSync(diskPath) && !fs.statSync(diskPath).isDirectory()) {
    const fileBuffer = fs.readFileSync(diskPath);
    const contentType = getContentType(path.basename(diskPath));
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  }

  return NextResponse.json({ success: false, message: 'Evidence file not found' }, { status: 404 });
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (ext === '.csv') return 'text/csv';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.txt') return 'text/plain';
  return 'application/octet-stream';
}
