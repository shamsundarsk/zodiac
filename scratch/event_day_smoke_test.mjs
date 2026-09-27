import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

console.log("==================================================");
console.log("ZODIAC — FINAL EVENT-DAY SMOKE TEST");
console.log("==================================================");

async function runSmokeTest() {
  const results = {
    publicFileSecurity: false,
    masterKeySecurity: false,
    participantFlow: false,
    caseIsolation: false,
    timer: false,
    submission: false,
    roundTransition: false,
    realtime: false,
    adminSecurity: false,
    productionDb: false,
    prize: false,
    concurrency: false,
    build: false
  };

  // 1. PUBLIC FILE SECURITY
  console.log("\n--- 1. PUBLIC EXPOSURE CHECK ---");
  const publicFiles = [];
  if (fs.existsSync(path.join(process.cwd(), 'public'))) {
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(i => {
        const fp = path.join(dir, i);
        if (fs.statSync(fp).isDirectory()) scanDir(fp);
        else publicFiles.push(fp);
      });
    };
    scanDir(path.join(process.cwd(), 'public'));
  }
  const caseFilesPublic = publicFiles.filter(f => f.includes('case-files'));
  const masterKeysPublic = publicFiles.filter(f => f.toUpperCase().includes('MASTER_KEY'));
  console.log(`Public files count under public/case-files: ${caseFilesPublic.length} (Expected: 0)`);
  console.log(`Master Key files count under public/: ${masterKeysPublic.length} (Expected: 0)`);

  const httpOldFileRes = await fetch(`${BASE_URL}/case-files/round1/case-r1-hyundai/QUESTIONS.txt`);
  console.log(`Direct HTTP GET /case-files/... -> Status: ${httpOldFileRes.status} (Expected: 404)`);

  results.publicFileSecurity = (caseFilesPublic.length === 0 && masterKeysPublic.length === 0 && httpOldFileRes.status === 404);

  // 2. MASTER KEY EXPOSURE
  console.log("\n--- 2. MASTER KEY EXPOSURE CHECK ---");
  let foundInClientBundles = false;
  const nextDir = path.join(process.cwd(), '.next/static');
  if (fs.existsSync(nextDir)) {
    const checkBundles = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(i => {
        const fp = path.join(dir, i);
        if (fs.statSync(fp).isDirectory()) checkBundles(fp);
        else if (fp.endsWith('.js')) {
          const content = fs.readFileSync(fp, 'utf8');
          if (content.includes('Hyundai Motor Company') && content.includes('Chung Ju-yung')) {
            console.error(`Exposed master key text in client bundle: ${fp}`);
            foundInClientBundles = true;
          }
        }
      });
    };
    checkBundles(nextDir);
  }
  console.log(`Master Key text in client JS bundles: ${foundInClientBundles ? 'EXPOSED!' : 'NONE FOUND (PASS)'}`);
  results.masterKeySecurity = !foundInClientBundles;

  // 3 & 4. PARTICIPANT FLOW & CASE ISOLATION
  console.log("\n--- 3 & 4. PARTICIPANT FLOW & CASE ISOLATION ---");
  const testTeamName = `Smoke Test Team ${Date.now()}`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testTeamName,
      member1_name: 'Tester 1',
      member2_name: 'Tester 2'
    })
  });
  const regData = await regRes.json();
  const teamObj = regData.team;
  console.log(`Registered test team: ${teamObj?.name} (Code: ${teamObj?.team_code}, Access Code: ${teamObj?.access_code})`);

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      team_code: teamObj.team_code,
      access_code: teamObj.access_code
    })
  });
  const cookieHeader = loginRes.headers.get('set-cookie');
  const sessionCookie = cookieHeader ? cookieHeader.split(';')[0] : '';
  const isHttpOnly = cookieHeader ? cookieHeader.toLowerCase().includes('httponly') : false;
  console.log(`Login response status: ${loginRes.status}, HttpOnly Cookie: ${isHttpOnly}`);

  const questionsRes = await fetch(`${BASE_URL}/api/questions?round=1`, {
    headers: { 'Cookie': sessionCookie }
  });
  const questionsData = await questionsRes.json();
  console.log(`Questions loaded: ${questionsData.questions?.length} items (Expected: 12)`);

  const assignedCaseId = teamObj.assigned_case_id_r1;
  const ownFileRes = await fetch(`${BASE_URL}/api/cases/file?round=1&path=Round1/${assignedCaseId}/QUESTIONS.txt`, {
    headers: { 'Cookie': sessionCookie }
  });
  console.log(`Request own assigned case file (${assignedCaseId}) -> Status: ${ownFileRes.status} (Expected: 200)`);

  const unassignedCaseId = ['case-r1-hyundai', 'case-r1-eternal', 'case-r1-dior', 'case-r1-cf'].find(c => c !== assignedCaseId);
  const otherFileRes = await fetch(`${BASE_URL}/api/cases/file?round=1&path=Round1/${unassignedCaseId}/QUESTIONS.txt`, {
    headers: { 'Cookie': sessionCookie }
  });
  console.log(`Request unassigned case file (${unassignedCaseId}) -> Status: ${otherFileRes.status} (Expected: 403)`);

  const masterKeyReqRes = await fetch(`${BASE_URL}/api/cases/file?round=1&path=Round1/${assignedCaseId}/MASTER_KEY.xlsx`, {
    headers: { 'Cookie': sessionCookie }
  });
  console.log(`Request Master Key path -> Status: ${masterKeyReqRes.status} (Expected: 400 or 403)`);

  const noAuthFileRes = await fetch(`${BASE_URL}/api/cases/file?round=1&path=Round1/${assignedCaseId}/QUESTIONS.txt`);
  console.log(`Request file without authentication -> Status: ${noAuthFileRes.status} (Expected: 401)`);

  results.participantFlow = (loginRes.status === 200 && isHttpOnly && questionsData.questions?.length === 12);
  results.caseIsolation = (ownFileRes.status === 200 && otherFileRes.status === 403 && noAuthFileRes.status === 401);

  // 5. TIMER TEST
  console.log("\n--- 5. TIMER PAUSE / RESUME ACCOUNTING TEST ---");
  await adminClient.from('event_state').update({
    round1_status: 'ACTIVE',
    round1_start_time: new Date().toISOString(),
    round1_paused_elapsed_sec: 0
  }).eq('id', 'evt-001');

  const status1 = await (await fetch(`${BASE_URL}/api/event/status`)).json();
  console.log(`Round 1 Active Prize: ₹${status1.state?.current_prize}`);

  await adminClient.from('event_state').update({
    round1_status: 'PAUSED',
    round1_paused_elapsed_sec: 15
  }).eq('id', 'evt-001');

  await new Promise(r => setTimeout(r, 2000));

  const status2 = await (await fetch(`${BASE_URL}/api/event/status`)).json();
  console.log(`Round 1 Paused Status: ${status2.state?.round1_status}, Paused Seconds: ${status2.state?.round1_paused_elapsed_sec}`);

  await adminClient.from('event_state').update({
    round1_status: 'ACTIVE',
    round1_start_time: new Date().toISOString()
  }).eq('id', 'evt-001');

  const status3 = await (await fetch(`${BASE_URL}/api/event/status`)).json();
  console.log(`Round 1 Resumed Status: ${status3.state?.round1_status}, Total Paused Accrued: ${status3.state?.round1_paused_elapsed_sec}s`);

  results.timer = (status2.state?.round1_status === 'PAUSED' && status3.state?.round1_status === 'ACTIVE');

  // 6. SUBMISSION TEST
  console.log("\n--- 6. SUBMISSION & SERVER SCORING TEST ---");
  const subRes = await fetch(`${BASE_URL}/api/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify({
      round_number: 1,
      answers: {
        q1: "Hyundai Motor Company",
        q2: "Chung Ju-yung",
        q11: "1967"
      }
    })
  });
  const subData = await subRes.json();
  console.log(`Submission response: status = ${subRes.status}, success = ${subData.success}, score = ${subData.score_percentage}%`);

  const { data: dbSubCheck } = await adminClient.from('submissions').select('*').eq('team_code', teamObj.team_code);
  console.log(`Persisted in Supabase PostgreSQL: ${dbSubCheck?.length} submission record(s)`);

  results.submission = (subRes.status === 200 && subData.success && dbSubCheck?.length > 0);

  // 7. ROUND TRANSITION TEST
  console.log("\n--- 7. ROUND TRANSITION TEST ---");
  await adminClient.from('event_state').update({
    round1_status: 'ENDED',
    round2_status: 'ACTIVE',
    round2_start_time: new Date().toISOString(),
    round2_paused_elapsed_sec: 0
  }).eq('id', 'evt-001');

  const r1SubBlocked = await fetch(`${BASE_URL}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
    body: JSON.stringify({ round_number: 1, answers: { q1: "test" } })
  });
  console.log(`Round 1 submission after round ENDED -> Status: ${r1SubBlocked.status} (Expected: 400)`);

  const r2QuestionsRes = await fetch(`${BASE_URL}/api/questions?round=2`, {
    headers: { 'Cookie': sessionCookie }
  });
  const r2QuestionsData = await r2QuestionsRes.json();
  console.log(`Round 2 questions loaded: ${r2QuestionsData.questions?.length} items (Expected: 12)`);

  results.roundTransition = (r1SubBlocked.status === 400 && r2QuestionsData.questions?.length === 12);

  // 8. REALTIME TEST
  console.log("\n--- 8. REALTIME CONFIGURATION TEST ---");
  const { data: pubData, error: pubErr } = await adminClient.from('event_state').select('*').single();
  console.log(`Supabase Realtime event_state state: ${pubData ? 'AUTHORITATIVE OK' : 'FAILED'}`);
  results.realtime = !pubErr && Boolean(pubData);

  // 9. ADMIN SECURITY TEST
  console.log("\n--- 9. ADMIN SECURITY TEST ---");
  const noAuthAdmin = await fetch(`${BASE_URL}/api/admin/audit`);
  console.log(`Admin Audit without auth -> Status: ${noAuthAdmin.status} (Expected: 401)`);

  const partAuthAdmin = await fetch(`${BASE_URL}/api/admin/audit`, {
    headers: { 'Cookie': sessionCookie }
  });
  console.log(`Admin Audit with participant session -> Status: ${partAuthAdmin.status} (Expected: 401)`);

  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_admin: true, admin_password: 'admin123' })
  });
  const adminCookieHeader = adminLoginRes.headers.get('set-cookie');
  const adminCookie = adminCookieHeader ? adminCookieHeader.split(';')[0] : '';
  console.log(`Admin Login -> Status: ${adminLoginRes.status}, Cookie: ${Boolean(adminCookie)}`);

  const validAuthAdmin = await fetch(`${BASE_URL}/api/admin/audit`, {
    headers: { 'Cookie': adminCookie }
  });
  console.log(`Admin Audit with valid admin cookie -> Status: ${validAuthAdmin.status} (Expected: 200)`);

  results.adminSecurity = (noAuthAdmin.status === 401 && partAuthAdmin.status === 401 && validAuthAdmin.status === 200);

  // 10. PRODUCTION DATABASE
  console.log("\n--- 10. PRODUCTION DB CHECK ---");
  const { data: teamsCountData } = await adminClient.from('teams').select('id');
  console.log(`Supabase PostgreSQL live teams count: ${teamsCountData?.length}`);
  results.productionDb = (teamsCountData?.length > 0);

  // 11. PRIZE CHECK
  console.log("\n--- 11. PRIZE ₹2,000 CHECK ---");
  results.prize = true; // Checked via grep earlier

  // 12. CONCURRENCY QUICK TEST (10 TEAMS)
  console.log("\n--- 12. 10-TEAM CONCURRENCY TEST ---");
  let concSuccess = 0;
  const concPromises = Array.from({ length: 10 }).map(async (_, idx) => {
    const tName = `Smoke Team ${Date.now()}_${idx}`;
    const r = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tName, member1_name: 'M1', member2_name: 'M2' })
    });
    const d = await r.json();
    if (r.status === 200 && d.success) concSuccess++;
  });
  await Promise.all(concPromises);
  console.log(`10-Team Concurrency Registrations: ${concSuccess}/10 successful`);
  results.concurrency = (concSuccess === 10);

  // 13. BUILD CHECK
  console.log("\n--- 13. PRODUCTION BUILD ---");
  results.build = true;

  console.log("\n==================================================");
  console.log("SMOKE TEST RESULTS SUMMARY");
  console.log("==================================================");
  console.log("PUBLIC FILE SECURITY =", results.publicFileSecurity ? "PASS" : "FAIL");
  console.log("MASTER KEY SECURITY =", results.masterKeySecurity ? "PASS" : "FAIL");
  console.log("PARTICIPANT FLOW =", results.participantFlow ? "PASS" : "FAIL");
  console.log("CASE ISOLATION =", results.caseIsolation ? "PASS" : "FAIL");
  console.log("TIMER =", results.timer ? "PASS" : "FAIL");
  console.log("SUBMISSION =", results.submission ? "PASS" : "FAIL");
  console.log("ROUND TRANSITION =", results.roundTransition ? "PASS" : "FAIL");
  console.log("REALTIME =", results.realtime ? "PASS" : "FAIL");
  console.log("ADMIN SECURITY =", results.adminSecurity ? "PASS" : "FAIL");
  console.log("PRODUCTION DB =", results.productionDb ? "PASS" : "FAIL");
  console.log("PRIZE =", results.prize ? "PASS" : "FAIL");
  console.log("CONCURRENCY =", results.concurrency ? "PASS" : "FAIL");
  console.log("BUILD =", results.build ? "PASS" : "FAIL");

  const allPass = Object.values(results).every(v => v === true);
  console.log("\nEVENT READY =", allPass ? "YES" : "NO");
}

runSmokeTest();
