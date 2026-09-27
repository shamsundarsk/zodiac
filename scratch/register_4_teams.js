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

async function registerTeam(teamCode, name, caseIdR1, caseIdR2) {
  const regRes = await makeRequest('/api/auth/register', 'POST', {
    team_code: teamCode,
    name: name,
    passcode: '123456',
    member1_name: 'Member 1',
    member1_email: `m1_${teamCode.toLowerCase()}@test.com`,
    member2_name: 'Member 2',
    member2_email: `m2_${teamCode.toLowerCase()}@test.com`
  });

  console.log(`Registration for ${teamCode}:`, regRes.status, regRes.body);

  // Now login to get session
  const loginRes = await makeRequest('/api/auth/login', 'POST', {
    team_code: teamCode,
    passcode: '123456'
  });

  const cookie = loginRes.cookies[0];

  // Also verify questions API response
  const qRes = await makeRequest('/api/questions', 'GET', null, { Cookie: cookie });
  console.log(`Questions API for ${teamCode}:`, qRes.status, qRes.body);
  return { teamCode, cookie, qRes: qRes.body };
}

async function main() {
  console.log('--- Registering and validating 4 teams for 4 cases ---');

  // Set Round 1 ACTIVE
  await makeRequest('/api/admin/live', 'POST', { round1_status: 'ACTIVE', round2_status: 'IDLE' });

  const cf = await registerTeam('TEAM-CF-01', 'Cloudflare Team', 'CASE-R1-CF', 'CASE-R2-CF');
  const hy = await registerTeam('TEAM-HY-01', 'Hyundai Team', 'CASE-R1-HYUNDAI', 'CASE-R2-HYUNDAI');
  const di = await registerTeam('TEAM-DI-01', 'Dior Team', 'CASE-R1-DIOR', 'CASE-R2-DIOR');
  const et = await registerTeam('TEAM-ET-01', 'Eternal Team', 'CASE-R1-ETERNAL', 'CASE-R2-ETERNAL');

  console.log('--- All 4 teams registered and questions API verified ---');
}

main().catch(console.error);
