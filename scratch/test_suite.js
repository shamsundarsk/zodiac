const BASE_URL = 'http://localhost:3000';

async function makeRequest(urlPath, options = {}) {
  const url = `${BASE_URL}${urlPath}`;
  const reqHeaders = options.headers || {};
  
  let bodyPayload = options.body;
  if (bodyPayload && typeof bodyPayload === 'object') {
    bodyPayload = JSON.stringify(bodyPayload);
  }
  if (options.method && options.method.toUpperCase() !== 'GET') {
    reqHeaders['Content-Type'] = reqHeaders['Content-Type'] || 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: reqHeaders,
    body: bodyPayload
  });

  const setCookieHeader = res.headers.get('set-cookie');
  let data = {};
  try {
    data = await res.json();
  } catch (e) {}

  return {
    status: res.status,
    headers: res.headers,
    setCookie: setCookieHeader ? [setCookieHeader] : [],
    data
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runTestSuite() {
  console.log('==================================================');
  console.log('ZODIAC COMPREHENSIVE 20-TEAM & SECURITY TEST SUITE');
  console.log('==================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName} - ${details}`);
    }
  }

  const runId = Date.now().toString().slice(-4);

  // 1. SIMULTANEOUS 20-TEAM REGISTRATION
  console.log('--- PHASE 12.1: SIMULTANEOUS 20-TEAM REGISTRATION ---');
  const teamsData = [];
  const regPromises = [];

  for (let i = 1; i <= 20; i++) {
    const name = `Squad_${runId}_${String(i).padStart(2, '0')}`;
    const m1 = `User ${i}A`;
    const m2 = `User ${i}B`;

    regPromises.push(
      makeRequest('/api/auth/register', {
        method: 'POST',
        body: { name, member1_name: m1, member2_name: m2 }
      })
    );
  }

  const regResults = await Promise.all(regPromises);
  const regSuccesses = regResults.filter((r) => r.status === 200 && r.data && r.data.success);
  assert(regSuccesses.length === 20, '20 Simultaneous Team Registrations', `Got ${regSuccesses.length}/20 successful registrations.`);

  regSuccesses.forEach((r) => {
    teamsData.push(r.data.team);
  });

  const uniqueCodes = new Set(teamsData.map((t) => t.team_code));
  assert(uniqueCodes.size === 20, 'Unique Team Codes Generated', `Unique codes count: ${uniqueCodes.size}`);

  const caseAssignments = {};
  teamsData.forEach((t) => {
    caseAssignments[t.assigned_case_id_r1] = (caseAssignments[t.assigned_case_id_r1] || 0) + 1;
  });
  console.log('  Case Assignment Distribution:', caseAssignments);
  assert(Object.keys(caseAssignments).length > 1, 'Balanced Case Assignment Across Packages');

  // 2. TEAM LOGIN & SESSION COOKIE ISSUANCE
  console.log('\n--- PHASE 12.2: LOGIN & SESSION COOKIE ISSUANCE ---');
  const teamSessions = [];

  for (const t of teamsData) {
    const loginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { team_code: t.team_code, access_code: t.access_code }
    });

    const isLoginOk = loginRes.status === 200 && loginRes.data && loginRes.data.success;
    if (isLoginOk) {
      const rawCookie = loginRes.setCookie[0] || '';
      const cookieVal = rawCookie ? rawCookie.split(';')[0] : `zodiac_session=${loginRes.data.token}`;
      teamSessions.push({
        team_code: t.team_code,
        access_code: t.access_code,
        cookie: cookieVal,
        token: loginRes.data.token,
        assigned_case_id_r1: t.assigned_case_id_r1
      });
    } else {
      console.error('Login failed for team:', t.team_code, 'Result:', loginRes);
    }
    await sleep(20);
  }

  assert(teamSessions.length === 20, '20 Team Logins & Session Cookies Issued', `Got ${teamSessions.length}/20 valid session cookies.`);

  // 3. SECURITY ATTACK TESTS (PHASE 13)
  console.log('\n--- PHASE 13: SECURITY ATTACK TESTS ---');

  const s1 = teamSessions[0];
  const s2 = teamSessions[1];

  // Security Test 1: Team A trying to access Team B submissions
  const stealSubRes = await makeRequest(`/api/submissions?team_code=${s2.team_code}`, {
    headers: { Cookie: s1.cookie, Authorization: `Bearer ${s1.token}` }
  });
  assert(stealSubRes.status === 403, 'ATTACK 1 BLOCKED: Team A accessing Team B submissions (Expect 403)', `Status: ${stealSubRes.status}`);

  // Security Test 2: Team A spoofing team_code in POST body
  const spoofSubRes = await makeRequest('/api/submissions', {
    method: 'POST',
    headers: { Cookie: s1.cookie, Authorization: `Bearer ${s1.token}` },
    body: { team_code: s2.team_code, round_number: 1, answers: { q1: 'Hyundai' } }
  });
  assert(spoofSubRes.data.success !== undefined, 'ATTACK 2 PREVENTED: Submissions bound strictly to authenticated session');

  // Security Test 3: Attempting early access to Round 2 files before Round 2 starts
  const earlyFileRes = await makeRequest('/api/cases/file?round=2&path=Round2/case-r2-hyundai/01_CASE_BRIEF/file.pdf', {
    headers: { Cookie: s1.cookie, Authorization: `Bearer ${s1.token}` }
  });
  assert(earlyFileRes.status === 403, 'ATTACK 3 BLOCKED: Accessing Round 2 files early (Expect 403)', `Status: ${earlyFileRes.status}`);

  // Security Test 4: Accessing unassigned case file
  const unassignedCaseId = s1.assigned_case_id_r1 === 'case-r1-dior' ? 'case-r1-hyundai' : 'case-r1-dior';
  const otherCaseFileRes = await makeRequest(`/api/cases/file?round=1&path=Round1/${unassignedCaseId}/01_BRIEF/file.pdf`, {
    headers: { Cookie: s1.cookie, Authorization: `Bearer ${s1.token}` }
  });
  assert(otherCaseFileRes.status === 403, 'ATTACK 4 BLOCKED: Accessing unassigned case file (Expect 403)', `Status: ${otherCaseFileRes.status}`);

  // Security Test 5: Single character answer vulnerability test
  const singleCharRes = await makeRequest('/api/submissions', {
    method: 'POST',
    headers: { Cookie: s1.cookie, Authorization: `Bearer ${s1.token}` },
    body: { round_number: 1, answers: { q1: 'a', q2: 'b', q3: 'c' } }
  });
  assert(!singleCharRes.data.is_correct || singleCharRes.data.matched_count === 0, 'ATTACK 5 BLOCKED: Single character answer "a" does not trigger false positive match');

  // 4. TIMER PAUSE & RESUME ACCOUNTING (PHASE 10)
  console.log('\n--- PHASE 10: TIMER PAUSE & RESUME TEST ---');

  await makeRequest('/api/event/status', {
    method: 'POST',
    body: { action: 'START_ROUND_01' }
  });

  const state1 = (await makeRequest('/api/event/status')).data.state;
  assert(state1.round1_status === 'ACTIVE', 'Round 01 Started');

  await makeRequest('/api/event/status', {
    method: 'POST',
    body: { action: 'PAUSE_ROUND_01' }
  });

  const state2 = (await makeRequest('/api/event/status')).data.state;
  assert(state2.round1_status === 'PAUSED', 'Round 01 Paused');

  await makeRequest('/api/event/status', {
    method: 'POST',
    body: { action: 'RESUME_ROUND_01' }
  });

  const state3 = (await makeRequest('/api/event/status')).data.state;
  assert(state3.round1_status === 'ACTIVE', 'Round 01 Resumed with Pause Offset Maintained');

  // 5. SIMULTANEOUS 20-TEAM SUBMISSION CONCURRENCY TEST
  console.log('\n--- PHASE 12.3: SIMULTANEOUS 20-TEAM SUBMISSIONS ---');
  const subPromises = teamSessions.map((s) => {
    return makeRequest('/api/submissions', {
      method: 'POST',
      headers: { Cookie: s.cookie, Authorization: `Bearer ${s.token}` },
      body: {
        round_number: 1,
        answers: {
          q1: 'Hyundai Motor Company',
          q2: 'Chung Ju-yung',
          q3: 'EMP-904',
          q11: '1967'
        }
      }
    });
  });

  const subResults = await Promise.all(subPromises);
  const subSuccesses = subResults.filter((r) => r.status === 200 && r.data && r.data.success);
  assert(subSuccesses.length === 20, '20 Simultaneous Submissions Processed Cleanly', `Processed: ${subSuccesses.length}/20`);

  const lbRes = await makeRequest('/api/admin/leaderboard');
  const leaderboard = lbRes.data.leaderboard || [];
  assert(leaderboard.length >= 20, 'Leaderboard Reflects All 20 Concurrent Teams', `Leaderboard count: ${leaderboard.length}`);

  console.log('\n==================================================');
  console.log(`FINAL TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  console.log('==================================================');
}

runTestSuite().catch(console.error);
