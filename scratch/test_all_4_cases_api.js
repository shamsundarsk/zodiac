const http = require('http');

async function makeRequest(urlPath, method, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, cookies, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, cookies, body: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function registerOneTeam(nameIndex) {
  const regRes = await makeRequest('/api/auth/register', 'POST', {
    name: `Test Team ${nameIndex}_${Date.now()}`,
    member1_name: `Member A${nameIndex}`,
    member2_name: `Member B${nameIndex}`
  });

  if (!regRes.body || !regRes.body.team) {
    console.error('Registration failed:', regRes.body);
    return null;
  }

  const team = regRes.body.team;
  
  // Login
  const loginRes = await makeRequest('/api/auth/login', 'POST', {
    team_code: team.team_code,
    access_code: team.access_code
  });


  const cookieHeader = loginRes.cookies?.[0] ? loginRes.cookies[0].split(';')[0] : '';
  const token = loginRes.body?.token;
  const authHeader = token ? `Bearer ${token}` : '';

  return { team, cookie: cookieHeader, token, authHeader };
}

async function getAdminHeader() {
  const loginRes = await makeRequest('/api/auth/login', 'POST', {
    is_admin: true,
    admin_password: 'admin123'
  });
  const token = loginRes.body?.token;
  return {
    Authorization: `Bearer ${token}`,
    Cookie: loginRes.cookies?.[0] ? loginRes.cookies[0].split(';')[0] : ''
  };
}

async function main() {
  console.log('=== REGISTERING TEAMS FOR ALL 4 CASES ===');
  
  const adminHeaders = await getAdminHeader();

  // Reset event state and start Round 1
  await makeRequest('/api/event/status', 'POST', { action: 'START_ROUND_01' }, adminHeaders);

  const teamsByCase = {};
  let count = 0;

  while (Object.keys(teamsByCase).length < 4 && count < 20) {
    count++;
    const result = await registerOneTeam(count);
    if (!result) continue;

    const r1Case = result.team.assigned_case_id_r1;
    if (!teamsByCase[r1Case]) {
      teamsByCase[r1Case] = result;
      console.log(`[FOUND CASE ${r1Case}] Team: ${result.team.team_code} | Access Code: ${result.team.access_code}`);
    }

  }

  console.log('\n=== TESTING ROUND 1 QUESTIONS FOR ALL 4 TEAMS ===');
  for (const [caseId, data] of Object.entries(teamsByCase)) {
    const qRes = await makeRequest('/api/questions?round=1', 'GET', null, { Authorization: data.authHeader, Cookie: data.cookie });
    console.log(`\nCase: ${caseId} (Team: ${data.team.team_code}) Status: ${qRes.status}`);
    console.log(`Canonical: ${qRes.body.canonical_case}, Count: ${qRes.body.question_count}`);
    console.log(`First Q: ${qRes.body.questions?.[0]?.question || qRes.body.questions?.[0]?.text}`);
    console.log(`Last Q: ${qRes.body.questions?.[11]?.question || qRes.body.questions?.[11]?.text}`);
  }

  console.log('\n=== SWITCHING EVENT TO ROUND 2 ACTIVE ===');
  await makeRequest('/api/event/status', 'POST', { action: 'START_ROUND_02' }, adminHeaders);

  console.log('\n=== TESTING ROUND 2 QUESTIONS FOR ALL 4 TEAMS ===');
  for (const [caseId, data] of Object.entries(teamsByCase)) {
    const qRes = await makeRequest('/api/questions?round=2', 'GET', null, { Authorization: data.authHeader, Cookie: data.cookie });
    console.log(`\nCase: ${caseId} (Team: ${data.team.team_code}) Status: ${qRes.status}`);
    console.log(`Canonical: ${qRes.body.canonical_case}, Count: ${qRes.body.question_count}`);
    console.log(`First Q: ${qRes.body.questions?.[0]?.question || qRes.body.questions?.[0]?.text}`);
    console.log(`Last Q: ${qRes.body.questions?.[11]?.question || qRes.body.questions?.[11]?.text}`);
  }

  // Reset back to Round 1 ACTIVE
  await makeRequest('/api/event/status', 'POST', { action: 'START_ROUND_01' }, adminHeaders);
}



main().catch(console.error);
