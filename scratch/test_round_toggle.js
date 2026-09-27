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
        try { resolve({ status: res.statusCode, headers: res.headers, cookies, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, headers: res.headers, cookies, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  const adminLogin = await makeRequest('/api/auth/login', 'POST', { is_admin: true, admin_password: 'admin123' });
  const adminHeaders = { Authorization: `Bearer ${adminLogin.body.token}` };

  console.log('--- Step 1: Setting Round 1 ACTIVE via Admin ---');
  const startR1Res = await makeRequest('/api/event/status', 'POST', { action: 'START_ROUND_01' }, adminHeaders);
  console.log('Start R1 Event State:', startR1Res.body.state);

  // Login Cloudflare Team
  const loginRes = await makeRequest('/api/auth/login', 'POST', { team_code: 'TEAM-32193', access_code: 'CASE-39722' });
  const teamHeaders = { Authorization: `Bearer ${loginRes.body.token}` };

  // Fetch Questions for Round 1
  const qR1 = await makeRequest('/api/questions', 'GET', null, teamHeaders);
  console.log('\n--- Round 1 Questions Response for Cloudflare ---');
  console.log(`Round: ${qR1.body.round}, Canonical: ${qR1.body.canonical_case}, Count: ${qR1.body.question_count}`);
  console.log(`Q1: "${qR1.body.questions?.[0]?.question || qR1.body.questions?.[0]?.text}"`);
  console.log(`Q12: "${qR1.body.questions?.[11]?.question || qR1.body.questions?.[11]?.text}"`);

  console.log('\n--- Step 2: Setting Round 2 ACTIVE via Admin ---');
  const startR2Res = await makeRequest('/api/event/status', 'POST', { action: 'START_ROUND_02' }, adminHeaders);
  console.log('Start R2 Event State:', startR2Res.body.state);

  // Fetch Questions for Round 2
  const qR2 = await makeRequest('/api/questions', 'GET', null, teamHeaders);
  console.log('\n--- Round 2 Questions Response for Cloudflare ---');
  console.log(`Round: ${qR2.body.round}, Canonical: ${qR2.body.canonical_case}, Count: ${qR2.body.question_count}`);
  console.log(`Q1: "${qR2.body.questions?.[0]?.question || qR2.body.questions?.[0]?.text}"`);
  console.log(`Q12: "${qR2.body.questions?.[11]?.question || qR2.body.questions?.[11]?.text}"`);
}

main().catch(console.error);
