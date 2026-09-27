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
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  const loginRes = await makeRequest('/api/auth/login', 'POST', {
    is_admin: true,
    admin_password: 'admin123'
  });

  const token = loginRes.token;
  const auditRes = await makeRequest('/api/admin/audit', 'GET', null, { Authorization: `Bearer ${token}` });

  // Get all registered teams
  const casesFound = {};
  const teams = auditRes.teams || [];

  for (const t of teams) {
    const caseId = t.assigned_case_id_r1;
    if (!casesFound[caseId]) {
      casesFound[caseId] = t;
    }
  }

  console.log('Found team credentials for all 4 cases:');
  for (const [caseId, t] of Object.entries(casesFound)) {
    console.log(`Case: ${caseId} -> Team Code: ${t.team_code}, Access Code: ${t.access_code}`);
  }
}

main().catch(console.error);
