const http = require('http');

async function makeRequest(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOpts = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 3000,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOpts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (bodyData) {
      req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('VERIFYING END-TO-END ROUND 2 SUBMISSION, GRADING & ADMIN OVERRIDE');
  console.log('====================================================\n');

  // 1. Admin login to get session token
  const adminLoginRes = await makeRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { is_admin: true, admin_password: 'admin123' });

  console.log(`1. Admin Auth Status: ${adminLoginRes.status}`);
  const adminCookie = adminLoginRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

  // 2. Ensure Round 2 is ACTIVE
  const startR2Res = await makeRequest('http://localhost:3000/api/event/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { action: 'START_ROUND_02' });
  console.log(`2. Start Round 2 Action Status: ${startR2Res.status} (Round 2 State: ${startR2Res.body?.state?.round2_status})`);

  // 3. Register a test team for Round 2 flow
  const regRes = await makeRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'WarRoom Champions ' + Date.now().toString().slice(-4),
    member1_name: 'Cipher Alpha',
    member2_name: 'Cipher Beta'
  });

  const team = regRes.body.team;
  console.log(`3. Created Team: ${team.team_code} (Assigned R2: ${team.assigned_case_id_r2})`);

  // Participant Login
  const pLoginRes = await makeRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { team_code: team.team_code, access_code: team.access_code });
  const pCookie = pLoginRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

  // 4. Submit Round 2 Answers
  const r2AnswersPayload = {
    q1: "5.47%",
    q2: "0.79",
    q3: "Digital",
    q4: "Mahindra",
    q5: "Mass EV",
    q6: "TLE-02",
    q7: "46.25%",
    q8: "EV-35",
    q9: "Talegaon",
    q10: "16.46%",
    q11: "EV",
    q12: ["Margin deterioration", "Concentrated CAPEX", "Underutilized capacity"]
  };

  const subRes = await makeRequest('http://localhost:3000/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': pCookie }
  }, { round_number: 2, answers: r2AnswersPayload });

  console.log(`4. Participant Submission Status: ${subRes.status}`);
  console.log(`   Result: Score ${subRes.body.score_percentage}%, Locked Prize ₹${subRes.body.locked_prize}`);
  console.log(`   Breakdown item count: ${subRes.body.breakdown?.length}`);

  // 5. Admin fetches team submissions and verifies breakdown
  const adminGetSubsRes = await makeRequest(`http://localhost:3000/api/submissions?team_code=${team.team_code}`, {
    method: 'GET',
    headers: { 'Cookie': adminCookie }
  });
  const submissionRecord = adminGetSubsRes.body.submissions?.[0];
  console.log(`5. Admin Fetched Submission ID: ${submissionRecord?.id}, Original Score: ${submissionRecord?.score}%`);

  // 6. Admin Manual Score Override
  const overrideRes = await makeRequest('http://localhost:3000/api/admin/override-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, {
    submission_id: submissionRecord.id,
    override_score: 95,
    override_reason: "Manual bonus point awarded for excellent evidence notes."
  });

  console.log(`6. Admin Score Override Result: ${overrideRes.body.message}`);

  // 7. Verify Leaderboard
  const lbRes = await makeRequest('http://localhost:3000/api/admin/leaderboard', {
    method: 'GET',
    headers: { 'Cookie': adminCookie }
  });

  const leaderItem = lbRes.body.leaderboard?.find(item => item.team_code === team.team_code);
  console.log(`7. Leaderboard Entry for ${team.team_code}: Rank #${leaderItem?.rank}, Final Prize ₹${leaderItem?.final_prize}`);

  // 8. Admin Answer Key API Test
  const akRes = await makeRequest('http://localhost:3000/api/admin/answer-key', {
    method: 'GET',
    headers: { 'Cookie': adminCookie }
  });
  console.log(`8. Admin Answer Key API Status: ${akRes.status}, Keys Loaded: ${Object.keys(akRes.body.answer_keys || {}).length} cases`);

  // 9. Unauthorized Participant Access to Answer Key Test
  const unauthAkRes = await makeRequest('http://localhost:3000/api/admin/answer-key', {
    method: 'GET',
    headers: { 'Cookie': pCookie }
  });
  console.log(`9. Participant Security Check (Accessing Answer Key): Status ${unauthAkRes.status} (Expected 401 Unauthorized)`);

  if (
    subRes.body.success &&
    overrideRes.body.success &&
    unauthAkRes.status === 401 &&
    leaderItem?.final_prize !== undefined
  ) {
    console.log('\n====================================================');
    console.log('COMPLETE END-TO-END ROUND 2 VERIFICATION PASSED!');
    console.log('====================================================');
  } else {
    console.error('VERIFICATION FAILED!');
    process.exit(1);
  }
}

run().catch(console.error);
