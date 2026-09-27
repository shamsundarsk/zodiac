import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth-session';

export async function GET(request: Request) {
  const session = await getAuthSession(request);
  const { searchParams } = new URL(request.url);
  const round = Number(searchParams.get('round') || '1') as 1 | 2;
  const requestedTeamCode = searchParams.get('team_code');
  const requestedCaseId = searchParams.get('case_id');

  const activeTeamCode = session?.team_code || requestedTeamCode || '';
  const folders = await db.getFolders(round, activeTeamCode, requestedCaseId || undefined);

  let caseConfig = await db.getCaseByRound(round);
  if (activeTeamCode) {
    const team = await db.getTeamByCode(activeTeamCode);
    if (team) {
      const assignedCaseId = round === 1 ? team.assigned_case_id_r1 : (team.assigned_case_id_r2 || "case-r2-hyundai");
      const found = await db.getCaseById(assignedCaseId);
      if (found) caseConfig = found;
    }
  }

  if (activeTeamCode) {
    await db.logAudit(activeTeamCode, 'EXPLORE_ARCHIVE', `Browsing Round 0${round} file archive.`);
  }

  return NextResponse.json({
    success: true,
    round,
    case: {
      id: caseConfig?.id,
      title: caseConfig?.title,
      description: caseConfig?.description,
      hint_text: caseConfig?.hint_text
    },
    folders
  });
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, case_data, folder_data, file_data } = body;

    if (action === 'SAVE_CASE') {
      const savedCase = await db.saveCase(case_data);
      await db.logAudit('ADMIN', 'SAVE_CASE', `Saved case ${savedCase.title}`);
      return NextResponse.json({ success: true, case: savedCase });
    }

    if (action === 'CREATE_FOLDER') {
      const folder = await db.saveFolder({
        id: `fld-${Date.now()}`,
        case_id: folder_data.case_id,
        name: folder_data.name.toUpperCase(),
        folder_type: folder_data.folder_type,
        item_count: 0,
        last_modified: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        description: folder_data.description || 'Custom case file folder',
        files: []
      });
      await db.logAudit('ADMIN', 'CREATE_FOLDER', `Created folder ${folder.name}`);
      return NextResponse.json({ success: true, folder });
    }

    if (action === 'ADD_FILE') {
      const newFile = await db.addFileToFolder(file_data.folder_id, {
        id: `file-${Date.now()}`,
        folder_id: file_data.folder_id,
        filename: file_data.filename,
        file_type: file_data.file_type,
        file_size: file_data.file_size || '120 KB',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        evidence_id: file_data.evidence_id || `E-${Math.floor(Math.random() * 900 + 100)}`,
        content_type: file_data.content_type || 'text',
        content: file_data.content,
        data_json: file_data.data_json
      });
      await db.logAudit('ADMIN', 'ADD_FILE', `Added file ${newFile.filename} to folder.`);
      return NextResponse.json({ success: true, file: newFile });
    }

    return NextResponse.json({ success: false, message: 'Invalid case action' }, { status: 400 });

  } catch (error) {
    console.error('Case API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process case request' }, { status: 500 });
  }
}
