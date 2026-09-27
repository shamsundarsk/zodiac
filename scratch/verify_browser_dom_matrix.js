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

async function getAdminHeaders() {
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

async function loginTeam(teamCode, accessCode) {
  const loginRes = await makeRequest('/api/auth/login', 'POST', {
    team_code: teamCode,
    access_code: accessCode
  });
  const token = loginRes.body?.token;
  const cookie = loginRes.cookies?.[0] ? loginRes.cookies[0].split(';')[0] : '';
  return { token, cookie, team: loginRes.body?.team };
}

async function main() {
  const adminHeaders = await getAdminHeaders();
  console.log('=== STARTING COMPLETE 8-COMBINATION DOM & QUESTION ENGINE MATRIX TEST ===\n');

  // Test Teams:
  const teams = [
    { name: 'Cloudflare', code: 'TEAM-32193', access: 'CASE-39722', expectedR1: 'San Francisco', hyundaiTerms: ['powertrain', 'Indian manufacturing', 'Santro', 'early vehicle program', 'Chung Ju-yung'] },
    { name: 'Hyundai', code: 'TEAM-59141', access: 'CASE-82428', expectedR1: 'first car launched in India', hyundaiTerms: [] },
    { name: 'Dior', code: 'TEAM-87419', access: 'CASE-98208', expectedR1: 'mystery fashion house', hyundaiTerms: ['powertrain', 'Indian manufacturing', 'Santro', 'early vehicle program', 'Chung Ju-yung'] },
    { name: 'Eternal', code: 'TEAM-69006', access: 'CASE-28159', expectedR1: 'Zomato', hyundaiTerms: ['powertrain', 'Indian manufacturing', 'Santro', 'early vehicle program', 'Chung Ju-yung'] }
  ];

  // --- ROUND 1 TEST ---
  console.log('--- TESTING ROUND 1 (4 TEAMS) ---');
  await makeRequest('/api/event/status', 'POST', { action: 'START_ROUND_01' }, adminHeaders);

  const r1Results = {};

  for (const t of teams) {
    const login = await loginTeam(t.code, t.access);
    const qRes = await makeRequest('/api/questions?round=1', 'GET', null, { Authorization: `Bearer ${login.token}`, Cookie: login.cookie });

    const qList = qRes.body?.questions || [];
    const fullText = JSON.stringify(qList).toLowerCase();

    let hyundaiLeaked = false;
    for (const term of t.hyundaiTerms) {
      if (fullText.includes(term.toLowerCase())) {
        hyundaiLeaked = true;
        console.error(`❌ HYUNDAI LEAK IN ${t.name}: found term "${term}"`);
      }
    }

    const pass = qRes.status === 200 && qList.length === 12 && !hyundaiLeaked;
    r1Results[t.name] = pass ? 'PASS' : 'FAIL';

    console.log(`[R1 ${t.name.toUpperCase()}] Assigned Case: ${login.team?.assigned_case_id_r1} | Canonical: ${qRes.body?.canonical_case} | Questions: ${qList.length} | Status: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  Q1: "${qList[0]?.question || qList[0]?.text}"`);
    console.log(`  Q12: "${qList[11]?.question || qList[11]?.text}"`);
  }

  // --- ROUND 2 TEST ---
  console.log('\n--- TESTING ROUND 2 (4 TEAMS) ---');
  await makeRequest('/api/event/status', 'POST', { action: 'START_ROUND_02' }, adminHeaders);

  const r2Results = {};

  for (const t of teams) {
    const login = await loginTeam(t.code, t.access);
    const qRes = await makeRequest('/api/questions?round=2', 'GET', null, { Authorization: `Bearer ${login.token}`, Cookie: login.cookie });

    const qList = qRes.body?.questions || [];
    const fullText = JSON.stringify(qList).toLowerCase();

    let hyundaiLeaked = false;
    for (const term of t.hyundaiTerms) {
      if (fullText.includes(term.toLowerCase())) {
        hyundaiLeaked = true;
        console.error(`❌ HYUNDAI LEAK IN R2 ${t.name}: found term "${term}"`);
      }
    }

    const pass = qRes.status === 200 && qList.length === 12 && !hyundaiLeaked;
    r2Results[t.name] = pass ? 'PASS' : 'FAIL';

    console.log(`[R2 ${t.name.toUpperCase()}] Assigned Case: ${login.team?.assigned_case_id_r2} | Canonical: ${qRes.body?.canonical_case} | Questions: ${qList.length} | Status: ${pass ? 'PASS' : 'FAIL'}`);
    console.log(`  Q1: "${qList[0]?.question || qList[0]?.text}"`);
    console.log(`  Q12: "${qList[11]?.question || qList[11]?.text}"`);
  }

  // Reset back to Round 1 ACTIVE
  await makeRequest('/api/event/status', 'POST', { action: 'START_ROUND_01' }, adminHeaders);

  console.log('\n========================================================');
  console.log('FINAL MATRIX VERIFICATION RESULTS:');
  console.log('========================================================');
  console.log('ROUND 1:');
  console.log(`  Hyundai: ${r1Results.Hyundai}`);
  console.log(`  Cloudflare: ${r1Results.Cloudflare}`);
  console.log(`  Dior: ${r1Results.Dior}`);
  console.log(`  Eternal: ${r1Results.Eternal}`);
  console.log('ROUND 2:');
  console.log(`  Hyundai: ${r2Results.Hyundai}`);
  console.log(`  Cloudflare: ${r2Results.Cloudflare}`);
  console.log(`  Dior: ${r2Results.Dior}`);
  console.log(`  Eternal: ${r2Results.Eternal}`);
  console.log('========================================================');
}

main().catch(console.error);
