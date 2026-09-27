import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { CaseFolder, EvidenceFile, FileType } from './types';

const SOURCE_CASE_DIR = path.join(process.cwd(), 'case_folders');

const CASE_FOLDER_SUBDIR_MAP: Record<string, string> = {
  'case-r1-hyundai': 'round_1/Hyndai_Automobile_PARTICIPANT',
  'case-r1-eternal': 'round_1/Eternal_Deep_Investigation_PARTICIPANT',
  'case-r1-dior': 'round_1/Dior_Deep_Investigation_PARTICIPANT',
  'case-r1-cf': 'round_1/CF_Internet_Company_PARTICIPANT',
  'case-01': 'round_1/Hyndai_Automobile_PARTICIPANT',
  'case-02': 'round_1/Eternal_Deep_Investigation_PARTICIPANT',
  'case-03': 'round_1/Dior_Deep_Investigation_PARTICIPANT',
  'case-04': 'round_1/CF_Internet_Company_PARTICIPANT',
  'case-r2-01': 'round_2/Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)',
  'case-r2-hyundai': 'round_2/Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)',
  'case-r2-eternal': 'round_2/Eternal_Corporate_War_Room_Round2_PARTICIPANT',
  'case-r2-dior': 'round_2/Dior_Corporate_War_Room_Round2_PARTICIPANT',
  'case-r2-cloudflare': 'round_2/Cloudflare_Corporate_War_Room_Round2_PARTICIPANT'
};

function parseFileType(filename: string): FileType {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'PDF';
  if (ext === '.xlsx' || ext === '.xls') return 'XLSX';
  if (ext === '.csv') return 'CSV';
  if (ext === '.png') return 'PNG';
  if (ext === '.jpg' || ext === '.jpeg') return 'JPG';
  return 'TXT';
}

function parseSpreadsheet(filePath: string): { title?: string; headers: string[]; rows: string[][]; sheetNames?: string[]; sheets?: Record<string, { title?: string; headers: string[]; rows: string[][] }> } {
  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
      return { headers: ['Notice'], rows: [['[Empty file exhibit - no tabular data]']] };
    }
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames || [];
    if (sheetNames.length === 0) return { headers: [], rows: [] };

    const sheets: Record<string, { title?: string; headers: string[]; rows: string[][] }> = {};

    for (const sName of sheetNames) {
      const worksheet = workbook.Sheets[sName];
      const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
      if (!rawRows || rawRows.length === 0) {
        sheets[sName] = { headers: [], rows: [] };
        continue;
      }

      const nonNullRows = rawRows.filter((r: any[]) => r && r.some(cell => String(cell ?? '').trim() !== ''));
      if (nonNullRows.length === 0) {
        sheets[sName] = { headers: [], rows: [] };
        continue;
      }

      let title: string | undefined = undefined;
      let headerRowIdx = 0;

      const row0NonEmpty = nonNullRows[0].filter((cell: any) => String(cell ?? '').trim() !== '');
      if (row0NonEmpty.length <= 2 && nonNullRows.length > 1) {
        const row1NonEmpty = nonNullRows[1].filter((cell: any) => String(cell ?? '').trim() !== '');
        if (row1NonEmpty.length > row0NonEmpty.length) {
          title = row0NonEmpty.map(c => String(c).trim()).join(' - ');
          headerRowIdx = 1;
        }
      }

      const headers = nonNullRows[headerRowIdx].map((h: any) => String(h || '').trim());
      const dataRows = nonNullRows.slice(headerRowIdx + 1).map((r: any[]) => r.map(cell => String(cell ?? '').trim()));

      sheets[sName] = { title, headers, rows: dataRows };
    }

    const firstSheetName = sheetNames[0];
    const primary = sheets[firstSheetName] || { headers: [], rows: [] };

    return {
      title: primary.title,
      headers: primary.headers,
      rows: primary.rows,
      sheetNames,
      sheets
    };
  } catch (err) {
    console.error(`Error parsing spreadsheet at ${filePath}:`, err);
    return { headers: ['Notice'], rows: [['[Empty or unformatted exhibit]']] };
  }
}

