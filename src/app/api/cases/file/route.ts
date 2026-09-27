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

    // Security check: verify path traversal
    const normalizedPath = path.normalize(requestedPath).replace(/\\/g, '/');
    if (normalizedPath.includes('..') || normalizedPath.toUpperCase().includes('MASTER_KEY')) {
      return NextResponse.json({ success: false, message: 'Invalid or forbidden file request' }, { status: 400 });
    }

    let assignedCaseId = 'case-r1-hyundai';
    if (session?.team_code) {
      const team = await db.getTeamByCode(session.team_code);
      if (team) {
        assignedCaseId = round === 1 ? team.assigned_case_id_r1 : (team.assigned_case_id_r2 || 'case-r2-hyundai');
      }
    }

    return fetchAndServeFile(normalizedPath, round, assignedCaseId);

  } catch (err) {
    console.error('File access error:', err);
    return NextResponse.json({ success: false, message: 'Failed to access file' }, { status: 500 });
  }
}

function resolveSubDir(roundNumber: number, caseIdKey: string): string {
  const norm = (caseIdKey || '').toLowerCase();
  if (roundNumber === 2) {
    if (norm.includes('dior') || norm.includes('03')) return 'Dior_Corporate_War_Room_Round2_PARTICIPANT';
    if (norm.includes('eternal') || norm.includes('02')) return 'Eternal_Corporate_War_Room_Round2_PARTICIPANT';
    if (norm.includes('cf') || norm.includes('cloudflare') || norm.includes('04')) return 'Cloudflare_Corporate_War_Room_Round2_PARTICIPANT';
    return 'Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)';
  } else {
    if (norm.includes('dior') || norm.includes('03')) return 'Dior_Deep_Investigation_PARTICIPANT';
    if (norm.includes('eternal') || norm.includes('02')) return 'Eternal_Deep_Investigation_PARTICIPANT';
    if (norm.includes('cf') || norm.includes('cloudflare') || norm.includes('04')) return 'CF_Internet_Company_PARTICIPANT';
    return 'Hyndai_Automobile_PARTICIPANT';
  }
}

function resolveDiskPath(cleanPath: string, round: number): string {
  const directPath = path.join(process.cwd(), 'case_folders', round === 1 ? 'round_1' : 'round_2', cleanPath);
  if (fs.existsSync(directPath) && !fs.statSync(directPath).isDirectory()) {
    return directPath;
  }

  const parts = cleanPath.split('/');
  const caseIdKey = parts[0]?.toLowerCase();
  const folderSubDir = resolveSubDir(round, caseIdKey);
  const realRelativePath = [folderSubDir, ...parts.slice(1)].join('/');
  return path.join(process.cwd(), 'case_folders', round === 1 ? 'round_1' : 'round_2', realRelativePath);
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
  const diskPath = resolveDiskPath(cleanPath, round);
  if (fs.existsSync(diskPath) && !fs.statSync(diskPath).isDirectory()) {
    const fileBuffer = fs.readFileSync(diskPath);
    const filename = path.basename(diskPath);
    const contentType = getContentType(filename);
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });
  }

  return NextResponse.json({ success: false, message: 'Evidence file not found' }, { status: 404 });
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (ext === '.xls') return 'application/vnd.ms-excel';
  if (ext === '.csv') return 'text/csv';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.txt') return 'text/plain';
  return 'application/octet-stream';
}
