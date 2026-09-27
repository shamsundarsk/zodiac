import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local!");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

const BUCKET_NAME = 'zodiac-case-files';

const CASE_MAPPING = {
  round_1: {
    'Hyndai_Automobile_PARTICIPANT': 'case-r1-hyundai',
    'Eternal_Deep_Investigation_PARTICIPANT': 'case-r1-eternal',
    'Dior_Deep_Investigation_PARTICIPANT': 'case-r1-dior',
    'CF_Internet_Company_PARTICIPANT': 'case-r1-cf'
  },
  round_2: {
    'Hyundai_Corporate_War_Room_Round2_PARTICIPANT (1)': 'case-r2-hyundai',
    'Eternal_Corporate_War_Room_Round2_PARTICIPANT': 'case-r2-eternal',
    'Dior_Corporate_War_Room_Round2_PARTICIPANT': 'case-r2-dior',
    'Cloudflare_Corporate_War_Room_Round2_PARTICIPANT': 'case-r2-cloudflare'
  }
};

// Step 1: Clean master keys out of participant directories in case_folders/
console.log("==================================================");
console.log("7. MASTER KEY CLEANUP IN FILESYSTEM");
console.log("==================================================");

function purgeMasterKeysFromParticipantDirs(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      purgeMasterKeysFromParticipantDirs(fullPath);
    } else {
      if (item.toUpperCase().includes('MASTER_KEY')) {
        console.log(`Purging master key file from participant folder: ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
    }
  });
}

// Clean case_folders
purgeMasterKeysFromParticipantDirs(path.join(process.cwd(), 'case_folders'));

// Step 2: Create private Storage bucket if it doesn't exist
async function initStorage() {
  console.log("\n==================================================");
  console.log("5. SUPABASE STORAGE BUCKET CREATION & UPLOAD");
  console.log("==================================================");

  const { data: buckets } = await adminClient.storage.listBuckets();
  const existingBucket = buckets?.find(b => b.name === BUCKET_NAME);

  if (!existingBucket) {
    console.log(`Creating private bucket '${BUCKET_NAME}'...`);
    const { data, error } = await adminClient.storage.createBucket(BUCKET_NAME, {
      public: false,
      allowedMimeTypes: undefined,
      fileSizeLimit: undefined
    });
    if (error) {
      console.error(`Failed to create bucket ${BUCKET_NAME}:`, error.message);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' created successfully (private: true).`);
    }
  } else {
    console.log(`Bucket '${BUCKET_NAME}' already exists (private: ${!existingBucket.public}).`);
  }
}

// Step 3: Upload files and record evidence_files metadata in Supabase DB
async function uploadCaseFiles() {
  await initStorage();

  const caseFoldersDir = path.join(process.cwd(), 'case_folders');
  const counts = {};

  for (const roundName of ['round_1', 'round_2']) {
    const roundNumber = roundName === 'round_1' ? 1 : 2;
    const roundSubDir = roundName === 'round_1' ? 'round1' : 'round2';
    const roundMapping = CASE_MAPPING[roundName];
    const roundDir = path.join(caseFoldersDir, roundName);

    if (!fs.existsSync(roundDir)) continue;

    for (const [folderName, caseId] of Object.entries(roundMapping)) {
      const folderPath = path.join(roundDir, folderName);
      if (!fs.existsSync(folderPath)) {
        console.error(`Directory missing: ${folderPath}`);
        continue;
      }

      let uploadedCount = 0;
      let missingCount = 0;

      function getFilesRecursively(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fp = path.join(dir, file);
          if (fs.statSync(fp).isDirectory()) {
            getFilesRecursively(fp, fileList);
          } else {
            if (!file.startsWith('.')) fileList.push(fp);
          }
        });
        return fileList;
      }

      const allFiles = getFilesRecursively(folderPath);
      console.log(`\nProcessing case: [${caseId}] (${allFiles.length} participant files in source)`);

      for (const filePath of allFiles) {
        const relPath = path.relative(folderPath, filePath);
        const storagePath = `${roundSubDir}/${caseId}/${relPath}`;
        const fileContent = fs.readFileSync(filePath);
        const filename = path.basename(filePath);

        let contentType = 'application/octet-stream';
        if (filename.endsWith('.pdf')) contentType = 'application/pdf';
        else if (filename.endsWith('.xlsx')) contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        else if (filename.endsWith('.csv')) contentType = 'text/csv';
        else if (filename.endsWith('.txt')) contentType = 'text/plain';
        else if (filename.endsWith('.png')) contentType = 'image/png';
        else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = 'image/jpeg';

        // Upload to Supabase Storage
        const { error: uploadErr } = await adminClient.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileContent, {
            contentType,
            upsert: true
          });

        if (uploadErr) {
          console.error(`Failed to upload ${storagePath}:`, uploadErr.message);
          missingCount++;
        } else {
          uploadedCount++;

          // Insert metadata record into evidence_files
          const fileId = `${caseId}-${storagePath.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
          await adminClient.from('evidence_files').upsert({
            id: fileId,
            case_id: caseId,
            round_number: roundNumber,
            filename: filename,
            file_type: path.extname(filename).replace('.', '').toLowerCase(),
            content_type: contentType,
            storage_path: storagePath
          }, { onConflict: 'id' });
        }
      }

      counts[caseId] = {
        source: allFiles.length,
        uploaded: uploadedCount,
        missing: missingCount
      };
    }
  }

  console.log("\n==================================================");
  console.log("6. CASE FILE COUNT VERIFICATION REPORT");
  console.log("==================================================");
  let totalSource = 0;
  let totalUploaded = 0;
  let totalMissing = 0;

  for (const [caseId, c] of Object.entries(counts)) {
    console.log(`${caseId}: source = ${c.source}, uploaded = ${c.uploaded}, missing = ${c.missing}`);
    totalSource += c.source;
    totalUploaded += c.uploaded;
    totalMissing += c.missing;
  }

  console.log(`\nTOTAL PARTICIPANT FILES: source = ${totalSource}, uploaded = ${totalUploaded}, missing = ${totalMissing}`);
}

uploadCaseFiles();
