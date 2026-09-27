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
  console.log('STEP 16: BROWSER-LEVEL SIMULATION FOR ALL 4 TEAMS (4 CASES x 2 ROUNDS)');
  console.log('====================================================\n');

  // 1. Admin login
  const adminLoginRes = await makeRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { is_admin: true, admin_password: 'admin123' });

  const adminCookie = adminLoginRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

  // 2. Create 4 teams to get all 4 case assignments
  const teams = [];
  const caseNames = ['Hyundai', 'Cloudflare', 'Dior', 'Eternal'];

  for (let i = 0; i < 15; i++) {
    const regRes = await makeRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: `Isolation Test Team ${Date.now()}_${i}`,
      member1_name: `Member1_${i}`,
      member2_name: `Member2_${i}`
    });

    if (regRes.body?.team) {
      const t = regRes.body.team;
      teams.push(t);
    }
  }

  console.log(`Registered ${teams.length} test teams to sample all 4 cases.`);

  // Group teams by assigned case
  const teamByCase = {};
  teams.forEach(t => {
    const cId = t.assigned_case_id_r1 || 'case-r1-hyundai';
    let key = 'hyundai';
    if (cId.includes('cf') || cId.includes('cloudflare')) key = 'cloudflare';
    if (cId.includes('dior')) key = 'dior';
    if (cId.includes('eternal')) key = 'eternal';

    if (!teamByCase[key]) teamByCase[key] = t;
  });

  console.log('Found representative teams for cases:', Object.keys(teamByCase));

  // 3. Test Round 1 for each team
  // Set Round 1 ACTIVE
  await makeRequest('http://localhost:3000/api/event/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { action: 'START_ROUND_01' });

  console.log('\n--- TESTING ROUND 1 FOR ALL 4 ASSIGNED CASES ---');

  for (const [caseKey, teamObj] of Object.entries(teamByCase)) {
    const loginRes = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { team_code: teamObj.team_code, access_code: teamObj.access_code });

    const cookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

    const qRes = await makeRequest('http://localhost:3000/api/questions?round=1', {
      method: 'GET',
      headers: { 'Cookie': cookie }
    });

    console.log(`Team: ${teamObj.team_code} | Assigned Case: ${teamObj.assigned_case_id_r1} | Canonical: ${qRes.body.canonical_case}`);
    console.log(`  Question Count: ${qRes.body.question_count}`);
    console.log(`  First Question: "${qRes.body.questions?.[0]?.question}"`);

    if (qRes.body.question_count === 12 && qRes.body.canonical_case === caseKey) {
      console.log(`  [PASS] Correctly bound to ${caseKey} R1 questions.`);
    } else {
      console.error(`  [FAIL] Question binding error for ${caseKey}!`);
    }
    console.log('---');
  }

  // 4. Test Round 2 for each team
  // Set Round 2 ACTIVE
  await makeRequest('http://localhost:3000/api/event/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { action: 'START_ROUND_02' });

  console.log('\n--- TESTING ROUND 2 FOR ALL 4 ASSIGNED CASES ---');

  for (const [caseKey, teamObj] of Object.entries(teamByCase)) {
    const loginRes = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { team_code: teamObj.team_code, access_code: teamObj.access_code });

    const cookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

    const qRes = await makeRequest('http://localhost:3000/api/questions?round=2', {
      method: 'GET',
      headers: { 'Cookie': cookie }
    });

    console.log(`Team: ${teamObj.team_code} | Assigned Case: ${teamObj.assigned_case_id_r2} | Canonical: ${qRes.body.canonical_case}`);
    console.log(`  Question Count: ${qRes.body.question_count}`);
    console.log(`  First Question: "${qRes.body.questions?.[0]?.question}"`);

    if (qRes.body.question_count === 12 && qRes.body.canonical_case === caseKey) {
      console.log(`  [PASS] Correctly bound to ${caseKey} R2 questions.`);
    } else {
      console.error(`  [FAIL] Question binding error for ${caseKey}!`);
    }
    console.log('---');
  }

  console.log('\nBROWSER-LEVEL SIMULATION FOR ALL 4 TEAMS COMPLETE!');
}

run().catch(console.error);