function getSubDirForCase(roundNumber: 1 | 2, caseId?: string): string {
  const norm = (caseId || '').toLowerCase();
  if (roundNumber === 2) {
    if (norm.includes('dior') || norm.includes('03')) return 'round_2/Dior_Corporate_War_Room_Round2_PARTICIPANT';
    if (norm.includes('eternal') || norm.includes('02')) return 'round_2/Eternal_Corporate_War_Room_Round2_PARTICIPANT';
    if (norm.includes('cf') || norm.includes('cloudflare') || norm.includes('04')) return 'round_2/Cloudflare_Corporate_War_Room_Round2_PARTICIPANT';
    return 'round_2/Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)';
  } else {
    if (norm.includes('dior') || norm.includes('03')) return 'round_1/Dior_Deep_Investigation_PARTICIPANT';
    if (norm.includes('eternal') || norm.includes('02')) return 'round_1/Eternal_Deep_Investigation_PARTICIPANT';
    if (norm.includes('cf') || norm.includes('cloudflare') || norm.includes('04')) return 'round_1/CF_Internet_Company_PARTICIPANT';
    return 'round_1/Hyndai_Automobile_PARTICIPANT';
  }
}

export function loadActualParticipantCaseFolders(roundNumber: 1 | 2, caseId?: string): CaseFolder[] {
  const normCaseId = (caseId || (roundNumber === 1 ? 'case-r1-hyundai' : 'case-r2-hyundai')).toLowerCase();
  const relSubDir = getSubDirForCase(roundNumber, caseId);
  const caseDir = path.join(SOURCE_CASE_DIR, relSubDir);

  if (!fs.existsSync(caseDir)) {
    console.warn(`Case folder not found at: ${caseDir}`);
    return [];
  }

  const entries = fs.readdirSync(caseDir, { withFileTypes: true });
  const folderEntries = entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).sort((a, b) => a.name.localeCompare(b.name));

  const caseFolders: CaseFolder[] = [];

  for (const fEntry of folderEntries) {
    const folderPath = path.join(caseDir, fEntry.name);
    const folderName = roundNumber === 1 ? `FOLDER ${fEntry.name}` : `WAR ROOM ${fEntry.name}`;
    const evidenceFiles: EvidenceFile[] = [];

    const scanFilesRecursively = (currentDir: string) => {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of items) {
        if (item.name.startsWith('.') || item.name.toUpperCase() === 'QUESTIONS.TXT' || item.name.toUpperCase().includes('MASTER_KEY')) continue;
        const itemPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          scanFilesRecursively(itemPath);
        } else if (item.isFile()) {
          const fileType = parseFileType(item.name);
          const stat = fs.statSync(itemPath);
          const sizeKb = Math.ceil(stat.size / 1024);
          const fileId = `ef-${fEntry.name}-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
          const relPathFromCase = path.relative(caseDir, itemPath).replace(/\\/g, '/');
          const relativeUrlPath = `/api/cases/file?round=${roundNumber}&path=${encodeURIComponent(normCaseId + '/' + relPathFromCase)}`;

          let contentType: "table" | "pdf" | "image" | "text" = "text";
          let content: string | undefined = undefined;
          let data_json: any = undefined;
          let image_url: string | undefined = undefined;

          if (fileType === 'XLSX' || fileType === 'CSV') {
            contentType = 'table';
            data_json = parseSpreadsheet(itemPath);
          } else if (fileType === 'PDF') {
            contentType = 'pdf';
            content = `CONFIDENTIAL EVIDENTIAL DOSSIER :: ${item.name}\nFile location: ${relativeUrlPath}\n\nEvidence Document Record. Open browser file viewer or inspect spreadsheet/image exhibits for encoded ciphers.`;
          } else if (fileType === 'PNG' || fileType === 'JPG') {
            contentType = 'image';
            image_url = relativeUrlPath;
            content = `Evidence Exhibit Photo: ${item.name}`;
          } else {
            contentType = 'text';
            try {
              content = fs.readFileSync(itemPath, 'utf-8');
            } catch (e) {
              content = `Text evidence item: ${item.name}`;
            }
          }

          evidenceFiles.push({
            id: fileId,
            folder_id: `fld-${roundNumber}-${fEntry.name}`,
            filename: item.name,
            file_type: fileType,
            file_size: `${sizeKb} KB`,
            date: new Date(stat.mtime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
            evidence_id: `EVID-${item.name.substring(0, 4).toUpperCase()}`,
            content_type: contentType,
            content,
            data_json,
            image_url,
            file_url: relativeUrlPath
          });
        }
      }
    };

    scanFilesRecursively(folderPath);

    caseFolders.push({
      id: `fld-${roundNumber}-${fEntry.name}`,
      case_id: normCaseId,
      name: folderName,
      folder_type: roundNumber === 1 ? 'FINANCIAL' : 'OPERATIONS',
      item_count: evidenceFiles.length,
      last_modified: 'OCT 2026',
      description: `Official ${folderName} evidence archive files`,
      files: evidenceFiles
    });
  }

  return caseFolders;
}
