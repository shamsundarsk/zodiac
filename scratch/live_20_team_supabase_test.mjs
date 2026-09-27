import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function runLiveTest() {
  console.log("==================================================");
  console.log("17. LIVE 20-TEAM CONCURRENCY TEST ON SUPABASE POSTGRES");
  console.log("==================================================");

  // Reset DB event state to clear prior test data
  console.log("Resetting event state in Supabase DB...");
  await adminClient.from('submissions').delete().neq('id', 'keep-none');
  await adminClient.from('teams').delete().neq('id', 'keep-none');
  await adminClient.from('event_state').update({
    round1_status: 'ACTIVE',
    round1_start_time: new Date().toISOString(),
    round1_paused_elapsed_sec: 0,
    starting_prize: 2000,
    current_prize: 2000
  }).eq('id', 'evt-001');

  const stats = {
    registrations: { total: 20, successful: 0, failed: 0 },
    logins: { total: 20, successful: 0, failed: 0 },
    assignments: { total: 20, successful: 0, failed: 0 },
    submissions: { total: 20, successful: 0, failed: 0 },
    scoreMismatches: 0,
    raceConditions: 0,
    dbErrors: 0
  };

  const registeredTeams = [];

  // 1. Register 20 Teams
  console.log("\n1. Registering 20 Teams...");
  for (let i = 1; i <= 20; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Echo Squad ${Date.now()}_${i}`,
          member1_name: `Agent A${i}`,
          member2_name: `Agent B${i}`
        })
      });

      const data = await res.json();
      if (res.status === 200 && data.success && data.team) {
        stats.registrations.successful++;
        registeredTeams.push(data.team);
      } else {
        stats.registrations.failed++;
        console.error(`Register team ${i} failed:`, data.message);
      }
    } catch (err) {
      stats.registrations.failed++;
      console.error(`Register team ${i} exception:`, err.message);
    }
  }

  console.log(`Registrations result: ${stats.registrations.successful}/20 successful`);

  // 2. Login 20 Teams & Check Cookies + Assignments
  console.log("\n2. Logging in 20 Teams and verifying sessions...");
  const teamSessions = [];

  for (const team of registeredTeams) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_code: team.team_code,
          access_code: team.access_code
        })
      });

      const data = await res.json();
      const cookieHeader = res.headers.get('set-cookie');

      if (res.status === 200 && data.success && cookieHeader) {
        stats.logins.successful++;
        if (data.team.assigned_case_id_r1) {
          stats.assignments.successful++;
        } else {
          stats.assignments.failed++;
        }

        const cookieValue = cookieHeader.split(';')[0];
        teamSessions.push({
          team: data.team,
          cookie: cookieValue
        });
      } else {
        stats.logins.failed++;
        stats.assignments.failed++;
      }
    } catch (err) {
      stats.logins.failed++;
      stats.assignments.failed++;
    }
  }

  console.log(`Logins result: ${stats.logins.successful}/20 successful`);
  console.log(`Assignments result: ${stats.assignments.successful}/20 assigned`);

  // 3. 20 Simultaneous Submissions
  console.log("\n3. Executing 20 Simultaneous Team Submissions...");
  const submissionPromises = teamSessions.map(sess => {
    return fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sess.cookie
      },
      body: JSON.stringify({
        round_number: 1,
        answers: {
          q1: "Hyundai Motor Company",
          q2: "Chung Ju-yung",
          q3: "EMP-001",
          q11: "1967"
        }
      })
    }).then(async res => {
      const data = await res.json();
      return { status: res.status, data, team_code: sess.team.team_code };
    }).catch(err => ({ status: 500, error: err.message, team_code: sess.team.team_code }));
  });

  const subResults = await Promise.all(submissionPromises);

  subResults.forEach(r => {
    if (r.status === 200 && r.data?.success) {
      stats.submissions.successful++;
    } else {
      stats.submissions.failed++;
      console.error(`Submission failed for ${r.team_code}:`, r.data?.message || r.error);
    }
  });

  console.log(`Submissions result: ${stats.submissions.successful}/20 successful`);

  // 4. Verify Supabase DB Persistence
  console.log("\n4. Verifying Supabase Database Persistence directly via SQL client...");
  const { data: dbTeams, error: dbTeamsErr } = await adminClient.from('teams').select('*');
  const { data: dbSubs, error: dbSubsErr } = await adminClient.from('submissions').select('*');

  console.log(`Supabase DB Teams Count: ${dbTeams?.length} (Expected: 20)`);
  console.log(`Supabase DB Submissions Count: ${dbSubs?.length} (Expected: 20)`);

  if (dbTeamsErr || dbSubsErr) {
    stats.dbErrors++;
    console.error("DB Error:", dbTeamsErr?.message || dbSubsErr?.message);
  }

  // 5. Security Vector Checks
  console.log("\n==================================================");
  console.log("15 & 8. SECURITY ACCESS CHECKS");
  console.log("==================================================");

  // Attack 1: Request case file without authentication
  const anonFileRes = await fetch(`${BASE_URL}/api/cases/file?round=1&path=Round1/case-r1-hyundai/QUESTIONS.txt`);
  console.log(`Security Test 1: Unauthenticated file request -> Status: ${anonFileRes.status} (Expected: 401)`);

  // Attack 2: Team A requesting a case file NOT assigned to them
  if (teamSessions.length >= 1) {
    const teamA = teamSessions[0];
    const allCases = ['case-r1-hyundai', 'case-r1-eternal', 'case-r1-dior', 'case-r1-cf'];
    const otherCaseId = allCases.find(c => c !== teamA.team.assigned_case_id_r1) || 'case-r1-dior';

    const forgeryRes = await fetch(`${BASE_URL}/api/cases/file?round=1&path=Round1/${otherCaseId}/QUESTIONS.txt`, {
      headers: { 'Cookie': teamA.cookie }
    });
    console.log(`Security Test 2: Team A requesting unassigned case (${otherCaseId}) -> Status: ${forgeryRes.status} (Expected: 403)`);
  }

  // Attack 3: Request Master Key file via API
  if (teamSessions.length >= 1) {
    const masterKeyRes = await fetch(`${BASE_URL}/api/cases/file?round=1&path=Round1/case-r1-hyundai/Hyundai_Deep_Investigation_MASTER_KEY.xlsx`, {
      headers: { 'Cookie': teamSessions[0].cookie }
    });
    console.log(`Security Test 3: Request Master Key file via API -> Status: ${masterKeyRes.status} (Expected: 400 or 403)`);
  }

  // Attack 4: Call Admin-only Master Key API without admin session
  const unauthMasterKeyRes = await fetch(`${BASE_URL}/api/admin/master-key?case_id=case-r1-hyundai&round=1`);
  console.log(`Security Test 4: Unauthenticated call to Admin Master Key API -> Status: ${unauthMasterKeyRes.status} (Expected: 401)`);

  console.log("\n==================================================");
  console.log("FINAL CONCURRENCY TEST SUMMARY");
  console.log("==================================================");
  console.log(`Registrations: ${stats.registrations.successful}/20`);
  console.log(`Logins: ${stats.logins.successful}/20`);
  console.log(`Assignments: ${stats.assignments.successful}/20`);
  console.log(`Submissions: ${stats.submissions.successful}/20`);
  console.log(`Database Errors: ${stats.dbErrors}`);
}

runLiveTest();
